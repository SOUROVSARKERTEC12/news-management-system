// src/dto/category.dto.ts
import { createZodDto } from 'nestjs-zod';
import { categoryCreateSchema, categoryUpdateSchema } from '../schema';

// -----------------------------------------------------
// Create DTO
// -----------------------------------------------------
export class CategoryCreateDto extends createZodDto(categoryCreateSchema) {}

// -----------------------------------------------------
// Update DTO
// -----------------------------------------------------
export class CategoryUpdateDto extends createZodDto(categoryUpdateSchema) {}
