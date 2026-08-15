import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI } from '@google/genai';
import fs from 'fs';
import path from 'path';

// Core curriculum topics covering JEE (Main & Advanced) and NEET syllabi
const CURRICULUM_TOPICS = [
  // Physics
  { subject: 'Physics', topic: 'Rotational Dynamics & Moment of Inertia: Theorems and Rolling Motion' },
  { subject: 'Physics', topic: 'Ray Optics: Total Internal Reflection, Prism Dispersion, and Optical Instruments' },
  { subject: 'Physics', topic: 'Thermodynamics & Heat Engines: Carnot Cycle and First/Second Laws' },
  { subject: 'Physics', topic: 'Current Electricity: Kirchhoff Laws, Wheatstone Bridge, and Potentiometer' },
  { subject: 'Physics', topic: 'Modern Physics: Photoelectric Effect, De Broglie Wavelength, and Bohr Atom' },
  { subject: 'Physics', topic: 'Electrostatics: Gauss Law Applications and Capacitance with Dielectrics' },
  { subject: 'Physics', topic: 'Electromagnetic Induction & AC: Lenz Law, Self/Mutual Inductance, and LCR Resonance' },
  { subject: 'Physics', topic: 'Simple Harmonic Motion & Waves: Damped Oscillations, Resonance, and Doppler Effect' },
  { subject: 'Physics', topic: 'Fluid Mechanics: Bernoulli Theorem, Viscosity, and Surface Tension Applications' },
  
  // Chemistry
  { subject: 'Chemistry', topic: 'Organic Reaction Mechanisms: Electrophilic Addition to Alkenes and Alkynes' },
  { subject: 'Chemistry', topic: 'Aldehydes, Ketones & Carboxylic Acids: Aldol, Cannizzaro, and Nucleophilic Additions' },
  { subject: 'Chemistry', topic: 'Chemical & Ionic Equilibrium: Le Chatelier Principle, pH, and Buffer Solutions' },
  { subject: 'Chemistry', topic: 'Chemical Kinetics: Rate Laws, Arrhenius Equation, and Activation Energy' },
  { subject: 'Chemistry', topic: 'Coordination Compounds: Crystal Field Theory (CFT) and Isomerism' },
  { subject: 'Chemistry', topic: 'Electrochemistry: Nernst Equation, Kohlrausch Law, and Fuel Cells' },
  { subject: 'Chemistry', topic: 'Thermodynamics & Thermochemistry: Gibbs Free Energy, Spontaneity, and Hess Law' },
  { subject: 'Chemistry', topic: 'p-Block & d-Block Elements: High-Yield Trends, Anomalous Behaviors, and NCERT Reactions' },
  { subject: 'Chemistry', topic: 'Solutions & Colligative Properties: Raoult Law, Van t Hoff Factor, and Osmotic Pressure' },
  
  // Mathematics (JEE Focus)
  { subject: 'Mathematics', topic: 'Definite Integrals: Properties, King Rule, and Area Under Curves' },
  { subject: 'Mathematics', topic: 'Differential Equations: Variable Separable, Homogeneous, and Linear DE Formats' },
  { subject: 'Mathematics', topic: 'Vectors & 3D Geometry: Dot/Cross Products, Shortest Distance, and Plane Equations' },
  { subject: 'Mathematics', topic: 'Matrices & Determinants: System of Linear Equations, Adjoint, and Inverse' },
  { subject: 'Mathematics', topic: 'Complex Numbers: De Moivre Theorem, Geometry of Complex Numbers, and Roots of Unity' },
  { subject: 'Mathematics', topic: 'Application of Derivatives: Tangents, Normals, and Maxima/Minima Optimization' },
  { subject: 'Mathematics', topic: 'Coordinate Geometry: Conic Sections (Parabola, Ellipse, Hyperbola) Standard Tangents' },
  { subject: 'Mathematics', topic: 'Probability & Binomial Theorem: Conditional Probability, Bayes Theorem, and General Terms' },
  
  // Biology (NEET Focus)
  { subject: 'Biology', topic: 'Molecular Basis of Inheritance: DNA Replication, Transcription, and Genetic Code' },
  { subject: 'Biology', topic: 'Human Physiology: Endocrine System, Hormonal Feedback, and Chemical Coordination' },
  { subject: 'Biology', topic: 'Plant Physiology: Photosynthesis in Higher Plants (C3, C4, CAM Pathways)' },
  { subject: 'Biology', topic: 'Cell Cycle & Cell Division: Detailed Stages of Mitosis and Meiosis Comparison' },
  { subject: 'Biology', topic: 'Biotechnology: Recombinant DNA Technology, PCR, and Transgenic Applications' },
  { subject: 'Biology', topic: 'Ecology & Biodiversity: Ecosystem Dynamics, Nutrient Cycles, and Conservation Strategies' }
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
    const finalTopic = requestedTopic || `${chosenTopicObj.topic} (Daily Revision for JEE & NEET)`;
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

    const prompt = `You are a legendary Senior Academic Master Faculty and Chief Curriculum Mentor for India's premier entrance exams: JEE Main, JEE Advanced, and NEET.

Write a complete, highly comprehensive, rigorous, and authentic educational article (EXACTLY 1,200 to 1,800 words) on the topic:
"${finalTopic}"

TARGET AUDIENCE: Serious aspirants aiming for Top 500 AIR in JEE 2026/2027 and 700+ in NEET 2026/2027.

MANDATORY STRUCTURE & REQUIREMENTS:
1. TITLE: Catchy, authoritative, high-ranking SEO title with the subject and exam tags.
2. EXCERPT: 2-3 sentence engaging summary highlighting key concepts and why this chapter holds high weightage.
3. IN-DEPTH CONCEPTUAL THEORY:
   - Deep explanation of the core principles aligned with the NCERT Class 11/12 textbook syllabus.
   - Comprehensive derivations, physical meaning, and mathematical modeling.
   - All formulas MUST be properly formatted in clean LaTeX:
     - Inline math enclosed in single dollar signs: $E = h\\nu$ or $I = \\frac{1}{2} M R^2$.
     - Display equations enclosed in double dollar signs: $$\\int_{0}^{\\pi/2} \\ln(\\sin x) dx = -\\frac{\\pi}{2} \\ln 2$$.
4. EXAM-WINNING SHORTCUTS & MNEMONICS:
   - Speed techniques, dimensional analysis tricks, and symmetry shortcuts.
5. COMMON TRAPS & FREQUENT MISTAKES (PITFALLS):
   - 3 specific subtle traps where students lose marks in JEE/NEET.
6. 3 FULLY WORKED PRACTICE PROBLEMS:
   - Problem 1: JEE Main / NEET Standard Numerical (with step-by-step calculation & final answer).
   - Problem 2: JEE Advanced / High-Order NEET Multi-Concept Problem (with detailed step-by-step breakdown).
   - Problem 3: Conceptual / Assertion-Reason Type Question (with clear logical reasoning).
7. SUMMARY FORMULA CHEAT-SHEET TABLE:
   - Markdown table summarizing the fundamental equations, SI units, and conditions of applicability.

Return ONLY a valid JSON object matching this schema:
{
  "title": "String (Article Title)",
  "excerpt": "String (2-3 sentences overview)",
  "content_md": "String (Complete Markdown text with LaTeX equations, headings, practice problems, and tables)",
  "category": "Physics | Chemistry | Mathematics | Biology",
  "tags": ["Array", "of", "4-6", "relevant", "tags"],
  "reading_minutes": Number (Estimated reading time between 6 and 10)
}`;

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
    const excerpt = generatedData.excerpt || `Comprehensive JEE & NEET guide for ${finalTopic}.`;
    const content = generatedData.content_md;
    const category = generatedData.category || defaultCategory;
    const readingTime = Number(generatedData.reading_minutes) || Math.max(6, Math.ceil(content.split(/\s+/).length / 200));
    const tags = Array.isArray(generatedData.tags) && generatedData.tags.length > 0
      ? generatedData.tags
      : [category, 'JEE Main', 'NEET', 'NCERT Revision', 'Formula Sheet'];

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