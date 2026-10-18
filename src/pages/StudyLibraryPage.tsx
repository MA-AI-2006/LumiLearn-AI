import React, { useEffect, useState } from 'react';
import {
  Library,
  FileText,
  Video,
  Mic,
  HelpCircle,
  Layers,
  Languages,
  ExternalLink,
  ChevronRight,
  Clock,
  Plus
} from 'lucide-react';
import { storage } from '../services/storage';
import { SourceMaterial, NoteDocument, Quiz, FlashcardDeck, TranslationResource } from '../types';

interface StudyLibraryPageProps {
  navigate: (route: string, params?: any) => void;
}

export const StudyLibraryPage: React.FC<StudyLibraryPageProps> = ({ navigate }) => {
  const [sources, setSources] = useState<SourceMaterial[]>([]);
  const [notes, setNotes] = useState<NoteDocument[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [decks, setDecks] = useState<FlashcardDeck[]>([]);
  const [translations, setTranslations] = useState<TranslationResource[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [s, n, q, d, t] = await Promise.all([
        storage.getSources(),
        storage.getNotes(),
        storage.getQuizzes(),
        storage.getFlashcardDecks(),
        storage.getTranslations()
      ]);
      setSources(s);
      setNotes(n);
      setQuizzes(q);
      setDecks(d);
      setTranslations(t);
      setLoading(false);
    }
    load();
  }, []);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#8B7CF6]">
            Knowledge Tree
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#27223B] tracking-tight mt-1">
            Study Library & Relationships
          </h2>
          <p className="text-xs sm:text-sm text-[#514963]">
            Explore the relationship between imported source files and all derived notes, quizzes,
            and flashcards.
          </p>
        </div>

        <button
          onClick={() => navigate('create')}
          className="px-4 py-2.5 rounded-xl bg-[#6654D9] hover:bg-[#5844CA] text-white text-xs font-bold shadow-md shadow-[#6654D9]/25 hover:scale-105 active:scale-95 transition-all flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Import Source</span>
        </button>
      </div>

      {/* Sources & Derived Items List */}
      <div className="space-y-6">
        {sources.map((source) => {
          const derivedNotes = notes.filter((n) => n.sourceId === source.id);
          const derivedQuizzes = quizzes.filter((q) => q.sourceId === source.id);
          const derivedDecks = decks.filter((d) => d.sourceId === source.id);

          return (
            <div
              key={source.id}
              className="bg-white rounded-3xl border border-[#EBE6DF] p-6 shadow-xs space-y-4"
            >
              {/* Source Header */}
              <div className="flex items-start justify-between gap-4 pb-4 border-b border-[#EBE6DF]">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-11 h-11 rounded-2xl flex items-center justify-center ${
                      source.sourceType === 'document'
                        ? 'bg-violet-100 text-[#6654D9]'
                        : source.sourceType === 'video'
                        ? 'bg-emerald-100 text-[#1E5638]'
                        : 'bg-amber-100 text-[#8B4513]'
                    }`}
                  >
                    {source.sourceType === 'document' ? (
                      <FileText className="w-6 h-6" />
                    ) : source.sourceType === 'video' ? (
                      <Video className="w-6 h-6" />
                    ) : (
                      <Mic className="w-6 h-6" />
                    )}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#8B7CF6]">
                        {source.sourceType} source
                      </span>
                      {source.fileSize && (
                        <span className="text-[10px] text-[#6E6685]">• {source.fileSize}</span>
                      )}
                    </div>
                    <h3 className="font-bold text-base text-[#27223B]">{source.title}</h3>
                  </div>
                </div>

                <span className="text-xs text-[#6E6685] flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {new Date(source.createdAt).toLocaleDateString()}
                </span>
              </div>

              {/* Derived Resources Tree */}
              <div className="space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-[#6E6685]">
                  Derived Study Outputs ({derivedNotes.length + derivedQuizzes.length + derivedDecks.length})
                </span>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {/* Derived Notes */}
                  {derivedNotes.map((note) => (
                    <div
                      key={note.id}
                      onClick={() => navigate('note-editor', { id: note.id })}
                      className="p-3.5 rounded-2xl bg-[#FAF8FF] border border-[#E2DCF7] hover:border-[#6654D9] cursor-pointer transition-all flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <FileText className="w-4 h-4 text-[#6654D9] shrink-0" />
                        <span className="text-xs font-bold text-[#27223B] truncate">
                          {note.title}
                        </span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-[#6E6685] shrink-0" />
                    </div>
                  ))}

                  {/* Derived Quizzes */}
                  {derivedQuizzes.map((quiz) => (
                    <div
                      key={quiz.id}
                      onClick={() => navigate('quiz-runner', { id: quiz.id })}
                      className="p-3.5 rounded-2xl bg-[#F0FBF5] border border-[#BFE8D5] hover:border-[#1E5638] cursor-pointer transition-all flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <HelpCircle className="w-4 h-4 text-[#1E5638] shrink-0" />
                        <span className="text-xs font-bold text-[#27223B] truncate">
                          {quiz.title}
                        </span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-[#6E6685] shrink-0" />
                    </div>
                  ))}

                  {/* Derived Flashcards */}
                  {derivedDecks.map((deck) => (
                    <div
                      key={deck.id}
                      onClick={() => navigate('flashcards', { deckId: deck.id })}
                      className="p-3.5 rounded-2xl bg-[#FFFBF0] border border-[#FFE1D2] hover:border-[#8B4513] cursor-pointer transition-all flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Layers className="w-4 h-4 text-[#8B4513] shrink-0" />
                        <span className="text-xs font-bold text-[#27223B] truncate">
                          {deck.title}
                        </span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-[#6E6685] shrink-0" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
