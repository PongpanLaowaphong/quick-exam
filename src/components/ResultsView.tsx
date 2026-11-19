import React, { useMemo, useState } from 'react';
import {
  CheckCircle2,
  XCircle,
  RotateCcw,
  Target,
  FolderOpen,
  Clock,
  Award,
  Shuffle,
  Info,
  MinusCircle,
} from 'lucide-react';
import type { ExamData, ExamQuestion } from '../types/exam';
import { formatTime, isAnswerCorrect } from '../utils/examHelpers';
import { RichText } from './RichText';

interface ResultsViewProps {
  exam: ExamData;
  answers: Record<number, string[]>;
  elapsedSeconds: number;
  isSubsetRetry: boolean;
  onRetryFull: (reshuffle: boolean) => void;
  onRetryIncorrect: (incorrectQuestions: ExamQuestion[]) => void;
  onLoadNew: () => void;
}

type FilterTab = 'all' | 'incorrect' | 'correct';

export const ResultsView: React.FC<ResultsViewProps> = ({
  exam,
  answers,
  elapsedSeconds,
  isSubsetRetry,
  onRetryFull,
  onRetryIncorrect,
  onLoadNew,
}) => {
  const [filter, setFilter] = useState<FilterTab>('all');
  const [reshuffleOnRetry, setReshuffleOnRetry] = useState(true);

  const gradedItems = useMemo(() => {
    return exam.questions.map((question, index) => {
      const selected = answers[index] ?? [];
      const isCorrect = isAnswerCorrect(selected, question.correctAnswers);
      const isSkipped = selected.length === 0;
      return { question, index, selected, isCorrect, isSkipped };
    });
  }, [exam.questions, answers]);

  const total = gradedItems.length;
  const correctCount = gradedItems.filter((item) => item.isCorrect).length;
  const skippedCount = gradedItems.filter((item) => item.isSkipped).length;
  const incorrectCount = total - correctCount;
  const percentage = total > 0 ? Math.round((correctCount / total) * 100) : 0;

  const incorrectQuestions = useMemo(
    () => gradedItems.filter((item) => !item.isCorrect).map((item) => item.question),
    [gradedItems]
  );

  const filteredItems = useMemo(() => {
    if (filter === 'correct') return gradedItems.filter((i) => i.isCorrect);
    if (filter === 'incorrect') return gradedItems.filter((i) => !i.isCorrect);
    return gradedItems;
  }, [filter, gradedItems]);

  // SVG Circular Progress Chart dimensions
  const radius = 56;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  const scoreTone =
    percentage >= 80
      ? {
          ring: 'stroke-emerald-500',
          text: 'text-emerald-600 dark:text-emerald-400',
          badge: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300',
          headline: 'Excellent Work!',
        }
      : percentage >= 50
        ? {
            ring: 'stroke-amber-500',
            text: 'text-amber-600 dark:text-amber-400',
            badge: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300',
            headline: 'Good Effort!',
          }
        : {
            ring: 'stroke-rose-500',
            text: 'text-rose-600 dark:text-rose-400',
            badge: 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300',
            headline: 'Keep Practicing!',
          };

  return (
    <div className="animate-fade-slide-in mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-10">
      {/* Score Overview Card */}
      <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-xs sm:p-8 dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-center sm:justify-between">
          {/* Circular Score Chart */}
          <div className="flex flex-col items-center gap-5 sm:flex-row">
            <div className="relative flex h-36 w-36 shrink-0 items-center justify-center">
              <svg className="h-full w-full -rotate-90" viewBox="0 0 132 132">
                <circle
                  cx="66"
                  cy="66"
                  r={radius}
                  fill="none"
                  strokeWidth="10"
                  className="stroke-slate-100 dark:stroke-slate-800"
                />
                <circle
                  cx="66"
                  cy="66"
                  r={radius}
                  fill="none"
                  strokeWidth="10"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  className={`transition-all duration-700 ease-out ${scoreTone.ring}`}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className={`text-3xl font-extrabold tracking-tight ${scoreTone.text}`}>
                  {percentage}%
                </span>
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  {correctCount} / {total}
                </span>
              </div>
            </div>

            <div className="text-center sm:text-left">
              <div className="mb-2 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold tracking-wide uppercase">
                <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 ${scoreTone.badge}`}>
                  <Award className="h-3.5 w-3.5" />
                  {scoreTone.headline}
                </span>
              </div>
              <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                {exam.title}
              </h1>
              {isSubsetRetry && (
                <p className="mt-1 text-xs font-medium text-amber-600 dark:text-amber-400">
                  Missed Questions Review Session
                </p>
              )}

              {/* Accuracy Breakdown */}
              <div className="mt-4 flex flex-wrap justify-center gap-2.5 sm:justify-start">
                <div className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/50 dark:text-emerald-300">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  {correctCount} Correct
                </div>
                <div className="inline-flex items-center gap-1.5 rounded-lg border border-rose-200 bg-rose-50 px-2.5 py-1 text-xs font-semibold text-rose-700 dark:border-rose-900/60 dark:bg-rose-950/50 dark:text-rose-300">
                  <XCircle className="h-3.5 w-3.5" />
                  {incorrectCount} Incorrect
                </div>
                {skippedCount > 0 && (
                  <div className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
                    <MinusCircle className="h-3.5 w-3.5" />
                    {skippedCount} Skipped
                  </div>
                )}
                <div className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 font-mono text-xs font-semibold text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
                  <Clock className="h-3.5 w-3.5" />
                  {formatTime(elapsedSeconds)}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Post-Exam Action Buttons */}
        <div className="mt-6 border-t border-slate-200 pt-5 dark:border-slate-800">
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
            <div className="flex flex-wrap gap-2.5">
              {incorrectQuestions.length > 0 && (
                <button
                  type="button"
                  onClick={() => onRetryIncorrect(incorrectQuestions)}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-xs transition hover:bg-indigo-500"
                >
                  <Target className="h-4 w-4" />
                  Retry Incorrect Only ({incorrectQuestions.length})
                </button>
              )}

              <button
                type="button"
                onClick={() => onRetryFull(reshuffleOnRetry)}
                className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
                  incorrectQuestions.length === 0
                    ? 'bg-indigo-600 text-white shadow-xs hover:bg-indigo-500'
                    : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                <RotateCcw className="h-4 w-4" />
                Retry Full Exam
              </button>

              <button
                type="button"
                onClick={onLoadNew}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
              >
                <FolderOpen className="h-4 w-4" />
                Load New Exam
              </button>
            </div>

            <label className="inline-flex cursor-pointer items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400">
              <input
                type="checkbox"
                checked={reshuffleOnRetry}
                onChange={(e) => setReshuffleOnRetry(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-indigo-600 accent-indigo-600"
              />
              <Shuffle className="h-3.5 w-3.5" />
              Reshuffle on retry
            </label>
          </div>
        </div>
      </div>

      {/* Detailed Answer Review Section */}
      <div className="mb-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">Detailed Answer Review</h2>

        {/* Filter Tabs */}
        <div className="inline-flex rounded-xl border border-slate-200 bg-white p-1 shadow-2xs dark:border-slate-800 dark:bg-slate-900">
          {(
            [
              { key: 'all', label: 'All Questions', count: total },
              { key: 'incorrect', label: 'Incorrect Only', count: incorrectCount },
              { key: 'correct', label: 'Correct Only', count: correctCount },
            ] as { key: FilterTab; label: string; count: number }[]
          ).map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setFilter(tab.key)}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                filter === tab.key
                  ? 'bg-indigo-600 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`rounded-md px-1.5 py-0.5 text-[10px] ${
                  filter === tab.key
                    ? 'bg-white/20 text-white'
                    : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Review Cards List */}
      {filteredItems.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center dark:border-slate-800 dark:bg-slate-900">
          <CheckCircle2 className="mx-auto mb-3 h-10 w-10 text-emerald-500" />
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            {filter === 'incorrect'
              ? 'No incorrect answers — you got a perfect score!'
              : 'No questions match this filter.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredItems.map(({ question, index, selected, isCorrect, isSkipped }) => (
            <div
              key={`${question.id}-${index}`}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs sm:p-6 dark:border-slate-800 dark:bg-slate-900"
            >
              {/* Card Header */}
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-slate-500 dark:text-slate-400">
                    Q{index + 1}
                  </span>
                  <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                    {question.correctAnswers.length > 1
                      ? `Multi-Select (${question.correctAnswers.length})`
                      : 'Single Choice'}
                  </span>
                </div>

                {isCorrect ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Correct
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 rounded-full bg-rose-100 px-2.5 py-0.5 text-xs font-bold text-rose-800 dark:bg-rose-950 dark:text-rose-300">
                    <XCircle className="h-3.5 w-3.5" />
                    {isSkipped ? 'Unanswered' : 'Incorrect'}
                  </span>
                )}
              </div>

              {/* Question Text */}
              <h3 className="mb-4 text-base leading-relaxed font-semibold text-slate-900 dark:text-white">
                <RichText text={question.question} />
              </h3>

              {/* Options */}
              <div className="space-y-2">
                {question.options.map((opt) => {
                  const userPicked = selected.includes(opt.id);
                  const isCorrectOpt = question.correctAnswers.includes(opt.id);

                  let optStyle =
                    'border-slate-200/80 bg-slate-50/40 text-slate-600 dark:border-slate-800 dark:bg-slate-950/30 dark:text-slate-400';

                  if (isCorrectOpt && userPicked) {
                    optStyle =
                      'border-emerald-500 bg-emerald-50/70 text-emerald-950 dark:border-emerald-600 dark:bg-emerald-950/35 dark:text-emerald-100';
                  } else if (isCorrectOpt && !userPicked) {
                    optStyle =
                      'border-emerald-400 border-dashed bg-emerald-50/40 text-emerald-950 dark:border-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-100';
                  } else if (!isCorrectOpt && userPicked) {
                    optStyle =
                      'border-rose-500 bg-rose-50/70 text-rose-950 dark:border-rose-600 dark:bg-rose-950/35 dark:text-rose-100';
                  }

                  return (
                    <div
                      key={opt.id}
                      className={`flex items-start justify-between gap-3 rounded-xl border px-3.5 py-2.5 text-sm ${optStyle}`}
                    >
                      <div className="flex items-start gap-2.5">
                        <span className="mt-0.5 font-mono text-xs font-bold">{opt.id}.</span>
                        <span className="leading-relaxed">
                          <RichText text={opt.text} />
                        </span>
                      </div>

                      <div className="flex shrink-0 items-center gap-1.5 text-[11px] font-bold">
                        {userPicked && isCorrectOpt && (
                          <span className="inline-flex items-center gap-1 text-emerald-700 dark:text-emerald-400">
                            <CheckCircle2 className="h-4 w-4" />
                            Your answer
                          </span>
                        )}
                        {userPicked && !isCorrectOpt && (
                          <span className="inline-flex items-center gap-1 text-rose-700 dark:text-rose-400">
                            <XCircle className="h-4 w-4" />
                            Your answer
                          </span>
                        )}
                        {!userPicked && isCorrectOpt && (
                          <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-emerald-800 dark:bg-emerald-900/70 dark:text-emerald-300">
                            Correct
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Explanation */}
              {question.explanation && (
                <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-indigo-100 bg-indigo-50/50 p-3.5 text-sm leading-relaxed text-slate-700 dark:border-indigo-900/40 dark:bg-indigo-950/30 dark:text-slate-300">
                  <Info className="mt-0.5 h-4 w-4 shrink-0 text-indigo-600 dark:text-indigo-400" />
                  <div>
                    <span className="font-semibold text-indigo-900 dark:text-indigo-200">
                      Explanation:{' '}
                    </span>
                    <RichText text={question.explanation} />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
