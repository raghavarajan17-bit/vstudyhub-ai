import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
   const baseUrl = "https://www.vstudyhub.com";
    const config = {
      projectId: "gen-lang-client-0612192195",
      firestoreDatabaseId: "ai-studio-vstudyhubjeeneet-550e4eae-7373-46d6-aff9-9555e855856e",
      apiKey: "AIzaSyDltU8OiUXzh4lQyQ34fsvQn5H_1o-dujw"
    };

    const firestoreUrl = `https://firestore.googleapis.com/v1/projects/${config.projectId}/databases/${config.firestoreDatabaseId}/documents:runQuery?key=${config.apiKey}`;

    let blogEntries: Array<{ url: string; lastmod?: string; priority: string; changefreq: string }> = [];

    try {
      const response = await fetch(firestoreUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          structuredQuery: {
            from: [{ collectionId: 'blogPosts' }]
          }
        })
      });

      if (response.ok) {
        const results: any = await response.json();
        if (Array.isArray(results)) {
          for (const item of results) {
            if (!item.document) continue;
            const doc = item.document;
            const fields = doc.fields || {};
            const isPublished = fields.published?.booleanValue ?? (fields.published?.stringValue === 'true');
            if (isPublished === false) continue;

            const slug = fields.slug?.stringValue || doc.name.split('/').pop();
            const lastmodTimestamp = fields.publishedAt?.timestampValue || fields.updatedAt?.timestampValue || fields.createdAt?.timestampValue || doc.updateTime;
            const lastmod = lastmodTimestamp ? new Date(lastmodTimestamp).toISOString().split('T')[0] : undefined;

            blogEntries.push({
              url: `${baseUrl}/blog/${slug}`,
              lastmod,
              priority: '0.8',
              changefreq: 'weekly'
            });
          }
        }
      }
    } catch (e) {
      console.error("Error fetching blog posts for sitemap function:", e);
    }

    const staticEntries = [
      { url: `${baseUrl}/`, priority: '1.0', changefreq: 'daily' },
      { url: `${baseUrl}/blog`, priority: '0.9', changefreq: 'daily' },
      { url: `${baseUrl}/subjects`, priority: '0.8', changefreq: 'weekly' },
      { url: `${baseUrl}/blog/subject/physics`, priority: '0.8', changefreq: 'weekly' },
      { url: `${baseUrl}/blog/subject/chemistry`, priority: '0.8', changefreq: 'weekly' },
      { url: `${baseUrl}/blog/subject/mathematics`, priority: '0.8', changefreq: 'weekly' },
      { url: `${baseUrl}/blog/subject/biology`, priority: '0.8', changefreq: 'weekly' },
      { url: `${baseUrl}/formulas`, priority: '0.8', changefreq: 'weekly' },
      { url: `${baseUrl}/quizzes`, priority: '0.7', changefreq: 'weekly' },
    ];

    const map = new Map();
    for (const entry of [...staticEntries, ...blogEntries]) {
      if (!map.has(entry.url)) {
        map.set(entry.url, entry);
      }
    }

    const allEntries = Array.from(map.values());

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allEntries.map((item) => `  <url>
    <loc>${item.url}</loc>${item.lastmod ? `\n    <lastmod>${item.lastmod}</lastmod>` : ''}
    <changefreq>${item.changefreq}</changefreq>
    <priority>${item.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

    res.setHeader("Content-Type", "application/xml; charset=utf-8");
    res.setHeader("Cache-Control", "s-maxage=86400, stale-while-revalidate");
    res.status(200).send(xml);
  } catch (error) {
    console.error("Error generating sitemap:", error);
    res.status(500).send("Error generating sitemap");
  }
}
