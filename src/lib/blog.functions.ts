import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';
import { BlogPost, BlogCategory } from '../types/blog.types';
import { getPublishedBlogPosts, getBlogPostBySlug as fetchBySlug } from './blog.service';
import { GoogleGenAI } from '@google/genai';

const BLOG_COLLECTION = 'blogPosts';

/**
 * List all published posts from Cloud Firestore blogPosts collection.
 */
export async function listPosts(): Promise<BlogPost[]> {
  return await getPublishedBlogPosts();
}

/**
 * Fetch a published post by its slug from Cloud Firestore.
 */
export async function getPostBySlug(slug: string): Promise<BlogPost | null> {
  if (!slug) return null;
  return await fetchBySlug(slug);
}

/**
 * Normalize category string to valid BlogCategory: Physics, Chemistry, Mathematics, Biology.
 */
export function normalizeCategory(catStr?: string): BlogCategory {
  if (!catStr) return 'Physics';
  const lower = catStr.toLowerCase().trim();
  if (lower === 'physics' || lower.includes('phys')) return 'Physics';
  if (lower === 'chemistry' || lower.includes('chem')) return 'Chemistry';
  if (lower === 'mathematics' || lower === 'math' || lower.includes('math') || lower.includes('calc') || lower.includes('algebra')) return 'Mathematics';
  if (lower === 'biology' || lower.includes('bio') || lower.includes('cell') || lower.includes('gene')) return 'Biology';
  return 'Physics';
}

/**
 * Infer subject/category for a given topic or title.
 */
function inferSubject(text: string): BlogCategory {
  return normalizeCategory(text);
}

interface GeminiBlogResponse {
  title?: string;
  excerpt?: string;
  content?: string;
  content_md?: string;
  category?: string;
  subject?: string;
  readingTime?: number | string;
  reading_minutes?: number | string;
}

/**
 * Get current date string formatted as YYYY-MM-DD in IST (Asia/Kolkata timezone).
 */
export function getIstDateString(date: Date = new Date()): string {
  try {
    return date.toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });
  } catch (_) {
    return date.toISOString().split('T')[0];
  }
}

/**
 * Generate a new blog post using Gemini 3.6 Flash (if key available) or template, and save to Firestore `blogPosts`.
 */
export async function generateDailyPost(customTopic?: string): Promise<BlogPost | null> {
  const istToday = getIstDateString();
  const defaultTopics = [
    `Organic Chemistry Mechanisms: Electrophilic Addition & Substitution for JEE/NEET (${istToday})`,
    `Rotational Dynamics: Moment of Inertia & Torque Analysis (${istToday})`,
    `Definite Integrals & Differential Equations: High-Yield JEE Shortcuts (${istToday})`,
    `Human Physiology & Genetics: High-Scoring NCERT Topics for NEET (${istToday})`,
    `Thermodynamics & Electrochemistry: Complete Exam Formula Breakdown (${istToday})`
  ];

  const topic = customTopic || defaultTopics[Math.floor(Math.random() * defaultTopics.length)];
  let category: BlogCategory = inferSubject(topic);
  const slug = `daily-${istToday}-${topic.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '').substring(0, 40)}`;

  let title = topic;
  let excerpt = `Comprehensive guide, NCERT concepts, and problem-solving strategies for ${topic}.`;
  let content = `## Overview\n\nUnderstanding **${topic}** is essential for cracking competitive exams like IIT-JEE Main, Advanced, and NEET 2026-27.\n\n### Core Exam Concepts\n\n- Master fundamental principles before jumping into complex numericals.\n- Review NCERT textbook lines and practice previous year questions (PYQs).\n- Maintain a dedicated formula sheet and mistake notebook.\n\n### Step-by-Step Problem Solving Strategy\n\n1. Break down complex multi-concept questions into fundamental equations.\n2. Verify units and edge-case boundary conditions.\n3. Identify common trap options set by test makers.\n\n*Study with consistency and dedication on VStudyHub!*`;
  let readingTime = 5;

  const apiKey = process.env.GEMINI_API_KEY || (typeof import.meta !== 'undefined' ? (import.meta as any).env?.VITE_GEMINI_API_KEY : '');

  if (apiKey) {
    try {
      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: { headers: { 'User-Agent': 'aistudio-build' } }
      });
      const prompt = `Write an authentic, highly detailed (1200+ words) educational article for JEE Main/Advanced and NEET aspirants on topic: "${topic}".
Include:
1. Clear conceptual theory and derivations
2. NCERT references and formulas formatted in LaTeX ($...$)
3. Common student traps/mistakes
4. 2 sample practice problems with solutions

Return a JSON object with keys: title, excerpt, content_md, subject, reading_minutes.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.3,
        }
      });

      const responseText = response.text || '';
      if (responseText) {
        try {
          const parsed: GeminiBlogResponse = JSON.parse(responseText);
          if (parsed.title) title = parsed.title;
          if (parsed.excerpt) excerpt = parsed.excerpt;

          const rawContent = parsed.content_md || parsed.content || '';
          if (rawContent) content = rawContent;

          const rawSubject = parsed.subject || parsed.category;
          if (rawSubject) category = normalizeCategory(rawSubject);

          const rawReadingMinutes = parsed.reading_minutes || parsed.readingTime;
          if (rawReadingMinutes) {
            readingTime = Number(rawReadingMinutes) || 5;
          }
        } catch (jsonErr) {
          console.warn('JSON parsing failed, extracting from text:', jsonErr);
        }
      }
    } catch (err) {
      console.warn('Gemini article generation fallback used:', err);
    }
  }

  const firestorePost = {
    title,
    slug,
    excerpt,
    content,
    category,
    tags: [category, 'JEE', 'NEET', 'DailyPreparation'],
    readingTime: readingTime || Math.max(2, Math.ceil(content.split(' ').length / 200)),
    published: true,
    author: 'VStudyHub AI Mentor',
    createdAt: serverTimestamp(),
    publishedAt: serverTimestamp(),
  };

  try {
    const docRef = await addDoc(collection(db, BLOG_COLLECTION), firestorePost);
    return {
      id: docRef.id,
      title: firestorePost.title,
      slug: firestorePost.slug,
      excerpt: firestorePost.excerpt,
      content: firestorePost.content,
      category: firestorePost.category,
      tags: firestorePost.tags,
      published: firestorePost.published,
      author: firestorePost.author,
      readingTime: firestorePost.readingTime,
      createdAt: new Date(),
      publishedAt: new Date(),
    };
  } catch (error) {
    console.error('Error saving generated blog post to Firestore:', error);
    return null;
  }
}
