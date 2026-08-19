import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { TabType } from './types';
import { Header } from './components/Header';
import { ProjectsView } from './components/ProjectsView';
import { ContactsView } from './components/ContactsView';
import { Footer } from './components/Footer';
import { PROJECTS_CONFIG } from './config/projects';
import { CONTACTS_CONFIG } from './config/contacts';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('projects');

  return (
    <div className="min-h-screen flex flex-col bg-[#f8fafc] text-[#1e293b] font-sans selection:bg-indigo-500 selection:text-white">
      {/* Navbar */}
      <Header
        activeTab={activeTab}
        onTabChange={setActiveTab}
        projectsCount={PROJECTS_CONFIG.length}
      />

      {/* Main Content */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        <AnimatePresence mode="wait">
          {activeTab === 'projects' ? (
            <motion.div
              key="projects-tab"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.18 }}
            >
              <ProjectsView projects={PROJECTS_CONFIG} />
            </motion.div>
          ) : (
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
        </AnimatePresence>
      </main>

      {/* Global Footer */}
      <Footer />
    </div>
  );
}
