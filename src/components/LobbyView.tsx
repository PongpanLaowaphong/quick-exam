import React from 'react';
import {
  ArrowLeft,
  Play,
  Zap,
  ClipboardCheck,
  Shuffle,
  ListChecks,
  Timer,
  CircleDot,
  CheckSquare,
  FileText,
} from 'lucide-react';
import type { ExamConfig, ExamData, TimerMode } from '../types/exam';
import { getExamStats } from '../utils/examHelpers';

interface LobbyViewProps {
  exam: ExamData;
  config: ExamConfig;
  onChangeConfig: (next: ExamConfig) => void;
  onStartExam: () => void;
  onBack: () => void;
}

export const LobbyView: React.FC<LobbyViewProps> = ({
  exam,
  config,
  onChangeConfig,
  onStartExam,
  onBack,
}) => {
  const stats = getExamStats(exam);

  const updateConfig = <K extends keyof ExamConfig>(key: K, value: ExamConfig[K]) => {
    onChangeConfig({ ...config, [key]: value });
  };

  return (
    <div className="animate-fade-slide-in mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-10">
      <button
        type="button"
        onClick={onBack}
        className="mb-5 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 transition hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
      >
        <ArrowLeft className="h-4 w-4" />
        Load different exam
      </button>

      {/* Exam Summary Card */}
      <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <div className="mb-2 inline-flex items-center gap-1.5 rounded-lg bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-700 dark:bg-indigo-950/70 dark:text-indigo-300">
          <FileText className="h-3.5 w-3.5" />
          Exam Ready
        </div>
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          {exam.title}
        </h1>
        {exam.description && (
          <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
            {exam.description}
          </p>
        )}

        <div className="mt-5 flex flex-wrap gap-2.5">
          <div className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-semibold text-slate-700 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300">
            <ListChecks className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
            <span>{stats.total} Total Questions</span>
          </div>
          {stats.singleChoice > 0 && (
            <div className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-semibold text-slate-700 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300">
              <CircleDot className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              <span>{stats.singleChoice} Single Choice</span>
            </div>
          )}
          {stats.multiSelect > 0 && (
            <div className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-semibold text-slate-700 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300">
              <CheckSquare className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              <span>{stats.multiSelect} Multiple Choice</span>
            </div>
          )}
        </div>
      </div>

      {/* Configuration Card */}
      <div className="space-y-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
        {/* Feedback Mode */}
        <div>
          <h2 className="mb-3 text-sm font-bold tracking-wide text-slate-900 uppercase dark:text-white">
            Feedback Mode
          </h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => updateConfig('feedbackMode', 'instant')}
              className={`flex flex-col items-start rounded-xl border-2 p-4 text-left transition ${
                config.feedbackMode === 'instant'
                  ? 'border-indigo-600 bg-indigo-50/50 dark:border-indigo-500 dark:bg-indigo-950/30'
                  : 'border-slate-200 bg-white hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700'
              }`}
            >
              <div className="mb-2 flex w-full items-center justify-between">
                <div
                  className={`flex h-9 w-9 items-center justify-center rounded-lg ${
                    config.feedbackMode === 'instant'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                  }`}
                >
                  <Zap className="h-4.5 w-4.5" />
                </div>
                <span
                  className={`h-4 w-4 rounded-full border-2 ${
                    config.feedbackMode === 'instant'
                      ? 'border-indigo-600 bg-indigo-600 ring-4 ring-indigo-600/20'
                      : 'border-slate-300 dark:border-slate-600'
                  }`}
                />
              </div>
              <div className="text-sm font-bold text-slate-900 dark:text-white">
                Instant Feedback (Practice)
              </div>
              <p className="mt-1 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                Immediately reveals right/wrong answers and explanations after checking each question.
              </p>
            </button>

            <button
              type="button"
              onClick={() => updateConfig('feedbackMode', 'end')}
              className={`flex flex-col items-start rounded-xl border-2 p-4 text-left transition ${
                config.feedbackMode === 'end'
                  ? 'border-indigo-600 bg-indigo-50/50 dark:border-indigo-500 dark:bg-indigo-950/30'
                  : 'border-slate-200 bg-white hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700'
              }`}
            >
              <div className="mb-2 flex w-full items-center justify-between">
                <div
                  className={`flex h-9 w-9 items-center justify-center rounded-lg ${
                    config.feedbackMode === 'end'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                  }`}
                >
                  <ClipboardCheck className="h-4.5 w-4.5" />
                </div>
                <span
                  className={`h-4 w-4 rounded-full border-2 ${
                    config.feedbackMode === 'end'
                      ? 'border-indigo-600 bg-indigo-600 ring-4 ring-indigo-600/20'
                      : 'border-slate-300 dark:border-slate-600'
                  }`}
                />
              </div>
              <div className="text-sm font-bold text-slate-900 dark:text-white">
                End-of-Quiz (Exam Simulation)
              </div>
              <p className="mt-1 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                Hides results until submission. Navigate freely, flag questions, and review at the end.
              </p>
            </button>
          </div>
        </div>

        <hr className="border-slate-200 dark:border-slate-800" />

        {/* Enhancement Toggles */}
        <div className="space-y-4">
          <h2 className="text-sm font-bold tracking-wide text-slate-900 uppercase dark:text-white">
            Exam Options
          </h2>

          {/* Shuffle Questions */}
          <label className="flex cursor-pointer items-center justify-between gap-4 rounded-xl border border-slate-200 p-3.5 transition hover:bg-slate-50/80 dark:border-slate-800 dark:hover:bg-slate-800/40">
            <div className="flex items-center gap-3">
              <Shuffle className="h-4.5 w-4.5 text-slate-500 dark:text-slate-400" />
              <div>
                <div className="text-sm font-semibold text-slate-900 dark:text-white">
                  Shuffle Questions
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  Randomize the order of questions each attempt
                </div>
              </div>
            </div>
            <input
              type="checkbox"
              checked={config.shuffleQuestions}
              onChange={(e) => updateConfig('shuffleQuestions', e.target.checked)}
              className="h-4.5 w-4.5 rounded border-slate-300 text-indigo-600 accent-indigo-600 focus:ring-indigo-500"
            />
          </label>

          {/* Shuffle Options */}
          <label className="flex cursor-pointer items-center justify-between gap-4 rounded-xl border border-slate-200 p-3.5 transition hover:bg-slate-50/80 dark:border-slate-800 dark:hover:bg-slate-800/40">
            <div className="flex items-center gap-3">
              <ListChecks className="h-4.5 w-4.5 text-slate-500 dark:text-slate-400" />
              <div>
                <div className="text-sm font-semibold text-slate-900 dark:text-white">
                  Shuffle Options
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  Randomize answer choice order within every question
                </div>
              </div>
            </div>
            <input
              type="checkbox"
              checked={config.shuffleOptions}
              onChange={(e) => updateConfig('shuffleOptions', e.target.checked)}
              className="h-4.5 w-4.5 rounded border-slate-300 text-indigo-600 accent-indigo-600 focus:ring-indigo-500"
            />
          </label>

          {/* Timer Mode */}
          <div className="rounded-xl border border-slate-200 p-3.5 dark:border-slate-800">
            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
              <div className="flex items-center gap-3">
                <Timer className="h-4.5 w-4.5 text-slate-500 dark:text-slate-400" />
                <div>
                  <div className="text-sm font-semibold text-slate-900 dark:text-white">
                    Timer Mode
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    Track elapsed time or set a countdown limit
                  </div>
                </div>
              </div>

              <div className="inline-flex rounded-xl border border-slate-200 bg-slate-50 p-1 dark:border-slate-700 dark:bg-slate-950">
                {(
                  [
                    { value: 'none', label: 'Off' },
                    { value: 'stopwatch', label: 'Stopwatch' },
                    { value: 'countdown', label: 'Countdown' },
                  ] as { value: TimerMode; label: string }[]
                ).map((item) => (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => updateConfig('timerMode', item.value)}
                    className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                      config.timerMode === item.value
                        ? 'bg-indigo-600 text-white shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {config.timerMode === 'countdown' && (
              <div className="mt-3 flex items-center gap-3 border-t border-slate-100 pt-3 dark:border-slate-800">
                <label
                  htmlFor="countdown-minutes"
                  className="text-xs font-medium text-slate-600 dark:text-slate-400"
                >
                  Time limit (minutes):
                </label>
                <input
                  id="countdown-minutes"
                  type="number"
                  min={1}
                  max={300}
                  value={config.countdownMinutes}
                  onChange={(e) => {
                    const val = Math.max(1, Math.min(300, Number(e.target.value) || 1));
                    updateConfig('countdownMinutes', val);
                  }}
                  className="w-20 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-center font-mono text-sm font-semibold text-slate-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                />
                <span className="text-xs text-slate-400">
                  Auto-submits when time expires
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Start CTA */}
        <div className="pt-2">
          <button
            type="button"
            onClick={onStartExam}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-3.5 text-base font-bold text-white shadow-sm shadow-indigo-500/25 transition hover:bg-indigo-500 active:scale-[0.99]"
          >
            <Play className="h-5 w-5 fill-current" />
            Start Exam
          </button>
        </div>
      </div>
    </div>
  );
};
