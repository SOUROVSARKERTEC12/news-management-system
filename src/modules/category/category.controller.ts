import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Inject,
  HttpStatus,
  UseInterceptors,
} from '@nestjs/common';

import { CategoryService } from './category.service';
import { CategoryCreateDto, CategoryUpdateDto } from './dto/category.dto';
import { apiResponse } from '../../common/apiResponse/api.response';

import {
  CACHE_MANAGER,
  CacheInterceptor,
  CacheKey,
} from '@nestjs/cache-manager';

import type { Cache } from 'cache-manager';

@Controller('category')
@UseInterceptors(CacheInterceptor)
export class CategoryController {
  constructor(
    private readonly categoryService: CategoryService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  // ------------------------------
  // DRY helper methods
  // ------------------------------

  private listCacheKey = 'all_categories';

  private itemKey(id: string) {
    return `category:${id}`;
  }

  private async invalidate(keys: string[]) {
    for (const key of keys) {
      await this.cacheManager.del(key);
    }
  }

  // ------------------------------
  // Routes
  // ------------------------------

  @Post()
  async create(@Body() dto: CategoryCreateDto) {
    const category = await this.categoryService.create(dto);

    // Invalidate list cache
    await this.invalidate([this.listCacheKey]);

    return apiResponse({
      statusCode: HttpStatus.CREATED,
      payload: { category },
    });
  }

  @CacheKey('all_categories')
  @Get()
  async findAll() {
    const categories = await this.categoryService.findAll();

    return apiResponse({
      statusCode: HttpStatus.OK,
      payload: { categories },
    });
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const key = this.itemKey(id);

    // 1. Try Redis cache
    const cached = await this.cacheManager.get(key);
    if (cached) {
      return apiResponse({
        statusCode: HttpStatus.OK,
        payload: { category: cached, fromCache: true },
      });
    }

    // 2. Fetch from DB
    const category = await this.categoryService.findOne(id);

    // 3. Store in cache (TTL 5 min)
    await this.cacheManager.set(key, category, 300);

    return apiResponse({
      statusCode: HttpStatus.OK,
      payload: { category, fromCache: false },
    });
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: CategoryUpdateDto) {
    const updated = await this.categoryService.update(id, dto);

    // Invalidate both list + item
    await this.invalidate([this.listCacheKey, this.itemKey(id)]);

    return apiResponse({
      statusCode: HttpStatus.OK,
      payload: { updated },
    });
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.categoryService.remove(id);

    // Invalidate both list + item
    await this.invalidate([this.listCacheKey, this.itemKey(id)]);

    return apiResponse({
      statusCode: HttpStatus.OK,
      payload: { message: 'Category deleted successfully' },
    });
  }
}
