import React, { useEffect, useState } from 'react';
import {
  Languages,
  ArrowRight,
  RotateCw,
  Copy,
  Check,
  Save,
  BookOpen,
  Sparkles,
  FileText,
  Calculator
} from 'lucide-react';
import { storage } from '../services/storage';
import { NoteDocument, TranslationResource } from '../types';
import { MathRenderer } from '../components/common/MathRenderer';

interface TranslationPageProps {
  navigate: (route: string, params?: any) => void;
  initialNoteId?: string;
}

export const TranslationPage: React.FC<TranslationPageProps> = ({
  navigate,
  initialNoteId
}) => {
  const [notes, setNotes] = useState<NoteDocument[]>([]);
  const [selectedNoteId, setSelectedNoteId] = useState<string>(initialNoteId || '');
  const [targetLanguage, setTargetLanguage] = useState('Urdu');
  const [isTranslating, setIsTranslating] = useState(false);
  const [translationResult, setTranslationResult] = useState<TranslationResource | null>(null);
  const [viewMode, setViewMode] = useState<'side' | 'translated'>('side');
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const allNotes = await storage.getNotes();
      setNotes(allNotes);
      if (allNotes.length > 0 && !selectedNoteId) {
        setSelectedNoteId(allNotes[0].id);
      }
      setLoading(false);
    }
    load();
  }, [selectedNoteId]);

  const activeNote = notes.find((n) => n.id === selectedNoteId) || notes[0] || null;

  const handleTranslate = async () => {
    if (!activeNote) return;
    setIsTranslating(true);
    try {
      const res = await fetch('/api/translate-note', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          note: activeNote,
          targetLanguage
        })
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);

      setTranslationResult(data);
      await storage.saveTranslation(data);
    } catch (err: any) {
      alert('Translation failed: ' + err.message);
    } finally {
      setIsTranslating(false);
    }
  };

  const handleSaveAsSeparateNote = async () => {
    if (!translationResult || !activeNote) return;

    const newTranslatedNote: NoteDocument = {
      id: 'note-trans-' + Date.now(),
      title: translationResult.translatedTitle,
      overview: translationResult.translatedOverview,
      detailLevel: activeNote.detailLevel,
      academicLevel: activeNote.academicLevel,
      language: targetLanguage,
      tags: [...(activeNote.tags || []), targetLanguage],
      sections: translationResult.translatedSections.map((sec, idx) => ({
        ...sec,
        id: 'sec-' + idx,
        formulas: activeNote.sections[idx]?.formulas || []
      })),
      summary: translationResult.translatedSummary,
      keyTakeaways: activeNote.keyTakeaways,
      revisionChecklist: activeNote.revisionChecklist,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await storage.saveNote(newTranslatedNote);
    alert(`Saved as a separate ${targetLanguage} document in your notes library!`);
    navigate('note-editor', { id: newTranslatedNote.id });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-[#8B7CF6]">
          Scholarly Multilingual Workspace
        </span>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-[#27223B] tracking-tight mt-1">
          Academic Translation Studio
        </h2>
        <p className="text-xs sm:text-sm text-[#514963]">
          Translate study materials while preserving KaTeX formulas, tables, and typography without
          symbol corruption.
        </p>
      </div>

      {/* Selector Controls Bar */}
      <div className="bg-white p-5 rounded-3xl border border-[#EBE6DF] shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-4 flex-1 min-w-[280px]">
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-[#6E6685] mb-1">
              Select Document
            </label>
            <select
              value={selectedNoteId}
              onChange={(e) => {
                setSelectedNoteId(e.target.value);
                setTranslationResult(null);
              }}
              className="p-2.5 rounded-xl border border-[#EBE6DF] bg-[#FAF8F4] text-xs font-medium text-[#27223B] max-w-xs"
            >
              {notes.map((n) => (
                <option key={n.id} value={n.id}>
                  {n.title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-[#6E6685] mb-1">
              Target Language
            </label>
            <select
              value={targetLanguage}
              onChange={(e) => setTargetLanguage(e.target.value)}
              className="p-2.5 rounded-xl border border-[#EBE6DF] bg-[#FAF8F4] text-xs font-medium text-[#27223B]"
            >
              <option value="Urdu">Urdu (اردو - RTL)</option>
              <option value="Arabic">Arabic (العربية - RTL)</option>
              <option value="Hindi">Hindi (हिन्दी)</option>
              <option value="Spanish">Spanish (Español)</option>
              <option value="French">French (Français)</option>
              <option value="German">German (Deutsch)</option>
            </select>
          </div>
        </div>

        <button
          onClick={handleTranslate}
          disabled={isTranslating || !activeNote}
          className="px-6 py-3 rounded-2xl bg-[#6654D9] hover:bg-[#5844CA] text-white text-xs font-bold shadow-md shadow-[#6654D9]/25 hover:scale-105 active:scale-95 transition-all flex items-center gap-2 disabled:opacity-50"
        >
          {isTranslating ? (
            <>
              <RotateCw className="w-4 h-4 animate-spin" />
              <span>Translating with Gemini...</span>
            </>
          ) : (
            <>
              <Languages className="w-4 h-4" />
              <span>Translate Notes</span>
            </>
          )}
        </button>
      </div>

      {/* Side-by-Side or Full View */}
      {translationResult ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 bg-[#FAF8F4] border border-[#EBE6DF] p-1 rounded-xl text-xs">
              <button
                onClick={() => setViewMode('side')}
                className={`px-3 py-1 rounded-lg font-semibold transition-colors ${
                  viewMode === 'side' ? 'bg-white text-[#6654D9] shadow-xs' : 'text-[#6E6685]'
                }`}
              >
                Side-by-Side View
              </button>
              <button
                onClick={() => setViewMode('translated')}
                className={`px-3 py-1 rounded-lg font-semibold transition-colors ${
                  viewMode === 'translated' ? 'bg-white text-[#6654D9] shadow-xs' : 'text-[#6E6685]'
                }`}
              >
                Translated Only
              </button>
            </div>

            <button
              onClick={handleSaveAsSeparateNote}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#1E5638] hover:bg-[#16422B] text-white text-xs font-bold shadow-xs transition-colors"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save as New {targetLanguage} Note</span>
            </button>
          </div>

          <div
            className={`grid gap-6 ${
              viewMode === 'side' ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1 max-w-4xl mx-auto'
            }`}
          >
            {/* Original Document Column */}
            {viewMode === 'side' && (
              <div className="bg-white rounded-3xl border border-[#EBE6DF] p-6 space-y-6 shadow-xs">
                <div className="border-b border-[#EBE6DF] pb-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#6E6685]">
                    Original ({activeNote?.language || 'English'})
                  </span>
                  <h3 className="text-xl font-bold text-[#27223B] mt-1">{activeNote?.title}</h3>
                  <p className="text-xs text-[#514963] mt-1 italic">{activeNote?.overview}</p>
                </div>

                <div className="space-y-6 text-sm text-[#27223B]">
                  {activeNote?.sections.map((sec, i) => (
                    <div key={i} className="space-y-2">
                      <h4 className="font-bold text-base text-[#27223B]">{sec.title}</h4>
                      <MathRenderer content={sec.content} />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Translated Document Column */}
            <div
              className={`bg-white rounded-3xl border border-[#E2DCF7] p-6 space-y-6 shadow-xs ${
                translationResult.isRTL ? 'text-right' : 'text-left'
              }`}
              dir={translationResult.isRTL ? 'rtl' : 'ltr'}
            >
              <div className="border-b border-[#EBE6DF] pb-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#6654D9]">
                  Translated ({targetLanguage})
                </span>
                <h3 className="text-xl font-bold text-[#27223B] mt-1">
                  {translationResult.translatedTitle}
                </h3>
                <p className="text-xs text-[#514963] mt-1 italic">
                  {translationResult.translatedOverview}
                </p>
              </div>

              <div className="space-y-6 text-sm text-[#27223B]">
                {translationResult.translatedSections.map((sec, i) => (
                  <div key={i} className="space-y-2">
                    <h4 className="font-bold text-base text-[#27223B]">{sec.title}</h4>
                    <MathRenderer content={sec.content} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Empty Preview State */
        <div className="bg-white rounded-3xl border border-[#EBE6DF] p-12 text-center space-y-4">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-[#FAF8FF] border border-[#E2DCF7] text-[#6654D9] flex items-center justify-center">
            <Languages className="w-7 h-7" />
          </div>
          <div>
            <h3 className="font-bold text-base text-[#27223B]">
              Ready to Translate "{activeNote?.title}"
            </h3>
            <p className="text-xs text-[#6E6685] max-w-md mx-auto mt-1">
              Click "Translate Notes" above. Our engine preserves all mathematical symbols, LaTeX
              equations, and tables without overwriting your original notes.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
