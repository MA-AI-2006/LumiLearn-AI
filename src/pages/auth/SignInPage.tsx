import React, { useState } from 'react';
import {
  GraduationCap,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface SignInPageProps {
  navigate: (route: string) => void;
}

export const SignInPage: React.FC<SignInPageProps> = ({ navigate }) => {
  const {
    signInEmail,
    signInGoogle,
    signInAsGuest,
    resetPassword,
    intendedDestination,
    setIntendedDestination
  } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [unauthorizedDomain, setUnauthorizedDomain] = useState<string | null>(null);
  const [domainCopied, setDomainCopied] = useState(false);

  // Forgot password modal state
  const [forgotModalOpen, setForgotModalOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotStatus, setForgotStatus] = useState<string | null>(null);
  const [forgotLoading, setForgotLoading] = useState(false);

  const onSuccess = () => {
    const dest = intendedDestination || 'dashboard';
    setIntendedDestination(null);
    navigate(dest);
  };

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setUnauthorizedDomain(null);
    if (!email || !password) {
      setError('Please provide both your email and password.');
      return;
    }
    setLoading(true);
    try {
      await signInEmail(email, password);
      onSuccess();
    } catch (err: any) {
      console.error('Sign in error:', err);
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found') {
        setError('Invalid email or password. Please verify your credentials.');
      } else if (err.code === 'auth/too-many-requests') {
        setError('Too many failed attempts. Please try again shortly or reset your password.');
      } else {
        setError(err.message || 'Failed to sign in. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
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

  const handleGuestAccess = () => {
    signInAsGuest();
    onSuccess();
  };

  const copyDomain = () => {
    if (unauthorizedDomain) {
      navigator.clipboard.writeText(unauthorizedDomain);
      setDomainCopied(true);
      setTimeout(() => setDomainCopied(false), 2000);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail) return;
    setForgotLoading(true);
    setForgotStatus(null);
    try {
      await resetPassword(forgotEmail);
      setForgotStatus('Password reset link sent! Check your inbox.');
    } catch (err: any) {
      setForgotStatus('Error: ' + (err.message || 'Could not send reset email.'));
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF8F4] flex flex-col justify-center py-12 sm:px-6 lg:px-8 selection:bg-[#8B7CF6]/20">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <button
          onClick={() => navigate('landing')}
          className="inline-flex items-center gap-2.5 mb-4 group"
        >
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#8B7CF6] to-[#6654D9] flex items-center justify-center text-white shadow-md shadow-[#8B7CF6]/25 group-hover:scale-105 transition-transform">
            <GraduationCap className="w-6 h-6" />
          </div>
          <span className="font-heading font-extrabold text-2xl text-[#27223B]">
            Lumi<span className="text-[#6654D9]">Learn</span>
            <span className="text-xs font-bold uppercase tracking-wider text-[#8B7CF6] ml-1 px-1.5 py-0.5 rounded bg-[#8B7CF6]/10">
              AI
            </span>
          </span>
        </button>

        <h2 className="text-2xl sm:text-3xl font-extrabold text-[#27223B] tracking-tight">
          Welcome back.
        </h2>
        <p className="mt-1.5 text-xs sm:text-sm text-[#6E6685]">
          Pick up where your learning left off.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white py-8 px-6 sm:px-10 shadow-xl border border-[#EBE6DF] rounded-3xl">
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
                  onClick={handleGuestAccess}
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

          {/* Google Sign In */}
          <button
            onClick={handleGoogleSignIn}
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
            <span>Continue with Google</span>
          </button>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#EBE6DF]" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-3 bg-white text-[#9D96B0]">or sign in with email</span>
            </div>
          </div>

          {/* Email / Password Form */}
          <form onSubmit={handleEmailSignIn} className="space-y-4">
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
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#EBE6DF] bg-[#FAF8F4] text-xs text-[#27223B] placeholder-[#9D96B0] focus:outline-hidden focus:border-[#8B7CF6] focus:bg-white transition-colors"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-[#27223B]">Password</label>
                <button
                  type="button"
                  onClick={() => setForgotModalOpen(true)}
                  className="text-[11px] text-[#6654D9] hover:underline"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#9D96B0] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-[#EBE6DF] bg-[#FAF8F4] text-xs text-[#27223B] placeholder-[#9D96B0] focus:outline-hidden focus:border-[#8B7CF6] focus:bg-white transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#9D96B0] hover:text-[#27223B]"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 px-4 rounded-xl bg-[#6654D9] hover:bg-[#5844CA] text-white text-xs font-bold shadow-md shadow-[#6654D9]/25 hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <span>Signing in...</span>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-[#EBE6DF] text-center text-xs text-[#6E6685]">
            <span>Don't have an account? </span>
            <button
              onClick={() => navigate('signup')}
              className="font-bold text-[#6654D9] hover:underline"
            >
              Create Account
            </button>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {forgotModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-[#EBE6DF]">
            <h3 className="font-bold text-base text-[#27223B] mb-1">Reset Password</h3>
            <p className="text-xs text-[#6E6685] mb-4">
              Enter your email and we'll send you a link to reset your password.
            </p>

            {forgotStatus && (
              <div className="mb-4 p-3 rounded-xl bg-[#F0FBF5] text-xs text-[#1E5638] border border-[#BFE8D5]">
                {forgotStatus}
              </div>
            )}

            <form onSubmit={handleResetPassword} className="space-y-3">
              <input
                type="email"
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                placeholder="your-email@example.com"
                required
                className="w-full px-3.5 py-2 rounded-xl border border-[#EBE6DF] text-xs bg-[#FAF8F4]"
              />

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setForgotModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold text-[#6E6685] hover:bg-[#FAF8F4]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={forgotLoading}
                  className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-[#6654D9] text-white disabled:opacity-50"
                >
                  {forgotLoading ? 'Sending...' : 'Send Reset Link'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
