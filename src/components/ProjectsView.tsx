import React, { useState, useMemo } from 'react';
import { Project } from '../types';
import { ProjectCard } from './ProjectCard';
import { Search, Filter, Code2, Plus, X, Check, Copy, Terminal } from 'lucide-react';

interface ProjectsViewProps {
  projects: Project[];
}

export const ProjectsView: React.FC<ProjectsViewProps> = ({ projects }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showAddGuide, setShowAddGuide] = useState(false);
  const [copiedSnippet, setCopiedSnippet] = useState(false);

  // Extract unique categories
  const categories = useMemo(() => {
    const cats = new Set<string>();
    projects.forEach((p) => {
      if (p.category) cats.add(p.category);
    });
    return Array.from(cats);
  }, [projects]);

  // Filter projects
  const filteredProjects = useMemo(() => {
    return projects.filter((project) => {
      const matchesSearch =
        searchQuery.trim() === '' ||
        project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (project.category && project.category.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (project.badge && project.badge.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesCategory =
        selectedCategory === 'all' || project.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [projects, searchQuery, selectedCategory]);

  const snippetExample = `export const PROJECTS_CONFIG = [
  {
    id: "new-agent",
    title: "Новый AI-агент",
    description: "Описание возможностей и задач агента...",
    icon: "Sparkles",
    url: "https://chatgpt.com/g/...",
    category: "AI-Ассистенты",
    badge: "GPT-4o"
  }
];`;

  const handleCopySnippet = () => {
    navigator.clipboard.writeText(snippetExample);
    setCopiedSnippet(true);
    setTimeout(() => setCopiedSnippet(false), 2000);
  };

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <section className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Библиотека проектов
          </h1>
          <p className="text-base text-slate-500 mt-1">
            Персональная панель управления AI-агентами на вашем VDS
          </p>
        </div>

        <button
          onClick={() => setShowAddGuide(!showAddGuide)}
          className="self-start sm:self-auto inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold font-mono bg-indigo-50 text-indigo-700 border border-indigo-200/70 hover:bg-indigo-100/70 transition-colors cursor-pointer"
        >
          <Code2 className="w-3.5 h-3.5" />
          <span>config/projects.ts</span>
        </button>
      </section>

      {/* Filter & Search Toolbar */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            id="search-projects-input"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Поиск по проектам и агентам..."
            className="w-full pl-9 pr-9 py-2 rounded-xl text-sm bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
          <button
            id="category-filter-all"
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold shrink-0 transition-colors ${
              selectedCategory === 'all'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Все ({projects.length})
          </button>
          {categories.map((cat) => {
            const count = projects.filter((p) => p.category === cat).length;
            return (
              <button
                key={cat}
                id={`category-filter-${cat}`}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold shrink-0 transition-colors ${
                  selectedCategory === cat
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProjects.map((project) => (
          <ProjectCard key={project.id} project={project} />
        ))}

        {/* Dashed "+ Добавить в config" card */}
        <button
          onClick={() => setShowAddGuide(true)}
          className="border-2 border-dashed border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/30 rounded-2xl p-6 flex flex-col items-center justify-center min-h-[190px] text-center text-slate-500 hover:text-indigo-600 transition-all duration-200 cursor-pointer group"
        >
          <div className="w-12 h-12 rounded-xl bg-slate-50 group-hover:bg-indigo-50 group-hover:text-indigo-600 border border-slate-200 flex items-center justify-center text-xl font-bold mb-3 transition-colors">
            <Plus className="w-6 h-6" />
          </div>
          <div className="text-sm font-semibold text-slate-700 group-hover:text-indigo-600">
            Добавить в config
          </div>
          <div className="text-xs text-slate-400 mt-1 font-mono">
            src/config/projects.ts
          </div>
        </button>
      </div>

      {/* Empty Search State */}
      {filteredProjects.length === 0 && (
        <div className="bg-white rounded-2xl p-10 border border-slate-200 text-center max-w-md mx-auto">
          <Search className="w-8 h-8 text-slate-300 mx-auto mb-3" />
          <h4 className="text-base font-bold text-slate-900 mb-1">Ничего не найдено</h4>
          <p className="text-xs text-slate-500 mb-4">
            По запросу «{searchQuery}» нет совпадений.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('all');
            }}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-900 text-white"
          >
            Сбросить фильтры
          </button>
        </div>
      )}

      {/* Architecture Note Footer */}
      <footer className="bg-slate-100/90 border border-dashed border-slate-300/80 p-5 rounded-2xl text-slate-700 text-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-indigo-600 shrink-0" />
            <span className="font-bold text-slate-900">Архитектурная заметка:</span>
          </div>
          <button
            onClick={handleCopySnippet}
            className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800 self-start sm:self-auto cursor-pointer"
          >
            {copiedSnippet ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-700">Скопировано!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Копировать пример</span>
              </>
            )}
          </button>
        </div>
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
          Для добавления нового проекта достаточно расширить массив в файле{' '}
          <code className="px-1.5 py-0.5 rounded bg-white text-indigo-600 font-mono text-xs border border-slate-200">
            src/config/projects.ts
          </code>
          . Интерфейс автоматически перестроится под новое количество карточек.
        </p>

        <div className="mt-3 bg-white p-3 rounded-xl border border-slate-200 font-mono text-xs text-slate-700 overflow-x-auto">
          {snippetExample}
        </div>
      </footer>
    </div>
  );
};
