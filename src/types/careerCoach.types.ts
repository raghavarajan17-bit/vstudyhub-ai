export interface CareerAnalysisRequest {
  resumeText: string;
  targetRole: string;
  jobDescription?: string;
}

export interface ResumeImprovement {
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
}

export interface ActionPlanItem {
  day: number;
  action: string;
}

export interface CareerAnalysis {
  overallScore: number;         // 0-100 normalized
  jobMatchScore: number;        // 0-100 normalized
  atsScore: number;             // 0-100 normalized
  summary: string;
  strengths: string[];
  weaknesses: string[];
  matchedSkills: string[];
  missingSkills: string[];
  recommendedSkills: string[];
  resumeImprovements: ResumeImprovement[];
  interviewTopics: string[];
  actionPlan: ActionPlanItem[];
  roleFitExplanation: string;
  // Compatibility fields
  recommendedActions?: string[];
  thirtyDayPlan?: string[];
}

export interface CareerCoachApiResponse {
  success: boolean;
  data?: CareerAnalysis;
  error?: {
    code: string;
    message: string;
    retryable: boolean;
    retryAfterSeconds?: number;
    requestId?: string;
  };
}
