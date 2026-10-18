import React, { useState } from 'react';
import {
  Search,
  Plus,
  Bell,
  Menu,
  FileText,
  HelpCircle,
  Layers,
  Bot,
  LogOut,
  User,
  Settings,
  Flame,
  CheckCircle2,
  X
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface TopBarProps {
  pageTitle: string;
  navigate: (route: string, params?: any) => void;
  onOpenMobileMenu: () => void;
  onOpenContextTutor: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  pageTitle,
  navigate,
  onOpenMobileMenu,
  onOpenContextTutor
}) => {
  const { currentUser, signOut } = useAuth();
  const [showQuickCreate, setShowQuickCreate] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const notifications = [
    {
      id: '1',
      title: 'Review Due: Microeconomics',
      time: '15m ago',
      desc: '3 flashcards in "Elasticity & Market Forces" are ready for spaced recall.'
    },
    {
      id: '2',
      title: 'Quiz Complete',
      time: '2h ago',
      desc: 'Scored 100% on Market Equilibrium & Elasticity Assessment!'
    }
  ];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate('notes', { search: searchQuery });
    }
  };

  return (
    <header className="h-16 bg-white/95 backdrop-blur-md border-b border-[#EBE6DF] px-4 md:px-6 flex items-center justify-between sticky top-0 z-20">
      {/* Left: Mobile Toggle & Breadcrumb */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileMenu}
          className="md:hidden p-2 rounded-lg text-[#6E6685] hover:bg-[#FAF8F4]"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2">
          <span className="text-xs uppercase tracking-wider font-semibold text-[#8B7CF6] hidden sm:inline">
            Workspace
          </span>
          <span className="text-xs text-[#6E6685] hidden sm:inline">/</span>
          <h1 className="text-base sm:text-lg font-bold text-[#27223B] tracking-tight">
            {pageTitle}
          </h1>
        </div>
      </div>

      {/* Center: Global Search */}
      <form
        onSubmit={handleSearchSubmit}
        className="hidden md:flex items-center flex-1 max-w-md mx-6"
      >
        <div className="relative w-full">
          <Search className="w-4 h-4 text-[#6E6685] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search notes, formulas, or quizzes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-[#FAF8F4] border border-[#EBE6DF] text-xs text-[#27223B] placeholder-[#9D96B0] focus:outline-hidden focus:border-[#8B7CF6] focus:bg-white transition-colors"
          />
        </div>
      </form>

      {/* Right: Actions, Streaks, Notifications, Profile */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Streak indicator */}
        <div
          className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#FFF8EB] border border-[#FFE1D2] text-xs font-semibold text-[#B35F1E]"
          title="Daily Study Streak: 4 days"
        >
          <Flame className="w-4 h-4 text-[#E65100]" />
          <span>4-Day Streak</span>
        </div>

        {/* Quick Create Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowQuickCreate(!showQuickCreate)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#6654D9] hover:bg-[#5844CA] text-white text-xs font-semibold shadow-sm shadow-[#6654D9]/25 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Create</span>
          </button>

          {showQuickCreate && (
            <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-xl border border-[#EBE6DF] p-2 z-50 animate-in fade-in zoom-in-95 duration-100">
              <button
                onClick={() => {
                  setShowQuickCreate(false);
                  navigate('create');
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-[#27223B] hover:bg-[#FAF8FF] hover:text-[#6654D9] rounded-xl text-left"
              >
                <FileText className="w-4 h-4 text-[#8B7CF6]" />
                <div>
                  <div className="font-semibold">Transform Material</div>
                  <div className="text-[10px] text-[#6E6685]">Import Doc, Video, Audio</div>
                </div>
              </button>

              <button
                onClick={() => {
                  setShowQuickCreate(false);
                  navigate('quizzes');
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-[#27223B] hover:bg-[#FAF8FF] hover:text-[#6654D9] rounded-xl text-left"
              >
                <HelpCircle className="w-4 h-4 text-[#8B7CF6]" />
                <div>
                  <div className="font-semibold">Create Quiz</div>
                  <div className="text-[10px] text-[#6E6685]">Interactive assessment</div>
                </div>
              </button>

              <button
                onClick={() => {
                  setShowQuickCreate(false);
                  navigate('flashcards');
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-[#27223B] hover:bg-[#FAF8FF] hover:text-[#6654D9] rounded-xl text-left"
              >
                <Layers className="w-4 h-4 text-[#8B7CF6]" />
                <div>
                  <div className="font-semibold">New Flashcards</div>
                  <div className="text-[10px] text-[#6E6685]">Spaced repetition deck</div>
                </div>
              </button>

              <button
                onClick={() => {
                  setShowQuickCreate(false);
                  navigate('tutor');
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-[#27223B] hover:bg-[#FAF8FF] hover:text-[#6654D9] rounded-xl text-left"
              >
                <Bot className="w-4 h-4 text-[#6654D9]" />
                <div>
                  <div className="font-semibold">Ask AI Tutor</div>
                  <div className="text-[10px] text-[#6E6685]">Step-by-step guidance</div>
                </div>
              </button>
            </div>
          )}
        </div>

        {/* Notifications Icon & Popover */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-xl text-[#6E6685] hover:text-[#27223B] hover:bg-[#FAF8F4] relative transition-colors"
            title="Notifications"
          >
            <Bell className="w-5 h-5" />
            <span className="w-2 h-2 rounded-full bg-[#6654D9] absolute top-2 right-2 ring-2 ring-white" />
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-[#EBE6DF] p-3 z-50">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#EBE6DF]">
                <span className="font-bold text-xs text-[#27223B]">Study Notifications</span>
                <button
                  onClick={() => setShowNotifications(false)}
                  className="text-[#6E6685] hover:text-[#27223B]"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="space-y-2">
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    className="p-2.5 rounded-xl bg-[#FAF8F4] hover:bg-[#FAF8FF] border border-[#EBE6DF] text-xs transition-colors"
                  >
                    <div className="flex items-center justify-between font-semibold text-[#27223B]">
                      <span>{n.title}</span>
                      <span className="text-[10px] text-[#6E6685] font-normal">{n.time}</span>
                    </div>
                    <p className="text-[11px] text-[#514963] mt-0.5">{n.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* User Profile Menu */}
        <div className="relative">
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-[#FAF8F4] transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#8B7CF6] to-[#BFE8D5] flex items-center justify-center font-bold text-xs text-[#27223B] shadow-2xs">
              {currentUser?.displayName
                ? currentUser.displayName.slice(0, 2).toUpperCase()
                : currentUser?.email
                ? currentUser.email.slice(0, 2).toUpperCase()
                : 'ST'}
            </div>
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-[#EBE6DF] p-2 z-50">
              <div className="p-2.5 border-b border-[#EBE6DF]">
                <p className="text-xs font-bold text-[#27223B] truncate">
                  {currentUser?.displayName || 'Registered Student'}
                </p>
                <p className="text-[11px] text-[#6E6685] truncate">
                  {currentUser?.email || 'mshahmir0726@gmail.com'}
                </p>
                <div className="flex items-center gap-1 mt-1 text-[10px] text-[#1E5638] font-medium bg-[#BFE8D5]/30 px-2 py-0.5 rounded-full w-fit">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Firebase Synced</span>
                </div>
              </div>

              <div className="py-1">
                <button
                  onClick={() => {
                    setShowProfileMenu(false);
                    navigate('settings');
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-[#27223B] hover:bg-[#FAF8F4] rounded-xl text-left"
                >
                  <Settings className="w-4 h-4 text-[#6E6685]" />
                  <span>Settings & Preferences</span>
                </button>

                <button
                  onClick={async () => {
                    setShowProfileMenu(false);
                    await signOut();
                    navigate('landing');
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 rounded-xl text-left"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
