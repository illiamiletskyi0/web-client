import { z } from 'zod'

export const blogPostSchema = z.object({
  title: z.string().min(1, { message: 'Заголовок обов\'язковий' }).max(255, { message: 'Заголовок повинен бути менше 255 символів' }),
  slug: z.string().min(1, { message: 'Slug обов\'язковий' }).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, { message: 'Slug може містити лише латинські літери, цифри та дефіси' }),
  is_published: z.boolean(),
  date_published: z.string().optional().nullable(),
  user_id: z.number().int().positive({ message: 'ID користувача має бути додатнім числом' }),
  category_id: z.number().int().positive({ message: 'ID категорії має бути додатнім числом' })
})

export type BlogPostForm = z.infer<typeof blogPostSchema>