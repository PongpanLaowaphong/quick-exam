import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Navbar } from './components/Navbar';
import { HomeView } from './components/HomeView';
import { LobbyView } from './components/LobbyView';
import { ExamView } from './components/ExamView';
import { ResultsView } from './components/ResultsView';
import { AiPromptModal } from './components/AiPromptModal';
import { Toast, type ToastMessage } from './components/Toast';
import { SAMPLE_EXAM } from './data/sampleExam';
import type {
  AppView,
  ExamConfig,
  ExamData,
  ExamQuestion,
  PersistedSession,
} from './types/exam';
import { prepareActiveExam } from './utils/examHelpers';

const SESSION_STORAGE_KEY = 'quick-exam-session-v1';
const THEME_STORAGE_KEY = 'quick-exam-theme';

const DEFAULT_CONFIG: ExamConfig = {
  feedbackMode: 'instant',
  shuffleQuestions: false,
  shuffleOptions: false,
  timerMode: 'stopwatch',
  countdownMinutes: 15,
};

function loadSavedSession(): PersistedSession | null {
  try {
    const raw = localStorage.getItem(SESSION_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PersistedSession;
    if (!parsed || typeof parsed !== 'object') return null;
    return parsed;
  } catch {
    return null;
  }
}

export const App: React.FC = () => {
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    if (typeof document !== 'undefined') {
      return document.documentElement.classList.contains('dark');
    }
    return false;
  });

  const initialSession = useRef<PersistedSession | null>(loadSavedSession());

  const [view, setView] = useState<AppView>(() => {
    const saved = initialSession.current;
    if (saved && saved.activeExam && (saved.view === 'exam' || saved.view === 'results')) {
      return saved.view;
    }
    if (saved && saved.rawExam && saved.view === 'lobby') {
      return 'lobby';
    }
    return 'home';
  });

  const [rawExam, setRawExam] = useState<ExamData | null>(
    () => initialSession.current?.rawExam ?? null
  );
  const [activeExam, setActiveExam] = useState<ExamData | null>(
    () => initialSession.current?.activeExam ?? null
  );
  const [config, setConfig] = useState<ExamConfig>(
    () => initialSession.current?.config ?? DEFAULT_CONFIG
  );
  const [currentIndex, setCurrentIndex] = useState<number>(
    () => initialSession.current?.currentIndex ?? 0
  );
  const [answers, setAnswers] = useState<Record<number, string[]>>(
    () => initialSession.current?.answers ?? {}
  );
  const [checkedQuestions, setCheckedQuestions] = useState<Record<number, boolean>>(
    () => initialSession.current?.checkedQuestions ?? {}
  );
  const [flaggedQuestions, setFlaggedQuestions] = useState<Record<number, boolean>>(
    () => initialSession.current?.flaggedQuestions ?? {}
  );
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(
    () => initialSession.current?.elapsedSeconds ?? 0
  );
  const [isSubsetRetry, setIsSubsetRetry] = useState<boolean>(
    () => initialSession.current?.isSubsetRetry ?? false
  );

  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const toastTimeoutRef = useRef<number | null>(null);

  const showToast = useCallback((type: ToastMessage['type'], message: string) => {
    if (toastTimeoutRef.current) {
      window.clearTimeout(toastTimeoutRef.current);
    }
    setToast({ id: Date.now(), type, message });
    toastTimeoutRef.current = window.setTimeout(() => {
      setToast(null);
    }, 3500);
  }, []);

  // Sync dark mode class and persist preference
  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, darkMode ? 'dark' : 'light');
    } catch {
      // ignore storage quota errors
    }
  }, [darkMode]);

  // Persist session state to localStorage
  useEffect(() => {
    try {
      const payload: PersistedSession = {
        view,
        rawExam,
        activeExam,
        config,
        currentIndex,
        answers,
        checkedQuestions,
        flaggedQuestions,
        elapsedSeconds,
        isSubsetRetry,
      };
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(payload));
    } catch {
      // ignore storage quota errors
    }
  }, [
    view,
    rawExam,
    activeExam,
    config,
    currentIndex,
    answers,
    checkedQuestions,
    flaggedQuestions,
    elapsedSeconds,
    isSubsetRetry,
  ]);

  // Timer tick while exam is active
  useEffect(() => {
    if (view !== 'exam') return;

    const interval = window.setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);

    return () => window.clearInterval(interval);
  }, [view]);

  // Auto-submit on countdown expiry
  useEffect(() => {
    if (view !== 'exam' || config.timerMode !== 'countdown') return;
    const limitSeconds = config.countdownMinutes * 60;
    if (elapsedSeconds >= limitSeconds) {
      setView('results');
      showToast('info', "Time's up! Your exam has been automatically submitted.");
    }
  }, [view, config.timerMode, config.countdownMinutes, elapsedSeconds, showToast]);

  const handleExamLoaded = (exam: ExamData, sourceLabel?: string) => {
    setRawExam(exam);
    setActiveExam(null);
    setAnswers({});
    setCheckedQuestions({});
    setFlaggedQuestions({});
    setCurrentIndex(0);
    setElapsedSeconds(0);
    setIsSubsetRetry(false);
    setConfig((prev) => ({
      ...prev,
      countdownMinutes: Math.max(5, Math.min(180, exam.questions.length * 2)),
    }));
    setView('lobby');
    if (sourceLabel) {
      showToast('success', sourceLabel);
    }
  };

  const handleTrySample = () => {
    handleExamLoaded(SAMPLE_EXAM, `Loaded sample exam (${SAMPLE_EXAM.questions.length} questions)`);
  };

  const startSessionWithExam = (sourceExam: ExamData, nextConfig: ExamConfig, subset: boolean) => {
    const prepared = prepareActiveExam(sourceExam, nextConfig);
    setActiveExam(prepared);
    setConfig(nextConfig);
    setCurrentIndex(0);
    setAnswers({});
    setCheckedQuestions({});
    setFlaggedQuestions({});
    setElapsedSeconds(0);
    setIsSubsetRetry(subset);
    setView('exam');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleStartExam = () => {
    if (!rawExam) return;
    startSessionWithExam(rawExam, config, false);
  };

  const handleSelectAnswer = (questionIndex: number, optionId: string, isMulti: boolean) => {
    setAnswers((prev) => {
      const current = prev[questionIndex] ?? [];
      if (!isMulti) {
        return { ...prev, [questionIndex]: [optionId] };
      }
      const exists = current.includes(optionId);
      const next = exists ? current.filter((id) => id !== optionId) : [...current, optionId];
      return { ...prev, [questionIndex]: next };
    });
  };

  const handleCheckAnswer = (questionIndex: number) => {
    setCheckedQuestions((prev) => ({ ...prev, [questionIndex]: true }));
  };

  const handleToggleFlag = (questionIndex: number) => {
    setFlaggedQuestions((prev) => ({ ...prev, [questionIndex]: !prev[questionIndex] }));
  };

  const handleNavigate = (nextIndex: number) => {
    if (!activeExam) return;
    const bounded = Math.max(0, Math.min(activeExam.questions.length - 1, nextIndex));
    setCurrentIndex(bounded);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmitExam = () => {
    setView('results');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleRetryFull = (reshuffle: boolean) => {
    const base = rawExam ?? activeExam;
    if (!base) return;
    const nextConfig: ExamConfig = {
      ...config,
      shuffleQuestions: reshuffle ? true : config.shuffleQuestions,
      shuffleOptions: reshuffle ? true : config.shuffleOptions,
    };
    startSessionWithExam(base, nextConfig, false);
    showToast('info', 'Started a fresh full exam attempt.');
  };

  const handleRetryIncorrect = (incorrectQuestions: ExamQuestion[]) => {
    const base = rawExam ?? activeExam;
    if (!base || incorrectQuestions.length === 0) return;
    const subsetExam: ExamData = {
      title: base.title,
      description: base.description,
      questions: incorrectQuestions,
    };
    startSessionWithExam(subsetExam, config, true);
    showToast(
      'info',
      `Reviewing ${incorrectQuestions.length} missed question${
        incorrectQuestions.length === 1 ? '' : 's'
      }.`
    );
  };

  const handleLoadNew = () => {
    setRawExam(null);
    setActiveExam(null);
    setAnswers({});
    setCheckedQuestions({});
    setFlaggedQuestions({});
    setCurrentIndex(0);
    setElapsedSeconds(0);
    setIsSubsetRetry(false);
    setView('home');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLogoClick = () => {
    setView('home');
  };

  const hasResumeSession = view === 'home' && activeExam !== null;

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900 transition-colors dark:bg-slate-950 dark:text-slate-100">
      <Navbar
        darkMode={darkMode}
        onToggleDarkMode={() => setDarkMode((d) => !d)}
        onOpenAiModal={() => setIsAiModalOpen(true)}
        onLogoClick={handleLogoClick}
        examTitle={
          view !== 'home' ? (activeExam?.title ?? rawExam?.title) : undefined
        }
      />

      <main className="flex-1">
        {view === 'home' && (
          <HomeView
            onExamLoaded={handleExamLoaded}
            onTrySample={handleTrySample}
            onOpenAiModal={() => setIsAiModalOpen(true)}
            onShowToast={showToast}
            hasResumeSession={hasResumeSession}
            resumeTitle={activeExam?.title}
            onResumeSession={() => setView('exam')}
          />
        )}

        {view === 'lobby' && rawExam && (
          <LobbyView
            exam={rawExam}
            config={config}
            onChangeConfig={setConfig}
            onStartExam={handleStartExam}
            onBack={handleLoadNew}
          />
        )}

        {view === 'exam' && activeExam && (
          <ExamView
            exam={activeExam}
            config={config}
            currentIndex={currentIndex}
            answers={answers}
            checkedQuestions={checkedQuestions}
            flaggedQuestions={flaggedQuestions}
            elapsedSeconds={elapsedSeconds}
            isSubsetRetry={isSubsetRetry}
            onSelectAnswer={handleSelectAnswer}
            onCheckAnswer={handleCheckAnswer}
            onToggleFlag={handleToggleFlag}
            onNavigate={handleNavigate}
            onSubmitExam={handleSubmitExam}
          />
        )}

        {view === 'results' && activeExam && (
          <ResultsView
            exam={activeExam}
            answers={answers}
            elapsedSeconds={elapsedSeconds}
            isSubsetRetry={isSubsetRetry}
            onRetryFull={handleRetryFull}
            onRetryIncorrect={handleRetryIncorrect}
            onLoadNew={handleLoadNew}
          />
        )}
      </main>

      <AiPromptModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        onCopied={() => showToast('success', 'AI prompt copied to clipboard!')}
      />

      <Toast toast={toast} onDismiss={() => setToast(null)} />
    </div>
  );
};

export default App;
