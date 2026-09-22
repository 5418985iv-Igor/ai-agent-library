# 🚀 Бибилиотека проектов — Стартовая страница & Каталог AI-агентов

Современная, быстрая и адаптивная стартовая страница для удобного доступа и быстрого запуска ваших AI-агентов, проектов и сервисов, спроектированная для размещения на собственном Linux VDS-сервере за Nginx.

---

## 📁 Структура проекта

Архитектура проекта построена так, чтобы управление содержимым происходило исключительно через конфигурационные файлы без необходимости вмешиваться в код компонентов:

```text
src/
├── config/
│   ├── projects.ts      # 🌟 Список всех проектов и AI-агентов (добавляйте новые сюда!)
│   ├── contacts.ts      # 📞 Ваши контактные данные (Email, Telegram, соцсети)
│   └── site.ts          # ⚙️ Настройки заголовков и брендинга сайта
├── types/
│   └── index.ts         # TypeScript интерфейсы
├── components/
│   ├── Header.tsx       # Шапка с анимированным переключателем вкладок
│   ├── ProjectCard.tsx  # Карточка проекта с ссылкой на AI-агента
│   ├── ProjectsView.tsx # Сетка проектов, поиск и фильтрация по категориям
│   ├── ContactsView.tsx # Вкладка контактов с быстрым копированием
│   ├── IconRenderer.tsx # Динамический рендерер иконок (Lucide)
│   └── Footer.tsx       # Подвал сайта
├── App.tsx              # Корневой компонент
└── main.tsx             # Точка входа Vite + React
```

---

## 🛠️ Как добавить новый AI-проект

Откройте файл `src/config/projects.ts` и просто добавьте новый объект в массив `PROJECTS_CONFIG`:

```typescript
{
  id: "my-custom-gpt",                      // Уникальный идентификатор
  title: "SEO Оптимизатор",                // Название проекта/агента
  description: "Анализ семантики, метатегов и генерация SEO-статей.", // Краткое описание
  icon: "Sparkles",                         // Иконка (Bot, Code2, BarChart3, Brain, FileText, Terminal, etc.)
  url: "https://chatgpt.com/g/g-xxxxxxxx",  // Ссылка на агента или сервис
  category: "Маркетинг",                   // Категория для фильтрации (создается автоматически)
  badge: "GPT-4o",                          // Опциональный бейдж на карточке
  colorTheme: "indigo"                      // Цветовой акцент: indigo, emerald, blue, purple, amber, teal, rose, cyan
}
```

* Количество проектов **не ограничено** — карточки автоматически выстраиваются в адаптивную сетку.
* Все категории **автоматически появляются в панели фильтрации**.
* Поиск работает в реальном времени по названию, описанию и категории.

---

## 📞 Как изменить контактные данные

Откройте файл `src/config/contacts.ts` и отредактируйте ваши данные:

```typescript
export const CONTACTS_CONFIG = {
  name: 'Иван Иванов',
  title: 'AI Prompt Engineer & Developer',
  bio: 'Создаю кастомных AI-агентов под бизнес-задачи.',
  email: 'your@email.com',
  telegram: '@your_username',
  telegramUrl: 'https://t.me/your_username',
  github: 'https://github.com/yourname',
  location: 'Москва / Удаленно',
  workingHours: 'Пн-Пт: 10:00 – 19:00 (МСК)',
  socials: [
    // Дополнительные ссылки
  ]
};
```

---

## 💻 Локальный запуск и разработка

1. **Установка зависимостей**:
   ```bash
   npm install
   ```

2. **Запуск сервера разработки**:
   ```bash
   npm run dev
   ```
   Приложение откроется по адресу `http://localhost:3000`.

3. **Сборка для продакшена**:
   ```bash
   npm run build
   ```
   Скомпилированные статические файлы будут сохранены в папке `dist/`.

---

## 🌐 Размещение на VDS за Nginx

Приложение работает как быстрый full-stack сервис на базе Node.js (раздает интерфейс и обрабатывает API авторизации и AI-агентов):

### Шаг 1. Сборка проекта

Выполните сборку на сервере или локально:

```bash
npm run build
```

Сборка создаст клиентские файлы и серверный файл `dist/server.cjs`.

### Шаг 2. Настройка файла переменных окружения (.env)

В папке проекта на сервере создайте файл `.env`:

```bash
nano .env
```

Укажите ваш пароль доступа и (при необходимости) ключ OpenAI:

```env
VITE_PROJECTS_PASSWORD=ваш_пароль
OPENAI_API_KEY=ваш_openai_ключ
PORT=3000
```

> **Важно**: Имя файла должно быть строго `.env` (с точкой в начале). Сервер автоматически ищет его как в текущей директории, так и в родительской.

### Шаг 3. Запуск сервера (PM2 или systemd)

Рекомендуется запускать сервер через менеджер процессов **PM2**:

```bash
npm install -g pm2
pm2 start dist/server.cjs --name "my-projects"
pm2 save
pm2 startup
```

Или прямой запуск через Node.js:

```bash
node dist/server.cjs
```

### Шаг 4. Настройка Nginx в качестве Reverse Proxy

Создайте конфигурационный файл на VDS:

```bash
sudo nano /etc/nginx/sites-available/my-projects
```

Вставьте следующую конфигурацию с проксированием на локальный Node.js сервер:

```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

    # Gzip сжатие
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Кэширование статических файлов
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        proxy_pass http://127.0.0.1:3000;
        expires 1y;
        add_header Cache-Control "public, no-transform";
    }
}
```

Активируйте сайт и перезапустите Nginx:

```bash
sudo ln -s /etc/nginx/sites-available/my-projects /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### Шаг 5. Подключите бесплатный SSL-сертификат (Let's Encrypt)

```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d your-domain.com -d www.your-domain.com
```

Готово! Теперь ваша страница проектов и AI-агентов доступна по вашему защищенному домену `https://your-domain.com`.
