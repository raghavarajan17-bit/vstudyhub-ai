import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

export interface EnglishCoachRequest {
  mode?: "Speaking" | "Writing" | "Interview" | "General";
  text: string;
  target?: string;
  level?: string;
}

export interface EnglishCoachResponse {
  corrected: string;
  score: number;
  strengths: string[];
  improvements: string[];
  betterVersion: string;
  feedback: string;
}

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed",
    });
  }

  try {
    const body: EnglishCoachRequest = req.body || {};

    const text = String(body.text || "").trim();
    const mode = body.mode || "General";
    const target = body.target || "International English";
    const level = body.level || "Intermediate";

    if (!text) {
      return res.status(400).json({
        error: "Please provide English text to evaluate.",
      });
    }

    const prompt = `
You are VStudyHub AI English Coach.

Evaluate the user's English and help them improve for global communication.

Mode: ${mode}
Target: ${target}
Level: ${level}

User response:
"${text}"

Return ONLY valid JSON with exactly these fields:

{
  "corrected": "corrected version of the user's response",
  "score": 0,
  "strengths": ["strength 1", "strength 2", "strength 3"],
  "improvements": ["improvement 1", "improvement 2", "improvement 3"],
  "betterVersion": "a natural, professional and fluent version",
  "feedback": "short encouraging coaching feedback"
}

Scoring:
- 90-100 = Excellent
- 75-89 = Good
- 60-74 = Developing
- below 60 = Needs improvement

Focus on:
1. Grammar
2. Vocabulary
3. Clarity
4. Natural English
5. Professional/global communication

Do not be unnecessarily harsh.
Give practical feedback suitable for a non-native English speaker.
`;

    const result = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
      config: {
        temperature: 0.3,
        responseMimeType: "application/json",
      },
    });

    const raw = result.text || "";

    let parsed: EnglishCoachResponse;

    try {
      parsed = JSON.parse(raw);
    } catch {
      return res.status(502).json({
        error: "AI returned an invalid response.",
      });
    }

    return res.status(200).json({
      success: true,
      data: parsed,
    });
  } catch (error: any) {
    console.error("AI English Coach error:", error);

    return res.status(500).json({
      error: "English Coach is temporarily unavailable.",
      details:
        process.env.NODE_ENV === "development"
          ? error?.message
          : undefined,
    });
  }
}