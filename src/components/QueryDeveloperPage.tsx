import React from 'react';
import { AgentChatView } from './chat/AgentChatView';
import { AgentChatConfig } from '../types';

export const QUERY_DEVELOPER_CONFIG: AgentChatConfig = {
  agentId: 'query-developer',
  title: 'Разработчик запросов 1С',
  description: 'AI-помощник для разработки, анализа и оптимизации запросов 1С.',
  initialMessage: 'Здравствуйте! Опишите задачу или отправьте запрос 1С для анализа.',
  placeholder: 'Опишите задачу, ошибку или отправьте запрос 1С...',
  suggestedPrompts: [
    'Как получить остатки товаров на дату по складам в 1С?',
    'Оптимизировать запрос со срезом последних регистра сведений',
    'Левое соединение документов и справочников с отбором',
    'Как проверить условия ГДЕ и правильность индексации в 1С?',
  ],
  icon: 'Bot',
};

interface QueryDeveloperPageProps {
  onBack: () => void;
}

export const QueryDeveloperPage: React.FC<QueryDeveloperPageProps> = ({ onBack }) => {
  return <AgentChatView config={QUERY_DEVELOPER_CONFIG} onBack={onBack} />;
};
