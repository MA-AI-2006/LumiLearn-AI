import React from 'react';
import { AlertCircle, Lightbulb, AlertTriangle, CheckCircle2, Bookmark } from 'lucide-react';
import { MathMarkdownRenderer } from './MathMarkdownRenderer';

export type CalloutType = 'important' | 'tip' | 'warning' | 'success' | 'note';

interface CalloutCardProps {
  type?: CalloutType;
  title?: string;
  content: string;
  className?: string;
}

export const CalloutCard: React.FC<CalloutCardProps> = ({
  type = 'important',
  title,
  content,
  className = ''
}) => {
  const config = {
    important: {
      bg: 'bg-[#F8F6FF]',
      border: 'border-[#E2DCF7]',
      accent: 'border-l-4 border-l-[#6654D9]',
      text: 'text-[#27223B]',
      titleColor: 'text-[#6654D9]',
      icon: Bookmark
    },
    tip: {
      bg: 'bg-[#FFFBF0]',
      border: 'border-[#FFE1D2]',
      accent: 'border-l-4 border-l-[#D97706]',
      text: 'text-[#45260A]',
      titleColor: 'text-[#B45309]',
      icon: Lightbulb
    },
    warning: {
      bg: 'bg-[#FFF5F2]',
      border: 'border-[#FFE1D2]',
      accent: 'border-l-4 border-l-[#E11D48]',
      text: 'text-[#5A1A24]',
      titleColor: 'text-[#BE123C]',
      icon: AlertTriangle
    },
    success: {
      bg: 'bg-[#F0FBF5]',
      border: 'border-[#BFE8D5]',
      accent: 'border-l-4 border-l-[#16A34A]',
      text: 'text-[#143B22]',
      titleColor: 'text-[#15803D]',
      icon: CheckCircle2
    },
    note: {
      bg: 'bg-[#FAF8F4]',
      border: 'border-[#EBE6DF]',
      accent: 'border-l-4 border-l-[#6E6685]',
      text: 'text-[#27223B]',
      titleColor: 'text-[#514963]',
      icon: AlertCircle
    }
  }[type];

  const Icon = config.icon;

  return (
    <div
      className={`p-4 rounded-2xl ${config.bg} border ${config.border} ${config.accent} my-4 shadow-2xs space-y-1.5 print-break-inside-avoid ${className}`}
    >
      <div className="flex items-center gap-2">
        <Icon className={`w-4 h-4 ${config.titleColor} shrink-0`} />
        <span className={`text-xs font-bold uppercase tracking-wider ${config.titleColor}`}>
          {title || (type === 'tip' ? 'Exam Preparation Tip' : type === 'warning' ? 'Common Pitfall' : 'Core Concept')}
        </span>
      </div>
      <div className={`text-xs sm:text-sm ${config.text} leading-relaxed pl-6`}>
        <MathMarkdownRenderer content={content} />
      </div>
    </div>
  );
};
