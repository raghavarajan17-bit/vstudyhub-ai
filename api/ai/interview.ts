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
    const {
      setup,
      currentQuestionNumber = 0,
      currentUserAnswer = "",
      conversationHistory = [],
    } = req.body || {};

    if (!setup?.targetRole) {
      return res.status(400).json({
        error: "Interview setup and target role are required.",
      });
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return res.status(500).json({
        error: "GEMINI_API_KEY is missing.",
      });
    }

    const questionNumber = Number(currentQuestionNumber) + 1;

    if (questionNumber > 5) {
      return res.status(200).json({
        question: "",
        questionNumber: 5,
        category: setup.interviewType || "general",
        interviewerReaction:
          "Thank you. That completes the interview.",
        isComplete: true,
      });
    }

    const historyText =
      Array.isArray(conversationHistory) &&
      conversationHistory.length > 0
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

Return exactly this JSON structure:
{
  "question": "string",
  "questionNumber": ${questionNumber},
  "category": "general | behavioral | technical | english-fluency | hr",
  "interviewerReaction": "brief natural reaction to the previous answer"
}
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
      result = {
        question:
          questionNumber === 1
            ? `Tell me about your experience and how it has prepared you for the ${setup.targetRole} role.`
            : `Can you describe a specific example from your experience that demonstrates your ability to succeed as a ${setup.targetRole}?`,
        questionNumber,
        category: setup.interviewType || "general",
        interviewerReaction: currentUserAnswer
          ? "Thank you for that answer. Let's explore this further."
          : "Welcome! Let's begin.",
      };
    }

    return res.status(200).json({
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

    return res.status(500).json({
      error:
        error?.message ||
        "An error occurred while generating the interview question.",
    });
  }
}