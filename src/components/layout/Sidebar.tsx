import React from 'react';
import {
  BookOpen,
  LayoutDashboard,
  PlusCircle,
  FileText,
  HelpCircle,
  Layers,
  Bot,
  Languages,
  Library,
  Settings,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  GraduationCap
} from 'lucide-react';

interface SidebarProps {
  currentRoute: string;
  navigate: (route: string) => void;
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  onOpenContextTutor?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentRoute,
  navigate,
  collapsed,
  setCollapsed
}) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'create', label: 'Create Material', icon: PlusCircle, badge: 'New' },
    { id: 'notes', label: 'My Notes', icon: FileText },
    { id: 'quizzes', label: 'Quiz Center', icon: HelpCircle },
    { id: 'flashcards', label: 'Flashcards', icon: Layers },
    { id: 'tutor', label: 'AI Tutor', icon: Bot, highlight: true },
    { id: 'translate', label: 'Translate', icon: Languages },
    { id: 'library', label: 'Study Library', icon: Library },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  return (
    <aside
      className={`bg-white border-r border-[#EBE6DF] flex flex-col transition-all duration-300 z-30 select-none ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div className="h-16 px-4 flex items-center justify-between border-b border-[#EBE6DF]">
        <button
          onClick={() => navigate('dashboard')}
          className="flex items-center gap-3 text-left overflow-hidden group focus:outline-hidden"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#8B7CF6] to-[#6654D9] flex items-center justify-center text-white shadow-md shadow-[#8B7CF6]/25 shrink-0 group-hover:scale-105 transition-transform">
            <GraduationCap className="w-5 h-5" />
          </div>
          {!collapsed && (
            <div className="truncate">
              <span className="font-heading font-extrabold text-lg tracking-tight text-[#27223B]">
                Lumi<span className="text-[#6654D9]">Learn</span>
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#8B7CF6] ml-1 px-1.5 py-0.5 rounded bg-[#8B7CF6]/10">
                AI
              </span>
            </div>
          )}
        </button>

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 rounded-lg text-[#6E6685] hover:text-[#27223B] hover:bg-[#FAF8F4] transition-colors"
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation List */}
      <div className="flex-1 py-4 px-3 space-y-1.5 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentRoute === item.id;
          return (
            <button
              key={item.id}
              onClick={() => navigate(item.id)}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all group relative ${
                isActive
                  ? 'bg-[#6654D9] text-white shadow-sm shadow-[#6654D9]/30'
                  : item.highlight
                  ? 'text-[#6654D9] bg-[#8B7CF6]/10 hover:bg-[#8B7CF6]/20 font-semibold'
                  : 'text-[#514963] hover:text-[#27223B] hover:bg-[#FAF8F4]'
              }`}
              title={collapsed ? item.label : undefined}
            >
              <Icon
                className={`w-5 h-5 shrink-0 transition-transform group-hover:scale-110 ${
                  isActive ? 'text-white' : item.highlight ? 'text-[#6654D9]' : 'text-[#6E6685]'
                }`}
              />

              {!collapsed && (
                <span className="truncate flex-1 text-left">{item.label}</span>
              )}

              {!collapsed && item.badge && !isActive && (
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-[#BFE8D5] text-[#1E5638]">
                  {item.badge}
                </span>
              )}

              {!collapsed && item.highlight && !isActive && (
                <Sparkles className="w-3.5 h-3.5 text-[#6654D9] shrink-0" />
              )}
            </button>
          );
        })}
      </div>

      {/* Bottom Study Tip Card */}
      {!collapsed ? (
        <div className="p-3 m-3 rounded-2xl bg-gradient-to-br from-[#FAF8FF] to-[#F3EFFF] border border-[#E2DCF7] text-xs">
          <div className="flex items-center gap-1.5 text-[#6654D9] font-semibold mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Smart Study Insight</span>
          </div>
          <p className="text-[#514963] text-[11px] leading-relaxed">
            Spaced repetition with formula breakdowns boosts retention by 64% over cramming.
          </p>
        </div>
      ) : (
        <div className="p-2 flex justify-center border-t border-[#EBE6DF]">
          <div
            className="w-8 h-8 rounded-full bg-[#8B7CF6]/15 text-[#6654D9] flex items-center justify-center cursor-help"
            title="Spaced repetition active"
          >
            <Sparkles className="w-4 h-4" />
          </div>
        </div>
      )}
    </aside>
  );
};
