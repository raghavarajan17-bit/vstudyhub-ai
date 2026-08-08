import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { 
  HelpCircle, Timer, CheckCircle2, XCircle, Trophy, Award, 
  RotateCcw, ArrowRight, Sparkles, AlertCircle, Clock
} from 'lucide-react';
import { Quiz, QuizQuestion, SubjectId, ExamType } from '../types';
import { MOCK_QUIZZES } from '../data/mockData';
import { MathFormula } from './MathFormula';

interface QuizEngineProps {
  selectedExam: ExamType;
  chapterIdFilter?: string;
  onRecordQuizScore: (quizId: string, score: number, total: number, percentage: number) => void;
}

export const QuizEngine: React.FC<QuizEngineProps> = ({
  selectedExam,
  chapterIdFilter,
  onRecordQuizScore,
}) => {
  const [quizzes, setQuizzes] = useState<Quiz[]>(MOCK_QUIZZES);
  const [activeQuiz, setActiveQuiz] = useState<Quiz | null>(MOCK_QUIZZES[0]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [timeLeftSecs, setTimeLeftSecs] = useState(600); // 10 mins default

  // Custom AI Quiz Generator state
  const [generatingAiQuiz, setGeneratingAiQuiz] = useState(false);
  const [aiTopicInput, setAiTopicInput] = useState('');

  useEffect(() => {
    if (chapterIdFilter) {
      const found = quizzes.find((q) => q.chapterId === chapterIdFilter);
      if (found) {
        setActiveQuiz(found);
        setCurrentQuestionIndex(0);
        setSelectedAnswers({});
        setIsSubmitted(false);
        setTimeLeftSecs(found.timeLimitMins * 60);
      }
    }
  }, [chapterIdFilter, quizzes]);

  // Timer countdown
  useEffect(() => {
    if (isSubmitted || !activeQuiz) return;
    const interval = setInterval(() => {
      setTimeLeftSecs((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          handleSubmitQuiz();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isSubmitted, activeQuiz]);

  const handleOptionSelect = (qIndex: number, optionIndex: number) => {
    if (isSubmitted) return;
    setSelectedAnswers((prev) => ({
      ...prev,
      [qIndex]: optionIndex,
    }));
  };

  const handleSubmitQuiz = () => {
    if (!activeQuiz || isSubmitted) return;
    setIsSubmitted(true);

    // Calculate Marking Scheme (+4 / -1)
    let score = 0;
    let correctCount = 0;
    activeQuiz.questions.forEach((q, idx) => {
      const chosen = selectedAnswers[idx];
      if (chosen !== undefined) {
        if (chosen === q.correctAnswerIndex) {
          score += 4;
          correctCount += 1;
        } else {
          score -= 1;
        }
      }
    });

    const maxScore = activeQuiz.questions.length * 4;
    const percentage = Math.max(0, Math.round((score / maxScore) * 100));

    onRecordQuizScore(activeQuiz.id, score, maxScore, percentage);

    // Trigger celebration
    if (percentage >= 50) {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
    }
  };

  const handleRestartQuiz = () => {
    setSelectedAnswers({});
    setIsSubmitted(false);
    setCurrentQuestionIndex(0);
    if (activeQuiz) {
      setTimeLeftSecs(activeQuiz.timeLimitMins * 60);
    }
  };

  const handleGenerateCustomAiQuiz = async () => {
    if (!aiTopicInput.trim() || generatingAiQuiz) return;
    setGeneratingAiQuiz(true);

    try {
      const res = await fetch('/api/ai/generate-quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: activeQuiz?.subjectId || 'physics',
          topic: aiTopicInput,
          exam: selectedExam,
          questionCount: 3,
        }),
      });

      const data = await res.json();
      if (data.success && data.quiz?.questions) {
        const newQuiz: Quiz = {
          id: `ai-quiz-${Date.now()}`,
          title: data.quiz.title || `AI Quiz: ${aiTopicInput}`,
          subjectId: activeQuiz?.subjectId || 'physics',
          chapterId: 'ai-gen',
          chapterName: aiTopicInput,
          applicableExams: ['JEE', 'NEET'],
          timeLimitMins: 10,
          questions: data.quiz.questions,
        };

        setQuizzes((prev) => [newQuiz, ...prev]);
        setActiveQuiz(newQuiz);
        setSelectedAnswers({});
        setIsSubmitted(false);
        setTimeLeftSecs(600);
        setAiTopicInput('');
      }
    } catch (err) {
      alert('Failed to generate AI quiz. Please check backend connection.');
    } finally {
      setGeneratingAiQuiz(false);
    }
  };

  const formatTimer = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remainingSecs.toString().padStart(2, '0')}`;
  };

  if (!activeQuiz) return null;

  const currentQuestion: QuizQuestion = activeQuiz.questions[currentQuestionIndex];

  return (
    <div className="py-6 max-w-4xl mx-auto space-y-6">
      
      {/* Quiz Header Bar */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-900 to-purple-900 text-white p-6 sm:p-8 rounded-2xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold mb-2 border border-emerald-500/30">
            <Trophy className="w-3.5 h-3.5" /> Exam Test Mode (+4 / -1 Scheme)
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            {activeQuiz.title}
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            {activeQuiz.chapterName} • {activeQuiz.questions.length} Questions
          </p>
        </div>

        {/* Timer Box */}
        <div className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-extrabold font-mono shadow-md border ${
          timeLeftSecs < 120 
            ? 'bg-rose-600 text-white border-rose-400 animate-pulse' 
            : 'bg-white/10 text-emerald-300 border-white/20'
        }`}>
          <Timer className="w-5 h-5" />
          <span>{formatTimer(timeLeftSecs)}</span>
        </div>
      </div>

      {/* AI Quiz Generator Callout Box */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold text-purple-600 dark:text-purple-400">
          <Sparkles className="w-4 h-4 text-purple-500" />
          <span>Generate Custom AI Practice Quiz on Any Topic:</span>
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={aiTopicInput}
            onChange={(e) => setAiTopicInput(e.target.value)}
            placeholder="Enter topic (e.g. 'Rotational Dynamics', 'Aldol Condensation', 'Gauss Law')..."
            className="flex-1 px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs focus:outline-none dark:text-white"
          />
          <button
            onClick={handleGenerateCustomAiQuiz}
            disabled={!aiTopicInput.trim() || generatingAiQuiz}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 shrink-0"
          >
            {generatingAiQuiz ? <Sparkles className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
            <span>Generate Quiz</span>
          </button>
        </div>
      </div>

      {/* Score Summary Box (If Submitted) */}
      {isSubmitted && (
        <div className="bg-emerald-50 dark:bg-emerald-950/50 border-2 border-emerald-500 rounded-2xl p-6 text-slate-900 dark:text-white space-y-4 shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Award className="w-8 h-8 text-emerald-600" />
              <div>
                <h3 className="text-xl font-bold">Quiz Performance Summary</h3>
                <p className="text-xs text-slate-600 dark:text-slate-300">
                  Detailed breakdown of correct answers & exam marking
                </p>
              </div>
            </div>

            <button
              onClick={handleRestartQuiz}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
            >
              <RotateCcw className="w-4 h-4" /> Retake Test
            </button>
          </div>
        </div>
      )}

      {/* Main Question Card */}
      {currentQuestion && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
          
          {/* Question Number & Tags */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 text-xs">
            <span className="font-bold text-blue-600 dark:text-blue-400 font-mono">
              Question {currentQuestionIndex + 1} of {activeQuiz.questions.length}
            </span>

            {currentQuestion.examTag && (
              <span className="px-2.5 py-1 rounded bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 font-extrabold uppercase text-[10px]">
                {currentQuestion.examTag}
              </span>
            )}
          </div>

          {/* Question Statement */}
          <div className="space-y-3">
            <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white leading-relaxed">
              {currentQuestion.questionText}
            </h3>

            {currentQuestion.latex && (
              <div className="p-3 bg-slate-900 text-white rounded-xl inline-block">
                <MathFormula math={currentQuestion.latex} displayMode={false} className="text-blue-300" />
              </div>
            )}
          </div>

          {/* Options */}
          <div className="space-y-3">
            {currentQuestion.options.map((opt, optIdx) => {
              const chosen = selectedAnswers[currentQuestionIndex] === optIdx;
              const isCorrectOpt = currentQuestion.correctAnswerIndex === optIdx;

              let optionStyle = 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:border-blue-500';

              if (isSubmitted) {
                if (isCorrectOpt) {
                  optionStyle = 'bg-emerald-100 dark:bg-emerald-950/80 border-emerald-500 text-emerald-900 dark:text-emerald-200 font-bold';
                } else if (chosen && !isCorrectOpt) {
                  optionStyle = 'bg-rose-100 dark:bg-rose-950/80 border-rose-500 text-rose-900 dark:text-rose-200 font-bold';
                }
              } else if (chosen) {
                optionStyle = 'bg-blue-50 dark:bg-blue-950/80 border-blue-600 text-blue-900 dark:text-blue-200 font-bold shadow-sm';
              }

              return (
                <div
                  key={optIdx}
                  onClick={() => handleOptionSelect(currentQuestionIndex, optIdx)}
                  className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex items-center justify-between text-xs sm:text-sm ${optionStyle}`}
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-white flex items-center justify-center text-xs font-bold shrink-0">
                      {String.fromCharCode(65 + optIdx)}
                    </span>
                    <span>{opt}</span>
                  </div>

                  {isSubmitted && isCorrectOpt && <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />}
                  {isSubmitted && chosen && !isCorrectOpt && <XCircle className="w-5 h-5 text-rose-600 shrink-0" />}
                </div>
              );
            })}
          </div>

          {/* Answer Explanation (Visible after submit) */}
          {isSubmitted && (
            <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/60 text-xs sm:text-sm text-slate-800 dark:text-slate-200 space-y-2">
              <span className="font-bold text-blue-900 dark:text-blue-300 block">
                Detailed Answer Explanation:
              </span>
              <p className="leading-relaxed whitespace-pre-line">{currentQuestion.explanation}</p>
            </div>
          )}

          {/* Bottom Question Nav Bar */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={() => setCurrentQuestionIndex((prev) => Math.max(0, prev - 1))}
              disabled={currentQuestionIndex === 0}
              className="px-4 py-2 bg-slate-100 dark:bg-slate-800 disabled:opacity-40 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-xl"
            >
              Previous
            </button>

            {!isSubmitted ? (
              <button
                onClick={handleSubmitQuiz}
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-md transition-all"
              >
                Submit Exam & Calculate Marks
              </button>
            ) : (
              <button
                onClick={() => setCurrentQuestionIndex((prev) => Math.min(activeQuiz.questions.length - 1, prev + 1))}
                disabled={currentQuestionIndex === activeQuiz.questions.length - 1}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white text-xs font-bold rounded-xl flex items-center gap-1.5"
              >
                <span>Next Question</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>

        </div>
      )}

    </div>
  );
};
