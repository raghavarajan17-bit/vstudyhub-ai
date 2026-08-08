import React, { useState } from 'react';
import { 
  ArrowLeft, Bookmark, BookmarkCheck, Sparkles, CheckCircle2, 
  AlertTriangle, Lightbulb, Clock, BookOpen, Share2
} from 'lucide-react';
import { NoteContent } from '../types';
import { MOCK_NOTES } from '../data/mockData';
import { MathFormula } from './MathFormula';

interface NoteDetailViewProps {
  noteId: string;
  onBack: () => void;
  bookmarkedNoteIds: string[];
  onToggleBookmarkNote: (noteId: string) => void;
  onOpenAiWithContext: (topicContext: string) => void;
}

export const NoteDetailView: React.FC<NoteDetailViewProps> = ({
  noteId,
  onBack,
  bookmarkedNoteIds,
  onToggleBookmarkNote,
  onOpenAiWithContext,
}) => {
  const note: NoteContent = MOCK_NOTES.find((n) => n.id === noteId) || MOCK_NOTES[0];
  const isBookmarked = bookmarkedNoteIds.includes(note.id);

  return (
    <div className="py-6 max-w-4xl mx-auto space-y-6">
      
      {/* Top Action Bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="px-3.5 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold flex items-center gap-2 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Chapters
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onOpenAiWithContext(note.title)}
            className="px-3 py-2 bg-purple-50 dark:bg-purple-950/60 hover:bg-purple-100 text-purple-700 dark:text-purple-300 rounded-xl text-xs font-bold flex items-center gap-1.5 border border-purple-200 dark:border-purple-800 transition-colors"
          >
            <Sparkles className="w-4 h-4 text-purple-500" />
            <span>Ask AI About This Note</span>
          </button>

          <button
            onClick={() => onToggleBookmarkNote(note.id)}
            className={`p-2 rounded-xl border transition-colors ${
              isBookmarked
                ? 'bg-amber-500 text-slate-950 border-amber-400'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
            }`}
            title={isBookmarked ? 'Remove Bookmark' : 'Bookmark Note'}
          >
            {isBookmarked ? <BookmarkCheck className="w-5 h-5 fill-slate-950" /> : <Bookmark className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Main Note Paper / Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-10 shadow-lg space-y-8">
        
        {/* Title Header */}
        <div className="border-b border-slate-200 dark:border-slate-800 pb-6 space-y-3">
          <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
            <span className="px-2.5 py-1 rounded bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 font-bold uppercase">
              {note.subjectId}
            </span>
            <span className="text-slate-400">•</span>
            <span className="text-slate-500 dark:text-slate-400">
              {note.classLevel === 'class_11' ? 'Class 11' : 'Class 12'}
            </span>
            <span className="text-slate-400">•</span>
            <span className="text-slate-500 dark:text-slate-400">
              Updated: {note.lastUpdated}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white leading-tight">
            {note.title}
          </h1>

          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200/80 dark:border-slate-700/80">
            <strong>Overview: </strong> {note.overview}
          </p>
        </div>

        {/* Note Sections */}
        <div className="space-y-8">
          {note.sections.map((sec, idx) => (
            <div key={idx} className="space-y-4">
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white border-l-4 border-blue-600 pl-3">
                {sec.heading}
              </h2>

              <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                {sec.body}
              </p>

              {/* KaTeX Formula Box */}
              {sec.latexFormula && (
                <div className="my-4 p-5 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-inner overflow-x-auto border border-slate-800">
                  <MathFormula math={sec.latexFormula} displayMode={true} className="text-lg sm:text-xl text-blue-300" />
                </div>
              )}

              {/* Key Points */}
              {sec.keyPoints && sec.keyPoints.length > 0 && (
                <div className="bg-blue-50/80 dark:bg-blue-950/40 p-4 rounded-xl border border-blue-200 dark:border-blue-900/60 text-xs sm:text-sm space-y-2">
                  <span className="font-bold text-blue-900 dark:text-blue-300 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-blue-600 dark:text-blue-400" /> Key Exam Points:
                  </span>
                  <ul className="list-disc pl-5 space-y-1 text-slate-700 dark:text-slate-300">
                    {sec.keyPoints.map((kp, kidx) => (
                      <li key={kidx}>{kp}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Common Mistakes */}
              {sec.commonMistakes && sec.commonMistakes.length > 0 && (
                <div className="bg-rose-50/80 dark:bg-rose-950/40 p-4 rounded-xl border border-rose-200 dark:border-rose-900/60 text-xs sm:text-sm space-y-2">
                  <span className="font-bold text-rose-900 dark:text-rose-300 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400" /> Common Exam Mistakes:
                  </span>
                  <ul className="list-disc pl-5 space-y-1 text-slate-700 dark:text-slate-300">
                    {sec.commonMistakes.map((cm, cidx) => (
                      <li key={cidx}>{cm}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Example Problem */}
              {sec.exampleProblem && (
                <div className="bg-slate-900 text-slate-100 p-5 rounded-xl text-xs sm:text-sm space-y-3 shadow-md border border-slate-800">
                  <span className="font-bold text-amber-400 uppercase tracking-widest block text-[11px]">
                    SOLVED EXEMPLAR NUMERICAL
                  </span>
                  <p className="font-semibold text-white">
                    {sec.exampleProblem.problem}
                  </p>
                  <div className="pt-2 border-t border-slate-800 text-slate-300 whitespace-pre-line leading-relaxed">
                    <strong>Step-by-Step Solution:</strong>
                    <p className="mt-1">{sec.exampleProblem.solution}</p>
                  </div>
                  {sec.exampleProblem.trick && (
                    <div className="p-2.5 bg-amber-950/60 rounded-lg text-amber-300 border border-amber-800 text-xs font-mono">
                      ⚡ <strong>Exam Shortcut: </strong> {sec.exampleProblem.trick}
                    </div>
                  )}
                </div>
              )}

            </div>
          ))}
        </div>

        {/* Takeaways Footer */}
        <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 p-6 rounded-2xl space-y-3">
          <h3 className="font-bold text-base text-emerald-900 dark:text-emerald-300 flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-emerald-600" /> 1-Minute Takeaways
          </h3>
          <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm text-slate-700 dark:text-slate-300 font-medium">
            {note.summaryTakeaways.map((st, sidx) => (
              <li key={sidx}>{st}</li>
            ))}
          </ul>
        </div>

      </div>
    </div>
  );
};
