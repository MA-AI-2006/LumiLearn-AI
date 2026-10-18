import React, { useState } from 'react';
import { FormulaExplanation } from '../../types';
import { renderKatexToString } from './MathMarkdownRenderer';
import { WorkedExampleCard } from './WorkedExampleCard';
import {
  Calculator,
  HelpCircle,
  Copy,
  Check,
  AlertTriangle,
  Sparkles,
  ListOrdered
} from 'lucide-react';

interface FormulaBlockProps {
  formula: FormulaExplanation;
  className?: string;
}

export const FormulaBlock: React.FC<FormulaBlockProps> = ({ formula, className = '' }) => {
  const [activeTab, setActiveTab] = useState<'standard' | 'simple'>('standard');
  const [copiedLatex, setCopiedLatex] = useState(false);

  const handleCopyLatex = () => {
    navigator.clipboard.writeText(formula.latex);
    setCopiedLatex(true);
    setTimeout(() => setCopiedLatex(false), 2000);
  };

  const renderedLatexHtml = React.useMemo(() => {
    return renderKatexToString(formula.latex, true);
  }, [formula.latex]);

  return (
    <div
      className={`bg-white rounded-3xl border border-[#E2DCF7] shadow-xs hover:shadow-md transition-shadow duration-200 overflow-hidden my-6 print-break-inside-avoid ${className}`}
    >
      {/* Header with Title and Mode Toggle */}
      <div className="bg-gradient-to-r from-[#F8F6FF] via-[#FAF8FF] to-[#FAF8F4] px-5 py-4 border-b border-[#E2DCF7] flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#6654D9]/10 text-[#6654D9] flex items-center justify-center font-bold">
            <Calculator className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#8B7CF6]">
              Core Mathematical Theorem / Formula
            </span>
            <h4 className="text-base sm:text-lg font-bold text-[#27223B]">{formula.name}</h4>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {formula.plainVersion && (
            <div className="flex items-center bg-white p-1 rounded-xl border border-[#E2DCF7] text-xs">
              <button
                onClick={() => setActiveTab('standard')}
                className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                  activeTab === 'standard'
                    ? 'bg-[#6654D9] text-white shadow-2xs'
                    : 'text-[#6E6685] hover:text-[#27223B]'
                }`}
              >
                Standard Formula
              </button>
              <button
                onClick={() => setActiveTab('simple')}
                className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                  activeTab === 'simple'
                    ? 'bg-[#BFE8D5] text-[#1E5638] shadow-2xs'
                    : 'text-[#6E6685] hover:text-[#27223B]'
                }`}
              >
                Intuitive Explanation
              </button>
            </div>
          )}

          <button
            onClick={handleCopyLatex}
            className="p-1.5 rounded-xl border border-[#E2DCF7] bg-white hover:bg-[#FAF8FF] text-[#6E6685] hover:text-[#6654D9] transition-colors"
            title="Copy LaTeX formula"
          >
            {copiedLatex ? (
              <Check className="w-3.5 h-3.5 text-emerald-600" />
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
          </button>
        </div>
      </div>

      <div className="p-5 sm:p-6 space-y-5">
        {/* Rendered Equation or Plain Version */}
        {activeTab === 'standard' ? (
          <div className="p-4 sm:p-6 bg-[#FAF8FF] border border-[#E2DCF7] rounded-2xl text-center overflow-x-auto shadow-2xs">
            <div
              className="katex-display-container text-base sm:text-lg leading-loose"
              dangerouslySetInnerHTML={{ __html: renderedLatexHtml }}
            />
          </div>
        ) : (
          <div className="p-4 sm:p-5 bg-[#F2FBF6] border border-[#BFE8D5] rounded-2xl text-xs sm:text-sm text-[#1A452D] flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-[#1E5638] shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-xs uppercase tracking-wider text-[#236841] mb-1">
                Intuitive &amp; Conceptual Representation
              </p>
              <p className="leading-relaxed font-medium">{formula.plainVersion}</p>
            </div>
          </div>
        )}

        {/* Purpose */}
        <div className="flex items-start gap-2.5 text-xs sm:text-sm text-[#27223B] bg-[#FFFBF0] border border-[#FFE1D2] rounded-2xl p-4">
          <HelpCircle className="w-4 h-4 text-[#C96E3A] shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-[#8B4513]">Core Purpose: </span>
            <span className="text-[#3A302A] leading-relaxed">{formula.purpose}</span>
          </div>
        </div>

        {/* Meaning of Each Symbol */}
        {formula.symbols && formula.symbols.length > 0 && (
          <div className="space-y-2">
            <h5 className="text-[11px] font-bold uppercase tracking-wider text-[#6E6685] flex items-center gap-1.5">
              <span>Meaning of Each Variable &amp; Constant:</span>
            </h5>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {formula.symbols.map((item, idx) => {
                const symHtml = renderKatexToString(item.symbol, false);
                return (
                  <div
                    key={idx}
                    className="flex items-center gap-2.5 p-2.5 rounded-xl bg-[#FAF8F4] border border-[#EBE6DF]"
                  >
                    <span
                      className="font-bold text-[#6654D9] bg-white px-2.5 py-1 rounded-lg border border-[#E2DCF7] shadow-2xs shrink-0"
                      dangerouslySetInnerHTML={{ __html: symHtml }}
                    />
                    <span className="text-[#362E4A] leading-snug">{item.meaning}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Step-by-Step Method */}
        {formula.stepByStepMethod && formula.stepByStepMethod.length > 0 && (
          <div className="space-y-2">
            <h5 className="text-[11px] font-bold uppercase tracking-wider text-[#6E6685] flex items-center gap-1.5">
              <ListOrdered className="w-3.5 h-3.5 text-[#6654D9]" />
              <span>Step-by-Step Practical Application:</span>
            </h5>
            <ol className="space-y-1.5 text-xs text-[#27223B]">
              {formula.stepByStepMethod.map((step, idx) => (
                <li
                  key={idx}
                  className="flex items-start gap-2.5 p-2 rounded-xl bg-white border border-[#EBE6DF]"
                >
                  <span className="w-5 h-5 rounded-full bg-[#6654D9]/10 text-[#6654D9] font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <span className="pt-0.5 leading-relaxed">{step}</span>
                </li>
              ))}
            </ol>
          </div>
        )}

        {/* Worked Example */}
        {formula.workedExample && (
          <WorkedExampleCard
            problem={formula.workedExample.problem}
            givenValues={formula.workedExample.givenValues}
            steps={formula.workedExample.steps}
            finalAnswer={formula.workedExample.finalAnswer}
            interpretation={formula.workedExample.interpretation}
          />
        )}

        {/* Common Misconceptions */}
        {formula.commonMistakes && formula.commonMistakes.length > 0 && (
          <div className="p-4 bg-[#FFF5F2] border border-[#FFE1D2] rounded-2xl text-xs space-y-1.5">
            <div className="flex items-center gap-2 font-bold text-[#B33A18]">
              <AlertTriangle className="w-4 h-4 text-[#D84315]" />
              <span>Common Student Misconceptions &amp; Errors to Avoid</span>
            </div>
            <ul className="list-disc list-inside space-y-1 text-[#632717] pl-1 leading-relaxed">
              {formula.commonMistakes.map((m, idx) => (
                <li key={idx}>{m}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};
