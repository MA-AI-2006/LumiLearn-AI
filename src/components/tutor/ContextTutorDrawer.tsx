import React, { useState } from 'react';
import {
  X,
  Send,
  Bot,
  Sparkles,
  HelpCircle,
  Calculator,
  RefreshCw,
  Lightbulb,
  FileCheck
} from 'lucide-react';
import { MathRenderer } from '../common/MathRenderer';
import { NoteDocument } from '../../types';

interface ContextTutorDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  activeDocument?: NoteDocument | null;
  onSaveAsNote?: (content: string) => void;
}

export const ContextTutorDrawer: React.FC<ContextTutorDrawerProps> = ({
  isOpen,
  onClose,
  activeDocument,
  onSaveAsNote
}) => {
  const [messages, setMessages] = useState<
    Array<{ role: 'user' | 'assistant'; content: string; suggested?: string[] }>
  >([
    {
      role: 'assistant',
      content: activeDocument
        ? `Hi! I'm reviewing **"${activeDocument.title}"** with you. What concept, equation, or derivation would you like to unpack?`
        : "Let's make this make sense! Ask a question or share a formula, and we'll work through it step by step.",
      suggested: [
        'Explain this from the beginning',
        'Show me a worked numerical example',
        'Check my understanding with a question'
      ]
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [level, setLevel] = useState<'beginner' | 'school' | 'university' | 'advanced'>('university');

  if (!isOpen) return null;

  const handleSend = async (textToSend?: string) => {
    const userText = textToSend || input;
    if (!userText.trim() || loading) return;

    const newMessages = [...messages, { role: 'user' as const, content: userText }];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/ai-tutor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userText,
          conversationHistory: newMessages,
          explanationLevel: level,
          contextDocument: activeDocument
        })
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);

      setMessages([
        ...newMessages,
        {
          role: 'assistant',
          content: data.content,
          suggested: data.suggestedFollowUps
        }
      ]);
    } catch (err: any) {
      setMessages([
        ...newMessages,
        {
          role: 'assistant',
          content:
            "I encountered a temporary connection issue. Let's try that again in a moment: " +
            (err.message || 'Server error.')
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-y-0 right-0 w-full sm:w-[450px] bg-white shadow-2xl border-l border-[#EBE6DF] z-50 flex flex-col animate-in slide-in-from-right duration-200">
      {/* Header */}
      <div className="p-4 border-b border-[#EBE6DF] bg-gradient-to-r from-[#FAF8FF] to-[#FAF8F4] flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#6654D9] text-white flex items-center justify-center shadow-xs">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-[#27223B]">LumiLearn AI Tutor</h3>
            <p className="text-[11px] text-[#6E6685] truncate max-w-[220px]">
              {activeDocument ? activeDocument.title : 'General Study Mode'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Level selector */}
          <select
            value={level}
            onChange={(e) => setLevel(e.target.value as any)}
            className="text-[11px] font-medium bg-white border border-[#E2DCF7] rounded-lg px-2 py-1 text-[#6654D9] focus:outline-hidden"
          >
            <option value="beginner">Explain Simply</option>
            <option value="school">School Level</option>
            <option value="university">University</option>
            <option value="advanced">Advanced</option>
          </select>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#6E6685] hover:bg-white hover:text-[#27223B] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#FAF8F4]/50">
        {messages.map((m, idx) => (
          <div
            key={idx}
            className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div
              className={`max-w-[90%] p-3.5 rounded-2xl text-xs ${
                m.role === 'user'
                  ? 'bg-[#6654D9] text-white rounded-br-xs shadow-xs'
                  : 'bg-white text-[#27223B] border border-[#E2DCF7] rounded-bl-xs shadow-xs'
              }`}
            >
              {m.role === 'assistant' ? (
                <div>
                  <MathRenderer content={m.content} />
                  {onSaveAsNote && (
                    <button
                      onClick={() => onSaveAsNote(m.content)}
                      className="mt-3 flex items-center gap-1.5 text-[11px] text-[#6654D9] font-medium hover:underline pt-2 border-t border-[#EBE6DF]"
                    >
                      <FileCheck className="w-3.5 h-3.5" />
                      <span>Save explanation to notes</span>
                    </button>
                  )}
                </div>
              ) : (
                <p className="whitespace-pre-wrap">{m.content}</p>
              )}
            </div>

            {/* Suggested Followups */}
            {m.suggested && m.suggested.length > 0 && idx === messages.length - 1 && (
              <div className="mt-2.5 flex flex-wrap gap-1.5">
                {m.suggested.map((s, i) => (
                  <button
                    key={i}
                    onClick={() => handleSend(s)}
                    className="text-[11px] font-medium px-2.5 py-1 rounded-full bg-white hover:bg-[#FAF8FF] text-[#6654D9] border border-[#E2DCF7] shadow-2xs transition-all text-left"
                  >
                    ✦ {s}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-2 p-3 bg-white border border-[#E2DCF7] rounded-2xl w-fit text-xs text-[#6E6685]">
            <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#6654D9]" />
            <span>Tutor is formulating step-by-step guidance...</span>
          </div>
        )}
      </div>

      {/* Input Bar */}
      <div className="p-3 bg-white border-t border-[#EBE6DF]">
        <div className="flex items-center gap-2 bg-[#FAF8F4] border border-[#EBE6DF] rounded-xl px-3 py-1.5 focus-within:border-[#8B7CF6] focus-within:bg-white transition-all">
          <input
            type="text"
            placeholder="Ask anything or request a formula derivation..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            className="flex-1 bg-transparent text-xs text-[#27223B] placeholder-[#9D96B0] focus:outline-hidden"
          />
          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || loading}
            className="p-1.5 rounded-lg bg-[#6654D9] hover:bg-[#5844CA] text-white disabled:opacity-40 transition-colors"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
