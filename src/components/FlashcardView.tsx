import React, { useState } from 'react';
import { 
  BrainCircuit, RotateCw, CheckCircle2, AlertCircle, HelpCircle, 
  Shuffle, ArrowRight, ArrowLeft, Filter, Sparkles, Layers
} from 'lucide-react';
import { Flashcard, SubjectId, ClassLevel, ExamType } from '../types';
import { MOCK_FLASHCARDS } from '../data/mockData';
import { MathFormula } from './MathFormula';

interface FlashcardViewProps {
  selectedExam: ExamType;
  onUpdateFlashcardConfidence: (cardId: string, rating: 'know' | 'review' | 'hard') => void;
}

export const FlashcardView: React.FC<FlashcardViewProps> = ({
  selectedExam,
  onUpdateFlashcardConfidence,
}) => {
  const [selectedSubject, setSelectedSubject] = useState<SubjectId | 'all'>('all');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [cards, setCards] = useState<Flashcard[]>(MOCK_FLASHCARDS);

  // Filter Cards
  const filteredCards = cards.filter((card) => {
    const matchesSubject = selectedSubject === 'all' || card.subjectId === selectedSubject;
    const matchesExam = selectedExam === 'ALL' || card.applicableExams.includes(selectedExam as any);
    return matchesSubject && matchesExam;
  });

  const currentCard = filteredCards[currentIndex] || filteredCards[0];

  const handleNext = () => {
    setIsFlipped(false);
    if (currentIndex < filteredCards.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setCurrentIndex(0);
    }
  };

  const handlePrev = () => {
    setIsFlipped(false);
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    } else {
      setCurrentIndex(filteredCards.length - 1);
    }
  };

  const handleShuffle = () => {
    setIsFlipped(false);
    const shuffled = [...cards].sort(() => Math.random() - 0.5);
    setCards(shuffled);
    setCurrentIndex(0);
  };

  const handleRateConfidence = (rating: 'know' | 'review' | 'hard') => {
    if (currentCard) {
      onUpdateFlashcardConfidence(currentCard.id, rating);
      handleNext();
    }
  };

  return (
    <div className="py-6 space-y-6 max-w-4xl mx-auto">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 text-white p-6 sm:p-8 rounded-2xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-semibold mb-2 border border-purple-500/30">
            <BrainCircuit className="w-3.5 h-3.5" /> Spaced Repetition Engine
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Active Recall Flashcards
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            Test your concept retention before the exam. Click card to flip and reveal answers.
          </p>
        </div>

        <button
          onClick={handleShuffle}
          className="px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-xs font-bold flex items-center gap-2 text-white transition-all shrink-0"
        >
          <Shuffle className="w-4 h-4" />
          <span>Shuffle Deck</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-between bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold">
        <span className="text-slate-500 dark:text-slate-400 hidden sm:inline">Subject Filter:</span>
        <div className="flex items-center gap-1.5 overflow-x-auto">
          <button
            onClick={() => { setSelectedSubject('all'); setCurrentIndex(0); setIsFlipped(false); }}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              selectedSubject === 'all'
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            All Subjects
          </button>
          <button
            onClick={() => { setSelectedSubject('physics'); setCurrentIndex(0); setIsFlipped(false); }}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              selectedSubject === 'physics'
                ? 'bg-blue-600 text-white'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            Physics
          </button>
          <button
            onClick={() => { setSelectedSubject('chemistry'); setCurrentIndex(0); setIsFlipped(false); }}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              selectedSubject === 'chemistry'
                ? 'bg-emerald-600 text-white'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            Chemistry
          </button>
          <button
            onClick={() => { setSelectedSubject('biology'); setCurrentIndex(0); setIsFlipped(false); }}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              selectedSubject === 'biology'
                ? 'bg-amber-600 text-white'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            Biology
          </button>
        </div>

        <span className="text-slate-500 font-mono">
          Card {filteredCards.length > 0 ? currentIndex + 1 : 0} of {filteredCards.length}
        </span>
      </div>

      {/* Main Flip Card Area */}
      {filteredCards.length > 0 && currentCard ? (
        <div className="space-y-4">
          
          {/* Card Container */}
          <div
            onClick={() => setIsFlipped(!isFlipped)}
            className="min-h-[300px] sm:min-h-[340px] bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-3xl p-8 sm:p-10 shadow-lg hover:shadow-xl cursor-pointer transition-all flex flex-col justify-between relative overflow-hidden group select-none"
          >
            {/* Top Bar inside Card */}
            <div className="flex items-center justify-between text-xs text-slate-500 font-semibold mb-4">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-full bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 font-bold uppercase text-[10px]">
                  {currentCard.chapterName}
                </span>
                <span className="text-slate-400">• {currentCard.difficulty}</span>
              </div>

              <span className="text-slate-400 flex items-center gap-1">
                <RotateCw className="w-3.5 h-3.5 group-hover:rotate-180 transition-transform duration-500" />
                {isFlipped ? 'Answer Side' : 'Click to Reveal Answer'}
              </span>
            </div>

            {/* Content (Question or Answer) */}
            <div className="my-auto py-6">
              {!isFlipped ? (
                <div className="space-y-4">
                  <span className="text-xs font-bold text-purple-600 uppercase tracking-widest block">
                    QUESTION
                  </span>
                  <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white leading-relaxed">
                    {currentCard.question}
                  </h3>
                </div>
              ) : (
                <div className="space-y-4">
                  <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest block">
                    ANSWER & RECALL EXPLANATION
                  </span>
                  <p className="text-base sm:text-lg font-semibold text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-line">
                    {currentCard.answer}
                  </p>

                  {currentCard.latexFormula && (
                    <div className="my-3 p-3 bg-slate-900 text-white rounded-xl flex items-center justify-center">
                      <MathFormula math={currentCard.latexFormula} displayMode={true} className="text-lg text-blue-300" />
                    </div>
                  )}

                  {currentCard.mnemonicsOrTip && (
                    <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 rounded-xl text-xs text-amber-900 dark:text-amber-200">
                      <strong>Memory Trick: </strong> {currentCard.mnemonicsOrTip}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Bottom Card Footer */}
            <div className="flex items-center justify-between text-xs text-slate-400 pt-4 border-t border-slate-100 dark:border-slate-800">
              <div className="flex gap-1.5 flex-wrap">
                {currentCard.tags.map((tag) => (
                  <span key={tag} className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[10px]">
                    #{tag}
                  </span>
                ))}
              </div>

              <span className="font-semibold text-purple-600 dark:text-purple-400 text-xs">
                {isFlipped ? 'Rate your recall below' : 'Tap anywhere to flip'}
              </span>
            </div>
          </div>

          {/* Navigation & Spaced-Repetition Feedback Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
            
            {/* Prev / Next Buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrev}
                className="flex-1 py-3 px-4 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" /> Previous Card
              </button>
              <button
                onClick={handleNext}
                className="flex-1 py-3 px-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors shadow-md"
              >
                Next Card <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Confidence Ratings (Spaced Repetition) */}
            {isFlipped && (
              <div className="flex items-center gap-2 bg-white dark:bg-slate-900 p-1.5 rounded-xl border border-slate-200 dark:border-slate-800">
                <button
                  onClick={() => handleRateConfidence('hard')}
                  className="flex-1 py-2 px-2 bg-rose-50 dark:bg-rose-950/50 hover:bg-rose-100 text-rose-700 dark:text-rose-300 rounded-lg text-xs font-bold transition-colors text-center"
                >
                  Need Review
                </button>
                <button
                  onClick={() => handleRateConfidence('review')}
                  className="flex-1 py-2 px-2 bg-amber-50 dark:bg-amber-950/50 hover:bg-amber-100 text-amber-700 dark:text-amber-300 rounded-lg text-xs font-bold transition-colors text-center"
                >
                  Medium
                </button>
                <button
                  onClick={() => handleRateConfidence('know')}
                  className="flex-1 py-2 px-2 bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 text-emerald-700 dark:text-emerald-300 rounded-lg text-xs font-bold transition-colors text-center"
                >
                  Mastered!
                </button>
              </div>
            )}

          </div>

        </div>
      ) : (
        <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
          <BrainCircuit className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-800 dark:text-white">No flashcards available for this filter</h3>
          <p className="text-xs text-slate-500 mt-1">Switch subject filters or select All Subjects.</p>
        </div>
      )}

    </div>
  );
};
