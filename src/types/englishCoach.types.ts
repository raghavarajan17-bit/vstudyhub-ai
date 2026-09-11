export type EnglishCoachMode = 'speaking' | 'conversation' | 'grammar' | 'interview' | 'professional';

export interface EnglishCoachRequest { mode: EnglishCoachMode; text: string; }

export interface EnglishCoachMistake { original: string; corrected: string; explanation: string; }

export interface EnglishCoachResponse { score: number; correctedVersion: string; naturalVersion: string; keyMistakes: EnglishCoachMistake[]; grammarExplanation: string; vocabularySuggestions: string[]; fluencyFeedback: string; careerTip: string; followUpQuestion: string; }

export interface EnglishCoachError { code: string; message: string; }