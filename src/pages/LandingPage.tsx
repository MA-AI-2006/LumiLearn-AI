import React, { useState } from 'react';
import {
  GraduationCap,
  Sparkles,
  ArrowRight,
  FileText,
  Video,
  Mic,
  CheckCircle2,
  HelpCircle,
  Layers,
  Languages,
  Calculator,
  ShieldCheck,
  TrendingUp,
  Brain,
  ChevronRight,
  BookOpen
} from 'lucide-react';
import { KatexFormula } from '../components/common/MathRenderer';
import { useAuth } from '../context/AuthContext';
import heroWorkspaceImg from '../assets/images/study_workspace_hero_1792246361123.jpg';
import multimodalInputsImg from '../assets/images/multimodal_inputs_1792246375543.jpg';
import activeToolsImg from '../assets/images/active_study_tools_1792246389622.jpg';

interface LandingPageProps {
  navigate: (route: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ navigate }) => {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState<'docs' | 'video' | 'audio'>('docs');

  const handleStart = () => {
    if (currentUser) {
      navigate('dashboard');
    } else {
      navigate('signup');
    }
  };

  const handleSignIn = () => {
    if (currentUser) {
      navigate('dashboard');
    } else {
      navigate('signin');
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF8F4] text-[#27223B] flex flex-col font-sans selection:bg-[#8B7CF6]/20">
      {/* 1. Navigation Header */}
      <nav className="h-20 border-b border-[#EBE6DF] bg-white/80 backdrop-blur-md sticky top-0 z-40 px-6 lg:px-12 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#8B7CF6] to-[#6654D9] flex items-center justify-center text-white shadow-md shadow-[#8B7CF6]/25">
            <GraduationCap className="w-5 h-5" />
          </div>
          <span className="font-heading font-extrabold text-xl tracking-tight text-[#27223B]">
            Lumi<span className="text-[#6654D9]">Learn</span>
            <span className="text-xs font-bold uppercase tracking-wider text-[#8B7CF6] ml-1.5 px-2 py-0.5 rounded-full bg-[#8B7CF6]/10">
              AI
            </span>
          </span>
        </div>

        {/* Desktop Nav Links */}
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-[#514963]">
          <a href="#features" className="hover:text-[#6654D9] transition-colors">
            Features
          </a>
          <a href="#workflow" className="hover:text-[#6654D9] transition-colors">
            How It Works
          </a>
          <a href="#tools" className="hover:text-[#6654D9] transition-colors">
            Study Tools
          </a>
        </div>

        {/* CTA Actions */}
        <div className="flex items-center gap-4">
          <button
            onClick={handleSignIn}
            className="text-sm font-semibold text-[#514963] hover:text-[#6654D9] transition-colors"
          >
            {currentUser ? 'Go to Dashboard' : 'Sign In'}
          </button>
          <button
            onClick={handleStart}
            className="px-5 py-2.5 rounded-xl bg-[#6654D9] hover:bg-[#5844CA] text-white text-sm font-semibold shadow-md shadow-[#6654D9]/25 hover:shadow-lg transition-all flex items-center gap-2 group"
          >
            <span>{currentUser ? 'Open App' : 'Try It Free'}</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
      </nav>

      {/* 2. Hero Section */}
      <section className="pt-16 pb-20 px-6 lg:px-12 max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Headlines & CTAs */}
          <div className="lg:col-span-6 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FAF8FF] border border-[#E2DCF7] text-xs font-semibold text-[#6654D9] shadow-2xs">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Teaching-First AI Study Workspace</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-[#27223B] leading-[1.12]">
              Your learning material.{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#6654D9] to-[#8B7CF6]">
                Reimagined by AI.
              </span>
            </h1>

            <p className="text-base sm:text-lg text-[#514963] leading-relaxed max-w-xl mx-auto lg:mx-0">
              Upload your notes, share a lecture, or drop in an audio recording. Get structured
              notes with readable mathematics, interactive quizzes, and flashcards — all in one
              focused workspace.
            </p>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
              <button
                onClick={handleStart}
                className="w-full sm:w-auto px-8 py-4 rounded-xl bg-[#6654D9] hover:bg-[#5844CA] text-white text-base font-bold shadow-lg shadow-[#6654D9]/30 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2.5"
              >
                <span>Start Creating</span>
                <ArrowRight className="w-5 h-5" />
              </button>
              <a
                href="#features"
                className="w-full sm:w-auto px-7 py-4 rounded-xl bg-white hover:bg-[#FAF8F4] text-[#27223B] border border-[#EBE6DF] text-base font-semibold shadow-2xs transition-all text-center"
              >
                Explore Features
              </a>
            </div>

            <div className="pt-4 flex items-center justify-center lg:justify-start gap-6 text-xs text-[#6E6685]">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#2E7D32]" />
                <span>KaTeX Math Rendering</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#2E7D32]" />
                <span>AI Tutor Support</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#2E7D32]" />
                <span>Firebase Synced</span>
              </div>
            </div>
          </div>

          {/* Right Column: Layered Real Product Preview */}
          <div className="lg:col-span-6 relative">
            {/* Background decorative glow */}
            <div className="absolute -inset-4 bg-gradient-to-r from-[#8B7CF6]/20 via-[#BFE8D5]/20 to-[#FFE1D2]/20 rounded-3xl blur-2xl -z-10" />

            <div className="relative bg-white rounded-3xl border border-[#E2DCF7] shadow-xl p-5 sm:p-6 space-y-4">
              {/* Product window title bar */}
              <div className="flex items-center justify-between pb-3 border-b border-[#EBE6DF]">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-[#FFE1D2]" />
                  <span className="w-3 h-3 rounded-full bg-[#FFF0B3]" />
                  <span className="w-3 h-3 rounded-full bg-[#BFE8D5]" />
                  <span className="text-xs font-semibold text-[#6E6685] ml-2">
                    LumiLearn Note Editor
                  </span>
                </div>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#BFE8D5] text-[#1E5638]">
                  Detailed Notes
                </span>
              </div>

              {/* Visual Workspace Hero Banner */}
              <div className="relative rounded-2xl overflow-hidden border border-[#E2DCF7] shadow-2xs group max-h-48">
                <img
                  src={heroWorkspaceImg}
                  alt="LumiLearn 3D Modern Academic Workspace"
                  className="w-full h-44 object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#27223B]/80 via-transparent to-transparent flex items-end p-3.5">
                  <div className="text-white">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#BFE8D5]">
                      Smart Multimodal Study Environment
                    </span>
                    <p className="text-xs font-semibold">
                      Digital tablets, structured notes & step-by-step calculus derivations
                    </p>
                  </div>
                </div>
              </div>

              {/* Note Header Preview */}
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#8B7CF6]">
                  Economics 101 • Unit 4
                </span>
                <h3 className="text-lg font-bold text-[#27223B]">
                  Market Equilibrium, Price Elasticity & Welfare
                </h3>
              </div>

              {/* Rendered Math Formula Panel */}
              <div className="p-3.5 bg-[#FAF8FF] border border-[#E2DCF7] rounded-2xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#6654D9] flex items-center gap-1.5">
                    <Calculator className="w-3.5 h-3.5" />
                    Midpoint Formula for Elasticity
                  </span>
                  <span className="text-[10px] bg-white px-2 py-0.5 rounded-md border border-[#E2DCF7] text-[#514963]">
                    Step-by-Step
                  </span>
                </div>
                <div className="text-center py-1">
                  <KatexFormula
                    formula="E_d = \left| \frac{(Q_2 - Q_1) / \frac{Q_1 + Q_2}{2}}{(P_2 - P_1) / \frac{P_1 + P_2}{2}} \right|"
                    displayMode={true}
                  />
                </div>
                <p className="text-[11px] text-[#514963] bg-white p-2 rounded-xl border border-[#EBE6DF]">
                  <strong className="text-[#27223B]">Plain Intuition:</strong> Percentage change in
                  quantity divided by percentage change in price, calculated from average bases.
                </p>
              </div>

              {/* Overlapping Floating Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                {/* Quiz score badge */}
                <div className="p-3 rounded-2xl bg-[#F0FBF5] border border-[#BFE8D5] shadow-xs flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#BFE8D5] flex items-center justify-center text-[#1E5638] font-black text-sm">
                    100%
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[#1E5638]">Quiz Mastered</div>
                    <div className="text-[10px] text-[#2B6144]">3/3 Perfect Answers</div>
                  </div>
                </div>

                {/* Spaced Flashcard Preview */}
                <div className="p-3 rounded-2xl bg-[#FFFBF0] border border-[#FFE1D2] shadow-xs flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#FFE1D2] flex items-center justify-center text-[#C96E3A]">
                    <Layers className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[#8B4513]">Flashcards Ready</div>
                    <div className="text-[10px] text-[#8B4513]/80">Flip & Recall Active</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Supported Material Strip */}
      <section className="border-y border-[#EBE6DF] bg-white py-12 px-6 lg:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-xs uppercase tracking-widest font-extrabold text-[#8B7CF6]">
              Input Anything • Learn Everything
            </h2>
            <p className="text-2xl sm:text-3xl font-extrabold text-[#27223B] mt-1.5">
              Three seamless paths to transform educational materials
            </p>
          </div>

          {/* Multimodal Inputs Feature Banner with 3D Illustration */}
          <div className="mb-10 bg-gradient-to-r from-[#FAF8FF] via-[#FAF8F4] to-[#F3EFFF] rounded-3xl border border-[#E2DCF7] overflow-hidden grid grid-cols-1 lg:grid-cols-12 items-center shadow-xs">
            <div className="lg:col-span-7 p-6 sm:p-10 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-[#E2DCF7] text-xs font-semibold text-[#6654D9]">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Multi-Format Ingestion Engine</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-[#27223B] tracking-tight">
                One workspace for textbooks, audio memos, and recorded lectures.
              </h3>
              <p className="text-xs sm:text-sm text-[#514963] leading-relaxed">
                Whether you have a 40-page scanned PDF chapter, a 45-minute YouTube guest lecture, or
                a quick voice recording from class, LumiLearn AI extracts the underlying concepts,
                definitions, and mathematical proofs automatically.
              </p>
              <div className="pt-2 flex flex-wrap gap-2 text-xs font-semibold text-[#6654D9]">
                <span className="px-3 py-1 bg-white rounded-xl border border-[#E2DCF7]">
                  ✓ Optical Character & Formula Recognition
                </span>
                <span className="px-3 py-1 bg-white rounded-xl border border-[#E2DCF7]">
                  ✓ Automated Lecture Summarization
                </span>
                <span className="px-3 py-1 bg-white rounded-xl border border-[#E2DCF7]">
                  ✓ Timestamped Topic Breakdowns
                </span>
              </div>
            </div>

            <div className="lg:col-span-5 p-4 sm:p-6 flex justify-center">
              <img
                src={multimodalInputsImg}
                alt="Multimodal Educational Media Ingestion"
                className="rounded-2xl shadow-md border border-[#E2DCF7] object-cover max-h-72 w-full hover:scale-102 transition-transform duration-300"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Input 1 */}
            <div className="p-6 rounded-2xl bg-[#FAF8F4] border border-[#EBE6DF] hover:border-[#8B7CF6] transition-all group">
              <div className="w-12 h-12 rounded-xl bg-violet-100 text-[#6654D9] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <FileText className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-base text-[#27223B]">Documents & Images</h3>
              <p className="text-xs text-[#514963] mt-2 leading-relaxed">
                Upload textbook chapters, lecture slides, scanned papers, and handwritten notes.
              </p>
              <div className="flex flex-wrap gap-1.5 mt-4">
                {['PDF', 'DOCX', 'PPTX', 'TXT', 'PNG', 'JPG'].map((fmt) => (
                  <span
                    key={fmt}
                    className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-white border border-[#EBE6DF] text-[#6E6685]"
                  >
                    {fmt}
                  </span>
                ))}
              </div>
            </div>

            {/* Input 2 */}
            <div className="p-6 rounded-2xl bg-[#FAF8F4] border border-[#EBE6DF] hover:border-[#8B7CF6] transition-all group">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 text-[#1E5638] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Video className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-base text-[#27223B]">Videos & Lectures</h3>
              <p className="text-xs text-[#514963] mt-2 leading-relaxed">
                Paste YouTube video URLs, Google Drive lecture recordings, or upload MP4 videos.
              </p>
              <div className="flex flex-wrap gap-1.5 mt-4">
                {['YouTube', 'Google Drive', 'MP4 Upload'].map((fmt) => (
                  <span
                    key={fmt}
                    className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-white border border-[#EBE6DF] text-[#6E6685]"
                  >
                    {fmt}
                  </span>
                ))}
              </div>
            </div>

            {/* Input 3 */}
            <div className="p-6 rounded-2xl bg-[#FAF8F4] border border-[#EBE6DF] hover:border-[#8B7CF6] transition-all group">
              <div className="w-12 h-12 rounded-xl bg-amber-100 text-[#8B4513] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Mic className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-base text-[#27223B]">Audio & Recordings</h3>
              <p className="text-xs text-[#514963] mt-2 leading-relaxed">
                Drop in classroom audio recordings, podcasts, seminars, and speech memos.
              </p>
              <div className="flex flex-wrap gap-1.5 mt-4">
                {['MP3', 'WAV', 'M4A', 'Audio Memos'].map((fmt) => (
                  <span
                    key={fmt}
                    className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-white border border-[#EBE6DF] text-[#6E6685]"
                  >
                    {fmt}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Feature Sections */}
      <section id="features" className="py-20 px-6 lg:px-12 max-w-7xl mx-auto w-full">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-bold uppercase tracking-widest text-[#6654D9]">
            Full Workspace Toolkit
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#27223B] mt-2">
            Everything you need to master any subject
          </h2>
          <p className="text-sm text-[#514963] mt-3">
            Designed for serious learners: high school, university undergraduates, and lifelong scholars.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Card 1 */}
          <div className="bg-white p-6 rounded-3xl border border-[#E2DCF7] shadow-sm hover:shadow-md transition-shadow">
            <div className="w-10 h-10 rounded-xl bg-[#FAF8FF] text-[#6654D9] flex items-center justify-center mb-4 border border-[#E2DCF7]">
              <FileText className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-[#27223B]">Teaching-First Notes</h3>
            <p className="text-xs text-[#514963] mt-2 leading-relaxed">
              No cryptic fragments. Concepts are explained thoroughly with intuition, context,
              definitions, and derivations before formulas are presented.
            </p>
          </div>

          {/* Card 2 */}
          <div className="bg-white p-6 rounded-3xl border border-[#E2DCF7] shadow-sm hover:shadow-md transition-shadow">
            <div className="w-10 h-10 rounded-xl bg-[#FAF8FF] text-[#6654D9] flex items-center justify-center mb-4 border border-[#E2DCF7]">
              <Calculator className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-[#27223B]">KaTeX Math & Worked Steps</h3>
            <p className="text-xs text-[#514963] mt-2 leading-relaxed">
              Never see raw LaTeX strings. Every formula comes with symbol definitions, clear
              purposes, and step-by-step worked numerical examples.
            </p>
          </div>

          {/* Card 3 */}
          <div className="bg-white p-6 rounded-3xl border border-[#E2DCF7] shadow-sm hover:shadow-md transition-shadow">
            <div className="w-10 h-10 rounded-xl bg-[#FAF8FF] text-[#6654D9] flex items-center justify-center mb-4 border border-[#E2DCF7]">
              <Brain className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-[#27223B]">Dedicated AI Tutor</h3>
            <p className="text-xs text-[#514963] mt-2 leading-relaxed">
              Ask questions grounded in your saved notes or explore new subjects with tailored
              explanations from "Explain simply" to "University level."
            </p>
          </div>

          {/* Card 4 */}
          <div className="bg-white p-6 rounded-3xl border border-[#E2DCF7] shadow-sm hover:shadow-md transition-shadow">
            <div className="w-10 h-10 rounded-xl bg-[#FAF8FF] text-[#6654D9] flex items-center justify-center mb-4 border border-[#E2DCF7]">
              <HelpCircle className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-[#27223B]">Interactive Quizzes</h3>
            <p className="text-xs text-[#514963] mt-2 leading-relaxed">
              Reinforce learning with multi-choice, true/false, and problem-solving questions with
              detailed explanations and mistake recovery.
            </p>
          </div>

          {/* Card 5 */}
          <div className="bg-white p-6 rounded-3xl border border-[#E2DCF7] shadow-sm hover:shadow-md transition-shadow">
            <div className="w-10 h-10 rounded-xl bg-[#FAF8FF] text-[#6654D9] flex items-center justify-center mb-4 border border-[#E2DCF7]">
              <Layers className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-[#27223B]">Spaced Repetition Flashcards</h3>
            <p className="text-xs text-[#514963] mt-2 leading-relaxed">
              3D flip cards with concise questions, answers, and plain-language breakdowns. Track
              mastery and review difficult cards.
            </p>
          </div>

          {/* Card 6 */}
          <div className="bg-white p-6 rounded-3xl border border-[#E2DCF7] shadow-sm hover:shadow-md transition-shadow">
            <div className="w-10 h-10 rounded-xl bg-[#FAF8FF] text-[#6654D9] flex items-center justify-center mb-4 border border-[#E2DCF7]">
              <Languages className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-[#27223B]">Multilingual Translation</h3>
            <p className="text-xs text-[#514963] mt-2 leading-relaxed">
              Translate study notes into Urdu, Arabic, Hindi, Spanish, French, and more. RTL layout
              support preserves mathematical notation order.
            </p>
          </div>
        </div>

        {/* Active Study Tools Feature Showcase */}
        <div className="mt-12 bg-white rounded-3xl border border-[#E2DCF7] p-6 sm:p-10 shadow-sm grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-5 flex justify-center">
            <img
              src={activeToolsImg}
              alt="Active Recall Quizzes and Holographic Formula Flashcards"
              className="rounded-2xl shadow-md border border-[#E2DCF7] object-cover max-h-72 w-full hover:scale-102 transition-transform duration-300"
            />
          </div>

          <div className="lg:col-span-7 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FAF8FF] border border-[#E2DCF7] text-xs font-semibold text-[#6654D9]">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Proven Spaced Repetition Architecture</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-[#27223B] tracking-tight">
              Test your recall with real equations, not simple flashcards.
            </h3>
            <p className="text-xs sm:text-sm text-[#514963] leading-relaxed">
              LumiLearn AI doesn't just ask trivial multiple-choice questions. It tests conceptual
              connections, mathematical derivations, formula recall, and step-by-step arithmetic. If
              you miss a question, generate a targeted remediation deck with a single click.
            </p>
            <div className="pt-2 flex flex-wrap gap-3">
              <button
                onClick={handleStart}
                className="px-5 py-2.5 rounded-xl bg-[#6654D9] hover:bg-[#5844CA] text-white text-xs font-bold transition-all shadow-xs flex items-center gap-2"
              >
                <span>Try Active Study Tools</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 5. 3-Step Workflow Section */}
      <section id="workflow" className="py-16 bg-[#FDFBF7] border-y border-[#EBE6DF] px-6 lg:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-widest text-[#8B7CF6]">
              How LumiLearn Works
            </span>
            <h2 className="text-3xl font-extrabold text-[#27223B] mt-1">
              From raw media to mastery in 3 steps
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Step 1 */}
            <div className="bg-white p-6 rounded-3xl border border-[#EBE6DF] relative">
              <span className="w-8 h-8 rounded-full bg-[#8B7CF6]/20 text-[#6654D9] font-bold text-sm flex items-center justify-center mb-4">
                1
              </span>
              <h3 className="font-bold text-base text-[#27223B]">Upload or Link</h3>
              <p className="text-xs text-[#514963] mt-2 leading-relaxed">
                Drop in a PDF textbook chapter, an audio lecture recording, or paste a video link.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-white p-6 rounded-3xl border border-[#EBE6DF] relative">
              <span className="w-8 h-8 rounded-full bg-[#8B7CF6]/20 text-[#6654D9] font-bold text-sm flex items-center justify-center mb-4">
                2
              </span>
              <h3 className="font-bold text-base text-[#27223B]">AI Deep Organization</h3>
              <p className="text-xs text-[#514963] mt-2 leading-relaxed">
                Gemini structures the material into readable chapters, extracts formulas, and
                creates worked examples.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-white p-6 rounded-3xl border border-[#EBE6DF] relative">
              <span className="w-8 h-8 rounded-full bg-[#8B7CF6]/20 text-[#6654D9] font-bold text-sm flex items-center justify-center mb-4">
                3
              </span>
              <h3 className="font-bold text-base text-[#27223B]">Learn & Retain</h3>
              <p className="text-xs text-[#514963] mt-2 leading-relaxed">
                Study editable rich notes, test yourself with quizzes, flip flashcards, and export
                PDFs.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Final Call to Action Banner */}
      <section className="py-20 px-6 lg:px-12 max-w-5xl mx-auto w-full text-center">
        <div className="bg-gradient-to-br from-[#6654D9] to-[#8B7CF6] rounded-3xl p-10 sm:p-14 text-white shadow-xl relative overflow-hidden">
          <div className="relative z-10 space-y-4 max-w-2xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Ready to make learning click?
            </h2>
            <p className="text-sm sm:text-base text-white/80 leading-relaxed">
              Join students transforming messy lectures into structured notes, quizzes, and
              unshakable memory.
            </p>
            <div className="pt-4 flex justify-center">
              <button
                onClick={handleStart}
                className="px-8 py-4 rounded-xl bg-white hover:bg-[#FAF8F4] text-[#6654D9] text-base font-bold shadow-lg hover:scale-105 active:scale-95 transition-all"
              >
                Start Creating Free
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Footer */}
      <footer className="border-t border-[#EBE6DF] bg-white py-12 px-6 lg:px-12 mt-auto text-xs text-[#6E6685]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#6654D9] flex items-center justify-center text-white">
              <GraduationCap className="w-4 h-4" />
            </div>
            <span className="font-heading font-bold text-sm text-[#27223B]">LumiLearn AI</span>
            <span className="text-[11px] ml-2 text-[#9D96B0]">
              Turn anything you learn into something you remember.
            </span>
          </div>

          <div className="flex items-center gap-6">
            <button onClick={() => navigate('notes')} className="hover:text-[#6654D9]">
              Notes
            </button>
            <button onClick={() => navigate('quizzes')} className="hover:text-[#6654D9]">
              Quizzes
            </button>
            <button onClick={() => navigate('flashcards')} className="hover:text-[#6654D9]">
              Flashcards
            </button>
            <button onClick={() => navigate('tutor')} className="hover:text-[#6654D9]">
              AI Tutor
            </button>
            <button onClick={() => navigate('settings')} className="hover:text-[#6654D9]">
              Settings
            </button>
          </div>

          <p className="text-[11px] text-[#9D96B0]">
            © {new Date().getFullYear()} LumiLearn AI. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};
