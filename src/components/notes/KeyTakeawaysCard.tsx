import React from 'react';
import { CheckCircle2, BookmarkCheck, FileText } from 'lucide-react';
import { MathMarkdownRenderer } from './MathMarkdownRenderer';

interface KeyTakeawaysCardProps {
  summary: string;
  takeaways?: string[];
  className?: string;
}

export const KeyTakeawaysCard: React.FC<KeyTakeawaysCardProps> = ({
  summary,
  takeaways = [],
  className = ''
}) => {
  return (
    <div id="section-summary" className={`space-y-6 pt-6 border-t border-[#EBE6DF] print-break-inside-avoid ${className}`}>
      {/* Executive Summary */}
      <div className="p-6 rounded-3xl bg-gradient-to-br from-[#FAF8FF] to-white border border-[#E2DCF7] shadow-xs space-y-3">
        <div className="flex items-center gap-2 text-[#6654D9]">
          <FileText className="w-4 h-4" />
          <h3 className="text-xs font-bold uppercase tracking-wider">Executive Synthesis</h3>
        </div>
        <div className="text-xs sm:text-sm text-[#433B56] leading-relaxed">
          <MathMarkdownRenderer content={summary} />
        </div>
      </div>

      {/* Key Takeaways */}
      {takeaways && takeaways.length > 0 && (
        <div className="p-6 rounded-3xl bg-white border border-[#EBE6DF] shadow-xs space-y-4">
          <div className="flex items-center gap-2 text-[#1E5638]">
            <BookmarkCheck className="w-5 h-5 text-[#2E7D32]" />
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-[#1E5638]">
              High-Yield Key Takeaways
            </h4>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {takeaways.map((takeaway, i) => (
              <div
                key={i}
                className="flex items-start gap-2.5 p-3 rounded-2xl bg-[#F0FBF5] border border-[#BFE8D5] shadow-2xs"
              >
                <CheckCircle2 className="w-4 h-4 text-[#2E7D32] shrink-0 mt-0.5" />
                <div className="text-xs text-[#1F3D2B] leading-relaxed">
                  <MathMarkdownRenderer content={takeaway} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
