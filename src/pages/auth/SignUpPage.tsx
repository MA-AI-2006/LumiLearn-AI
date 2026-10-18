import React, { useState } from 'react';
import {
  GraduationCap,
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  Calculator,
  BookOpen
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface SignUpPageProps {
  navigate: (route: string) => void;
}

export const SignUpPage: React.FC<SignUpPageProps> = ({ navigate }) => {
  const { signUpEmail, signInGoogle, signInAsGuest, intendedDestination, setIntendedDestination } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [unauthorizedDomain, setUnauthorizedDomain] = useState<string | null>(null);
  const [domainCopied, setDomainCopied] = useState(false);

  const onSuccess = () => {
    const dest = intendedDestination || 'dashboard';
    setIntendedDestination(null);
    navigate(dest);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setUnauthorizedDomain(null);

    if (!name.trim()) {
      setError('Please provide your full name.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      await signUpEmail(email, password, name);
      onSuccess();
    } catch (err: any) {
      console.error('Sign up error:', err);
      if (err.code === 'auth/email-already-in-use') {
        setError('An account with this email already exists. Please sign in instead.');
      } else {
        setError(err.message || 'Could not create account.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setError(null);
    setUnauthorizedDomain(null);
    setLoading(true);
    try {
      await signInGoogle();
      onSuccess();
    } catch (err: any) {
      console.error('Google sign in error:', err);
      if (err.code === 'auth/unauthorized-domain') {
        setUnauthorizedDomain(window.location.hostname);
      } else if (err.code !== 'auth/popup-closed-by-user') {
        setError(err.message || 'Google sign-in could not be completed.');
      }
    } finally {
      setLoading(false);
    }
  };

  const copyDomain = () => {
    if (unauthorizedDomain) {
      navigator.clipboard.writeText(unauthorizedDomain);
      setDomainCopied(true);
      setTimeout(() => setDomainCopied(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF8F4] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 selection:bg-[#8B7CF6]/20">
      <div className="max-w-4xl w-full grid grid-cols-1 lg:grid-cols-12 bg-white rounded-3xl shadow-xl border border-[#EBE6DF] overflow-hidden">
        {/* Left Col: Branded Value Proposition */}
        <div className="lg:col-span-5 bg-gradient-to-br from-[#6654D9] via-[#7B68EE] to-[#8B7CF6] p-8 sm:p-10 text-white flex flex-col justify-between relative overflow-hidden">
          <div className="relative z-10">
            <button
              onClick={() => navigate('landing')}
              className="inline-flex items-center gap-2.5 mb-8 group"
            >
              <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white">
                <GraduationCap className="w-5 h-5" />
              </div>
              <span className="font-heading font-extrabold text-xl tracking-tight text-white">
                LumiLearn AI
              </span>
            </button>

            <h3 className="text-2xl sm:text-3xl font-extrabold leading-tight">
              Create your personal learning space.
            </h3>
            <p className="mt-3 text-sm text-white/85 leading-relaxed">
              Turn messy lecture slides, dense textbooks, and audio notes into structured knowledge
              you can actually remember.
            </p>
          </div>

          <div className="relative z-10 pt-8 space-y-3">
            <div className="flex items-center gap-2.5 text-xs text-white/90">
              <CheckCircle2 className="w-4 h-4 text-[#BFE8D5]" />
              <span>KaTeX rendered formulas with worked steps</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs text-white/90">
              <CheckCircle2 className="w-4 h-4 text-[#BFE8D5]" />
              <span>Interactive flashcard decks & quizzes</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs text-white/90">
              <CheckCircle2 className="w-4 h-4 text-[#BFE8D5]" />
              <span>Personal AI study companion & tutor</span>
            </div>
          </div>
        </div>

        {/* Right Col: Sign Up Form */}
        <div className="lg:col-span-7 p-8 sm:p-10 flex flex-col justify-center">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-[#27223B]">Get started free</h2>
            <p className="text-xs text-[#6E6685] mt-1">
              Start transforming your study materials in seconds.
            </p>
          </div>

          {unauthorizedDomain && (
            <div className="mb-5 p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-3 animate-in fade-in">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
                <div>
                  <strong className="block font-bold text-amber-950">
                    Domain Authorization Required in Firebase
                  </strong>
                  <p className="mt-1 text-[11px] text-amber-800 leading-relaxed">
                    Google Sign-In requires your current Cloud Run hostname to be whitelisted in
                    your Firebase project.
                  </p>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-white border border-amber-200 flex items-center justify-between gap-2">
                <code className="font-mono text-[11px] text-[#27223B] truncate select-all">
                  {unauthorizedDomain}
                </code>
                <button
                  type="button"
                  onClick={copyDomain}
                  className="px-2.5 py-1 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold text-[10px] shrink-0 transition-colors"
                >
                  {domainCopied ? 'Copied!' : 'Copy Domain'}
                </button>
              </div>

              <div className="text-[11px] text-amber-800 space-y-1">
                <p>
                  <strong>How to add it:</strong>
                </p>
                <ol className="list-decimal list-inside pl-1 space-y-0.5 text-[10px]">
                  <li>Open Firebase Console → Select <code>my-projects-60959</code></li>
                  <li>Go to <strong>Authentication</strong> → <strong>Settings</strong> tab</li>
                  <li>Click <strong>Authorized Domains</strong> → <strong>Add domain</strong></li>
                  <li>Paste the copied domain and click Save.</li>
                </ol>
              </div>

              <div className="pt-1 border-t border-amber-200 flex items-center justify-between">
                <span className="text-[11px] text-amber-900 font-medium">Or explore immediately:</span>
                <button
                  type="button"
                  onClick={() => {
                    signInAsGuest();
                    onSuccess();
                  }}
                  className="px-3 py-1.5 rounded-xl bg-[#6654D9] text-white font-bold text-xs hover:bg-[#5844CA] transition-colors shadow-2xs"
                >
                  Continue as Guest Student →
                </button>
              </div>
            </div>
          )}

          {error && (
            <div className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Google Button */}
          <button
            onClick={handleGoogle}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl border border-[#EBE6DF] bg-white hover:bg-[#FAF8F4] text-[#27223B] text-xs font-semibold shadow-2xs transition-all disabled:opacity-50"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Sign up with Google</span>
          </button>

          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#EBE6DF]" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-3 bg-white text-[#9D96B0]">or sign up with email</span>
            </div>
          </div>

          <form onSubmit={handleSignUp} className="space-y-3.5">
            <div>
              <label className="block text-xs font-semibold text-[#27223B] mb-1">
                Full Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-[#9D96B0] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Shahmir Khan"
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#EBE6DF] bg-[#FAF8F4] text-xs text-[#27223B] placeholder-[#9D96B0] focus:outline-hidden focus:border-[#8B7CF6] focus:bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#27223B] mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#9D96B0] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="student@university.edu"
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#EBE6DF] bg-[#FAF8F4] text-xs text-[#27223B] placeholder-[#9D96B0] focus:outline-hidden focus:border-[#8B7CF6] focus:bg-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#27223B] mb-1">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#9D96B0] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min 6 chars"
                    required
                    className="w-full pl-10 pr-9 py-2.5 rounded-xl border border-[#EBE6DF] bg-[#FAF8F4] text-xs text-[#27223B] placeholder-[#9D96B0] focus:outline-hidden focus:border-[#8B7CF6] focus:bg-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9D96B0] hover:text-[#27223B]"
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#27223B] mb-1">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#9D96B0] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat password"
                    required
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#EBE6DF] bg-[#FAF8F4] text-xs text-[#27223B] placeholder-[#9D96B0] focus:outline-hidden focus:border-[#8B7CF6] focus:bg-white"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-4 py-3 px-4 rounded-xl bg-[#6654D9] hover:bg-[#5844CA] text-white text-xs font-bold shadow-md shadow-[#6654D9]/25 hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <span>Setting up workspace...</span>
              ) : (
                <>
                  <span>Create Account</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-5 text-center text-xs text-[#6E6685]">
            <span>Already have an account? </span>
            <button
              onClick={() => navigate('signin')}
              className="font-bold text-[#6654D9] hover:underline"
            >
              Sign In
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
