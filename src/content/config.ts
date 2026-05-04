import { defineCollection, z } from 'astro:content';

const heroImageSchema = z.object({
  query: z.string().optional(),
  url: z.string().optional(),
  alt: z.string().optional(),
  attribution: z.string().optional(),
  sourceUrl: z.string().optional(),
  colorTreatment: z.enum(['grayscale', 'desaturate', 'color']).optional(),
}).optional();

const posts = defineCollection({
  type: 'content',
  // Allows both .md and .mdx
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
    heroImage: heroImageSchema,
  }),
});

const stories = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string().max(160),
    description: z.string().max(220),
    publishedAt: z.coerce.date(),
    updatedAt: z.coerce.date().optional(),
    market: z.enum(['US', 'KR', 'GLOBAL']),
    tickers: z.array(z.string()).default([]),
    sectors: z.array(z.string()).default([]),
    tags: z.array(z.string()).default([]),
    language: z.enum(['ko', 'en']).default('ko'),
    draft: z.boolean().default(false),
    author: z.string().default('Moo Corp Story Writer'),
    heroImage: heroImageSchema,
  }),
});

export const collections = { posts, stories };
