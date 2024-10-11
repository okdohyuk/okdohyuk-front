import { z } from 'zod';

export const blogSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  thumbnailImage: z.string().optional(),
  contents: z.string().min(1, 'Contents are required'),
  isPublic: z.boolean(),
  categoryId: z.string().optional(),
  tags: z.array(z.string()),
});

export type BlogRequest = z.infer<typeof blogSchema>;
