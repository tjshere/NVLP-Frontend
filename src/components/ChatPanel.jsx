import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Bot, Sparkles } from 'lucide-react';
import { useSensory } from '../context/SensoryContext';
import api from '../api';

const COMPANION_META = {
  lucas: {
    name: 'Lucas',
    icon: Bot,
    colorBg: 'bg-blue-600',
    colorText: 'text-blue-700 dark:text-blue-300',
    colorBubble: 'bg-blue-50 dark:bg-blue-900/30 text-blue-900 dark:text-blue-100',
    colorBorder: 'border-blue-200 dark:border-blue-800',
    buttonBg: 'bg-blue-600 hover:bg-blue-700',
    greeting: 'Ready to work. What do you need?',
  },
  dani: {
    name: 'Dani',
    icon: Sparkles,
    colorBg: 'bg-pink-600',
    colorText: 'text-pink-700 dark:text-pink-300',
    colorBubble: 'bg-pink-50 dark:bg-pink-900/30 text-pink-900 dark:text-pink-100',
    colorBorder: 'border-pink-200 dark:border-pink-800',
    buttonBg: 'bg-pink-600 hover:bg-pink-700',
    greeting: "Hey! I'm here for you. What's on your mind?",
  },
};

const ChatPanel = ({ companion, onClose }) => {
  const { reduceAnimations } = useSensory();
  const companionId = companion?.id || companion;
  const meta = COMPANION_META[companionId] || COMPANION_META.lucas;
  const Icon = meta.icon;

  const [messages, setMessages] = useState([
    { id: 0, from: 'bot', text: meta.greeting },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: reduceAnimations ? 'auto' : 'smooth' });
  }, [messages, isLoading]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || isLoading) return;

    const userMsg = { id: Date.now(), from: 'user', text };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const data = await api.sendChat(text, companionId);
      setMessages((prev) => [...prev, { id: Date.now() + 1, from: 'bot', text: data.message }]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { id: Date.now() + 1, from: 'bot', text: "Sorry, I couldn't connect right now. Try again in a moment.", isError: true },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <div
        className={`relative flex flex-col w-full max-w-md h-full bg-white dark:bg-gray-900 shadow-2xl border-l border-gray-200 dark:border-gray-700 transition-transform duration-300 ${
          reduceAnimations ? '' : 'animate-slide-in-right'
        }`}
      >
        {/* Header */}
        <div className={`flex items-center gap-3 p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900`}>
          <div className={`w-10 h-10 rounded-full ${meta.colorBg} flex items-center justify-center flex-shrink-0`}>
            <Icon className="text-white" size={20} />
          </div>
          <div className="flex-1">
            <h2 className="font-bold text-gray-900 dark:text-white">{meta.name}</h2>
            <p className={`text-xs ${meta.colorText}`}>AI Companion</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.from === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.from === 'bot' && (
                <div className={`w-7 h-7 rounded-full ${meta.colorBg} flex items-center justify-center mr-2 flex-shrink-0 mt-1`}>
                  <Icon className="text-white" size={14} />
                </div>
              )}
              <div
                className={`max-w-[78%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                  msg.from === 'user'
                    ? 'bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 rounded-br-sm'
                    : `${meta.colorBubble} border ${meta.colorBorder} rounded-bl-sm`
                } ${msg.isError ? 'opacity-60 italic' : ''}`}
              >
                {msg.text}
              </div>
            </div>
          ))}

          {/* Typing indicator */}
          {isLoading && (
            <div className="flex justify-start items-end gap-2">
              <div className={`w-7 h-7 rounded-full ${meta.colorBg} flex items-center justify-center flex-shrink-0`}>
                <Icon className="text-white" size={14} />
              </div>
              <div className={`px-4 py-3 rounded-2xl rounded-bl-sm border ${meta.colorBubble} ${meta.colorBorder}`}>
                <div className="flex gap-1 items-center">
                  <span className="w-2 h-2 rounded-full bg-current opacity-60 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 rounded-full bg-current opacity-60 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 rounded-full bg-current opacity-60 animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
          <div className="flex gap-2 items-end">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={`Message ${meta.name}...`}
              rows={1}
              className="flex-1 resize-none px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              style={{ maxHeight: '120px', overflowY: 'auto' }}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className={`p-2.5 rounded-xl text-white transition-all ${meta.buttonBg} disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0`}
            >
              <Send size={18} />
            </button>
          </div>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-2 text-center">
            Enter to send · Shift+Enter for new line
          </p>
        </div>
      </div>
    </div>
  );
};

export default ChatPanel;
