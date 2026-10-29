// 영문판 피드. 원문 피드(src/pages/rss.xml.js)와 같고 컬렉션과 링크 접두사만 다르다.
import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';

export async function GET(context) {
  const posts = (await getCollection('posts-en', ({ data }) => !data.draft))
    .sort((a, b) => {
      const dt = b.data.publishedAt.valueOf() - a.data.publishedAt.valueOf();
      return dt !== 0 ? dt : b.slug.localeCompare(a.slug);
    });

  return rss({
    title: 'Moo Research — US & Korean Listed Companies',
    description: 'Daily analysis of US and Korean listed companies, translated from the Korean edition.',
    site: context.site,
    items: posts.map((post) => ({
      title: post.data.title,
      pubDate: post.data.publishedAt,
      description: post.data.description,
      link: `/en/posts/${post.slug}`,
      categories: [...post.data.tags, post.data.market],
    })),
    customData: '<language>en-us</language>',
  });
}
