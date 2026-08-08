import React, { useState } from 'react';
import { 
  BookOpen, ChevronRight, Clock, Award, HelpCircle, BrainCircuit, 
  Sparkles, CheckCircle2, Layers, Filter
} from 'lucide-react';
import { Chapter, SubjectId, ClassLevel, ExamType } from '../types';
import { MOCK_CHAPTERS, SUBJECTS } from '../data/mockData';

interface ChapterListViewProps {
  selectedExam: ExamType;
  selectedSubjectId: SubjectId;
  onSelectSubject: (subId: SubjectId) => void;
  onSelectTopicNote: (noteId: string) => void;
  onStartQuiz: (chapterId: string) => void;
  onTabChange: (tab: string) => void;
}

export const ChapterListView: React.FC<ChapterListViewProps> = ({
  selectedExam,
  selectedSubjectId,
  onSelectSubject,
  onSelectTopicNote,
  onStartQuiz,
  onTabChange,
}) => {
  const [selectedClassLevel, setSelectedClassLevel] = useState<ClassLevel | 'all'>('all');

  const filteredChapters = MOCK_CHAPTERS.filter((ch) => {
    const matchesSubject = ch.subjectId === selectedSubjectId;
    const matchesClass = selectedClassLevel === 'all' || ch.classLevel === selectedClassLevel;
    const matchesExam = selectedExam === 'ALL' || ch.applicableExams.includes(selectedExam as any);
    return matchesSubject && matchesClass && matchesExam;
  });

  const activeSubject = SUBJECTS.find((s) => s.id === selectedSubjectId) || SUBJECTS[0];

  return (
    <div className="py-6 space-y-6">
      
      {/* Header Banner */}
      <div className={`p-6 sm:p-8 rounded-2xl text-white shadow-xl bg-gradient-to-r ${activeSubject.color}`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded bg-white/20 text-white mb-2 inline-block">
              {activeSubject.name} Curriculum
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Chapters & Topic Revisions
            </h1>
            <p className="text-xs sm:text-sm text-white/90 mt-1 max-w-xl">
              {activeSubject.description}
            </p>
          </div>

          {/* Subject Pills Switcher */}
          <div className="flex items-center gap-1.5 bg-black/20 backdrop-blur-md p-1.5 rounded-xl text-xs font-semibold">
            {SUBJECTS.map((sub) => (
              <button
                key={sub.id}
                onClick={() => onSelectSubject(sub.id)}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  selectedSubjectId === sub.id
                    ? 'bg-white text-slate-900 shadow-md font-bold'
                    : 'text-white/80 hover:text-white hover:bg-white/10'
                }`}
              >
                {sub.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Class Switcher & Filter Controls */}
      <div className="flex items-center justify-between bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="text-slate-500 dark:text-slate-400">Class Filter:</span>
          <div className="flex gap-1">
            <button
              onClick={() => setSelectedClassLevel('all')}
              className={`px-3 py-1 rounded-md transition-colors ${
                selectedClassLevel === 'all'
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setSelectedClassLevel('class_11')}
              className={`px-3 py-1 rounded-md transition-colors ${
                selectedClassLevel === 'class_11'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
              }`}
            >
              Class 11
            </button>
            <button
              onClick={() => setSelectedClassLevel('class_12')}
              className={`px-3 py-1 rounded-md transition-colors ${
                selectedClassLevel === 'class_12'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
              }`}
            >
              Class 12
            </button>
          </div>
        </div>

        <span className="text-slate-500 font-mono">
          {filteredChapters.length} Chapters
        </span>
      </div>

      {/* Chapter Cards Accordion/List */}
      <div className="space-y-4">
        {filteredChapters.map((chapter) => (
          <div
            key={chapter.id}
            className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm hover:shadow-md transition-all space-y-4"
          >
            {/* Top Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <span className="text-xs font-mono font-bold px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                  {chapter.code}
                </span>
                <span className="text-xs font-bold text-blue-600 dark:text-blue-400">
                  {chapter.classLevel === 'class_11' ? 'Class 11' : 'Class 12'}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                  Exam Weightage: ~{chapter.weightagePercentage}%
                </span>
              </div>
            </div>

            {/* Chapter Name & Desc */}
            <div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1">
                {chapter.name}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                {chapter.description}
              </p>
            </div>

            {/* Topics Hierarchy */}
            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 space-y-2 border border-slate-200/60 dark:border-slate-700/60">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-2">
                Topics & High-Yield Revisions ({chapter.topics.length}):
              </span>

              <div className="space-y-2">
                {chapter.topics.map((topic) => (
                  <div
                    key={topic.id}
                    onClick={() => onSelectTopicNote('note-kinematics-01')} // Open Note
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-blue-500 cursor-pointer transition-colors gap-2 group"
                  >
                    <div className="flex items-start gap-2.5">
                      <BookOpen className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                      <div>
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                          {topic.title}
                        </h4>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">
                          {topic.description}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 text-[11px]">
                      <span className="px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 font-semibold">
                        {topic.pyqFrequency}
                      </span>
                      <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap items-center justify-between pt-2 gap-3 text-xs">
              <button
                onClick={() => onSelectTopicNote('note-kinematics-01')}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl flex items-center gap-2 shadow-sm transition-colors"
              >
                <BookOpen className="w-4 h-4" /> Read Comprehensive Notes
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => onTabChange('flashcards')}
                  className="px-3 py-2 bg-purple-50 dark:bg-purple-950/50 hover:bg-purple-100 text-purple-700 dark:text-purple-300 font-semibold rounded-xl border border-purple-200 dark:border-purple-800 flex items-center gap-1.5 transition-colors"
                >
                  <BrainCircuit className="w-4 h-4" /> Flashcards
                </button>

                <button
                  onClick={() => onStartQuiz(chapter.id)}
                  className="px-3 py-2 bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 text-emerald-700 dark:text-emerald-300 font-semibold rounded-xl border border-emerald-200 dark:border-emerald-800 flex items-center gap-1.5 transition-colors"
                >
                  <HelpCircle className="w-4 h-4" /> Practice Quiz
                </button>
              </div>
            </div>
          </div>
        ))}

        {filteredChapters.length === 0 && (
          <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
            <BookOpen className="w-12 h-12 text-slate-400 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-slate-800 dark:text-white">No chapters found for this subject and class</h3>
            <p className="text-xs text-slate-500 mt-1">Switch subject or class level filters.</p>
          </div>
        )}
      </div>

    </div>
  );
};
