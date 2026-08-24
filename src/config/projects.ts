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
    id: 'knowledge-base-standards',
    title: 'База знаний по стандартам',
    description: 'База знаний по стандартам компании',
    icon: 'BookOpenText',
    url: 'https://chatgpt.com',
    category: 'База знаний',
    badge: 'GPT-4o',
    colorTheme: 'indigo',
  },
 {
    id: 'query-developer',
    title: 'AI Разработка запросов 1С',
    description: 'Опытный разработчик 1С с глубокой экспертизой в языке запросов. Твоя задача — помогать писать и оптимизировать сложные запросы в 1С..',
    icon: 'Bot',
    url: 'https://chatgpt.com',
    category: 'Разработка',
    badge: 'GPT-4o',
    colorTheme: 'indigo',
  },
  {
    id: 'developer-forms',
    title: 'AI Разработка управляемых форм',
    description: 'разработчик управляемых форм в 1С:Предприятие 8.3. и 8.5. Асинхронные методы',
    icon: 'BarChart3',
    url: 'https://chatgpt.com',
    category: 'Разработка',
    badge: 'Data & SQL',
    colorTheme: 'emerald',
  },
  {
    id: 'developer-integration',
    title: 'AI Разработка интеграций',
    description: 'REST API, HTTP-сервисы, обмены, разбор ошибок обменов данными.',
    icon: 'Code2',
    url: 'https://chatgpt.com',
    category: 'Разработка',
    badge: 'Dev Tools',
    colorTheme: 'blue',
  },
  {
    id: 'code-review-1c',
    title: 'CODE REVIEW 1С',
    description: 'Анализ кода, соответсвтие стандартам, оптимальность работы, соблюдение архитектуры, переписать код в улучшенном виде.',
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
    category: 'Ассистенты',
    badge: 'Prompt Lab',
    colorTheme: 'teal',
  },
  {
    id: 'developer-architecture',
    title: 'Разработчик клиент-серверной архитектуры',
    description: 'Выступает как опытный разработчик 1С, специализирующийся на клиент-серверной архитектуре платформы.',
    icon: 'Brain',
    url: 'https://chatgpt.com',
    category: 'Разработка',
    badge: 'Strategy',
    colorTheme: 'amber',
  },
];
