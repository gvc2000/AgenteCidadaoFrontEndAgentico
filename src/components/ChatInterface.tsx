import React, { useState, useRef, useEffect } from 'react';
import { Send, User, Bot } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
}

interface ChatInterfaceProps {
    messages: Message[];
    onSendMessage: (content: string) => void;
    isLoading: boolean;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ messages, onSendMessage, isLoading }) => {
    const [input, setInput] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (input.trim() && !isLoading) {
            onSendMessage(input);
            setInput('');
        }
    };

    return (
        <div className="flex flex-col h-full max-h-[600px] bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/50">
                {messages.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-full text-center text-slate-400 p-8">
                        <Bot size={48} className="mb-4 text-slate-300" />
                        <p className="text-lg font-medium text-slate-600">Olá! Sou o Agente Cidadão.</p>
                        <p className="text-sm max-w-md mt-2">
                            Posso consultar dados legislativos, perfis de políticos e gastos públicos.
                            Como posso ajudar você hoje?
                        </p>
                    </div>
                )}

                {messages.map((msg) => (
                    <div
                        key={msg.id}
                        className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                    >
                        <div className={`
              flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center
              ${msg.role === 'user' ? 'bg-[var(--camara-green)] text-white' : 'bg-white border border-slate-200 text-[var(--camara-green)]'}
            `}>
                            {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
                        </div>

                        <div className={`
              max-w-[80%] rounded-2xl px-5 py-3 text-sm leading-relaxed shadow-sm overflow-hidden
              ${msg.role === 'user'
                                ? 'bg-[var(--camara-green)] text-white rounded-tr-none'
                                : 'bg-white border border-slate-100 text-slate-700 rounded-tl-none'}
            `}>
                            {msg.role === 'user' ? (
                                msg.content
                            ) : (
                                <div className="prose prose-sm max-w-none prose-p:my-1 prose-headings:my-2 prose-ul:my-1 prose-li:my-0.5">
                                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                        {msg.content}
                                    </ReactMarkdown>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white border-t border-slate-100">
                <form onSubmit={handleSubmit} className="relative flex items-center gap-2">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Pergunte sobre leis, deputados ou gastos..."
                        className="w-full pl-4 pr-12 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--camara-green)]/20 focus:border-[var(--camara-green)] transition-all placeholder:text-slate-400 text-sm"
                        disabled={isLoading}
                    />
                    <button
                        type="submit"
                        disabled={!input.trim() || isLoading}
                        className="absolute right-2 p-2 bg-[var(--camara-green)] text-white rounded-lg hover:bg-[var(--camara-green-dark)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        <Send size={18} />
                    </button>
                </form>
            </div>
        </div>
    );
};
