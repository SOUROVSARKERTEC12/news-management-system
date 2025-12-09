import { createZodDto } from 'nestjs-zod';
import { newsCreateSchema, newsUpdateSchema } from '../schema';

// -----------------------------------------------------
// Create DTO
// -----------------------------------------------------
export class NewsCreateDto extends createZodDto(newsCreateSchema) {}

// -----------------------------------------------------
// Update DTO
// -----------------------------------------------------
export class NewsUpdateDto extends createZodDto(newsUpdateSchema) {}
