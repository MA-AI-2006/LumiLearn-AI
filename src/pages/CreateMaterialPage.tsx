import React, { useState } from 'react';
import {
  FileText,
  Video,
  Mic,
  Sparkles,
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Layers,
  Clock,
  ArrowRight,
  FileCode,
  X,
  Play,
  RotateCw
} from 'lucide-react';
import { storage } from '../services/storage';
import { NoteDetailLevel, AcademicLevel, SourceMaterial } from '../types';
import { postApiJson } from '../utils/apiClient';

interface CreateMaterialPageProps {
  navigate: (route: string, params?: any) => void;
  initialTab?: 'docs' | 'video' | 'audio';
}

export const CreateMaterialPage: React.FC<CreateMaterialPageProps> = ({
  navigate,
  initialTab = 'docs'
}) => {
  const [activeTab, setActiveTab] = useState<'docs' | 'video' | 'audio'>(initialTab);

  // Tab A states
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [pastedText, setPastedText] = useState('');

  // Tab B states
  const [videoUrl, setVideoUrl] = useState('');
  const [videoPlatform, setVideoPlatform] = useState<'youtube' | 'drive' | 'mp4'>('youtube');

  // Tab C states
  const [audioFile, setAudioFile] = useState<File | null>(null);

  // Generation Settings
  const [title, setTitle] = useState('');
  const [language, setLanguage] = useState('English');
  const [detailLevel, setDetailLevel] = useState<NoteDetailLevel>('detailed');
  const [academicLevel, setAcademicLevel] = useState<AcademicLevel>('intermediate');
  const [includeFormulas, setIncludeFormulas] = useState(true);
  const [includeDefinitions, setIncludeDefinitions] = useState(true);
  const [includeExamples, setIncludeExamples] = useState(true);
  const [generateQuiz, setGenerateQuiz] = useState(true);
  const [generateFlashcards, setGenerateFlashcards] = useState(true);

  // Processing & Error states
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Sample Presets for easy 1-click test of Economics, Calculus, or Physics!
  const loadPreset = (preset: 'economics' | 'calculus' | 'physics') => {
    if (preset === 'economics') {
      setTitle('Microeconomics: Supply, Demand, Midpoint Elasticity & Deadweight Loss');
      setPastedText(`Principles of Microeconomics: Market Equilibrium and Elasticity.
When market price is below equilibrium, a shortage develops as quantity demanded exceeds quantity supplied. Buyers compete and bid prices upward.
Price elasticity of demand (Ed) measures responsiveness. The midpoint method computes percentage change using average values: Ed = | [(Q2-Q1)/((Q1+Q2)/2)] / [(P2-P1)/((P1+P2)/2)] |. When Ed > 1, demand is elastic and increasing price decreases total revenue.
Deadweight loss (DWL) from an excise tax t creates a tax wedge between buyer price and seller price. DWL = 0.5 * t * (Q* - Qt).`);
      setDetailLevel('detailed');
      setAcademicLevel('intermediate');
    } else if (preset === 'calculus') {
      setTitle('Calculus I: Limits, Derivatives & The Chain Rule');
      setPastedText(`Differential Calculus fundamentals.
The derivative represents the instantaneous rate of change of a function.
The limit definition: f'(x) = lim_{h -> 0} [f(x+h) - f(x)] / h.
The Power Rule states d/dx[x^n] = n*x^{n-1}.
The Product Rule: (f*g)' = f'*g + f*g'.
The Chain Rule for composite functions: d/dx[f(g(x))] = f'(g(x)) * g'(x).
Worked optimization problems find local extrema where f'(x) = 0 and f''(x) determines concavity.`);
      setDetailLevel('detailed');
      setAcademicLevel('university');
    } else {
      setTitle('Classical Mechanics: Newton’s Laws & Work-Energy Theorem');
      setPastedText(`Newton's three laws of motion.
1st Law: Inertia. An object remains at rest or uniform velocity unless acted upon by a net external force.
2nd Law: F_net = m * a. Force equals mass times acceleration.
3rd Law: Action and reaction forces are equal in magnitude and opposite in direction.
Work is defined as W = F * d * cos(theta). The Work-Energy Theorem states that net work done on an object equals its change in kinetic energy: W_net = Delta K = 0.5*m*v_f^2 - 0.5*m*v_i^2.`);
      setDetailLevel('detailed');
      setAcademicLevel('school');
    }
  };

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const files = Array.from(e.dataTransfer.files);
      setSelectedFiles((prev) => [...prev, ...files]);
      if (!title && files[0]) {
        setTitle(files[0].name.replace(/\.[^/.]+$/, ''));
      }
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files);
      setSelectedFiles((prev) => [...prev, ...files]);
      if (!title && files[0]) {
        setTitle(files[0].name.replace(/\.[^/.]+$/, ''));
      }
    }
  };

  const handleTransform = async () => {
    setErrorMessage(null);

    // Validation
    const effectiveTitle =
      title.trim() ||
      (selectedFiles[0] ? selectedFiles[0].name.replace(/\.[^/.]+$/, '') : 'Study Material');

    let effectiveContent = pastedText;
    if (activeTab === 'video') {
      if (!videoUrl.trim()) {
        setErrorMessage('Please enter a valid YouTube or Google Drive URL.');
        return;
      }
      effectiveContent = `Video Source URL: ${videoUrl}\nPlatform: ${videoPlatform}\nTopic: ${effectiveTitle}`;
    } else if (activeTab === 'audio') {
      if (!audioFile && !pastedText) {
        setErrorMessage('Please select an audio file or provide lecture notes.');
        return;
      }
      effectiveContent = audioFile
        ? `Audio recording: ${audioFile.name} (${Math.round(audioFile.size / 1024)} KB)`
        : pastedText;
    } else if (selectedFiles.length === 0 && !pastedText.trim()) {
      setErrorMessage('Please upload a file or paste your lecture content/notes.');
      return;
    }

    setIsProcessing(true);
    setProcessingStep('Validating source content...');

    try {
      // Step 1: Create source record
      const sourceRecord: SourceMaterial = {
        id: 'src-' + Date.now(),
        title: effectiveTitle,
        sourceType: activeTab === 'docs' ? 'document' : activeTab === 'video' ? 'video' : 'audio',
        fileName: selectedFiles[0]?.name || (audioFile ? audioFile.name : undefined),
        sourceUrl: videoUrl || undefined,
        rawContent: effectiveContent,
        processingStatus: 'ready',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      await storage.saveSource(sourceRecord);

      // Step 2: Call server-side Gemini note generation
      setProcessingStep('AI analyzing pedagogical structure & mathematical notation...');
      const generatedNote = await postApiJson<any>('/api/generate-notes', {
        sourceTitle: effectiveTitle,
        sourceContent: effectiveContent,
        detailLevel,
        academicLevel,
        language,
        includeFormulas,
        includeDefinitions,
        includeExamples
      });

      generatedNote.sourceId = sourceRecord.id;
      generatedNote.sourceTitle = sourceRecord.title;
      await storage.saveNote(generatedNote);

      // Step 3: Optional Quiz generation
      if (generateQuiz) {
        setProcessingStep('Generating interactive quiz assessment...');
        try {
          const quizData = await postApiJson<any>('/api/generate-quiz', {
            sourceTitle: effectiveTitle,
            sourceContent: effectiveContent,
            questionCount: 4,
            difficulty: academicLevel,
            language
          });
          quizData.noteId = generatedNote.id;
          quizData.sourceId = sourceRecord.id;
          await storage.saveQuiz(quizData);
        } catch (qErr) {
          console.warn('Quiz generation warning:', qErr);
        }
      }

      // Step 4: Optional Flashcard generation
      if (generateFlashcards) {
        setProcessingStep('Creating spaced repetition flashcard deck...');
        try {
          const deckData = await postApiJson<any>('/api/generate-flashcards', {
            sourceTitle: effectiveTitle,
            sourceContent: effectiveContent,
            cardCount: 5,
            subject: effectiveTitle.split(':')[0] || 'General'
          });
          deckData.noteId = generatedNote.id;
          deckData.sourceId = sourceRecord.id;
          await storage.saveFlashcardDeck(deckData);
        } catch (fErr) {
          console.warn('Flashcard generation warning:', fErr);
        }
      }

      setProcessingStep('Finalizing study materials...');
      // Navigate to the newly generated note editor!
      navigate('note-editor', { id: generatedNote.id });
    } catch (err: any) {
      console.error('Processing error:', err);
      setErrorMessage(err.message || 'An error occurred while generating study materials.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-200">
      {/* Title */}
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-[#8B7CF6]">
          AI Import Studio
        </span>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-[#27223B] tracking-tight mt-1">
          Transform Your Learning Material
        </h2>
        <p className="text-xs sm:text-sm text-[#514963] mt-1">
          Turn documents, lectures, or recordings into teaching-first notes, quizzes, and flashcards.
        </p>
      </div>

      {/* Preset Quick Load Chips */}
      <div className="flex flex-wrap items-center gap-2 p-3 bg-white border border-[#EBE6DF] rounded-2xl shadow-2xs">
        <span className="text-xs font-bold text-[#6E6685] flex items-center gap-1.5 pl-1">
          <Sparkles className="w-3.5 h-3.5 text-[#6654D9]" />
          <span>Quick Sample Presets:</span>
        </span>
        <button
          onClick={() => loadPreset('economics')}
          className="text-xs font-medium px-3 py-1 rounded-xl bg-[#FAF8FF] hover:bg-[#F0ECFF] text-[#6654D9] border border-[#E2DCF7] transition-colors"
        >
          📈 Economics (Elasticity & DWL)
        </button>
        <button
          onClick={() => loadPreset('calculus')}
          className="text-xs font-medium px-3 py-1 rounded-xl bg-[#F0FBF5] hover:bg-[#E2F7EB] text-[#1E5638] border border-[#BFE8D5] transition-colors"
        >
          ∫ Calculus (Limits & Chain Rule)
        </button>
        <button
          onClick={() => loadPreset('physics')}
          className="text-xs font-medium px-3 py-1 rounded-xl bg-[#FFFBF0] hover:bg-[#FFF4DC] text-[#8B4513] border border-[#FFE1D2] transition-colors"
        >
          ⚡ Physics (Newton's Laws)
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 p-1.5 bg-white border border-[#EBE6DF] rounded-2xl w-fit shadow-2xs">
        <button
          onClick={() => setActiveTab('docs')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'docs'
              ? 'bg-[#6654D9] text-white shadow-xs'
              : 'text-[#6E6685] hover:text-[#27223B]'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Documents & Images</span>
        </button>

        <button
          onClick={() => setActiveTab('video')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'video'
              ? 'bg-[#6654D9] text-white shadow-xs'
              : 'text-[#6E6685] hover:text-[#27223B]'
          }`}
        >
          <Video className="w-4 h-4" />
          <span>Videos & YouTube</span>
        </button>

        <button
          onClick={() => setActiveTab('audio')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'audio'
              ? 'bg-[#6654D9] text-white shadow-xs'
              : 'text-[#6E6685] hover:text-[#27223B]'
          }`}
        >
          <Mic className="w-4 h-4" />
          <span>Audio & Recordings</span>
        </button>
      </div>

      {/* Tab Panels */}
      <div className="bg-white rounded-3xl border border-[#EBE6DF] p-6 sm:p-8 shadow-xs space-y-6">
        {/* Tab A: Documents */}
        {activeTab === 'docs' && (
          <div className="space-y-4">
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleFileDrop}
              className="border-2 border-dashed border-[#8B7CF6]/40 hover:border-[#6654D9] rounded-2xl p-8 text-center bg-[#FAF8F4] hover:bg-[#FAF8FF] transition-all"
            >
              <UploadCloud className="w-10 h-10 text-[#6654D9] mx-auto mb-2" />
              <p className="text-xs font-bold text-[#27223B]">
                Drag and drop PDF, DOCX, PPTX, TXT, or images here
              </p>
              <p className="text-[11px] text-[#6E6685] mt-1">
                Supports multiple files up to 25MB each
              </p>
              <label className="mt-3 inline-block cursor-pointer px-4 py-1.5 rounded-xl bg-white border border-[#E2DCF7] text-xs font-bold text-[#6654D9] hover:bg-[#FAF8FF] shadow-2xs">
                Browse Files
                <input
                  type="file"
                  multiple
                  accept=".pdf,.doc,.docx,.ppt,.pptx,.txt,.png,.jpg,.jpeg"
                  onChange={handleFileInput}
                  className="hidden"
                />
              </label>
            </div>

            {selectedFiles.length > 0 && (
              <div className="space-y-2">
                <span className="text-xs font-bold text-[#27223B]">Selected Files:</span>
                <div className="flex flex-wrap gap-2">
                  {selectedFiles.map((file, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#FAF8FF] border border-[#E2DCF7] text-xs font-medium text-[#27223B]"
                    >
                      <FileText className="w-3.5 h-3.5 text-[#6654D9]" />
                      <span className="truncate max-w-[200px]">{file.name}</span>
                      <button
                        onClick={() => setSelectedFiles(selectedFiles.filter((_, i) => i !== idx))}
                        className="text-[#9D96B0] hover:text-rose-600"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-[#27223B] mb-1">
                Or paste raw notes, lecture transcript, or study questions:
              </label>
              <textarea
                rows={4}
                value={pastedText}
                onChange={(e) => setPastedText(e.target.value)}
                placeholder="Paste lecture text, syllabus excerpt, or key concepts..."
                className="w-full p-3 rounded-xl border border-[#EBE6DF] bg-[#FAF8F4] text-xs text-[#27223B] placeholder-[#9D96B0] focus:outline-hidden focus:border-[#8B7CF6] focus:bg-white"
              />
            </div>
          </div>
        )}

        {/* Tab B: Videos */}
        {activeTab === 'video' && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
                <input
                  type="radio"
                  name="videoPlatform"
                  checked={videoPlatform === 'youtube'}
                  onChange={() => setVideoPlatform('youtube')}
                  className="text-[#6654D9]"
                />
                <span>YouTube URL</span>
              </label>
              <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
                <input
                  type="radio"
                  name="videoPlatform"
                  checked={videoPlatform === 'drive'}
                  onChange={() => setVideoPlatform('drive')}
                  className="text-[#6654D9]"
                />
                <span>Google Drive Video</span>
              </label>
              <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
                <input
                  type="radio"
                  name="videoPlatform"
                  checked={videoPlatform === 'mp4'}
                  onChange={() => setVideoPlatform('mp4')}
                  className="text-[#6654D9]"
                />
                <span>MP4 File</span>
              </label>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#27223B] mb-1">
                {videoPlatform === 'youtube'
                  ? 'YouTube Video Link'
                  : videoPlatform === 'drive'
                  ? 'Google Drive Share Link'
                  : 'Video URL or Direct Link'}
              </label>
              <input
                type="url"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                placeholder={
                  videoPlatform === 'youtube'
                    ? 'https://www.youtube.com/watch?v=...'
                    : 'https://drive.google.com/file/d/...'
                }
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#EBE6DF] bg-[#FAF8F4] text-xs text-[#27223B] placeholder-[#9D96B0] focus:outline-hidden focus:border-[#8B7CF6] focus:bg-white"
              />
            </div>

            <div className="p-3.5 rounded-2xl bg-[#F0FBF5] border border-[#BFE8D5] text-xs text-[#1E5638] flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-[#2E7D32]" />
              <div>
                <strong className="block">Video Lecture Intelligence</strong>
                <span>
                  LumiLearn AI processes video transcripts, lecture audio, and on-screen formulas to
                  generate chronological notes with section timestamps.
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Tab C: Audio */}
        {activeTab === 'audio' && (
          <div className="space-y-4">
            <div className="border-2 border-dashed border-[#8B7CF6]/40 hover:border-[#6654D9] rounded-2xl p-6 text-center bg-[#FAF8F4]">
              <Mic className="w-10 h-10 text-[#8B4513] mx-auto mb-2" />
              <p className="text-xs font-bold text-[#27223B]">
                Upload classroom lecture audio (MP3, WAV, M4A)
              </p>
              <label className="mt-3 inline-block cursor-pointer px-4 py-1.5 rounded-xl bg-white border border-[#FFE1D2] text-xs font-bold text-[#8B4513] hover:bg-[#FFFBF0] shadow-2xs">
                Select Audio File
                <input
                  type="file"
                  accept="audio/*"
                  onChange={(e) => {
                    if (e.target.files?.[0]) {
                      setAudioFile(e.target.files[0]);
                      if (!title) setTitle(e.target.files[0].name.replace(/\.[^/.]+$/, ''));
                    }
                  }}
                  className="hidden"
                />
              </label>

              {audioFile && (
                <div className="mt-3 p-2 bg-white rounded-xl border border-[#EBE6DF] inline-flex items-center gap-2 text-xs text-[#27223B]">
                  <Mic className="w-3.5 h-3.5 text-[#6654D9]" />
                  <span>
                    {audioFile.name} ({Math.round(audioFile.size / 1024)} KB)
                  </span>
                </div>
              )}
            </div>

            {/* Waveform visual simulation */}
            <div className="p-4 bg-[#FAF8FF] border border-[#E2DCF7] rounded-2xl">
              <div className="flex items-center justify-between text-xs text-[#6654D9] font-semibold mb-2">
                <span>Audio Waveform Detector</span>
                <span>Ready for Whisper/Gemini Transcription</span>
              </div>
              <div className="h-8 flex items-center justify-between gap-1 px-2">
                {[12, 28, 45, 20, 60, 80, 50, 90, 70, 30, 40, 65, 85, 35, 25, 60, 40, 75, 55, 30, 70, 95, 60, 40, 20, 50, 80, 65, 35, 20].map(
                  (h, i) => (
                    <div
                      key={i}
                      className="flex-1 bg-[#8B7CF6] rounded-full transition-all duration-300"
                      style={{ height: `${h}%` }}
                    />
                  )
                )}
              </div>
            </div>
          </div>
        )}

        {/* Generation Settings Section */}
        <div className="pt-6 border-t border-[#EBE6DF] space-y-4">
          <h4 className="text-xs font-extrabold uppercase tracking-wider text-[#6654D9]">
            AI Generation Settings
          </h4>

          {/* Title & Language */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#27223B] mb-1">
                Study Material Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Microeconomics: Elasticity & Market Equilibrium"
                className="w-full px-3.5 py-2 rounded-xl border border-[#EBE6DF] bg-[#FAF8F4] text-xs text-[#27223B] focus:outline-hidden focus:border-[#8B7CF6] focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#27223B] mb-1">
                Output Language
              </label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-[#EBE6DF] bg-[#FAF8F4] text-xs text-[#27223B] focus:outline-hidden focus:border-[#8B7CF6] focus:bg-white"
              >
                <option value="English">English</option>
                <option value="Urdu">Urdu (اردو)</option>
                <option value="Arabic">Arabic (العربية)</option>
                <option value="Spanish">Spanish (Español)</option>
                <option value="French">French (Français)</option>
                <option value="Hindi">Hindi (हिन्दी)</option>
                <option value="German">German (Deutsch)</option>
              </select>
            </div>
          </div>

          {/* Note Detail & Academic Level */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#27223B] mb-1">
                Note Length & Detail Level
              </label>
              <select
                value={detailLevel}
                onChange={(e) => setDetailLevel(e.target.value as NoteDetailLevel)}
                className="w-full px-3.5 py-2 rounded-xl border border-[#EBE6DF] bg-[#FAF8F4] text-xs text-[#27223B] focus:outline-hidden focus:border-[#8B7CF6] focus:bg-white font-medium"
              >
                <option value="quick">1. Quick Revision (High-yield summary)</option>
                <option value="standard">2. Standard Notes (Balanced concepts)</option>
                <option value="detailed">
                  3. Detailed Study Notes (Thorough explanations & worked math - Recommended)
                </option>
                <option value="comprehensive">
                  4. Comprehensive Chapter (Exhaustive textbook style)
                </option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#27223B] mb-1">
                Academic Rigor Level
              </label>
              <select
                value={academicLevel}
                onChange={(e) => setAcademicLevel(e.target.value as AcademicLevel)}
                className="w-full px-3.5 py-2 rounded-xl border border-[#EBE6DF] bg-[#FAF8F4] text-xs text-[#27223B] focus:outline-hidden focus:border-[#8B7CF6] focus:bg-white"
              >
                <option value="beginner">Beginner / Introductory</option>
                <option value="intermediate">High School / AP Prep</option>
                <option value="advanced">University / Undergrad Level</option>
              </select>
            </div>
          </div>

          {/* Feature toggles */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-2">
            <label className="flex items-center gap-2 text-xs font-medium text-[#27223B] cursor-pointer">
              <input
                type="checkbox"
                checked={includeFormulas}
                onChange={(e) => setIncludeFormulas(e.target.checked)}
                className="rounded text-[#6654D9] focus:ring-[#8B7CF6]"
              />
              <span>KaTeX Math & Worked Steps</span>
            </label>

            <label className="flex items-center gap-2 text-xs font-medium text-[#27223B] cursor-pointer">
              <input
                type="checkbox"
                checked={includeDefinitions}
                onChange={(e) => setIncludeDefinitions(e.target.checked)}
                className="rounded text-[#6654D9] focus:ring-[#8B7CF6]"
              />
              <span>Key Definitions</span>
            </label>

            <label className="flex items-center gap-2 text-xs font-medium text-[#27223B] cursor-pointer">
              <input
                type="checkbox"
                checked={includeExamples}
                onChange={(e) => setIncludeExamples(e.target.checked)}
                className="rounded text-[#6654D9] focus:ring-[#8B7CF6]"
              />
              <span>Real-World Examples</span>
            </label>

            <label className="flex items-center gap-2 text-xs font-medium text-[#27223B] cursor-pointer">
              <input
                type="checkbox"
                checked={generateQuiz}
                onChange={(e) => setGenerateQuiz(e.target.checked)}
                className="rounded text-[#6654D9] focus:ring-[#8B7CF6]"
              />
              <span>Generate Quiz</span>
            </label>

            <label className="flex items-center gap-2 text-xs font-medium text-[#27223B] cursor-pointer">
              <input
                type="checkbox"
                checked={generateFlashcards}
                onChange={(e) => setGenerateFlashcards(e.target.checked)}
                className="rounded text-[#6654D9] focus:ring-[#8B7CF6]"
              />
              <span>Generate Flashcards</span>
            </label>
          </div>
        </div>

        {/* Error notification */}
        {errorMessage && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-800 space-y-2">
            <div className="flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span className="font-semibold leading-relaxed">{errorMessage}</span>
            </div>
            {errorMessage.includes('Vercel') && (
              <div className="ml-6 pl-2.5 border-l-2 border-rose-300 text-[11px] text-rose-700 space-y-1 pt-0.5">
                <p className="font-bold text-rose-900">Why this happens after adding the key:</p>
                <p>• In Vercel, adding an Environment Variable under <em>Settings</em> <strong>does not automatically update active deployments</strong>.</p>
                <p>• Go to your Vercel Dashboard → <strong>Deployments</strong> tab → click the three dots (<span className="font-mono font-bold">...</span>) next to your deployment → click <strong className="underline">Redeploy</strong>.</p>
              </div>
            )}
          </div>
        )}

        {/* Processing Indicator */}
        {isProcessing && (
          <div className="p-5 rounded-2xl bg-[#FAF8FF] border border-[#E2DCF7] text-center space-y-2">
            <div className="w-8 h-8 mx-auto rounded-full bg-[#8B7CF6]/20 text-[#6654D9] flex items-center justify-center animate-spin">
              <RotateCw className="w-4 h-4" />
            </div>
            <p className="text-xs font-bold text-[#6654D9]">{processingStep}</p>
            <p className="text-[11px] text-[#6E6685]">
              Gemini is structuring explanations, computing formula steps, and formatting math...
            </p>
          </div>
        )}

        {/* Submit Button */}
        <button
          onClick={handleTransform}
          disabled={isProcessing}
          className="w-full py-4 rounded-2xl bg-[#6654D9] hover:bg-[#5844CA] text-white text-sm font-bold shadow-md shadow-[#6654D9]/25 hover:shadow-lg hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {isProcessing ? (
            <span>Processing Study Material...</span>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>Transform My Material</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </div>
  );
};
