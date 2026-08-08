import React, { useState } from 'react';
import { 
  Trophy, Flame, Clock, Bookmark, BookOpen, CheckCircle2, 
  BarChart2, Target, Calendar, Sparkles, ChevronRight, Calculator,
  AlertTriangle, RefreshCw, CheckSquare, Square, Zap, Award, ArrowUpRight
} from 'lucide-react';
import { UserProgress, ExamType, StudyTask, WeakTopic } from '../types';
import { MOCK_FORMULAS, MOCK_NOTES } from '../data/mockData';

interface ProgressDashboardProps {
  progress: UserProgress;
  onUpdateProgress: (updater: (prev: UserProgress) => UserProgress) => void;
  onSelectNote: (noteId: string) => void;
  onTabChange: (tab: string) => void;
}

export const ProgressDashboard: React.FC<ProgressDashboardProps> = ({
  progress,
  onUpdateProgress,
  onSelectNote,
  onTabChange,
}) => {
  const goalProgressPercentage = Math.min(
    100,
    Math.round((progress.todayStudiedMins / progress.dailyGoalMins) * 100)
  );

  const bookmarkedFormulas = MOCK_FORMULAS.filter((f) => progress.bookmarkedFormulas.includes(f.id));
  const bookmarkedNotes = MOCK_NOTES.filter((n) => progress.bookmarkedNotes.includes(n.id));

  // Toggle study task completion
  const handleToggleTask = (taskId: string) => {
    onUpdateProgress((prev) => {
      const updatedTasks = prev.todayTasks.map((t) => {
        if (t.id === taskId) {
          const nextCompleted = !t.completed;
          return { ...t, completed: nextCompleted };
        }
        return t;
      });

      // Grant XP if completed
      const newlyCompleted = updatedTasks.find((t) => t.id === taskId)?.completed;
      const addedXp = newlyCompleted ? 50 : -50;
      const newXp = Math.max(0, prev.profile.xp + addedXp);

      return {
        ...prev,
        todayTasks: updatedTasks,
        profile: {
          ...prev.profile,
          xp: newXp,
        },
      };
    });
  };

  return (
    <div className="py-6 max-w-6xl mx-auto space-y-6">
      
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 sm:p-8 rounded-3xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-semibold mb-2 border border-amber-500/30">
            <Trophy className="w-3.5 h-3.5 text-amber-300" /> Student EdTech Learning Dashboard
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Welcome Back, {progress.profile.name}! 👋
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            Targeting {progress.profile.targetExam} • Goal: {progress.profile.targetRankGoal} ({progress.profile.targetCollege})
          </p>
        </div>

        {/* Streak & Level Counter */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 shrink-0">
            <Flame className="w-8 h-8 text-amber-400 fill-amber-400 animate-bounce" />
            <div>
              <span className="text-2xl font-black block text-white">{progress.streakDays} Days</span>
              <span className="text-[10px] text-amber-200/80 font-bold uppercase">Study Streak</span>
            </div>
          </div>

          <div className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-purple-500/10 border border-purple-500/30 text-purple-300 shrink-0">
            <Zap className="w-8 h-8 text-purple-400 fill-purple-400" />
            <div>
              <span className="text-2xl font-black block text-white">{progress.profile.xp} XP</span>
              <span className="text-[10px] text-purple-200/80 font-bold uppercase">Lvl {progress.profile.level} {progress.profile.levelTitle}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Grid Stats & Today's Study Plan */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Today's Study Plan Checklist */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2 text-slate-900 dark:text-white font-extrabold text-base">
              <CheckSquare className="w-5 h-5 text-indigo-600" />
              <span>Today's High-Yield Study Plan</span>
            </div>
            <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950 px-3 py-1 rounded-full">
              {progress.todayTasks.filter((t) => t.completed).length}/{progress.todayTasks.length} Completed
            </span>
          </div>

          <div className="space-y-2.5">
            {progress.todayTasks.map((task) => (
              <div
                key={task.id}
                onClick={() => handleToggleTask(task.id)}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 text-xs ${
                  task.completed
                    ? 'bg-emerald-50/60 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800 text-slate-500 line-through'
                    : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 hover:border-indigo-500 text-slate-800 dark:text-slate-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  {task.completed ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  ) : (
                    <Square className="w-5 h-5 text-slate-400 shrink-0" />
                  )}
                  <div>
                    <p className="font-extrabold text-sm">{task.title}</p>
                    <p className="text-[10px] text-slate-400 uppercase font-mono mt-0.5">
                      [{task.subjectId}] • ~{task.estimatedMins} Mins • +50 XP
                    </p>
                  </div>
                </div>

                <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                  task.type === 'quiz' ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300' : 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                }`}>
                  {task.type.toUpperCase()}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Daily Target Progress Card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-slate-900 dark:text-white font-extrabold text-sm">
              <Target className="w-5 h-5 text-indigo-500" />
              <span>Daily Target Progress</span>
            </div>
            <span className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400">
              {progress.todayStudiedMins} / {progress.dailyGoalMins} mins
            </span>
          </div>

          <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-3.5 overflow-hidden p-0.5">
            <div
              className="bg-gradient-to-r from-blue-600 to-indigo-600 h-full rounded-full transition-all duration-500"
              style={{ width: `${goalProgressPercentage}%` }}
            />
          </div>

          <p className="text-xs text-slate-500">
            {goalProgressPercentage}% of daily goal completed. Keep going to maintain your <strong>{progress.streakDays}-day streak!</strong>
          </p>

          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2">
            <p className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
              <RefreshCw className="w-3.5 h-3.5 text-purple-500" /> Spaced Repetition Reminder
            </p>
            <div className="p-3 bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800/50 rounded-2xl text-xs text-purple-950 dark:text-purple-200">
              <strong>Kinematics 2D Relative Motion</strong> is due for 3-day spaced revision today!
            </div>
          </div>
        </div>

      </div>

      {/* Weak Topics & Revision Recommendations */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2 text-slate-900 dark:text-white font-extrabold text-base">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            <span>AI Identified Weak Topics & Direct Revision</span>
          </div>
          <span className="text-xs text-slate-400 font-medium">Based on recent quiz performance</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {progress.weakTopics.map((wt) => (
            <div
              key={wt.id}
              className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/20 text-xs space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-sm text-slate-900 dark:text-white">
                  {wt.chapterName}: {wt.topicTitle}
                </span>
                <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-700 font-bold text-[10px]">
                  {wt.accuracyPercentage}% Accuracy
                </span>
              </div>

              <p className="text-slate-600 dark:text-slate-400">
                👉 <strong>Action Plan:</strong> {wt.recommendedAction}
              </p>

              <div className="pt-2 flex gap-2">
                <button
                  onClick={() => onTabChange('ai_doubt')}
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-[11px] flex items-center gap-1"
                >
                  Ask AI Tutor <ArrowUpRight className="w-3 h-3" />
                </button>
                <button
                  onClick={() => onTabChange('flashcards')}
                  className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 font-bold rounded-xl text-[11px] text-slate-700 dark:text-slate-300"
                >
                  Revise Flashcards
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Saved Bookmarked Formulas & Notes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Bookmarked Notes */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <h3 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-blue-500" />
              <span>Saved Chapter Notes ({bookmarkedNotes.length})</span>
            </h3>

            <button
              onClick={() => onTabChange('subjects')}
              className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline"
            >
              Browse All Notes
            </button>
          </div>

          <div className="space-y-2">
            {bookmarkedNotes.map((note) => (
              <div
                key={note.id}
                onClick={() => {
                  onSelectNote(note.id);
                  onTabChange('subjects');
                }}
                className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 hover:border-blue-500 cursor-pointer transition-colors flex items-center justify-between text-xs"
              >
                <div>
                  <h4 className="font-extrabold text-slate-900 dark:text-white">{note.title}</h4>
                  <span className="text-[10px] text-slate-500 uppercase font-mono">{note.subjectId} • Class 11</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </div>
            ))}
          </div>
        </div>

        {/* Bookmarked Formulas */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <h3 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <Calculator className="w-4 h-4 text-purple-500" />
              <span>Saved Formulas ({bookmarkedFormulas.length})</span>
            </h3>

            <button
              onClick={() => onTabChange('formulas')}
              className="text-xs font-bold text-purple-600 dark:text-purple-400 hover:underline"
            >
              Formula Bank
            </button>
          </div>

          <div className="space-y-2">
            {bookmarkedFormulas.map((form) => (
              <div
                key={form.id}
                onClick={() => onTabChange('formulas')}
                className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 hover:border-purple-500 cursor-pointer transition-colors flex items-center justify-between text-xs"
              >
                <div>
                  <h4 className="font-extrabold text-slate-900 dark:text-white">{form.title}</h4>
                  <span className="text-[10px] text-slate-500 uppercase font-mono">{form.chapterName}</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};

