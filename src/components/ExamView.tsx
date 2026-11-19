import React, { useEffect, useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Flag,
  LayoutGrid,
  CheckCircle2,
  XCircle,
  Clock,
  Check,
  Send,
  Keyboard,
  AlertCircle,
  X,
  Info,
} from 'lucide-react';
import type { ExamConfig, ExamData } from '../types/exam';
import { formatTime, isAnswerCorrect } from '../utils/examHelpers';
import { RichText } from './RichText';

interface ExamViewProps {
  exam: ExamData;
  config: ExamConfig;
  currentIndex: number;
  answers: Record<number, string[]>;
  checkedQuestions: Record<number, boolean>;
  flaggedQuestions: Record<number, boolean>;
  elapsedSeconds: number;
  isSubsetRetry: boolean;
  onSelectAnswer: (questionIndex: number, optionId: string, isMulti: boolean) => void;
  onCheckAnswer: (questionIndex: number) => void;
  onToggleFlag: (questionIndex: number) => void;
  onNavigate: (nextIndex: number) => void;
  onSubmitExam: () => void;
}

export const ExamView: React.FC<ExamViewProps> = ({
  exam,
  config,
  currentIndex,
  answers,
  checkedQuestions,
  flaggedQuestions,
  elapsedSeconds,
  isSubsetRetry,
  onSelectAnswer,
  onCheckAnswer,
  onToggleFlag,
  onNavigate,
  onSubmitExam,
}) => {
  const [showNavigator, setShowNavigator] = useState(false);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);

  const totalQuestions = exam.questions.length;
  const currentQuestion = exam.questions[currentIndex];
  const isMulti = currentQuestion.correctAnswers.length > 1;
  const selectedIds = answers[currentIndex] ?? [];
  const isChecked = config.feedbackMode === 'instant' && Boolean(checkedQuestions[currentIndex]);
  const isFlagged = Boolean(flaggedQuestions[currentIndex]);
  const isLast = currentIndex === totalQuestions - 1;
  const isFirst = currentIndex === 0;

  const answeredCount = exam.questions.reduce(
    (acc, _, idx) => acc + ((answers[idx]?.length ?? 0) > 0 ? 1 : 0),
    0
  );
  const flaggedCount = Object.values(flaggedQuestions).filter(Boolean).length;
  const unansweredCount = totalQuestions - answeredCount;

  const progressPercent =
    config.feedbackMode === 'instant'
      ? Math.round((Object.values(checkedQuestions).filter(Boolean).length / totalQuestions) * 100)
      : Math.round(((currentIndex + 1) / totalQuestions) * 100);

  // Timer calculation
  const totalCountdownSeconds = config.countdownMinutes * 60;
  const remainingSeconds = Math.max(0, totalCountdownSeconds - elapsedSeconds);
  const isLowTime = config.timerMode === 'countdown' && remainingSeconds <= 60;

  const handlePrimaryAction = () => {
    if (config.feedbackMode === 'instant') {
      if (!isChecked) {
        if (selectedIds.length > 0) {
          onCheckAnswer(currentIndex);
        }
      } else if (!isLast) {
        onNavigate(currentIndex + 1);
      } else {
        onSubmitExam();
      }
    } else {
      if (!isLast) {
        onNavigate(currentIndex + 1);
      } else {
        setShowSubmitConfirm(true);
      }
    }
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable)
      ) {
        return;
      }

      if (showSubmitConfirm) {
        if (e.key === 'Escape') setShowSubmitConfirm(false);
        return;
      }

      if (e.key === 'ArrowLeft') {
        if (!isFirst) {
          e.preventDefault();
          onNavigate(currentIndex - 1);
        }
        return;
      }

      if (e.key === 'ArrowRight') {
        if (!isLast) {
          e.preventDefault();
          onNavigate(currentIndex + 1);
        }
        return;
      }

      if (e.key === 'Enter') {
        if (config.feedbackMode === 'instant') {
          if (!isChecked && selectedIds.length > 0) {
            e.preventDefault();
            onCheckAnswer(currentIndex);
          } else if (isChecked) {
            e.preventDefault();
            if (!isLast) onNavigate(currentIndex + 1);
            else onSubmitExam();
          }
        } else {
          e.preventDefault();
          if (!isLast) onNavigate(currentIndex + 1);
          else setShowSubmitConfirm(true);
        }
        return;
      }

      if (
        (e.key === 'f' || e.key === 'F') &&
        config.feedbackMode === 'end' &&
        !e.ctrlKey &&
        !e.metaKey
      ) {
        e.preventDefault();
        onToggleFlag(currentIndex);
        return;
      }

      // Option selection via 1-9 or A-Z (disabled once checked in instant mode)
      if (!isChecked && !e.ctrlKey && !e.metaKey && !e.altKey) {
        if (/^[1-9]$/.test(e.key)) {
          const optIdx = Number(e.key) - 1;
          const opt = currentQuestion.options[optIdx];
          if (opt) {
            e.preventDefault();
            onSelectAnswer(currentIndex, opt.id, isMulti);
          }
          return;
        }
        if (/^[a-zA-Z]$/.test(e.key)) {
          const upper = e.key.toUpperCase();
          // First match by option id, fallback to positional letter A=0, B=1...
          const matchedById = currentQuestion.options.find(
            (o) => o.id.toUpperCase() === upper
          );
          if (matchedById) {
            e.preventDefault();
            onSelectAnswer(currentIndex, matchedById.id, isMulti);
          } else {
            const pos = upper.charCodeAt(0) - 65;
            const opt = currentQuestion.options[pos];
            if (opt) {
              e.preventDefault();
              onSelectAnswer(currentIndex, opt.id, isMulti);
            }
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    config.feedbackMode,
    currentIndex,
    currentQuestion.options,
    isChecked,
    isFirst,
    isLast,
    isMulti,
    onCheckAnswer,
    onNavigate,
    onSelectAnswer,
    onSubmitExam,
    onToggleFlag,
    selectedIds.length,
    showSubmitConfirm,
  ]);

  const currentIsCorrect = isChecked
    ? isAnswerCorrect(selectedIds, currentQuestion.correctAnswers)
    : false;

  return (
    <div className="mx-auto max-w-4xl px-4 pt-6 pb-28 sm:px-6 sm:pb-14">
      {/* Top Status & Progress Bar */}
      <div className="mb-5 rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs dark:border-slate-800 dark:bg-slate-900">
        <div className="mb-2.5 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <span className="text-sm font-bold text-slate-900 dark:text-white">
              Question {currentIndex + 1}{' '}
              <span className="font-normal text-slate-400">of {totalQuestions}</span>
            </span>
            {isSubsetRetry && (
              <span className="rounded-md bg-amber-100 px-2 py-0.5 text-[11px] font-semibold text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                Missed Questions Drill
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {config.timerMode !== 'none' && (
              <div
                className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 font-mono text-xs font-semibold ${
                  isLowTime
                    ? 'animate-pulse border-rose-300 bg-rose-50 text-rose-700 dark:border-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
                    : 'border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300'
                }`}
              >
                <Clock className="h-3.5 w-3.5" />
                {config.timerMode === 'countdown'
                  ? formatTime(remainingSeconds)
                  : formatTime(elapsedSeconds)}
              </div>
            )}

            <button
              type="button"
              onClick={() => setShowNavigator((v) => !v)}
              className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-semibold transition ${
                showNavigator
                  ? 'border-indigo-500 bg-indigo-50 text-indigo-700 dark:border-indigo-500 dark:bg-indigo-950/50 dark:text-indigo-300'
                  : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
              }`}
            >
              <LayoutGrid className="h-3.5 w-3.5" />
              <span>Navigator</span>
              <span className="rounded bg-slate-100 px-1.5 py-0.2 text-[10px] text-slate-600 dark:bg-slate-700 dark:text-slate-300">
                {answeredCount}/{totalQuestions}
              </span>
            </button>

            {config.feedbackMode === 'end' && (
              <button
                type="button"
                onClick={() => setShowSubmitConfirm(true)}
                className="hidden items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1 text-xs font-semibold text-white transition hover:bg-indigo-500 sm:inline-flex"
              >
                <Send className="h-3 w-3" />
                Submit
              </button>
            )}
          </div>
        </div>

        {/* Visual Progress Bar */}
        <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
          <div
            className="h-full rounded-full bg-indigo-600 transition-all duration-300 ease-out dark:bg-indigo-500"
            style={{ width: `${Math.max(2, progressPercent)}%` }}
          />
        </div>
      </div>

      {/* Collapsible Question Navigator Grid */}
      {showNavigator && (
        <div className="animate-fade-slide-in mb-5 rounded-2xl border border-slate-200 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-xs font-bold tracking-wider text-slate-500 uppercase dark:text-slate-400">
              Question Navigator
            </h3>
            <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500 dark:text-slate-400">
              <span className="inline-flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-xs bg-indigo-600" />
                Answered ({answeredCount})
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-xs border border-slate-300 bg-slate-100 dark:border-slate-600 dark:bg-slate-800" />
                Unanswered ({unansweredCount})
              </span>
              {config.feedbackMode === 'end' && (
                <span className="inline-flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
                  Flagged ({flaggedCount})
                </span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-6 gap-2 sm:grid-cols-10 md:grid-cols-12">
            {exam.questions.map((q, idx) => {
              const hasAnswer = (answers[idx]?.length ?? 0) > 0;
              const qChecked = config.feedbackMode === 'instant' && Boolean(checkedQuestions[idx]);
              const qCorrect = qChecked && isAnswerCorrect(answers[idx], q.correctAnswers);
              const qFlagged = Boolean(flaggedQuestions[idx]);
              const isCurrent = idx === currentIndex;

              let btnStyle =
                'border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300 dark:border-slate-700 dark:bg-slate-800/80 dark:text-slate-300';

              if (qChecked) {
                btnStyle = qCorrect
                  ? 'border-emerald-500 bg-emerald-50 text-emerald-700 dark:border-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-300'
                  : 'border-rose-500 bg-rose-50 text-rose-700 dark:border-rose-600 dark:bg-rose-950/60 dark:text-rose-300';
              } else if (hasAnswer) {
                btnStyle =
                  'border-indigo-600 bg-indigo-600 text-white hover:bg-indigo-500 dark:border-indigo-500 dark:bg-indigo-600';
              }

              return (
                <button
                  key={`${q.id}-${idx}`}
                  type="button"
                  onClick={() => onNavigate(idx)}
                  className={`relative flex h-9 items-center justify-center rounded-lg border text-xs font-bold transition ${btnStyle} ${
                    isCurrent ? 'ring-2 ring-indigo-500 ring-offset-2 dark:ring-offset-slate-900' : ''
                  }`}
                >
                  {idx + 1}
                  {qFlagged && (
                    <span className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full border border-white bg-amber-500 dark:border-slate-900" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Question Card */}
      <div
        key={currentIndex}
        className="animate-fade-slide-in rounded-2xl border border-slate-200 bg-white p-5 shadow-xs sm:p-7 dark:border-slate-800 dark:bg-slate-900"
      >
        {/* Question Header Badges */}
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`inline-flex items-center rounded-lg px-2.5 py-1 text-xs font-semibold ${
                isMulti
                  ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300'
                  : 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/70 dark:text-indigo-300'
              }`}
            >
              {isMulti
                ? `Multiple Choice · Select ${currentQuestion.correctAnswers.length} answers`
                : 'Single Choice'}
            </span>

            {isFlagged && (
              <span className="inline-flex items-center gap-1 rounded-lg bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700 dark:bg-amber-950/60 dark:text-amber-300">
                <Flag className="h-3 w-3 fill-current" />
                Flagged
              </span>
            )}
          </div>

          {config.feedbackMode === 'end' && (
            <button
              type="button"
              onClick={() => onToggleFlag(currentIndex)}
              className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-semibold transition ${
                isFlagged
                  ? 'border-amber-300 bg-amber-50 text-amber-700 dark:border-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
                  : 'border-slate-200 bg-white text-slate-600 hover:border-amber-300 hover:text-amber-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400 dark:hover:border-amber-700 dark:hover:text-amber-400'
              }`}
            >
              <Flag className={`h-3.5 w-3.5 ${isFlagged ? 'fill-current' : ''}`} />
              {isFlagged ? 'Flagged' : 'Flag for Review'}
            </button>
          )}
        </div>

        {/* Question Text */}
        <h2 className="mb-6 text-lg leading-relaxed font-semibold text-slate-900 sm:text-xl dark:text-white">
          <RichText text={currentQuestion.question} />
        </h2>

        {/* Options List */}
        <div className="space-y-3" role={isMulti ? 'group' : 'radiogroup'}>
          {currentQuestion.options.map((opt, optIdx) => {
            const isSelected = selectedIds.includes(opt.id);
            const isCorrectOption = currentQuestion.correctAnswers.includes(opt.id);

            let cardClasses =
              'border-slate-200 bg-white hover:border-indigo-300 hover:bg-slate-50/80 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-indigo-700 dark:hover:bg-slate-800/50';
            let badgeClasses =
              'border-slate-200 bg-slate-100 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300';
            let statusIcon: React.ReactNode = null;

            if (isChecked) {
              if (isCorrectOption && isSelected) {
                cardClasses =
                  'border-emerald-500 bg-emerald-50/70 dark:border-emerald-500 dark:bg-emerald-950/35';
                badgeClasses = 'border-emerald-500 bg-emerald-600 text-white';
                statusIcon = (
                  <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
                );
              } else if (isCorrectOption && !isSelected) {
                cardClasses =
                  'border-emerald-400 border-dashed bg-emerald-50/40 dark:border-emerald-600 dark:bg-emerald-950/20';
                badgeClasses =
                  'border-emerald-500 bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200';
                statusIcon = (
                  <span className="shrink-0 rounded-md bg-emerald-100 px-2 py-0.5 text-[11px] font-bold text-emerald-700 dark:bg-emerald-900/70 dark:text-emerald-300">
                    Correct Answer
                  </span>
                );
              } else if (!isCorrectOption && isSelected) {
                cardClasses =
                  'border-rose-500 bg-rose-50/70 dark:border-rose-500 dark:bg-rose-950/35';
                badgeClasses = 'border-rose-500 bg-rose-600 text-white';
                statusIcon = (
                  <XCircle className="h-5 w-5 shrink-0 text-rose-600 dark:text-rose-400" />
                );
              } else {
                cardClasses =
                  'border-slate-200/70 bg-slate-50/40 opacity-60 dark:border-slate-800/60 dark:bg-slate-900/40';
              }
            } else if (isSelected) {
              cardClasses =
                'border-indigo-600 bg-indigo-50/60 ring-1 ring-indigo-600/20 dark:border-indigo-500 dark:bg-indigo-950/35';
              badgeClasses = 'border-indigo-600 bg-indigo-600 text-white';
            }

            return (
              <button
                key={opt.id}
                type="button"
                disabled={isChecked}
                onClick={() => onSelectAnswer(currentIndex, opt.id, isMulti)}
                className={`group flex w-full items-start gap-3.5 rounded-xl border-2 p-4 text-left transition-all duration-150 active:scale-[0.995] disabled:cursor-default ${cardClasses}`}
              >
                {/* Selection Indicator + Option ID */}
                <div className="mt-0.5 flex shrink-0 items-center gap-2.5">
                  <div
                    className={`flex h-5 w-5 items-center justify-center border-2 transition ${
                      isMulti ? 'rounded-md' : 'rounded-full'
                    } ${
                      isSelected
                        ? isChecked
                          ? isCorrectOption
                            ? 'border-emerald-600 bg-emerald-600 text-white'
                            : 'border-rose-600 bg-rose-600 text-white'
                          : 'border-indigo-600 bg-indigo-600 text-white'
                        : 'border-slate-300 bg-white dark:border-slate-600 dark:bg-slate-900'
                    }`}
                  >
                    {isSelected &&
                      (isMulti ? (
                        <Check className="h-3.5 w-3.5 stroke-[3]" />
                      ) : (
                        <span className="h-2 w-2 rounded-full bg-white" />
                      ))}
                  </div>

                  <span
                    className={`flex h-7 min-w-7 items-center justify-center rounded-lg border px-1.5 font-mono text-xs font-bold transition ${badgeClasses}`}
                  >
                    {opt.id}
                  </span>
                </div>

                {/* Option Text */}
                <div className="min-w-0 flex-1 pt-0.5 text-sm leading-relaxed font-medium text-slate-800 sm:text-base dark:text-slate-100">
                  <RichText text={opt.text} />
                </div>

                {/* Right Status / Shortcut Hint */}
                <div className="mt-0.5 flex shrink-0 items-center">
                  {statusIcon ?? (
                    <span className="hidden rounded border border-slate-200 px-1.5 py-0.5 font-mono text-[10px] text-slate-400 opacity-0 transition group-hover:opacity-100 sm:inline-block dark:border-slate-700 dark:text-slate-500">
                      {optIdx + 1}
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Instant Feedback Explanation Box */}
        {isChecked && (
          <div
            className={`animate-fade-slide-in mt-6 rounded-xl border p-4 ${
              currentIsCorrect
                ? 'border-emerald-200 bg-emerald-50/80 dark:border-emerald-800/60 dark:bg-emerald-950/40'
                : 'border-rose-200 bg-rose-50/80 dark:border-rose-800/60 dark:bg-rose-950/40'
            }`}
          >
            <div className="flex items-center gap-2">
              {currentIsCorrect ? (
                <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              ) : (
                <XCircle className="h-5 w-5 text-rose-600 dark:text-rose-400" />
              )}
              <span
                className={`text-sm font-bold ${
                  currentIsCorrect
                    ? 'text-emerald-900 dark:text-emerald-200'
                    : 'text-rose-900 dark:text-rose-200'
                }`}
              >
                {currentIsCorrect
                  ? 'Correct!'
                  : `Incorrect — Correct answer${
                      currentQuestion.correctAnswers.length > 1 ? 's' : ''
                    }: ${currentQuestion.correctAnswers.join(', ')}`}
              </span>
            </div>

            {currentQuestion.explanation && (
              <div className="mt-2.5 flex items-start gap-2 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                <Info className="mt-0.5 h-4 w-4 shrink-0 opacity-70" />
                <div>
                  <RichText text={currentQuestion.explanation} />
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Desktop Action Bar */}
      <div className="mt-6 hidden items-center justify-between gap-4 sm:flex">
        <button
          type="button"
          onClick={() => onNavigate(currentIndex - 1)}
          disabled={isFirst}
          className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-2xs transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
        >
          <ChevronLeft className="h-4 w-4" />
          Previous
        </button>

        <button
          type="button"
          onClick={() => setShowShortcuts((v) => !v)}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-400 transition hover:text-slate-600 dark:hover:text-slate-300"
        >
          <Keyboard className="h-3.5 w-3.5" />
          Shortcuts
        </button>

        <button
          type="button"
          onClick={handlePrimaryAction}
          disabled={config.feedbackMode === 'instant' && !isChecked && selectedIds.length === 0}
          className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white shadow-xs transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {config.feedbackMode === 'instant' ? (
            !isChecked ? (
              <>
                Check Answer
                <Check className="h-4 w-4" />
              </>
            ) : isLast ? (
              <>
                Finish &amp; View Results
                <Send className="h-4 w-4" />
              </>
            ) : (
              <>
                Next Question
                <ChevronRight className="h-4 w-4" />
              </>
            )
          ) : isLast ? (
            <>
              Submit Exam
              <Send className="h-4 w-4" />
            </>
          ) : (
            <>
              Next Question
              <ChevronRight className="h-4 w-4" />
            </>
          )}
        </button>
      </div>

      {/* Keyboard Shortcut Legend */}
      {showShortcuts && (
        <div className="mt-4 hidden flex-wrap items-center justify-center gap-x-5 gap-y-2 rounded-xl border border-slate-200 bg-white/80 px-4 py-2.5 text-xs text-slate-500 sm:flex dark:border-slate-800 dark:bg-slate-900/70 dark:text-slate-400">
          <span>
            <kbd className="rounded border border-slate-300 bg-slate-100 px-1.5 py-0.5 font-mono text-[10px] dark:border-slate-700 dark:bg-slate-800">
              1-9
            </kbd>{' '}
            /{' '}
            <kbd className="rounded border border-slate-300 bg-slate-100 px-1.5 py-0.5 font-mono text-[10px] dark:border-slate-700 dark:bg-slate-800">
              A-D
            </kbd>{' '}
            Select option
          </span>
          <span>
            <kbd className="rounded border border-slate-300 bg-slate-100 px-1.5 py-0.5 font-mono text-[10px] dark:border-slate-700 dark:bg-slate-800">
              Enter
            </kbd>{' '}
            {config.feedbackMode === 'instant' ? 'Check / Next' : 'Next'}
          </span>
          <span>
            <kbd className="rounded border border-slate-300 bg-slate-100 px-1.5 py-0.5 font-mono text-[10px] dark:border-slate-700 dark:bg-slate-800">
              &larr;
            </kbd>{' '}
            <kbd className="rounded border border-slate-300 bg-slate-100 px-1.5 py-0.5 font-mono text-[10px] dark:border-slate-700 dark:bg-slate-800">
              &rarr;
            </kbd>{' '}
            Navigate
          </span>
          {config.feedbackMode === 'end' && (
            <span>
              <kbd className="rounded border border-slate-300 bg-slate-100 px-1.5 py-0.5 font-mono text-[10px] dark:border-slate-700 dark:bg-slate-800">
                F
              </kbd>{' '}
              Flag
            </span>
          )}
        </div>
      )}

      {/* Sticky Mobile Bottom Action Bar */}
      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-slate-200 bg-white/95 px-4 py-3 backdrop-blur-md sm:hidden dark:border-slate-800 dark:bg-slate-950/95">
        <div className="flex items-center justify-between gap-2.5">
          <button
            type="button"
            onClick={() => onNavigate(currentIndex - 1)}
            disabled={isFirst}
            aria-label="Previous question"
            className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 disabled:opacity-40 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>

          {config.feedbackMode === 'end' && (
            <button
              type="button"
              onClick={() => setShowSubmitConfirm(true)}
              className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
            >
              Submit
            </button>
          )}

          <button
            type="button"
            onClick={handlePrimaryAction}
            disabled={config.feedbackMode === 'instant' && !isChecked && selectedIds.length === 0}
            className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 text-sm font-semibold text-white shadow-xs disabled:opacity-40"
          >
            {config.feedbackMode === 'instant' ? (
              !isChecked ? (
                'Check Answer'
              ) : isLast ? (
                'View Results'
              ) : (
                'Next Question'
              )
            ) : isLast ? (
              'Submit Exam'
            ) : (
              'Next'
            )}
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Submit Confirmation Modal (End-of-Quiz mode) */}
      {showSubmitConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs"
          onClick={() => setShowSubmitConfirm(false)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="animate-fade-slide-in w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
                  <Send className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Submit Exam?
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Review your completion summary before grading.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowSubmitConfirm(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mb-5 space-y-2 rounded-xl border border-slate-200 bg-slate-50 p-3.5 text-sm dark:border-slate-800 dark:bg-slate-950/60">
              <div className="flex justify-between">
                <span className="text-slate-600 dark:text-slate-400">Answered</span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {answeredCount} / {totalQuestions}
                </span>
              </div>
              {unansweredCount > 0 && (
                <div className="flex items-center justify-between text-amber-700 dark:text-amber-400">
                  <span className="inline-flex items-center gap-1.5">
                    <AlertCircle className="h-4 w-4" />
                    Unanswered
                  </span>
                  <span className="font-bold">{unansweredCount}</span>
                </div>
              )}
              {flaggedCount > 0 && (
                <div className="flex items-center justify-between text-amber-700 dark:text-amber-400">
                  <span className="inline-flex items-center gap-1.5">
                    <Flag className="h-4 w-4" />
                    Flagged for review
                  </span>
                  <span className="font-bold">{flaggedCount}</span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setShowSubmitConfirm(false)}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
              >
                Keep Reviewing
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowSubmitConfirm(false);
                  onSubmitExam();
                }}
                className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-5 py-2 text-sm font-semibold text-white shadow-xs transition hover:bg-indigo-500"
              >
                Submit &amp; Grade
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
