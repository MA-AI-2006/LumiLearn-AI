import React, { useEffect, useState } from 'react';
import {
  Settings,
  User,
  Languages,
  BookOpen,
  HelpCircle,
  Moon,
  Sun,
  Shield,
  Save,
  CheckCircle2,
  Database,
  Download,
  Upload,
  Copy
} from 'lucide-react';
import { storage } from '../services/storage';
import { UserPreferences, NoteDetailLevel, AcademicLevel } from '../types';
import { useAuth } from '../context/AuthContext';

interface SettingsPageProps {
  navigate: (route: string) => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({ navigate }) => {
  const { currentUser } = useAuth();
  const [copiedRules, setCopiedRules] = useState(false);
  const [copiedDomain, setCopiedDomain] = useState(false);
  const [prefs, setPrefs] = useState<UserPreferences>({
    displayName: 'Student',
    email: 'student@lumilearn.ai',
    preferredLanguage: 'English',
    preferredNoteDetail: 'detailed',
    preferredQuizDifficulty: 'intermediate',
    theme: 'light'
  });
  const [savedStatus, setSavedStatus] = useState(false);

  useEffect(() => {
    async function load() {
      const data = await storage.getPreferences();
      setPrefs({
        ...data,
        displayName: currentUser?.displayName || data.displayName,
        email: currentUser?.email || data.email
      });
    }
    load();
  }, [currentUser]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await storage.savePreferences(prefs);
    setSavedStatus(true);
    setTimeout(() => setSavedStatus(false), 2500);
  };

  const handleExportBackup = async () => {
    const [notes, sources, quizzes, decks] = await Promise.all([
      storage.getNotes(),
      storage.getSources(),
      storage.getQuizzes(),
      storage.getFlashcardDecks()
    ]);
    const backup = { notes, sources, quizzes, decks, exportDate: new Date().toISOString() };
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `lumilearn_backup_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in duration-200">
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-[#8B7CF6]">
          Preferences & Profile
        </span>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-[#27223B] tracking-tight mt-1">
          Settings
        </h2>
        <p className="text-xs sm:text-sm text-[#514963]">
          Configure your preferred academic output format, language defaults, and cloud storage.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* User Account Card */}
        <div className="bg-white rounded-3xl border border-[#EBE6DF] p-6 sm:p-8 shadow-xs space-y-4">
          <div className="flex items-center gap-3 pb-4 border-b border-[#EBE6DF]">
            <div className="w-10 h-10 rounded-xl bg-violet-100 text-[#6654D9] flex items-center justify-center">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-[#27223B]">Account Profile</h3>
              <p className="text-xs text-[#6E6685]">
                {currentUser ? 'Authenticated with Firebase' : 'Guest Account Mode'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#27223B] mb-1">
                Display Name
              </label>
              <input
                type="text"
                value={prefs.displayName}
                onChange={(e) => setPrefs({ ...prefs, displayName: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-[#EBE6DF] bg-[#FAF8F4] text-xs text-[#27223B]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#27223B] mb-1">
                Account Email
              </label>
              <input
                type="email"
                disabled
                value={prefs.email}
                className="w-full p-2.5 rounded-xl border border-[#EBE6DF] bg-[#FAF8F4] text-xs text-[#9D96B0] cursor-not-allowed"
              />
            </div>
          </div>
        </div>

        {/* Learning Preferences */}
        <div className="bg-white rounded-3xl border border-[#EBE6DF] p-6 sm:p-8 shadow-xs space-y-4">
          <div className="flex items-center gap-3 pb-4 border-b border-[#EBE6DF]">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-[#1E5638] flex items-center justify-center">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-[#27223B]">Learning Defaults</h3>
              <p className="text-xs text-[#6E6685]">Customize note detail and quiz difficulty</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#27223B] mb-1">
                Default Output Language
              </label>
              <select
                value={prefs.preferredLanguage}
                onChange={(e) => setPrefs({ ...prefs, preferredLanguage: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-[#EBE6DF] bg-[#FAF8F4] text-xs text-[#27223B]"
              >
                <option value="English">English</option>
                <option value="Urdu">Urdu (اردو)</option>
                <option value="Arabic">Arabic (العربية)</option>
                <option value="Spanish">Spanish (Español)</option>
                <option value="French">French (Français)</option>
                <option value="Hindi">Hindi (हिन्दी)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#27223B] mb-1">
                Default Note Detail
              </label>
              <select
                value={prefs.preferredNoteDetail}
                onChange={(e) =>
                  setPrefs({ ...prefs, preferredNoteDetail: e.target.value as NoteDetailLevel })
                }
                className="w-full p-2.5 rounded-xl border border-[#EBE6DF] bg-[#FAF8F4] text-xs text-[#27223B]"
              >
                <option value="quick">Quick Revision</option>
                <option value="standard">Standard Notes</option>
                <option value="detailed">Detailed Study Notes (Recommended)</option>
                <option value="comprehensive">Comprehensive Chapter</option>
              </select>
            </div>
          </div>
        </div>

        {/* Data Backup & Cloud Synchronization */}
        <div className="bg-white rounded-3xl border border-[#EBE6DF] p-6 sm:p-8 shadow-xs space-y-4">
          <div className="flex items-center gap-3 pb-4 border-b border-[#EBE6DF]">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-[#8B4513] flex items-center justify-center">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-[#27223B]">Data & Cloud Sync</h3>
              <p className="text-xs text-[#6E6685]">
                Export local backups or sync across devices via Firebase
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 rounded-2xl bg-[#FAF8F4] border border-[#EBE6DF]">
            <div>
              <span className="text-xs font-bold text-[#27223B]">Export Workspace Backup</span>
              <p className="text-[11px] text-[#6E6685]">Download all your notes, quizzes, and decks as JSON.</p>
            </div>
            <button
              type="button"
              onClick={handleExportBackup}
              className="px-4 py-2 rounded-xl bg-white border border-[#E2DCF7] text-[#6654D9] text-xs font-bold shadow-2xs hover:bg-[#FAF8FF] flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export JSON</span>
            </button>
          </div>

          {/* Firebase Cloud Sync & Security Rules Guide */}
          <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200/80 space-y-3">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-amber-700" />
                <span className="text-xs font-bold text-amber-900">Firebase Cloud Database Setup</span>
              </div>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-amber-200/60 text-amber-800">
                Project: my-projects-60959
              </span>
            </div>

            <p className="text-xs text-amber-800 leading-relaxed">
              To allow seamless cloud backup across devices and fix &quot;Missing or insufficient permissions&quot;, publish the user-scoped security rules in your Firebase Console:
            </p>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-amber-950">1. Firestore Security Rules</span>
                <button
                  type="button"
                  onClick={() => {
                    const rulesText = `rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      match /{subcollection}/{document=**} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
    }
    match /{document=**} {
      allow read, write: if false;
    }
  }
}`;
                    navigator.clipboard.writeText(rulesText);
                    setCopiedRules(true);
                    setTimeout(() => setCopiedRules(false), 2500);
                  }}
                  className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-900 transition-colors flex items-center gap-1"
                >
                  <Copy className="w-3 h-3" />
                  <span>{copiedRules ? 'Copied Rules!' : 'Copy Rules'}</span>
                </button>
              </div>

              <pre className="p-2.5 rounded-xl bg-amber-950 text-amber-100 text-[10px] font-mono overflow-x-auto leading-relaxed max-h-36">
{`rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      match /{subcollection}/{document=**} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
    }
    match /{document=**} {
      allow read, write: if false;
    }
  }
}`}
              </pre>

              <div className="flex items-center justify-between pt-1">
                <span className="text-[11px] font-bold text-amber-950">2. Authorized Domain for Sign-In</span>
                <button
                  type="button"
                  onClick={() => {
                    const domain = window.location.hostname;
                    navigator.clipboard.writeText(domain);
                    setCopiedDomain(true);
                    setTimeout(() => setCopiedDomain(false), 2500);
                  }}
                  className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-900 transition-colors flex items-center gap-1"
                >
                  <Copy className="w-3 h-3" />
                  <span>{copiedDomain ? 'Copied Domain!' : 'Copy Domain'}</span>
                </button>
              </div>
              <div className="p-2 rounded-lg bg-white border border-amber-200 font-mono text-[11px] text-amber-950 break-all select-all">
                {typeof window !== 'undefined' ? window.location.hostname : 'Current app domain'}
              </div>
            </div>
          </div>
        </div>

        {/* Save button and status */}
        <div className="flex items-center justify-between pt-2">
          {savedStatus ? (
            <span className="text-xs font-bold text-[#1E5638] flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-[#2E7D32]" />
              <span>Preferences saved successfully!</span>
            </span>
          ) : (
            <span />
          )}

          <button
            type="submit"
            className="px-6 py-3 rounded-2xl bg-[#6654D9] hover:bg-[#5844CA] text-white text-xs font-bold shadow-md shadow-[#6654D9]/25 hover:shadow-lg transition-all flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>Save Preferences</span>
          </button>
        </div>
      </form>
    </div>
  );
};
