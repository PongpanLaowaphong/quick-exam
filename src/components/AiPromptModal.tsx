import React, { useEffect, useState } from 'react';
import { X, Copy, Check, Sparkles, FileUp, Wand2, ClipboardPaste } from 'lucide-react';
import { AI_PROMPT_TEMPLATE } from '../data/aiPromptTemplate';

interface AiPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCopied: () => void;
}

export const AiPromptModal: React.FC<AiPromptModalProps> = ({ isOpen, onClose, onCopied }) => {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(AI_PROMPT_TEMPLATE);
    } catch {
      // Fallback for older browsers or non-secure contexts
      const textarea = document.createElement('textarea');
      textarea.value = AI_PROMPT_TEMPLATE;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
    }
    setCopied(true);
    onCopied();
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="ai-prompt-modal-title"
    >
      <div
        className="animate-fade-slide-in flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-6 py-4 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h2
                id="ai-prompt-modal-title"
                className="text-lg font-bold text-slate-900 dark:text-white"
              >
                Generate Exam JSON with AI
              </h2>
              <p className="text-xs text-slate-500 sm:text-sm dark:text-slate-400">
                Convert your PDFs, Markdown, or study notes into a valid Quick Exam file.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto px-6 py-5">
          {/* 3-step guide */}
          <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-950/60">
              <div className="mb-1.5 flex items-center gap-2 text-xs font-bold text-indigo-600 dark:text-indigo-400">
                <Copy className="h-3.5 w-3.5" />
                Step 1
              </div>
              <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                Copy the prompt template below with one click.
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-950/60">
              <div className="mb-1.5 flex items-center gap-2 text-xs font-bold text-indigo-600 dark:text-indigo-400">
                <Wand2 className="h-3.5 w-3.5" />
                Step 2
              </div>
              <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                Attach your PDF/Markdown + paste the prompt into ChatGPT, Gemini, or Claude.
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-950/60">
              <div className="mb-1.5 flex items-center gap-2 text-xs font-bold text-indigo-600 dark:text-indigo-400">
                <ClipboardPaste className="h-3.5 w-3.5" />
                Step 3
              </div>
              <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                Paste the generated JSON directly or save &amp; upload it here.
              </p>
            </div>
          </div>

          {/* Prompt box */}
          <div className="relative">
            <div className="mb-2 flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-xs font-semibold tracking-wider text-slate-500 uppercase dark:text-slate-400">
                <FileUp className="h-3.5 w-3.5" />
                AI Prompt Template
              </span>
              <button
                type="button"
                onClick={handleCopy}
                className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                  copied
                    ? 'bg-emerald-600 text-white'
                    : 'bg-indigo-600 text-white hover:bg-indigo-500'
                }`}
              >
                {copied ? (
                  <>
                    <Check className="h-3.5 w-3.5" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" />
                    Copy Prompt
                  </>
                )}
              </button>
            </div>
            <pre className="max-h-72 overflow-auto rounded-xl border border-slate-200 bg-slate-900 p-4 font-mono text-xs leading-relaxed text-slate-100 dark:border-slate-700 dark:bg-slate-950">
              {AI_PROMPT_TEMPLATE}
            </pre>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50 px-6 py-3.5 dark:border-slate-800 dark:bg-slate-950/50">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Tip: Adjust <code className="font-mono font-semibold">[10]</code> and{' '}
            <code className="font-mono font-semibold">[English / Thai]</code> at the end of the prompt.
          </p>
          <button
            type="button"
            onClick={handleCopy}
            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold shadow-xs transition ${
              copied
                ? 'bg-emerald-600 text-white'
                : 'bg-indigo-600 text-white hover:bg-indigo-500'
            }`}
          >
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            {copied ? 'Copied to Clipboard' : 'Copy Prompt'}
          </button>
        </div>
      </div>
    </div>
  );
};
