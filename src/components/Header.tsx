import React from 'react';
import { motion } from 'motion/react';
import { TabType } from '../types';
import { SITE_CONFIG } from '../config/site';
import { IconRenderer } from './IconRenderer';
import { FolderKanban, User, Terminal, Lock, LogOut, ShieldCheck } from 'lucide-react';

interface HeaderProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  projectsCount: number;
  isAuthenticated: boolean;
  onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onTabChange,
  projectsCount,
  isAuthenticated,
  onLogout,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="h-[72px] flex items-center justify-between gap-4">
          {/* Logo & Title */}
          <div
            onClick={() => onTabChange('projects')}
            className="flex items-center gap-3 cursor-pointer select-none"
          >
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-base shadow-sm">
              <IconRenderer name={SITE_CONFIG.logoIcon} className="w-4 h-4 text-white" />
            </div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg sm:text-xl text-slate-800 tracking-tight">
                {SITE_CONFIG.title}
              </span>
              {SITE_CONFIG.badgeText && (
                <span className="hidden md:inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100 font-mono">
                  {SITE_CONFIG.badgeText}
                </span>
              )}
            </div>
          </div>

          {/* Clean Nav Tabs */}
          <nav className="flex items-center gap-1 sm:gap-4" aria-label="Main Navigation">
            <button
              id="desktop-tab-projects"
              onClick={() => onTabChange('projects')}
              className={`relative px-3 sm:px-4 py-2 text-sm font-semibold transition-colors duration-150 flex items-center gap-2 cursor-pointer ${
                activeTab === 'projects'
                  ? 'text-indigo-600 font-bold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <FolderKanban className="w-4 h-4" />
              <span>Проекты</span>
              <span className="text-xs px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 font-medium font-mono">
                {projectsCount}
              </span>
              {activeTab === 'projects' && (
                <motion.div
                  layoutId="active-tab-border"
                  className="absolute bottom-[-17px] left-0 right-0 h-[2px] bg-indigo-600"
                  transition={{ type: 'spring', bounce: 0.15, duration: 0.3 }}
                />
              )}
            </button>

            <button
              id="desktop-tab-contacts"
              onClick={() => onTabChange('contacts')}
              className={`relative px-3 sm:px-4 py-2 text-sm font-semibold transition-colors duration-150 flex items-center gap-2 cursor-pointer ${
                activeTab === 'contacts'
                  ? 'text-indigo-600 font-bold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <User className="w-4 h-4" />
              <span>Контакты</span>
              {activeTab === 'contacts' && (
                <motion.div
                  layoutId="active-tab-border"
                  className="absolute bottom-[-17px] left-0 right-0 h-[2px] bg-indigo-600"
                  transition={{ type: 'spring', bounce: 0.15, duration: 0.3 }}
                />
              )}
            </button>

            <button
              id="desktop-tab-auth"
              onClick={() => onTabChange('auth')}
              className={`relative px-3 sm:px-4 py-2 text-sm font-semibold transition-colors duration-150 flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'auth'
                  ? 'text-indigo-600 font-bold'
                  : isAuthenticated
                  ? 'text-emerald-600 hover:text-emerald-700'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {isAuthenticated ? (
                <>
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span className="hidden sm:inline">Доступ</span>
                  <span className="sm:hidden">Вход</span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4 text-slate-400" />
                  <span>Авторизация</span>
                </>
              )}
              {activeTab === 'auth' && (
                <motion.div
                  layoutId="active-tab-border"
                  className="absolute bottom-[-17px] left-0 right-0 h-[2px] bg-indigo-600"
                  transition={{ type: 'spring', bounce: 0.15, duration: 0.3 }}
                />
              )}
            </button>
          </nav>

          {/* Right Status / Auth action */}
          <div className="flex items-center gap-2">
            {isAuthenticated ? (
              <button
                id="header-logout-button"
                onClick={onLogout}
                title="Заблокировать доступ к проектам"
                className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-red-50 text-red-700 hover:bg-red-100 border border-red-200/70 transition-colors cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Выйти</span>
              </button>
            ) : (
              <span className="hidden sm:flex items-center gap-1.5 text-xs text-slate-400 font-mono bg-slate-50 px-2.5 py-1 rounded-md border border-slate-200/70">
                <Terminal className="w-3 h-3 text-slate-400" />
                v1.0.4
              </span>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

