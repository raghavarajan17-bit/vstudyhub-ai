import { UserProgress, ExamType, ClassLevel, SubjectId } from '../types';

const STORAGE_KEY = 'vstudyhub_user_progress_v3';

export const INITIAL_PROGRESS: UserProgress = {
  selectedExam: 'JEE',
  selectedClass: 'class_11',
  profile: {
    name: 'Aarav Sharma',
    email: 'aarav.sharma@vstudy.edu',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
    role: 'student',
    targetExam: 'JEE',
    classLevel: 'class_11',
    targetRankGoal: 'AIR Under 500',
    targetCollege: 'IIT Bombay - Computer Science',
    xp: 850,
    level: 3,
    levelTitle: 'Silver Scholar',
    isLoggedIn: true,
    badges: [
      {
        id: 'badge-1',
        title: 'Streak Warrior',
        description: 'Maintained a 4-day continuous study streak!',
        icon: 'Flame',
        unlocked: true,
        dateUnlocked: '2026-07-22',
        category: 'streak',
      },
      {
        id: 'badge-2',
        title: 'Formula Master',
        description: 'Bookmarked and studied 10+ high-yield formulas',
        icon: 'Calculator',
        unlocked: true,
        dateUnlocked: '2026-07-23',
        category: 'formula',
      },
      {
        id: 'badge-3',
        title: 'Perfect Score',
        description: 'Scored 100% on a full JEE/NEET Chapter Quiz',
        icon: 'Trophy',
        unlocked: true,
        dateUnlocked: '2026-07-24',
        category: 'quiz',
      },
      {
        id: 'badge-4',
        title: 'AI Scholar',
        description: 'Asked 5+ complex doubts to VStudy AI Tutor',
        icon: 'Sparkles',
        unlocked: false,
        category: 'ai',
      },
      {
        id: 'badge-5',
        title: 'JEE Advanced Contender',
        description: 'Reached Level 5 in overall platform XP',
        icon: 'Award',
        unlocked: false,
        category: 'level',
      },
    ],
  },
  dailyGoalMins: 60,
  todayStudiedMins: 35,
  streakDays: 4,
  lastActiveDate: new Date().toISOString().split('T')[0],
  completedChapters: ['ch-phy-11-kinematics'],
  weakTopics: [
    {
      id: 'wt-1',
      subjectId: 'physics',
      chapterName: 'Kinematics in 2D',
      topicTitle: 'Relative Motion in River-Swimmer & Rain-Man',
      accuracyPercentage: 45,
      recommendedAction: 'Re-read Section 3 of Kinematics Note & practice 5 PYQs',
    },
    {
      id: 'wt-2',
      subjectId: 'chemistry',
      chapterName: 'Organic Chemistry',
      topicTitle: 'SN1 vs SN2 Reaction Mechanisms & Carbocation Rearrangement',
      accuracyPercentage: 52,
      recommendedAction: 'Solve Flashcard Deck for Reaction Mechanisms',
    },
  ],
  todayTasks: [
    {
      id: 'task-1',
      title: 'Revise Kinematics 2D Formulas & Projectile Tricks',
      subjectId: 'physics',
      estimatedMins: 15,
      completed: true,
      type: 'formula',
    },
    {
      id: 'task-2',
      title: 'Complete Organic Chemistry SN1/SN2 Flashcard Deck',
      subjectId: 'chemistry',
      estimatedMins: 20,
      completed: false,
      type: 'revision',
    },
    {
      id: 'task-3',
      title: 'Take 10-Minute JEE Practice Quiz on Optics',
      subjectId: 'physics',
      estimatedMins: 10,
      completed: false,
      type: 'quiz',
    },
  ],
  bookmarkedFormulas: ['form-1', 'form-3'],
  bookmarkedNotes: ['note-kinematics-01'],
  recentlyViewedNotes: [
    {
      noteId: 'note-kinematics-01',
      title: 'Complete Motion in 1D & 2D: Formulas, Graphs & Tricks',
      subjectId: 'physics',
      timestamp: Date.now() - 3600000,
    }
  ],
  quizScores: [
    {
      quizId: 'quiz-phy-11-kin',
      score: 12,
      total: 12,
      percentage: 100,
      date: '2026-07-24',
    }
  ],
  flashcardStats: [],
};

export function getStoredProgress(): UserProgress {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return INITIAL_PROGRESS;
    const parsed = JSON.parse(raw);
    return {
      ...INITIAL_PROGRESS,
      ...parsed,
      profile: {
        ...INITIAL_PROGRESS.profile,
        ...(parsed.profile || {}),
      },
    };
  } catch (e) {
    return INITIAL_PROGRESS;
  }
}

export function saveStoredProgress(progress: UserProgress): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch (e) {
    console.error('Failed to save user progress', e);
  }
}

