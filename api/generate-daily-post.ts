import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI } from '@google/genai';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import fs from 'fs';
import path from 'path';

function getAdminFirestore(projectId: string, databaseId: string) {
  if (getApps().length === 0) {
    if (process.env.FIREBASE_SERVICE_ACCOUNT) {
      try {
        const sa = typeof process.env.FIREBASE_SERVICE_ACCOUNT === 'string'
          ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
          : process.env.FIREBASE_SERVICE_ACCOUNT;
        initializeApp({ credential: cert(sa), projectId: sa.project_id || projectId });
      } catch (_) {
        initializeApp({ projectId });
      }
    } else {
      initializeApp({ projectId });
    }
  }
  return getFirestore(getApps()[0], databaseId);
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    // Strict Authorization check for Vercel Cron (Authorization: Bearer <CRON_SECRET>)
    const cronSecret = process.env.CRON_SECRET;
    const authHeader = req.headers.authorization;

    if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
      return res.status(401).json({
        success: false,
        error: "Unauthorized: Missing or invalid Authorization header."
      });
    }

    const config = {
      projectId: "gen-lang-client-0612192195",
      firestoreDatabaseId: "ai-studio-vstudyhubjeeneet-550e4eae-7373-46d6-aff9-9555e855856e",
      apiKey: "AIzaSyDltU8OiUXzh4lQyQ34fsvQn5H_1o-dujw"
    };

    try {
      const configPath = path.join(process.cwd(), 'firebase-applet-config.json');
      if (fs.existsSync(configPath)) {
        const parsed = JSON.parse(fs.readFileSync(configPath, 'utf8'));
        if (parsed.projectId) config.projectId = parsed.projectId;
        if (parsed.firestoreDatabaseId) config.firestoreDatabaseId = parsed.firestoreDatabaseId;
        if (parsed.apiKey) config.apiKey = parsed.apiKey;
      }
    } catch (_) {}

    // Calculate today string in IST (Asia/Kolkata)
    const istToday = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });

    // Step 1: Check if post for today already exists in Firestore blogPosts
    const queryUrl = `https://firestore.googleapis.com/v1/projects/${config.projectId}/databases/${config.firestoreDatabaseId}/documents:runQuery?key=${config.apiKey}`;
    
    let existingPost = null;
    try {
      const queryRes = await fetch(queryUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          structuredQuery: {
            from: [{ collectionId: 'blogPosts' }]
          }
        })
      });

      if (queryRes.ok) {
        const results: any = await queryRes.json();
        if (Array.isArray(results)) {
          for (const item of results) {
            if (!item.document) continue;
            const fields = item.document.fields || {};
            const slug = fields.slug?.stringValue || '';
            const createdAt = fields.createdAt?.timestampValue || fields.publishedAt?.timestampValue || '';
            const createdDateIst = createdAt ? new Date(createdAt).toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' }) : '';
            
            if (slug.includes(istToday) || createdDateIst === istToday) {
              existingPost = {
                id: item.document.name.split('/').pop(),
                title: fields.title?.stringValue || 'Daily Post',
                slug,
                category: fields.category?.stringValue || 'Physics',
                publishedAt: createdAt,
              };
              break;
            }
          }
        }
      }
    } catch (e) {
      console.warn("Could not check existing post:", e);
    }

    if (existingPost && req.query.force !== 'true') {
      return res.status(200).json({
        success: true,
        message: `Article for today (${istToday} IST) already exists in Firestore.`,
        existingPost,
      });
    }

    // Step 2: Generate article using Gemini 3.6 Flash
    const topics = [
      `Organic Chemistry Reaction Mechanisms: Electrophilic Addition & Substitution for JEE/NEET (${istToday})`,
      `Rotational Dynamics: Moment of Inertia & Torque Analysis (${istToday})`,
      `Definite Integrals & Differential Equations: High-Yield JEE Shortcuts (${istToday})`,
      `Human Physiology & Genetics: High-Scoring NCERT Topics for NEET (${istToday})`,
      `Thermodynamics & Electrochemistry: Complete Exam Formula Breakdown (${istToday})`
    ];

    const topic = (req.body?.topic || req.query?.topic as string) || topics[Math.floor(Math.random() * topics.length)];
    const geminiKey = process.env.GEMINI_API_KEY || "";

    let title = topic;
    let excerpt = `Comprehensive JEE & NEET guide for ${topic}.`;
    let content_md = `## Overview\n\nMastering **${topic}** is vital for high scores in JEE Main, JEE Advanced, and NEET.`;
    let category = "Physics";
    let reading_minutes = 6;

    if (geminiKey) {
      try {
        const ai = new GoogleGenAI({
          apiKey: geminiKey,
          httpOptions: { headers: { 'User-Agent': 'aistudio-build' } }
        });

        const prompt = `Write an authentic, highly detailed (1200+ words) educational article for JEE Main/Advanced and NEET 2026-27 aspirants on topic: "${topic}".
Include:
1. Clear conceptual theory and derivations
2. NCERT references and formulas formatted in LaTeX ($...$)
3. Common student traps/mistakes
4. 2 sample practice problems with solutions

Return a JSON object with keys: title, excerpt, content_md, category, reading_minutes.`;

        const response = await ai.models.generateContent({
          model: 'gemini-3.6-flash',
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
            temperature: 0.3
          }
        });

        if (response.text) {
          const parsed = JSON.parse(response.text);
          if (parsed.title) title = parsed.title;
          if (parsed.excerpt) excerpt = parsed.excerpt;
          if (parsed.content_md) content_md = parsed.content_md;
          if (parsed.category) category = parsed.category;
          if (parsed.reading_minutes) reading_minutes = Number(parsed.reading_minutes) || 6;
        }
      } catch (err: any) {
        console.error("Error generating with Gemini:", err);
      }
    }

    const slug = `daily-${istToday}-${topic.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '').substring(0, 35)}`;
    const nowIso = new Date().toISOString();

    let savedViaAdmin = false;
    try {
      const db = getAdminFirestore(config.projectId, config.firestoreDatabaseId);
      await db.collection('blogPosts').doc(slug).set({
        title,
        slug,
        excerpt,
        content: content_md,
        category,
        tags: [category, "JEE", "NEET", "DailyPost"],
        published: true,
        author: "VStudyHub AI Mentor",
        readingTime: reading_minutes,
        createdAt: nowIso,
        publishedAt: nowIso
      });
      savedViaAdmin = true;
    } catch (adminErr: any) {
      console.warn("Firebase Admin SDK write failed, attempting REST API fallback:", adminErr?.message || adminErr);
    }

    if (!savedViaAdmin) {
      const docUrl = `https://firestore.googleapis.com/v1/projects/${config.projectId}/databases/${config.firestoreDatabaseId}/documents/blogPosts?documentId=${slug}&key=${config.apiKey}`;
      const docBody = {
        fields: {
          title: { stringValue: title },
          slug: { stringValue: slug },
          excerpt: { stringValue: excerpt },
          content: { stringValue: content_md },
          category: { stringValue: category },
          tags: { arrayValue: { values: [{ stringValue: category }, { stringValue: "JEE" }, { stringValue: "NEET" }, { stringValue: "DailyPost" }] } },
          published: { booleanValue: true },
          author: { stringValue: "VStudyHub AI Mentor" },
          readingTime: { integerValue: String(reading_minutes) },
          createdAt: { timestampValue: nowIso },
          publishedAt: { timestampValue: nowIso }
        }
      };

      const insertRes = await fetch(docUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(docBody)
      });

      if (!insertRes.ok) {
        const errText = await insertRes.text();
        return res.status(500).json({
          success: false,
          error: `Firestore insertion failed (${insertRes.status}): ${errText}`
        });
      }
    }

    return res.status(200).json({
      success: true,
      message: `Successfully generated and saved today's article (${istToday} IST)`,
      article: {
        title,
        slug,
        category,
        publishedAt: nowIso
      }
    });

  } catch (error: any) {
    console.error("Error in /api/generate-daily-post:", error);
    return res.status(500).json({
      success: false,
      error: error?.message || "Internal server error during daily post generation"
    });
  }
}
