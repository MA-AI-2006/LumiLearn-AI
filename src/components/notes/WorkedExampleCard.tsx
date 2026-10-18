import React, { useState } from 'react';
import { CheckCircle2, ChevronDown, ChevronUp, Sparkles, Lightbulb } from 'lucide-react';
import { MathMarkdownRenderer } from './MathMarkdownRenderer';

interface WorkedExampleProps {
  problem: string;
  givenValues?: string;
  steps: { step: string; calculation: string; result: string }[];
  finalAnswer: string;
  interpretation?: string;
  className?: string;
  defaultExpanded?: boolean;
}

export const WorkedExampleCard: React.FC<WorkedExampleProps> = ({
  problem,
  givenValues,
  steps,
  finalAnswer,
  interpretation,
  className = '',
  defaultExpanded = true
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <div
      className={`border border-[#BFE8D5] bg-[#FAFDFB] rounded-2xl overflow-hidden shadow-2xs my-4 print-break-inside-avoid ${className}`}
    >
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-3.5 sm:p-4 bg-gradient-to-r from-[#F0FBF5] to-[#FAF8F4] hover:bg-[#E5F7EE] text-left transition-colors"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-[#2E7D32]/10 text-[#1E5638] flex items-center justify-center font-bold text-xs">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#1E5638] block">
              Step-by-Step Worked Example
            </span>
            <span className="text-xs sm:text-sm font-bold text-[#27223B]">
              Application &amp; Numerical Solution
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-semibold text-[#1E5638] hidden sm:inline">
            {isExpanded ? 'Collapse' : 'Show Solution'}
          </span>
          {isExpanded ? (
            <ChevronUp className="w-4 h-4 text-[#1E5638]" />
          ) : (
            <ChevronDown className="w-4 h-4 text-[#1E5638]" />
          )}
        </div>
      </button>

      {isExpanded && (
        <div className="p-4 sm:p-5 space-y-4 text-xs border-t border-[#BFE8D5] bg-white">
          {/* Problem Statement Box */}
          <div className="bg-[#FAF8F4] p-3.5 rounded-xl border border-[#EBE6DF] space-y-1.5">
            <div className="flex items-center gap-1.5 font-bold text-[#27223B]">
              <Sparkles className="w-3.5 h-3.5 text-[#6654D9]" />
              <span>Problem Statement:</span>
            </div>
            <div className="text-[#3A334A] leading-relaxed">
              <MathMarkdownRenderer content={problem} />
            </div>
            {givenValues && (
              <div className="pt-1.5 text-[#6654D9] font-medium flex items-center gap-1.5">
                <span className="font-bold text-[#27223B]">Given Parameters:</span>
                <span className="bg-white px-2 py-0.5 rounded border border-[#E2DCF7] text-[11px] font-mono">
                  {givenValues}
                </span>
              </div>
            )}
          </div>

          {/* Sequential Step Cards */}
          <div className="space-y-2.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#6E6685] block">
              Calculation Procedure:
            </span>
            {steps.map((s, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl bg-[#FAF8FF] border border-[#E2DCF7] flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-[#6654D9] text-white font-bold text-[10px] flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <span className="font-semibold text-[#27223B] text-xs">{s.step}</span>
                  </div>
                  <div className="pl-7 text-[#4D4560] font-mono text-[11px]">
                    <MathMarkdownRenderer content={s.calculation} />
                  </div>
                </div>
                <div className="self-end sm:self-center px-3 py-1 rounded-lg bg-white border border-[#E2DCF7] text-[#6654D9] font-bold text-xs shadow-2xs shrink-0">
                  <MathMarkdownRenderer content={s.result} />
                </div>
              </div>
            ))}
          </div>

          {/* Final Answer Banner */}
          <div className="p-3.5 rounded-xl bg-gradient-to-r from-[#F0FBF5] to-[#E8F8F0] border border-[#BFE8D5] flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2 font-bold text-[#1E5638]">
              <CheckCircle2 className="w-4 h-4 text-[#2E7D32]" />
              <span className="text-xs sm:text-sm">Final Answer:</span>
            </div>
            <div className="px-3 py-1 rounded-lg bg-white border border-[#BFE8D5] text-[#1E5638] font-bold text-sm shadow-2xs">
              <MathMarkdownRenderer content={finalAnswer} />
            </div>
          </div>

          {/* Educational Interpretation */}
          {interpretation && (
            <div className="p-3 rounded-xl bg-[#FFFBF0] border border-[#FFE1D2] text-[#8B4513] space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-xs text-[#8B4513]">
                <Lightbulb className="w-3.5 h-3.5 text-[#C96E3A]" />
                <span>Pedagogical Interpretation:</span>
              </div>
              <p className="text-xs text-[#523C27] leading-relaxed pl-5">{interpretation}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
