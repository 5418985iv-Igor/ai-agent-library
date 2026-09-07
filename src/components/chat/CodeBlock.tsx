import React, { useState } from 'react';
import { Copy, Check, Terminal } from 'lucide-react';

interface CodeBlockProps {
  language?: string;
  code: string;
}

export const CodeBlock: React.FC<CodeBlockProps> = ({ language, code }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const displayLang = language ? language.replace(/^language-/, '').toUpperCase() : '1С / КОД';

  return (
    <div className="my-3 rounded-xl overflow-hidden border border-slate-700/80 bg-slate-900 shadow-md font-mono text-sm">
      {/* Code Header Bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-slate-800/90 border-b border-slate-700/60 text-xs text-slate-300">
        <div className="flex items-center gap-2">
          <Terminal className="w-3.5 h-3.5 text-indigo-400" />
          <span className="font-semibold text-slate-300 tracking-wide">{displayLang}</span>
        </div>

        <button
          onClick={handleCopy}
          type="button"
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-700/60 hover:bg-slate-700 text-slate-200 hover:text-white transition-all text-xs font-medium cursor-pointer"
          title="Скопировать код"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-300 font-semibold">Скопировано</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>Копировать</span>
            </>
          )}
        </button>
      </div>

      {/* Code Area */}
      <div className="p-4 overflow-x-auto text-slate-100 leading-relaxed scrollbar-thin scrollbar-thumb-slate-700">
        <pre className="m-0 font-mono text-[13px] sm:text-sm whitespace-pre">
          <code>{code}</code>
        </pre>
      </div>
    </div>
  );
};
