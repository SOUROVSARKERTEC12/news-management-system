import { noCodeDescription } from 'src/common/schema';
import { z } from 'zod';

export const newsSchema = z.object({
  id: z.uuidv4(),
  title: z.string(),
  description: z.string(),
  categoryId: z.uuidv4(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// Create
export const newsCreateSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
  description: noCodeDescription,
  categoryId: z.uuidv4('Invalid category ID'),
});

// Update
export const newsUpdateSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: noCodeDescription.optional(),
});
