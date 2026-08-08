import React, { useState } from 'react';
import { 
  Calculator, Search, Bookmark, BookmarkCheck, Copy, Check, 
  Sparkles, Filter, Info, ChevronRight, Share2, Lightbulb
} from 'lucide-react';
import { Formula, SubjectId, ClassLevel, ExamType } from '../types';
import { MOCK_FORMULAS } from '../data/mockData';
import { MathFormula } from './MathFormula';

interface FormulaSheetViewProps {
  selectedExam: ExamType;
  bookmarkedFormulaIds: string[];
  onToggleBookmark: (formulaId: string) => void;
}

export const FormulaSheetView: React.FC<FormulaSheetViewProps> = ({
  selectedExam,
  bookmarkedFormulaIds,
  onToggleBookmark,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState<SubjectId | 'all'>('all');
  const [selectedClass, setSelectedClass] = useState<ClassLevel | 'all'>('all');
  const [onlyBookmarks, setOnlyBookmarks] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // AI Explain State
  const [explainingFormula, setExplainingFormula] = useState<Formula | null>(null);
  const [aiExplanation, setAiExplanation] = useState<string | null>(null);
  const [loadingAi, setLoadingAi] = useState(false);

  // Filter Formulas
  const filteredFormulas = MOCK_FORMULAS.filter((f) => {
    // Search query
    const matchesSearch = 
      f.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.chapterName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.description.toLowerCase().includes(searchQuery.toLowerCase());

    // Subject
    const matchesSubject = selectedSubject === 'all' || f.subjectId === selectedSubject;

    // Class
    const matchesClass = selectedClass === 'all' || f.classLevel === selectedClass;

    // Exam
    const matchesExam = 
      selectedExam === 'ALL' || 
      f.applicableExams.includes(selectedExam as any);

    // Bookmarks
    const matchesBookmark = !onlyBookmarks || bookmarkedFormulaIds.includes(f.id);

    return matchesSearch && matchesSubject && matchesClass && matchesExam && matchesBookmark;
  });

  const handleCopyLatex = (formula: Formula) => {
    navigator.clipboard.writeText(formula.latex);
    setCopiedId(formula.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleExplainWithAi = async (formula: Formula) => {
    setExplainingFormula(formula);
    setLoadingAi(true);
    setAiExplanation(null);

    try {
      const res = await fetch('/api/ai/explain-formula', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          formulaTitle: formula.title,
          latex: formula.latex,
          subject: formula.subjectId,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setAiExplanation(data.explanation);
      } else {
        setAiExplanation('Unable to fetch AI explanation. Please check your API configuration.');
      }
    } catch (err: any) {
      setAiExplanation('Error connecting to AI server. Please try again.');
    } finally {
      setLoadingAi(false);
    }
  };

  return (
    <div className="py-6 space-y-6">
      
      {/* Title Header */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white p-6 sm:p-8 rounded-2xl shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-semibold mb-3 border border-blue-500/30">
              <Calculator className="w-3.5 h-3.5" /> High-Yield Formula Bank
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Interactive Formula Cheat-Sheet
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">
              KaTeX rendered formulas for Physics, Chemistry & Math with variable definitions, exam tips, and AI intuition breakdowns.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setOnlyBookmarks(!onlyBookmarks)}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 border transition-all ${
                onlyBookmarks 
                  ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md' 
                  : 'bg-white/10 hover:bg-white/20 text-white border-white/20'
              }`}
            >
              <Bookmark className="w-4 h-4" />
              <span>{onlyBookmarks ? 'Showing Bookmarks' : 'Saved Formulas'} ({bookmarkedFormulaIds.length})</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filter Controls */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row gap-3">
          
          {/* Search Bar */}
          <div className="flex-1 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search formulas (e.g. Lens Maker, YDSE, Bond Order, Leibniz)..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
            />
          </div>

          {/* Subject Pills */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 md:pb-0 text-xs font-semibold">
            <button
              onClick={() => setSelectedSubject('all')}
              className={`px-3 py-2 rounded-lg transition-colors whitespace-nowrap ${
                selectedSubject === 'all'
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              All Subjects
            </button>
            <button
              onClick={() => setSelectedSubject('physics')}
              className={`px-3 py-2 rounded-lg transition-colors whitespace-nowrap ${
                selectedSubject === 'physics'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              Physics
            </button>
            <button
              onClick={() => setSelectedSubject('chemistry')}
              className={`px-3 py-2 rounded-lg transition-colors whitespace-nowrap ${
                selectedSubject === 'chemistry'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              Chemistry
            </button>
            <button
              onClick={() => setSelectedSubject('mathematics')}
              className={`px-3 py-2 rounded-lg transition-colors whitespace-nowrap ${
                selectedSubject === 'mathematics'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              Math
            </button>
          </div>
        </div>
      </div>

      {/* Formula Cards List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredFormulas.map((formula) => {
          const isBookmarked = bookmarkedFormulaIds.includes(formula.id);

          return (
            <div
              key={formula.id}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              <div>
                {/* Card Top Header */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300">
                        {formula.category}
                      </span>
                      <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                        {formula.chapterName}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                      {formula.title}
                    </h3>
                  </div>

                  <button
                    onClick={() => onToggleBookmark(formula.id)}
                    className={`p-2 rounded-lg transition-colors ${
                      isBookmarked
                        ? 'text-amber-500 bg-amber-50 dark:bg-amber-950/50'
                        : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                    title={isBookmarked ? 'Remove bookmark' : 'Bookmark formula'}
                  >
                    {isBookmarked ? <BookmarkCheck className="w-5 h-5 fill-amber-500" /> : <Bookmark className="w-5 h-5" />}
                  </button>
                </div>

                {/* KaTeX Rendered Formula Box */}
                <div className="my-4 p-4 rounded-xl bg-slate-900 text-white flex items-center justify-center overflow-x-auto shadow-inner border border-slate-800">
                  <MathFormula math={formula.latex} displayMode={true} className="text-lg sm:text-xl text-blue-300" />
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300 mb-4 leading-relaxed">
                  {formula.description}
                </p>

                {/* Variables List */}
                {formula.variables.length > 0 && (
                  <div className="mb-4 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg text-xs space-y-1.5 border border-slate-200/60 dark:border-slate-700/60">
                    <span className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                      Variables & Notation:
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                      {formula.variables.map((v, idx) => (
                        <div key={idx} className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                          <MathFormula math={v.symbol} displayMode={false} className="text-blue-600 dark:text-blue-400 font-bold" />
                          <span>= {v.meaning}</span>
                          {v.unit && <span className="text-[10px] text-slate-400 font-mono">({v.unit})</span>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Exam Tip Callout */}
                {formula.examTips && (
                  <div className="flex items-start gap-2.5 p-3 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-xs text-amber-900 dark:text-amber-200 mb-4">
                    <Lightbulb className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold block text-amber-800 dark:text-amber-300">Exam Trick / Common Trap:</span>
                      <span>{formula.examTips}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Card Footer Actions */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
                <button
                  onClick={() => handleCopyLatex(formula)}
                  className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-medium"
                >
                  {copiedId === formula.id ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-500" />
                      <span className="text-emerald-600 dark:text-emerald-400">Copied LaTeX</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy LaTeX</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => handleExplainWithAi(formula)}
                  className="flex items-center gap-1.5 font-bold text-purple-600 dark:text-purple-400 hover:text-purple-700 bg-purple-50 dark:bg-purple-950/50 px-3 py-1.5 rounded-lg border border-purple-200 dark:border-purple-800 transition-colors"
                >
                  <Sparkles className="w-3.5 h-3.5 text-purple-500" />
                  <span>Explain with AI</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {filteredFormulas.length === 0 && (
        <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
          <Calculator className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-800 dark:text-white">No formulas found</h3>
          <p className="text-xs text-slate-500 mt-1">Try adjusting your search query or subject filters.</p>
        </div>
      )}

      {/* AI Explanation Modal */}
      {explainingFormula && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-2xl w-full p-6 max-h-[85vh] overflow-y-auto space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-500" />
                <h3 className="font-bold text-lg text-slate-900 dark:text-white">
                  AI Deep-Dive Explanation
                </h3>
              </div>
              <button
                onClick={() => setExplainingFormula(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white font-bold"
              >
                ✕
              </button>
            </div>

            <div className="p-3 bg-slate-900 text-white rounded-xl text-center">
              <span className="text-xs text-slate-400 block mb-1">{explainingFormula.title}</span>
              <MathFormula math={explainingFormula.latex} displayMode={true} className="text-lg text-blue-300" />
            </div>

            {loadingAi ? (
              <div className="py-12 text-center space-y-3">
                <Sparkles className="w-8 h-8 text-purple-500 animate-spin mx-auto" />
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Generating physical intuition & exam tricks with Gemini...
                </p>
              </div>
            ) : (
              <div className="prose dark:prose-invert max-w-none text-xs sm:text-sm text-slate-700 dark:text-slate-300 space-y-3 whitespace-pre-line leading-relaxed">
                {aiExplanation}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
