export type InterviewLevel =
| 'entry'
| 'mid-1-3'
| 'mid'
| 'senior'
| 'lead';

export type InterviewCategory =
| 'general'
| 'behavioral'
| 'technical'
| 'english-fluency'
| 'hr';

export type InterviewTrack =
| 'job-interview'
| 'behavioral-hr'
| 'technical-pro'
| 'english-interview';

export interface InterviewSetup {
targetRole: string;
experienceLevel: InterviewLevel;
country: string;
interviewType: InterviewCategory;
jobDescription: string;
track: InterviewTrack;
}

export interface InterviewHistoryItem {
questionNumber: number;
question: string;
userAnswer: string;
category?: InterviewCategory;
}

export interface InterviewNextRequest {
setup: InterviewSetup;
currentQuestionNumber: number;
currentUserAnswer: string;
conversationHistory: InterviewHistoryItem[];
}

export interface InterviewNextResponse {
question: string;
questionNumber?: number;
category?: InterviewCategory;
interviewerReaction?: string;
isComplete?: boolean;
}

export interface InterviewAssessmentRequest {
setup: InterviewSetup;
conversationHistory: InterviewHistoryItem[];
}

/* -------------------------------------------------------
Assessment Types
------------------------------------------------------- */

export interface DimensionScores {
technicalAccuracy?: number;
communicationClarity?: number;
problemSolving?: number;
englishFluency?: number;
vocabularyGrammar?: number;
structureSTAR?: number;
confidenceTone?: number;
roleAlignment?: number;

[key: string]: number | undefined;
}

export interface InterviewScores {
relevance: number;
structure: number;
clarity: number;
fluency: number;
grammar: number;
vocabulary: number;
professionalCommunication: number;
confidenceStyle: number;
}

export interface ImprovementItem {
title?: string;
description?: string;
area?: string;
issue?: string;
recommendation?: string;
example?: string;
priority?: string;
}

export interface QuestionAnalysisFeedback {
questionNumber: number;
question?: string;
userAnswer?: string;
score: number;
feedback: string;
keyFeedback?: string;
strengths?: string[];
improvements?: string[];
category?: InterviewCategory;
}

export interface EnglishDiagnostics {
fluencyLevel?: string;
frequentGrammarMistakes?: string[];
vocabularyEnhancements?: Array<{
original: string;
suggested: string;
context: string;
}>;
}

export interface WrittenEnglishDiagnostics extends EnglishDiagnostics {}

export interface EnglishFeedback {
fluencyObservation: string;
grammarObservation: string;
vocabularyObservation: string;
clarityObservation: string;
}

export interface TopImprovement {
title: string;
description: string;
example: string;
priority: string;
}

export interface QuestionFeedback {
questionNumber: number;
score: number;
feedback: string;
strengths: string[];
improvements: string[];
}

export interface InterviewAssessmentResponse {
overallScore: number;
readinessLevel: string;

scores: InterviewScores;

strongestArea: string;
strongestAreaExplanation: string;

biggestWeakness: string;
biggestWeaknessExplanation: string;

topImprovements: TopImprovement[];

englishFeedback: EnglishFeedback;

questionFeedback: QuestionFeedback[];

/* Backward-compatible optional fields */
dimensionScores?: DimensionScores;

top3Improvements?: string[] | ImprovementItem[];

englishDiagnostics?: EnglishDiagnostics;

questionEvaluations?: QuestionAnalysisFeedback[];
}
