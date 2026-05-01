import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';

export async function GET(context) {
  const posts = (await getCollection('posts', ({ data }) => !data.draft))
    .sort((a, b) => b.data.publishedAt.valueOf() - a.data.publishedAt.valueOf());

  return rss({
    title: 'Moo Corp — 미국·한국 상장사 분석',
    description: '매일 1종목, 매주 시장 전체. 미국과 한국 상장사 동향을 데이터로 분석합니다.',
    site: context.site,
    items: posts.map((post) => ({
      title: post.data.title,
      pubDate: post.data.publishedAt,
      description: post.data.description,
      link: `/posts/${post.slug}`,
      categories: [...post.data.tags, post.data.market],
    })),
    customData: '<language>ko-kr</language>',
  });
}
