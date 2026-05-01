import { defineCollection, z } from 'astro:content';

const posts = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string().max(120),
    description: z.string().max(200),
    publishedAt: z.coerce.date(),
    updatedAt: z.coerce.date().optional(),
    market: z.enum(['US', 'KR', 'GLOBAL']),
    tickers: z.array(z.string()).default([]),
    sectors: z.array(z.string()).default([]),
    tags: z.array(z.string()).default([]),
    language: z.enum(['ko', 'en']).default('ko'),
    draft: z.boolean().default(false),
    author: z.string().default('Moo Corp Research'),
  }),
});

export const collections = { posts };
