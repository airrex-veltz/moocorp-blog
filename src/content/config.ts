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
    fiction: z.boolean().default(true),
    aiGenerated: z.boolean().default(true),
  }),
});

const toons = defineCollection({
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
    author: z.string().default('Moo Corp Toon Director'),
    sourceStorySlug: z.string().optional(),
    coverImage: z.string().optional(),
    panelCount: z.number().int().min(1).max(20).optional(),
    stylePreset: z.string().optional(),
    fiction: z.boolean().default(true),
    aiGenerated: z.boolean().default(true),
  }),
});

// 공시자료 — DART 제출 수치만 옮긴 자료 계통. posts와 분리해 둔 이유는 법적인 것이다.
// posts는 의견과 전망을 담고, filings는 담지 않는다. 같은 컬렉션에 두면 URL·메뉴·
// 목록 어디에서도 그 차이가 드러나지 않아, 자료로 쓴 글이 "오늘의 분석" 배지를 달고
// 나간다. heroImage가 없는 것도 의도적이다 — 분위기 사진이 붙으면 성격이 흐려진다.
const filings = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string().max(120),
    description: z.string().max(200),
    publishedAt: z.coerce.date(),
    updatedAt: z.coerce.date().optional(),
    market: z.enum(['US', 'KR', 'GLOBAL']),
    // 자료 페이지는 언제나 특정 기업을 가리킨다. 비워 둘 수 없다.
    tickers: z.array(z.string()).min(1),
    corpName: z.string().optional(),
    sectors: z.array(z.string()).default([]),
    tags: z.array(z.string()).default([]),
    language: z.enum(['ko', 'en']).default('ko'),
    draft: z.boolean().default(false),
    author: z.string().default('Moo Corp Research'),
    // 출처와 기준 시점. 자료의 신뢰는 전적으로 여기에 달려 있다.
    source: z.string().default('OpenDART (금융감독원 전자공시시스템)'),
    fiscalYears: z.string().optional(),
    fetchedAt: z.coerce.date().optional(),
  }),
});

// 영문판 — 한국어 원문과 같은 파일명·slug 로 `<컬렉션>-en/` 에 둔다(`/en/<kind>/<slug>`).
// 스키마는 원문과 같고 두 가지만 다르다: 영어 제목은 한국어보다 길어 상한을 넓히고,
// language 는 en 으로 고정한다. 기존 목록 페이지는 원문 컬렉션만 읽으므로 섞이지 않는다.
const en = (c: { schema?: unknown }) => defineCollection({
  type: 'content',
  schema: (c.schema as z.AnyZodObject).extend({
    title: z.string().max(200),
    description: z.string().max(320),
    language: z.literal('en').default('en'),
  }),
});

export const collections = {
  posts, stories, toons, filings,
  'posts-en': en(posts), 'stories-en': en(stories), 'toons-en': en(toons), 'filings-en': en(filings),
};
