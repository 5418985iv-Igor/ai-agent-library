import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, AlertCircle, X } from 'lucide-react';
import { TabType, Project } from './types';
import { Header } from './components/Header';
import { ProjectsView } from './components/ProjectsView';
import { ContactsView } from './components/ContactsView';
import { AuthView } from './components/AuthView';
import { QueryDeveloperPage } from './components/QueryDeveloperPage';
import { Footer } from './components/Footer';
import { PROJECTS_CONFIG } from './config/projects';
import { CONTACTS_CONFIG } from './config/contacts';

export default function App() {
  const [currentPath, setCurrentPath] = useState<string>(() => {
    return typeof window !== 'undefined' ? window.location.pathname : '/';
  });

  const [activeTab, setActiveTab] = useState<TabType>('projects');
  const [targetProject, setTargetProject] = useState<Project | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return (
      sessionStorage.getItem('is_projects_authenticated') === 'true' ||
      localStorage.getItem('is_projects_authenticated') === 'true'
    );
  });

  // Toast notification state
  const [toast, setToast] = useState<{
    message: string;
    type: 'success' | 'error';
  } | null>(null);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => {
      setToast(null);
    }, 4000);
    return () => clearTimeout(timer);
  }, [toast]);

  // Handle browser back/forward buttons
  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigateTo = (path: string) => {
    if (typeof window !== 'undefined') {
      if (window.location.pathname !== path) {
        window.history.pushState(null, '', path);
      }
      setCurrentPath(path);
    }
  };

  const copyToClipboard = async (text: string): Promise<boolean> => {
    if (navigator?.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(text);
        return true;
      } catch (err) {
        console.warn('navigator.clipboard.writeText failed, trying fallback:', err);
      }
    }

    try {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      textArea.setAttribute('readonly', '');
      document.body.appendChild(textArea);
      textArea.select();
      const successful = document.execCommand('copy');
      document.body.removeChild(textArea);
      return successful;
    } catch (fallbackErr) {
      console.warn('execCommand copy failed:', fallbackErr);
      return false;
    }
  };

  const openProject = async (project: Project) => {
    // 1. If promptFile is specified: fetch, get content, copy to clipboard, open in new tab
    if (project.promptFile) {
      try {
        const response = await fetch(project.promptFile);
        if (!response.ok) {
          throw new Error(`Файл не найден (HTTP ${response.status})`);
        }

        const contentType = response.headers.get('content-type') || '';
        if (contentType.includes('text/html')) {
          throw new Error('Файл не найден (получена страница приложения вместо файла промпта)');
        }

        const promptText = await response.text();
        const trimmedPrompt = promptText ? promptText.trim() : '';
        if (!trimmedPrompt || trimmedPrompt.startsWith('<!doctype') || trimmedPrompt.startsWith('<!DOCTYPE') || trimmedPrompt.startsWith('<html')) {
          throw new Error('Файл промпта не найден или пуст');
        }

        const copied = await copyToClipboard(trimmedPrompt);
        if (copied) {
          setToast({
            message: 'Промпт скопирован в буфер обмена',
            type: 'success',
          });
        } else {
          setToast({
            message: 'Не удалось скопировать промпт в буфер обмена. Переходим по ссылке...',
            type: 'error',
          });
        }
      } catch (err: any) {
        console.warn('Ошибка при загрузке или копировании файла промпта:', err);
        setToast({
          message: `Ошибка загрузки промпта: ${err?.message || 'Не удалось прочитать файл'}. Переходим по ссылке...`,
          type: 'error',
        });
      }

      window.open(project.url, '_blank', 'noopener,noreferrer');
      return;
    }

    // Legacy fallback if prompt string is directly provided
    if (project.prompt) {
      const copied = await copyToClipboard(project.prompt);
      if (copied) {
        setToast({
          message: 'Промпт скопирован в буфер обмена',
          type: 'success',
        });
      } else {
        setToast({
          message: 'Не удалось скопировать промпт в буфер обмена. Переходим по ссылке...',
          type: 'error',
        });
      }
      window.open(project.url, '_blank', 'noopener,noreferrer');
      return;
    }

    // Default behavior if no promptFile or prompt is specified
    if (project.url.startsWith('/') || project.id === 'query-developer') {
      const targetUrl = project.url.startsWith('/') ? project.url : `/${project.id}`;
      navigateTo(targetUrl);
    } else {
      window.open(project.url, '_blank', 'noopener,noreferrer');
    }
  };

  const handleSelectProject = async (project: Project) => {
    // Check if authorization is required
    if (!isAuthenticated && project.requiresAuth !== false) {
      setTargetProject(project);
      setActiveTab('auth');
      return;
    }

    await openProject(project);
  };

  const handleAuthSuccess = async () => {
    setIsAuthenticated(true);
    if (targetProject) {
      const projectToOpen = targetProject;
      setTargetProject(null);
      await openProject(projectToOpen);
    }
    setActiveTab('projects');
  };

  const handleCancelAuth = () => {
    setTargetProject(null);
    setActiveTab('projects');
  };

  const handleLogout = () => {
    sessionStorage.removeItem('is_projects_authenticated');
    localStorage.removeItem('is_projects_authenticated');
    setIsAuthenticated(false);
    setTargetProject(null);
    if (activeTab === 'auth') {
      setActiveTab('projects');
    }
  };

  const isQueryDeveloperRoute = currentPath === '/query-developer';

  return (
    <div className="min-h-screen flex flex-col bg-[#f8fafc] text-[#1e293b] font-sans selection:bg-indigo-500 selection:text-white">
      {/* Navbar */}
      <Header
        activeTab={isQueryDeveloperRoute ? 'projects' : activeTab}
        onTabChange={(tab) => {
          if (isQueryDeveloperRoute) {
            navigateTo('/');
          }
          if (tab !== 'auth') {
            setTargetProject(null);
          }
          setActiveTab(tab);
        }}
        projectsCount={PROJECTS_CONFIG.length}
        isAuthenticated={isAuthenticated}
        onLogout={handleLogout}
      />

      {/* Main Content */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <AnimatePresence mode="wait">
          {/* 1. Internal AI Route: /query-developer */}
          {isQueryDeveloperRoute ? (
            <motion.div
              key="query-developer-page"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              <QueryDeveloperPage
                onBack={() => {
                  navigateTo('/');
                  setActiveTab('projects');
                }}
              />
            </motion.div>
          ) : (
            <>
              {/* 2. Main Projects Catalog */}
              {activeTab === 'projects' && (
                <motion.div
                  key="projects-tab"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.18 }}
                >
                  <ProjectsView
                    projects={PROJECTS_CONFIG}
                    isAuthenticated={isAuthenticated}
                    onSelectProject={handleSelectProject}
                    onOpenAuth={() => setActiveTab('auth')}
                  />
                </motion.div>
              )}

              {/* 3. Contacts View */}
              {activeTab === 'contacts' && (
                <motion.div
                  key="contacts-tab"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.18 }}
                >
                  <ContactsView contacts={CONTACTS_CONFIG} />
                </motion.div>
              )}

              {/* 4. Auth View */}
              {activeTab === 'auth' && (
                <motion.div
                  key="auth-tab"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.18 }}
                >
                  <AuthView
                    targetProject={targetProject}
                    onAuthSuccess={handleAuthSuccess}
                    onCancel={handleCancelAuth}
                  />
                </motion.div>
              )}
            </>
          )}
        </AnimatePresence>
      </main>

      {/* Global Footer */}
      <Footer />

      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            id="prompt-clipboard-toast"
            initial={{ opacity: 0, y: -16, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -16, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed top-5 right-5 z-50 max-w-sm w-full mx-auto px-4 pointer-events-none"
          >
            <div
              className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl shadow-lg border text-sm font-medium ${
                toast.type === 'success'
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-900 shadow-emerald-900/5'
                  : 'bg-red-50 border-red-200 text-red-900 shadow-red-900/5'
              }`}
            >
              {toast.type === 'success' ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              )}
              <div className="flex-1 break-words leading-snug">
                {toast.message}
              </div>
              <button
                id="toast-close-button"
                type="button"
                onClick={() => setToast(null)}
                className="text-slate-400 hover:text-slate-600 transition-colors p-0.5 cursor-pointer rounded shrink-0"
                title="Закрыть"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
