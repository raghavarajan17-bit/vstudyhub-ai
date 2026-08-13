import type { Request, Response } from 'express';
import { getPublishedBlogPosts } from '../lib/blog.service';

const BASE_URL = 'https://vstudyhub.com';
const SUBJECTS = ['physics', 'chemistry', 'mathematics', 'biology'];

export async function loader() {
  const posts = await getPublishedBlogPosts();

  const formatDate = (val: any) => {
    if (!val) return undefined;
    try {
      if (typeof val.toDate === 'function') return val.toDate().toISOString().split('T')[0];
      if (val.seconds) return new Date(val.seconds * 1000).toISOString().split('T')[0];
      const d = new Date(val);
      return isNaN(d.getTime()) ? undefined : d.toISOString().split('T')[0];
    } catch {
      return undefined;
    }
  };

  const staticEntries = [
    { url: `${BASE_URL}/`, priority: '1.0', changefreq: 'daily' },
    { url: `${BASE_URL}/blog`, priority: '0.9', changefreq: 'daily' },
    ...SUBJECTS.map((sub) => ({
      url: `${BASE_URL}/blog/subject/${sub}`,
      priority: '0.8',
      changefreq: 'weekly',
    })),
    { url: `${BASE_URL}/subjects`, priority: '0.8', changefreq: 'weekly' },
    { url: `${BASE_URL}/formulas`, priority: '0.8', changefreq: 'weekly' },
    { url: `${BASE_URL}/quizzes`, priority: '0.7', changefreq: 'weekly' },
  ];

  const blogEntries = posts
    .filter((p) => p.published !== false)
    .map((p) => ({
      url: `${BASE_URL}/blog/${p.slug}`,
      lastmod: formatDate(p.publishedAt || p.createdAt),
      priority: '0.8',
      changefreq: 'weekly',
    }));

  const urlMap = new Map<string, typeof staticEntries[0] & { lastmod?: string }>();
  for (const entry of [...staticEntries, ...blogEntries]) {
    if (!urlMap.has(entry.url)) {
      urlMap.set(entry.url, entry);
    }
  }

  const allEntries = Array.from(urlMap.values());

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allEntries
  .map(
    (item) => `  <url>
    <loc>${item.url}</loc>${item.lastmod ? `\n    <lastmod>${item.lastmod}</lastmod>` : ''}
    <changefreq>${item.changefreq}</changefreq>
    <priority>${item.priority}</priority>
  </url>`
  )
  .join('\n')}
</urlset>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 's-maxage=86400, stale-while-revalidate',
    },
  });
}

export default async function handler(req: Request, res: Response) {
  try {
    const response = await loader();
    const xml = await response.text();
    res.setHeader('Content-Type', 'application/xml; charset=utf-8');
    res.setHeader('Cache-Control', 's-maxage=86400, stale-while-revalidate');
    res.status(200).send(xml);
  } catch (error) {
    console.error('Error generating sitemap:', error);
    res.status(500).send('Error generating sitemap');
  }
}
