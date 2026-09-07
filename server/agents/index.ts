import fs from 'fs';
import path from 'path';

export interface AgentDefinition {
  id: string;
  name: string;
  description: string;
  promptFile: string;
  defaultModel?: string;
}

/**
 * Реестр зарегистрированных AI-агентов.
 * Для добавления нового агента в будущем достаточно добавить запись сюда
 * и создать соответствующий файл промпта в server/prompts/<promptFile>.
 */
export const REGISTERED_AGENTS: Record<string, AgentDefinition> = {
  'query-developer': {
    id: 'query-developer',
    name: 'Разработчик запросов 1С',
    description: 'AI-помощник для разработки, анализа и оптимизации запросов 1С.',
    promptFile: 'query-developer.txt',
  },
  // Зарезервированные слоты под будущие проекты:
  // 'developer-forms': {
  //   id: 'developer-forms',
  //   name: 'Разработчик управляемых форм 1С',
  //   description: 'Разработка управляемых форм в 1С:Предприятие 8.3 и 8.5',
  //   promptFile: 'developer-forms.txt',
  // },
  // 'developer-integration': {
  //   id: 'developer-integration',
  //   name: 'Разработка интеграций 1С',
  //   description: 'REST API, HTTP-сервисы, обмены и разбор ошибок',
  //   promptFile: 'developer-integration.txt',
  // },
  // 'code-review-1c': {
  //   id: 'code-review-1c',
  //   name: 'Code Review 1C',
  //   description: 'Анализ кода, стандарты, оптимальность и архитектура',
  //   promptFile: 'code-review-1c.txt',
  // },
  // 'prompt-engineer': {
  //   id: 'prompt-engineer',
  //   name: 'Промпт-инженер',
  //   description: 'Оптимизация и тестирование системных промптов',
  //   promptFile: 'prompt-engineer.txt',
  // },
  // 'developer-architecture': {
  //   id: 'developer-architecture',
  //   name: 'Архитектура 1С',
  //   description: 'Клиент-серверная архитектура платформы 1С',
  //   promptFile: 'developer-architecture.txt',
  // },
};

/**
 * Загружает системный промпт для указанного агента из файловой системы.
 * Позволяет редактировать файл промпта на лету без перезапуска сервера.
 */
export function getAgentSystemPrompt(agentId: string): string {
  const agent = REGISTERED_AGENTS[agentId];
  if (!agent) {
    throw new Error(`Неизвестный агент: ${agentId}`);
  }

  const promptPath = path.join(process.cwd(), 'server', 'prompts', agent.promptFile);

  try {
    if (fs.existsSync(promptPath)) {
      const content = fs.readFileSync(promptPath, 'utf-8').trim();
      return content || `Вы полезный AI-ассистент: ${agent.name}.`;
    }
  } catch (error) {
    console.error(`[Prompts] Ошибка чтения файла промпта ${promptPath}:`, error);
  }

  return `Вы полезный AI-ассистент: ${agent.name}.`;
}
