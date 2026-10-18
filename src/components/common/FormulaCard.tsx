import React, { useState } from 'react';
import { FormulaExplanation } from '../../types';
import { KatexFormula } from './MathRenderer';
import { ChevronDown, ChevronUp, Sparkles, HelpCircle, CheckCircle2, AlertTriangle, Calculator } from 'lucide-react';

interface FormulaCardProps {
  formula: FormulaExplanation;
  className?: string;
  defaultOpenWorkedExample?: boolean;
}

export const FormulaCard: React.FC<FormulaCardProps> = ({
  formula,
  className = '',
  defaultOpenWorkedExample = true,
}) => {
  const [showWorkedExample, setShowWorkedExample] = useState(defaultOpenWorkedExample);
  const [activeTab, setActiveTab] = useState<'standard' | 'simple'>('standard');

  return (
    <div
      className={`bg-white rounded-2xl border border-[#E2DCF7] shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden my-5 ${className}`}
    >
      {/* Header with Title and Mode Toggle */}
      <div className="bg-gradient-to-r from-[#F8F6FF] to-[#FAF8F4] px-5 py-4 border-b border-[#E2DCF7] flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#8B7CF6]/15 text-[#6654D9] flex items-center justify-center font-semibold text-sm">
            <Calculator className="w-4 h-4" />
          </div>
          <div>
            <span className="text-xs font-semibold tracking-wider uppercase text-[#8B7CF6]">
              Mathematical Formula
            </span>
            <h4 className="text-base font-bold text-[#27223B]">{formula.name}</h4>
          </div>
        </div>

        {formula.plainVersion && (
          <div className="flex items-center bg-white p-1 rounded-xl border border-[#E2DCF7] text-xs">
            <button
              onClick={() => setActiveTab('standard')}
              className={`px-3 py-1 rounded-lg font-medium transition-all ${
                activeTab === 'standard'
                  ? 'bg-[#6654D9] text-white shadow-xs'
                  : 'text-[#6E6685] hover:text-[#27223B]'
              }`}
            >
              Standard Formula
            </button>
            <button
              onClick={() => setActiveTab('simple')}
              className={`px-3 py-1 rounded-lg font-medium transition-all ${
                activeTab === 'simple'
                  ? 'bg-[#BFE8D5] text-[#1E5638] shadow-xs'
                  : 'text-[#6E6685] hover:text-[#27223B]'
              }`}
            >
              Easy Explanation
            </button>
          </div>
        )}
      </div>

      <div className="p-5 space-y-4">
        {/* Rendered Equation or Plain Version */}
        {activeTab === 'standard' ? (
          <div className="p-4 bg-[#FAF8FF] border border-[#E2DCF7] rounded-xl text-center overflow-x-auto">
            <KatexFormula formula={formula.latex} displayMode={true} />
          </div>
        ) : (
          <div className="p-4 bg-[#F2FBF6] border border-[#BFE8D5] rounded-xl text-sm text-[#1A452D] flex items-start gap-2.5">
            <Sparkles className="w-4 h-4 text-[#1E5638] shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-xs uppercase tracking-wide text-[#236841] mb-1">
                Easy-to-understand representation:
              </p>
              <p className="text-sm leading-relaxed">{formula.plainVersion}</p>
            </div>
          </div>
        )}

        {/* Purpose */}
        <div className="flex items-start gap-2 text-sm text-[#27223B] bg-[#FFFBF0] border border-[#FFE1D2] rounded-xl p-3.5">
          <HelpCircle className="w-4 h-4 text-[#C96E3A] shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-[#8B4513]">Core Purpose: </span>
            <span className="text-[#3A302A]">{formula.purpose}</span>
          </div>
        </div>

        {/* Meaning of Each Symbol */}
        {formula.symbols && formula.symbols.length > 0 && (
          <div>
            <h5 className="text-xs font-bold uppercase tracking-wider text-[#6E6685] mb-2">
              Meaning of Each Symbol
            </h5>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {formula.symbols.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 p-2 rounded-lg bg-[#FAF8F4] border border-[#EBE6DF]"
                >
                  <span className="font-semibold text-[#6654D9] bg-white px-2 py-0.5 rounded border border-[#E2DCF7] shadow-2xs font-mono">
                    <KatexFormula formula={item.symbol} />
                  </span>
                  <span className="text-[#27223B]">{item.meaning}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step-by-Step Method */}
        {formula.stepByStepMethod && formula.stepByStepMethod.length > 0 && (
          <div>
            <h5 className="text-xs font-bold uppercase tracking-wider text-[#6E6685] mb-2">
              How to Apply (Step-by-Step)
            </h5>
            <ol className="space-y-1.5 text-xs text-[#27223B]">
              {formula.stepByStepMethod.map((step, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-[#8B7CF6]/20 text-[#6654D9] font-bold text-[11px] flex items-center justify-center shrink-0">
                    {idx + 1}
                  </span>
                  <span className="pt-0.5">{step}</span>
                </li>
              ))}
            </ol>
          </div>
        )}

        {/* Worked Example Accordion */}
        {formula.workedExample && (
          <div className="border border-[#E2DCF7] rounded-xl overflow-hidden mt-3">
            <button
              onClick={() => setShowWorkedExample(!showWorkedExample)}
              className="w-full flex items-center justify-between p-3.5 bg-[#FAF8F4] hover:bg-[#F2EEFF] text-left transition-colors"
            >
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#6654D9]" />
                <span className="text-xs font-bold uppercase tracking-wider text-[#6654D9]">
                  Step-by-Step Worked Numerical Example
                </span>
              </div>
              {showWorkedExample ? (
                <ChevronUp className="w-4 h-4 text-[#6E6685]" />
              ) : (
                <ChevronDown className="w-4 h-4 text-[#6E6685]" />
              )}
            </button>

            {showWorkedExample && (
              <div className="p-4 bg-white space-y-3 text-xs border-t border-[#E2DCF7]">
                <div className="bg-[#FAF8F4] p-3 rounded-lg border border-[#EBE6DF]">
                  <p className="font-semibold text-[#27223B] mb-1">
                    Problem Scenario:
                  </p>
                  <p className="text-[#514963]">{formula.workedExample.problem}</p>
                  {formula.workedExample.givenValues && (
                    <p className="text-[#6654D9] mt-1 font-medium">
                      Given: {formula.workedExample.givenValues}
                    </p>
                  )}
                </div>

                {/* Steps */}
                <div className="space-y-2">
                  {formula.workedExample.steps.map((s, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-lg bg-[#FAF8FF] border border-[#E2DCF7]/70 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                    >
                      <div className="space-y-0.5">
                        <span className="font-semibold text-[#6654D9]">
                          Step {idx + 1}: {s.step}
                        </span>
                        <div className="text-[#514963] font-mono text-[11px]">
                          {s.calculation}
                        </div>
                      </div>
                      <div className="px-2.5 py-1 rounded bg-white text-[#27223B] font-bold border border-[#E2DCF7] self-start sm:self-auto shadow-2xs">
                        = {s.result}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Final Answer & Interpretation */}
                <div className="p-3 rounded-lg bg-[#F0FBF5] border border-[#BFE8D5] text-xs space-y-1">
                  <div className="font-bold text-[#1E5638] flex items-center gap-1.5">
                    <span>Final Answer:</span>
                    <span className="text-sm px-2 py-0.5 rounded bg-white border border-[#BFE8D5] shadow-2xs">
                      {formula.workedExample.finalAnswer}
                    </span>
                  </div>
                  <p className="text-[#2B6144] pt-1">
                    <span className="font-semibold">Educational Interpretation: </span>
                    {formula.workedExample.interpretation}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Common Misconceptions */}
        {formula.commonMistakes && formula.commonMistakes.length > 0 && (
          <div className="p-3 bg-[#FFF5F2] border border-[#FFE1D2] rounded-xl text-xs space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-[#B33A18]">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Common Student Misconceptions & Mistakes</span>
            </div>
            <ul className="list-disc list-inside space-y-0.5 text-[#632717] pl-1">
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
