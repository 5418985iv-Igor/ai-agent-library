import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { TabType, Project } from './types';
import { Header } from './components/Header';
import { ProjectsView } from './components/ProjectsView';
import { ContactsView } from './components/ContactsView';
import { AuthView } from './components/AuthView';
import { Footer } from './components/Footer';
import { PROJECTS_CONFIG } from './config/projects';
import { CONTACTS_CONFIG } from './config/contacts';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('projects');
  const [targetProject, setTargetProject] = useState<Project | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return (
      sessionStorage.getItem('is_projects_authenticated') === 'true' ||
      localStorage.getItem('is_projects_authenticated') === 'true'
    );
  });

  const handleSelectProject = (project: Project) => {
    if (isAuthenticated || project.requiresAuth === false) {
      // User is already authorized or project does not require auth, directly open project link
      window.open(project.url, '_blank', 'noopener,noreferrer');
    } else {
      // Prompt for authorization first
      setTargetProject(project);
      setActiveTab('auth');
    }
  };

  const handleAuthSuccess = () => {
    setIsAuthenticated(true);
    if (targetProject) {
      window.open(targetProject.url, '_blank', 'noopener,noreferrer');
      setTargetProject(null);
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

  return (
    <div className="min-h-screen flex flex-col bg-[#f8fafc] text-[#1e293b] font-sans selection:bg-indigo-500 selection:text-white">
      {/* Navbar */}
      <Header
        activeTab={activeTab}
        onTabChange={(tab) => {
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
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        <AnimatePresence mode="wait">
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
        </AnimatePresence>
      </main>

      {/* Global Footer */}
      <Footer />
    </div>
  );
}

