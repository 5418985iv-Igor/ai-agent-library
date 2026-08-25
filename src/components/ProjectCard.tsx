import React from 'react';
import { Project } from '../types';
import { IconRenderer } from './IconRenderer';
import { ExternalLink, Lock } from 'lucide-react';

interface ProjectCardProps {
  project: Project;
  isAuthenticated: boolean;
  onSelect: (project: Project) => void;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({
  project,
  isAuthenticated,
  onSelect,
}) => {
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    onSelect(project);
  };

  return (
    <div
      id={`project-card-${project.id}`}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect(project);
        }
      }}
      className="group relative flex flex-col justify-between h-full bg-white border border-slate-200 rounded-2xl p-6 transition-all duration-200 hover:border-indigo-600 hover:shadow-[0_10px_25px_-5px_rgba(0,0,0,0.05)] hover:-translate-y-0.5 text-left cursor-pointer select-none"
    >
      <div className="flex-1 flex flex-col">
        {/* Card Header: Icon & Category/Badge */}
        <div className="flex items-start justify-between gap-3 mb-3.5">
          <div className="flex items-start gap-3.5 flex-1 min-w-0">
            <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-center text-slate-700 transition-colors duration-200 group-hover:bg-indigo-50 group-hover:text-indigo-600 group-hover:border-indigo-100 shrink-0">
              <IconRenderer name={project.icon} className="w-6 h-6" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-lg font-bold text-slate-900 leading-snug group-hover:text-indigo-600 transition-colors duration-150 break-words whitespace-normal">
                {project.title}
              </h3>
              {project.category && (
                <span className="text-xs text-slate-500 font-medium block mt-0.5 break-words whitespace-normal">
                  {project.category}
                </span>
              )}
            </div>
          </div>

          {project.badge && (
            <span className="hidden xs:inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200/60 font-mono shrink-0">
              {project.badge}
            </span>
          )}
        </div>

        {/* Description */}
        <p className="text-sm text-slate-500 leading-relaxed break-words whitespace-normal flex-1">
          {project.description}
        </p>
      </div>

      {/* Button Open */}
      <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between gap-2">
        <div className="w-full bg-slate-50 border border-slate-200 py-2.5 px-4 rounded-xl text-center text-sm font-semibold text-slate-800 flex items-center justify-center gap-2 group-hover:bg-indigo-600 group-hover:text-white group-hover:border-indigo-600 transition-all duration-150">
          <span>{isAuthenticated || project.requiresAuth === false ? 'Открыть проект' : 'Авторизоваться и открыть'}</span>
          {isAuthenticated || project.requiresAuth === false ? (
            <ExternalLink className="w-3.5 h-3.5" />
          ) : (
            <Lock className="w-3.5 h-3.5" />
          )}
        </div>
      </div>
    </div>
  );
};

