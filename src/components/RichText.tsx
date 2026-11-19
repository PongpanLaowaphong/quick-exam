import React from 'react';

interface RichTextProps {
  text: string;
  className?: string;
}

function renderInline(line: string, keyPrefix: string): React.ReactNode[] {
  // Match inline `code` or **bold**
  const tokenRegex = /(`[^`]+`|\*\*[^*]+\*\*)/g;
  const parts = line.split(tokenRegex);

  return parts.map((part, idx) => {
    const key = `${keyPrefix}-${idx}`;
    if (part.startsWith('`') && part.endsWith('`') && part.length > 2) {
      return (
        <code
          key={key}
          className="rounded-md bg-slate-100 px-1.5 py-0.5 font-mono text-[0.88em] font-medium text-indigo-700 dark:bg-slate-800 dark:text-indigo-300"
        >
          {part.slice(1, -1)}
        </code>
      );
    }
    if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
      return (
        <strong key={key} className="font-semibold text-slate-900 dark:text-white">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return <React.Fragment key={key}>{part}</React.Fragment>;
  });
}

export const RichText: React.FC<RichTextProps> = ({ text, className = '' }) => {
  // Split fenced code blocks ```lang?\n...\n```
  const blockRegex = /(```[\w-]*\n[\s\S]*?```)/g;
  const segments = text.split(blockRegex);

  return (
    <span className={className}>
      {segments.map((segment, segIdx) => {
        if (segment.startsWith('```') && segment.endsWith('```')) {
          const inner = segment.slice(3, -3);
          const firstNewline = inner.indexOf('\n');
          const lang = firstNewline !== -1 ? inner.slice(0, firstNewline).trim() : '';
          const code = firstNewline !== -1 ? inner.slice(firstNewline + 1) : inner;

          return (
            <pre
              key={`code-${segIdx}`}
              className="my-3 overflow-x-auto rounded-xl border border-slate-200 bg-slate-900 p-3.5 text-left font-mono text-xs leading-relaxed text-slate-100 sm:text-sm dark:border-slate-700 dark:bg-slate-950"
            >
              {lang && (
                <div className="mb-2 text-[10px] font-semibold tracking-wider text-slate-400 uppercase">
                  {lang}
                </div>
              )}
              <code>{code.replace(/\n$/, '')}</code>
            </pre>
          );
        }

        const lines = segment.split('\n');
        return (
          <React.Fragment key={`text-${segIdx}`}>
            {lines.map((line, lineIdx) => (
              <React.Fragment key={`line-${segIdx}-${lineIdx}`}>
                {renderInline(line, `${segIdx}-${lineIdx}`)}
                {lineIdx < lines.length - 1 && <br />}
              </React.Fragment>
            ))}
          </React.Fragment>
        );
      })}
    </span>
  );
};
