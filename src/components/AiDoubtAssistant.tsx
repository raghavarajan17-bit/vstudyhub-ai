import React, { useState, useRef, useEffect } from 'react';
import { 
  Sparkles, Send, Bot, User, Atom, FlaskConical, Calculator, Dna, 
  HelpCircle, Lightbulb, Check, Copy, RefreshCw, AlertTriangle, BookOpen, Target
} from 'lucide-react';
import { SubjectId, ExamType, AiDoubtMessage, AiDoubtMode } from '../types';
import { MathFormula } from './MathFormula';

interface AiDoubtAssistantProps {
  selectedExam: ExamType;
}

export const AiDoubtAssistant: React.FC<AiDoubtAssistantProps> = ({ selectedExam }) => {
  const [messages, setMessages] = useState<AiDoubtMessage[]>([
    {
      id: 'welcome-msg',
      sender: 'assistant',
      text: `Hello Aspirant! 👋 I am your VStudy Master Tutor, powered by server-side Gemini 3.6.
I can explain concepts, derive LaTeX formulas, detect common exam traps, and solve numericals across Physics, Chemistry, Math, and Biology.

Choose your preferred teaching mode below and ask any question!`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const [inputQuery, setInputQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState<SubjectId>('physics');
  const [selectedMode, setSelectedMode] = useState<AiDoubtMode>('step_by_step');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const sampleQuestions = [
    { subject: 'physics', mode: 'advanced_jee', text: 'Find time period of small oscillations for a uniform cylinder rolling without slipping on a concave cylindrical surface.' },
    { subject: 'chemistry', mode: 'step_by_step', text: 'Explain SN1 vs SN2 mechanism with stereochemistry and carbocation rearrangement in 3D.' },
    { subject: 'mathematics', mode: 'advanced_jee', text: 'Derive shortest distance between two skew lines in 3D vector space and solve a sample JEE Adv problem.' },
    { subject: 'biology', mode: 'neet_biology', text: 'Explain Lac Operon model in E. coli with NCERT line references and regulator/operator roles.' },
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSendDoubt = async (queryText?: string) => {
    const textToSend = queryText || inputQuery;
    if (!textToSend.trim() || loading) return;

    const userMsg: AiDoubtMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: textToSend,
      mode: selectedMode,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!queryText) setInputQuery('');
    setLoading(true);

    try {
      const response = await fetch('/api/ai/solve-doubt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: textToSend,
          subject: selectedSubject,
          exam: selectedExam,
          mode: selectedMode,
          conversationHistory: messages.map(m => ({ sender: m.sender, text: m.text })),
        }),
      });

      const data = await response.json();

      if (data.success) {
        const assistantMsg: AiDoubtMessage = {
          id: `ai-${Date.now()}`,
          sender: 'assistant',
          text: data.solutionText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages((prev) => [...prev, assistantMsg]);
      } else {
        const errorMsg: AiDoubtMessage = {
          id: `ai-err-${Date.now()}`,
          sender: 'assistant',
          text: `⚠️ Error: ${data.error || 'Failed to solve doubt. Please ensure GEMINI_API_KEY is configured in Settings.'}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages((prev) => [...prev, errorMsg]);
      }
    } catch (err: any) {
      const errorMsg: AiDoubtMessage = {
        id: `ai-err-${Date.now()}`,
        sender: 'assistant',
        text: '⚠️ Network connection issue. Could not reach VStudy AI server.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-6 max-w-4xl mx-auto space-y-4">
      
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-purple-950 text-white p-6 sm:p-8 rounded-2xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-semibold mb-2 border border-purple-500/30">
            <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-spin-slow" /> Context-Aware Gemini 3.6 AI Tutor
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            24/7 AI Doubt Solver
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            Connected to VStudyHub notes, LaTeX math engine, NCERT references & multi-turn memory.
          </p>
        </div>

        {/* Subject Selector */}
        <div className="flex items-center gap-1 bg-white/10 backdrop-blur-md p-1 rounded-xl border border-white/20 text-xs font-bold shrink-0">
          <button
            onClick={() => setSelectedSubject('physics')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${selectedSubject === 'physics' ? 'bg-blue-600 text-white' : 'text-slate-300 hover:text-white'}`}
          >
            Physics
          </button>
          <button
            onClick={() => setSelectedSubject('chemistry')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${selectedSubject === 'chemistry' ? 'bg-emerald-600 text-white' : 'text-slate-300 hover:text-white'}`}
          >
            Chem
          </button>
          <button
            onClick={() => setSelectedSubject('mathematics')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${selectedSubject === 'mathematics' ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:text-white'}`}
          >
            Math
          </button>
          <button
            onClick={() => setSelectedSubject('biology')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${selectedSubject === 'biology' ? 'bg-amber-600 text-white' : 'text-slate-300 hover:text-white'}`}
          >
            Bio
          </button>
        </div>
      </div>

      {/* Teaching Mode Selector Bar */}
      <div className="bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs">
        <span className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
          <Target className="w-4 h-4 text-indigo-500" /> Teaching Mode:
        </span>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setSelectedMode('step_by_step')}
            className={`px-3 py-1.5 rounded-xl font-semibold transition-all ${
              selectedMode === 'step_by_step'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
            }`}
          >
            📐 Step-by-Step
          </button>
          <button
            onClick={() => setSelectedMode('beginner')}
            className={`px-3 py-1.5 rounded-xl font-semibold transition-all ${
              selectedMode === 'beginner'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
            }`}
          >
            🌱 Beginner
          </button>
          <button
            onClick={() => setSelectedMode('advanced_jee')}
            className={`px-3 py-1.5 rounded-xl font-semibold transition-all ${
              selectedMode === 'advanced_jee'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
            }`}
          >
            🚀 Advanced JEE
          </button>
          <button
            onClick={() => setSelectedMode('neet_biology')}
            className={`px-3 py-1.5 rounded-xl font-semibold transition-all ${
              selectedMode === 'neet_biology'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
            }`}
          >
            🧬 NEET NCERT
          </button>
        </div>
      </div>

      {/* Quick Sample Questions */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
        <span className="text-slate-500 dark:text-slate-400 font-bold block mb-2">
          💡 Try a High-Yield Exam Doubt:
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {sampleQuestions.map((q, idx) => (
            <button
              key={idx}
              onClick={() => {
                setSelectedSubject(q.subject as SubjectId);
                setSelectedMode(q.mode as AiDoubtMode);
                handleSendDoubt(q.text);
              }}
              className="text-left p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 transition-colors line-clamp-2"
            >
              <strong className="text-indigo-600 dark:text-indigo-400 uppercase text-[10px] block font-mono">
                [{q.subject} • {q.mode.replace('_', ' ')}]
              </strong>
              {q.text}
            </button>
          ))}
        </div>
      </div>

      {/* Chat Messages Container */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-6 shadow-sm min-h-[420px] max-h-[580px] overflow-y-auto space-y-4">
        {messages.map((msg) => {
          const isUser = msg.sender === 'user';

          return (
            <div
              key={msg.id}
              className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
            >
              {!isUser && (
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white flex items-center justify-center shrink-0 shadow-md">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-[85%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed ${
                  isUser
                    ? 'bg-blue-600 text-white rounded-br-none shadow-md'
                    : 'bg-slate-50 dark:bg-slate-800/80 text-slate-800 dark:text-slate-200 rounded-bl-none border border-slate-200/80 dark:border-slate-700/80'
                }`}
              >
                <div className="flex items-center justify-between text-[10px] opacity-70 mb-1">
                  <span className="font-bold">{isUser ? 'You' : 'VStudy Master AI Tutor'}</span>
                  <span>{msg.timestamp}</span>
                </div>

                {/* Main Text Content */}
                <div className="whitespace-pre-line space-y-2">
                  {msg.text}
                </div>
              </div>

              {isUser && (
                <div className="w-8 h-8 rounded-xl bg-slate-800 text-white flex items-center justify-center shrink-0">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          );
        })}

        {loading && (
          <div className="flex gap-3 items-center text-slate-500 text-xs py-3">
            <div className="w-8 h-8 rounded-xl bg-purple-600 text-white flex items-center justify-center shrink-0 animate-pulse">
              <Bot className="w-4 h-4" />
            </div>
            <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 px-4 py-2.5 rounded-2xl">
              <Sparkles className="w-4 h-4 text-purple-500 animate-spin" />
              <span className="font-medium text-slate-700 dark:text-slate-300">
                Searching VStudy Notes, deriving LaTeX formulas & analyzing with Gemini...
              </span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Box */}
      <div className="bg-white dark:bg-slate-900 p-2.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-lg flex items-center gap-2">
        <textarea
          rows={1}
          value={inputQuery}
          onChange={(e) => setInputQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSendDoubt();
            }
          }}
          placeholder={`Ask any ${selectedSubject} doubt in ${selectedMode.replace('_', ' ')} mode... (Press Enter)`}
          className="flex-1 bg-transparent px-3 py-2 text-xs sm:text-sm focus:outline-none dark:text-white resize-none"
        />

        <button
          onClick={() => handleSendDoubt()}
          disabled={!inputQuery.trim() || loading}
          className="p-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 text-white rounded-xl shadow-md transition-all shrink-0"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>

    </div>
  );
};

