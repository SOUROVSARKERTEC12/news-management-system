import { z } from 'zod';

export const categorySchema = z.object({
  id: z.uuidv4(),
  categoryName: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// Create
export const categoryCreateSchema = categorySchema.pick({
  categoryName: true,
  description: true,
});

// Update
export const categoryUpdateSchema = z.object({
  id: z.uuidv4(),
  categoryName: z.string(),
});
