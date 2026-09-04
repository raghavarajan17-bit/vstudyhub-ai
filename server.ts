import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";
import { MOCK_CHAPTERS, MOCK_FORMULAS, MOCK_FLASHCARDS, MOCK_NOTES, MOCK_QUIZZES } from "./src/data/mockData";
import Stripe from "stripe";
import careerCoachHandler from "./api/ai/career-coach";
dotenv.config();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "");

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "10mb" }));
// Stripe Checkout - VStudyHub AI Coach
app.post("/api/stripe/create-checkout-session", async (req, res) => {
  try {
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [
        {
          price: "price_1UAUqaLeVTia4S5FoMwGT16Q",
          quantity: 1,
        },
      ],
      success_url: `${process.env.APP_URL || "http://localhost:3000"}/?payment=success`,
      cancel_url: `${process.env.APP_URL || "http://localhost:3000"}/?payment=cancelled`,
    });

    res.json({
      success: true,
      url: session.url,
    });
  } catch (error: any) {
    console.error("Stripe Checkout Error:", error);
    res.status(500).json({
      success: false,
      error: error?.message || "Unable to create checkout session.",
    });
  }
});

// Initialize Gemini Client (Server-Side Only)
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || "",
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build",
    },
  },
});
// Stripe Client (Server-Side Only)

const STRIPE_PRICE_ID = "price_1UAUqaLeVTia4S5FoMwGT16Q";

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
   - ?? Concept Core & Intuition
   - ?? Step-by-Step Solution & Derivation
   - ? Key Formula Extracted ($...$)
   - ?? Common Student Mistake / Exam Trap
   - ?? 2 Similar JEE/NEET Practice Questions (with short answers at the bottom)
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

async function startServer() {
// ============================================================
// AI INTERVIEW COACH - NEXT QUESTION
// ============================================================
// AI Career Coach Endpoint
app.post("/api/ai/career-coach", async (req, res) => {
  return careerCoachHandler(req as any, res as any);
});
app.post("/api/ai/interview", async (req, res) => {
  try {
    const {
      setup,
      currentQuestionNumber = 0,
      currentUserAnswer = "",
      conversationHistory = [],
    } = req.body;

    if (!setup?.targetRole) {
      return res.status(400).json({
        error: "Interview setup and target role are required.",
      });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({
        error: "GEMINI_API_KEY is missing.",
      });
    }

    const questionNumber = currentQuestionNumber + 1;

    // Interview is designed as a 5-question session.
    if (questionNumber > 5) {
      return res.json({
        question: "",
        questionNumber: 5,
        category: setup.interviewType || "general",
        interviewerReaction: "Thank you. That completes the interview.",
        isComplete: true,
      });
    }

    const historyText =
      Array.isArray(conversationHistory) && conversationHistory.length > 0
        ? conversationHistory
            .slice(-5)
            .map(
              (item: any) =>
                `Question ${item.questionNumber}: ${item.question}\nStudent Answer: ${item.userAnswer}`
            )
            .join("\n\n")
        : "No previous answers. This is the beginning of the interview.";

    const trackInstructions: Record<string, string> = {
      "job-interview":
        "Focus on realistic job interview questions, background, experience, achievements, and role fit.",
      "behavioral-hr":
        "Focus on behavioral, leadership, teamwork, conflict, ownership, and STAR-method questions.",
      "technical-pro":
        "Focus on technical knowledge, engineering decisions, debugging, architecture, scalability, and problem solving.",
      "english-interview":
        "Focus on professional English communication, clarity, vocabulary, grammar, confidence, and natural interview responses.",
    };

    const trackInstruction =
      trackInstructions[setup.track] ||
      "Focus on realistic professional interview questions.";

    const prompt = `
You are an expert international interview coach conducting a realistic mock interview.

Candidate profile:
- Target role: ${setup.targetRole}
- Experience level: ${setup.experienceLevel}
- Country: ${setup.country}
- Interview type: ${setup.interviewType}
- Interview track: ${setup.track}
- Job description: ${setup.jobDescription || "Not provided"}

${trackInstruction}

This is question ${questionNumber} of 5.

Previous interview:
${historyText}

Current candidate answer:
${currentUserAnswer || "No answer yet. Generate the opening question."}

Rules:
1. Generate exactly ONE interview question.
2. Do not generate multiple questions.
3. Do not provide the answer.
4. Make the question appropriate for the candidate's experience level and target role.
5. Avoid repeating questions already asked.
6. Progress naturally from the previous conversation.
7. For question 1, start with a strong realistic opening question.
8. Questions 2-5 should progressively probe the candidate's experience, reasoning, communication, technical ability, behavioral ability, or role fit.
9. Keep the question concise enough for an interview.
10. Return valid JSON only.

The JSON must have:
{
  "question": "string",
  "questionNumber": number,
  "category": "general | behavioral | technical | english-fluency | hr",
  "interviewerReaction": "brief natural reaction to the previous answer"
}
`;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
      config: {
        temperature: 0.5,
        responseMimeType: "application/json",
      },
    });

    let result: any;

    try {
      result = JSON.parse(response.text || "{}");
    } catch {
      console.error("Invalid JSON returned by interview model:", response.text);

      result = {
        question:
          questionNumber === 1
            ? `Tell me about your experience and how it has prepared you for the ${setup.targetRole} role.`
            : `Can you describe a specific example from your experience that demonstrates your ability to succeed as a ${setup.targetRole}?`,
        questionNumber,
        category: setup.interviewType || "general",
        interviewerReaction:
          currentUserAnswer
            ? "Thank you for that answer. Let's explore this further."
            : undefined,
      };
    }

    res.json({
      question:
        result.question ||
        `Tell me about your experience as a ${setup.targetRole}.`,
      questionNumber: result.questionNumber || questionNumber,
      category: result.category || setup.interviewType || "general",
      interviewerReaction: result.interviewerReaction,
      isComplete: false,
    });
  } catch (error: any) {
    console.error("Error in /api/ai/interview:", error);

    res.status(500).json({
      error:
        error?.message ||
        "An error occurred while generating the interview question.",
    });
  }
});

// ============================================================
// AI INTERVIEW - FINAL ASSESSMENT
// ============================================================
app.post("/api/ai/interview-assessment", async (req, res) => {
  try {
    const { setup, conversationHistory = [] } = req.body;

    if (!setup?.targetRole) {
      return res.status(400).json({
        error: "Interview setup and target role are required.",
      });
    }

    if (!Array.isArray(conversationHistory) || conversationHistory.length === 0) {
      return res.status(400).json({
        error: "Interview conversation history is required.",
      });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({
        error: "GEMINI_API_KEY is missing.",
      });
    }

    const transcript = conversationHistory
      .map(
        (item: any) =>
          `Question ${item.questionNumber} (${item.category || "general"}):
${item.question}

Candidate answer:
${item.userAnswer}`
      )
      .join("\n\n--------------------------------\n\n");

    const prompt = `
You are a senior international interview assessor.

Evaluate the following candidate's mock interview.

Candidate:
- Target role: ${setup.targetRole}
- Experience level: ${setup.experienceLevel}
- Country: ${setup.country}
- Interview type: ${setup.interviewType}
- Track: ${setup.track}

Interview transcript:
${transcript}

Evaluate the candidate fairly and constructively.

Return ONLY valid JSON using this exact structure:

{
  "overallScore": 0,
  "readinessLevel": "string",
  "dimensionScores": {
    "technicalAccuracy": 0,
    "communicationClarity": 0,
    "problemSolving": 0,
    "englishFluency": 0,
    "vocabularyGrammar": 0,
    "structureSTAR": 0,
    "confidenceTone": 0,
    "roleAlignment": 0
  },
  "strongestArea": "string",
  "biggestOpportunity": "string",
  "top3Improvements": [
    {
      "title": "string",
      "area": "string",
      "issue": "string",
      "recommendation": "string",
      "example": "string",
      "priority": "High"
    }
  ],
  "englishDiagnostics": {
    "fluencyLevel": "string",
    "frequentGrammarMistakes": ["string"],
    "vocabularyEnhancements": [
      {
        "original": "string",
        "suggested": "string",
        "context": "string"
      }
    ]
  },
  "questionEvaluations": [
    {
      "questionNumber": 1,
      "question": "string",
      "userAnswer": "string",
      "score": 0,
      "keyFeedback": "string",
      "strengths": ["string"],
      "improvements": ["string"],
      "category": "general"
    }
  ]
}

Scoring rules:
- Every score must be between 0 and 100.
- OverallScore should reflect the candidate's actual interview readiness.
- Do not inflate scores.
- Consider the candidate's target role and experience level.
- Assess technical accuracy only when technical content is relevant.
- Assess communication, clarity, structure, confidence, and role alignment.
- For behavioral answers, consider STAR structure.
- For English interview tracks, give additional importance to fluency, vocabulary, grammar, and professional tone.
- Give specific actionable feedback.
- Do not invent experience that the candidate did not mention.
`;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
      config: {
        temperature: 0.2,
        responseMimeType: "application/json",
      },
    });

    let assessment: any;

    try {
      assessment = JSON.parse(response.text || "{}");
    } catch {
      console.error(
        "Invalid JSON returned by interview assessment model:",
        response.text
      );

      return res.status(500).json({
        error: "The AI returned an invalid assessment format. Please try again.",
      });
    }

    // Defensive defaults so the frontend always receives the expected shape.
    assessment.overallScore = Number(assessment.overallScore) || 0;
    assessment.readinessLevel =
      assessment.readinessLevel || "Needs More Practice";

    assessment.dimensionScores = assessment.dimensionScores || {};

    assessment.strongestArea =
      assessment.strongestArea || "Communication";

    assessment.biggestOpportunity =
      assessment.biggestOpportunity || "Answer structure and specificity";

    assessment.top3Improvements = Array.isArray(
      assessment.top3Improvements
    )
      ? assessment.top3Improvements
      : [];

    assessment.questionEvaluations = Array.isArray(
      assessment.questionEvaluations
    )
      ? assessment.questionEvaluations
      : [];

    res.json(assessment);
  } catch (error: any) {
    console.error(
      "Error in /api/ai/interview-assessment:",
      error
    );

    res.status(500).json({
      error:
        error?.message ||
        "An error occurred while generating the interview assessment.",
    });
  }
});
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

