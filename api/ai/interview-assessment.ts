import type { VercelRequest, VercelResponse } from "@vercel/node";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed. Use POST.",
    });
  }

  try {
    const { setup, conversationHistory = [] } = req.body || {};

    if (!setup?.targetRole) {
      return res.status(400).json({
        error: "Interview setup and target role are required.",
      });
    }

    if (
      !Array.isArray(conversationHistory) ||
      conversationHistory.length === 0
    ) {
      return res.status(400).json({
        error: "Interview conversation history is required.",
      });
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
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

    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
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
        error:
          "The AI returned an invalid assessment format. Please try again.",
      });
    }

    assessment.overallScore = Number(assessment.overallScore) || 0;

    assessment.readinessLevel =
      assessment.readinessLevel || "Needs More Practice";

    assessment.dimensionScores =
      assessment.dimensionScores || {};

    assessment.strongestArea =
      assessment.strongestArea || "Communication";

    assessment.biggestOpportunity =
      assessment.biggestOpportunity ||
      "Answer structure and specificity";

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

    return res.status(200).json(assessment);
  } catch (error: any) {
    console.error(
      "Error in /api/ai/interview-assessment:",
      error
    );

    return res.status(500).json({
      error:
        error?.message ||
        "An error occurred while generating the interview assessment.",
    });
  }
}