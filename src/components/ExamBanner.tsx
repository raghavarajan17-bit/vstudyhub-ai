import React from 'react';
import { Sparkles, Search, BookOpen, Brain, Zap, ArrowRight, CheckCircle2, Calculator } from 'lucide-react';
import { ExamType, ClassLevel } from '../types';
import { QUICK_DAILY_MOTIVATION } from '../data/mockData';

interface ExamBannerProps {
  selectedExam: ExamType;
  onExamChange: (exam: ExamType) => void;
  selectedClass: ClassLevel | 'all';
  onClassChange: (cls: ClassLevel | 'all') => void;
  onOpenSearch: () => void;
  onTabChange: (tab: string) => void;
}

export const ExamBanner: React.FC<ExamBannerProps> = ({
  selectedExam,
  onExamChange,
  selectedClass,
  onClassChange,
  onOpenSearch,
  onTabChange,
}) => {
  const randomMotivation = QUICK_DAILY_MOTIVATION[0];

  return (
    <div className="relative overflow-hidden bg-gradient-to-b from-slate-900 via-indigo-950 to-slate-900 text-white pt-8 pb-12 px-4 sm:px-6 lg:px-8 border-b border-indigo-900/50">
      
      {/* Subtle Background Glows */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full filter blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full filter blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        
        {/* Top Announcement pill */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs font-medium text-indigo-200">
            <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-spin-slow" />
            <span>Updated for 2026 JEE Main / NEET Syllabus</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
          </div>

          {/* Class Switcher */}
          <div className="flex items-center gap-1 bg-white/10 backdrop-blur-md p-1 rounded-lg border border-white/15 text-xs font-semibold">
            <span className="text-slate-400 px-2">Class:</span>
            <button
              onClick={() => onClassChange('all')}
              className={`px-2.5 py-1 rounded-md transition-all ${
                selectedClass === 'all' ? 'bg-indigo-600 text-white shadow' : 'text-slate-300 hover:text-white'
              }`}
            >
              All
            </button>
            <button
              onClick={() => onClassChange('class_11')}
              className={`px-2.5 py-1 rounded-md transition-all ${
                selectedClass === 'class_11' ? 'bg-indigo-600 text-white shadow' : 'text-slate-300 hover:text-white'
              }`}
            >
              Class 11
            </button>
            <button
              onClick={() => onClassChange('class_12')}
              className={`px-2.5 py-1 rounded-md transition-all ${
                selectedClass === 'class_12' ? 'bg-indigo-600 text-white shadow' : 'text-slate-300 hover:text-white'
              }`}
            >
              Class 12
            </button>
          </div>
        </div>

        {/* Main Hero Header */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          <div className="lg:col-span-7 space-y-5">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
              Master <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-300 to-indigo-300">Physics, Chemistry, Math & Bio</span> for Top AIR Ranks
            </h1>
            
            <p className="text-sm sm:text-base text-slate-300 max-w-2xl leading-relaxed">
              NCERT-aligned notes, 3,500+ formulas with KaTeX step breakdowns, spaced-repetition flashcards, and instant step-by-step AI doubt solutions.
            </p>

            {/* Quick Search Input */}
            <div 
              onClick={onOpenSearch}
              className="flex items-center gap-3 p-3 bg-white/10 hover:bg-white/15 backdrop-blur-lg border border-white/20 rounded-xl cursor-pointer transition-all shadow-xl group max-w-xl"
            >
              <Search className="w-5 h-5 text-indigo-300 group-hover:scale-110 transition-transform" />
              <span className="text-sm text-slate-300 flex-1">
                Search any topic (e.g. "Kinematics", "SN1 Mechanism", "YDSE", "Lac Operon")...
              </span>
              <kbd className="px-2 py-1 text-xs bg-indigo-900/60 border border-indigo-700 text-indigo-200 rounded font-mono">
                ⌘K
              </kbd>
            </div>

            {/* Daily Quote / Tip */}
            <div className="text-xs text-amber-200/90 italic bg-amber-950/40 border border-amber-500/20 px-3.5 py-2 rounded-lg max-w-xl">
              {randomMotivation}
            </div>
          </div>

          {/* Right Action Cards */}
          <div className="lg:col-span-5 grid grid-cols-2 gap-3.5">
            
            <div 
              onClick={() => onTabChange('ai-tutor')}
              className="p-4 rounded-xl bg-gradient-to-br from-indigo-900/80 to-purple-900/80 border border-indigo-500/30 hover:border-indigo-400 cursor-pointer transition-all hover:-translate-y-1 group shadow-lg"
            >
              <div className="w-10 h-10 rounded-lg bg-indigo-500/20 text-indigo-300 flex items-center justify-center mb-3 group-hover:bg-indigo-500 group-hover:text-white transition-colors">
                <Sparkles className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-white mb-1 flex items-center justify-between">
                AI Doubt Assistant <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
              </h3>
              <p className="text-xs text-slate-300">
                Ask numericals or conceptual questions in Physics, Chem, Math & Bio.
              </p>
            </div>

            <div 
              onClick={() => onTabChange('formulas')}
              className="p-4 rounded-xl bg-gradient-to-br from-blue-900/80 to-cyan-900/80 border border-blue-500/30 hover:border-blue-400 cursor-pointer transition-all hover:-translate-y-1 group shadow-lg"
            >
              <div className="w-10 h-10 rounded-lg bg-blue-500/20 text-blue-300 flex items-center justify-center mb-3 group-hover:bg-blue-500 group-hover:text-white transition-colors">
                <Calculator className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-white mb-1 flex items-center justify-between">
                Formula Cheat Sheet <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
              </h3>
              <p className="text-xs text-slate-300">
                3,500+ formulas with variable meanings & KaTeX math rendering.
              </p>
            </div>

            <div 
              onClick={() => onTabChange('flashcards')}
              className="p-4 rounded-xl bg-gradient-to-br from-purple-900/80 to-pink-900/80 border border-purple-500/30 hover:border-purple-400 cursor-pointer transition-all hover:-translate-y-1 group shadow-lg"
            >
              <div className="w-10 h-10 rounded-lg bg-purple-500/20 text-purple-300 flex items-center justify-center mb-3 group-hover:bg-purple-500 group-hover:text-white transition-colors">
                <Brain className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-white mb-1 flex items-center justify-between">
                Flashcard Engine <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
              </h3>
              <p className="text-xs text-slate-300">
                Active recall & spaced repetition flashcard practice.
              </p>
            </div>

            <div 
              onClick={() => onTabChange('quizzes')}
              className="p-4 rounded-xl bg-gradient-to-br from-emerald-900/80 to-teal-900/80 border border-emerald-500/30 hover:border-emerald-400 cursor-pointer transition-all hover:-translate-y-1 group shadow-lg"
            >
              <div className="w-10 h-10 rounded-lg bg-emerald-500/20 text-emerald-300 flex items-center justify-center mb-3 group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                <Zap className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-white mb-1 flex items-center justify-between">
                Timed Quizzes <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
              </h3>
              <p className="text-xs text-slate-300">
                Mock tests with JEE/NEET marking scheme (+4 / -1).
              </p>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};
