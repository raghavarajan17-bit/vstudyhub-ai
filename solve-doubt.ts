import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }

  try {
    let body = req.body;
    if (typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch (_) {}
    }
    const { question, subject, exam, mode = 'step_by_step', contextTopic, conversationHistory = [] } = body || {};

    if (!question) {
      return res.status(400).json({ error: 'Question text is required.' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({
        error: 'GEMINI_API_KEY environment variable is missing on server. Please configure it in Settings > Secrets.'
      });
    }

    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });

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
3. Keep tone encouraging, energetic, authoritative, and crystal-clear.`;

    const historyText = Array.isArray(conversationHistory) && conversationHistory.length > 0
      ? `\nPrevious Conversation History:\n` + conversationHistory.slice(-4).map((m: any) => `${m.sender === 'user' ? 'Student' : 'VStudy Tutor'}: ${m.text}`).join("\n")
      : "";

    const prompt = `Student Target Exam: ${exam || "JEE/NEET"}
Subject: ${subject || "General Science"}
${contextTopic ? `Context Chapter/Topic: ${contextTopic}` : ""}
${historyText}

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

    const solutionText = response.text || "Could not generate solution. Please rephrase your query.";

    return res.status(200).json({
      success: true,
      solutionText,
      modeUsed: mode,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("Error in serverless /api/ai/solve-doubt:", error);
    return res.status(500).json({
      error: error?.message || "An error occurred while communicating with Gemini AI."
    });
  }
}
