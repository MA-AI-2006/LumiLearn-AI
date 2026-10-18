import React, { useEffect, useState } from 'react';
import {
  Sparkles,
  Plus,
  FileText,
  Video,
  Mic,
  HelpCircle,
  Layers,
  ArrowRight,
  Clock,
  CheckCircle2,
  TrendingUp,
  BookOpen,
  Calendar,
  Flame,
  Brain,
  ChevronRight
} from 'lucide-react';
import { storage } from '../services/storage';
import { NoteDocument, SourceMaterial, Quiz, FlashcardDeck } from '../types';
import { useAuth } from '../context/AuthContext';

interface DashboardPageProps {
  navigate: (route: string, params?: any) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ navigate }) => {
  const { currentUser } = useAuth();
  const [sources, setSources] = useState<SourceMaterial[]>([]);
  const [notes, setNotes] = useState<NoteDocument[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [decks, setDecks] = useState<FlashcardDeck[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [loadedSources, loadedNotes, loadedQuizzes, loadedDecks] = await Promise.all([
          storage.getSources(),
          storage.getNotes(),
          storage.getQuizzes(),
          storage.getFlashcardDecks()
        ]);
        setSources(loadedSources);
        setNotes(loadedNotes);
        setQuizzes(loadedQuizzes);
        setDecks(loadedDecks);
      } catch (e) {
        console.error('Error loading dashboard data:', e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const totalCards = decks.reduce((acc, d) => acc + (d.cards?.length || 0), 0);
  const masteredCards = decks.reduce((acc, d) => acc + (d.cardsMastered || 0), 0);

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* 1. Header & Personalized Greeting Banner */}
      <div className="bg-gradient-to-r from-[#FAF8FF] via-[#F6F4FE] to-[#F1EFFD] rounded-3xl p-6 sm:p-8 border border-[#E2DCF7] flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xs">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-[#E2DCF7] text-xs font-semibold text-[#6654D9]">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Study Command Center</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#27223B] tracking-tight">
            Ready to make learning click, {currentUser?.displayName || 'Student'}?
          </h2>
          <p className="text-xs sm:text-sm text-[#514963] max-w-xl">
            You have active notes in Microeconomics and Calculus with KaTeX step-by-step
            derivations and spaced-repetition cards ready.
          </p>
        </div>

        <button
          onClick={() => navigate('create')}
          className="px-5 py-3 rounded-2xl bg-[#6654D9] hover:bg-[#5844CA] text-white text-xs sm:text-sm font-bold shadow-md shadow-[#6654D9]/25 hover:scale-105 active:scale-95 transition-all flex items-center gap-2 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Transform New Material</span>
        </button>
      </div>

      {/* 2. Drag-and-Drop Quick Import Hero Card */}
      <div
        onClick={() => navigate('create')}
        className="bg-white border-2 border-dashed border-[#8B7CF6]/40 hover:border-[#6654D9] rounded-3xl p-8 text-center cursor-pointer hover:bg-[#FAF8FF] transition-all group shadow-xs"
      >
        <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-[#8B7CF6]/15 text-[#6654D9] flex items-center justify-center group-hover:scale-110 transition-transform shadow-xs">
          <Sparkles className="w-7 h-7" />
        </div>
        <h3 className="font-bold text-base text-[#27223B]">
          Drag & drop lecture notes, syllabus, audio, or past papers
        </h3>
        <p className="text-xs text-[#6E6685] mt-1 max-w-md mx-auto">
          Supports PDF, DOCX, PPTX, MP4 videos, YouTube URLs, and audio recordings. Gemini will
          structure complete teaching notes and KaTeX formulas.
        </p>
        <div className="mt-4 flex items-center justify-center gap-2">
          <span className="text-xs font-semibold text-[#6654D9] bg-white px-3 py-1 rounded-full border border-[#E2DCF7] group-hover:shadow-xs">
            Browse files or paste link →
          </span>
        </div>
      </div>

      {/* 3. Three Source Input Tiles */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div
          onClick={() => navigate('create', { tab: 'docs' })}
          className="p-5 rounded-2xl bg-white border border-[#EBE6DF] hover:border-[#8B7CF6] cursor-pointer transition-all shadow-xs hover:shadow-md group"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-violet-100 text-[#6654D9] flex items-center justify-center group-hover:scale-105 transition-transform">
              <FileText className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#FAF8FF] text-[#6654D9] border border-[#E2DCF7]">
              Documents & Images
            </span>
          </div>
          <h4 className="font-bold text-sm text-[#27223B]">Textbooks & Slides</h4>
          <p className="text-xs text-[#6E6685] mt-1">
            Extract headings, tables, and handwritten math from PDF, DOCX, or PNG.
          </p>
        </div>

        <div
          onClick={() => navigate('create', { tab: 'video' })}
          className="p-5 rounded-2xl bg-white border border-[#EBE6DF] hover:border-[#8B7CF6] cursor-pointer transition-all shadow-xs hover:shadow-md group"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-[#1E5638] flex items-center justify-center group-hover:scale-105 transition-transform">
              <Video className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#F2FBF6] text-[#1E5638] border border-[#BFE8D5]">
              Lectures & Videos
            </span>
          </div>
          <h4 className="font-bold text-sm text-[#27223B]">YouTube & Drive</h4>
          <p className="text-xs text-[#6E6685] mt-1">
            Turn YouTube lectures or MP4 uploads into timestamped study outlines.
          </p>
        </div>

        <div
          onClick={() => navigate('create', { tab: 'audio' })}
          className="p-5 rounded-2xl bg-white border border-[#EBE6DF] hover:border-[#8B7CF6] cursor-pointer transition-all shadow-xs hover:shadow-md group"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-[#8B4513] flex items-center justify-center group-hover:scale-105 transition-transform">
              <Mic className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#FFFBF0] text-[#8B4513] border border-[#FFE1D2]">
              Recordings & Memos
            </span>
          </div>
          <h4 className="font-bold text-sm text-[#27223B]">Classroom Audio</h4>
          <p className="text-xs text-[#6E6685] mt-1">
            Transcribe and structure audio lectures into readable study chapters.
          </p>
        </div>
      </div>

      {/* 4. Main Stats & Progress Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Recently Edited Notes (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-[#EBE6DF] p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#6654D9]" />
              <h3 className="font-bold text-sm text-[#27223B]">Recently Edited Study Notes</h3>
            </div>
            <button
              onClick={() => navigate('notes')}
              className="text-xs text-[#6654D9] font-semibold hover:underline flex items-center gap-1"
            >
              <span>View all ({notes.length})</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {notes.slice(0, 3).map((note) => (
              <div
                key={note.id}
                onClick={() => navigate('note-editor', { id: note.id })}
                className="p-4 rounded-2xl bg-[#FAF8F4] hover:bg-[#FAF8FF] border border-[#EBE6DF] hover:border-[#E2DCF7] cursor-pointer transition-all group"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#8B7CF6]">
                    {note.tags?.[0] || 'Study Notes'} • {note.detailLevel} detail
                  </span>
                  <span className="text-[11px] text-[#6E6685] flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(note.updatedAt).toLocaleDateString()}
                  </span>
                </div>
                <h4 className="font-bold text-sm text-[#27223B] group-hover:text-[#6654D9] transition-colors">
                  {note.title}
                </h4>
                <p className="text-xs text-[#514963] mt-1 line-clamp-2 leading-relaxed">
                  {note.overview}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Quiz Activity & Flashcards Progress (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Flashcard Mastery Widget */}
          <div className="bg-white rounded-3xl border border-[#EBE6DF] p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#C96E3A]" />
                <h3 className="font-bold text-sm text-[#27223B]">Flashcard Review</h3>
              </div>
              <button
                onClick={() => navigate('flashcards')}
                className="text-xs text-[#6654D9] font-semibold hover:underline"
              >
                Study Decks →
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-[#FFFBF0] border border-[#FFE1D2]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-[#8B4513]">Mastery Progress</span>
                <span className="text-xs font-bold text-[#8B4513]">
                  {masteredCards} / {totalCards} cards
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-[#FFE1D2] overflow-hidden">
                <div
                  className="h-full bg-[#E65100] rounded-full transition-all duration-500"
                  style={{
                    width: `${totalCards > 0 ? (masteredCards / totalCards) * 100 : 0}%`
                  }}
                />
              </div>
              <p className="text-[11px] text-[#8B4513]/80 mt-2">
                {totalCards - masteredCards} cards remaining in queue for active recall.
              </p>
            </div>
          </div>

          {/* Quiz Performance Widget */}
          <div className="bg-white rounded-3xl border border-[#EBE6DF] p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-[#1E5638]" />
                <h3 className="font-bold text-sm text-[#27223B]">Quiz Performance</h3>
              </div>
              <button
                onClick={() => navigate('quizzes')}
                className="text-xs text-[#6654D9] font-semibold hover:underline"
              >
                Quiz Center →
              </button>
            </div>

            {quizzes.length > 0 ? (
              <div className="p-4 rounded-2xl bg-[#F0FBF5] border border-[#BFE8D5] flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-[#1E5638]">{quizzes[0].title}</div>
                  <div className="text-[11px] text-[#2B6144] mt-0.5">
                    {quizzes[0].questions.length} questions • Best score: {quizzes[0].bestScore || 100}%
                  </div>
                </div>
                <button
                  onClick={() => navigate('quiz-runner', { id: quizzes[0].id })}
                  className="px-3 py-1.5 rounded-xl bg-[#1E5638] text-white text-xs font-bold hover:bg-[#16422B] transition-colors"
                >
                  Retake
                </button>
              </div>
            ) : (
              <p className="text-xs text-[#6E6685]">No quiz attempts recorded yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
