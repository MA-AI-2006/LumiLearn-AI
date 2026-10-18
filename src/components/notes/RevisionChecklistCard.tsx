import React, { useState } from 'react';
import { CheckSquare, Trophy, Sparkles } from 'lucide-react';
import { MathMarkdownRenderer } from './MathMarkdownRenderer';

interface RevisionChecklistCardProps {
  items: string[];
  className?: string;
}

export const RevisionChecklistCard: React.FC<RevisionChecklistCardProps> = ({
  items,
  className = ''
}) => {
  const [checkedState, setCheckedState] = useState<{ [index: number]: boolean }>({});

  if (!items || items.length === 0) return null;

  const toggleItem = (index: number) => {
    setCheckedState((prev) => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const checkedCount = Object.values(checkedState).filter(Boolean).length;
  const progressPercent = Math.round((checkedCount / items.length) * 100);

  return (
    <div
      className={`p-6 rounded-3xl bg-white border border-[#EBE6DF] shadow-xs space-y-4 print-break-inside-avoid ${className}`}
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-[#C96E3A]">
          <CheckSquare className="w-5 h-5" />
          <h4 className="text-xs font-extrabold uppercase tracking-wider text-[#8B4513]">
            Active Revision &amp; Exam Checklist
          </h4>
        </div>

        {/* Progress tracker */}
        <div className="flex items-center gap-2 text-xs font-bold text-[#6E6685]">
          <span>
            {checkedCount} of {items.length} mastered
          </span>
          <div className="w-20 h-2 bg-[#FAF8F4] border border-[#EBE6DF] rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#6654D9] to-[#8B7CF6] transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          {progressPercent === 100 && (
            <Trophy className="w-4 h-4 text-amber-500 animate-bounce" />
          )}
        </div>
      </div>

      <div className="space-y-2 pt-1">
        {items.map((item, i) => {
          const isDone = !!checkedState[i];
          return (
            <label
              key={i}
              onClick={() => toggleItem(i)}
              className={`flex items-start gap-3 p-3 rounded-2xl border transition-all cursor-pointer ${
                isDone
                  ? 'bg-[#F0FBF5] border-[#BFE8D5] text-[#1E5638]'
                  : 'bg-[#FAF8F4] border-[#EBE6DF] hover:bg-white text-[#27223B]'
              }`}
            >
              <input
                type="checkbox"
                checked={isDone}
                onChange={() => {}} // handled by parent onClick
                className="rounded-md border-[#EBE6DF] text-[#6654D9] focus:ring-[#8B7CF6] mt-0.5 h-4 w-4 shrink-0"
              />
              <div
                className={`text-xs leading-relaxed ${
                  isDone ? 'line-through text-[#618570]' : 'text-[#362E4A]'
                }`}
              >
                <MathMarkdownRenderer content={item} />
              </div>
            </label>
          );
        })}
      </div>
    </div>
  );
};
