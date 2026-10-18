import React from 'react';
import { NoteSection } from '../../types';
import { ListTree, ChevronRight, Calculator, BookOpen, CheckCircle2 } from 'lucide-react';

interface TableOfContentsProps {
  sections: NoteSection[];
  activeSectionId?: string;
  onSelectSection: (id: string) => void;
  className?: string;
}

export const TableOfContents: React.FC<TableOfContentsProps> = ({
  sections,
  activeSectionId,
  onSelectSection,
  className = ''
}) => {
  return (
    <div
      className={`bg-white rounded-3xl border border-[#EBE6DF] p-5 shadow-xs space-y-4 print-break-inside-avoid ${className}`}
    >
      <div className="flex items-center justify-between pb-3 border-b border-[#EBE6DF]">
        <div className="flex items-center gap-2 text-[#6654D9]">
          <ListTree className="w-4 h-4" />
          <h3 className="text-xs font-bold uppercase tracking-wider">Table of Contents</h3>
        </div>
        <span className="text-[11px] font-bold text-[#8C84A0] bg-[#FAF8F4] px-2 py-0.5 rounded-full border border-[#EBE6DF]">
          {sections.length} Sections
        </span>
      </div>

      <nav className="space-y-1 text-xs">
        {sections.map((sec, idx) => {
          const isActive = activeSectionId === sec.id;
          const formulaCount = sec.formulas?.length || 0;
          const defCount = sec.keyDefinitions?.length || 0;

          return (
            <button
              key={sec.id || idx}
              onClick={() => onSelectSection(sec.id)}
              className={`w-full text-left px-3 py-2 rounded-xl transition-all flex items-center justify-between group ${
                isActive
                  ? 'bg-[#FAF8FF] text-[#6654D9] font-bold border border-[#E2DCF7] shadow-2xs'
                  : 'text-[#514963] hover:text-[#27223B] hover:bg-[#FAF8F4]'
              }`}
            >
              <div className="flex items-center gap-2 truncate pr-2">
                <span className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] shrink-0 font-mono ${
                  isActive ? 'bg-[#6654D9] text-white' : 'bg-[#FAF8F4] text-[#8C84A0] border border-[#EBE6DF]'
                }`}>
                  {idx + 1}
                </span>
                <span className="truncate">{sec.title.replace(/^\d+\.\s*/, '')}</span>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                {formulaCount > 0 && (
                  <span className="px-1.5 py-0.5 rounded bg-violet-100 text-[#6654D9] text-[9px] font-bold flex items-center gap-0.5" title={`${formulaCount} formula(s)`}>
                    <Calculator className="w-2.5 h-2.5" />
                    <span>{formulaCount}</span>
                  </span>
                )}
                {defCount > 0 && (
                  <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-[#1E5638] text-[9px] font-bold flex items-center gap-0.5" title={`${defCount} definition(s)`}>
                    <BookOpen className="w-2.5 h-2.5" />
                    <span>{defCount}</span>
                  </span>
                )}
                <ChevronRight className={`w-3 h-3 text-[#A69FB8] transition-transform ${isActive ? 'text-[#6654D9] translate-x-0.5' : 'group-hover:translate-x-0.5'}`} />
              </div>
            </button>
          );
        })}

        <div className="pt-2 border-t border-[#EBE6DF] space-y-1">
          <button
            onClick={() => onSelectSection('summary')}
            className="w-full text-left px-3 py-1.5 rounded-xl text-[#514963] hover:text-[#6654D9] hover:bg-[#FAF8FF] transition-colors flex items-center gap-2"
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-[#2E7D32]" />
            <span>Executive Summary &amp; Takeaways</span>
          </button>
        </div>
      </nav>
    </div>
  );
};
