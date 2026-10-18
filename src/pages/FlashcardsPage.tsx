import React, { useEffect, useState } from 'react';
import {
  Layers,
  Plus,
  RotateCw,
  Shuffle,
  CheckCircle2,
  XCircle,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  Calculator,
  Flame,
  Award
} from 'lucide-react';
import { storage } from '../services/storage';
import { FlashcardDeck, Flashcard } from '../types';
import { MathRenderer } from '../components/common/MathRenderer';

interface FlashcardsPageProps {
  navigate: (route: string, params?: any) => void;
  selectedDeckId?: string;
}

export const FlashcardsPage: React.FC<FlashcardsPageProps> = ({ navigate, selectedDeckId }) => {
  const [decks, setDecks] = useState<FlashcardDeck[]>([]);
  const [activeDeck, setActiveDeck] = useState<FlashcardDeck | null>(null);
  const [studyCards, setStudyCards] = useState<Flashcard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [sessionCompleted, setSessionCompleted] = useState(false);
  const [masteredCount, setMasteredCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDecks() {
      const data = await storage.getFlashcardDecks();
      setDecks(data);
      if (selectedDeckId) {
        const found = data.find((d) => d.id === selectedDeckId);
        if (found) startStudy(found);
      }
      setLoading(false);
    }
    loadDecks();
  }, [selectedDeckId]);

  const startStudy = (deck: FlashcardDeck) => {
    setActiveDeck(deck);
    setStudyCards([...deck.cards]);
    setCurrentIndex(0);
    setIsFlipped(false);
    setSessionCompleted(false);
    setMasteredCount(deck.cardsMastered || 0);
  };

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const handleNext = (mastered: boolean) => {
    if (!activeDeck) return;
    const currentCard = studyCards[currentIndex];

    if (mastered) {
      setMasteredCount((prev) => prev + 1);
    }

    if (currentIndex < studyCards.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setIsFlipped(false);
    } else {
      // Completed session
      setSessionCompleted(true);
      // Persist deck mastery
      const updatedDeck = {
        ...activeDeck,
        cardsMastered: Math.min(studyCards.length, masteredCount + (mastered ? 1 : 0)),
        updatedAt: new Date().toISOString()
      };
      storage.saveFlashcardDeck(updatedDeck);
    }
  };

  const handleShuffle = () => {
    const shuffled = [...studyCards].sort(() => Math.random() - 0.5);
    setStudyCards(shuffled);
    setCurrentIndex(0);
    setIsFlipped(false);
  };

  // Keyboard shortcut listener for active recall (Space to flip, 1/2 for rating)
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (!activeDeck || sessionCompleted) return;
      if (e.code === 'Space') {
        e.preventDefault();
        handleFlip();
      } else if (e.key === '1') {
        handleNext(false);
      } else if (e.key === '2') {
        handleNext(true);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [activeDeck, sessionCompleted, isFlipped, currentIndex]);

  const currentCard = studyCards[currentIndex];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* If Study Mode is Active */}
      {activeDeck ? (
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => setActiveDeck(null)}
              className="flex items-center gap-1.5 text-xs font-semibold text-[#6E6685] hover:text-[#27223B]"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Back to Decks</span>
            </button>

            <h3 className="font-bold text-sm text-[#27223B] truncate max-w-xs">
              {activeDeck.title}
            </h3>

            <button
              onClick={handleShuffle}
              className="p-2 rounded-xl text-[#6E6685] hover:text-[#6654D9] hover:bg-[#FAF8FF]"
              title="Shuffle cards"
            >
              <Shuffle className="w-4 h-4" />
            </button>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-2 rounded-full bg-[#EBE6DF] overflow-hidden">
            <div
              className="h-full bg-[#6654D9] transition-all duration-300"
              style={{
                width: `${((currentIndex + 1) / studyCards.length) * 100}%`
              }}
            />
          </div>

          {!sessionCompleted ? (
            <div className="space-y-6">
              <div className="text-center text-xs text-[#6E6685]">
                Card {currentIndex + 1} of {studyCards.length} • Press{' '}
                <kbd className="px-1.5 py-0.5 rounded bg-white border border-[#EBE6DF] font-mono text-[10px]">
                  Space
                </kbd>{' '}
                to flip
              </div>

              {/* 3D Flip Card */}
              <div
                onClick={handleFlip}
                className="w-full min-h-[300px] sm:min-h-[340px] bg-white rounded-3xl border border-[#E2DCF7] p-8 sm:p-10 shadow-md hover:shadow-lg transition-all cursor-pointer flex flex-col justify-between select-none relative group"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold uppercase tracking-wider text-[#8B7CF6]">
                    {isFlipped ? 'Answer & Explanation' : 'Prompt / Concept'}
                  </span>
                  <span className="text-[11px] font-semibold text-[#6E6685] group-hover:text-[#6654D9] flex items-center gap-1">
                    <RotateCw className="w-3.5 h-3.5" />
                    <span>Click to flip</span>
                  </span>
                </div>

                {/* Card Center Content */}
                <div className="my-auto py-4 text-center">
                  {!isFlipped ? (
                    <div className="text-base sm:text-xl font-bold text-[#27223B] leading-relaxed">
                      <MathRenderer content={currentCard.front} />
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="text-base sm:text-lg font-bold text-[#6654D9] leading-relaxed">
                        <MathRenderer content={currentCard.back} />
                      </div>

                      {currentCard.formulaLatex && (
                        <div className="p-3 bg-[#FAF8FF] border border-[#E2DCF7] rounded-2xl">
                          <MathRenderer content={`\\[ ${currentCard.formulaLatex} \\]`} />
                        </div>
                      )}

                      {currentCard.easyExplanation && (
                        <div className="p-3 rounded-2xl bg-[#F0FBF5] border border-[#BFE8D5] text-xs text-[#1E5638]">
                          <strong className="block text-[11px] uppercase tracking-wide text-[#2E7D32] mb-0.5">
                            Easy Breakdown:
                          </strong>
                          <span>{currentCard.easyExplanation}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="text-center text-[11px] text-[#9D96B0]">
                  {isFlipped ? 'Rate your recall below' : 'Tap anywhere to reveal solution'}
                </div>
              </div>

              {/* Rating Controls */}
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => handleNext(false)}
                  className="py-3 px-4 rounded-2xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-800 text-xs font-bold transition-colors flex items-center justify-center gap-2"
                >
                  <XCircle className="w-4 h-4 text-rose-600" />
                  <span>Didn't Know (1)</span>
                </button>

                <button
                  onClick={() => handleNext(true)}
                  className="py-3 px-4 rounded-2xl border border-[#BFE8D5] bg-[#F0FBF5] hover:bg-[#E2F7EB] text-[#1E5638] text-xs font-bold transition-colors flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4 text-[#2E7D32]" />
                  <span>Know It (2)</span>
                </button>
              </div>
            </div>
          ) : (
            /* Session Completed Screen */
            <div className="bg-white rounded-3xl border border-[#EBE6DF] p-8 text-center space-y-4">
              <div className="w-16 h-16 mx-auto rounded-3xl bg-[#FAF8FF] border border-[#E2DCF7] text-[#6654D9] flex items-center justify-center">
                <Award className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-extrabold text-[#27223B]">Session Complete!</h3>
              <p className="text-xs text-[#514963] max-w-sm mx-auto">
                Great job reinforcing these key concepts. Spaced recall strengthens long-term memory.
              </p>

              <div className="pt-2 flex items-center justify-center gap-3">
                <button
                  onClick={() => startStudy(activeDeck)}
                  className="px-4 py-2 rounded-xl bg-[#FAF8F4] border border-[#EBE6DF] hover:bg-[#FAF8FF] text-xs font-bold text-[#27223B]"
                >
                  Study Deck Again
                </button>
                <button
                  onClick={() => setActiveDeck(null)}
                  className="px-5 py-2 rounded-xl bg-[#6654D9] hover:bg-[#5844CA] text-white text-xs font-bold shadow-xs"
                >
                  Return to Library
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Decks List View */
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#8B7CF6]">
                Spaced Recall
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#27223B] tracking-tight mt-1">
                Flashcard Decks
              </h2>
              <p className="text-xs sm:text-sm text-[#514963]">
                Memorize definitions, step-by-step formulas, and core mechanisms.
              </p>
            </div>

            <button
              onClick={() => navigate('create')}
              className="px-4 py-2.5 rounded-xl bg-[#6654D9] hover:bg-[#5844CA] text-white text-xs font-bold shadow-md shadow-[#6654D9]/25 hover:scale-105 active:scale-95 transition-all flex items-center gap-2 self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>Generate New Deck</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {decks.map((deck) => (
              <div
                key={deck.id}
                className="bg-white rounded-3xl border border-[#EBE6DF] hover:border-[#8B7CF6] p-6 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#8B4513] bg-[#FFFBF0] px-2 py-0.5 rounded-md border border-[#FFE1D2]">
                      {deck.subject}
                    </span>
                    <span className="text-xs font-bold text-[#6E6685]">
                      {deck.cards.length} cards
                    </span>
                  </div>

                  <h3 className="font-bold text-base text-[#27223B] leading-snug">{deck.title}</h3>
                  <p className="text-xs text-[#514963] line-clamp-2 leading-relaxed">
                    {deck.description}
                  </p>

                  {/* Mastery Progress */}
                  <div className="pt-2">
                    <div className="flex items-center justify-between text-[11px] mb-1">
                      <span className="text-[#6E6685]">Mastery:</span>
                      <span className="font-bold text-[#1E5638]">
                        {deck.cardsMastered} / {deck.cards.length}
                      </span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-[#EBE6DF] overflow-hidden">
                      <div
                        className="h-full bg-[#2E7D32] rounded-full"
                        style={{
                          width: `${(deck.cardsMastered / (deck.cards.length || 1)) * 100}%`
                        }}
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-5 mt-4 border-t border-[#EBE6DF]">
                  <button
                    onClick={() => startStudy(deck)}
                    className="w-full py-2.5 rounded-xl bg-[#6654D9] hover:bg-[#5844CA] text-white text-xs font-bold shadow-xs flex items-center justify-center gap-2 transition-colors"
                  >
                    <Layers className="w-3.5 h-3.5" />
                    <span>Study Deck</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
