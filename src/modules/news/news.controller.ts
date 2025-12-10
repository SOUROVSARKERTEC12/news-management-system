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
  Query,
} from '@nestjs/common';

import { NewsService } from './news.service';
import { NewsCreateDto, NewsUpdateDto } from './dto/news.dto';
import { apiResponse } from '../../common/apiResponse/api.response';

import {
  CACHE_MANAGER,
  CacheInterceptor,
  CacheKey,
} from '@nestjs/cache-manager';

import type { Cache } from 'cache-manager';

@Controller('news')
export class NewsController {
  constructor(
    private readonly newsService: NewsService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  // ------------------------------
  // DRY helper methods
  // ------------------------------

  private listCacheKey = 'all_news';

  private itemKey(id: string) {
    return `news:${id}`;
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
  async create(@Body() dto: NewsCreateDto) {
    const news = await this.newsService.create(dto);

    // Invalidate list cache
    await this.invalidate([this.listCacheKey]);

    return apiResponse({
      statusCode: HttpStatus.CREATED,
      payload: { news },
    });
  }

  @Get()
  @UseInterceptors(CacheInterceptor)
  @CacheKey('all_news')
  async findAll(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
  ) {
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;

    const result = await this.newsService.findAll(pageNum, limitNum);

    return apiResponse({
      statusCode: HttpStatus.OK,
      payload: {
        news: result.data,
        pagination: result.meta,
      },
    });
  }

  @Get('deleted')
  async findDeleted() {
    const deletedNews = await this.newsService.findDeleted();

    return apiResponse({
      statusCode: HttpStatus.OK,
      payload: { news: deletedNews },
    });
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const news = await this.newsService.findOne(id);

    return apiResponse({
      statusCode: HttpStatus.OK,
      payload: { news, fromCache: false },
    });
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: NewsUpdateDto) {
    const updated = await this.newsService.update(id, dto);

    // Invalidate both list + item
    await this.invalidate([this.listCacheKey, this.itemKey(id)]);

    return apiResponse({
      statusCode: HttpStatus.OK,
      payload: { updated },
    });
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.newsService.remove(id);

    // Invalidate both list + item
    await this.invalidate([this.listCacheKey, this.itemKey(id)]);

    return apiResponse({
      statusCode: HttpStatus.OK,
      payload: { message: 'News deleted successfully' },
    });
  }

  @Post('restore/:id')
  async restore(@Param('id') id: string) {
    await this.newsService.restore(id);

    // Invalidate list cache
    await this.invalidate([this.listCacheKey]);

    return apiResponse({
      statusCode: HttpStatus.OK,
      payload: { message: 'News restored successfully' },
    });
  }
}
