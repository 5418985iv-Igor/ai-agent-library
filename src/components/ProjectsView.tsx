import React from 'react';
import { Project } from '../types';
import { ProjectCard } from './ProjectCard';

interface ProjectsViewProps {
  projects: Project[];
  isAuthenticated: boolean;
  onSelectProject: (project: Project) => void;
  onOpenAuth: () => void;
}

export const ProjectsView: React.FC<ProjectsViewProps> = ({
  projects,
  isAuthenticated,
  onSelectProject,
}) => {
  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <section>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Библиотека проектов
        </h1>
        <p className="text-base text-slate-500 mt-1">
          Панель управления AI-агентами и сервисами
        </p>
      </section>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-fr">
        {projects.map((project) => (
          <ProjectCard
            key={project.id}
            project={project}
            isAuthenticated={isAuthenticated}
            onSelect={onSelectProject}
          />
        ))}
      </div>

      {/* Empty State */}
      {projects.length === 0 && (
        <div className="bg-white rounded-2xl p-10 border border-slate-200 text-center max-w-md mx-auto">
          <h4 className="text-base font-bold text-slate-900 mb-1">Проекты не найдены</h4>
          <p className="text-xs text-slate-500">
            В конфигурации пока нет добавленных проектов.
          </p>
        </div>
      )}
    </div>
  );
};

