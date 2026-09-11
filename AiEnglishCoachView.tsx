import React, { useState } from 'react';
import { Languages, Send, Sparkles, MessageSquare, Bot, User, RefreshCw, AlertCircle } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export const AiEnglishCoachView: React.FC = () => {
  const [selectedMode, setSelectedMode] = useState<'speaking' | 'interview' | 'professional' | 'grammar'>('speaking');
  const [promptInput, setPromptInput] = useState('Help me practice with Software Engineer');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);

  const handleStartPractice = async () => {
    if (!promptInput.trim() || loading) return;

    setLoading(true);
    setError(null);

    const initialUserMessage = promptInput;
    const updatedMessages: Message[] = [...messages, { role: 'user', content: initialUserMessage }];
    setMessages(updatedMessages);

    try {
      const response = await fetch('/api/ai/english-coach', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          mode: selectedMode,
          userMessage: initialUserMessage,
          messages: updatedMessages,
        }),
      });

      if (!response.ok) {
        throw new Error(`Server returned status ${response.status}`);
      }

      const data = await response.json();
      const botResponse = data.reply || data.response || data.message || "I'm ready to practice! What topic would you like to cover first?";

      setMessages((prev) => [...prev, { role: 'assistant', content: botResponse }]);
      setPromptInput('');
    } catch (err: any) {
      console.error('Error with AI Coach backend:', err);
      // Fallback response if API endpoint is missing or returns error
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: `Welcome to ${selectedMode.toUpperCase()} practice! Let's work on your goal: "${initialUserMessage}". To get started, introduce yourself or share your first statement.`,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 text-xs font-semibold mb-3">
          <Languages className="w-4 h-4" /> Global AI English Coach
        </div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
          Master English Communication for Global Careers
        </h1>
        <p className="text-slate-600 dark:text-slate-400 mt-2 text-sm">
          Practice speaking, job interview English, and vocabulary with personalized AI feedback.
        </p>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm mb-6">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
          Choose your coaching mode
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
          {[
            { id: 'speaking', label: 'English Speaking' },
            { id: 'interview', label: 'Interview English' },
            { id: 'professional', label: 'Professional English' },
            { id: 'grammar', label: 'Grammar & Vocabulary' },
          ].map((mode) => (
            <button
              key={mode.id}
              onClick={() => setSelectedMode(mode.id as any)}
              className={`p-3 rounded-xl border text-left font-semibold text-sm transition-all ${
                selectedMode === mode.id
                  ? 'bg-slate-900 text-white dark:bg-blue-600 border-slate-900 dark:border-blue-600 shadow-sm'
                  : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-400'
              }`}
            >
              {mode.label}
            </button>
          ))}
        </div>

        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
          What would you like to practice?
        </h2>

        <textarea
          value={promptInput}
          onChange={(e) => setPromptInput(e.target.value)}
          placeholder="e.g., Help me practice for a Software Engineer interview in English..."
          rows={3}
          className="w-full p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4 resize-none"
        />

        {error && (
          <div className="flex items-center gap-2 p-3 mb-4 rounded-lg bg-red-50 dark:bg-red-950/50 text-red-600 dark:text-red-400 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <button
          onClick={handleStartPractice}
          disabled={loading || !promptInput.trim()}
          className="w-full py-3.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-blue-600 dark:hover:bg-blue-500 text-white font-bold text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {loading ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              Starting Practice Session...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              Practice with AI Coach
            </>
          )}
        </button>

        <p className="text-center text-xs text-slate-500 mt-3">
          Current mode: <span className="font-semibold capitalize">{selectedMode}</span>
        </p>
      </div>

      {messages.length > 0 && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-blue-500" /> Active Session
          </h3>
          <div className="space-y-3">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex gap-3 p-3.5 rounded-xl text-sm ${
                  msg.role === 'user'
                    ? 'bg-blue-50 dark:bg-blue-950/50 text-slate-800 dark:text-slate-200 ml-6'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white mr-6'
                }`}
              >
                {msg.role === 'user' ? (
                  <User className="w-4 h-4 shrink-0 text-blue-600 mt-0.5" />
                ) : (
                  <Bot className="w-4 h-4 shrink-0 text-indigo-500 mt-0.5" />
                )}
                <div>
                  <p className="font-bold text-xs text-slate-500 mb-1">
                    {msg.role === 'user' ? 'You' : 'AI English Coach'}
                  </p>
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};