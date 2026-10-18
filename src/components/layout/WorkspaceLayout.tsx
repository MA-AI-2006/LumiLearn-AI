import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { ContextTutorDrawer } from '../tutor/ContextTutorDrawer';
import { NoteDocument } from '../../types';
import { X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface WorkspaceLayoutProps {
  currentRoute: string;
  navigate: (route: string, params?: any) => void;
  pageTitle: string;
  children: React.ReactNode;
  activeDocument?: NoteDocument | null;
}

export const WorkspaceLayout: React.FC<WorkspaceLayoutProps> = ({
  currentRoute,
  navigate,
  pageTitle,
  children,
  activeDocument
}) => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [tutorDrawerOpen, setTutorDrawerOpen] = useState(false);
  const { guestMigrationCount, clearMigrationNotice } = useAuth();

  return (
    <div className="min-h-screen bg-[#FAF8F4] flex flex-col md:flex-row text-[#27223B]">
      {/* Desktop Persistent Sidebar */}
      <div className="hidden md:flex shrink-0">
        <Sidebar
          currentRoute={currentRoute}
          navigate={navigate}
          collapsed={collapsed}
          setCollapsed={setCollapsed}
        />
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative w-64 bg-white h-full shadow-2xl flex flex-col">
            <div className="p-4 border-b border-[#EBE6DF] flex items-center justify-between">
              <span className="font-heading font-extrabold text-lg text-[#27223B]">
                Lumi<span className="text-[#6654D9]">Learn</span> AI
              </span>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-1 rounded-lg text-[#6E6685] hover:bg-[#FAF8F4]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              <Sidebar
                currentRoute={currentRoute}
                navigate={(r) => {
                  setMobileMenuOpen(false);
                  navigate(r);
                }}
                collapsed={false}
                setCollapsed={() => {}}
              />
            </div>
          </div>
        </div>
      )}

      {/* Main Workspace Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen overflow-x-hidden">
        <TopBar
          pageTitle={pageTitle}
          navigate={navigate}
          onOpenMobileMenu={() => setMobileMenuOpen(true)}
          onOpenContextTutor={() => setTutorDrawerOpen(true)}
        />

        {/* Guest Migration Notification Banner */}
        {guestMigrationCount !== null && guestMigrationCount > 0 && (
          <div className="bg-[#BFE8D5]/40 border-b border-[#BFE8D5] px-6 py-2.5 text-xs text-[#1E5638] flex items-center justify-between animate-in fade-in">
            <span>
              🎉 <strong>Account Synchronized!</strong> We preserved and imported{' '}
              {guestMigrationCount} study materials from your previous session into your cloud profile.
            </span>
            <button
              onClick={clearMigrationNotice}
              className="text-[#1E5638] hover:underline font-semibold ml-4"
            >
              Dismiss
            </button>
          </div>
        )}

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>

      {/* Global Contextual AI Tutor Drawer */}
      <ContextTutorDrawer
        isOpen={tutorDrawerOpen}
        onClose={() => setTutorDrawerOpen(false)}
        activeDocument={activeDocument}
      />
    </div>
  );
};
