import React, { useState, useEffect } from 'react';
import { Search, X, BookOpen, Calculator, BrainCircuit, ChevronRight } from 'lucide-react';
import { MOCK_FORMULAS, MOCK_NOTES, MOCK_CHAPTERS, MOCK_FLASHCARDS } from '../data/mockData';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectNote: (noteId: string) => void;
  onTabChange: (tab: string) => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  isOpen,
  onClose,
  onSelectNote,
  onTabChange,
}) => {
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) {
          onClose();
        } else {
          // Open search
          const btn = document.querySelector('header button[title*="Search"]') as HTMLButtonElement;
          btn?.click();
        }
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const searchQuery = query.toLowerCase().trim();

  const matchedNotes = searchQuery
    ? MOCK_NOTES.filter(n => n.title.toLowerCase().includes(searchQuery) || n.overview.toLowerCase().includes(searchQuery))
    : [];

  const matchedFormulas = searchQuery
    ? MOCK_FORMULAS.filter(f => f.title.toLowerCase().includes(searchQuery) || f.chapterName.toLowerCase().includes(searchQuery) || f.category.toLowerCase().includes(searchQuery))
    : [];

  const matchedFlashcards = searchQuery
    ? MOCK_FLASHCARDS.filter(c => c.question.toLowerCase().includes(searchQuery) || c.answer.toLowerCase().includes(searchQuery))
    : [];

  const matchedChapters = searchQuery
    ? MOCK_CHAPTERS.filter(ch => ch.name.toLowerCase().includes(searchQuery) || ch.description.toLowerCase().includes(searchQuery))
    : [];

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-start justify-center pt-16 sm:pt-24 px-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-2xl w-full p-4 sm:p-6 shadow-2xl space-y-4 max-h-[80vh] flex flex-col">
        
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
          <Search className="w-5 h-5 text-slate-400" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search notes, formulas, topics, flashcards (e.g. 'Kinematics', 'Lens Maker', 'YDSE')..."
            className="flex-1 bg-transparent text-sm sm:text-base focus:outline-none dark:text-white"
          />
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Results */}
        <div className="overflow-y-auto flex-1 space-y-4 pr-1 text-xs sm:text-sm">
          {!searchQuery && (
            <div className="py-8 text-center text-slate-400 text-xs">
              Type to search across 3,500+ JEE & NEET syllabus topics, formula sheets, and practice cards.
            </div>
          )}

          {/* Notes */}
          {matchedNotes.length > 0 && (
            <div className="space-y-2">
              <span className="font-bold text-blue-600 uppercase text-[10px] tracking-wider block">
                Chapter Notes ({matchedNotes.length})
              </span>
              {matchedNotes.map((note) => (
                <div
                  key={note.id}
                  onClick={() => {
                    onSelectNote(note.id);
                    onTabChange('subjects');
                    onClose();
                  }}
                  className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-blue-50 dark:hover:bg-blue-950/50 border border-slate-200 dark:border-slate-700 cursor-pointer transition-colors flex items-center justify-between"
                >
                  <div className="flex items-center gap-2.5">
                    <BookOpen className="w-4 h-4 text-blue-500 shrink-0" />
                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-white">{note.title}</h4>
                      <p className="text-[11px] text-slate-500 line-clamp-1">{note.overview}</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
                </div>
              ))}
            </div>
          )}

          {/* Formulas */}
          {matchedFormulas.length > 0 && (
            <div className="space-y-2">
              <span className="font-bold text-purple-600 uppercase text-[10px] tracking-wider block">
                Formulas ({matchedFormulas.length})
              </span>
              {matchedFormulas.map((form) => (
                <div
                  key={form.id}
                  onClick={() => {
                    onTabChange('formulas');
                    onClose();
                  }}
                  className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-purple-50 dark:hover:bg-purple-950/50 border border-slate-200 dark:border-slate-700 cursor-pointer transition-colors flex items-center justify-between"
                >
                  <div className="flex items-center gap-2.5">
                    <Calculator className="w-4 h-4 text-purple-500 shrink-0" />
                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-white">{form.title}</h4>
                      <p className="text-[11px] text-slate-500 line-clamp-1">{form.description}</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
                </div>
              ))}
            </div>
          )}

          {/* Flashcards */}
          {matchedFlashcards.length > 0 && (
            <div className="space-y-2">
              <span className="font-bold text-emerald-600 uppercase text-[10px] tracking-wider block">
                Flashcards ({matchedFlashcards.length})
              </span>
              {matchedFlashcards.map((fc) => (
                <div
                  key={fc.id}
                  onClick={() => {
                    onTabChange('flashcards');
                    onClose();
                  }}
                  className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 border border-slate-200 dark:border-slate-700 cursor-pointer transition-colors flex items-center justify-between"
                >
                  <div className="flex items-center gap-2.5">
                    <BrainCircuit className="w-4 h-4 text-emerald-500 shrink-0" />
                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-white">{fc.question}</h4>
                      <p className="text-[11px] text-slate-500 line-clamp-1">{fc.answer}</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
                </div>
              ))}
            </div>
          )}

          {searchQuery && matchedNotes.length === 0 && matchedFormulas.length === 0 && matchedFlashcards.length === 0 && matchedChapters.length === 0 && (
            <div className="py-8 text-center text-slate-400 text-xs">
              No results found for "{query}". Try searching for broader terms like "Physics" or "Organic".
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
