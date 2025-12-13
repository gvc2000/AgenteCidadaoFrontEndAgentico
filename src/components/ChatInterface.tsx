import React, { useState, useRef, useEffect } from 'react';
import { Send, User, MessageCircle } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useTranslation } from '../i18n';

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
    inputValue?: string;
    onInputChange?: (value: string) => void;
    inputRef?: React.RefObject<HTMLInputElement | null>;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({
    messages,
    onSendMessage,
    isLoading,
    inputValue = '',
    onInputChange,
    inputRef: externalInputRef
}) => {
    const { t } = useTranslation();
    const [internalInput, setInternalInput] = useState('');
    const [loadingMessageIndex, setLoadingMessageIndex] = useState(0);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const internalInputRef = useRef<HTMLInputElement>(null);

    const loadingMessages = [
        'Consultando os Dados Abertos em tempo real...',
        'Aguarde...',
        'Processando informações dos agentes...',
        'Aguarde...'
    ];

    const input = onInputChange ? inputValue : internalInput;
    const setInput = onInputChange || setInternalInput;
    const inputRefToUse = externalInputRef || internalInputRef;

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Rotate loading messages
    useEffect(() => {
        let interval: number | undefined;
        if (isLoading) {
            interval = window.setInterval(() => {
                setLoadingMessageIndex(prev => (prev + 1) % loadingMessages.length);
            }, 2500);
        } else {
            setLoadingMessageIndex(0);
        }
        return () => {
            if (interval) clearInterval(interval);
        };
    }, [isLoading, loadingMessages.length]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (input.trim() && !isLoading) {
            onSendMessage(input);
            setInput('');
        }
    };

    return (
        <div className="chat-interface-compact">
            {/* Minimal Welcome or Messages */}
            <div className="chat-content-compact">
                {messages.length === 0 ? (
                    <div className="welcome-minimal">
                        <MessageCircle size={40} className="welcome-icon" />
                        <span>{t.welcomeTitle}</span>
                        <p>{t.welcomeMessage}</p>
                    </div>
                ) : (
                    <div className="messages-container">
                        {messages.map((msg) => (
                            <div
                                key={msg.id}
                                className={`message ${msg.role === 'user' ? 'message-user' : 'message-assistant'}`}
                            >
                                <div className="message-avatar">
                                    {msg.role === 'user' ? <User size={16} /> : <MessageCircle size={16} />}
                                </div>
                                <div className="message-content">
                                    {msg.role === 'user' ? (
                                        msg.content
                                    ) : (
                                        <div className="prose-content">
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
                )}
            </div>

            {/* Input Area at BOTTOM */}
            <div className="chat-input-container">
                <form onSubmit={handleSubmit} className="chat-form">
                    <input
                        ref={inputRefToUse as React.RefObject<HTMLInputElement>}
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder={t.inputPlaceholder}
                        className="chat-input"
                        disabled={isLoading}
                    />
                    <button
                        type="submit"
                        disabled={!input.trim() || isLoading}
                        className="chat-submit-btn"
                    >
                        {isLoading ? (
                            <span className="loading-spinner"></span>
                        ) : (
                            <>
                                {t.sendButton}
                                <Send size={18} />
                            </>
                        )}
                    </button>
                </form>
                {isLoading && (
                    <p className="loading-text loading-text-animated">{loadingMessages[loadingMessageIndex]}</p>
                )}
            </div>
        </div>
    );
};
