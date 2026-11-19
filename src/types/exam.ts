export interface ExamOption {
  id: string;
  text: string;
}

export interface ExamQuestion {
  id: string | number;
  question: string;
  options: ExamOption[];
  correctAnswers: string[];
  explanation?: string;
}

export interface ExamData {
  title: string;
  description?: string;
  questions: ExamQuestion[];
}

export type FeedbackMode = 'instant' | 'end';

export type TimerMode = 'none' | 'stopwatch' | 'countdown';

export interface ExamConfig {
  feedbackMode: FeedbackMode;
  shuffleQuestions: boolean;
  shuffleOptions: boolean;
  timerMode: TimerMode;
  countdownMinutes: number;
}

export type AppView = 'home' | 'lobby' | 'exam' | 'results';

export interface PersistedSession {
  view: AppView;
  rawExam: ExamData | null;
  activeExam: ExamData | null;
  config: ExamConfig;
  currentIndex: number;
  answers: Record<number, string[]>;
  checkedQuestions: Record<number, boolean>;
  flaggedQuestions: Record<number, boolean>;
  elapsedSeconds: number;
  isSubsetRetry: boolean;
}
