import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";
import { MOCK_CHAPTERS, MOCK_FORMULAS, MOCK_FLASHCARDS, MOCK_NOTES, MOCK_QUIZZES } from "./src/data/mockData";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "10mb" }));

// Initialize Gemini Client (Server-Side Only)
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || "",
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build",
    },
  },
});

// API Routes
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", app: "VStudyHub - JEE & NEET Prep Platform" });
});

// Search API across all content
app.get("/api/search", (req, res) => {
  const query = (req.query.q as string || "").toLowerCase().trim();
  if (!query) {
    return res.json({ notes: [], formulas: [], flashcards: [], chapters: [] });
  }

  const matchingNotes = MOCK_NOTES.filter(n =>
    n.title.toLowerCase().includes(query) ||
    n.overview.toLowerCase().includes(query)
  );

  const matchingFormulas = MOCK_FORMULAS.filter(f =>
    f.title.toLowerCase().includes(query) ||
    f.description.toLowerCase().includes(query) ||
    f.chapterName.toLowerCase().includes(query) ||
    f.category.toLowerCase().includes(query)
  );

  const matchingFlashcards = MOCK_FLASHCARDS.filter(c =>
    c.question.toLowerCase().includes(query) ||
    c.answer.toLowerCase().includes(query) ||
    c.tags.some(t => t.toLowerCase().includes(query))
  );

  const matchingChapters = MOCK_CHAPTERS.filter(ch =>
    ch.name.toLowerCase().includes(query) ||
    ch.description.toLowerCase().includes(query)
  );

  res.json({
    notes: matchingNotes,
    formulas: matchingFormulas,
    flashcards: matchingFlashcards,
    chapters: matchingChapters,
  });
});

// AI Doubt Assistant Endpoint
app.post("/api/ai/solve-doubt", async (req, res) => {
  try {
    const { question, subject, exam, mode = 'step_by_step', contextTopic, conversationHistory = [] } = req.body;

    if (!question) {
      return res.status(400).json({ error: "Question text is required" });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({
        error: "GEMINI_API_KEY is missing. Please set it in Settings > Secrets."
      });
    }

    // Context retrieval from VStudyHub curriculum
    const qLower = question.toLowerCase();
    const relevantNotes = MOCK_NOTES.filter(n =>
      n.title.toLowerCase().includes(qLower) ||
      n.overview.toLowerCase().includes(qLower) ||
      (subject && n.subjectId === subject)
    ).slice(0, 2);

    const relevantFormulas = MOCK_FORMULAS.filter(f =>
      f.title.toLowerCase().includes(qLower) ||
      f.chapterName.toLowerCase().includes(qLower) ||
      (subject && f.subjectId === subject)
    ).slice(0, 3);

    let contextSnippet = "";
    if (relevantNotes.length > 0) {
      contextSnippet += `\n[VStudyHub Curriculum Reference Notes]:\n` +
        relevantNotes.map(n => `- ${n.title}: ${n.overview}`).join("\n");
    }
    if (relevantFormulas.length > 0) {
      contextSnippet += `\n[Relevant Standard Formulas]:\n` +
        relevantFormulas.map(f => `- ${f.title}: $$${f.latex}$$ (${f.examTips})`).join("\n");
    }

    // Mode-specific persona instructions
    let modeInstruction = "";
    if (mode === "beginner") {
      modeInstruction = `Teaching Mode: BEGINNER EXPLANATION MODE. Use simple real-world analogies, zero confusing jargon, break down every basic variable, and build intuitive understanding before writing math.`;
    } else if (mode === "advanced_jee") {
      modeInstruction = `Teaching Mode: ADVANCED JEE PROBLEM SOLVING MODE (IIT JEE Advanced Level). Focus on high-level multi-concept integration, calculus short-cuts, dimensional elimination tricks, extreme boundary cases, and top 100 AIR strategies.`;
    } else if (mode === "neet_biology") {
      modeInstruction = `Teaching Mode: NEET BIOLOGY & NCERT EXCELLENCE MODE. Cite specific NCERT textbook chapters/concepts, give high-yield mnemonics for memorization, highlight diagrammatic flow, and point out frequent NTA trap options in NEET paper questions.`;
    } else {
      modeInstruction = `Teaching Mode: STEP-BY-STEP METHODICAL TUTOR. Provide logical numbered steps, detailed numerical derivations, clear physical reasoning, and structured bullet points.`;
    }

    const systemInstruction = `You are "VStudy Master Tutor", a legendary IIT-JEE Rank 1 and AIIMS NEET faculty mentor.
Your role is to guide students to peak exam performance in Physics, Chemistry, Mathematics, and Biology.

${modeInstruction}

Guidelines:
1. Always format mathematical and scientific formulas using LaTeX syntax inside $...$ for inline or $$...$$ for block formulas.
2. Structure your response into these sections:
   - 🎯 Concept Core & Intuition
   - 📐 Step-by-Step Solution & Derivation
   - ⚡ Key Formula Extracted ($...$)
   - ⚠️ Common Student Mistake / Exam Trap
   - 📝 2 Similar JEE/NEET Practice Questions (with short answers at the bottom)
3. Incorporate provided VStudyHub curriculum references seamlessly.
4. Keep tone encouraging, energetic, authoritative, and crystal-clear.`;

    // Build multi-turn contents if history exists
    const historyText = Array.isArray(conversationHistory) && conversationHistory.length > 0
      ? `\nPrevious Conversation History:\n` + conversationHistory.slice(-4).map((m: any) => `${m.sender === 'user' ? 'Student' : 'VStudy Tutor'}: ${m.text}`).join("\n")
      : "";

    const prompt = `Student Target Exam: ${exam || "JEE/NEET"}
Subject: ${subject || "General Science"}
${contextTopic ? `Context Chapter/Topic: ${contextTopic}` : ""}
${historyText}
${contextSnippet}

Current Student Question:
"${question}"

Please provide a complete, exam-winning response following your mode instructions and using LaTeX math formatting.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
      config: {
        systemInstruction,
        temperature: 0.2,
      },
    });

    const textOutput = response.text || "Could not generate solution. Please rephrase your query.";

    res.json({
      success: true,
      solutionText: textOutput,
      modeUsed: mode,
      retrievedContextCount: relevantNotes.length + relevantFormulas.length,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("Error in /api/ai/solve-doubt:", error);
    res.status(500).json({
      error: error?.message || "An error occurred while generating the AI solution."
    });
  }
});

// Teacher / Admin endpoints for content management
let dynamicNotesList = [...MOCK_NOTES];
let dynamicFormulasList = [...MOCK_FORMULAS];
let dynamicQuizzesList = [...MOCK_QUIZZES];

app.get("/api/admin/content", (_req, res) => {
  res.json({
    notesCount: dynamicNotesList.length,
    formulasCount: dynamicFormulasList.length,
    quizzesCount: dynamicQuizzesList.length,
    totalStudentsActive: 1420,
    aiDoubtsSolvedToday: 384,
  });
});

app.post("/api/admin/notes", (req, res) => {
  const newNote = req.body;
  if (!newNote.title || !newNote.overview) {
    return res.status(400).json({ error: "Title and overview are required." });
  }
  newNote.id = `note-custom-${Date.now()}`;
  newNote.lastUpdated = new Date().toISOString().split('T')[0];
  dynamicNotesList.unshift(newNote);
  MOCK_NOTES.unshift(newNote);
  res.json({ success: true, note: newNote });
});

app.post("/api/admin/formulas", (req, res) => {
  const newFormula = req.body;
  if (!newFormula.title || !newFormula.latex) {
    return res.status(400).json({ error: "Title and LaTeX are required." });
  }
  newFormula.id = `form-custom-${Date.now()}`;
  dynamicFormulasList.unshift(newFormula);
  MOCK_FORMULAS.unshift(newFormula);
  res.json({ success: true, formula: newFormula });
});

app.post("/api/admin/quizzes", (req, res) => {
  const newQuiz = req.body;
  if (!newQuiz.title || !newQuiz.questions || newQuiz.questions.length === 0) {
    return res.status(400).json({ error: "Quiz title and at least 1 question are required." });
  }
  newQuiz.id = `quiz-custom-${Date.now()}`;
  dynamicQuizzesList.unshift(newQuiz);
  MOCK_QUIZZES.unshift(newQuiz);
  res.json({ success: true, quiz: newQuiz });
});

// AI Practice Quiz Generator
app.post("/api/ai/generate-quiz", async (req, res) => {
  try {
    const { subject, topic, exam, questionCount = 3 } = req.body;

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({
        error: "GEMINI_API_KEY is missing. Please set it in Settings > Secrets."
      });
    }

    const prompt = `Generate a ${questionCount}-question multiple choice practice quiz for ${exam || 'JEE/NEET'} in ${subject || 'Physics'} on the topic: "${topic || 'Core Fundamentals'}".
Make questions match authentic exam difficulty and include LaTeX equations where relevant.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
      config: {
        systemInstruction: "You are an expert exam paper setter for JEE and NEET.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            questions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  questionText: { type: Type.STRING },
                  latex: { type: Type.STRING },
                  options: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                  },
                  correctAnswerIndex: { type: Type.INTEGER },
                  explanation: { type: Type.STRING },
                  difficulty: { type: Type.STRING },
                },
                required: ["questionText", "options", "correctAnswerIndex", "explanation"],
              },
            },
          },
          required: ["title", "questions"],
        },
      },
    });

    const quizData = JSON.parse(response.text || "{}");
    res.json({ success: true, quiz: quizData });
  } catch (error: any) {
    console.error("Error in /api/ai/generate-quiz:", error);
    res.status(500).json({
      error: error?.message || "Failed to generate AI quiz."
    });
  }
});

// AI Formula Explainer
app.post("/api/ai/explain-formula", async (req, res) => {
  try {
    const { formulaTitle, latex, subject } = req.body;

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ error: "GEMINI_API_KEY is missing." });
    }

    const prompt = `Explain the formula "${formulaTitle}" (${latex}) in ${subject}.
Include:
1. Physical/Mathematical Meaning
2. Derivation Outline
3. Units & Dimensions
4. Exam Tricks & Traps`;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
      config: {
        systemInstruction: "Explain scientific formulas clearly with LaTeX math notation.",
      },
    });

    res.json({ success: true, explanation: response.text });
  } catch (error: any) {
    res.status(500).json({ error: error?.message || "Failed to explain formula." });
  }
});

// Serve frontend in dev and prod
async function startServer() {
  const isProduction =
    process.env.NODE_ENV === "production" ||
    (typeof __filename !== "undefined" && __filename.endsWith("server.cjs"));

  if (isProduction) {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));

    app.get("*", (req, res) => {
      if (req.path.startsWith("/api/")) {
        return res.status(404).json({ error: "API route not found" });
      }
      const indexPath = path.join(distPath, "index.html");
      if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
      } else {
        res.status(404).send("App asset files not found in production build");
      }
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start server:", err);
});
