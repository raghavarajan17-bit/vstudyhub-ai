import { 
  db, auth, doc, setDoc, getDoc, onSnapshot, collection, getDocs, query, orderBy, limit,
  signInAnonymously, onAuthStateChanged, User
} from './firebase';
import { UserProgress, StudentProfile, NoteContent, Formula, Quiz } from '../types';

// Sync current user progress to Firestore
export async function syncProgressToFirestore(userId: string, progress: UserProgress): Promise<void> {
  if (!userId) return;

  try {
    // 1. Update user profile document in /users/{userId}
    const userRef = doc(db, 'users', userId);
    await setDoc(userRef, {
      ...progress.profile,
      updatedAt: new Date().toISOString(),
    }, { merge: true });

    // 2. Update user progress document in /userProgress/{userId}
    const progressRef = doc(db, 'userProgress', userId);
    await setDoc(progressRef, {
      selectedExam: progress.selectedExam,
      selectedClass: progress.selectedClass,
      dailyGoalMins: progress.dailyGoalMins,
      todayStudiedMins: progress.todayStudiedMins,
      streakDays: progress.streakDays,
      lastActiveDate: progress.lastActiveDate,
      completedChapters: progress.completedChapters,
      weakTopics: progress.weakTopics,
      todayTasks: progress.todayTasks,
      bookmarkedFormulas: progress.bookmarkedFormulas,
      bookmarkedNotes: progress.bookmarkedNotes,
      recentlyViewedNotes: progress.recentlyViewedNotes,
      quizScores: progress.quizScores,
      flashcardStats: progress.flashcardStats,
      updatedAt: new Date().toISOString(),
    }, { merge: true });

    // 3. Update public leaderboard entry in /leaderboard/{userId}
    const leaderboardRef = doc(db, 'leaderboard', userId);
    await setDoc(leaderboardRef, {
      userId,
      name: progress.profile.name,
      exam: progress.profile.targetExam,
      college: progress.profile.targetCollege,
      xp: progress.profile.xp,
      level: progress.profile.level,
      levelTitle: progress.profile.levelTitle,
      avatar: progress.profile.avatarUrl,
      updatedAt: new Date().toISOString(),
    }, { merge: true });

  } catch (err) {
    console.error('Error syncing progress to Firestore:', err);
  }
}

// Fetch or subscribe to user progress from Firestore
export function subscribeToUserProgress(
  userId: string, 
  onData: (data: Partial<UserProgress>) => void
): () => void {
  if (!userId) return () => {};

  const progressRef = doc(db, 'userProgress', userId);
  const userRef = doc(db, 'users', userId);

  const unsubProgress = onSnapshot(progressRef, (docSnap) => {
    if (docSnap.exists()) {
      onData(docSnap.data() as Partial<UserProgress>);
    }
  }, (err) => console.error('Progress snapshot error:', err));

  const unsubUser = onSnapshot(userRef, (docSnap) => {
    if (docSnap.exists()) {
      onData({ profile: docSnap.data() as StudentProfile });
    }
  }, (err) => console.error('User snapshot error:', err));

  return () => {
    unsubProgress();
    unsubUser();
  };
}

// Subscribe to live leaderboard data
export function subscribeToLeaderboard(
  onUpdate: (entries: any[]) => void
): () => void {
  const q = query(collection(db, 'leaderboard'), orderBy('xp', 'desc'), limit(20));
  
  return onSnapshot(q, (snapshot) => {
    const entries: any[] = [];
    snapshot.forEach((docSnap) => {
      entries.push({ id: docSnap.id, ...docSnap.data() });
    });
    onUpdate(entries);
  }, (err) => {
    console.error('Leaderboard snapshot error:', err);
  });
}

// Admin / Faculty Content Management API
export async function saveNoteToFirestore(note: NoteContent): Promise<void> {
  const noteRef = doc(db, 'notes', note.id);
  await setDoc(noteRef, {
    ...note,
    lastUpdated: new Date().toISOString(),
  }, { merge: true });
}

export async function saveFormulaToFirestore(formula: Formula): Promise<void> {
  const formulaRef = doc(db, 'formulas', formula.id);
  await setDoc(formulaRef, formula, { merge: true });
}

export async function saveQuizToFirestore(quiz: Quiz): Promise<void> {
  const quizRef = doc(db, 'quizzes', quiz.id);
  await setDoc(quizRef, quiz, { merge: true });
}
