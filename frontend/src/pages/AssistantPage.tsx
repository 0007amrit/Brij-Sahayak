import React, { useState, useRef, useEffect } from 'react';
import {
  Bot,
  Send,
  User,
  Sparkles,
  Info,
  RefreshCw,
  Globe,
  CheckCircle,
  HelpCircle,
  ShieldCheck
} from 'lucide-react';
import { api } from '../services/api.js';
import { AIQueryResponse } from '../types/index.js';

interface Message {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  language?: string;
  provider?: string;
  sources?: string[];
  disclaimer?: string;
  suggestedFollowups?: string[];
  timestamp: string;
}

export const AssistantPage: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'm-welcome',
      sender: 'assistant',
      text: 'Radhe Radhe! Main BrajSahayak AI Assistant hoon. Main Mathura, Vrindavan, Govardhan aur poore Braj kshetra ke mandiron, parking, routes aur timings se jude aapke sawalon ke verified reference jawaab de sakta hoon.\n\nAap English, Hindi (हिंदी) ya Hinglish mein pooch sakte hain!',
      language: 'hinglish',
      provider: 'mock',
      sources: ['BrajSahayak Grounded Knowledge Base'],
      disclaimer: 'Reference data only. Timings and parking are subject to local festival arrangements. Verify locally.',
      suggestedFollowups: [
        'Where can I park near Banke Bihari?',
        'Banke Bihari se Prem Mandir kaise jaaye?',
        'Where should I park in old Vrindavan?',
        'Mere paas 5 hours hain, kya visit kar sakta hoon?'
      ],
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  const [inputQuery, setInputQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [preferredLang, setPreferredLang] = useState<'en' | 'hi' | 'hinglish'>('hinglish');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const samplePrompts = [
    'Where can I park near Banke Bihari?',
    'Banke Bihari se Prem Mandir kaise jaaye?',
    'Mere paas 5 hours hain, kya visit kar sakta hoon?',
    'Where should I park in old Vrindavan?',
    'Bhai Banke Bihari ke paas parking kaha milegi?',
    'Janmabhoomi darshan timings kya hain?',
    'Mathura police aur emergency helpline numbers?'
  ];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || inputQuery).trim();
    if (!query || loading) return;

    const userMsg: Message = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuery('');
    setLoading(true);

    try {
      const response: AIQueryResponse = await api.askAssistant(query, preferredLang);
      const assistantMsg: Message = {
        id: `a-${Date.now()}`,
        sender: 'assistant',
        text: response.answer,
        language: response.language,
        provider: response.provider,
        sources: response.sources,
        disclaimer: response.disclaimer,
        suggestedFollowups: response.suggestedFollowups,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      const errorMsg: Message = {
        id: `err-${Date.now()}`,
        sender: 'assistant',
        text: 'Maaf kijiye, abhi backend service se connect karne mein samasya aayi. Kripya punah prayas karein.',
        disclaimer: 'Network error.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-amber-100 text-amber-800 text-xs font-semibold">
            <Bot className="w-3.5 h-3.5 text-amber-600" />
            Grounded AI Assistant
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
            BrajSahayak AI Assistant
          </h1>
          <p className="text-xs text-slate-500">
            Strictly grounded in verified Braj knowledge. Zero external hallucination.
          </p>
        </div>

        {/* Language Preference selector */}
        <div className="flex items-center gap-2 bg-white border border-slate-200 p-1.5 rounded-xl text-xs shadow-sm">
          <Globe className="w-3.5 h-3.5 text-slate-400 ml-1.5" />
          <span className="text-slate-500 font-medium">Language:</span>
          {(['hinglish', 'hi', 'en'] as const).map((l) => (
            <button
              key={l}
              onClick={() => setPreferredLang(l)}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                preferredLang === l
                  ? 'bg-orange-600 text-white shadow-xs'
                  : 'hover:bg-slate-100 text-slate-700'
              }`}
            >
              {l === 'hinglish' ? 'Hinglish' : l === 'hi' ? 'हिंदी' : 'English'}
            </button>
          ))}
        </div>
      </div>

      {/* Grounding Safeguard Banner */}
      <div className="bg-slate-900 text-slate-300 rounded-xl p-3 text-xs flex items-center justify-between gap-3 border border-slate-800">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>
            <strong>Grounded Guarantee:</strong> Responses reference verified sacred records. If information is not in the official directory, the model politely declines.
          </span>
        </div>
        <span className="hidden sm:inline-block text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded border border-slate-700 font-mono">
          Engine: Grounded Knowledge Search (Bedrock-Independent)
        </span>
      </div>

      {/* Chat Container */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[620px]">
        {/* Messages List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.sender === 'assistant' && (
                <div className="w-8 h-8 rounded-xl bg-orange-100 text-orange-700 flex items-center justify-center shrink-0 shadow-sm">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div className={`max-w-[85%] sm:max-w-[75%] space-y-2 ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
                <div
                  className={`p-4 rounded-2xl text-xs sm:text-sm leading-relaxed whitespace-pre-line shadow-xs ${
                    msg.sender === 'user'
                      ? 'bg-gradient-to-r from-orange-600 to-amber-600 text-white rounded-tr-none'
                      : 'bg-slate-50 text-slate-800 border border-slate-200/80 rounded-tl-none'
                  }`}
                >
                  {msg.text}
                </div>

                {/* Metadata tags for assistant messages */}
                {msg.sender === 'assistant' && (
                  <div className="space-y-1.5 pl-1">
                    {msg.sources && msg.sources.length > 0 && (
                      <div className="flex flex-wrap items-center gap-1 text-[10px] text-slate-400">
                        <span className="font-semibold text-slate-500">Sources:</span>
                        {msg.sources.map((s, idx) => (
                          <span key={idx} className="bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded font-mono">
                            {s}
                          </span>
                        ))}
                      </div>
                    )}

                    {msg.disclaimer && (
                      <div className="text-[10px] text-amber-700 bg-amber-50/70 p-1.5 rounded border border-amber-100/80 flex items-start gap-1">
                        <Info className="w-3 h-3 text-amber-600 shrink-0 mt-0.5" />
                        <span>{msg.disclaimer}</span>
                      </div>
                    )}

                    {/* Follow-up suggestions */}
                    {msg.suggestedFollowups && msg.suggestedFollowups.length > 0 && (
                      <div className="pt-1 flex flex-wrap gap-1.5">
                        {msg.suggestedFollowups.map((f, i) => (
                          <button
                            key={i}
                            onClick={() => handleSendMessage(f)}
                            className="text-[11px] bg-white hover:bg-orange-50 hover:text-orange-700 text-slate-600 border border-slate-200 px-2.5 py-1 rounded-full transition-colors"
                          >
                            {f}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                <div className={`text-[10px] text-slate-400 px-1 ${msg.sender === 'user' ? 'text-right' : 'text-left'}`}>
                  {msg.timestamp}
                </div>
              </div>

              {msg.sender === 'user' && (
                <div className="w-8 h-8 rounded-xl bg-slate-800 text-white flex items-center justify-center shrink-0 shadow-sm">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex gap-3 items-center">
              <div className="w-8 h-8 rounded-xl bg-orange-100 text-orange-700 flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4 animate-spin" />
              </div>
              <div className="bg-slate-50 text-slate-500 text-xs p-3 rounded-2xl border border-slate-200 flex items-center gap-2">
                <span className="inline-block w-2 h-2 rounded-full bg-orange-500 animate-pulse"></span>
                Grounded knowledge search in progress...
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Sample Prompt Chips Carousel */}
        <div className="p-2.5 bg-slate-50 border-t border-slate-200 flex items-center gap-1.5 overflow-x-auto text-xs whitespace-nowrap">
          <span className="text-[11px] font-bold text-slate-500 px-2 shrink-0">Try asking:</span>
          {samplePrompts.map((p, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(p)}
              className="bg-white hover:bg-orange-50 hover:text-orange-700 text-slate-600 px-3 py-1 rounded-full border border-slate-200 text-xs transition-colors shrink-0"
            >
              {p}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-3 sm:p-4 bg-white border-t border-slate-200">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              placeholder="Ask anything about Braj temples, parking, routes, or timings..."
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white transition-all"
            />
            <button
              type="submit"
              disabled={!inputQuery.trim() || loading}
              className="bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 disabled:opacity-50 text-white p-3 rounded-2xl transition-all shadow-md shadow-orange-600/20 shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
          <div className="text-[10px] text-slate-400 text-center mt-2">
            Reference answers are grounded strictly in the verified Braj knowledge base. Confirm all routes with local police.
          </div>
        </div>
      </div>
    </div>
  );
};
