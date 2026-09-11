import React, { useState } from 'react';
import { 
  Atom, Search, Moon, Sun, Menu, X, Sparkles, BookOpen, 
  Calculator, BrainCircuit, HelpCircle, Trophy, Layers, Filter, Award, Shield, Newspaper, FileText, Target, Languages
} from 'lucide-react';
import { ExamType, ClassLevel, StudentProfile } from '../types';

interface HeaderProps {
  selectedExam: ExamType;
  onExamChange: (exam: ExamType) => void;
  selectedClass: ClassLevel | 'all';
  onClassChange: (cls: ClassLevel | 'all') => void;
  activeTab: string;
  onTabChange: (tab: string) => void;
  onOpenSearch: () => void;
  onOpenAccountModal: () => void;
  profile: StudentProfile;
  streakDays: number;
  darkMode: boolean;
  onToggleDarkMode: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  selectedExam,
  onExamChange,
  activeTab,
  onTabChange,
  onOpenSearch,
  onOpenAccountModal,
  profile,
  darkMode,
  onToggleDarkMode,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'home', label: 'Overview', icon: BookOpen },
    { id: 'progress', label: 'Dashboard', icon: Trophy },
    { id: 'subjects', label: 'Subjects & Notes', icon: Layers },
    { id: 'resources', label: 'Free Resources', icon: FileText, badge: 'PDF' },
    { id: 'formulas', label: 'Formulas', icon: Calculator },
    { id: 'blog', label: 'Blog', icon: Newspaper },
    { id: 'ai-tutor', label: 'AI Tutor', icon: Sparkles, badge: 'AI' },
    { id: 'ai-career-coach', label: 'AI Career Coach', icon: Target },
    { id: 'ai-english-coach', label: 'AI English Coach', icon: Languages, badge: 'GLOBAL' },
    { id: 'ai-interview', label: 'AI Interview', icon: BrainCircuit },
    { id: 'gamification', label: 'Leaderboard', icon: Award },
    { id: 'quizzes', label: 'Quizzes', icon: HelpCircle },
  ];

  if (profile.role === 'teacher' || profile.role === 'admin') {
    navItems.push({ id: 'admin', label: 'Admin Portal', icon: Shield, badge: 'FACULTY' });
  }

  const getHrefForTab = (tabId: string): string => {
    switch (tabId) {
      case 'home': return '/';
      case 'subjects': return '/subjects';
      case 'resources': return '/resources';
      case 'formulas': return '/formulas';
      case 'blog': return '/blog';
      case 'ai-tutor': return '/ai-tutor';
      case 'ai-career-coach': return '/ai-career-coach';
      case 'ai-english-coach': return '/ai-english-coach';
      case 'ai-interview': return '/ai-interview';
      case 'gamification': return '/gamification';
      case 'quizzes': return '/quizzes';
      case 'progress': return '/progress';
      case 'admin': return '/admin';
      default: return '/';
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <a 
            href="/"
            onClick={(e) => {
              e.preventDefault();
              onTabChange('home');
            }}
            className="flex items-center gap-2.5 cursor-pointer group select-none"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
              <Atom className="w-6 h-6 animate-spin-slow" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  VStudyHub
                </span>
                <span className="text-[10px] font-semibold uppercase tracking-widest px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300">
                  EdTech
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                JEE & NEET Exam Platform
              </p>
            </div>
          </a>

          <nav className="hidden lg:flex items-center gap-0.5 xl:gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <a
                  key={item.id}
                  href={getHrefForTab(item.id)}
                  onClick={(e) => {
                    e.preventDefault();
                    onTabChange(item.id);
                  }}
                  className={`flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-xs font-semibold transition-all relative whitespace-nowrap ${
                    isActive
                      ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 font-bold'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className="text-[9px] font-black px-1.5 py-0.2 rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 text-white">
                      {item.badge}
                    </span>
                  )}
                </a>
              );
            })}
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            <div className="hidden sm:flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-lg border border-slate-200/80 dark:border-slate-700/80 text-xs font-semibold">
              <button
                onClick={() => onExamChange('JEE')}
                className={`px-2.5 py-1 rounded-md transition-all ${
                  selectedExam === 'JEE'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                JEE
              </button>
              <button
                onClick={() => onExamChange('NEET')}
                className={`px-2.5 py-1 rounded-md transition-all ${
                  selectedExam === 'NEET'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                NEET
              </button>
              <button
                onClick={() => onExamChange('ALL')}
                className={`px-2.5 py-1 rounded-md transition-all ${
                  selectedExam === 'ALL'
                    ? 'bg-slate-800 dark:bg-slate-700 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                All
              </button>
            </div>

            <button
              onClick={onOpenSearch}
              className="p-2 sm:px-3 sm:py-1.5 flex items-center gap-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs transition-colors border border-slate-200 dark:border-slate-700"
              title="Search notes, formulas, topics"
            >
              <Search className="w-4 h-4 text-slate-500" />
              <span className="hidden md:inline">Search...</span>
            </button>

            <button
              onClick={onOpenAccountModal}
              className="flex items-center gap-2 p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors border border-slate-200/80 dark:border-slate-700/80"
              title="Student Profile & Account Settings"
            >
              <img
                src={profile.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150'}
                alt={profile.name}
                className="w-7 h-7 rounded-lg object-cover ring-2 ring-indigo-500/50"
              />
              <span className="hidden md:inline text-xs font-extrabold text-slate-800 dark:text-slate-200 pr-1">
                {profile.name.split(' ')[0]}
              </span>
            </button>

            <button
              onClick={onToggleDarkMode}
              className="p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Toggle theme"
            >
              {darkMode ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-slate-600" />}
            </button>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="lg:hidden bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 pt-2 pb-6 space-y-3">
          <div className="flex items-center justify-between p-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" /> Target Exam:
            </span>
            <div className="flex items-center gap-1 text-xs font-semibold">
              <button
                onClick={() => onExamChange('JEE')}
                className={`px-3 py-1 rounded-md ${selectedExam === 'JEE' ? 'bg-blue-600 text-white' : 'text-slate-600 dark:text-slate-300'}`}
              >
                JEE
              </button>
              <button
                onClick={() => onExamChange('NEET')}
                className={`px-3 py-1 rounded-md ${selectedExam === 'NEET' ? 'bg-emerald-600 text-white' : 'text-slate-600 dark:text-slate-300'}`}
              >
                NEET
              </button>
              <button
                onClick={() => onExamChange('ALL')}
                className={`px-3 py-1 rounded-md ${selectedExam === 'ALL' ? 'bg-slate-700 text-white' : 'text-slate-600 dark:text-slate-300'}`}
              >
                All
              </button>
            </div>
          </div>

          <div className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <a
                  key={item.id}
                  href={getHrefForTab(item.id)}
                  onClick={(e) => {
                    e.preventDefault();
                    onTabChange(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 font-semibold'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-5 h-5 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-indigo-500 text-white">
                      {item.badge}
                    </span>
                  )}
                </a>
              );
            })}
          </div>
        </div>
      )}
    </header>
  );
};