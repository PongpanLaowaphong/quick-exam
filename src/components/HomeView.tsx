import React, { useRef, useState } from 'react';
import {
  Upload,
  FileJson,
  Code2,
  Sparkles,
  Play,
  AlertTriangle,
  Wand2,
  Trash2,
  CheckCircle2,
  ArrowRight,
  RotateCcw,
} from 'lucide-react';
import type { ExamData } from '../types/exam';
import { validateExamJson } from '../utils/validateExamJson';

interface HomeViewProps {
  onExamLoaded: (exam: ExamData, sourceLabel?: string) => void;
  onTrySample: () => void;
  onOpenAiModal: () => void;
  onShowToast: (type: 'success' | 'error' | 'info', message: string) => void;
  hasResumeSession: boolean;
  resumeTitle?: string;
  onResumeSession: () => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  onExamLoaded,
  onTrySample,
  onOpenAiModal,
  onShowToast,
  hasResumeSession,
  resumeTitle,
  onResumeSession,
}) => {
  const [activeTab, setActiveTab] = useState<'upload' | 'paste'>('upload');
  const [isDragging, setIsDragging] = useState(false);
  const [pastedText, setPastedText] = useState('');
  const [errors, setErrors] = useState<string[]>([]);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    setUploadedFileName(file.name);
    if (!file.name.toLowerCase().endsWith('.json') && file.type !== 'application/json') {
      setErrors(['Please select a valid .json file.']);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = String(e.target?.result ?? '');
      const result = validateExamJson(content);
      if (result.valid) {
        setErrors([]);
        onExamLoaded(result.exam, `Loaded "${file.name}" (${result.exam.questions.length} questions)`);
      } else {
        setErrors(result.errors);
      }
    };
    reader.onerror = () => {
      setErrors(['Failed to read the selected file. Please try again.']);
    };
    reader.readAsText(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    e.target.value = '';
  };

  const handlePasteChange = (value: string) => {
    setPastedText(value);
    if (!value.trim()) {
      setErrors([]);
      return;
    }
    const result = validateExamJson(value);
    if (result.valid) {
      setErrors([]);
    } else {
      setErrors(result.errors);
    }
  };

  const handlePrettify = () => {
    if (!pastedText.trim()) return;
    try {
      const parsed = JSON.parse(pastedText);
      const formatted = JSON.stringify(parsed, null, 2);
      setPastedText(formatted);
      const result = validateExamJson(formatted);
      setErrors(result.valid ? [] : result.errors);
      onShowToast('info', 'JSON formatted cleanly.');
    } catch {
      const result = validateExamJson(pastedText);
      if (!result.valid) setErrors(result.errors);
      onShowToast('error', 'Cannot format invalid JSON syntax.');
    }
  };

  const handleClearPaste = () => {
    setPastedText('');
    setErrors([]);
  };

  const handleLoadPasted = () => {
    const result = validateExamJson(pastedText);
    if (result.valid) {
      setErrors([]);
      onExamLoaded(result.exam, `Validated ${result.exam.questions.length} questions successfully.`);
    } else {
      setErrors(result.errors);
    }
  };

  const pasteValidation = pastedText.trim() ? validateExamJson(pastedText) : null;

  return (
    <div className="animate-fade-slide-in mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
      {/* Resume banner if an exam is in progress */}
      {hasResumeSession && (
        <div className="mb-6 flex flex-col items-start justify-between gap-3 rounded-2xl border border-indigo-200 bg-indigo-50/80 p-4 sm:flex-row sm:items-center dark:border-indigo-800/60 dark:bg-indigo-950/40">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white">
              <RotateCcw className="h-4 w-4" />
            </div>
            <div>
              <p className="text-sm font-semibold text-indigo-950 dark:text-indigo-100">
                Unfinished exam in progress
              </p>
              <p className="text-xs text-indigo-700 dark:text-indigo-300">
                {resumeTitle || 'Untitled Exam'} — your progress was auto-saved.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onResumeSession}
            className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-xs transition hover:bg-indigo-500 sm:w-auto"
          >
            Resume Exam
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* Hero */}
      <div className="mb-8 text-center">
        <div className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-indigo-200/80 bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700 dark:border-indigo-800/60 dark:bg-indigo-950/60 dark:text-indigo-300">
          <FileJson className="h-3.5 w-3.5" />
          100% Client-Side &middot; Privacy-First JSON Quiz Runner
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl dark:text-white">
          Turn any JSON into an interactive exam.
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-slate-600 sm:text-base dark:text-slate-400">
          Upload a <code className="font-mono text-xs font-semibold text-indigo-600 dark:text-indigo-400">.json</code> file or paste raw JSON to practice with instant feedback, exam simulation, and smart review.
        </p>
      </div>

      {/* Main Import Card */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        {/* Tabs */}
        <div className="grid grid-cols-2 border-b border-slate-200 bg-slate-50/80 p-1.5 dark:border-slate-800 dark:bg-slate-950/50">
          <button
            type="button"
            onClick={() => {
              setActiveTab('upload');
              setErrors([]);
            }}
            className={`flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold transition ${
              activeTab === 'upload'
                ? 'bg-white text-indigo-600 shadow-xs dark:bg-slate-800 dark:text-indigo-400'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            <Upload className="h-4 w-4" />
            Upload JSON
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('paste');
              if (pastedText.trim()) {
                const res = validateExamJson(pastedText);
                setErrors(res.valid ? [] : res.errors);
              } else {
                setErrors([]);
              }
            }}
            className={`flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold transition ${
              activeTab === 'paste'
                ? 'bg-white text-indigo-600 shadow-xs dark:bg-slate-800 dark:text-indigo-400'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            <Code2 className="h-4 w-4" />
            Paste JSON
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-5 sm:p-6">
          {activeTab === 'upload' ? (
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json,application/json"
                onChange={handleFileChange}
                className="hidden"
              />
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    fileInputRef.current?.click();
                  }
                }}
                className={`group flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-12 text-center transition ${
                  isDragging
                    ? 'border-indigo-500 bg-indigo-50/70 dark:border-indigo-400 dark:bg-indigo-950/30'
                    : 'border-slate-300 bg-slate-50/50 hover:border-indigo-400 hover:bg-indigo-50/30 dark:border-slate-700 dark:bg-slate-950/40 dark:hover:border-indigo-600 dark:hover:bg-indigo-950/20'
                }`}
              >
                <div className="mb-4 flex h-13 w-13 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-600 transition group-hover:scale-105 dark:bg-indigo-950 dark:text-indigo-400">
                  <Upload className="h-6 w-6" />
                </div>
                <p className="text-base font-semibold text-slate-900 dark:text-white">
                  Drop your <span className="font-mono text-indigo-600 dark:text-indigo-400">.json</span> exam file here
                </p>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  or click to browse from your computer
                </p>
                {uploadedFileName && errors.length > 0 && (
                  <p className="mt-3 text-xs font-medium text-rose-600 dark:text-rose-400">
                    Selected: {uploadedFileName}
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-xs font-medium">
                  {pasteValidation?.valid ? (
                    <span className="inline-flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Valid schema &middot; {pasteValidation.exam.questions.length} question
                      {pasteValidation.exam.questions.length === 1 ? '' : 's'} ready
                    </span>
                  ) : (
                    <span className="text-slate-500 dark:text-slate-400">
                      Paste raw JSON output from your AI tool or editor
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handlePrettify}
                    disabled={!pastedText.trim()}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                  >
                    <Wand2 className="h-3.5 w-3.5" />
                    Format / Prettify
                  </button>
                  <button
                    type="button"
                    onClick={handleClearPaste}
                    disabled={!pastedText.trim()}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:border-rose-800 dark:hover:bg-rose-950/50 dark:hover:text-rose-400"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Clear
                  </button>
                </div>
              </div>

              <textarea
                value={pastedText}
                onChange={(e) => handlePasteChange(e.target.value)}
                rows={10}
                spellCheck={false}
                placeholder={`{\n  "title": "My Practice Exam",\n  "questions": [\n    {\n      "id": 1,\n      "question": "Your question here?",\n      "options": [\n        { "id": "A", "text": "Choice A" },\n        { "id": "B", "text": "Choice B" }\n      ],\n      "correctAnswers": ["A"],\n      "explanation": "Why A is correct."\n    }\n  ]\n}`}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3.5 font-mono text-xs leading-relaxed text-slate-900 placeholder-slate-400 transition focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:placeholder-slate-500 dark:focus:border-indigo-400 dark:focus:bg-slate-950 dark:focus:ring-indigo-400/20"
              />

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleLoadPasted}
                  disabled={!pastedText.trim()}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-xs transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-40 sm:w-auto"
                >
                  Validate &amp; Continue
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {/* Validation Error Panel */}
          {errors.length > 0 && (
            <div
              role="alert"
              className="mt-5 rounded-xl border border-rose-200 bg-rose-50 p-4 dark:border-rose-900/60 dark:bg-rose-950/40"
            >
              <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-rose-800 dark:text-rose-300">
                <AlertTriangle className="h-4 w-4 shrink-0 text-rose-600 dark:text-rose-400" />
                JSON Validation Failed ({errors.length} issue{errors.length === 1 ? '' : 's'})
              </div>
              <ul className="max-h-40 space-y-1 overflow-y-auto pl-6 text-xs leading-relaxed text-rose-700 list-disc dark:text-rose-300/90">
                {errors.map((err, i) => (
                  <li key={i}>{err}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <button
          type="button"
          onClick={onTrySample}
          className="group flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-2xs transition hover:border-indigo-300 hover:shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:hover:border-indigo-700"
        >
          <div className="flex items-center gap-3.5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
              <Play className="h-5 w-5" />
            </div>
            <div>
              <div className="text-sm font-bold text-slate-900 dark:text-white">
                Try Sample Exam
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400">
                Test single &amp; multi-select questions right away
              </div>
            </div>
          </div>
          <ArrowRight className="h-4 w-4 text-slate-400 transition group-hover:translate-x-0.5 group-hover:text-indigo-600 dark:group-hover:text-indigo-400" />
        </button>

        <button
          type="button"
          onClick={onOpenAiModal}
          className="group flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-2xs transition hover:border-indigo-300 hover:shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:hover:border-indigo-700"
        >
          <div className="flex items-center gap-3.5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <div className="text-sm font-bold text-slate-900 dark:text-white">
                Generate JSON with AI
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400">
                Copy prompt for PDF, Markdown, or study notes
              </div>
            </div>
          </div>
          <ArrowRight className="h-4 w-4 text-slate-400 transition group-hover:translate-x-0.5 group-hover:text-indigo-600 dark:group-hover:text-indigo-400" />
        </button>
      </div>
    </div>
  );
};
