import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  MessageSquareText,
  TrendingUp,
  Target,
  Globe2,
  Briefcase,
  Layers,
  Award,
  CheckCircle2,
  ArrowRight,
  HelpCircle,
  BarChart3,
  Calendar,
  Zap,
  BookOpen,
  ChevronRight,
  Shield,
  Volume2,
  Flame,
  AlertCircle,
  RotateCcw,
  Send,
  Loader2,
  LogOut,
  ChevronDown,
  ChevronUp,
  FileText,
  ThumbsUp,
  AlertTriangle,
  Lightbulb,
  Check,
  Compass,
  Clock,
  Sparkle
} from 'lucide-react';
import {
  InterviewTrack,
  InterviewLevel,
  InterviewCategory,
  InterviewSetup,
  InterviewHistoryItem,
  InterviewNextRequest,
  InterviewNextResponse,
  InterviewAssessmentRequest,
  InterviewAssessmentResponse,
  DimensionScores,
  ImprovementItem,
  QuestionAnalysisFeedback,
  WrittenEnglishDiagnostics
} from '../types/interview.types';

const COUNTRIES = [
  { code: 'US', name: 'United States', flag: '🇺🇸' },
  { code: 'CA', name: 'Canada', flag: '🇨🇦' },
  { code: 'GB', name: 'United Kingdom', flag: '🇬🇧' },
  { code: 'AU', name: 'Australia', flag: '🇦🇺' },
  { code: 'NZ', name: 'New Zealand', flag: '🇳🇿' },
  { code: 'DE', name: 'Germany', flag: '🇩🇪' },
  { code: 'SG', name: 'Singapore', flag: '🇸🇬' },
  { code: 'AE', name: 'United Arab Emirates', flag: '🇦🇪' },
  { code: 'IE', name: 'Ireland', flag: '🇮🇪' },
  { code: 'NL', name: 'Netherlands', flag: '🇳🇱' },
  { code: 'FR', name: 'France', flag: '🇫🇷' },
  { code: 'GLOBAL', name: 'Other / International', flag: '🌐' }
];

const TRACKS = [
  {
    id: 'job-interview' as InterviewTrack,
    title: 'Job Interview',
    badge: 'Popular',
    desc: 'General job and hiring preparation tailored to your target industry and role.',
    icon: Briefcase,
    category: 'general' as InterviewCategory,
    color: 'from-blue-500 to-indigo-600',
    borderColor: 'border-blue-500/30'
  },
  {
    id: 'behavioral-hr' as InterviewTrack,
    title: 'Behavioral / HR',
    badge: 'STAR Method',
    desc: 'Master situational questions, leadership stories, and culture fit evaluations.',
    icon: MessageSquareText,
    category: 'behavioral' as InterviewCategory,
    color: 'from-purple-500 to-pink-600',
    borderColor: 'border-purple-500/30'
  },
  {
    id: 'technical-pro' as InterviewTrack,
    title: 'Technical / Professional',
    badge: 'Role Specific',
    desc: 'Practice role-specific concepts, problem solving, and architecture discussions.',
    icon: Layers,
    category: 'technical' as InterviewCategory,
    color: 'from-emerald-500 to-teal-600',
    borderColor: 'border-emerald-500/30'
  },
  {
    id: 'english-interview' as InterviewTrack,
    title: 'English Interview Coach',
    badge: 'Fluency Focus',
    desc: 'Sharpen your spoken English, vocabulary, grammar, and professional tone.',
    icon: Globe2,
    category: 'english-fluency' as InterviewCategory,
    color: 'from-amber-500 to-orange-600',
    borderColor: 'border-amber-500/30'
  }
];

export const AiInterviewView: React.FC = () => {
  // Session Configuration State
  const [setup, setSetup] = useState<InterviewSetup>({
    targetRole: 'Software Engineer',
    experienceLevel: 'mid-1-3',
    country: 'United States',
    interviewType: 'general',
    jobDescription: '',
    track: 'job-interview'
  });

  // Runner & Lifecycle State
  const [sessionState, setSessionState] = useState<'landing' | 'in-interview' | 'completed'>('landing');
  const [currentQuestionNumber, setCurrentQuestionNumber] = useState<number>(1);
  const [currentQuestion, setCurrentQuestion] = useState<string>('');
  const [interviewerReaction, setInterviewerReaction] = useState<string | undefined>(undefined);
  const [currentCategory, setCurrentCategory] = useState<InterviewCategory | undefined>(undefined);
  const [userAnswer, setUserAnswer] = useState<string>('');
  const [conversationHistory, setConversationHistory] = useState<InterviewHistoryItem[]>([]);
  
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isExitConfirmOpen, setIsExitConfirmOpen] = useState<boolean>(false);
  
  // Phase 2B Assessment State
  const [assessmentState, setAssessmentState] = useState<'idle' | 'analyzing' | 'ready' | 'error'>('idle');
  const [assessmentData, setAssessmentData] = useState<InterviewAssessmentResponse | null>(null);
  const [assessmentError, setAssessmentError] = useState<string | null>(null);
  const [isPhase2CPlanModalOpen, setIsPhase2CPlanModalOpen] = useState<boolean>(false);
  const [expandedQuestionIndex, setExpandedQuestionIndex] = useState<number | null>(0);
  const [expandedTranscriptIndex, setExpandedTranscriptIndex] = useState<number | null>(null);

  const setupRef = useRef<HTMLDivElement>(null);
  const howItWorksRef = useRef<HTMLDivElement>(null);
  const answerTextareaRef = useRef<HTMLTextAreaElement>(null);
  const assessmentViewRef = useRef<HTMLDivElement>(null);

  // Auto-focus the answer textarea when a new question arrives
  useEffect(() => {
    if (sessionState === 'in-interview' && !isLoading && answerTextareaRef.current) {
      answerTextareaRef.current.focus();
    }
  }, [sessionState, currentQuestionNumber, isLoading]);

  const scrollToSetup = () => {
    setupRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollToHowItWorks = () => {
    howItWorksRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleTrackSelect = (track: (typeof TRACKS)[0]) => {
    setSetup((prev) => ({
      ...prev,
      track: track.id,
      interviewType: track.category
    }));
  };

  // Launch initial question (Question 1)
  const startInterview = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    setSessionState('in-interview');
    setCurrentQuestionNumber(1);
    setCurrentQuestion('');
    setInterviewerReaction(undefined);
    setUserAnswer('');
    setConversationHistory([]);
    setAssessmentState('idle');
    setAssessmentData(null);
    setAssessmentError(null);

    try {
      const payload: InterviewNextRequest = {
        setup,
        currentQuestionNumber: 0,
        currentUserAnswer: '',
        conversationHistory: []
      };

      const res = await fetch('/api/ai/interview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to initialize the interview question.');
      }

      const data: InterviewNextResponse = await res.json();
      setCurrentQuestion(data.question || `Tell me about your background as a ${setup.targetRole}.`);
      setCurrentQuestionNumber(data.questionNumber || 1);
      setCurrentCategory(data.category || setup.interviewType);
      setInterviewerReaction(data.interviewerReaction);
    } catch (err: any) {
      console.error('Error initiating interview:', err);
      setErrorMessage(err?.message || 'We could not start the interview right now. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Submit answer for current question and fetch next question
  const submitAnswer = async () => {
    const trimmed = userAnswer.trim();
    if (!trimmed || isLoading) return;

    setIsLoading(true);
    setErrorMessage(null);

    const newHistoryItem: InterviewHistoryItem = {
      questionNumber: currentQuestionNumber,
      question: currentQuestion,
      userAnswer: trimmed,
      category: currentCategory
    };

    const updatedHistory = [...conversationHistory, newHistoryItem];

    // If 5th question answered, conclude interview and trigger assessment
    if (currentQuestionNumber >= 5) {
      setConversationHistory(updatedHistory);
      setSessionState('completed');
      setIsLoading(false);
      // Auto-trigger assessment analysis
      generateAssessment(updatedHistory);
      return;
    }

    try {
      const payload: InterviewNextRequest = {
        setup,
        currentQuestionNumber,
        currentUserAnswer: trimmed,
        conversationHistory: updatedHistory
      };

      const res = await fetch('/api/ai/interview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to generate the next interview question.');
      }

      const data: InterviewNextResponse = await res.json();

      if (data.isComplete || currentQuestionNumber >= 5) {
        setConversationHistory(updatedHistory);
        setSessionState('completed');
        generateAssessment(updatedHistory);
      } else {
        setConversationHistory(updatedHistory);
        setCurrentQuestion(data.question);
        setCurrentQuestionNumber(data.questionNumber || currentQuestionNumber + 1);
        setCurrentCategory(data.category || setup.interviewType);
        setInterviewerReaction(data.interviewerReaction);
        setUserAnswer('');
      }
    } catch (err: any) {
      console.error('Error submitting interview answer:', err);
      setErrorMessage(err?.message || "We couldn't continue the interview right now. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Generate Phase 2B Assessment
  const generateAssessment = async (historyToAssess: InterviewHistoryItem[]) => {
    if (!historyToAssess || historyToAssess.length === 0) return;

    setAssessmentState('analyzing');
    setAssessmentError(null);

    try {
      const payload: InterviewAssessmentRequest = {
        setup,
        conversationHistory: historyToAssess
      };

      const res = await fetch('/api/ai/interview-assessment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || 'Failed to generate AI interview assessment.');
      }

      const result: InterviewAssessmentResponse = await res.json();
      setAssessmentData(result);
      setAssessmentState('ready');
      setTimeout(() => {
        assessmentViewRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (err: any) {
      console.error('Error generating assessment:', err);
      setAssessmentError(err?.message || "We couldn't analyze your interview right now.");
      setAssessmentState('error');
    }
  };

  // Reset session
  const exitInterview = () => {
    setIsExitConfirmOpen(false);
    setSessionState('landing');
    setConversationHistory([]);
    setUserAnswer('');
    setErrorMessage(null);
    setAssessmentState('idle');
    setAssessmentData(null);
  };

  const wordCount = userAnswer.trim() ? userAnswer.trim().split(/\s+/).length : 0;

  // Render active interview runner view
  if (sessionState === 'in-interview') {
    return (
      <div className="py-8 max-w-4xl mx-auto space-y-6">
        
        {/* Top Navigation & Status Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2.5 py-0.5 rounded-full border border-indigo-200 dark:border-indigo-800/50">
                {setup.track.replace('-', ' ')}
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                • {setup.country} • {setup.experienceLevel}
              </span>
            </div>
            <h2 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white">
              Target: {setup.targetRole}
            </h2>
          </div>

          {/* Progress Pill & Exit Action */}
          <div className="flex items-center gap-3 self-end sm:self-center">
            <div className="text-right">
              <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                Question {currentQuestionNumber} of 5
              </div>
              <div className="w-32 bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden mt-1">
                <div
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 h-full rounded-full transition-all duration-300"
                  style={{ width: `${(currentQuestionNumber / 5) * 100}%` }}
                />
              </div>
            </div>

            <button
              onClick={() => setIsExitConfirmOpen(true)}
              className="p-2 rounded-xl text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-transparent hover:border-rose-200 dark:hover:border-rose-800 transition-colors cursor-pointer"
              title="Exit Interview"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* AI Interviewer Question Box */}
        <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white border border-indigo-500/20 shadow-xl space-y-6">
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-300 shadow-inner">
                <Sparkles className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                  AI Hiring Interviewer
                </h3>
                <span className="text-[11px] text-indigo-300">
                  Adaptive Questioning • Question {currentQuestionNumber} of 5
                </span>
              </div>
            </div>

            {currentCategory && (
              <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-slate-800/80 border border-slate-700 text-slate-300">
                {currentCategory}
              </span>
            )}
          </div>

          {/* Optional brief conversational acknowledgement */}
          {interviewerReaction && (
            <div className="px-4 py-2.5 rounded-xl bg-indigo-500/10 border border-indigo-400/20 text-indigo-200 text-xs sm:text-sm italic">
              "{interviewerReaction}"
            </div>
          )}

          {/* Question Text */}
          <div className="min-h-[70px] flex items-center">
            {isLoading && !currentQuestion ? (
              <div className="flex items-center gap-3 text-slate-400 text-sm">
                <Loader2 className="w-5 h-5 animate-spin text-indigo-400" />
                <span>Generating tailored question...</span>
              </div>
            ) : (
              <p className="text-lg sm:text-xl font-semibold text-white leading-relaxed tracking-tight">
                {currentQuestion}
              </p>
            )}
          </div>

        </div>

        {/* Candidate Response Workspace */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md space-y-4">
          
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <label className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <MessageSquareText className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              Your Spoken Response (Type as you would speak)
            </label>
            <span className="font-mono">
              {wordCount} {wordCount === 1 ? 'word' : 'words'}
            </span>
          </div>

          {/* Error Banner */}
          {errorMessage && (
            <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-xs sm:text-sm text-rose-700 dark:text-rose-300 flex items-start justify-between gap-3">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
              <button
                onClick={currentQuestion ? submitAnswer : startInterview}
                className="font-bold underline hover:text-rose-900 dark:hover:text-rose-100 shrink-0 cursor-pointer"
              >
                Retry
              </button>
            </div>
          )}

          {/* Textarea */}
          <textarea
            ref={answerTextareaRef}
            rows={7}
            disabled={isLoading}
            value={userAnswer}
            onChange={(e) => setUserAnswer(e.target.value)}
            placeholder="Type your answer here... Speak naturally, explain your thought process, and include specific examples or metrics."
            className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm sm:text-base leading-relaxed focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 transition-all resize-y"
          />

          {/* Action Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
            <div className="text-[11px] text-slate-400 dark:text-slate-500">
              💡 Tip: Structured answers (Context → Action → Impact) receive higher clarity & readiness ratings.
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                onClick={() => setIsExitConfirmOpen(true)}
                disabled={isLoading}
                className="w-full sm:w-auto px-5 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold transition-colors cursor-pointer"
              >
                Exit
              </button>

              <button
                onClick={submitAnswer}
                disabled={isLoading || !userAnswer.trim()}
                className="w-full sm:w-auto px-8 py-3 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold text-sm shadow-md shadow-indigo-500/20 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.01] transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Evaluating Response...</span>
                  </>
                ) : (
                  <>
                    <span>{currentQuestionNumber >= 5 ? 'Submit & Finish Interview' : 'Submit Answer'}</span>
                    <Send className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>

        </div>

        {/* Exit Confirmation Modal */}
        {isExitConfirmOpen && (
          <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-5 animate-in fade-in zoom-in duration-150">
              <div className="w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400 flex items-center justify-center">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h4 className="text-lg font-bold text-slate-900 dark:text-white">
                  Exit this interview session?
                </h4>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                  Your current question progress will not be saved. Are you sure you want to return to the setup page?
                </p>
              </div>
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  onClick={() => setIsExitConfirmOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold cursor-pointer"
                >
                  Continue Interview
                </button>
                <button
                  onClick={exitInterview}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold cursor-pointer transition-colors"
                >
                  Exit Session
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    );
  }

  // Render interview completion & Phase 2B Assessment view
  if (sessionState === 'completed') {
    return (
      <div className="py-8 max-w-4xl mx-auto space-y-8 animate-in fade-in duration-300">
        
        {/* Completion Celebration Hero */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white p-8 sm:p-12 border border-indigo-500/20 shadow-2xl text-center space-y-6">
          <div className="w-16 h-16 rounded-3xl bg-emerald-500/20 border border-emerald-400/30 text-emerald-400 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div className="space-y-2 max-w-xl mx-auto">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/60 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" /> 5 of 5 Questions Completed
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Interview Complete
            </h2>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              Great work! Your 5 interview responses have been recorded and evaluated by the AI assessment engine.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-slate-300 pt-2">
            <span className="px-3 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700">
              Role: <strong className="text-white">{setup.targetRole}</strong>
            </span>
            <span className="px-3 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700">
              Region: <strong className="text-white">{setup.country}</strong>
            </span>
            <span className="px-3 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700">
              Level: <strong className="text-white">{setup.experienceLevel}</strong>
            </span>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            {assessmentState === 'error' ? (
              <button
                onClick={() => generateAssessment(conversationHistory)}
                className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold text-sm shadow-lg shadow-indigo-600/30 hover:scale-[1.02] transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Retry Assessment Analysis</span>
              </button>
            ) : (
              <button
                onClick={() => assessmentViewRef.current?.scrollIntoView({ behavior: 'smooth' })}
                className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold text-sm shadow-lg shadow-indigo-600/30 hover:scale-[1.02] transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Award className="w-4 h-4" />
                <span>Jump to Assessment Report</span>
              </button>
            )}

            <button
              onClick={() => {
                setSessionState('landing');
                setConversationHistory([]);
                setUserAnswer('');
                setAssessmentState('idle');
                setAssessmentData(null);
              }}
              className="w-full sm:w-auto px-6 py-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Practice Another Role</span>
            </button>
          </div>
        </div>

        {/* Phase 2B Assessment Container */}
        <div ref={assessmentViewRef} className="space-y-8 scroll-mt-24">
          
          {/* Assessment Loading State */}
          {assessmentState === 'analyzing' && (
            <div className="p-8 sm:p-12 rounded-3xl bg-white dark:bg-slate-900 border border-indigo-200 dark:border-indigo-900/50 shadow-xl text-center space-y-5 animate-pulse">
              <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto">
                <Loader2 className="w-7 h-7 animate-spin" />
              </div>
              <div className="space-y-2 max-w-md mx-auto">
                <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">
                  Generating AI Practice Assessment...
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                  Evaluating all 5 responses across relevance, answer structure, written fluency, grammar, vocabulary, and communication clarity.
                </p>
              </div>
            </div>
          )}

          {/* Assessment Error State */}
          {assessmentState === 'error' && (
            <div className="p-6 sm:p-8 rounded-3xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-slate-900 dark:text-white space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-900/60 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
                  <AlertCircle className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm sm:text-base text-rose-900 dark:text-rose-200">
                    Assessment Generation Unsuccessful
                  </h4>
                  <p className="text-xs text-rose-700 dark:text-rose-300">
                    {assessmentError || "We couldn't analyze your interview right now."}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={() => generateAssessment(conversationHistory)}
                  className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-sm transition-colors cursor-pointer"
                >
                  Retry Analysis
                </button>
                <button
                  onClick={() => setSessionState('landing')}
                  className="px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold cursor-pointer"
                >
                  Back to Setup
                </button>
              </div>
            </div>
          )}

          {/* Assessment Results Report (Ready) */}
          {assessmentState === 'ready' && assessmentData && (
            <div className="space-y-8 animate-in fade-in duration-300">
              
              {/* Header & Overall Scorecard */}
              <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl p-6 sm:p-10 space-y-8">
                
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-100 dark:border-slate-800 pb-8">
                  <div className="space-y-2">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 text-xs font-bold border border-indigo-200 dark:border-indigo-800/50">
                      <Award className="w-3.5 h-3.5" /> AI Practice Assessment
                    </div>
                    <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                      Your AI Interview Assessment
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-xl">
                      Objective practice evaluation based on your 5 written responses for{' '}
                      <strong className="text-slate-800 dark:text-slate-200">{setup.targetRole}</strong> in{' '}
                      <strong className="text-slate-800 dark:text-slate-200">{setup.country}</strong>.
                    </p>
                  </div>

                  {/* Primary Score Dial Card */}
                  <div className="p-6 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-700 text-white shadow-lg shadow-indigo-600/20 text-center min-w-[200px] shrink-0 space-y-1">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-200">
                      Overall Readiness
                    </span>
                    <div className="text-4xl sm:text-5xl font-black tracking-tight">
                      {assessmentData.overallScore}
                      <span className="text-xl font-bold text-indigo-200"> / 100</span>
                    </div>
                    <span className="text-[11px] font-medium text-indigo-100 block">
                      {assessmentData.overallScore >= 80
                        ? 'High Interview Readiness'
                        : assessmentData.overallScore >= 65
                        ? 'Solid Competency • Needs Targeted Polish'
                        : 'Foundational • High Improvement Potential'}
                    </span>
                  </div>
                </div>

                {/* 8 Dimension Scores Grid */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                      <BarChart3 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                      Core Dimension Breakdown
                    </h4>
                    <span className="text-[11px] text-slate-400">Weighted evaluation methodology</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    
                    {[
                      { label: 'Relevance', score: assessmentData.scores.relevance, weight: '20%', desc: 'Directness to prompt' },
                      { label: 'Answer Structure', score: assessmentData.scores.structure, weight: '15%', desc: 'STAR & organization' },
                      { label: 'Clarity', score: assessmentData.scores.clarity, weight: '15%', desc: 'Coherence & flow' },
                      { label: 'English Fluency', score: assessmentData.scores.fluency, weight: '15%', desc: 'Written expression' },
                      { label: 'Grammar', score: assessmentData.scores.grammar, weight: '10%', desc: 'Syntax & accuracy' },
                      { label: 'Vocabulary', score: assessmentData.scores.vocabulary, weight: '10%', desc: 'Role-specific precision' },
                      { label: 'Professional Tone', score: assessmentData.scores.professionalCommunication, weight: '10%', desc: 'Workplace presence' },
                      { label: 'Style & Confidence', score: assessmentData.scores.confidenceStyle, weight: '5%', desc: 'Decisive delivery' },
                    ].map((dim, idx) => (
                      <div
                        key={idx}
                        className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-900 dark:text-white">
                            {dim.label}
                          </span>
                          <span className="text-xs font-extrabold text-indigo-600 dark:text-indigo-400">
                            {dim.score}/100
                          </span>
                        </div>

                        <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              dim.score >= 80
                                ? 'bg-emerald-500'
                                : dim.score >= 65
                                ? 'bg-indigo-600'
                                : 'bg-amber-500'
                            }`}
                            style={{ width: `${dim.score}%` }}
                          />
                        </div>

                        <div className="flex items-center justify-between text-[10px] text-slate-400">
                          <span>{dim.desc}</span>
                          <span className="font-mono">Weight: {dim.weight}</span>
                        </div>
                      </div>
                    ))}

                  </div>
                </div>

              </div>

              {/* Strongest Area & Biggest Opportunity Matrix */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Strongest Area */}
                <div className="p-6 sm:p-8 rounded-3xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 shadow-sm space-y-3">
                  <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400">
                    <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-900/60 flex items-center justify-center font-bold">
                      <ThumbsUp className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-bold uppercase tracking-wider">
                      Your Strongest Area
                    </span>
                  </div>

                  <h4 className="text-xl font-extrabold text-slate-900 dark:text-white">
                    {assessmentData.strongestArea}
                  </h4>

                  <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                    {assessmentData.strongestAreaExplanation}
                  </p>
                </div>

                {/* Biggest Opportunity / Weakness */}
                <div className="p-6 sm:p-8 rounded-3xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 shadow-sm space-y-3">
                  <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400">
                    <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-900/60 flex items-center justify-center font-bold">
                      <AlertTriangle className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-bold uppercase tracking-wider">
                      Your Biggest Opportunity
                    </span>
                  </div>

                  <h4 className="text-xl font-extrabold text-slate-900 dark:text-white">
                    {assessmentData.biggestWeakness}
                  </h4>

                  <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                    {assessmentData.biggestWeaknessExplanation}
                  </p>
                </div>

              </div>

              {/* Top 3 High-Impact Improvements */}
              <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <h4 className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                      <Target className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                      Top 3 Actionable Improvement Priorities
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Concrete adjustments to elevate your hiring success rate
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  {assessmentData.topImprovements.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-3 flex flex-col justify-between"
                    >
                      <div className="space-y-2">
                        <div className="w-7 h-7 rounded-lg bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-bold text-xs flex items-center justify-center">
                          {idx + 1}
                        </div>
                        <h5 className="text-sm font-bold text-slate-900 dark:text-white">
                          {item.area}
                        </h5>
                        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                          {item.reason}
                        </p>
                      </div>

                      <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-indigo-950 dark:text-indigo-200 space-y-1 mt-2">
                        <span className="font-bold flex items-center gap-1 text-[10px] text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                          <Lightbulb className="w-3 h-3" /> Actionable Tip
                        </span>
                        <p className="text-[11px] leading-relaxed">
                          {item.actionableTip}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Written English Diagnostics */}
              <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md space-y-6">
                <div className="space-y-1">
                  <h4 className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                    <Globe2 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                    Written Professional English Diagnostic
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Analysis based on vocabulary precision, sentence structure, and written clarity
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/70 space-y-1.5">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                      Fluency & Thought Progression
                    </span>
                    <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                      {assessmentData.englishFeedback.fluencyObservation}
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/70 space-y-1.5">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
                      Grammar & Syntax Accuracy
                    </span>
                    <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                      {assessmentData.englishFeedback.grammarObservation}
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/70 space-y-1.5">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                      Vocabulary & Role Precision
                    </span>
                    <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                      {assessmentData.englishFeedback.vocabularyObservation}
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/70 space-y-1.5">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                      Executive Concision & Clarity
                    </span>
                    <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                      {assessmentData.englishFeedback.clarityObservation}
                    </p>
                  </div>

                </div>
              </div>

              {/* Question-by-Question Deep Dive (Collapsible) */}
              <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <h4 className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                      <FileText className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                      Question-by-Question Evaluation ({assessmentData.questionFeedback.length} Questions)
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Click any question to view strengths and targeted feedback
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  {assessmentData.questionFeedback.map((qf, idx) => {
                    const isExpanded = expandedQuestionIndex === idx;
                    return (
                      <div
                        key={idx}
                        className="rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden bg-slate-50/50 dark:bg-slate-800/30 transition-all"
                      >
                        <button
                          onClick={() => setExpandedQuestionIndex(isExpanded ? null : idx)}
                          className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 cursor-pointer hover:bg-slate-100/80 dark:hover:bg-slate-800/60 transition-colors"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950 px-2.5 py-1 rounded-md border border-indigo-100 dark:border-indigo-900 shrink-0">
                              Q{qf.questionNumber}
                            </span>
                            <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">
                              {qf.question}
                            </p>
                          </div>

                          <div className="flex items-center gap-3 shrink-0">
                            <span className="text-xs font-extrabold text-slate-900 dark:text-slate-200 bg-slate-200/80 dark:bg-slate-700/80 px-2.5 py-1 rounded-lg">
                              {qf.score} / 100
                            </span>
                            {isExpanded ? (
                              <ChevronUp className="w-4 h-4 text-slate-400" />
                            ) : (
                              <ChevronDown className="w-4 h-4 text-slate-400" />
                            )}
                          </div>
                        </button>

                        {isExpanded && (
                          <div className="p-5 pt-0 space-y-4 border-t border-slate-200/60 dark:border-slate-700/60 text-xs sm:text-sm">
                            
                            {/* Candidate Transcript */}
                            <div className="space-y-1 pt-3">
                              <span className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">
                                Your Recorded Response:
                              </span>
                              <p className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-wrap">
                                {qf.userAnswer}
                              </p>
                            </div>

                            {/* Strengths & Improvements */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                              <div className="p-3.5 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-800/40 space-y-1">
                                <span className="font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1 text-[11px]">
                                  <Check className="w-3.5 h-3.5" /> What Went Well
                                </span>
                                <p className="text-slate-700 dark:text-slate-300 text-xs leading-relaxed">
                                  {qf.strengths}
                                </p>
                              </div>

                              <div className="p-3.5 rounded-xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-800/40 space-y-1">
                                <span className="font-bold text-amber-700 dark:text-amber-400 flex items-center gap-1 text-[11px]">
                                  <AlertCircle className="w-3.5 h-3.5" /> Opportunity to Elevate
                                </span>
                                <p className="text-slate-700 dark:text-slate-300 text-xs leading-relaxed">
                                  {qf.improvement}
                                </p>
                              </div>
                            </div>

                            {/* Actionable Tip */}
                            <div className="p-3.5 rounded-xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-200/60 dark:border-indigo-800/40 text-xs text-indigo-950 dark:text-indigo-200 space-y-1">
                              <span className="font-bold flex items-center gap-1 text-[11px] text-indigo-600 dark:text-indigo-400">
                                <Lightbulb className="w-3.5 h-3.5" /> Recommended Refinement
                              </span>
                              <p className="leading-relaxed">
                                {qf.actionableTip}
                              </p>
                            </div>

                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Text-Only Limitation & Disclaimer Banner */}
              <div className="p-6 rounded-3xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-2 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                <div className="flex items-center gap-2 font-bold text-slate-700 dark:text-slate-300">
                  <Shield className="w-4 h-4 text-indigo-500" />
                  Practice Diagnostic Notice & Methodology
                </div>
                <p>
                  This assessment is based on your written interview responses. Voice-based pronunciation and delivery analysis will be available separately in a future version.
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-500">
                  This is an AI-generated practice assessment based on your written responses. It is not an official employment, IELTS, PTE, TOEFL or language-certification score.
                </p>
              </div>

              {/* Phase 2C Personal Improvement Plan CTA */}
              <div className="p-8 sm:p-10 rounded-3xl bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-900 text-white border border-indigo-500/30 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-6">
                <div className="space-y-2 text-center sm:text-left">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-400" /> Next Step: Turn Feedback Into Mastery
                  </div>
                  <h4 className="text-xl sm:text-2xl font-extrabold">
                    Ready to turn these weaknesses into strengths?
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-300 max-w-lg">
                    Generate a step-by-step 7-day personalized daily practice roadmap customized around your {assessmentData.biggestWeakness} and {setup.targetRole} role.
                  </p>
                </div>

                <button
                  onClick={() => setIsPhase2CPlanModalOpen(true)}
                  className="px-8 py-4 rounded-xl bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 hover:from-blue-400 hover:to-purple-400 text-white font-bold text-sm shadow-lg shadow-indigo-500/30 hover:scale-[1.02] transition-all flex items-center justify-center gap-2 shrink-0 cursor-pointer"
                >
                  <span>Build My Personal Improvement Plan</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

            </div>
          )}

        </div>

        {/* Phase 2C Improvement Plan Placeholder Modal */}
        {isPhase2CPlanModalOpen && (
          <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-6 animate-in fade-in zoom-in duration-200">
              <div className="w-12 h-12 rounded-2xl bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                <Calendar className="w-6 h-6" />
              </div>

              <div className="space-y-2">
                <h4 className="text-xl font-bold text-slate-900 dark:text-white">
                  Personalized 7-Day Improvement Engine
                </h4>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  Phase 2B assessment is active! The dedicated 7-day daily practice planner and drill engine will be connected in Phase 2C.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/60 text-xs text-indigo-900 dark:text-indigo-300 space-y-2">
                <div className="font-bold flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  Assessment Recorded: {assessmentData?.overallScore || 72}/100 Readiness
                </div>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                  Target Opportunity: <strong>{assessmentData?.biggestWeakness || 'Answer Structure'}</strong>. In Phase 2C, you'll receive interactive daily drills, sample high-scoring rewrites, and re-test triggers.
                </p>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  onClick={() => setIsPhase2CPlanModalOpen(false)}
                  className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md cursor-pointer transition-colors"
                >
                  Got It
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    );
  }

  // Render Setup / Landing View
  return (
    <div className="py-8 sm:py-12 space-y-16 lg:space-y-24">
      
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-slate-900 via-indigo-950/80 to-slate-900 text-white px-6 py-16 sm:px-12 sm:py-24 border border-indigo-500/20 shadow-2xl shadow-indigo-950/40">
        {/* Background glow ambient effects */}
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-indigo-500/20 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 rounded-full bg-purple-500/20 blur-3xl pointer-events-none" />

        <div className="max-w-4xl mx-auto text-center relative z-10 space-y-6">
          
          {/* Global Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-400/30 text-indigo-300 text-xs font-semibold tracking-wide">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
            <span>VStudyHub Global • AI Interview & English Coach</span>
          </div>

          {/* Headline */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight sm:leading-tight">
            Practice Your Interview.{' '}
            <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent">
              Improve Your English.
            </span>{' '}
            Get Ready to Get Hired.
          </h1>

          {/* Supporting Text */}
          <p className="text-base sm:text-xl text-slate-300 font-normal max-w-2xl mx-auto leading-relaxed">
            Practice realistic interviews with AI, discover your communication weaknesses, and get a personalized plan to improve before your real interview.
          </p>

          {/* Free Callout */}
          <div className="inline-block pt-1">
            <span className="text-xs sm:text-sm font-medium text-emerald-400 bg-emerald-950/60 px-3 py-1 rounded-full border border-emerald-500/30 flex items-center gap-1.5 justify-center mx-auto w-fit">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Start your first AI interview free • No credit card required
            </span>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <button
              onClick={scrollToSetup}
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold text-base shadow-lg shadow-indigo-600/30 hover:scale-[1.02] transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Start Free Interview</span>
              <ArrowRight className="w-5 h-5" />
            </button>
            <button
              onClick={scrollToHowItWorks}
              className="w-full sm:w-auto px-6 py-4 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-200 hover:text-white font-semibold text-base border border-slate-700 transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>How It Works</span>
              <HelpCircle className="w-5 h-5 text-slate-400" />
            </button>
          </div>

          {/* Market trust indicators */}
          <div className="pt-8 border-t border-slate-800/80 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400">
            <span className="flex items-center gap-1.5">
              <Globe2 className="w-4 h-4 text-indigo-400" /> Tailored for USA, Canada, UK, Australia & Global Roles
            </span>
            <span className="flex items-center gap-1.5">
              <Shield className="w-4 h-4 text-emerald-400" /> Private & Secure Practice Session
            </span>
          </div>

        </div>
      </section>

      {/* 2. TRUST / VALUE SECTION */}
      <section ref={howItWorksRef} className="space-y-8 scroll-mt-24">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h2 className="text-xs sm:text-sm font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
            Why Practice With AI
          </h2>
          <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Everything you need to interview with confidence
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Benefit 1 */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow space-y-4">
            <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
              <Briefcase className="w-6 h-6" />
            </div>
            <h4 className="text-lg font-bold text-slate-900 dark:text-white">
              1. Practice Real Interviews
            </h4>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Answer realistic questions designed around your role and interview type. Practice answering under standard interview pressure.
            </p>
          </div>

          {/* Benefit 2 */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow space-y-4">
            <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold">
              <BarChart3 className="w-6 h-6" />
            </div>
            <h4 className="text-lg font-bold text-slate-900 dark:text-white">
              2. Discover Your Weaknesses
            </h4>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Get objective AI feedback on English fluency, grammar, answer structure, relevance, and overall professional communication.
            </p>
          </div>

          {/* Benefit 3 */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow space-y-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
              <TrendingUp className="w-6 h-6" />
            </div>
            <h4 className="text-lg font-bold text-slate-900 dark:text-white">
              3. Build a Personal Improvement Plan
            </h4>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Turn your weaknesses into a focused 7-day practice roadmap so you know exactly what to refine before your actual hiring call.
            </p>
          </div>

        </div>
      </section>

      {/* 3. INTERVIEW TRACKS SECTION */}
      <section className="space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h2 className="text-xs sm:text-sm font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
              Targeted Tracks
            </h2>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Choose your interview focus
            </h3>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Click any track to configure your practice session below
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {TRACKS.map((t) => {
            const Icon = t.icon;
            const isSelected = setup.track === t.id;
            return (
              <div
                key={t.id}
                onClick={() => handleTrackSelect(t)}
                className={`group relative p-6 rounded-2xl cursor-pointer transition-all border flex flex-col justify-between ${
                  isSelected
                    ? 'bg-indigo-50/70 dark:bg-indigo-950/40 border-indigo-500 ring-2 ring-indigo-500 shadow-md'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow'
                }`}
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${t.color} text-white flex items-center justify-center shadow-sm`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      isSelected
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                    }`}>
                      {t.badge}
                    </span>
                  </div>

                  <div>
                    <h4 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      {t.title}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                      {t.desc}
                    </p>
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-semibold">
                  <span className={isSelected ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400'}>
                    {isSelected ? 'Selected' : 'Select Track'}
                  </span>
                  <ChevronRight className={`w-4 h-4 transition-transform ${isSelected ? 'text-indigo-600 translate-x-1' : 'text-slate-300'}`} />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 4. INTERVIEW SETUP FORM */}
      <section ref={setupRef} className="scroll-mt-24">
        <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl p-6 sm:p-10 space-y-8">
          
          <div className="border-b border-slate-100 dark:border-slate-800 pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 text-xs font-bold mb-2">
                <Target className="w-3.5 h-3.5" /> Step 1: Session Configuration
              </div>
              <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white">
                Customize Your AI Mock Interview
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                Configure your target role and region for tailored evaluation criteria.
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-3 py-1.5 rounded-xl border border-emerald-200 dark:border-emerald-800/60">
              <Zap className="w-4 h-4" /> 1 Free Session Available
            </div>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              startInterview();
            }}
            className="space-y-6"
          >
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              
              {/* Target Role */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Target Role <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={setup.targetRole}
                  onChange={(e) => setSetup({ ...setup, targetRole: e.target.value })}
                  placeholder="e.g. Software Engineer, Product Manager"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {['Software Engineer', 'Product Manager', 'Data Analyst', 'HR Manager'].map((role) => (
                    <button
                      key={role}
                      type="button"
                      onClick={() => setSetup({ ...setup, targetRole: role })}
                      className="text-[10px] px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                    >
                      +{role}
                    </button>
                  ))}
                </div>
              </div>

              {/* Experience Level */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Experience Level <span className="text-rose-500">*</span>
                </label>
                <select
                  value={setup.experienceLevel}
                  onChange={(e) => setSetup({ ...setup, experienceLevel: e.target.value as InterviewLevel })}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                >
                  <option value="student">Student / Recent Graduate</option>
                  <option value="entry">Entry Level (0-1 Years)</option>
                  <option value="mid-1-3">1–3 Years (Junior/Associate)</option>
                  <option value="senior-3-5">3–5 Years (Mid-Senior)</option>
                  <option value="lead-5plus">5+ Years (Senior / Lead)</option>
                </select>
              </div>

              {/* Country / Market */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Hiring Region / Country <span className="text-rose-500">*</span>
                </label>
                <select
                  value={setup.country}
                  onChange={(e) => setSetup({ ...setup, country: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                >
                  {COUNTRIES.map((c) => (
                    <option key={c.code} value={c.name}>
                      {c.flag} {c.name}
                    </option>
                  ))}
                </select>
              </div>

            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Interview Category / Type */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Interview Type
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: 'general' as InterviewCategory, label: 'General' },
                    { id: 'behavioral' as InterviewCategory, label: 'Behavioral' },
                    { id: 'technical' as InterviewCategory, label: 'Technical' },
                    { id: 'hr' as InterviewCategory, label: 'HR / Culture' }
                  ].map((type) => (
                    <button
                      key={type.id}
                      type="button"
                      onClick={() => setSetup({ ...setup, interviewType: type.id })}
                      className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all ${
                        setup.interviewType === type.id
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                          : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {type.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Optional Job Description */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Job Description / Role Requirements <span className="text-slate-400 font-normal">(Optional)</span>
                </label>
                <textarea
                  rows={2}
                  value={setup.jobDescription}
                  onChange={(e) => setSetup({ ...setup, jobDescription: e.target.value })}
                  placeholder="Paste snippets from the job listing for customized questions..."
                  className="w-full px-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

            </div>

            {/* Launch Action */}
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-100 dark:border-slate-800">
              <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Instant AI evaluation • Question-by-question scoring • Weakness diagnosis</span>
              </div>
              <button
                type="submit"
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold text-sm shadow-md shadow-indigo-500/20 hover:scale-[1.01] transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Launch Mock Interview</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

          </form>

        </div>
      </section>

      {/* 5. SAMPLE RESULTS PREVIEW (DEMO / SHOWCASE) */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
          <div>
            <div className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/60 px-2.5 py-1 rounded-md mb-1">
              <Award className="w-3.5 h-3.5" /> Demo Output Preview
            </div>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Example AI Practice Assessment
            </h3>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            See how your responses are scored and diagnosed
          </p>
        </div>

        {/* Sample Assessment Card */}
        <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md p-6 sm:p-8 space-y-8">
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-center border-b border-slate-100 dark:border-slate-800 pb-8">
            <div className="p-6 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white space-y-1 shadow-lg shadow-indigo-500/20 text-center">
              <span className="text-xs uppercase tracking-wider font-semibold opacity-90">
                AI Readiness Score
              </span>
              <div className="text-4xl font-extrabold tracking-tight">72 / 100</div>
              <span className="text-xs text-indigo-100 font-medium">Practice Assessment</span>
            </div>

            <div className="md:col-span-3 space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded">
                  Strongest Area: Relevance (81)
                </span>
                <span className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded">
                  Opportunity: Answer Structure (59)
                </span>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                "You communicated strong technical depth and directly addressed the core questions. To reach top-tier hiring confidence, focus on framing answers with quantifiable business impact and adopting the STAR method."
              </p>
            </div>
          </div>

          {/* Scores breakdown bar matrix */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {[
              { label: 'Relevance', score: 81, color: 'bg-emerald-500' },
              { label: 'Grammar', score: 74, color: 'bg-indigo-500' },
              { label: 'Vocabulary', score: 71, color: 'bg-indigo-500' },
              { label: 'Fluency', score: 68, color: 'bg-blue-500' },
              { label: 'Communication', score: 67, color: 'bg-blue-500' },
              { label: 'Structure', score: 59, color: 'bg-amber-500' },
            ].map((metric) => (
              <div key={metric.label} className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">{metric.label}</span>
                  <span className="font-bold text-slate-900 dark:text-white">{metric.score}</span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                  <div className={`${metric.color} h-full rounded-full`} style={{ width: `${metric.score}%` }} />
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* 6. FAQ & PRACTICE ASSISTANCE */}
      <section className="rounded-3xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 p-6 sm:p-10 space-y-6">
        <div className="space-y-1">
          <h3 className="text-xl font-bold text-slate-900 dark:text-white">
            Frequently Asked Questions
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Learn more about the AI interview evaluation system
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs sm:text-sm">
          <div className="space-y-2">
            <h4 className="font-bold text-slate-900 dark:text-white">
              How does the AI choose the interview questions?
            </h4>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              Questions are dynamically adapted in real time based on your selected track, target role, experience level, hiring country, and how you responded to preceding questions.
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="font-bold text-slate-900 dark:text-white">
              Is this an official IELTS/PTE or certification score?
            </h4>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              No. This is an AI-powered practice tool designed to provide objective, actionable feedback for interview preparation and professional communication.
            </p>
          </div>
        </div>
      </section>

    </div>
  );
};

export default AiInterviewView;
