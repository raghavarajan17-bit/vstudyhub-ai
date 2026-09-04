import { GoogleGenAI, Type } from '@google/genai';
import { CareerAnalysis, CareerAnalysisRequest } from '../../src/types/careerCoach.types.js';
import { normalizeCareerAnalysis } from '../../src/utils/careerCoachNormalization.js';
import { classifyGeminiError, formatAiLog } from '../../src/utils/aiErrorClassification.js';
import { AiErrorDetail } from '../../src/types/aiError.types.js';

export interface CareerCoachServiceResult {
  success: boolean;
  data?: CareerAnalysis;
  error?: AiErrorDetail;
}

/**
 * Isolated AI Provider interface so alternative providers (Anthropic, OpenAI, etc.)
 * can be plugged in seamlessly in the future.
 */
export interface CareerAnalysisProvider {
  analyze(request: CareerAnalysisRequest, apiKey: string, requestId: string): Promise<CareerAnalysis>;
}

/**
 * Gemini implementation using @google/genai
 * Sends exactly ONE consolidated request with strict JSON schema.
 */
export class GeminiCareerAnalysisProvider implements CareerAnalysisProvider {
  async analyze(request: CareerAnalysisRequest, apiKey: string, requestId: string): Promise<CareerAnalysis> {
    const ai = new GoogleGenAI({ apiKey });

    const systemInstruction = `You are a world-class Executive Career Strategist, Technical Recruiter, and ATS (Applicant Tracking System) Specialist.
Your task is to conduct an in-depth, realistic, and highly actionable career readiness and resume assessment.
Analyze the candidate's resume against their target job role (and optional job description).
Evaluate:
1. ATS compatibility (keywords, structure, readability, measurable achievements).
2. Direct role alignment, demonstrated core proficiencies, and experience depth.
3. Concrete skill gaps and high-leverage recommendations.
4. Specific, line-level resume improvements using the Google XYZ formula ("Accomplished X as measured by Y, by doing Z").
5. Top interview questions they will likely encounter.
6. A realistic 4-week (30-day) career improvement roadmap.

Be rigorous, constructive, and realistic. Avoid generic fluff. Do not award fake 100/100 scores unless genuinely world-class. Provide realistic 0-100 scores.`;

    const userPrompt = `TARGET JOB ROLE:
${request.targetRole}

${request.jobDescription ? `TARGET JOB DESCRIPTION / REQUIREMENTS:\n${request.jobDescription}\n` : ''}
CANDIDATE RESUME / EXPERIENCE PROFILE:
${request.resumeText}

Analyze this candidate and return a single valid JSON object strictly adhering to the schema.`;

    // Timeout guard: 45 seconds max for comprehensive evaluation
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => {
        const timeoutErr = new Error('Gemini career analysis request timed out');
        (timeoutErr as any).code = 'TIMEOUT';
        reject(timeoutErr);
      }, 45000);
    });

    const apiPromise = ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: userPrompt,
      config: {
        systemInstruction,
        temperature: 0.2,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            overallScore: {
              type: Type.INTEGER,
              description: 'Overall Career Readiness Score (0-100)',
            },
            atsScore: {
              type: Type.INTEGER,
              description: 'ATS Compatibility & Keyword Parse Score (0-100)',
            },
            jobMatchScore: {
              type: Type.INTEGER,
              description: 'Alignment between candidate resume and target role (0-100)',
            },
            strengths: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'Key candidate strengths and proven capabilities (3 to 6 items)',
            },
            weaknesses: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'Identified gaps, missing experience, or areas of concern (3 to 6 items)',
            },
            matchedSkills: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'Relevant skills currently evident in the resume (4 to 10 items)',
            },
            missingSkills: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'High-priority skills needed for the role not found in resume (3 to 8 items)',
            },
            recommendedSkills: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'Recommended technologies or certifications to learn (3 to 6 items)',
            },
            resumeImprovements: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  description: { type: Type.STRING },
                  priority: { type: Type.STRING, enum: ['high', 'medium', 'low'] },
                },
                required: ['title', 'description', 'priority'],
              },
              description: 'Specific actionable line-level resume improvements with priority',
            },
            interviewTopics: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'Key interview questions or technical topics to master (3 to 6 items)',
            },
            actionPlan: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  day: { type: Type.INTEGER },
                  action: { type: Type.STRING },
                },
                required: ['day', 'action'],
              },
              description: 'Concrete day-by-day career improvement action plan (e.g., day 1, 7, 14, 21, 30)',
            },
            roleFitExplanation: {
              type: Type.STRING,
              description: 'In-depth explanation of how well candidate fits target role and next steps',
            },
            summary: {
              type: Type.STRING,
              description: 'Comprehensive executive summary of candidate standing (2-4 sentences)',
            },
          },
          required: [
            'overallScore',
            'jobMatchScore',
            'atsScore',
            'summary',
            'strengths',
            'weaknesses',
            'matchedSkills',
            'missingSkills',
            'recommendedSkills',
            'resumeImprovements',
            'interviewTopics',
            'actionPlan',
            'roleFitExplanation',
          ],
        },
      },
    });

    const response = await Promise.race([apiPromise, timeoutPromise]);
    const responseText = response.text || '';

    if (!responseText.trim()) {
      throw new Error('Empty response received from AI model');
    }

    let parsed: any;
    try {
      parsed = JSON.parse(responseText.trim());
    } catch {
      // Attempt to extract JSON from code fences if present
      const jsonMatch = responseText.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      if (jsonMatch && jsonMatch[1]) {
        parsed = JSON.parse(jsonMatch[1]);
      } else {
        throw new Error('Failed to parse model output as JSON');
      }
    }

    return normalizeCareerAnalysis(parsed, request.targetRole);
  }
}

// Default provider instance
const defaultProvider: CareerAnalysisProvider = new GeminiCareerAnalysisProvider();

/**
 * Validates and sanitizes the incoming request body.
 */
export function validateCareerRequest(body: any): {
  valid: boolean;
  error?: string;
  sanitized?: CareerAnalysisRequest;
} {
  if (!body || typeof body !== 'object') {
    return { valid: false, error: 'Request body must be a JSON object.' };
  }

  const targetRole = typeof body.targetRole === 'string' ? body.targetRole.trim() : '';
  if (!targetRole) {
    return { valid: false, error: 'Target job role is required.' };
  }
  if (targetRole.length < 2 || targetRole.length > 150) {
    return { valid: false, error: 'Target job role must be between 2 and 150 characters.' };
  }

  const resumeText = typeof body.resumeText === 'string' ? body.resumeText.trim() : '';
  if (!resumeText) {
    return { valid: false, error: 'Resume content is required. Please paste or type your resume.' };
  }
  if (resumeText.length < 20) {
    return { valid: false, error: 'Resume text is too short. Please provide at least 20 characters of experience or skills.' };
  }
  if (resumeText.length > 30000) {
    return { valid: false, error: 'Resume text exceeds maximum limit of 30,000 characters.' };
  }

  let jobDescription: string | undefined = undefined;
  if (typeof body.jobDescription === 'string' && body.jobDescription.trim().length > 0) {
    const trimmed = body.jobDescription.trim();
    if (trimmed.length > 20000) {
      return { valid: false, error: 'Job description exceeds maximum limit of 20,000 characters.' };
    }
    jobDescription = trimmed;
  }

  return {
    valid: true,
    sanitized: {
      targetRole,
      resumeText,
      jobDescription,
    },
  };
}

/**
 * Executes a career analysis with full error sanitization and data preservation guarantees.
 * Exactly ONE AI call is made.
 */
export async function executeCareerAnalysis(
  request: CareerAnalysisRequest,
  apiKey: string,
  requestId: string,
  provider: CareerAnalysisProvider = defaultProvider
): Promise<CareerCoachServiceResult> {
  try {
    const analysis = await provider.analyze(request, apiKey, requestId);
    return {
      success: true,
      data: analysis,
    };
  } catch (err: any) {
    const classified = classifyGeminiError(err, requestId);
    formatAiLog('/api/ai/career-coach', classified.code, {
      requestId,
      status: classified.httpStatus,
      retryAfter: classified.retryAfterSeconds,
      reason: classified.userMessage,
    });

    return {
      success: false,
      error: classified.detail,
    };
  }
}

/**
 * Express Request Handler for POST /api/ai/career-coach
 */
export default async function careerCoachHandler(req: any, res: any) {
  const requestId = `req_career_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  res.setHeader('x-request-id', requestId);

  // Set CORS and JSON headers
  res.setHeader('Content-Type', 'application/json');

  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: {
        code: 'CLIENT_ERROR',
        message: 'Method not allowed. Use POST.',
        retryable: false,
        requestId,
      },
    });
  }

  // Developer / Testing simulation support (safe testing of 429, quota, 500 without burning credits)
  const simHeader = req.headers['x-simulate-error'] || req.query?.simulateError;
  if (simHeader) {
    const simLower = String(simHeader).toLowerCase();
    if (simLower === '429' || simLower === 'rate_limited') {
      return res.status(429).json({
        success: false,
        error: {
          code: 'RATE_LIMITED',
          message: 'AI analysis is temporarily unavailable because the AI service is busy or has reached its current limit. Please try again shortly.',
          retryable: true,
          retryAfterSeconds: 4,
          requestId,
        },
      });
    }
    if (simLower === 'quota_exhausted' || simLower === 'quota') {
      return res.status(429).json({
        success: false,
        error: {
          code: 'QUOTA_EXHAUSTED',
          message: 'AI analysis is temporarily unavailable because the AI service is busy or has reached its current limit. Please try again shortly.',
          retryable: false,
          requestId,
        },
      });
    }
    if (simLower === '500' || simLower === 'temporary_error') {
      return res.status(500).json({
        success: false,
        error: {
          code: 'TEMPORARY_ERROR',
          message: 'AI analysis is temporarily unavailable. Your information is safe. Please try again shortly.',
          retryable: true,
          retryAfterSeconds: 3,
          requestId,
        },
      });
    }
    if (simLower === 'malformed') {
      return res.status(500).json({
        success: false,
        error: {
          code: 'AI_RESPONSE_INVALID',
          message: "We couldn't complete the analysis this time. Your information has been preserved. Please try again.",
          retryable: true,
          requestId,
        },
      });
    }
  }

  // 1. Validate Input
  const validation = validateCareerRequest(req.body);
  if (!validation.valid || !validation.sanitized) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'INVALID_INPUT',
        message: validation.error || 'Please check your inputs and try again.',
        retryable: false,
        requestId,
      },
    });
  }

  // 2. Validate API Key server-side
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({
      success: false,
      error: {
        code: 'CONFIGURATION_ERROR',
        message: 'AI analysis is temporarily unavailable. Please try again later.',
        retryable: false,
        requestId,
      },
    });
  }

  // 3. Execute exactly ONE consolidated AI call
  const result = await executeCareerAnalysis(validation.sanitized, apiKey, requestId);

  if (result.success) {
    return res.status(200).json({
      success: true,
      data: result.data,
      requestId,
    });
  } else {
    const status =
      result.error?.code === 'RATE_LIMITED' || result.error?.code === 'QUOTA_EXHAUSTED'
        ? 429
        : result.error?.code === 'CLIENT_ERROR'
        ? 400
        : 500;

    return res.status(status).json({
      success: false,
      error: result.error,
    });
  }
}
