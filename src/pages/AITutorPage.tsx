import React, { useEffect, useState } from 'react';
import {
  Bot,
  Send,
  Sparkles,
  HelpCircle,
  Calculator,
  Plus,
  BookOpen,
  Trash2,
  FileCheck,
  RefreshCw,
  Lightbulb,
  CheckCircle2,
  ChevronRight,
  MessageSquare
} from 'lucide-react';
import { storage } from '../services/storage';
import { TutorConversation, TutorMessage, NoteDocument } from '../types';
import { MathRenderer } from '../components/common/MathRenderer';
import { postApiJson } from '../utils/apiClient';

interface AITutorPageProps {
  navigate: (route: string, params?: any) => void;
  initialNoteId?: string;
}

export const AITutorPage: React.FC<AITutorPageProps> = ({ navigate, initialNoteId }) => {
  const [conversations, setConversations] = useState<TutorConversation[]>([]);
  const [activeConvId, setActiveConvId] = useState<string>('');
  const [notes, setNotes] = useState<NoteDocument[]>([]);
  const [selectedNoteId, setSelectedNoteId] = useState<string>(initialNoteId || '');
  const [level, setLevel] = useState<'beginner' | 'school' | 'university' | 'advanced'>('university');
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function load() {
      const [allConvs, allNotes] = await Promise.all([
        storage.getTutorConversations(),
        storage.getNotes()
      ]);
      setConversations(allConvs);
      setNotes(allNotes);
      if (allConvs.length > 0) {
        setActiveConvId(allConvs[0].id);
        if (allConvs[0].explanationLevel) setLevel(allConvs[0].explanationLevel);
      }
    }
    load();
  }, []);

  const activeConv =
    conversations.find((c) => c.id === activeConvId) || conversations[0] || null;

  const starterPrompts = [
    'Explain this topic from the beginning',
    'Explain it in simpler words with an analogy',
    'Show me a worked numerical example with steps',
    'Help me understand the underlying formula',
    'Test my understanding with a conceptual question',
    'Explain the difference between two related concepts'
  ];

  const handleNewChat = () => {
    const newConv: TutorConversation = {
      id: 'conv-' + Date.now(),
      title: 'New Discussion',
      explanationLevel: level,
      sourceId: selectedNoteId || undefined,
      sourceTitle: notes.find((n) => n.id === selectedNoteId)?.title,
      messages: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setConversations([newConv, ...conversations]);
    setActiveConvId(newConv.id);
  };

  const handleSendMessage = async (textToSend?: string) => {
    const userText = textToSend || input;
    if (!userText.trim() || loading || !activeConv) return;

    const userMsg: TutorMessage = {
      id: 'msg-' + Date.now(),
      role: 'user',
      content: userText,
      timestamp: new Date().toISOString()
    };

    const updatedMessages = [...activeConv.messages, userMsg];
    const updatedConv: TutorConversation = {
      ...activeConv,
      messages: updatedMessages,
      title: activeConv.messages.length === 0 ? userText.slice(0, 35) + '...' : activeConv.title,
      updatedAt: new Date().toISOString()
    };

    setConversations(conversations.map((c) => (c.id === updatedConv.id ? updatedConv : c)));
    setInput('');
    setLoading(true);

    try {
      const activeDoc = notes.find((n) => n.id === selectedNoteId);

      const data = await postApiJson<any>('/api/ai-tutor', {
        message: userText,
        conversationHistory: updatedMessages,
        explanationLevel: level,
        contextDocument: activeDoc || null
      });

      const assistantMsg: TutorMessage = {
        id: 'msg-' + Date.now(),
        role: 'assistant',
        content: data.content,
        suggestedFollowUps: data.suggestedFollowUps,
        timestamp: new Date().toISOString()
      };

      const finalConv = {
        ...updatedConv,
        messages: [...updatedMessages, assistantMsg]
      };

      setConversations(conversations.map((c) => (c.id === finalConv.id ? finalConv : c)));
      await storage.saveTutorConversation(finalConv);
    } catch (err: any) {
      console.error('Tutor connection error:', err);
      const errMsg: TutorMessage = {
        id: 'msg-err-' + Date.now(),
        role: 'assistant',
        content: `⚠️ **Unable to connect to AI Tutor**: ${err.message || 'An unexpected error occurred.'}`,
        suggestedFollowUps: ['Retry asking your question'],
        timestamp: new Date().toISOString()
      };
      setConversations(conversations.map((c) => (c.id === updatedConv.id ? { ...updatedConv, messages: [...updatedMessages, errMsg] } : c)));
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAsNote = async (text: string) => {
    const newNote: NoteDocument = {
      id: 'note-tutor-' + Date.now(),
      title: 'Tutor Insight: ' + (activeConv?.title || 'Study Discussion'),
      overview: 'Generated explanation saved from LumiLearn AI Tutor discussion session.',
      detailLevel: 'detailed',
      academicLevel: 'intermediate',
      language: 'English',
      tags: ['Tutor Notes', 'AI Study Session'],
      sections: [
        {
          id: 'sec-1',
          title: 'Explanation & Concept Notes',
          level: 1,
          content: text
        }
      ],
      summary: 'Derived directly from AI Tutor explanation.',
      keyTakeaways: ['Review the step-by-step reasoning outlined above.'],
      revisionChecklist: ['Practice applying this concept to an exam problem.'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    await storage.saveNote(newNote);
    navigate('note-editor', { id: newNote.id });
  };

  return (
    <div className="h-[calc(100vh-8.5rem)] flex flex-col md:flex-row gap-6 animate-in fade-in duration-200">
      {/* 1. Conversation History Sidebar */}
      <div className="w-full md:w-64 bg-white rounded-3xl border border-[#EBE6DF] p-4 flex flex-col justify-between shadow-xs shrink-0">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#6654D9]">
              Discussions
            </span>
            <button
              onClick={handleNewChat}
              className="p-1.5 rounded-lg bg-[#FAF8FF] text-[#6654D9] hover:bg-[#F2EEFF] border border-[#E2DCF7] text-xs font-semibold flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New</span>
            </button>
          </div>

          <div className="space-y-1.5 overflow-y-auto max-h-[350px]">
            {conversations.map((c) => (
              <button
                key={c.id}
                onClick={() => setActiveConvId(c.id)}
                className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-medium truncate flex items-center gap-2 transition-all ${
                  c.id === activeConvId
                    ? 'bg-[#6654D9] text-white shadow-xs'
                    : 'text-[#514963] hover:bg-[#FAF8F4] hover:text-[#27223B]'
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">{c.title}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Source Material Reference Picker */}
        <div className="pt-4 border-t border-[#EBE6DF] space-y-2">
          <label className="block text-[11px] font-bold uppercase tracking-wider text-[#6E6685]">
            Grounded Material:
          </label>
          <select
            value={selectedNoteId}
            onChange={(e) => setSelectedNoteId(e.target.value)}
            className="w-full p-2 rounded-xl border border-[#EBE6DF] bg-[#FAF8F4] text-xs text-[#27223B]"
          >
            <option value="">General Tutor (No specific doc)</option>
            {notes.map((n) => (
              <option key={n.id} value={n.id}>
                {n.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 2. Main Tutor Chat Interface */}
      <div className="flex-1 bg-white rounded-3xl border border-[#EBE6DF] flex flex-col shadow-xs overflow-hidden">
        {/* Top Controls Header */}
        <div className="p-4 border-b border-[#EBE6DF] bg-gradient-to-r from-[#FAF8FF] to-[#FAF8F4] flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#6654D9] to-[#8B7CF6] text-white flex items-center justify-center shadow-xs">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-[#27223B]">
                {activeConv?.title || 'LumiLearn Academic Tutor'}
              </h3>
              <p className="text-[11px] text-[#6E6685]">
                {selectedNoteId
                  ? `Grounded in: ${notes.find((n) => n.id === selectedNoteId)?.title}`
                  : 'Teaching mode: Conceptual intuition & mathematical breakdown'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-[#6E6685] hidden sm:inline">Explanation Depth:</span>
            <select
              value={level}
              onChange={(e) => setLevel(e.target.value as any)}
              className="px-3 py-1.5 rounded-xl border border-[#E2DCF7] bg-white text-xs font-semibold text-[#6654D9] focus:outline-hidden"
            >
              <option value="beginner">Explain Like I'm New</option>
              <option value="school">School Level</option>
              <option value="university">University Level</option>
              <option value="advanced">Advanced / Technical</option>
            </select>
          </div>
        </div>

        {/* Chat Messages Window */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-[#FAF8F4]/30">
          {(!activeConv || activeConv.messages.length === 0) && (
            /* Welcome Empty State Screen */
            <div className="text-center py-10 max-w-lg mx-auto space-y-6">
              <div className="w-16 h-16 mx-auto rounded-3xl bg-[#FAF8FF] border border-[#E2DCF7] text-[#6654D9] flex items-center justify-center">
                <Sparkles className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-2xl font-extrabold text-[#27223B]">Let's make this make sense.</h3>
                <p className="text-xs sm:text-sm text-[#514963] mt-1.5 leading-relaxed">
                  Ask a question, share a difficult concept, or choose something from your study
                  library. We'll work through the logic, step by step.
                </p>
              </div>

              {/* Starter Chips */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-left">
                {starterPrompts.map((p, i) => (
                  <button
                    key={i}
                    onClick={() => handleSendMessage(p)}
                    className="p-3 rounded-2xl bg-white hover:bg-[#FAF8FF] border border-[#EBE6DF] hover:border-[#8B7CF6] text-xs font-medium text-[#27223B] transition-all shadow-2xs"
                  >
                    ✦ {p}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Render Active Messages */}
          {activeConv?.messages.map((m) => (
            <div
              key={m.id}
              className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[85%] sm:max-w-[75%] p-4 rounded-3xl text-xs sm:text-sm leading-relaxed ${
                  m.role === 'user'
                    ? 'bg-[#6654D9] text-white rounded-br-xs shadow-xs'
                    : 'bg-white text-[#27223B] border border-[#E2DCF7] rounded-bl-xs shadow-xs'
                }`}
              >
                {m.role === 'assistant' ? (
                  <div>
                    <MathRenderer content={m.content} />
                    <div className="mt-4 pt-3 border-t border-[#EBE6DF] flex items-center justify-between">
                      <button
                        onClick={() => handleSaveAsNote(m.content)}
                        className="flex items-center gap-1.5 text-xs text-[#6654D9] font-bold hover:underline"
                      >
                        <FileCheck className="w-3.5 h-3.5" />
                        <span>Save as Note</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="whitespace-pre-wrap">{m.content}</p>
                )}
              </div>

              {/* Suggested followups */}
              {m.suggestedFollowUps && m.suggestedFollowUps.length > 0 && (
                <div className="mt-2.5 flex flex-wrap gap-1.5">
                  {m.suggestedFollowUps.map((s, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSendMessage(s)}
                      className="text-xs font-medium px-3 py-1 rounded-full bg-white hover:bg-[#FAF8FF] text-[#6654D9] border border-[#E2DCF7] shadow-2xs transition-all"
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
              <RefreshCw className="w-4 h-4 animate-spin text-[#6654D9]" />
              <span>Tutor is formulating pedagogical explanation...</span>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <div className="p-4 bg-white border-t border-[#EBE6DF]">
          <div className="flex items-center gap-2 bg-[#FAF8F4] border border-[#EBE6DF] rounded-2xl px-4 py-2 focus-within:border-[#8B7CF6] focus-within:bg-white transition-all">
            <input
              type="text"
              placeholder="Ask anything, request an analogy, or paste a formula..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              className="flex-1 bg-transparent text-xs sm:text-sm text-[#27223B] placeholder-[#9D96B0] focus:outline-hidden"
            />
            <button
              onClick={() => handleSendMessage()}
              disabled={!input.trim() || loading}
              className="p-2 rounded-xl bg-[#6654D9] hover:bg-[#5844CA] text-white disabled:opacity-40 transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
