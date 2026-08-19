import { Project } from '../types';

/**
 * ============================================================================
 * КОНФИГУРАЦИЯ ПРОЕКТОВ И AI-АГЕНТОВ
 * ============================================================================
 * Чтобы добавить новый проект или AI-агента, просто добавьте новый объект в массив:
 * 
 * {
 *   id: "my-new-agent",                   // Уникальный ID
 *   title: "Название агента",             // Название карточки
 *   description: "Краткое описание...",   // Описание задач и возможностей
 *   icon: "Sparkles",                     // Иконка (Bot, Code, BarChart, Sparkles, Brain, Cpu, MessageSquare, Terminal, FileText, Globe, etc.)
 *   url: "https://chatgpt.com/g/...",     // Ссылка на агента в ChatGPT или внешний сервис
 *   category: "Категория",                // Опционально: "AI-Ассистенты", "Разработка", "Аналитика", "Тексты" и т.д.
 *   badge: "GPT-4o",                      // Опционально: бейдж в углу карточки
 *   colorTheme: "indigo",                 // Опционально: indigo, emerald, blue, purple, amber, rose, cyan, violet, teal
 * }
 */

export const PROJECTS_CONFIG: Project[] = [
  {
    id: 'ai-assistant',
    title: 'AI-Ассистент',
    description: 'Универсальный помощник для решения повседневных задач, структурирования информации, планирования и генерации идей.',
    icon: 'Bot',
    url: 'https://chatgpt.com',
    category: 'AI-Ассистенты',
    badge: 'GPT-4o',
    colorTheme: 'indigo',
  },
  {
    id: 'data-analyst',
    title: 'Аналитик',
    description: 'Специализированный агент для обработки данных, анализа метрик, составления отчетов и поиска неочевидных инсайтов.',
    icon: 'BarChart3',
    url: 'https://chatgpt.com',
    category: 'Аналитика',
    badge: 'Data & SQL',
    colorTheme: 'emerald',
  },
  {
    id: 'dev-helper',
    title: 'Помощник разработчика',
    description: 'Инструмент для код-ревью, написания скриптов, отладки архитектуры, генерации тестов и работы с API.',
    icon: 'Code2',
    url: 'https://chatgpt.com',
    category: 'Разработка',
    badge: 'Dev Tools',
    colorTheme: 'blue',
  },
  {
    id: 'content-writer',
    title: 'Копирайтер и Редактор',
    description: 'Создание качественных текстов, статей, постов для соцсетей, технической документации и редактура материалов.',
    icon: 'FileText',
    url: 'https://chatgpt.com',
    category: 'Тексты',
    badge: 'Writing',
    colorTheme: 'purple',
  },
  {
    id: 'prompt-engineer',
    title: 'Промпт-Инженер',
    description: 'Оптимизация и тестирование системных промптов, конструирование цепочек инструкций и fine-tuning агентов.',
    icon: 'Terminal',
    url: 'https://chatgpt.com',
    category: 'Разработка',
    badge: 'Prompt Lab',
    colorTheme: 'teal',
  },
  {
    id: 'strategy-advisor',
    title: 'Бизнес-Стратег',
    description: 'Оценка бизнес-моделей, бенчмаркинг конкурентов, стратегические сессии и подготовка презентаций.',
    icon: 'Brain',
    url: 'https://chatgpt.com',
    category: 'Аналитика',
    badge: 'Strategy',
    colorTheme: 'amber',
  },
];
