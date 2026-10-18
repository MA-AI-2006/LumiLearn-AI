import React, { useEffect, useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Flag,
  RotateCw,
  Layers,
  Sparkles,
  Award,
  ArrowRight
} from 'lucide-react';
import { storage } from '../services/storage';
import { Quiz, QuizQuestion } from '../types';
import { MathRenderer } from '../components/common/MathRenderer';

interface QuizRunnerPageProps {
  quizId: string;
  navigate: (route: string, params?: any) => void;
}

export const QuizRunnerPage: React.FC<QuizRunnerPageProps> = ({ quizId, navigate }) => {
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [flagged, setFlagged] = useState<Record<string, boolean>>({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [incorrectQuestions, setIncorrectQuestions] = useState<QuizQuestion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadQuiz() {
      const all = await storage.getQuizzes();
      const current = all.find((q) => q.id === quizId) || all[0];
      setQuiz(current || null);
      setLoading(false);
    }
    loadQuiz();
  }, [quizId]);

  if (loading || !quiz) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <RotateCw className="w-6 h-6 animate-spin text-[#6654D9]" />
      </div>
    );
  }

  const currentQuestion = quiz.questions[currentIndex];

  const handleSelectOption = (option: string) => {
    if (submitted) return;
    setSelectedAnswers({
      ...selectedAnswers,
      [currentQuestion.id]: option
    });
  };

  const toggleFlag = () => {
    setFlagged({
      ...flagged,
      [currentQuestion.id]: !flagged[currentQuestion.id]
    });
  };

  const handleSubmit = async () => {
    let calculatedScore = 0;
    const incorrect: QuizQuestion[] = [];

    quiz.questions.forEach((q) => {
      if (selectedAnswers[q.id] === q.correctAnswer) {
        calculatedScore++;
      } else {
        incorrect.push(q);
      }
    });

    setScore(calculatedScore);
    setIncorrectQuestions(incorrect);
    setSubmitted(true);

    const percentage = Math.round((calculatedScore / quiz.questions.length) * 100);

    // Update quiz best score & timestamp
    const updatedQuiz: Quiz = {
      ...quiz,
      bestScore: Math.max(quiz.bestScore || 0, percentage),
      lastAttemptAt: new Date().toISOString()
    };
    await storage.saveQuiz(updatedQuiz);
  };

  const handleRetake = () => {
    setSelectedAnswers({});
    setFlagged({});
    setSubmitted(false);
    setCurrentIndex(0);
  };

  const handleRetryIncorrect = () => {
    // Keep answers only for correct ones and clear incorrect
    const newAnswers: Record<string, string> = {};
    quiz.questions.forEach((q) => {
      if (selectedAnswers[q.id] === q.correctAnswer) {
        newAnswers[q.id] = selectedAnswers[q.id];
      }
    });
    setSelectedAnswers(newAnswers);
    setSubmitted(false);
    // Jump to first incorrect question
    if (incorrectQuestions.length > 0) {
      const firstIdx = quiz.questions.findIndex((q) => q.id === incorrectQuestions[0].id);
      setCurrentIndex(firstIdx >= 0 ? firstIdx : 0);
    }
  };

  const handleCreateFlashcardsFromMistakes = async () => {
    if (incorrectQuestions.length === 0) return;
    const newCards = incorrectQuestions.map((q, idx) => ({
      id: 'c-err-' + Date.now() + '-' + idx,
      front: q.question,
      back: q.correctAnswer,
      easyExplanation: q.explanation,
      formulaLatex: q.formulaUsed,
      status: 'learning' as const,
      lastReviewed: new Date().toISOString()
    }));

    const mistakeDeck = {
      id: 'deck-mistakes-' + Date.now(),
      title: `${quiz.title} - Missed Questions Deck`,
      description: 'Focus deck created from missed quiz questions for targeted active recall.',
      subject: 'Mistake Review',
      cards: newCards,
      cardsMastered: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await storage.saveFlashcardDeck(mistakeDeck);
    alert('Flashcard deck created from your mistakes! Heading to Flashcards.');
    navigate('flashcards');
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('quizzes')}
          className="flex items-center gap-1.5 text-xs font-semibold text-[#6E6685] hover:text-[#27223B]"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Exit Assessment</span>
        </button>

        <h3 className="font-bold text-sm text-[#27223B] truncate max-w-sm">{quiz.title}</h3>

        <div className="text-xs font-semibold text-[#6654D9] bg-[#FAF8FF] px-3 py-1 rounded-full border border-[#E2DCF7]">
          {submitted ? 'Completed' : `Question ${currentIndex + 1} of ${quiz.questions.length}`}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-2 rounded-full bg-[#EBE6DF] overflow-hidden">
        <div
          className="h-full bg-[#6654D9] transition-all duration-300"
          style={{
            width: `${((currentIndex + 1) / quiz.questions.length) * 100}%`
          }}
        />
      </div>

      {!submitted ? (
        /* Question Runner Card */
        <div className="bg-white rounded-3xl border border-[#EBE6DF] p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex items-start justify-between gap-4">
            <span className="w-7 h-7 rounded-lg bg-[#FAF8FF] text-[#6654D9] font-bold text-xs flex items-center justify-center shrink-0 border border-[#E2DCF7]">
              {currentIndex + 1}
            </span>

            <div className="flex-1 text-base sm:text-lg font-bold text-[#27223B] leading-relaxed">
              <MathRenderer content={currentQuestion.question} />
            </div>

            <button
              onClick={toggleFlag}
              className={`p-2 rounded-xl transition-colors ${
                flagged[currentQuestion.id]
                  ? 'bg-amber-100 text-[#8B4513]'
                  : 'text-[#9D96B0] hover:text-[#27223B]'
              }`}
              title="Flag for review"
            >
              <Flag className="w-4 h-4" />
            </button>
          </div>

          {/* Options */}
          <div className="space-y-3 pt-2">
            {(currentQuestion.options || ['True', 'False']).map((opt, idx) => {
              const isSelected = selectedAnswers[currentQuestion.id] === opt;
              return (
                <div
                  key={idx}
                  onClick={() => handleSelectOption(opt)}
                  className={`p-4 rounded-2xl border text-xs sm:text-sm font-medium cursor-pointer transition-all flex items-center gap-3 ${
                    isSelected
                      ? 'border-[#6654D9] bg-[#FAF8FF] text-[#6654D9] shadow-xs'
                      : 'border-[#EBE6DF] bg-white hover:bg-[#FAF8F4] text-[#27223B]'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full border flex items-center justify-center text-xs shrink-0 ${
                      isSelected
                        ? 'border-[#6654D9] bg-[#6654D9] text-white'
                        : 'border-[#9D96B0] text-[#9D96B0]'
                    }`}
                  >
                    {String.fromCharCode(65 + idx)}
                  </div>
                  <div className="flex-1">
                    <MathRenderer content={opt} />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Navigation Controls */}
          <div className="pt-6 border-t border-[#EBE6DF] flex items-center justify-between">
            <button
              onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
              disabled={currentIndex === 0}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-[#EBE6DF] text-xs font-bold text-[#27223B] hover:bg-[#FAF8F4] disabled:opacity-40"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>

            {currentIndex < quiz.questions.length - 1 ? (
              <button
                onClick={() => setCurrentIndex(currentIndex + 1)}
                className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#6654D9] hover:bg-[#5844CA] text-white text-xs font-bold shadow-xs transition-colors"
              >
                <span>Next</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                className="flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-[#1E5638] hover:bg-[#16422B] text-white text-xs font-bold shadow-xs transition-colors"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Submit Assessment</span>
              </button>
            )}
          </div>
        </div>
      ) : (
        /* Results View */
        <div className="space-y-6">
          {/* Score Hero Card */}
          <div className="bg-white rounded-3xl border border-[#EBE6DF] p-8 text-center shadow-xs space-y-4">
            <div className="w-16 h-16 mx-auto rounded-3xl bg-[#FAF8FF] border border-[#E2DCF7] text-[#6654D9] flex items-center justify-center">
              <Award className="w-8 h-8" />
            </div>

            <div>
              <span className="text-3xl sm:text-4xl font-extrabold text-[#27223B]">
                {score} / {quiz.questions.length}
              </span>
              <p className="text-sm font-bold text-[#6654D9] mt-1">
                {Math.round((score / quiz.questions.length) * 100)}% Accuracy
              </p>
            </div>

            <p className="text-xs text-[#514963] max-w-sm mx-auto">
              {score === quiz.questions.length
                ? 'Outstanding! You showed complete mastery over all tested concepts and calculations.'
                : 'Good effort! Review the detailed pedagogical explanations below to correct misunderstandings.'}
            </p>

            {/* Post-Quiz Action Bar */}
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                onClick={handleRetake}
                className="px-4 py-2 rounded-xl bg-[#FAF8F4] border border-[#EBE6DF] hover:bg-[#FAF8FF] text-xs font-bold text-[#27223B] flex items-center gap-1.5"
              >
                <RotateCw className="w-3.5 h-3.5" />
                <span>Retake Quiz</span>
              </button>

              {incorrectQuestions.length > 0 && (
                <>
                  <button
                    onClick={handleRetryIncorrect}
                    className="px-4 py-2 rounded-xl bg-[#FAF8FF] border border-[#E2DCF7] text-[#6654D9] text-xs font-bold flex items-center gap-1.5"
                  >
                    <span>Retry Incorrect ({incorrectQuestions.length})</span>
                  </button>

                  <button
                    onClick={handleCreateFlashcardsFromMistakes}
                    className="px-4 py-2 rounded-xl bg-[#6654D9] hover:bg-[#5844CA] text-white text-xs font-bold flex items-center gap-1.5 shadow-xs"
                  >
                    <Layers className="w-3.5 h-3.5" />
                    <span>Create Flashcards from Mistakes</span>
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Detailed Question Review */}
          <div className="space-y-4">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-[#6E6685] pl-1">
              Detailed Question Explanations
            </h4>

            {quiz.questions.map((q, idx) => {
              const isCorrect = selectedAnswers[q.id] === q.correctAnswer;
              return (
                <div
                  key={q.id}
                  className={`bg-white rounded-3xl border p-6 space-y-4 shadow-xs ${
                    isCorrect ? 'border-[#BFE8D5]' : 'border-[#FFE1D2]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-md bg-[#FAF8F4] font-bold text-xs flex items-center justify-center text-[#27223B]">
                        {idx + 1}
                      </span>
                      <span
                        className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                          isCorrect
                            ? 'bg-[#F0FBF5] text-[#1E5638]'
                            : 'bg-[#FFF5F2] text-[#B33A18]'
                        }`}
                      >
                        {isCorrect ? 'Correct' : 'Incorrect'}
                      </span>
                    </div>

                    {isCorrect ? (
                      <CheckCircle2 className="w-5 h-5 text-[#2E7D32]" />
                    ) : (
                      <XCircle className="w-5 h-5 text-rose-500" />
                    )}
                  </div>

                  <div className="font-bold text-sm text-[#27223B]">
                    <MathRenderer content={q.question} />
                  </div>

                  {/* Your Answer vs Correct Answer */}
                  <div className="text-xs space-y-1.5 bg-[#FAF8F4] p-3.5 rounded-2xl border border-[#EBE6DF]">
                    <div>
                      <span className="font-semibold text-[#6E6685]">Your Answer: </span>
                      <span className={isCorrect ? 'text-[#1E5638] font-bold' : 'text-rose-600 font-bold'}>
                        {selectedAnswers[q.id] || '(No answer provided)'}
                      </span>
                    </div>
                    {!isCorrect && (
                      <div>
                        <span className="font-semibold text-[#1E5638]">Correct Answer: </span>
                        <span className="text-[#1E5638] font-bold">{q.correctAnswer}</span>
                      </div>
                    )}
                  </div>

                  {/* Educational Explanation */}
                  <div className="p-3.5 bg-[#FAF8FF] border border-[#E2DCF7] rounded-2xl text-xs space-y-1">
                    <span className="font-bold text-[#6654D9]">Educational Explanation:</span>
                    <div className="text-[#514963] leading-relaxed">
                      <MathRenderer content={q.explanation} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
