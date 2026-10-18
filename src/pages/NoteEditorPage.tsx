import React, { useEffect, useState, useRef } from 'react';
import {
  Save,
  Download,
  Copy,
  Sparkles,
  HelpCircle,
  Layers,
  Languages,
  Bot,
  Heading1,
  Heading2,
  Heading3,
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  Quote,
  Table,
  Calculator,
  ChevronLeft,
  Check,
  CheckCircle2,
  Clock,
  Printer,
  FileDown,
  RefreshCw
} from 'lucide-react';
import { storage } from '../services/storage';
import { NoteDocument, NoteSection, FormulaExplanation } from '../types';
import { MathRenderer } from '../components/common/MathRenderer';
import { FormulaCard } from '../components/common/FormulaCard';

interface NoteEditorPageProps {
  noteId: string;
  navigate: (route: string, params?: any) => void;
  onOpenContextTutor?: () => void;
}

export const NoteEditorPage: React.FC<NoteEditorPageProps> = ({
  noteId,
  navigate,
  onOpenContextTutor
}) => {
  const [note, setNote] = useState<NoteDocument | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSavedTime, setLastSavedTime] = useState<string>('Just now');
  const [isEditing, setIsEditing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activeOutlineId, setActiveOutlineId] = useState<string>('');

  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function loadNote() {
      const data = await storage.getNoteById(noteId);
      if (data) {
        setNote(data);
      } else {
        // If not found, fall back to first seed note
        const all = await storage.getNotes();
        setNote(all[0] || null);
      }
      setLoading(false);
    }
    loadNote();
  }, [noteId]);

  const handleSave = async () => {
    if (!note) return;
    setIsSaving(true);
    await storage.saveNote({ ...note, updatedAt: new Date().toISOString() });
    setLastSavedTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    setIsSaving(false);
  };

  const handleCopyFormatted = () => {
    if (!note) return;
    let fullText = `${note.title}\n\n${note.overview}\n\n`;
    note.sections.forEach((s) => {
      fullText += `## ${s.title}\n\n${s.content}\n\n`;
    });
    fullText += `Summary:\n${note.summary}`;
    navigator.clipboard.writeText(fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Real Print to PDF function
  const handleDownloadPDF = () => {
    window.print();
  };

  // Real Markdown File Download
  const handleExportMarkdown = () => {
    if (!note) return;
    let md = `# ${note.title}\n\n*${note.overview}*\n\n`;
    note.sections.forEach((s) => {
      md += `## ${s.title}\n\n${s.content}\n\n`;
      if (s.formulas) {
        s.formulas.forEach((f) => {
          md += `### Formula: ${f.name}\n$$${f.latex}$$\nPurpose: ${f.purpose}\n\n`;
        });
      }
    });
    md += `\n## Summary\n${note.summary}\n`;

    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${note.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.md`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const updateSectionContent = (index: number, newContent: string) => {
    if (!note) return;
    const newSections = [...note.sections];
    newSections[index] = { ...newSections[index], content: newContent };
    setNote({ ...note, sections: newSections });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <RefreshCw className="w-6 h-6 animate-spin text-[#6654D9]" />
      </div>
    );
  }

  if (!note) {
    return (
      <div className="text-center py-12">
        <p className="text-sm text-[#6E6685]">Note not found.</p>
        <button
          onClick={() => navigate('notes')}
          className="mt-3 px-4 py-2 bg-[#6654D9] text-white rounded-xl text-xs font-bold"
        >
          Return to Notes Library
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Action Bar (hidden in print) */}
      <div className="no-print bg-white p-4 rounded-3xl border border-[#EBE6DF] shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('notes')}
            className="p-2 rounded-xl text-[#6E6685] hover:text-[#27223B] hover:bg-[#FAF8F4] transition-colors"
            title="Back to library"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#8B7CF6] bg-[#FAF8FF] px-2 py-0.5 rounded-md border border-[#E2DCF7]">
              {note.detailLevel} study notes
            </span>
            <div className="text-xs text-[#6E6685] flex items-center gap-1.5 mt-0.5">
              <Clock className="w-3 h-3" />
              <span>Saved {lastSavedTime}</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Edit / Preview toggle */}
          <button
            onClick={() => setIsEditing(!isEditing)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
              isEditing
                ? 'bg-[#6654D9] text-white shadow-xs'
                : 'bg-[#FAF8F4] text-[#27223B] border border-[#EBE6DF] hover:bg-[#F2EEFF]'
            }`}
          >
            {isEditing ? 'View Formatted' : 'Edit Content'}
          </button>

          {/* Copy Button */}
          <button
            onClick={handleCopyFormatted}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#EBE6DF] bg-white hover:bg-[#FAF8F4] text-xs font-semibold text-[#27223B]"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-[#6E6685]" />}
            <span>{copied ? 'Copied!' : 'Copy'}</span>
          </button>

          {/* Real PDF Download Button */}
          <button
            onClick={handleDownloadPDF}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-[#6654D9] to-[#8B7CF6] text-white text-xs font-bold shadow-xs hover:shadow-md transition-all"
            title="Download complete notes as PDF with rendered formulas"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Download PDF</span>
          </button>

          {/* Markdown Download */}
          <button
            onClick={handleExportMarkdown}
            className="p-2 rounded-xl border border-[#EBE6DF] bg-white hover:bg-[#FAF8F4] text-[#6E6685] hover:text-[#27223B]"
            title="Export as Markdown"
          >
            <FileDown className="w-4 h-4" />
          </button>

          {/* Save Button */}
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-[#1E5638] hover:bg-[#16422B] text-white text-xs font-bold shadow-xs transition-colors"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{isSaving ? 'Saving...' : 'Save'}</span>
          </button>
        </div>
      </div>

      {/* Cross-Tool Actions Strip (hidden in print) */}
      <div className="no-print flex flex-wrap items-center gap-2 p-2.5 bg-gradient-to-r from-[#FAF8FF] to-[#FAF8F4] rounded-2xl border border-[#E2DCF7] text-xs">
        <span className="font-bold text-[#6654D9] pl-2 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Derived Actions:</span>
        </span>

        <button
          onClick={() => navigate('quizzes')}
          className="px-3 py-1 rounded-xl bg-white hover:bg-[#FAF8FF] text-[#27223B] border border-[#E2DCF7] font-semibold flex items-center gap-1.5 shadow-2xs"
        >
          <HelpCircle className="w-3.5 h-3.5 text-[#6654D9]" />
          <span>Generate Quiz</span>
        </button>

        <button
          onClick={() => navigate('flashcards')}
          className="px-3 py-1 rounded-xl bg-white hover:bg-[#FAF8FF] text-[#27223B] border border-[#E2DCF7] font-semibold flex items-center gap-1.5 shadow-2xs"
        >
          <Layers className="w-3.5 h-3.5 text-[#6654D9]" />
          <span>Generate Flashcards</span>
        </button>

        <button
          onClick={() => navigate('translate', { noteId: note.id })}
          className="px-3 py-1 rounded-xl bg-white hover:bg-[#FAF8FF] text-[#27223B] border border-[#E2DCF7] font-semibold flex items-center gap-1.5 shadow-2xs"
        >
          <Languages className="w-3.5 h-3.5 text-[#6654D9]" />
          <span>Translate Note (RTL & LaTeX)</span>
        </button>

        <button
          onClick={() => navigate('tutor', { noteId: note.id })}
          className="px-3 py-1 rounded-xl bg-white hover:bg-[#FAF8FF] text-[#6654D9] border border-[#E2DCF7] font-bold flex items-center gap-1.5 shadow-2xs ml-auto"
        >
          <Bot className="w-3.5 h-3.5" />
          <span>Ask AI Tutor about this Note</span>
        </button>
      </div>

      {/* Main Document Layout Grid (Note Content + Section Outline) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Main Note Document Canvas (Printable Area) */}
        <article
          ref={printRef}
          className="lg:col-span-8 bg-white rounded-3xl border border-[#EBE6DF] p-6 sm:p-10 shadow-xs space-y-8 note-content-print"
        >
          {/* Note Title & Metadata */}
          <div className="space-y-3 pb-6 border-b border-[#EBE6DF]">
            {isEditing ? (
              <input
                type="text"
                value={note.title}
                onChange={(e) => setNote({ ...note, title: e.target.value })}
                className="w-full text-2xl sm:text-3xl font-extrabold text-[#27223B] tracking-tight p-2 border border-[#8B7CF6] rounded-xl focus:outline-hidden"
              />
            ) : (
              <h1 className="text-2xl sm:text-4xl font-extrabold text-[#27223B] tracking-tight leading-tight">
                {note.title}
              </h1>
            )}

            <p className="text-sm sm:text-base text-[#514963] leading-relaxed italic">
              {note.overview}
            </p>

            <div className="flex flex-wrap items-center gap-2 text-xs text-[#6E6685] pt-2">
              <span className="font-semibold text-[#6654D9]">Academic Rigor:</span>
              <span className="capitalize">{note.academicLevel}</span>
              <span>•</span>
              <span className="font-semibold text-[#6654D9]">Language:</span>
              <span>{note.language}</span>
              {note.tags?.map((t, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 rounded-full bg-[#FAF8F4] border border-[#EBE6DF] text-[#6E6685]"
                >
                  #{t}
                </span>
              ))}
            </div>
          </div>

          {/* Sections */}
          <div className="space-y-10">
            {note.sections.map((sec, idx) => (
              <section key={sec.id || idx} id={`section-${sec.id}`} className="space-y-4">
                <h2 className="text-xl sm:text-2xl font-bold text-[#27223B] tracking-tight border-b border-[#EBE6DF]/70 pb-2">
                  {sec.title}
                </h2>

                {isEditing ? (
                  <textarea
                    rows={8}
                    value={sec.content}
                    onChange={(e) => updateSectionContent(idx, e.target.value)}
                    className="w-full p-4 rounded-xl border border-[#EBE6DF] bg-[#FAF8F4] text-xs font-mono text-[#27223B] focus:outline-hidden focus:border-[#8B7CF6]"
                  />
                ) : (
                  <div className="text-sm text-[#27223B] leading-relaxed">
                    <MathRenderer content={sec.content} />
                  </div>
                )}

                {/* Educational Formula Cards with KaTeX and Worked Examples */}
                {sec.formulas && sec.formulas.length > 0 && (
                  <div className="space-y-4 pt-2">
                    {sec.formulas.map((formula, fIdx) => (
                      <FormulaCard key={fIdx} formula={formula} />
                    ))}
                  </div>
                )}

                {/* Key Definitions if present */}
                {sec.keyDefinitions && sec.keyDefinitions.length > 0 && (
                  <div className="p-4 bg-[#F8F6FF] rounded-2xl border border-[#E2DCF7] space-y-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#6654D9]">
                      Key Definitions
                    </span>
                    <div className="space-y-2">
                      {sec.keyDefinitions.map((d, dIdx) => (
                        <div key={dIdx} className="text-xs">
                          <strong className="text-[#27223B]">{d.term}: </strong>
                          <span className="text-[#514963]">{d.definition}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </section>
            ))}
          </div>

          {/* Summary & Key Takeaways */}
          <div className="pt-8 border-t border-[#EBE6DF] space-y-5">
            <div className="p-5 rounded-3xl bg-[#FAF8F4] border border-[#EBE6DF] space-y-2">
              <h3 className="text-sm font-bold text-[#27223B]">Executive Summary</h3>
              <p className="text-xs text-[#514963] leading-relaxed">{note.summary}</p>
            </div>

            {note.keyTakeaways && note.keyTakeaways.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-[#6654D9]">
                  Key Takeaways
                </h4>
                <ul className="space-y-1.5 text-xs text-[#27223B]">
                  {note.keyTakeaways.map((k, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-[#2E7D32] shrink-0 mt-0.5" />
                      <span>{k}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {note.revisionChecklist && note.revisionChecklist.length > 0 && (
              <div className="space-y-2 pt-2">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-[#C96E3A]">
                  Revision Checklist
                </h4>
                <div className="space-y-1.5 text-xs text-[#27223B]">
                  {note.revisionChecklist.map((item, i) => (
                    <label key={i} className="flex items-start gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        className="rounded text-[#6654D9] focus:ring-[#8B7CF6] mt-0.5"
                      />
                      <span>{item}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>
        </article>

        {/* Right Sidebar: Sticky Section Outline (hidden in print) */}
        <aside className="no-print hidden lg:block lg:col-span-4 sticky top-24 space-y-6">
          <div className="bg-white rounded-3xl border border-[#EBE6DF] p-5 shadow-xs space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#6654D9]">
              Document Outline
            </h3>
            <nav className="space-y-1 text-xs">
              {note.sections.map((sec, idx) => (
                <a
                  key={sec.id || idx}
                  href={`#section-${sec.id}`}
                  className="block px-2.5 py-1.5 rounded-lg text-[#514963] hover:text-[#6654D9] hover:bg-[#FAF8FF] truncate transition-colors"
                >
                  {sec.title}
                </a>
              ))}
            </nav>
          </div>

          {/* AI Tutor Assistant Callout */}
          <div className="bg-gradient-to-br from-[#FAF8FF] to-[#F1EFFD] rounded-3xl border border-[#E2DCF7] p-5 shadow-xs space-y-3">
            <div className="flex items-center gap-2 text-[#6654D9] font-bold text-xs">
              <Bot className="w-4 h-4" />
              <span>Have a question about this note?</span>
            </div>
            <p className="text-xs text-[#514963] leading-relaxed">
              Open the interactive AI Tutor to explore any concept, ask for additional examples, or
              verify a formula step.
            </p>
            <button
              onClick={() => navigate('tutor', { noteId: note.id })}
              className="w-full py-2 rounded-xl bg-[#6654D9] text-white text-xs font-bold hover:bg-[#5844CA] transition-colors"
            >
              Ask Tutor About This Note
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
};
