# -----------------------------------------------------------
# Этап 1: Сборка (builder)
# Включает все devDependencies (Vite, esbuild, TypeScript)
# -----------------------------------------------------------
FROM node:20-alpine AS builder

WORKDIR /app

# Установка зависимостей сборщика
COPY package*.json ./
RUN npm ci || npm install

# Копирование исходного кода проекта
COPY . .

# 1. Сборка клиентского SPA (Vite -> dist/)
# 2. Сборка backend-сервера (server.ts -> dist/server.cjs через esbuild)
RUN npm run build || (npx vite build && npx esbuild server.ts --bundle --platform=node --format=cjs --packages=external --outfile=dist/server.cjs)

# Гарантируем наличие dist/server.cjs (даже если build в package.json содержал только vite build)
RUN if [ ! -f dist/server.cjs ]; then npx esbuild server.ts --bundle --platform=node --format=cjs --packages=external --outfile=dist/server.cjs; fi

# -----------------------------------------------------------
# Этап 2: Production образ (runner)
# Без dev-зависимостей, только чистый Node.js runtime
# -----------------------------------------------------------
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Устанавливаем ТОЛЬКО production-зависимости (express, openai, dotenv и т.д.)
COPY package*.json ./
RUN npm ci --omit=dev || npm install --omit=dev

# Копируем скомпилированный фронтенд и бэкенд
COPY --from=builder /app/dist ./dist

# Копируем системные промпты AI-агентов (query-developer.txt)
COPY --from=builder /app/server/prompts ./server/prompts
COPY --from=builder /app/server/prompts ./dist/prompts

# Копируем статические ассеты
COPY --from=builder /app/public ./public

EXPOSE 3000

# Запуск скомпилированного сервера (он раздаёт статический SPA и обрабатывает /api/*)
CMD ["node", "dist/server.cjs"]
