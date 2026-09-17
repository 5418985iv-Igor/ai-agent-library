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
 *   promptFile: "/prompts/my-agent.txt",  // Опционально: путь к файлу промпта в public/prompts/
 * }
 */

export const PROJECTS_CONFIG: Project[] = [
  {
    id: 'knowledge-base-standards',
    title: 'База знаний по стандартам',
    description: 'База знаний по стандартам компании',
    icon: 'BookOpenText',
    url: 'https://rag.vivonline.ru/',
    category: 'База знаний',
    badge: 'GPT-4o',
    colorTheme: 'indigo',
    requiresAuth: false,
  },
  {
    id: 'transcription-meetings',
    title: 'Ю-Терм. Протоколы совещаний',
    description: 'Автоматическая расшифровка встреч через GigaSTT (модель GigaAM-v3) с нормализацией текста и формированием кратких протоколов.',
    icon: 'Globe',
    url: 'https://vivonline.ru/meetings',
    category: 'Помощники',
    badge: '1С AI',
    colorTheme: 'indigo',
    requiresAuth: false,
  },
   {
    id: 'query-developer',
    title: 'Разработчик запросов 1С',
    description: 'AI-помощник для разработки, анализа и оптимизации запросов 1С.',
    icon: 'Bot',
    url: 'https://chatgpt.com',
    category: 'Разработка',
    badge: '1С AI',
    colorTheme: 'indigo',
    promptFile: '/prompts/query-developer.txt',
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
    promptFile: '/prompts/developer-forms.txt',
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
    promptFile: '/prompts/developer-integration.txt',
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
    promptFile: '/prompts/code-review-1c.txt',
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
    promptFile: '/prompts/prompt-engineer.txt',
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
    promptFile: '/prompts/developer-architecture.txt',
  },
  {
    id: 'ut-consultant',
    title: 'Консультант 1С:УТ',
    description: 'Методология учета, торговые процессы, склад, взаиморасчеты и закрытие месяца в 1С:Управление торговлей.',
    icon: 'HelpCircle',
    url: 'https://chatgpt.com',
    category: 'Консультации',
    badge: '1С:УТ',
    colorTheme: 'cyan',
    promptFile: '/prompts/ut-consultant.txt',
  },
];
