import React from 'react';
import {
  Clock,
  BookOpen,
  GraduationCap,
  Languages,
  Sparkles,
  Printer,
  FileDown,
  Copy,
  Check,
  Edit3,
  Eye,
  Type,
  Maximize2,
  ChevronLeft
} from 'lucide-react';
import { NoteDocument, AcademicLevel, NoteDetailLevel } from '../../types';

interface NoteHeaderProps {
  note: NoteDocument;
  isEditing: boolean;
  onToggleEdit: () => void;
  onDownloadPDF: () => void;
  onDownloadDOCX: () => void;
  onExportMarkdown: () => void;
  onCopy: () => void;
  copied: boolean;
  onBack: () => void;
  fontSize: 'sm' | 'md' | 'lg';
  onChangeFontSize: (size: 'sm' | 'md' | 'lg') => void;
  pageWidth: 'compact' | 'comfortable' | 'wide';
  onChangePageWidth: (width: 'compact' | 'comfortable' | 'wide') => void;
  paperTheme: 'clean' | 'cream';
  onChangePaperTheme: (theme: 'clean' | 'cream') => void;
  lastSavedTime?: string;
  onUpdateTitle?: (title: string) => void;
  onUpdateOverview?: (overview: string) => void;
}

export const NoteHeader: React.FC<NoteHeaderProps> = ({
  note,
  isEditing,
  onToggleEdit,
  onDownloadPDF,
  onDownloadDOCX,
  onExportMarkdown,
  onCopy,
  copied,
  onBack,
  fontSize,
  onChangeFontSize,
  pageWidth,
  onChangePageWidth,
  paperTheme,
  onChangePaperTheme,
  lastSavedTime,
  onUpdateTitle,
  onUpdateOverview
}) => {
  // Approximate reading time calculation
  const wordCount = React.useMemo(() => {
    let count = (note.overview || '').split(/\s+/).length;
    note.sections.forEach((sec) => {
      count += (sec.content || '').split(/\s+/).length;
    });
    return count;
  }, [note]);

  const readingMinutes = Math.max(1, Math.ceil(wordCount / 200));

  return (
    <header className="space-y-6">
      {/* Top Navigation & Toolbar Bar (hidden in print) */}
      <div className="no-print bg-white/95 backdrop-blur-md p-3.5 sm:p-4 rounded-3xl border border-[#EBE6DF] shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 rounded-xl text-[#6E6685] hover:text-[#27223B] hover:bg-[#FAF8F4] transition-colors"
            title="Back to library"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#6654D9] bg-[#FAF8FF] px-2 py-0.5 rounded-md border border-[#E2DCF7]">
                {note.detailLevel} Study Guide
              </span>
              <span className="text-[11px] text-[#6E6685] hidden sm:inline">
                • {readingMinutes} min read ({wordCount} words)
              </span>
            </div>
            {lastSavedTime && (
              <span className="text-[10px] text-[#8C84A0] flex items-center gap-1 mt-0.5">
                <Clock className="w-2.5 h-2.5" />
                <span>Saved {lastSavedTime}</span>
              </span>
            )}
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Font Size & Layout Controls */}
          <div className="hidden md:flex items-center bg-[#FAF8F4] border border-[#EBE6DF] rounded-xl p-1 gap-1">
            <button
              onClick={() => onChangeFontSize(fontSize === 'sm' ? 'md' : fontSize === 'md' ? 'lg' : 'sm')}
              className="px-2 py-1 rounded-lg text-xs font-bold text-[#6E6685] hover:text-[#27223B] flex items-center gap-1"
              title="Toggle Font Size"
            >
              <Type className="w-3.5 h-3.5" />
              <span className="uppercase text-[10px]">{fontSize}</span>
            </button>
            <div className="w-px h-3.5 bg-[#EBE6DF]" />
            <button
              onClick={() =>
                onChangePageWidth(
                  pageWidth === 'compact'
                    ? 'comfortable'
                    : pageWidth === 'comfortable'
                    ? 'wide'
                    : 'compact'
                )
              }
              className="px-2 py-1 rounded-lg text-xs font-bold text-[#6E6685] hover:text-[#27223B] flex items-center gap-1"
              title="Toggle Reading Width"
            >
              <Maximize2 className="w-3.5 h-3.5" />
              <span className="uppercase text-[10px]">{pageWidth}</span>
            </button>
            <div className="w-px h-3.5 bg-[#EBE6DF]" />
            <button
              onClick={() => onChangePaperTheme(paperTheme === 'clean' ? 'cream' : 'clean')}
              className={`px-2 py-1 rounded-lg text-xs font-bold transition-all ${
                paperTheme === 'cream' ? 'bg-[#FFF9EA] text-[#8B6B23] shadow-2xs' : 'text-[#6E6685]'
              }`}
              title="Paper Theme: Cream or Clean"
            >
              {paperTheme === 'cream' ? 'Cream Paper' : 'White'}
            </button>
          </div>

          {/* Edit / Read Mode */}
          <button
            onClick={onToggleEdit}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              isEditing
                ? 'bg-[#6654D9] text-white shadow-xs'
                : 'bg-white border border-[#EBE6DF] text-[#27223B] hover:bg-[#FAF8F4]'
            }`}
          >
            {isEditing ? (
              <>
                <Eye className="w-3.5 h-3.5" />
                <span>Reading View</span>
              </>
            ) : (
              <>
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit Note</span>
              </>
            )}
          </button>

          {/* Copy Button */}
          <button
            onClick={onCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#EBE6DF] bg-white hover:bg-[#FAF8F4] text-xs font-semibold text-[#27223B]"
          >
            {copied ? (
              <Check className="w-3.5 h-3.5 text-emerald-600" />
            ) : (
              <Copy className="w-3.5 h-3.5 text-[#6E6685]" />
            )}
            <span className="hidden sm:inline">{copied ? 'Copied' : 'Copy'}</span>
          </button>

          {/* Export to Word (.docx) */}
          <button
            onClick={onDownloadDOCX}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-700 hover:bg-blue-100 text-xs font-bold shadow-2xs transition-all"
            title="Export complete note as a Microsoft Word (.docx) document"
          >
            <FileDown className="w-3.5 h-3.5 text-blue-600" />
            <span>Word (.docx)</span>
          </button>

          {/* Export to PDF */}
          <button
            onClick={onDownloadPDF}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-[#6654D9] to-[#8B7CF6] text-white text-xs font-bold shadow-xs hover:shadow-md transition-all"
            title="Download formatted notes as PDF with rendered mathematical formulas"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>PDF</span>
          </button>
        </div>
      </div>

      {/* Hero Document Header Box (Styled like a University Study Guide cover) */}
      <div className="bg-gradient-to-b from-white via-white to-[#FAF8FF] rounded-3xl border border-[#EBE6DF] p-6 sm:p-10 shadow-xs space-y-4">
        {/* Academic Meta Tags */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-[#FAF8FF] border border-[#E2DCF7] text-[#6654D9] flex items-center gap-1.5">
            <GraduationCap className="w-3.5 h-3.5" />
            <span className="capitalize">{note.academicLevel} Level</span>
          </span>
          <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-[#F2FBF6] border border-[#BFE8D5] text-[#1E5638] flex items-center gap-1.5">
            <Languages className="w-3.5 h-3.5" />
            <span>{note.language}</span>
          </span>
          {note.tags?.map((tag, idx) => (
            <span
              key={idx}
              className="px-2.5 py-1 rounded-full text-xs font-medium bg-[#FAF8F4] border border-[#EBE6DF] text-[#6E6685]"
            >
              #{tag}
            </span>
          ))}
        </div>

        {/* Document Title */}
        {isEditing && onUpdateTitle ? (
          <div className="space-y-1">
            <label className="text-[11px] font-bold uppercase tracking-wider text-[#8B7CF6]">
              Document Title
            </label>
            <input
              type="text"
              value={note.title}
              onChange={(e) => onUpdateTitle(e.target.value)}
              className="w-full text-2xl sm:text-4xl font-extrabold text-[#27223B] tracking-tight p-3 bg-white border-2 border-[#8B7CF6] rounded-2xl focus:outline-hidden"
            />
          </div>
        ) : (
          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold text-[#27223B] tracking-tight leading-[1.15]">
            {note.title}
          </h1>
        )}

        {/* Introductory Overview Card */}
        {isEditing && onUpdateOverview ? (
          <div className="space-y-1 pt-2">
            <label className="text-[11px] font-bold uppercase tracking-wider text-[#8B7CF6]">
              Executive Overview
            </label>
            <textarea
              rows={3}
              value={note.overview}
              onChange={(e) => onUpdateOverview(e.target.value)}
              className="w-full text-sm sm:text-base text-[#514963] leading-relaxed p-3 bg-white border-2 border-[#8B7CF6] rounded-2xl focus:outline-hidden"
            />
          </div>
        ) : (
          <div className="p-4 sm:p-5 rounded-2xl bg-[#FAF8F4] border-l-4 border-l-[#6654D9] border-y border-r border-[#EBE6DF]">
            <div className="flex items-center gap-2 mb-1.5">
              <Sparkles className="w-4 h-4 text-[#6654D9]" />
              <span className="text-xs font-bold uppercase tracking-wider text-[#6654D9]">
                Course Overview &amp; Learning Intent
              </span>
            </div>
            <p className="text-sm sm:text-base text-[#433B56] font-editorial italic leading-relaxed">
              {note.overview}
            </p>
          </div>
        )}
      </div>
    </header>
  );
};
