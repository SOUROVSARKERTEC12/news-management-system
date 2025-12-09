import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NewsEntity } from '../../entities/news.entity';
import { NewsCreateDto, NewsUpdateDto } from './dto/news.dto';
import { metaSchema } from '../../common/schema/base-query.schema';
import { z } from 'zod';

export interface PaginatedResponse<T> {
  data: T[];
  meta: z.infer<typeof metaSchema>;
}

@Injectable()
export class NewsService {
  constructor(
    @InjectRepository(NewsEntity)
    private readonly newsRepository: Repository<NewsEntity>,
  ) {}

  async create(createNewsDto: NewsCreateDto): Promise<NewsEntity> {
    const news = this.newsRepository.create({
      title: createNewsDto.title,
      description: createNewsDto.description,
      category: { id: createNewsDto.categoryId } as any,
    });
    return await this.newsRepository.save(news);
  }

  async findAll(
    page: number = 1,
    limit: number = 10,
  ): Promise<PaginatedResponse<NewsEntity>> {
    const [data, total] = await this.newsRepository.findAndCount({
      relations: ['category'],
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return {
      data,
      meta: {
        total,
        page,
        perPage: limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string): Promise<NewsEntity> {
    const news = await this.newsRepository.findOne({
      where: { id },
      relations: ['category'],
    });
    if (!news) {
      throw new NotFoundException(`News with ID "${id}" not found`);
    }
    return news;
  }

  async update(id: string, updateNewsDto: NewsUpdateDto): Promise<NewsEntity> {
    const news = await this.findOne(id);

    if (updateNewsDto.title) news.title = updateNewsDto.title;
    if (updateNewsDto.description) news.description = updateNewsDto.description;

    return await this.newsRepository.save(news);
  }

  async remove(id: string): Promise<void> {
    const news = await this.findOne(id);
    await this.newsRepository.softRemove(news);
  }
}
