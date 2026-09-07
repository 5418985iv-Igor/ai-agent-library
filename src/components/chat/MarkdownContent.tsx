import React from 'react';
import Markdown from 'react-markdown';
import { CodeBlock } from './CodeBlock';

interface MarkdownContentProps {
  content: string;
}

export const MarkdownContent: React.FC<MarkdownContentProps> = ({ content }) => {
  return (
    <div className="prose prose-slate max-w-none text-slate-800 text-sm sm:text-base leading-relaxed space-y-2">
      <Markdown
        components={{
          code({ className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || '');
            const isInline = !match && !String(children).includes('\n');

            if (isInline) {
              return (
                <code
                  className="px-1.5 py-0.5 mx-0.5 rounded bg-slate-100 border border-slate-200/80 font-mono text-[13px] text-indigo-700 font-medium"
                  {...props}
                >
                  {children}
                </code>
              );
            }

            return (
              <CodeBlock
                language={match ? match[1] : undefined}
                code={String(children).replace(/\n$/, '')}
              />
            );
          },
          p({ children }) {
            return <p className="mb-2.5 last:mb-0 leading-relaxed">{children}</p>;
          },
          ul({ children }) {
            return <ul className="list-disc pl-5 mb-2.5 space-y-1">{children}</ul>;
          },
          ol({ children }) {
            return <ol className="list-decimal pl-5 mb-2.5 space-y-1">{children}</ol>;
          },
          li({ children }) {
            return <li className="leading-relaxed">{children}</li>;
          },
          h1({ children }) {
            return <h1 className="text-xl font-bold text-slate-900 mt-4 mb-2">{children}</h1>;
          },
          h2({ children }) {
            return <h2 className="text-lg font-bold text-slate-900 mt-3.5 mb-2">{children}</h2>;
          },
          h3({ children }) {
            return <h3 className="text-base font-bold text-slate-900 mt-3 mb-1.5">{children}</h3>;
          },
          blockquote({ children }) {
            return (
              <blockquote className="border-l-4 border-indigo-500 pl-3.5 my-2.5 text-slate-600 italic bg-indigo-50/40 py-1 rounded-r">
                {children}
              </blockquote>
            );
          },
          table({ children }) {
            return (
              <div className="overflow-x-auto my-3 rounded-lg border border-slate-200">
                <table className="min-w-full divide-y divide-slate-200 text-left text-xs sm:text-sm">
                  {children}
                </table>
              </div>
            );
          },
          th({ children }) {
            return (
              <th className="bg-slate-50 px-3 py-2 font-semibold text-slate-700 border-b border-slate-200">
                {children}
              </th>
            );
          },
          td({ children }) {
            return (
              <td className="px-3 py-2 border-b border-slate-100 text-slate-600">
                {children}
              </td>
            );
          },
        }}
      >
        {content}
      </Markdown>
    </div>
  );
};
