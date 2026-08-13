import { collection, doc, getDoc, getDocs, query, where, orderBy, limit } from 'firebase/firestore';
import { db } from './firebase';
import { BlogPost } from '../types/blog.types';

const BLOG_COLLECTION = 'blogPosts';

/**
 * Safely normalizes raw Firestore document data into a BlogPost object.
 */
export function normalizeBlogPost(id: string, data: any): BlogPost {
  let tags: string[] = [];
  if (Array.isArray(data.tags)) {
    // Handle tags if stored as single string in array or multiple tag strings
    tags = data.tags
      .flatMap((t: any) => (typeof t === 'string' ? t.split(',').map((s) => s.trim()) : [String(t)]))
      .filter(Boolean);
  } else if (typeof data.tags === 'string') {
    tags = data.tags.split(',').map((s) => s.trim()).filter(Boolean);
  }

return {
  id,
  title: data.title || 'Untitled Article',
  slug: data.slug || id,

  // Support both old and new Firestore field names
  excerpt: data.excerpt || data.summary || '',

  content:
    data.content ||
    data.content_md ||
    data.body ||
    '',

  category: data.category || 'Physics',

  tags: tags.length > 0 ? tags : ['JEE', 'NEET'],

  published: Boolean(data.published),

  author: data.author || 'VStudyHub',

  readingTime: Number(data.readingTime || data.reading_minutes || 2),

  createdAt: data.createdAt || null,
  publishedAt: data.publishedAt || null,
};
}

/**
 * Fetch all published blog posts from Firestore, ordered by publishedAt descending.
 */
export async function getPublishedBlogPosts(): Promise<BlogPost[]> {
  try {
    const q = query(
      collection(db, BLOG_COLLECTION),
      where('published', '==', true),
      orderBy('publishedAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    const posts: BlogPost[] = [];

    querySnapshot.forEach((docSnap) => {
      posts.push(normalizeBlogPost(docSnap.id, docSnap.data()));
    });

    return posts;
  } catch (error) {
    // Fallback: if compound query requires index or fails, query published == true without ordering
    try {
      const fallbackQuery = query(
        collection(db, BLOG_COLLECTION),
        where('published', '==', true)
      );
      const querySnapshot = await getDocs(fallbackQuery);
      const posts: BlogPost[] = [];

      querySnapshot.forEach((docSnap) => {
        posts.push(normalizeBlogPost(docSnap.id, docSnap.data()));
      });

      // Sort client-side if publishedAt exists
      posts.sort((a, b) => {
        const getTime = (val: any) => {
          if (!val) return 0;
          if (typeof val.toDate === 'function') return val.toDate().getTime();
          if (val.seconds) return val.seconds * 1000;
          return new Date(val).getTime() || 0;
        };
        return getTime(b.publishedAt) - getTime(a.publishedAt);
      });

      return posts;
    } catch (fallbackError) {
      console.error('Error fetching published blog posts from Firestore:', fallbackError);
      return [];
    }
  }
}

/**
 * Find a published blog post matching the supplied slug.
 */
export async function getBlogPostBySlug(slug: string): Promise<BlogPost | null> {
  if (!slug) return null;

  try {
    const q = query(
      collection(db, BLOG_COLLECTION),
      where('slug', '==', slug),
      where('published', '==', true),
      limit(1)
    );
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      // Try direct ID lookup if slug matches doc ID
      return getBlogPostById(slug);
    }

    const docSnap = querySnapshot.docs[0];
    return normalizeBlogPost(docSnap.id, docSnap.data());
  } catch (error) {
    console.error(`Error fetching blog post by slug "${slug}":`, error);
    return getBlogPostById(slug);
  }
}

/**
 * Find a published blog post by its Firestore document ID.
 */
export async function getBlogPostById(id: string): Promise<BlogPost | null> {
  if (!id) return null;
  try {
    const docRef = doc(db, BLOG_COLLECTION, id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists() && docSnap.data().published) {
      return normalizeBlogPost(docSnap.id, docSnap.data());
    }
    return null;
  } catch (error) {
    console.error(`Error fetching blog post by ID "${id}":`, error);
    return null;
  }
}

