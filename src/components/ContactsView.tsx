import React, { useState } from 'react';
import { ContactInfo } from '../types';
import { Mail, FileText, Copy, Check, UserCheck, Send } from 'lucide-react';

interface ContactsViewProps {
  contacts: ContactInfo;
}

export const ContactsView: React.FC<ContactsViewProps> = ({ contacts }) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => {
      setCopiedKey(null);
    }, 2000);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header Section */}
      <section className="space-y-1">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Контакты
        </h1>
        <p className="text-sm sm:text-base text-slate-500">
          Официальные реквизиты и контактные данные для связи
        </p>
      </section>

      {/* Main Info Card */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
        {/* Name / Entity */}
        <div className="flex items-start sm:items-center gap-4 pb-6 border-b border-slate-100">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
            <UserCheck className="w-6 h-6" />
          </div>
          <div className="min-w-0 flex-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 font-mono block mb-0.5">
              Индивидуальный предприниматель
            </span>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 leading-snug">
              {contacts.name}
            </h2>
          </div>
        </div>

        {/* Contact Details Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* ИНН */}
          {contacts.inn && (
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex flex-col justify-between gap-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-600">
                    <FileText className="w-4 h-4 text-indigo-600" />
                  </div>
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500 font-mono">
                    ИНН
                  </span>
                </div>
                <button
                  id="copy-inn-btn"
                  onClick={() => handleCopy(contacts.inn!, 'inn')}
                  className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-indigo-600 bg-white px-2 py-1 rounded-md border border-slate-200 transition-colors"
                  title="Скопировать ИНН"
                >
                  {copiedKey === 'inn' ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-600 font-medium">Скопировано</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Копировать</span>
                    </>
                  )}
                </button>
              </div>

              <div>
                <span className="font-mono text-base sm:text-lg font-bold text-slate-900 select-all">
                  {contacts.inn}
                </span>
              </div>
            </div>
          )}

          {/* Email */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex flex-col justify-between gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-600">
                  <Mail className="w-4 h-4 text-indigo-600" />
                </div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 font-mono">
                  Электронная почта
                </span>
              </div>
              <button
                id="copy-email-btn"
                onClick={() => handleCopy(contacts.email, 'email')}
                className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-indigo-600 bg-white px-2 py-1 rounded-md border border-slate-200 transition-colors"
                title="Скопировать Email"
              >
                {copiedKey === 'email' ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-600 font-medium">Скопировано</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Копировать</span>
                  </>
                )}
              </button>
            </div>

            <div>
              <a
                href={`mailto:${contacts.email}`}
                className="font-mono text-sm sm:text-base font-bold text-indigo-600 hover:text-indigo-700 hover:underline break-all transition-colors block"
              >
                {contacts.email}
              </a>
            </div>
          </div>
        </div>

        {/* Action Button for email */}
        <div className="pt-2">
          <a
            id="send-email-action"
            href={`mailto:${contacts.email}`}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl shadow-sm transition-all duration-150 active:scale-[0.99]"
          >
            <Send className="w-4 h-4" />
            <span>Написать на {contacts.email}</span>
          </a>
        </div>
      </div>
    </div>
  );
};

