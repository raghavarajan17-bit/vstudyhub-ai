import React from 'react';
import { Atom, BookOpen, ShieldCheck, Zap, Sparkles, GraduationCap } from 'lucide-react';

interface FooterProps {
  onTabChange: (tab: string) => void;
  onExamChange: (exam: 'JEE' | 'NEET' | 'ALL') => void;
}

export const Footer: React.FC<FooterProps> = ({ onTabChange, onExamChange }) => {
  return (
    <footer className="bg-slate-900 text-slate-400 border-t border-slate-800 pt-12 pb-8 mt-16 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 pb-10 border-b border-slate-800">
          
          {/* Brand Col */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white">
                <Atom className="w-5 h-5" />
              </div>
              <span className="text-xl font-bold text-white tracking-tight">
                VStudyHub
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              India's premier open study platform for JEE (Main & Advanced) and NEET aspirants. Master Physics, Chemistry, Mathematics, and Biology with interactive formula sheets, AI doubt solving, and structured NCERT revisions.
            </p>
            <div className="flex items-center gap-3 pt-1">
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-md bg-blue-950 text-blue-400 border border-blue-800">
                <ShieldCheck className="w-3.5 h-3.5" /> NCERT Aligned
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-md bg-purple-950 text-purple-400 border border-purple-800">
                <Sparkles className="w-3.5 h-3.5" /> Gemini 3.6 AI Powered
              </span>
            </div>
          </div>

          {/* Exam Prep Links */}
          <div>
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-3">
              Exam Portals
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button 
                  onClick={() => { onExamChange('JEE'); onTabChange('subjects'); }}
                  className="hover:text-blue-400 transition-colors"
                >
                  JEE Main 2026 Preparation
                </button>
              </li>
              <li>
                <button 
                  onClick={() => { onExamChange('JEE'); onTabChange('subjects'); }}
                  className="hover:text-blue-400 transition-colors"
                >
                  JEE Advanced High-Weightage Chapters
                </button>
              </li>
              <li>
                <button 
                  onClick={() => { onExamChange('NEET'); onTabChange('subjects'); }}
                  className="hover:text-emerald-400 transition-colors"
                >
                  NEET UG Botany & Zoology Notes
                </button>
              </li>
              <li>
                <button 
                  onClick={() => { onExamChange('ALL'); onTabChange('formulas'); }}
                  className="hover:text-purple-400 transition-colors"
                >
                  Interactive Formula Cheat Sheet
                </button>
              </li>
            </ul>
          </div>

          {/* Quick Tools */}
          <div>
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-3">
              Study Tools
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button onClick={() => onTabChange('ai-tutor')} className="hover:text-white transition-colors flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3 text-purple-400" /> AI Step-by-Step Doubt Solver
                </button>
              </li>
              <li>
                <button onClick={() => onTabChange('blog')} className="hover:text-blue-400 transition-colors">
                  Blog & Exam Strategy Articles
                </button>
              </li>
              <li>
                <button onClick={() => onTabChange('flashcards')} className="hover:text-white transition-colors">
                  Active Recall Flashcards
                </button>
              </li>
              <li>
                <button onClick={() => onTabChange('quizzes')} className="hover:text-white transition-colors">
                  Timed Practice Quizzes
                </button>
              </li>
              <li>
                <button onClick={() => onTabChange('progress')} className="hover:text-white transition-colors">
                  Daily Progress & Goal Tracker
                </button>
              </li>
            </ul>
          </div>

          {/* Subjects */}
          <div>
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-3">
              Subjects
            </h4>
            <ul className="space-y-2 text-xs">
              <li><button onClick={() => onTabChange('subjects')} className="hover:text-blue-400">Physics for JEE & NEET</button></li>
              <li><button onClick={() => onTabChange('subjects')} className="hover:text-emerald-400">Chemistry (Organic, Physical, Inorganic)</button></li>
              <li><button onClick={() => onTabChange('subjects')} className="hover:text-indigo-400">Mathematics (Calculus, Vectors, Algebra)</button></li>
              <li><button onClick={() => onTabChange('subjects')} className="hover:text-amber-400">Biology (Genetics, Physiology, Cell)</button></li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-6 flex flex-col md:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© 2026 VStudyHub. Empowering thousands of engineering & medical aspirants daily.</p>
          <div className="flex items-center gap-6">
            <span>Terms of Service</span>
            <span>Privacy Policy</span>
            <span>Sitemap</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
