import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { REGISTERED_AGENTS, getAgentSystemPrompt } from './server/agents/index';
import { generateChatResponse, ChatMessage } from './server/openai';

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '5mb' }));

  // API Health Check
  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
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
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
