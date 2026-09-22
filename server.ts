import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { REGISTERED_AGENTS, getAgentSystemPrompt } from './server/agents/index';
import { generateChatResponse, ChatMessage } from './server/openai';

// Безопасное получение пути к текущему файлу для ESM и CJS
const currentFilename =
  typeof __filename !== 'undefined'
    ? __filename
    : fileURLToPath(import.meta.url);
const currentDirname =
  typeof __dirname !== 'undefined'
    ? __dirname
    : path.dirname(currentFilename);

/**
 * Получение всех возможных путей к файлам конфигурации env:
 * Поддерживает запуск из корня, из подкаталога dist (на VDS),
 * через PM2/systemd с любым working directory, а также файлы .env и env (без точки).
 */
function getAllEnvCandidatePaths(): string[] {
  const candidateDirs = [
    process.cwd(),
    currentDirname,
    path.resolve(currentDirname, '..'),
    path.resolve(process.cwd(), '..'),
    path.resolve(currentDirname, '../..'),
  ];

  const candidateFilenames = [
    '.env',
    'env',
    '.env.local',
    'env.local',
    '.env.production',
    'env.production',
  ];

  const paths: string[] = [];
  const seen = new Set<string>();

  for (const dir of candidateDirs) {
    for (const file of candidateFilenames) {
      const fullPath = path.resolve(dir, file);
      if (!seen.has(fullPath)) {
        seen.add(fullPath);
        paths.push(fullPath);
      }
    }
  }
  return paths;
}

/**
 * Загрузка всех найденных файлов env в process.env при старте
 */
function loadAllEnvFiles(): void {
  const candidatePaths = getAllEnvCandidatePaths();
  for (const filePath of candidatePaths) {
    if (fs.existsSync(filePath)) {
      try {
        const content = fs.readFileSync(filePath, 'utf-8');
        const parsed = dotenv.parse(content);
        for (const [key, value] of Object.entries(parsed)) {
          if (!process.env[key] || process.env[key]?.trim() === '') {
            process.env[key] = value;
          }
        }
      } catch (err) {
        console.warn(`[Env] Ошибка чтения файла ${filePath}:`, err);
      }
    }
  }
}

// Первичная загрузка env при старте сервера
loadAllEnvFiles();

/**
 * Получение пароля доступа из process.env или непосредственно с диска (для динамического обновления)
 */
function getConfiguredPassword(): string | null {
  const possibleKeys = [
    'VITE_PROJECTS_PASSWORD',
    'PROJECTS_PASSWORD',
    'PROJECT_PASSWORD',
  ];

  // 1. Проверяем переменные в process.env
  for (const key of possibleKeys) {
    const val = process.env[key];
    if (val && typeof val === 'string' && val.trim() !== '') {
      return val.trim();
    }
  }

  // 2. Если в process.env не задано, сканируем файлы конфигурации на диске
  // (актуально, если на VDS файл назван env без точки, находится в родительском каталоге или был отредактирован без перезапуска сервера)
  const candidatePaths = getAllEnvCandidatePaths();

  for (const filePath of candidatePaths) {
    if (fs.existsSync(filePath)) {
      try {
        const content = fs.readFileSync(filePath, 'utf-8');
        const parsed = dotenv.parse(content);

        // Обновляем process.env
        for (const [k, v] of Object.entries(parsed)) {
          process.env[k] = v;
        }

        for (const key of possibleKeys) {
          const val = parsed[key];
          if (val && typeof val === 'string' && val.trim() !== '') {
            const cleanVal = val.replace(/^["'](.*)["']$/, '$1').trim();
            if (cleanVal) {
              process.env[key] = cleanVal;
              return cleanVal;
            }
          }
        }

        // Строчный разбор regex на случай кастомного синтаксиса (например, VITE_PROJECTS_PASSWORD: 1234 или export)
        for (const line of content.split(/\r?\n/)) {
          const trimmed = line.trim();
          if (!trimmed || trimmed.startsWith('#')) continue;
          const match = trimmed.match(
            /^(?:export\s+)?(VITE_PROJECTS_PASSWORD|PROJECTS_PASSWORD|PROJECT_PASSWORD)\s*[:=]\s*(.*)$/
          );
          if (match) {
            let val = match[2].trim();
            val = val.replace(/^["'](.*)["']$/, '$1').trim();
            if (val) {
              process.env[match[1]] = val;
              return val;
            }
          }
        }
      } catch (err) {
        console.warn(`[Auth] Ошибка при чтении файла конфигурации ${filePath}:`, err);
      }
    }
  }

  return null;
}

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

  // API Auth Status Endpoint (проверка, настроен ли пароль в .env)
  app.get('/api/auth/status', (_req, res) => {
    const configuredPassword = getConfiguredPassword();
    const isConfigured = Boolean(
      configuredPassword && configuredPassword.trim() !== ''
    );
    res.json({
      configured: isConfigured,
    });
  });

  // API Auth Verify Endpoint (строгая проверка пароля только из .env сервера, без дефолтов)
  app.post('/api/auth/verify', (req, res) => {
    const { password } = req.body || {};
    const configuredPassword = getConfiguredPassword();

    // Если пароль в env не задан — доступ блокируется, дефолтов нет
    if (!configuredPassword || configuredPassword.trim() === '') {
      const candidatePaths = getAllEnvCandidatePaths();
      const existingEnvFiles = candidatePaths.filter((p) => fs.existsSync(p));
      const diagnosticInfo =
        existingEnvFiles.length > 0
          ? `Обнаружены файлы конфигурации: [${existingEnvFiles.map((p) => path.basename(p)).join(', ')}], но в них не найдена переменная VITE_PROJECTS_PASSWORD.`
          : `Файл .env не найден ни в текущей папке (${process.cwd()}), ни в корне приложения (${path.resolve(currentDirname, '..')}).`;

      console.warn(`[Auth Verify Failed] ${diagnosticInfo}`);

      return res.status(500).json({
        success: false,
        error: `Пароль доступа не настроен на сервере. ${diagnosticInfo} Пожалуйста, убедитесь, что файл называется .env и содержит строку: VITE_PROJECTS_PASSWORD=ваш_пароль`,
      });
    }

    if (typeof password !== 'string' || !password.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Пожалуйста, введите пароль для доступа.',
      });
    }

    // Точное сравнение пароля из запроса с паролем из env
    if (password.trim() === configuredPassword.trim()) {
      return res.json({ success: true });
    } else {
      return res.status(401).json({
        success: false,
        error: 'Неверный пароль. Пожалуйста, проверьте правильность ввода.',
      });
    }
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
