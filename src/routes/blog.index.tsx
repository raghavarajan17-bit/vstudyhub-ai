import React from 'react';
import { BlogView } from '../components/BlogView';
import { SITE } from '../lib/site-config';

export function BlogIndexRoute() {
  const canonicalUrl = `${SITE.url}/blog`;
  const title = "VStudyHub Blog - JEE & NEET Preparation Tips, Strategies & Concepts";
  const description = "Explore expert JEE & NEET preparation tips, chapter breakdowns, formulas, and strategies on VStudyHub.";

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    'name': 'VStudyHub Blog',
    'description': description,
    'url': canonicalUrl,
    'publisher': {
      '@type': 'Organization',
      'name': 'VStudyHub',
      'url': SITE.url,
      'logo': {
        '@type': 'ImageObject',
        'url': `${SITE.url}/logo.png`,
      },
    },
  };

  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <BlogView />
    </div>
  );
}

export default BlogIndexRoute;
