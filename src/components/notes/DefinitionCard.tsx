import React from 'react';
import { BookOpen } from 'lucide-react';

interface DefinitionCardProps {
  term: string;
  definition: string;
  className?: string;
}

export const DefinitionCard: React.FC<DefinitionCardProps> = ({
  term,
  definition,
  className = ''
}) => {
  return (
    <div
      className={`p-4 rounded-2xl bg-gradient-to-r from-[#F8F6FF] to-[#FAF8F4] border border-[#E2DCF7] shadow-2xs space-y-1.5 print-break-inside-avoid ${className}`}
    >
      <div className="flex items-center gap-2">
        <div className="w-6 h-6 rounded-lg bg-[#6654D9]/10 text-[#6654D9] flex items-center justify-center shrink-0">
          <BookOpen className="w-3.5 h-3.5" />
        </div>
        <span className="text-xs font-bold text-[#6654D9] uppercase tracking-wider">
          Key Definition
        </span>
      </div>
      <div className="pl-8 text-xs sm:text-sm text-[#27223B] leading-relaxed">
        <strong className="text-[#1E1638] font-bold text-sm block sm:inline sm:mr-1">
          {term}:
        </strong>
        <span className="text-[#433B56]">{definition}</span>
      </div>
    </div>
  );
};
