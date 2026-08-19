import React from 'react';
import { Project } from '../types';
import { IconRenderer } from './IconRenderer';
import { ExternalLink } from 'lucide-react';

interface ProjectCardProps {
  project: Project;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({ project }) => {
  return (
    <a
      id={`project-card-${project.id}`}
      href={project.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group relative flex flex-col justify-between bg-white border border-slate-200 rounded-2xl p-6 transition-all duration-200 hover:border-indigo-600 hover:shadow-[0_10px_25px_-5px_rgba(0,0,0,0.05)] hover:-translate-y-0.5 text-left cursor-pointer"
    >
      <div className="space-y-4">
        {/* Card Header: Icon & Category/Badge */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-center text-slate-700 transition-colors duration-200 group-hover:bg-indigo-50 group-hover:text-indigo-600 group-hover:border-indigo-100 shrink-0">
              <IconRenderer name={project.icon} className="w-6 h-6" />
            </div>
            <div className="min-w-0">
              <h3 className="text-lg font-bold text-slate-900 leading-snug group-hover:text-indigo-600 transition-colors duration-150 truncate">
                {project.title}
              </h3>
              {project.category && (
                <span className="text-xs text-slate-500 font-medium block truncate">
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
        <p className="text-sm text-slate-500 line-clamp-2 leading-relaxed h-[42px]">
          {project.description}
        </p>
      </div>

      {/* Button Open */}
      <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between gap-2">
        <div className="w-full bg-slate-50 border border-slate-200 py-2.5 px-4 rounded-xl text-center text-sm font-semibold text-slate-800 flex items-center justify-center gap-2 group-hover:bg-indigo-600 group-hover:text-white group-hover:border-indigo-600 transition-all duration-150">
          <span>Открыть проект</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </div>
      </div>
    </a>
  );
};
