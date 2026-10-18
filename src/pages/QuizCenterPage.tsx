import React, { useEffect, useState } from 'react';
import {
  HelpCircle,
  Plus,
  Play,
  RotateCw,
  CheckCircle2,
  Clock,
  Sparkles,
  BarChart,
  Trash2,
  Filter,
  ArrowRight
} from 'lucide-react';
import { storage } from '../services/storage';
import { Quiz, NoteDocument, AcademicLevel } from '../types';

interface QuizCenterPageProps {
  navigate: (route: string, params?: any) => void;
}

export const QuizCenterPage: React.FC<QuizCenterPageProps> = ({ navigate }) => {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [notes, setNotes] = useState<NoteDocument[]>([]);
  const [loading, setLoading] = useState(true);

  // New Quiz Modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedNoteId, setSelectedNoteId] = useState('');
  const [questionCount, setQuestionCount] = useState(5);
  const [difficulty, setDifficulty] = useState<AcademicLevel>('intermediate');
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    async function load() {
      const [allQuizzes, allNotes] = await Promise.all([
        storage.getQuizzes(),
        storage.getNotes()
      ]);
      setQuizzes(allQuizzes);
      setNotes(allNotes);
      if (allNotes.length > 0) setSelectedNoteId(allNotes[0].id);
      setLoading(false);
    }
    load();
  }, []);

  const handleGenerateQuiz = async (e: React.FormEvent) => {
    e.preventDefault();
    const sourceNote = notes.find((n) => n.id === selectedNoteId);
    if (!sourceNote) return;

    setIsGenerating(true);
    try {
      const res = await fetch('/api/generate-quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sourceTitle: sourceNote.title,
          sourceContent: sourceNote.overview + '\n' + sourceNote.sections.map((s) => s.content).join('\n'),
          questionCount,
          difficulty,
          language: sourceNote.language || 'English'
        })
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);

      data.noteId = sourceNote.id;
      await storage.saveQuiz(data);
      setQuizzes([data, ...quizzes]);
      setShowCreateModal(false);
      navigate('quiz-runner', { id: data.id });
    } catch (err: any) {
      alert('Failed to generate quiz: ' + err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#8B7CF6]">
            Active Recall & Testing
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#27223B] tracking-tight mt-1">
            Quiz Center
          </h2>
          <p className="text-xs sm:text-sm text-[#514963]">
            Challenge your conceptual understanding, problem-solving, and formula retention.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2.5 rounded-xl bg-[#6654D9] hover:bg-[#5844CA] text-white text-xs font-bold shadow-md shadow-[#6654D9]/25 hover:scale-105 active:scale-95 transition-all flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Quiz</span>
        </button>
      </div>

      {/* Quizzes List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {quizzes.map((q) => (
          <div
            key={q.id}
            className="bg-white rounded-3xl border border-[#EBE6DF] hover:border-[#8B7CF6] p-6 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#1E5638] bg-[#F0FBF5] px-2 py-0.5 rounded-md border border-[#BFE8D5]">
                  {q.difficulty}
                </span>
                {q.bestScore !== undefined && (
                  <span className="text-xs font-bold text-[#1E5638] flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Best: {q.bestScore}%
                  </span>
                )}
              </div>

              <h3 className="font-bold text-base text-[#27223B] leading-snug">{q.title}</h3>
              <p className="text-xs text-[#514963] line-clamp-2 leading-relaxed">
                {q.description}
              </p>

              <div className="text-xs text-[#6E6685] flex items-center gap-3 pt-1">
                <span>{q.questions.length} Questions</span>
                <span>•</span>
                <span>Language: {q.language}</span>
              </div>
            </div>

            <div className="pt-5 mt-4 border-t border-[#EBE6DF] flex items-center justify-between">
              <button
                onClick={() => navigate('quiz-runner', { id: q.id })}
                className="w-full py-2.5 rounded-xl bg-[#6654D9] hover:bg-[#5844CA] text-white text-xs font-bold shadow-xs flex items-center justify-center gap-2 transition-colors"
              >
                <Play className="w-3.5 h-3.5" />
                <span>{q.lastAttemptAt ? 'Retake Quiz' : 'Start Quiz'}</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Create Quiz Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-[#EBE6DF] animate-in zoom-in-95 duration-100">
            <h3 className="font-bold text-lg text-[#27223B]">Create Assessment Quiz</h3>
            <p className="text-xs text-[#6E6685] mt-1 mb-4">
              Select study material and AI will generate questions testing your understanding.
            </p>

            <form onSubmit={handleGenerateQuiz} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#27223B] mb-1">
                  Source Study Note
                </label>
                <select
                  value={selectedNoteId}
                  onChange={(e) => setSelectedNoteId(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-[#EBE6DF] bg-[#FAF8F4] text-xs text-[#27223B]"
                >
                  {notes.map((n) => (
                    <option key={n.id} value={n.id}>
                      {n.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#27223B] mb-1">
                    Number of Questions
                  </label>
                  <select
                    value={questionCount}
                    onChange={(e) => setQuestionCount(parseInt(e.target.value, 10))}
                    className="w-full p-2.5 rounded-xl border border-[#EBE6DF] bg-[#FAF8F4] text-xs text-[#27223B]"
                  >
                    <option value={3}>3 Questions</option>
                    <option value={5}>5 Questions</option>
                    <option value={8}>8 Questions</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#27223B] mb-1">
                    Difficulty Level
                  </label>
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value as AcademicLevel)}
                    className="w-full p-2.5 rounded-xl border border-[#EBE6DF] bg-[#FAF8F4] text-xs text-[#27223B]"
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#EBE6DF]">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-[#6E6685] hover:bg-[#FAF8F4]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isGenerating}
                  className="px-5 py-2.5 rounded-xl bg-[#6654D9] text-white text-xs font-bold disabled:opacity-50 flex items-center gap-2"
                >
                  {isGenerating ? (
                    <>
                      <RotateCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Generating with Gemini...</span>
                    </>
                  ) : (
                    <span>Generate Quiz</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
