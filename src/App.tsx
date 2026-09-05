import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { ExamBanner } from './components/ExamBanner';
import { SubjectGrid } from './components/SubjectGrid';
import { ChapterListView } from './components/ChapterListView';
import { NoteDetailView } from './components/NoteDetailView';
import { FormulaSheetView } from './components/FormulaSheetView';
import { FlashcardView } from './components/FlashcardView';
import { AiDoubtAssistant } from './components/AiDoubtAssistant';
import { AiCareerCoachView } from './components/AiCareerCoachView';
import { AiInterviewView } from './components/AiInterviewView';
import { QuizEngine } from './components/QuizEngine';
import { ProgressDashboard } from './components/ProgressDashboard';
import { GamificationView } from './components/GamificationView';
import { AdminPanelView } from './components/AdminPanelView';
import { StudentAccountModal } from './components/StudentAccountModal';
import { GlobalSearchModal } from './components/GlobalSearchModal';
import { BlogView } from './components/BlogView';

import { ExamType, ClassLevel, SubjectId, UserProgress, StudentProfile } from './types';
import { getStoredProgress, saveStoredProgress } from './lib/storage';
import { auth, signInAnonymously } from './lib/firebase';
import { syncProgressToFirestore, subscribeToUserProgress } from './lib/firestoreSync';

export default function App() {
  const [userProgress, setUserProgress] = useState<UserProgress>(getStoredProgress);
  const [activeTab, setActiveTab] = useState<string>('home');
  const [selectedSubjectId, setSelectedSubjectId] = useState<SubjectId>('physics');
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null);
  const [activeQuizChapterId, setActiveQuizChapterId] = useState<string | undefined>(undefined);
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [isAccountModalOpen, setIsAccountModalOpen] = useState<boolean>(false);
  const [darkMode, setDarkMode] = useState<boolean>(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [initialBlogSlug, setInitialBlogSlug] = useState<string | null>(null);

  // Sync initial URL path and listen for popstate
  useEffect(() => {
    const handleUrlSync = () => {
      const path = window.location.pathname;
      if (path === '/ai-career-coach') {
        setActiveTab('ai-career-coach');
        setInitialBlogSlug(null);
      } else if (path === '/ai-interview') {
        setActiveTab('ai-interview');
        setInitialBlogSlug(null);
      } else if (path === '/blog' || path.startsWith('/blog/')) {
        setActiveTab('blog');
        const parts = path.split('/blog/');
        if (parts[1]) {
          setInitialBlogSlug(decodeURIComponent(parts[1]));
        } else {
          setInitialBlogSlug(null);
        }
      }
    };

    handleUrlSync();
    window.addEventListener('popstate', handleUrlSync);
    return () => window.removeEventListener('popstate', handleUrlSync);
  }, []);

  // Handler for tab selection with URL pushstate
  const handleTabChange = (tab: string) => {
  setActiveTab(tab);
  if (tab !== 'subjects') setActiveNoteId(null);

  if (tab === 'ai-interview') {
    window.history.pushState({}, '', '/ai-interview');
  } else if (tab === 'ai-career-coach') {
    window.history.pushState({}, '', '/ai-career-coach');
  } else if (tab === 'blog') {
    window.history.pushState({}, '', '/blog');
  } else if (tab === 'home') {
    window.history.pushState({}, '', '/');
  }
};

  // Initialize Firebase Auth listener
  useEffect(() => {
    const unsub = auth.onAuthStateChanged((user) => {
      if (user) {
        setCurrentUserId(user.uid);
      } else {
        // Fallback to email or persistent device ID when not logged in with Google
        let localDeviceId = localStorage.getItem('vstudyhub_device_id');
        if (!localDeviceId) {
          localDeviceId = `student-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
          localStorage.setItem('vstudyhub_device_id', localDeviceId);
        }
        setCurrentUserId(localDeviceId);
      }
    });

    return () => unsub();
  }, []);

  // Sync state to local storage & Firestore whenever progress changes
  useEffect(() => {
    saveStoredProgress(userProgress);
    if (currentUserId) {
      syncProgressToFirestore(currentUserId, userProgress);
    }
  }, [userProgress, currentUserId]);

  // Dark mode toggle
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Handler for exam filter
  const handleExamChange = (exam: ExamType) => {
    setUserProgress((prev) => ({ ...prev, selectedExam: exam }));
  };

  // Handler for class filter
  const handleClassChange = (cls: ClassLevel | 'all') => {
    setUserProgress((prev) => ({ ...prev, selectedClass: cls }));
  };

  // Handler for profile updates
  const handleSaveProfile = (profile: StudentProfile) => {
    setUserProgress((prev) => ({ ...prev, profile }));
  };

  // Toggle formula bookmark
  const handleToggleFormulaBookmark = (formulaId: string) => {
    setUserProgress((prev) => {
      const exists = prev.bookmarkedFormulas.includes(formulaId);
      const updated = exists
        ? prev.bookmarkedFormulas.filter((id) => id !== formulaId)
        : [...prev.bookmarkedFormulas, formulaId];
      return { ...prev, bookmarkedFormulas: updated };
    });
  };

  // Toggle note bookmark
  const handleToggleNoteBookmark = (noteId: string) => {
    setUserProgress((prev) => {
      const exists = prev.bookmarkedNotes.includes(noteId);
      const updated = exists
        ? prev.bookmarkedNotes.filter((id) => id !== noteId)
        : [...prev.bookmarkedNotes, noteId];
      return { ...prev, bookmarkedNotes: updated };
    });
  };

  // Record quiz score
  const handleRecordQuizScore = (quizId: string, score: number, total: number, percentage: number) => {
    setUserProgress((prev) => {
      const addedXp = percentage >= 80 ? 150 : 75;
      const newXp = prev.profile.xp + addedXp;

      return {
        ...prev,
        quizScores: [
          {
            quizId,
            score,
            total,
            percentage,
            date: new Date().toISOString().split('T')[0],
          },
          ...prev.quizScores,
        ],
        todayStudiedMins: prev.todayStudiedMins + 15,
        profile: {
          ...prev.profile,
          xp: newXp,
        },
      };
    });
  };

  // Update flashcard confidence
  const handleUpdateFlashcardConfidence = (cardId: string, rating: 'know' | 'review' | 'hard') => {
    setUserProgress((prev) => {
      const filtered = prev.flashcardStats.filter((s) => s.cardId !== cardId);
      return {
        ...prev,
        flashcardStats: [...filtered, { cardId, confidence: rating }],
      };
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans transition-colors flex flex-col justify-between selection:bg-blue-500 selection:text-white">
      
      {/* Header */}
      <Header
        selectedExam={userProgress.selectedExam}
        onExamChange={handleExamChange}
        selectedClass={userProgress.selectedClass}
        onClassChange={handleClassChange}
        activeTab={activeTab}
        onTabChange={handleTabChange}
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenAccountModal={() => setIsAccountModalOpen(true)}
        profile={userProgress.profile}
        streakDays={userProgress.streakDays}
        darkMode={darkMode}
        onToggleDarkMode={() => setDarkMode(!darkMode)}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        
        {/* Overview Tab */}
        {activeTab === 'home' && (
          <div>
            <ExamBanner
              selectedExam={userProgress.selectedExam}
              onExamChange={handleExamChange}
              selectedClass={userProgress.selectedClass}
              onClassChange={handleClassChange}
              onOpenSearch={() => setIsSearchOpen(true)}
              onTabChange={handleTabChange}
            />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <SubjectGrid
                selectedExam={userProgress.selectedExam}
                onSelectSubject={(subId) => {
                  setSelectedSubjectId(subId);
                  setActiveNoteId(null);
                }}
                onTabChange={handleTabChange}
              />
            </div>
          </div>
        )}

        {/* Subjects & Notes Tab */}
        {activeTab === 'subjects' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {activeNoteId ? (
              <NoteDetailView
                noteId={activeNoteId}
                onBack={() => setActiveNoteId(null)}
                bookmarkedNoteIds={userProgress.bookmarkedNotes}
                onToggleBookmarkNote={handleToggleNoteBookmark}
                onOpenAiWithContext={(ctx) => {
                  setActiveTab('ai-tutor');
                }}
              />
            ) : (
              <ChapterListView
                selectedExam={userProgress.selectedExam}
                selectedSubjectId={selectedSubjectId}
                onSelectSubject={setSelectedSubjectId}
                onSelectTopicNote={(noteId) => setActiveNoteId(noteId)}
                onStartQuiz={(chId) => {
                  setActiveQuizChapterId(chId);
                  setActiveTab('quizzes');
                }}
                onTabChange={handleTabChange}
              />
            )}
          </div>
        )}

        {/* Formulas Tab */}
        {activeTab === 'formulas' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <FormulaSheetView
              selectedExam={userProgress.selectedExam}
              bookmarkedFormulaIds={userProgress.bookmarkedFormulas}
              onToggleBookmark={handleToggleFormulaBookmark}
            />
          </div>
        )}

        {/* Blog Tab */}
        {activeTab === 'blog' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <BlogView
              initialSlug={initialBlogSlug}
              onOpenAiWithContext={(ctx) => {
                setActiveTab('ai-tutor');
              }}
            />
          </div>
        )}

        {/* Flashcards Tab */}
        {activeTab === 'flashcards' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <FlashcardView
              selectedExam={userProgress.selectedExam}
              onUpdateFlashcardConfidence={handleUpdateFlashcardConfidence}
            />
          </div>
        )}

        {/* AI Tutor Tab */}
        {activeTab === 'ai-tutor' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <AiDoubtAssistant selectedExam={userProgress.selectedExam} />
          </div>
        )}
        {/* AI Interview & English Coach Tab */}
        {activeTab === 'ai-career-coach' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <AiCareerCoachView />
          </div>
        )}
        {/* AI Interview Practice Tab */}
        {activeTab === 'ai-interview' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <AiInterviewView />
          </div>
        )}

        {/* Gamification & Leaderboard Tab */}
        {activeTab === 'gamification' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <GamificationView
              profile={userProgress.profile}
              streakDays={userProgress.streakDays}
            />
          </div>
        )}

        {/* Practice Quizzes Tab */}
        {activeTab === 'quizzes' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <QuizEngine
              selectedExam={userProgress.selectedExam}
              chapterIdFilter={activeQuizChapterId}
              onRecordQuizScore={handleRecordQuizScore}
            />
          </div>
        )}

        {/* Progress Dashboard Tab */}
        {activeTab === 'progress' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <ProgressDashboard
              progress={userProgress}
              onUpdateProgress={setUserProgress}
              onSelectNote={(noteId) => {
                setActiveNoteId(noteId);
                setActiveTab('subjects');
              }}
              onTabChange={setActiveTab}
            />
          </div>
        )}

        {/* Admin / Faculty Panel Tab */}
        {activeTab === 'admin' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <AdminPanelView />
          </div>
        )}

      </main>

      {/* Global Search Modal */}
      <GlobalSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelectNote={(noteId) => {
          setActiveNoteId(noteId);
          setActiveTab('subjects');
        }}
        onTabChange={setActiveTab}
      />

      {/* Student Account Modal */}
      <StudentAccountModal
        isOpen={isAccountModalOpen}
        onClose={() => setIsAccountModalOpen(false)}
        profile={userProgress.profile}
        onUpdateProfile={(updated) => handleSaveProfile({ ...userProgress.profile, ...updated })}
      />

      {/* Footer */}
      <Footer
        onTabChange={handleTabChange}
        onExamChange={handleExamChange}
      />

    </div>
  );
}



