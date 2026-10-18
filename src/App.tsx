import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { WorkspaceLayout } from './components/layout/WorkspaceLayout';
import { LandingPage } from './pages/LandingPage';
import { SignInPage } from './pages/auth/SignInPage';
import { SignUpPage } from './pages/auth/SignUpPage';
import { DashboardPage } from './pages/DashboardPage';
import { CreateMaterialPage } from './pages/CreateMaterialPage';
import { NotesLibraryPage } from './pages/NotesLibraryPage';
import { NoteEditorPage } from './pages/NoteEditorPage';
import { QuizCenterPage } from './pages/QuizCenterPage';
import { QuizRunnerPage } from './pages/QuizRunnerPage';
import { FlashcardsPage } from './pages/FlashcardsPage';
import { AITutorPage } from './pages/AITutorPage';
import { TranslationPage } from './pages/TranslationPage';
import { StudyLibraryPage } from './pages/StudyLibraryPage';
import { SettingsPage } from './pages/SettingsPage';
import { RefreshCw } from 'lucide-react';

function AppContent() {
  const { currentUser, loading, intendedDestination, setIntendedDestination } = useAuth();
  const [currentRoute, setCurrentRoute] = useState<string>('landing');
  const [routeParams, setRouteParams] = useState<any>({});

  // Sync route with window hash on mount and popstate
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '') || 'landing';
      const [route, queryStr] = hash.split('?');
      const params: any = {};
      if (queryStr) {
        new URLSearchParams(queryStr).forEach((val, key) => {
          params[key] = val;
        });
      }
      setCurrentRoute(route);
      setRouteParams(params);
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navigate = (route: string, params: any = {}) => {
    setCurrentRoute(route);
    setRouteParams(params);
    let hash = `#${route}`;
    if (params && Object.keys(params).length > 0) {
      const qs = new URLSearchParams(params).toString();
      hash += `?${qs}`;
    }
    window.location.hash = hash;
    window.scrollTo(0, 0);
  };

  // Auth gate for protected workspace routes
  const protectedRoutes = [
    'dashboard',
    'create',
    'notes',
    'note-editor',
    'quizzes',
    'quiz-runner',
    'flashcards',
    'tutor',
    'translate',
    'library',
    'settings'
  ];

  // Preserve intended destination safely in useEffect
  useEffect(() => {
    if (!currentUser && protectedRoutes.includes(currentRoute)) {
      if (intendedDestination !== currentRoute) {
        setIntendedDestination(currentRoute);
      }
    }
  }, [currentUser, currentRoute, intendedDestination, setIntendedDestination]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF8F4] flex flex-col items-center justify-center space-y-3">
        <RefreshCw className="w-8 h-8 animate-spin text-[#6654D9]" />
        <span className="font-heading font-extrabold text-lg text-[#27223B]">
          Lumi<span className="text-[#6654D9]">Learn</span> AI
        </span>
      </div>
    );
  }

  // If user tries to access protected route without login, redirect to sign-in while preserving destination
  if (!currentUser && protectedRoutes.includes(currentRoute)) {
    return <SignInPage navigate={navigate} />;
  }

  // 1. Public Landing Page
  if (currentRoute === 'landing') {
    return <LandingPage navigate={navigate} />;
  }

  // 2. Auth Pages
  if (currentRoute === 'signin') {
    return <SignInPage navigate={navigate} />;
  }
  if (currentRoute === 'signup') {
    return <SignUpPage navigate={navigate} />;
  }

  // 3. Authenticated Workspace Pages wrapped in WorkspaceLayout
  const getPageTitle = (route: string) => {
    switch (route) {
      case 'dashboard':
        return 'Study Dashboard';
      case 'create':
        return 'Create Study Material';
      case 'notes':
        return 'My Notes Library';
      case 'note-editor':
        return 'Note Document';
      case 'quizzes':
        return 'Quiz Assessment Center';
      case 'quiz-runner':
        return 'Active Quiz Runner';
      case 'flashcards':
        return 'Spaced Repetition Flashcards';
      case 'tutor':
        return 'LumiLearn AI Tutor';
      case 'translate':
        return 'Translation Studio';
      case 'library':
        return 'Study Library';
      case 'settings':
        return 'Preferences & Settings';
      default:
        return 'Workspace';
    }
  };

  return (
    <WorkspaceLayout
      currentRoute={currentRoute}
      navigate={navigate}
      pageTitle={getPageTitle(currentRoute)}
    >
      {currentRoute === 'dashboard' && <DashboardPage navigate={navigate} />}
      {currentRoute === 'create' && (
        <CreateMaterialPage navigate={navigate} initialTab={routeParams.tab} />
      )}
      {currentRoute === 'notes' && (
        <NotesLibraryPage navigate={navigate} initialSearch={routeParams.search} />
      )}
      {currentRoute === 'note-editor' && (
        <NoteEditorPage noteId={routeParams.id} navigate={navigate} />
      )}
      {currentRoute === 'quizzes' && <QuizCenterPage navigate={navigate} />}
      {currentRoute === 'quiz-runner' && (
        <QuizRunnerPage quizId={routeParams.id} navigate={navigate} />
      )}
      {currentRoute === 'flashcards' && (
        <FlashcardsPage navigate={navigate} selectedDeckId={routeParams.deckId} />
      )}
      {currentRoute === 'tutor' && (
        <AITutorPage navigate={navigate} initialNoteId={routeParams.noteId} />
      )}
      {currentRoute === 'translate' && (
        <TranslationPage navigate={navigate} initialNoteId={routeParams.noteId} />
      )}
      {currentRoute === 'library' && <StudyLibraryPage navigate={navigate} />}
      {currentRoute === 'settings' && <SettingsPage navigate={navigate} />}
    </WorkspaceLayout>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
