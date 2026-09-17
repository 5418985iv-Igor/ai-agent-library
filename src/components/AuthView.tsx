import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Lock,
  KeyRound,
  Eye,
  EyeOff,
  ArrowLeft,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  Loader2,
} from 'lucide-react';
import { Project } from '../types';
import { IconRenderer } from './IconRenderer';

interface AuthViewProps {
  targetProject: Project | null;
  onAuthSuccess: () => void;
  onCancel: () => void;
}

export const AuthView: React.FC<AuthViewProps> = ({
  targetProject,
  onAuthSuccess,
  onCancel,
}) => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isConfiguredOnServer, setIsConfiguredOnServer] = useState<boolean | null>(null);
  const [isCapsOn, setIsCapsOn] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Focus password input on mount
    inputRef.current?.focus();

    // Проверяем статус конфигурации пароля на сервере
    let isMounted = true;
    fetch('/api/auth/status')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (isMounted && data && typeof data.configured === 'boolean') {
          setIsConfiguredOnServer(data.configured);
        }
      })
      .catch(() => {
        // Игнорируем сетевые ошибки при фоновом запросе статуса
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleKeyUp = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.getModifierState) {
      setIsCapsOn(e.getModifierState('CapsLock'));
    }
  };

  const handleSuccess = () => {
    setIsSuccess(true);
    setError(null);

    // Save auth state
    sessionStorage.setItem('is_projects_authenticated', 'true');
    if (rememberMe) {
      localStorage.setItem('is_projects_authenticated', 'true');
    }

    // Short delay for success feedback while preserving user gesture
    setTimeout(() => {
      onAuthSuccess();
    }, 150);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const enteredPassword = password.trim();

    if (!enteredPassword) {
      setError('Пожалуйста, введите пароль для доступа.');
      inputRef.current?.focus();
      return;
    }

    setIsLoading(true);

    try {
      // 1. Проверяем пароль через серверный API /api/auth/verify (пароль берётся строго из env сервера)
      const response = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password: enteredPassword }),
      });

      const data = await response.json().catch(() => null);

      if (response.ok && data?.success) {
        handleSuccess();
        return;
      }

      if (data?.error) {
        setError(data.error);
        inputRef.current?.select();
        return;
      }

      if (response.status === 401) {
        setError('Неверный пароль. Пожалуйста, проверьте правильность ввода.');
        inputRef.current?.select();
        return;
      }

      throw new Error(`Ошибка сервера (${response.status})`);
    } catch (err) {
      // 2. Резервная проверка только при сбое сети или автономном SPA режиме:
      // ВНИМАНИЕ: Пароли по умолчанию (например, 'admin') строго запрещены!
      // Значение берётся исключительно из VITE_PROJECTS_PASSWORD, если переменная задана.
      const clientEnvPassword = import.meta.env.VITE_PROJECTS_PASSWORD;

      if (clientEnvPassword && typeof clientEnvPassword === 'string' && clientEnvPassword.trim() !== '') {
        if (enteredPassword === clientEnvPassword.trim()) {
          handleSuccess();
          return;
        } else {
          setError('Неверный пароль. Пожалуйста, проверьте правильность ввода.');
          inputRef.current?.select();
          return;
        }
      }

      setError(
        'Пароль доступа не настроен в .env на сервере. Укажите переменную VITE_PROJECTS_PASSWORD в файле .env.'
      );
      inputRef.current?.select();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto py-4 sm:py-8">
      {/* Back button */}
      <div className="mb-6">
        <button
          id="auth-back-button"
          type="button"
          onClick={onCancel}
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors cursor-pointer group"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          <span>Вернуться к проектам</span>
        </button>
      </div>

      {/* Main Auth Card */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
        {/* Card Header Banner */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 sm:p-8 text-white relative overflow-hidden">
          <div className="absolute right-0 top-0 translate-x-4 -translate-y-4 w-40 h-40 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />
          
          <div className="relative z-10 flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-300 shrink-0">
              <Lock className="w-6 h-6" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/30 text-indigo-200 border border-indigo-400/20 mb-2">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Защищенный доступ</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                Авторизация проектов
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 mt-1">
                Для перехода к сервисам и AI-агентам введите мастер-пароль
              </p>
            </div>
          </div>
        </div>

        <div className="p-6 sm:p-8 space-y-6">
          {/* Target Project Info (if selected) */}
          {targetProject && (
            <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-indigo-600 shrink-0 shadow-xs">
                <IconRenderer name={targetProject.icon} className="w-5 h-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500 font-medium">Выбранный проект:</span>
                  {targetProject.category && (
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-200/70 text-slate-700 font-medium">
                      {targetProject.category}
                    </span>
                  )}
                </div>
                <h3 className="text-sm font-bold text-slate-800 truncate">
                  {targetProject.title}
                </h3>
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="projects-password-input"
                className="block text-sm font-semibold text-slate-700 mb-1.5"
              >
                Пароль доступа
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <KeyRound className="w-4 h-4" />
                </div>
                <input
                  id="projects-password-input"
                  ref={inputRef}
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (error) setError(null);
                  }}
                  onKeyUp={handleKeyUp}
                  placeholder="Введите пароль..."
                  autoComplete="current-password"
                  className={`w-full pl-10 pr-11 py-2.5 bg-white border rounded-xl text-sm text-slate-900 placeholder:text-slate-400 transition-all outline-none focus:ring-2 ${
                    error
                      ? 'border-red-400 focus:border-red-500 focus:ring-red-100'
                      : 'border-slate-300 focus:border-indigo-600 focus:ring-indigo-100'
                  }`}
                />
                <button
                  id="toggle-password-visibility-button"
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                  title={showPassword ? 'Скрыть пароль' : 'Показать пароль'}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>

              {/* CapsLock warning */}
              {isCapsOn && (
                <p className="text-xs text-amber-600 mt-1.5 flex items-center gap-1 font-medium">
                  <AlertCircle className="w-3.5 h-3.5" />
                  Включен Caps Lock
                </p>
              )}

              {/* Notice if password is not configured in .env on server */}
              {isConfiguredOnServer === false && (
                <div className="mt-2 text-xs text-amber-800 bg-amber-50 border border-amber-200/80 rounded-lg p-3 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold">Внимание:</span> в файле <code className="bg-amber-100/70 px-1 py-0.5 rounded font-mono text-[11px]">.env</code> на сервере не задана переменная <code className="bg-amber-100/70 px-1 py-0.5 rounded font-mono text-[11px]">VITE_PROJECTS_PASSWORD</code>. Доступ по умолчанию отключен.
                  </div>
                </div>
              )}

              {/* Error Message */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    className="mt-2 text-xs font-semibold text-red-600 flex items-center gap-1.5 bg-red-50 border border-red-200/80 rounded-lg p-2.5"
                  >
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{error}</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Remember Me Checkbox */}
            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 text-slate-600 cursor-pointer select-none">
                <input
                  id="remember-session-checkbox"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                />
                <span>Запомнить авторизацию в браузере</span>
              </label>
            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
              <button
                id="submit-auth-button"
                type="submit"
                disabled={isSuccess || isLoading}
                className={`w-full flex-1 py-2.5 px-4 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm ${
                  isSuccess
                    ? 'bg-emerald-600 hover:bg-emerald-700'
                    : isLoading
                    ? 'bg-indigo-400 cursor-wait'
                    : 'bg-indigo-600 hover:bg-indigo-700 active:scale-[0.99]'
                }`}
              >
                {isSuccess ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 animate-bounce" />
                    <span>Успешно! Открываем...</span>
                  </>
                ) : isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Проверка пароля...</span>
                  </>
                ) : (
                  <>
                    <KeyRound className="w-4 h-4" />
                    <span>
                      {targetProject ? 'Подтвердить и открыть проект' : 'Войти и разблокировать'}
                    </span>
                  </>
                )}
              </button>

              <button
                id="cancel-auth-button"
                type="button"
                onClick={onCancel}
                className="w-full sm:w-auto py-2.5 px-4 rounded-xl text-sm font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 border border-slate-200 transition-colors cursor-pointer"
              >
                Отмена
              </button>
            </div>
          </form>

         
        </div>
      </div>
    </div>
  );
};
