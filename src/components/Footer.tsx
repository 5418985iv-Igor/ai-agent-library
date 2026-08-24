import React from 'react';
import { SITE_CONFIG } from '../config/site';

export const Footer: React.FC = () => {
  return (
    <footer className="mt-auto border-t border-slate-200 bg-white py-6 text-slate-500 text-xs">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="font-bold text-slate-700">{SITE_CONFIG.title}</span>
          <span>&copy; {new Date().getFullYear()}</span>
          <span>&middot;</span>
          <span>{SITE_CONFIG.footerText}</span>
        </div>

        
      </div>
    </footer>
  );
};
