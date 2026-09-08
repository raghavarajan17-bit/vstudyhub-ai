import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI } from '@google/genai';
import fs from 'fs';
import path from 'path';

// Global career, interview, and professional English content architecture
const CURRICULUM_TOPICS = [
  { subject: 'Career', topic: 'AI Interview Practice: How to Prepare for a Job Interview with AI Feedback' },
  { subject: 'Career', topic: 'Common Job Interview Questions and How to Answer Them with the STAR Method' },
  { subject: 'Career', topic: 'Behavioral Interview Preparation: Tell Me About Yourself, Strengths, Weaknesses, and More' },
  { subject: 'Career', topic: 'Technical Interview Preparation: A Practical Framework for Explaining Your Skills and Projects' },
  { subject: 'Career', topic: 'Mock Interview Practice: How to Simulate a Real Interview and Improve Your Answers' },
  { subject: 'Career', topic: 'Interview Communication Skills: How to Answer Clearly, Concisely, and Confidently' },
  { subject: 'Career', topic: 'AI Career Coach: How AI Can Help You Plan Your Career and Identify Skill Gaps' },
  { subject: 'Career', topic: 'How to Prepare for Your First International Job Interview' },
  { subject: 'Career', topic: 'Resume to Interview: How to Turn Your Experience into Strong Interview Answers' },
  { subject: 'Career', topic: 'Career Change Interview Preparation: How to Explain Your Transition with Confidence' },
  { subject: 'Career', topic: 'Job Interview Preparation Checklist: What to Do Before, During, and After an Interview' },
  { subject: 'Career', topic: 'How to Research a Company Before a Job Interview' },
  { subject: 'Career', topic: 'English for Job Interviews: Essential Phrases and Professional Answers' },
  { subject: 'Career', topic: 'How to Speak More Confidently in English During a Job Interview' },
  { subject: 'Career', topic: 'Professional English Communication Skills for Global Careers' },
  { subject: 'Career', topic: 'Common English Mistakes to Avoid in Job Interviews' },
  { subject: 'Career', topic: 'How to Explain Your Work Experience Clearly in English' },
  { subject: 'Career', topic: 'English Interview Practice: Questions, Answers, and Confidence-Building Techniques' },
  { subject: 'Career', topic: 'International Job Interview Tips for Candidates Applying Globally' },
  { subject: 'Career', topic: 'Remote Job Interview Preparation: How to Succeed in a Video Interview' },
  { subject: 'Career', topic: 'How to Prepare for a Multicultural Job Interview' },
  { subject: 'Career', topic: 'AI-Powered Interview Preparation for Students and Early-Career Professionals' },
  { subject: 'Career', topic: 'How to Build Interview Confidence Before Applying for Global Jobs' },
  { subject: 'Career', topic: 'Interview Skills Every International Job Seeker Should Develop' },
];

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const executionLogs: string[] = [];
  const log = (msg: string) => {
    const timestamp = new Date().toISOString();
    const logLine = `[${timestamp}] ${msg}`;
    console.log(logLine);
    executionLogs.push(logLine);
  };

  log('Starting /api/generate-daily-post handler...');

  try {
    // ------------------------------------------------------------------------
    // 1. AUTHENTICATION & AUTHORIZATION
    // ------------------------------------------------------------------------
    const cronSecret = process.env.CRON_SECRET;
    const authHeader = req.headers.authorization;
console.log("Authorization:", req.headers.authorization);
console.log("x-vercel-cron:", req.headers["x-vercel-cron"]);
console.log("User-Agent:", req.headers["user-agent"]);
console.log("Authorization:", req.headers.authorization);
console.log("x-vercel-cron:", req.headers["x-vercel-cron"]);
console.log("User-Agent:", req.headers["user-agent"]);
    const querySecret = (req.query?.secret as string) || (req.query?.key as string);
    const isVercelCron =
      req.headers['x-vercel-cron'] === '1' ||
      (typeof req.headers['user-agent'] === 'string' && req.headers['user-agent'].includes('vercel-cron'));

    log(`Auth Check - Header: ${authHeader ? 'Bearer [HIDDEN]' : 'none'}, QuerySecret: ${querySecret ? '[PRESENT]' : 'none'}, isVercelCron: ${isVercelCron}`);

    if (cronSecret) {
      const isBearerValid = authHeader === `Bearer ${cronSecret}`;
      const isQueryValid = querySecret === cronSecret;

      if (!isBearerValid && !isQueryValid && !isVercelCron) {
        log('Authentication failed: Missing or mismatched CRON_SECRET authorization.');
        return res.status(401).json({
          success: false,
          error: 'Unauthorized: Missing or invalid CRON_SECRET authorization. Pass "Authorization: Bearer <CRON_SECRET>" or "?secret=<CRON_SECRET>".',
          logs: executionLogs
        });
      }
    } else {
      log('Warning: CRON_SECRET is not defined in environment variables. Proceeding with open invocation.');
    }

    // ------------------------------------------------------------------------
    // 2. CONFIGURATION RESOLUTION
    // ------------------------------------------------------------------------
    const config = {
      projectId: process.env.FIREBASE_PROJECT_ID || 'gen-lang-client-0612192195',
      firestoreDatabaseId: process.env.FIREBASE_DATABASE_ID || 'ai-studio-vstudyhubjeeneet-550e4eae-7373-46d6-aff9-9555e855856e',
      apiKey: process.env.FIREBASE_API_KEY || process.env.VITE_FIREBASE_API_KEY || 'AIzaSyDltU8OiUXzh4lQyQ34fsvQn5H_1o-dujw'
    };

    try {
      const configPath = path.join(process.cwd(), 'firebase-applet-config.json');
      if (fs.existsSync(configPath)) {
        const parsed = JSON.parse(fs.readFileSync(configPath, 'utf8'));
        if (!process.env.FIREBASE_PROJECT_ID && parsed.projectId) config.projectId = parsed.projectId;
        if (!process.env.FIREBASE_DATABASE_ID && parsed.firestoreDatabaseId) config.firestoreDatabaseId = parsed.firestoreDatabaseId;
        if (!process.env.FIREBASE_API_KEY && !process.env.VITE_FIREBASE_API_KEY && parsed.apiKey) config.apiKey = parsed.apiKey;
        log('Loaded Firestore project credentials.');
      }
    } catch (e: any) {
      log(`Note on config file read: ${e?.message}`);
    }

    const istToday = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });
    log(`Target Date (IST): ${istToday}`);

    // ------------------------------------------------------------------------
    // 3. DUPLICATE CHECK & PREVIOUS POSTS EXTRACTION
    // ------------------------------------------------------------------------
    const queryUrl = `https://firestore.googleapis.com/v1/projects/${config.projectId}/databases/${config.firestoreDatabaseId}/documents:runQuery?key=${config.apiKey}`;
    
    let existingPostForToday: any = null;
    const previousTitles: string[] = [];

    try {
      log('Querying Firestore blogPosts collection to verify existing articles...');
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
            const titleStr = fields.title?.stringValue || '';
            const slugStr = fields.slug?.stringValue || '';
            const createdAt = fields.createdAt?.timestampValue || fields.publishedAt?.timestampValue || '';
            const createdDateIst = createdAt ? new Date(createdAt).toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' }) : '';

            if (titleStr) previousTitles.push(titleStr);

            if (slugStr.includes(istToday) || createdDateIst === istToday) {
              existingPostForToday = {
                id: item.document.name.split('/').pop(),
                title: titleStr,
                slug: slugStr,
                category: fields.category?.stringValue || 'General',
                publishedAt: createdAt
              };
            }
          }
        }
        log(`Firestore query complete. Found ${previousTitles.length} total existing articles.`);
      } else {
        const queryErr = await queryRes.text();
        log(`Firestore runQuery warning (${queryRes.status}): ${queryErr}`);
      }
    } catch (queryErr: any) {
      log(`Error while checking existing Firestore posts: ${queryErr?.message || queryErr}`);
    }

    const forceGeneration = req.query?.force === 'true' || req.body?.force === true;

    if (existingPostForToday && !forceGeneration) {
      log(`Article for today (${istToday}) already exists: "${existingPostForToday.title}". Skipping.`);
      return res.status(200).json({
        success: true,
        message: `Article for today (${istToday} IST) is already published. No duplicate created. Use '?force=true' to override.`,
        date: istToday,
        existingPost: existingPostForToday,
        logs: executionLogs
      });
    }

    // ------------------------------------------------------------------------
    // 4. TOPIC SELECTION (AVOID PREVIOUSLY COVERED TOPICS)
    // ------------------------------------------------------------------------
    let chosenTopicObj = CURRICULUM_TOPICS.find(
      (item) => !previousTitles.some((t) => t.toLowerCase().includes(item.topic.split(':')[0].toLowerCase()))
    );

    if (!chosenTopicObj) {
      // Pick random topic from curriculum if all have been touched
      chosenTopicObj = CURRICULUM_TOPICS[Math.floor(Math.random() * CURRICULUM_TOPICS.length)];
    }

    // Allow manual override if passed in body or query
    const requestedTopic = (req.body?.topic || req.query?.topic) as string | undefined;
    const finalTopic = requestedTopic || chosenTopicObj.topic;
    const defaultCategory = chosenTopicObj.subject;

    log(`Selected Topic: "${finalTopic}" [Category: ${defaultCategory}]`);

    // ------------------------------------------------------------------------
    // 5. GEMINI 1,200+ WORD ARTICLE GENERATION
    // ------------------------------------------------------------------------
    const geminiKey = process.env.GEMINI_API_KEY;
    if (!geminiKey) {
      log('Fatal Error: GEMINI_API_KEY environment variable is not configured.');
      return res.status(500).json({
        success: false,
        error: 'GEMINI_API_KEY environment variable is missing on server. Please configure it in Vercel Environment Variables.',
        logs: executionLogs
      });
    }

    log('Initializing Gemini client...');
    const ai = new GoogleGenAI({
      apiKey: geminiKey,
      httpOptions: { headers: { 'User-Agent': 'aistudio-build' } }
    });

    const prompt = `You are a world-class career coach, interview expert, professional English communication coach, and SEO content strategist for an international audience.

Write a complete, highly useful, original, practical, and trustworthy educational article (EXACTLY 1,200 to 1,800 words) on the topic:
"${finalTopic}"

TARGET AUDIENCE: International students, graduates, job seekers, career changers, and working professionals preparing for interviews or improving professional English for global careers.

CONTENT GOALS:
- Give genuinely useful advice that readers can apply immediately.
- Write for an international audience across the USA, Canada, UK, Australia, New Zealand, Germany, Singapore, UAE, Ireland, Netherlands, France, and other markets.
- Use natural global English.
- Do not assume one country's hiring system unless the topic specifically requires it.
- Avoid keyword stuffing, exaggerated promises, fake statistics, unsupported claims, and repetitive filler.
- Never claim guaranteed employment, guaranteed interview success, or guaranteed AI results.

MANDATORY STRUCTURE:
1. TITLE: Clear, compelling SEO-friendly title matching the main search intent.
2. EXCERPT: Concise 2-3 sentence summary explaining what the reader will learn.
3. INTRODUCTION: Explain the reader problem and the purpose of the article.
4. CORE EDUCATIONAL CONTENT: Use clear H2 and H3 headings. Explain concepts step by step. Include practical examples, interview answers, frameworks, checklists, or action steps where relevant. For English topics, provide natural professional phrases and explain when to use them. For AI topics, explain realistic benefits, limitations, and best practices.
5. PRACTICAL ACTION PLAN: Give a simple step-by-step plan readers can follow immediately.
6. COMMON MISTAKES: Include at least 5 realistic mistakes or pitfalls and explain how to avoid them.
7. FAQ: Include 4-6 useful frequently asked questions with concise answers.
8. CONCLUSION: Summarize the key lessons and give an encouraging next step without making guarantees.
9. VSTUDYHUB INTERNAL LINK SUGGESTIONS: Naturally suggest relevant VStudyHub routes including /ai-interview, /ai-career-coach, and /blog when useful. Do not invent other VStudyHub URLs.

SEO REQUIREMENTS:
- Identify the primary search intent from the topic.
- Naturally use relevant variations and long-tail phrases.
- Use semantic terms related to interviews, careers, professional English, communication, job preparation, or AI coaching as appropriate.
- Prioritize helpfulness and readability over keyword density.
- Do not use fake search volume, rankings, statistics, or claims about Google.
- The article must be original and must not reproduce another website's content.

FORMATTING:
- Return complete Markdown in content_md.
- Use Markdown headings, bullet lists, numbered lists, tables, and blockquotes only when they improve clarity.
- Do not include HTML.
- Do not invent citations or sources.

Return ONLY a valid JSON object matching this schema:
{
  "title": "String (Article Title)",
  "excerpt": "String (2-3 sentences overview)",
  "content_md": "String (Complete Markdown article with headings, examples, action plan, mistakes, FAQ, conclusion, and internal-link suggestions)",
  "category": "Career",
  "tags": ["Array", "of", "4-6", "relevant", "tags"],
  "reading_minutes": Number (Estimated reading time between 6 and 10)
}
`;

    log('Generating article content via Gemini API (model: gemini-3.7-flash)...');
    let generatedData: any = null;

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.7-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.25
        }
      });

      if (!response.text) {
        throw new Error('Gemini returned an empty text response.');
      }

      generatedData = JSON.parse(response.text);
      log(`Gemini generation succeeded! Title: "${generatedData.title}", Category: ${generatedData.category}`);
    } catch (geminiErr: any) {
      log(`Primary Gemini generation failed: ${geminiErr?.message || geminiErr}. Retrying with gemini-2.5-flash fallback...`);
      try {
        const fallbackResponse = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
            temperature: 0.25
          }
        });
        if (fallbackResponse.text) {
          generatedData = JSON.parse(fallbackResponse.text);
          log('Fallback Gemini generation succeeded.');
        }
      } catch (fallbackErr: any) {
        log(`Fatal Gemini Error: Both primary and fallback generation failed: ${fallbackErr?.message}`);
        return res.status(500).json({
          success: false,
          error: `Gemini content generation failed: ${fallbackErr?.message || fallbackErr}`,
          logs: executionLogs
        });
      }
    }

    if (!generatedData || !generatedData.content_md) {
      return res.status(500).json({
        success: false,
        error: 'Failed to extract structured markdown content from Gemini response.',
        logs: executionLogs
      });
    }

    // ------------------------------------------------------------------------
    // 6. FIRESTORE PERSISTENCE VIA REST API
    // ------------------------------------------------------------------------
    const title = generatedData.title || finalTopic;
    const excerpt = generatedData.excerpt || `Practical career, interview, and professional English guidance for ${finalTopic}.`;
    const content = generatedData.content_md;
    const category = generatedData.category || defaultCategory;
    const readingTime = Number(generatedData.reading_minutes) || Math.max(6, Math.ceil(content.split(/\s+/).length / 200));
    const tags = Array.isArray(generatedData.tags) && generatedData.tags.length > 0
      ? generatedData.tags
      : [category, 'AI Interview', 'Career Coaching', 'Professional English', 'Job Interview', 'Global Careers'];

    const safeSlugTitle = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
      .substring(0, 40);
    const slug = `daily-${istToday}-${safeSlugTitle}`;
    const nowIso = new Date().toISOString();

    log(`Writing new blog post to Firestore (slug: "${slug}")...`);

    // Using PATCH on the document path creates or updates the document idempotently
    const patchDocUrl = `https://firestore.googleapis.com/v1/projects/${config.projectId}/databases/${config.firestoreDatabaseId}/documents/blogPosts/${slug}?key=${config.apiKey}`;
    
    const firestoreDocumentPayload = {
      fields: {
        title: { stringValue: title },
        slug: { stringValue: slug },
        excerpt: { stringValue: excerpt },
        content: { stringValue: content },
        category: { stringValue: category },
        tags: {
          arrayValue: {
            values: tags.map((t: string) => ({ stringValue: String(t) }))
          }
        },
        published: { booleanValue: true },
        author: { stringValue: 'VStudyHub AI Mentor' },
        readingTime: { integerValue: String(readingTime) },
        createdAt: { timestampValue: nowIso },
        publishedAt: { timestampValue: nowIso }
      }
    };

    const firestoreWriteRes = await fetch(patchDocUrl, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(firestoreDocumentPayload)
    });

    if (!firestoreWriteRes.ok) {
      const errText = await firestoreWriteRes.text();
      log(`Firestore write failed with status ${firestoreWriteRes.status}: ${errText}`);
      return res.status(500).json({
        success: false,
        error: `Firestore document creation failed (${firestoreWriteRes.status}): ${errText}`,
        logs: executionLogs
      });
    }

    log(`Successfully stored article "${title}" in Firestore blogPosts collection!`);

    return res.status(200).json({
      success: true,
      message: `Successfully generated and published today's article for ${istToday} (IST)`,
      article: {
        title,
        slug,
        category,
        tags,
        readingTime,
        publishedAt: nowIso
      },
      logs: executionLogs
    });

  } catch (fatalError: any) {
    log(`Unhandled exception in /api/generate-daily-post: ${fatalError?.message || fatalError}`);
    return res.status(500).json({
      success: false,
      error: fatalError?.message || 'Internal server error occurred during daily post generation.',
      logs: executionLogs
    });
  }
}