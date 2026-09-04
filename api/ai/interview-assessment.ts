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
  "readinessLevel": "Needs More Practice",
  "scores": {
    "relevance": 0,
    "structure": 0,
    "clarity": 0,
    "fluency": 0,
    "grammar": 0,
    "vocabulary": 0,
    "professionalCommunication": 0,
    "confidenceStyle": 0
  },
  "strongestArea": "string",
  "strongestAreaExplanation": "string",
  "biggestWeakness": "string",
  "biggestWeaknessExplanation": "string",
  "topImprovements": [
    {
      "title": "string",
      "description": "string",
      "example": "string",
      "priority": "High"
    }
  ],
  "englishFeedback": {
    "fluencyObservation": "string",
    "grammarObservation": "string",
    "vocabularyObservation": "string",
    "clarityObservation": "string"
  },
  "questionFeedback": [
    {
      "questionNumber": 1,
      "score": 0,
      "feedback": "string",
      "strengths": ["string"],
      "improvements": ["string"]
    }
  ]
}

Scoring rules:
- Every score must be between 0 and 100.
- OverallScore should reflect the candidate's actual interview readiness.
- Do not inflate scores.
- Consider the candidate's target role and experience level.
- Assess relevance to the question.
- Assess answer structure and organization.
- Assess communication clarity.
- Assess English fluency, grammar, and vocabulary.
- Assess professional communication and confidence/style.
- For behavioral answers, consider STAR structure.
- For technical answers, assess technical accuracy when relevant.
- For English interview tracks, give additional importance to fluency, vocabulary, grammar, clarity, and professional tone.
- Give specific actionable feedback.
- Do not invent experience that the candidate did not mention.
- Provide feedback for every interview question in the transcript.
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

    // ---------------------------------------------------------
    // Defensive normalization
    // Ensures the frontend always receives the expected schema.
    // ---------------------------------------------------------

    assessment.overallScore = Number(assessment.overallScore) || 0;

    assessment.readinessLevel =
      assessment.readinessLevel || "Needs More Practice";

    assessment.scores = assessment.scores || {};

    const scoreKeys = [
      "relevance",
      "structure",
      "clarity",
      "fluency",
      "grammar",
      "vocabulary",
      "professionalCommunication",
      "confidenceStyle",
    ];

    for (const key of scoreKeys) {
      assessment.scores[key] = Number(assessment.scores[key]) || 0;

      if (assessment.scores[key] < 0) {
        assessment.scores[key] = 0;
      }

      if (assessment.scores[key] > 100) {
        assessment.scores[key] = 100;
      }
    }

    assessment.strongestArea =
      assessment.strongestArea || "Communication";

    assessment.strongestAreaExplanation =
      assessment.strongestAreaExplanation ||
      "The candidate demonstrated useful communication strengths during the interview.";

    assessment.biggestWeakness =
      assessment.biggestWeakness ||
      "Answer structure and specificity";

    assessment.biggestWeaknessExplanation =
      assessment.biggestWeaknessExplanation ||
      "Answers can be improved by using clearer structure and more specific examples.";

    assessment.topImprovements = Array.isArray(
      assessment.topImprovements
    )
      ? assessment.topImprovements
      : [];

    assessment.englishFeedback =
      assessment.englishFeedback || {};

    assessment.englishFeedback.fluencyObservation =
      assessment.englishFeedback.fluencyObservation ||
      "Continue practicing clear and natural spoken responses.";

    assessment.englishFeedback.grammarObservation =
      assessment.englishFeedback.grammarObservation ||
      "Review recurring grammar patterns and sentence construction.";

    assessment.englishFeedback.vocabularyObservation =
      assessment.englishFeedback.vocabularyObservation ||
      "Use precise, professional vocabulary relevant to the target role.";

    assessment.englishFeedback.clarityObservation =
      assessment.englishFeedback.clarityObservation ||
      "Organize answers into clear points with concise explanations.";

    assessment.questionFeedback = Array.isArray(
      assessment.questionFeedback
    )
      ? assessment.questionFeedback
      : [];

    // ---------------------------------------------------------
    // Keep backward-compatible fields for existing code.
    // ---------------------------------------------------------

    assessment.dimensionScores =
      assessment.dimensionScores || {};

    assessment.top3Improvements =
      assessment.top3Improvements || assessment.topImprovements;

    assessment.questionEvaluations =
      assessment.questionEvaluations || assessment.questionFeedback;

    assessment.englishDiagnostics =
      assessment.englishDiagnostics || {};

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