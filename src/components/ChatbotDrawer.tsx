import React, { useState, useRef, useEffect } from 'react';
import { Course, Task, Exam, ChatMessage } from '../types';
import {
  Sparkles,
  Send,
  RotateCcw,
  Copy,
  Check,
  Bot,
  User,
  GraduationCap,
  HelpCircle,
  Clock,
  BookOpen,
  Calendar,
  AlertCircle,
  Minimize2,
  Maximize2,
  X,
} from 'lucide-react';

interface ChatbotDrawerProps {
  isOpen: boolean;
  onClose?: () => void;
  isFullView?: boolean;
  courses: Course[];
  tasks: Task[];
  exams: Exam[];
  streakDays: number;
  totalStudyHours: number;
  messages: ChatMessage[];
  onUpdateMessages: (updater: (prev: ChatMessage[]) => ChatMessage[]) => void;
}

const QUICK_PROMPTS = [
  {
    icon: Calendar,
    label: '📅 Exam Study Plan',
    prompt: 'Can you build a high-efficiency 5-day study plan for my upcoming exam using active recall and spaced repetition?',
  },
  {
    icon: HelpCircle,
    label: '🧠 Feynman Explanation',
    prompt: 'Explain Dijkstra’s algorithm and priority queues using the Feynman Technique and an everyday analogy.',
  },
  {
    icon: BookOpen,
    label: '❓ Quiz Me on Topics',
    prompt: 'Generate a 4-question active recall quiz (with answers revealed after I guess) based on my current courses.',
  },
  {
    icon: Clock,
    label: '⚡ Prioritize My Tasks',
    prompt: 'Looking at my pending assignments, what order should I tackle them in today for maximum efficiency?',
  },
];

export const ChatbotDrawer: React.FC<ChatbotDrawerProps> = ({
  isOpen,
  onClose,
  isFullView = false,
  courses,
  tasks,
  exams,
  streakDays,
  totalStudyHours,
  messages,
  onUpdateMessages,
}) => {
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [includeContext, setIncludeContext] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSend = async (textToSend?: string) => {
    const messageContent = (textToSend || inputValue).trim();
    if (!messageContent || isLoading) return;

    setApiError(null);
    const userMsg: ChatMessage = {
      id: 'usr_' + Date.now(),
      role: 'user',
      content: messageContent,
      timestamp: new Date().toISOString(),
    };

    const newHistory = [...messages, userMsg];
    onUpdateMessages(() => newHistory);
    setInputValue('');
    setIsLoading(true);

    try {
      const studentContext = includeContext
        ? {
            courses: courses.map(c => ({
              name: c.name,
              code: c.code,
              targetGrade: c.targetGrade,
              instructor: c.instructor,
            })),
            tasks: tasks.map(t => ({
              title: t.title,
              courseName: t.courseName,
              dueDate: t.dueDate,
              priority: t.priority,
              completed: t.status === 'completed',
            })),
            exams: exams.map(e => {
              const c = courses.find(course => course.id === e.courseId);
              return {
                title: e.title,
                courseName: c?.name || 'Course',
                date: e.date,
                confidence: e.confidenceLevel,
              };
            }),
            studyStats: {
              streakDays,
              hoursStudiedThisWeek: totalStudyHours,
            },
          }
        : null;

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newHistory.map(m => ({ role: m.role, content: m.content })),
          context: studentContext,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `Server returned error ${res.status}`);
      }

      const data = await res.json();
      const assistantMsg: ChatMessage = {
        id: 'ast_' + Date.now(),
        role: 'assistant',
        content: data.reply || 'Here is what I found for your study query.',
        timestamp: new Date().toISOString(),
      };

      onUpdateMessages(prev => [...prev, assistantMsg]);
    } catch (err: any) {
      console.error('Chat request failed:', err);
      setApiError(err.message || 'Could not connect to AI service.');
      const fallbackMsg: ChatMessage = {
        id: 'ast_err_' + Date.now(),
        role: 'assistant',
        content: `⚠️ I encountered an issue: ${err.message}. If the API key was recently added, please make sure it is valid in Settings > Secrets. In the meantime, I can answer study questions when reconnected.`,
        timestamp: new Date().toISOString(),
      };
      onUpdateMessages(prev => [...prev, fallbackMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleClearHistory = () => {
    if (confirm('Clear chat history with Acuity?')) {
      onUpdateMessages(() => [
        {
          id: 'ast_init',
          role: 'assistant',
          content: "Chat cleared! How can I assist with your studies today?",
          timestamp: new Date().toISOString(),
        },
      ]);
    }
  };

  if (!isOpen && !isFullView) return null;

  // Simple Markdown renderer for clean formatting
  const renderMessageContent = (content: string) => {
    const lines = content.split('\n');
    return (
      <div className="space-y-1.5 text-sm leading-relaxed">
        {lines.map((line, idx) => {
          if (line.startsWith('### ')) {
            return (
              <h4 key={idx} className="font-bold text-zinc-900 text-sm mt-2 mb-1">
                {line.replace('### ', '')}
              </h4>
            );
          }
          if (line.startsWith('## ')) {
            return (
              <h3 key={idx} className="font-bold text-zinc-900 text-base mt-2.5 mb-1">
                {line.replace('## ', '')}
              </h3>
            );
          }
          if (line.startsWith('# ')) {
            return (
              <h2 key={idx} className="font-bold text-zinc-900 text-lg mt-3 mb-1">
                {line.replace('# ', '')}
              </h2>
            );
          }
          if (line.startsWith('- ') || line.startsWith('* ')) {
            const parsed = line.substring(2);
            return (
              <div key={idx} className="flex items-start gap-2 ml-1 text-zinc-800">
                <span className="text-indigo-500 font-bold">•</span>
                <span>{renderFormattedText(parsed)}</span>
              </div>
            );
          }
          if (/^\d+\.\s/.test(line)) {
            const match = line.match(/^(\d+\.)\s(.*)$/);
            return (
              <div key={idx} className="flex items-start gap-2 ml-1 text-zinc-800">
                <span className="text-indigo-600 font-semibold text-xs mt-0.5">{match ? match[1] : '1.'}</span>
                <span>{renderFormattedText(match ? match[2] : line)}</span>
              </div>
            );
          }
          if (line.trim() === '') {
            return <div key={idx} className="h-1" />;
          }
          return (
            <p key={idx} className="text-zinc-800">
              {renderFormattedText(line)}
            </p>
          );
        })}
      </div>
    );
  };

  const renderFormattedText = (text: string) => {
    // Bold matching
    const parts = text.split(/(\*\*.*?\*\*|`.*?`)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={i} className="font-semibold text-zinc-950">
            {part.slice(2, -2)}
          </strong>
        );
      }
      if (part.startsWith('`') && part.endsWith('`')) {
        return (
          <code key={i} className="px-1.5 py-0.5 rounded-md bg-zinc-100 text-indigo-700 font-mono text-xs">
            {part.slice(1, -1)}
          </code>
        );
      }
      return part;
    });
  };

  const containerClasses = isFullView
    ? 'w-full h-full flex flex-col bg-white rounded-2xl border border-zinc-200 overflow-hidden shadow-sm'
    : 'fixed inset-y-0 right-0 z-50 w-full sm:w-[480px] bg-white shadow-2xl border-l border-zinc-200 flex flex-col transition-transform duration-300';

  return (
    <div className={containerClasses}>
      {/* Header */}
      <div className="px-5 py-4 border-b border-zinc-200 bg-white flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white flex items-center justify-center shadow-xs">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-zinc-900 text-sm">Acuity AI Study Coach</h3>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                Gemini 3.8
              </span>
            </div>
            <p className="text-xs text-zinc-500">Tutor, study planner & active recall coach</p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={handleClearHistory}
            title="Reset conversation"
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          {!isFullView && onClose && (
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Context Awareness Bar */}
      <div className="px-5 py-2.5 bg-zinc-50 border-b border-zinc-100 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-1.5 cursor-pointer text-zinc-600 font-medium select-none">
            <input
              type="checkbox"
              checked={includeContext}
              onChange={e => setIncludeContext(e.target.checked)}
              className="rounded-sm border-zinc-300 text-indigo-600 focus:ring-indigo-500"
            />
            <span>Sync Study Hub Context</span>
          </label>
        </div>
        <div className="flex items-center gap-2 text-zinc-500 font-mono text-[11px]">
          <span>{courses.length} courses</span>
          <span>•</span>
          <span>{tasks.filter(t => t.status !== 'completed').length} pending tasks</span>
        </div>
      </div>

      {/* Message List */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
        {messages.map(msg => (
          <div
            key={msg.id}
            className={`flex items-start gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
          >
            <div
              className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-xs ${
                msg.role === 'user'
                  ? 'bg-zinc-900 text-white'
                  : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
              }`}
            >
              {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </div>

            <div
              className={`relative max-w-[85%] rounded-2xl px-4 py-3 text-sm shadow-xs ${
                msg.role === 'user'
                  ? 'bg-zinc-900 text-white rounded-tr-none'
                  : 'bg-zinc-50 border border-zinc-200/80 text-zinc-900 rounded-tl-none'
              }`}
            >
              {msg.role === 'user' ? (
                <p className="whitespace-pre-wrap">{msg.content}</p>
              ) : (
                <div>{renderMessageContent(msg.content)}</div>
              )}

              {msg.role === 'assistant' && (
                <div className="mt-2.5 pt-2 border-t border-zinc-200/60 flex items-center justify-between text-[11px] text-zinc-600">
                  <span>Acuity Tutor</span>
                  <button
                    onClick={() => handleCopy(msg.id, msg.content)}
                    className="flex items-center gap-1 hover:text-zinc-700 transition-colors"
                  >
                    {copiedId === msg.id ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-600" />
                        <span className="text-emerald-600">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex items-start gap-3">
            <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200 flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4 animate-pulse" />
            </div>
            <div className="bg-zinc-50 border border-zinc-200 rounded-2xl rounded-tl-none px-4 py-3 text-sm shadow-xs text-zinc-500 flex items-center gap-2">
              <div className="flex gap-1">
                <span className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce" />
                <span className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce [animation-delay:0.2s]" />
                <span className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce [animation-delay:0.4s]" />
              </div>
              <span className="text-xs">Thinking & formulating answer...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Quick Starters */}
      <div className="px-4 py-2 bg-zinc-50/70 border-t border-zinc-100 flex gap-2 overflow-x-auto no-scrollbar">
        {QUICK_PROMPTS.map((qp, i) => (
          <button
            key={i}
            onClick={() => handleSend(qp.prompt)}
            disabled={isLoading}
            className="shrink-0 px-2.5 py-1.5 bg-white border border-zinc-200 hover:border-indigo-300 hover:bg-indigo-50/50 text-zinc-700 text-xs rounded-lg font-medium transition-all shadow-2xs whitespace-nowrap disabled:opacity-50"
          >
            {qp.label}
          </button>
        ))}
      </div>

      {/* Input Form */}
      <div className="p-3 sm:p-4 bg-white border-t border-zinc-200">
        <form
          onSubmit={e => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-end gap-2"
        >
          <div className="flex-1 relative">
            <textarea
              rows={2}
              placeholder="Ask Acuity to explain a concept, generate a quiz, or build a study schedule..."
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-zinc-300 focus:outline-hidden focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 resize-none font-medium text-zinc-900 placeholder:text-zinc-400"
            />
          </div>
          <button
            type="submit"
            disabled={!inputValue.trim() || isLoading}
            className="h-10 px-4 bg-zinc-900 hover:bg-zinc-800 disabled:opacity-40 disabled:hover:bg-zinc-900 text-white font-semibold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all shadow-xs shrink-0"
          >
            <Send className="w-4 h-4" />
            <span className="hidden sm:inline">Send</span>
          </button>
        </form>
        <p className="text-[11px] text-zinc-600 mt-2 text-center">
          Press Shift+Enter for newline. Responses are generated with Gemini AI.
        </p>
      </div>
    </div>
  );
};
