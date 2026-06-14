import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Sparkles, Send, Bot, User, Loader2, Lightbulb,
} from 'lucide-react';
import { useRole } from '../../hooks/useRole';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const quickActions: Record<string, { label: string; prompt: string }[]> = {
  admin: [
    { label: 'Attendance Analysis', prompt: 'Show me the attendance analysis for this month' },
    { label: 'Payroll Insights', prompt: 'What are the key payroll insights this quarter?' },
    { label: 'Workforce Trends', prompt: 'Analyze workforce trends and recommend improvements' },
    { label: 'Skill Gap Analysis', prompt: 'Identify skill gaps across departments' },
  ],
  hr: [
    { label: 'Employee Overview', prompt: 'Give me an overview of employee metrics' },
    { label: 'Hiring Recommendations', prompt: 'What are your hiring recommendations?' },
    { label: 'Retention Analysis', prompt: 'Analyze employee retention patterns' },
    { label: 'Department Health', prompt: 'How is each department performing?' },
  ],
  manager: [
    { label: 'Team Performance', prompt: 'How is my team performing this month?' },
    { label: 'Attendance Report', prompt: 'Show my team attendance report' },
    { label: 'Productivity Tips', prompt: 'How can I improve team productivity?' },
    { label: 'Goal Tracking', prompt: 'Track team goals progress' },
  ],
  employee: [
    { label: 'My Attendance', prompt: 'Show my attendance summary' },
    { label: 'Leave Balance', prompt: 'What is my leave balance?' },
    { label: 'Performance Tips', prompt: 'How can I improve my performance?' },
    { label: 'My Payroll', prompt: 'Show my payroll details' },
  ],
};

const responses: Record<string, string> = {
  attendance: 'Based on the data, overall attendance is at **94.7%** this month, which is **+2.3%** above target. There were 12 absences recorded, primarily in the Engineering department. Recommended action: Schedule a check-in with team leads to address attendance patterns.',
  payroll: 'Payroll analysis for this quarter shows a total of **$12.6M** in payroll expenses. This represents an **8.1% increase** from last quarter. The average salary across the organization is **$85,400**. The Finance department recommends reviewing contractor costs.',
  performance: 'Current performance metrics show an average rating of **4.5/5** across the organization. Top performers are concentrated in Engineering (avg 4.7) and Design (avg 4.6). Three employees in Sales may benefit from additional training based on recent reviews.',
  workforce: 'Workforce analysis reveals: 1) **85%** employee satisfaction rate, 2) **12%** year-over-year growth, 3) **3.2%** voluntary turnover rate (below industry average of 5.1%), 4) **23** open positions across 8 departments. Recommended: Focus retention efforts on junior staff.',
};

const aiAvatars: Record<string, string> = {
  admin: 'bg-gradient-to-br from-blue-600 to-purple-600',
  hr: 'bg-gradient-to-br from-emerald-600 to-teal-600',
  manager: 'bg-gradient-to-br from-amber-600 to-orange-600',
  employee: 'bg-gradient-to-br from-violet-600 to-indigo-600',
};

export default function AiAssistant() {
  const { role } = useRole();
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Hello! I am your NexusHR AI Assistant. How can I help you today?', timestamp: new Date() },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const actions = quickActions[role ?? 'employee'] || quickActions.employee;

  const generateResponse = (prompt: string): string => {
    const lower = prompt.toLowerCase();
    if (lower.includes('attendance') || lower.includes('absent')) return responses.attendance;
    if (lower.includes('payroll') || lower.includes('salary') || lower.includes('compensation')) return responses.payroll;
    if (lower.includes('perform') || lower.includes('rating') || lower.includes('review')) return responses.performance;
    if (lower.includes('workforce') || lower.includes('hire') || lower.includes('retention') || lower.includes('skill') || lower.includes('department')) return responses.workforce;
    return `Thank you for your question about "${prompt.split(' ').slice(0, 5).join(' ')}...". Based on the available data, I can provide the following insights:\n\n1. **Current metrics** show positive trends across key indicators.\n2. **Recommended actions** include scheduling a follow-up with relevant stakeholders.\n3. **AI analysis** suggests monitoring this area closely over the next quarter.\n\nWould you like me to dive deeper into any specific aspect of this topic?`;
  };

  const handleSend = async (prompt?: string) => {
    const text = prompt || input;
    if (!text.trim() || loading) return;

    setMessages((prev) => [...prev, { role: 'user', content: text, timestamp: new Date() }]);
    setInput('');
    setLoading(true);

    await new Promise((r) => setTimeout(r, 1000));

    const response = generateResponse(text);
    setMessages((prev) => [...prev, { role: 'assistant', content: response, timestamp: new Date() }]);
    setLoading(false);
  };

  return (
    <div className="p-4 sm:p-8 h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-purple-400" />
            AI Assistant
          </h1>
          <p className="text-zinc-400 text-sm mt-1">
            {role === 'admin' ? 'Full AI access - Company-wide insights' :
             role === 'hr' ? 'Workforce AI access - Department analytics' :
             role === 'manager' ? 'Team AI access - Performance insights' :
             'Personal AI access - Your work insights'}
          </p>
        </div>
      </div>

      <div className="flex-1 flex flex-col rounded-xl border border-zinc-800 bg-zinc-900/50 backdrop-blur-xl overflow-hidden">
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.role === 'assistant' && (
                <div className={`h-8 w-8 rounded-lg ${aiAvatars[role ?? 'employee']} flex items-center justify-center shrink-0`}>
                  <Bot className="h-4 w-4 text-white" />
                </div>
              )}
              <div className={`max-w-[80%] rounded-xl px-4 py-3 ${
                msg.role === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-zinc-800/50 text-zinc-200 border border-zinc-700/50'
              }`}>
                <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                <p className={`text-[10px] mt-1 ${msg.role === 'user' ? 'text-blue-200' : 'text-zinc-500'}`}>
                  {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
              {msg.role === 'user' && (
                <div className="h-8 w-8 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center shrink-0">
                  <User className="h-4 w-4 text-blue-400" />
                </div>
              )}
            </motion.div>
          ))}

          {loading && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3">
              <div className={`h-8 w-8 rounded-lg ${aiAvatars[role ?? 'employee']} flex items-center justify-center`}>
                <Bot className="h-4 w-4 text-white" />
              </div>
              <div className="bg-zinc-800/50 rounded-xl px-4 py-3 border border-zinc-700/50">
                <Loader2 className="h-4 w-4 animate-spin text-zinc-400" />
              </div>
            </motion.div>
          )}

          {messages.length === 1 && (
            <div className="grid grid-cols-2 gap-2 mt-4">
              {actions.map((action) => (
                <button
                  key={action.label}
                  onClick={() => handleSend(action.prompt)}
                  className="p-3 rounded-lg bg-zinc-800/30 border border-zinc-800 hover:border-zinc-700 hover:bg-zinc-800/50 transition-all text-left group"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Lightbulb className="h-3.5 w-3.5 text-amber-400" />
                    <span className="text-xs font-medium text-zinc-300 group-hover:text-white transition-colors">
                      {action.label}
                    </span>
                  </div>
                  <p className="text-[10px] text-zinc-500 line-clamp-1">{action.prompt}</p>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="border-t border-zinc-800 p-4">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask about attendance, payroll, performance..."
              className="flex-1 rounded-lg border border-zinc-800 bg-zinc-950/50 px-4 py-2.5 text-sm text-white placeholder-zinc-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors"
            />
            <button
              onClick={() => handleSend()}
              disabled={!input.trim() || loading}
              className="p-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
