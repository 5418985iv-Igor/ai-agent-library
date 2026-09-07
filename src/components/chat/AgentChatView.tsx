import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowLeft,
  Send,
  Bot,
  User,
  Sparkles,
  RotateCcw,
  AlertCircle,
  Code2,
  Database,
  Lightbulb,
  CheckCircle2,
} from 'lucide-react';
import { ChatMessage, AgentChatConfig } from '../../types';
import { MarkdownContent } from './MarkdownContent';
import { VoiceInputButton } from './VoiceInputButton';

interface AgentChatViewProps {
  config: AgentChatConfig;
  onBack: () => void;
}

export const AgentChatView: React.FC<AgentChatViewProps> = ({ config, onBack }) => {
  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: 'welcome-msg',
      role: 'assistant',
      content:
        config.initialMessage ||
        'Здравствуйте! Опишите задачу или отправьте запрос 1С для анализа.',
      timestamp: Date.now(),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom of chat
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Auto resize textarea
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputText(e.target.value);
    adjustTextareaHeight();
  };

  const adjustTextareaHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(
        textareaRef.current.scrollHeight,
        220
      )}px`;
    }
  };

  // Voice transcript handler
  const handleVoiceTranscript = (text: string) => {
    setInputText((prev) => {
      const next = prev ? `${prev} ${text}` : text;
      setTimeout(adjustTextareaHeight, 50);
      return next;
    });
  };

  // Clear chat
  const handleClearChat = () => {
    setMessages([
      {
        id: `welcome-${Date.now()}`,
        role: 'assistant',
        content:
          config.initialMessage ||
          'Здравствуйте! Опишите задачу или отправьте запрос 1С для анализа.',
        timestamp: Date.now(),
      },
    ]);
    setErrorMessage(null);
    setInputText('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  // Send message
  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend !== undefined ? textToSend : inputText).trim();
    if (!text || isLoading) return;

    setErrorMessage(null);

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: Date.now(),
    };

    // Update state with user message
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInputText('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    setIsLoading(true);

    try {
      // Prepare message history for backend (only user and assistant messages)
      const payloadMessages = updatedMessages
        .filter((m) => m.role === 'user' || m.role === 'assistant')
        .map((m) => ({
          role: m.role,
          content: m.content,
        }));

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          agent: config.agentId,
          messages: payloadMessages,
        }),
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        throw new Error(data.error || 'Не удалось получить ответ от AI');
      }

      const aiMessage: ChatMessage = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        content: data.reply,
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (err: any) {
      console.error('Chat error:', err);
      const errText =
        err?.message ||
        'Не удалось получить ответ от AI. Попробуйте ещё раз или проверьте настройки сервера.';
      setErrorMessage(errText);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const defaultSuggestedPrompts = config.suggestedPrompts || [
    'Как получить остатки товаров на дату по складам?',
    'Оптимизировать запрос с виртуальной таблицей среза последних',
    'Соединение справочников с отбором по реквизиту табличной части',
    'Как правильно использовать ПУСТАЯТАБЛИЦА и ВЫРАЗИТЬ в 1С?',
  ];

  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col h-[calc(100vh-140px)] min-h-[580px] bg-white border border-slate-200/90 rounded-2xl shadow-sm overflow-hidden">
      {/* 1. Header Bar */}
      <div className="px-4 sm:px-6 py-3.5 bg-slate-50/80 border-b border-slate-200 flex items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={onBack}
            type="button"
            id="chat-back-button"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:text-indigo-600 hover:border-indigo-200 hover:bg-indigo-50/50 text-sm font-semibold transition-all cursor-pointer shrink-0 shadow-xs"
            title="Вернуться к каталогу проектов"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden xs:inline">Назад</span>
          </button>

          <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-xs shrink-0">
            <Bot className="w-5 h-5" />
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-bold text-slate-900 truncate">
                {config.title}
              </h1>
              <span className="hidden md:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                AI Онлайн
              </span>
            </div>
            <p className="text-xs text-slate-500 truncate hidden sm:block">
              {config.description}
            </p>
          </div>
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleClearChat}
            type="button"
            id="chat-clear-button"
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-medium text-slate-600 hover:text-slate-900 bg-white border border-slate-200 hover:bg-slate-50 transition-colors cursor-pointer"
            title="Очистить историю диалога"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
            <span className="hidden sm:inline">Очистить диалог</span>
          </button>
        </div>
      </div>

      {/* 2. Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6 space-y-5 bg-[#f8fafc]/50">
        <AnimatePresence initial={false}>
          {messages.map((msg, idx) => {
            const isUser = msg.role === 'user';
            return (
              <motion.div
                key={msg.id || idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className={`flex gap-3.5 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {/* AI Avatar */}
                {!isUser && (
                  <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white shrink-0 mt-0.5 shadow-xs">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                {/* Message Bubble */}
                <div
                  className={`max-w-[88%] sm:max-w-[80%] rounded-2xl p-4 text-sm sm:text-[15px] shadow-xs ${
                    isUser
                      ? 'bg-indigo-600 text-white rounded-tr-xs'
                      : 'bg-white border border-slate-200/90 text-slate-800 rounded-tl-xs'
                  }`}
                >
                  {isUser ? (
                    <div className="whitespace-pre-wrap leading-relaxed">{msg.content}</div>
                  ) : (
                    <MarkdownContent content={msg.content} />
                  )}
                </div>

                {/* User Avatar */}
                {isUser && (
                  <div className="w-8 h-8 rounded-xl bg-slate-800 flex items-center justify-center text-slate-100 shrink-0 mt-0.5 shadow-xs">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>

        {/* Loading Indicator */}
        {isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3"
          >
            <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white shrink-0 shadow-xs">
              <Bot className="w-4 h-4 animate-pulse" />
            </div>
            <div className="bg-white border border-slate-200/90 rounded-2xl rounded-tl-xs px-4 py-3 text-sm text-slate-600 shadow-xs flex items-center gap-2">
              <div className="flex space-x-1">
                <span className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                <span className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                <span className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce"></span>
              </div>
              <span className="text-slate-500 font-medium ml-1">AI печатает ответ...</span>
            </div>
          </motion.div>
        )}

        {/* Error Banner */}
        {errorMessage && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-start justify-between gap-3 shadow-xs"
          >
            <div className="flex items-start gap-2.5">
              <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Произошла ошибка</p>
                <p className="text-rose-700 mt-0.5 text-xs sm:text-sm">{errorMessage}</p>
              </div>
            </div>
            <button
              onClick={() => {
                const lastUserMsg = [...messages].reverse().find((m) => m.role === 'user');
                if (lastUserMsg) {
                  handleSendMessage(lastUserMsg.content);
                }
              }}
              type="button"
              className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-lg shrink-0 transition-colors cursor-pointer"
            >
              Повторить
            </button>
          </motion.div>
        )}

        {/* Quick Suggested Prompts (when only welcome message is present) */}
        {messages.length === 1 && !isLoading && (
          <div className="pt-2 pb-2">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 mb-2.5 px-1">
              <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
              <span>Частые сценарии и примеры запросов:</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {defaultSuggestedPrompts.map((prompt, pIdx) => (
                <button
                  key={pIdx}
                  type="button"
                  onClick={() => handleSendMessage(prompt)}
                  className="text-left p-3 rounded-xl bg-white border border-slate-200/90 hover:border-indigo-300 hover:bg-indigo-50/40 text-xs sm:text-sm text-slate-700 hover:text-indigo-900 transition-all duration-150 cursor-pointer flex items-center justify-between gap-2 shadow-xs group"
                >
                  <span className="line-clamp-2">{prompt}</span>
                  <Send className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600 shrink-0 transition-colors" />
                </button>
              ))}
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* 3. Input Footer Area */}
      <div className="p-3 sm:p-4 bg-white border-t border-slate-200 shrink-0">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-end gap-2"
        >
          {/* Voice Input Button */}
          <VoiceInputButton
            onTranscript={handleVoiceTranscript}
            disabled={isLoading}
          />

          {/* Textarea */}
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              id="chat-input-textarea"
              value={inputText}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              disabled={isLoading}
              rows={1}
              placeholder={
                config.placeholder ||
                'Опишите задачу, ошибку или отправьте запрос 1С...'
              }
              className="w-full resize-none rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm sm:text-base text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-slate-50 disabled:text-slate-400 leading-relaxed max-h-[220px] transition-shadow"
            />
          </div>

          {/* Send Button */}
          <button
            type="submit"
            id="chat-submit-button"
            disabled={!inputText.trim() || isLoading}
            title="Отправить (Enter)"
            className={`p-2.5 sm:px-4 sm:py-2.5 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all duration-150 shrink-0 cursor-pointer ${
              inputText.trim() && !isLoading
                ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs shadow-indigo-100 hover:scale-[1.02]'
                : 'bg-slate-100 text-slate-400 border border-slate-200/80 cursor-not-allowed'
            }`}
          >
            <Send className="w-4 h-4 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline text-sm">Отправить</span>
          </button>
        </form>

        <div className="flex items-center justify-between text-[11px] text-slate-600 mt-2 px-1">
          <span className="hidden xs:inline">
            <strong className="text-slate-700">Enter</strong> — отправить,{' '}
            <strong className="text-slate-700">Shift + Enter</strong> — новая строка
          </span>
          <span className="text-slate-600">На базе OpenAI GPT-4o</span>
        </div>
      </div>
    </div>
  );
};
