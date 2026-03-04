import React, { useState, useEffect, useRef } from 'react';
import { ChatMessage } from '../types';
import { createExpertChat } from '../services/geminiService';
import { Send, User, Bot, X, Share2, Check } from 'lucide-react';
import { Chat, GenerateContentResponse } from "@google/genai";

interface ExpertChatProps {
  initialContext?: string;
  onClose: () => void;
}

const ExpertChat: React.FC<ExpertChatProps> = ({ initialContext, onClose }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const chatSessionRef = useRef<Chat | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initialize chat session
    const chat = createExpertChat();
    chatSessionRef.current = chat;

    // Initial greeting
    const initialGreeting: ChatMessage = {
      id: 'init',
      role: 'model',
      text: "Hello! I'm Dr. Green. I've reviewed the analysis of your crop. How can I help you with the treatment plan or any other farming questions today?",
      timestamp: new Date()
    };
    setMessages([initialGreeting]);

    // If there is context (diagnosis results), feed it to the chat silently to prime the model
    if (initialContext) {
      const primeChat = async () => {
        try {
          // We send this as a user message but don't display it, or use system instructions. 
          // Since system instruction is set at create time, we'll just send a "Context" message.
          await chat.sendMessage({ 
            message: `Context: I have just scanned a plant with the following results: ${initialContext}. Please keep this in mind for our conversation.` 
          });
        } catch (e) {
          console.error("Failed to set context", e);
        }
      };
      primeChat();
    }
  }, [initialContext]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || !chatSessionRef.current || isLoading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const result: GenerateContentResponse = await chatSessionRef.current.sendMessage({
         message: input 
      });
      const responseText = result.text;

      const modelMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: responseText || "I'm having trouble connecting to the field server. Please try again.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, modelMsg]);
    } catch (error) {
      console.error("Chat error:", error);
      const errorMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: "I apologize, but I'm having trouble processing that request right now. Please check your connection.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleShareTranscript = () => {
    const transcript = messages
      .filter(m => m.id !== 'init') // Optional: skip greeting if desired, but good to keep context
      .map(m => `[${m.role === 'user' ? 'Me' : 'Dr. Green'}] ${m.text}`)
      .join('\n\n');
      
    const fullText = `CropGuard AI - Consultation Transcript\n\n${transcript}\n\nShared via CropGuard AI`;

    if (navigator.share) {
      navigator.share({
        title: 'Dr. Green Consultation',
        text: fullText
      }).catch(console.error);
    } else {
      navigator.clipboard.writeText(fullText);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-0 md:p-4">
      <div className="bg-white w-full max-w-2xl h-full md:h-[80vh] md:rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-fadeInUp">
        {/* Header */}
        <div className="bg-emerald-600 p-4 flex items-center justify-between text-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-md">
              <Bot size={24} />
            </div>
            <div>
              <h3 className="font-bold text-lg">Dr. Green</h3>
              <div className="flex items-center gap-1.5 opacity-90">
                <span className="w-2 h-2 rounded-full bg-green-300 animate-pulse"></span>
                <span className="text-xs font-medium">Expert Online</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={handleShareTranscript}
              className="p-2 hover:bg-white/10 rounded-full transition-colors relative group"
              title="Share Transcript"
            >
              {isCopied ? <Check size={20} className="text-green-300" /> : <Share2 size={20} />}
              {/* Tooltip for copy fallback */}
              {isCopied && (
                 <span className="absolute top-full right-0 mt-2 bg-black text-white text-xs px-2 py-1 rounded whitespace-nowrap">Copied!</span>
              )}
            </button>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-full transition-colors"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl p-4 shadow-sm ${
                  msg.role === 'user'
                    ? 'bg-emerald-600 text-white rounded-br-none'
                    : 'bg-white text-slate-800 border border-slate-200 rounded-bl-none'
                }`}
              >
                <p className="whitespace-pre-wrap text-sm leading-relaxed">{msg.text}</p>
                <span className={`text-[10px] mt-2 block ${msg.role === 'user' ? 'text-emerald-100' : 'text-slate-400'}`}>
                  {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white border border-slate-200 rounded-2xl rounded-bl-none p-4 shadow-sm">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></span>
                  <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                  <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 bg-white border-t border-slate-100 shrink-0">
          <div className="flex gap-2 relative">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Ask about treatments, alternatives, or prevention..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none scrollbar-hide"
              rows={1}
              style={{ minHeight: '46px', maxHeight: '120px' }}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className="absolute right-2 bottom-2 p-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExpertChat;