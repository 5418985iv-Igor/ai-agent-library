import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { REGISTERED_AGENTS, getAgentSystemPrompt } from './server/agents/index';
import { generateChatResponse, ChatMessage } from './server/openai';

dotenv.config();

// Безопасное получение пути к текущему файлу для ESM и CJS
const currentFilename =
  typeof __filename !== 'undefined'
    ? __filename
    : fileURLToPath(import.meta.url);
const currentDirname =
  typeof __dirname !== 'undefined'
    ? __dirname
    : path.dirname(currentFilename);

async function startServer() {
  const app = express();

  // Определяем среду выполнения:
  // 1. В dev-контейнере Google AI Studio reverse proxy (nginx) жестко настроен на порт 3000.
  // 2. При деплое на сервер (Google Cloud Run, VPS с Nginx/Docker, Render, Heroku и др.)
  //    хост передаёт нужный порт в переменной окружения PORT (например, Cloud Run слушает 8080).
  const isAiStudioDev = Boolean(process.env.CONTROL_PLANE_PORT || process.env.DEFAULT_APP_PORT);
  const PORT = isAiStudioDev
    ? 3000
    : (process.env.PORT ? parseInt(process.env.PORT, 10) : 3000);

  // Определение production:
  // Если запущена скомпилированная сборка dist/server.cjs или NODE_ENV === 'production'
  const isProduction =
    process.env.NODE_ENV === 'production' ||
    currentFilename.endsWith('.cjs') ||
    currentFilename.endsWith('.js');

  app.use(express.json({ limit: '5mb' }));

  // Health Check endpoints (необходимы для Cloud Run, Docker и Nginx upstream healthcheck)
  app.get(['/health', '/api/health'], (_req, res) => {
    res.json({
      status: 'ok',
      port: PORT,
      environment: isProduction ? 'production' : 'development',
      timestamp: new Date().toISOString(),
    });
  });

  // API Registered Agents Info
  app.get('/api/agents', (_req, res) => {
    const list = Object.values(REGISTERED_AGENTS).map((agent) => ({
      id: agent.id,
      name: agent.name,
      description: agent.description,
    }));
    res.json({ agents: list });
  });

  // API Chat Endpoint
  app.post('/api/chat', async (req, res) => {
    try {
      const { agent, messages } = req.body;

      if (!agent || typeof agent !== 'string') {
        return res.status(400).json({ error: 'Параметр agent обязателен' });
      }

      const agentDef = REGISTERED_AGENTS[agent];
      if (!agentDef) {
        console.warn(`[Chat API] Отклонён неизвестный агент: ${agent}`);
        return res.status(400).json({ error: `Неизвестный агент: ${agent}` });
      }

      if (!Array.isArray(messages) || messages.length === 0) {
        return res.status(400).json({ error: 'Массив messages не может быть пустым' });
      }

      // Filter and sanitize messages
      const validMessages: ChatMessage[] = messages
        .filter(
          (m: any) =>
            m &&
            (m.role === 'user' || m.role === 'assistant') &&
            typeof m.content === 'string'
        )
        .map((m: any) => ({
          role: m.role as 'user' | 'assistant',
          content: m.content.trim(),
        }))
        .filter((m: any) => m.content.length > 0);

      if (validMessages.length === 0) {
        return res.status(400).json({ error: 'Сообщение не может быть пустым' });
      }

      const lastMessage = validMessages[validMessages.length - 1];
      if (lastMessage.content.length > 30000) {
        return res.status(400).json({
          error: 'Сообщение слишком длинное (максимум 30 000 символов)',
        });
      }

      const systemPrompt = getAgentSystemPrompt(agent);

      const reply = await generateChatResponse(
        systemPrompt,
        validMessages,
        agentDef.defaultModel
      );

      return res.json({ reply });
    } catch (error: any) {
      console.error('[Chat API Error]:', error);

      if (error?.message === 'OPENAI_API_KEY_MISSING') {
        return res.status(500).json({
          error:
            'API-ключ OpenAI не настроен на сервере. Пожалуйста, укажите OPENAI_API_KEY в файле .env.',
        });
      }

      if (error?.status === 401 || error?.code === 'invalid_api_key') {
        return res.status(500).json({
          error:
            'Недействительный ключ API OpenAI. Проверьте переменную OPENAI_API_KEY в .env.',
        });
      }

      if (error?.status === 429) {
        return res.status(429).json({
          error:
            'Превышен лимит запросов к AI (Rate limit). Пожалуйста, подождите немного и повторите попытку.',
        });
      }

      return res.status(500).json({
        error: 'Не удалось получить ответ от AI. Попробуйте ещё раз.',
      });
    }
  });

  // Vite middleware for development vs static build in production
  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // В production раздаём статические файлы из директории dist
    const candidateDistPaths = [
      path.join(process.cwd(), 'dist'),
      currentDirname,
      path.resolve(currentDirname, '..', 'dist'),
    ];
    const distPath =
      candidateDistPaths.find((p) => fs.existsSync(path.join(p, 'index.html'))) ||
      candidateDistPaths[0];

    app.use(express.static(distPath));

    app.get('*', (_req, res) => {
      const indexPath = path.join(distPath, 'index.html');
      if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
      } else {
        res
          .status(404)
          .send('Сборка приложения не найдена. Пожалуйста, выполните "npm run build".');
      }
    });
  }

  // Обработчик непредвиденных ошибок Express
  app.use(
    (
      err: any,
      _req: express.Request,
      res: express.Response,
      _next: express.NextFunction
    ) => {
      console.error('[Unhandled Server Error]:', err);
      if (!res.headersSent) {
        res.status(500).json({
          error: 'Внутренняя ошибка сервера',
          message: err?.message || 'Unknown error',
        });
      }
    }
  );

  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(
      `[Server] Запущен на http://0.0.0.0:${PORT} (${
        isProduction ? 'PRODUCTION' : 'DEVELOPMENT'
      })`
    );
  });

  // Корректное завершение работы при сигналах контейнера (Cloud Run, Docker, Kubernetes)
  const shutdown = (signal: string) => {
    console.log(`[Server] Получен сигнал ${signal}, завершение работы...`);
    server.close(() => {
      console.log('[Server] Сервер успешно остановлен.');
      process.exit(0);
    });
    setTimeout(() => {
      console.error('[Server] Принудительное завершение по таймауту.');
      process.exit(1);
    }, 5000);
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
