import React, { useEffect, useState } from 'react';
import { BlogPost } from '../types/blog.types';
import { getBlogPostBySlug } from '../lib/blog.service';
import { BlogView } from '../components/BlogView';
import { SITE } from '../lib/site-config';

interface BlogSlugRouteProps {
  slug?: string;
}

export function BlogSlugRoute({ slug }: BlogSlugRouteProps) {
  const [post, setPost] = useState<BlogPost | null>(null);

  useEffect(() => {
    if (slug) {
      getBlogPostBySlug(slug).then((fetched) => setPost(fetched));
    }
  }, [slug]);

  const postSlug = slug || post?.slug || post?.id || '';
  const canonicalUrl = `${SITE.url}/blog/${postSlug}`;
  const title = post ? `${post.title} | VStudyHub JEE & NEET Prep` : 'VStudyHub Blog Article';
  const description = post?.excerpt || post?.content.substring(0, 160) || SITE.description;
  
  const formatDateIso = (val: any) => {
    if (!val) return new Date().toISOString();
    try {
      if (typeof val.toDate === 'function') return val.toDate().toISOString();
      if (val.seconds) return new Date(val.seconds * 1000).toISOString();
      const d = new Date(val);
      return isNaN(d.getTime()) ? new Date().toISOString() : d.toISOString();
    } catch (e) {
      return new Date().toISOString();
    }
  };

  const datePublished = post ? formatDateIso(post.publishedAt || post.createdAt) : new Date().toISOString();
  const dateModified = datePublished;
  const articleSection = post?.category || 'Physics';
  const imageUrl = `${SITE.url}/og-image.png`;

  const jsonLd = post ? {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    'headline': post.title,
    'description': description,
    'datePublished': datePublished,
    'dateModified': dateModified,
    'articleSection': articleSection,
    'image': [imageUrl],
    'author': {
      '@type': 'Organization',
      'name': post.author || 'VStudyHub',
      'url': SITE.url,
    },
    'publisher': {
      '@type': 'Organization',
      'name': 'VStudyHub',
      'url': SITE.url,
      'logo': {
        '@type': 'ImageObject',
        'url': `${SITE.url}/logo.png`,
      },
    },
    'mainEntityOfPage': {
      '@type': 'WebPage',
      '@id': canonicalUrl,
    },
  } : null;

  return (
    <div>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      <BlogView initialSlug={slug} />
    </div>
  );
}

export default BlogSlugRoute;
