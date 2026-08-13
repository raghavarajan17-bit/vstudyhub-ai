export type ExamType = 'JEE' | 'NEET' | 'ALL';

export type SubjectId = 'physics' | 'chemistry' | 'biology' | 'mathematics';

export type ClassLevel = 'class_11' | 'class_12';

export type AiDoubtMode = 'step_by_step' | 'beginner' | 'advanced_jee' | 'neet_biology';

export interface Subject {
  id: SubjectId;
  name: string;
  icon: string;
  color: string;
  bgColor: string;
  borderColor: string;
  description: string;
  applicableExams: ExamType[];
  totalChapters: number;
  totalNotes: number;
  totalFormulas: number;
  totalQuizzes: number;
}

export interface Topic {
  id: string;
  title: string;
  description: string;
  importance: 'High' | 'Medium' | 'Low';
  estimatedTimeMins: number;
  pyqFrequency: string; // e.g., "3-4 questions per year"
  hasQuiz: boolean;
  hasFlashcards: boolean;
}

export interface Chapter {
  id: string;
  subjectId: SubjectId;
  classLevel: ClassLevel;
  name: string;
  code: string;
  description: string;
  applicableExams: ('JEE' | 'NEET')[];
  topics: Topic[];
  weightagePercentage: number; // e.g. 8% of JEE/NEET paper
}

export interface Formula {
  id: string;
  title: string;
  subjectId: SubjectId;
  classLevel: ClassLevel;
  chapterId: string;
  chapterName: string;
  latex: string;
  description: string;
  variables: { symbol: string; meaning: string; unit?: string }[];
  examTips: string;
  applicableExams: ('JEE' | 'NEET')[];
  category: string; // e.g. "Mechanics", "Electrodynamics", "Physical Chem"
  isBookmarked?: boolean;
}

export interface Flashcard {
  id: string;
  subjectId: SubjectId;
  classLevel: ClassLevel;
  chapterId: string;
  chapterName: string;
  question: string;
  answer: string;
  latexFormula?: string;
  mnemonicsOrTip?: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  tags: string[];
  applicableExams: ('JEE' | 'NEET')[];
}

export interface QuizQuestion {
  id: string;
  questionText: string;
  latex?: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
  examTag?: 'JEE Main' | 'JEE Advanced' | 'NEET PYQ' | 'Model Question';
  difficulty: 'Easy' | 'Medium' | 'Hard';
  subjectId: SubjectId;
  chapterId: string;
}

export interface Quiz {
  id: string;
  title: string;
  subjectId: SubjectId;
  chapterId: string;
  chapterName: string;
  applicableExams: ('JEE' | 'NEET')[];
  timeLimitMins: number;
  questions: QuizQuestion[];
}

export interface NoteContent {
  id: string;
  chapterId: string;
  topicId: string;
  title: string;
  subjectId: SubjectId;
  classLevel: ClassLevel;
  applicableExams: ('JEE' | 'NEET')[];
  overview: string;
  sections: {
    heading: string;
    body: string;
    latexFormula?: string;
    keyPoints?: string[];
    commonMistakes?: string[];
    exampleProblem?: {
      problem: string;
      solution: string;
      trick?: string;
    };
  }[];
  summaryTakeaways: string[];
  lastUpdated: string;
}

export interface AchievementBadge {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  dateUnlocked?: string;
  category: 'streak' | 'quiz' | 'formula' | 'ai' | 'level';
}

export interface StudyTask {
  id: string;
  title: string;
  subjectId: SubjectId;
  estimatedMins: number;
  completed: boolean;
  type: 'note' | 'quiz' | 'formula' | 'revision';
}

export interface WeakTopic {
  id: string;
  subjectId: SubjectId;
  chapterName: string;
  topicTitle: string;
  accuracyPercentage: number;
  recommendedAction: string;
}

export interface StudentProfile {
  name: string;
  email: string;
  avatarUrl?: string;
  role: 'student' | 'teacher' | 'admin';
  targetExam: ExamType;
  classLevel: ClassLevel;
  targetRankGoal: string; // e.g. "AIR Top 500"
  targetCollege: string; // e.g. "IIT Bombay / AIIMS New Delhi"
  xp: number;
  level: number;
  levelTitle: string; // e.g., "Silver Scholar"
  badges: AchievementBadge[];
  isLoggedIn: boolean;
}

export interface UserProgress {
  selectedExam: ExamType;
  selectedClass: ClassLevel | 'all';
  profile: StudentProfile;
  dailyGoalMins: number;
  todayStudiedMins: number;
  streakDays: number;
  lastActiveDate: string;
  completedChapters: string[]; // chapterIds
  weakTopics: WeakTopic[];
  todayTasks: StudyTask[];
  bookmarkedFormulas: string[]; // formulaIds
  bookmarkedNotes: string[]; // noteIds
  recentlyViewedNotes: { noteId: string; title: string; subjectId: SubjectId; timestamp: number }[];
  quizScores: { quizId: string; score: number; total: number; percentage: number; date: string }[];
  flashcardStats: { cardId: string; confidence: 'know' | 'review' | 'hard' }[];
}

export interface AiDoubtMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  mode?: AiDoubtMode;
  latexSnippet?: string;
  timestamp: string;
  stepByStepSolution?: string[];
  keyFormulaUsed?: string;
  commonMistakesDetected?: string;
  examStrategyTip?: string;
  suggestedQuestions?: string[];
}
