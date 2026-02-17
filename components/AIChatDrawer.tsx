import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import { X, Send, Bot, User, Sprout, Sparkles, Loader2, ArrowLeft } from 'lucide-react';
import { useAI } from '../context/AIContext';

interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
}

export const AIChatDrawer: React.FC = () => {
  const { isAIOpen, setIsAIOpen } = useAI();
  const [messages, setMessages] = useState<Message[]>([
    { id: 'welcome', role: 'model', text: 'Namaste! 🙏 I am your Kisan Sahayak. Ask me about crop diseases, fertilizers, or weather tips!' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isAIOpen]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg: Message = { id: Date.now().toString(), role: 'user', text: input.trim() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
        const apiKey = process.env.API_KEY;
        if (!apiKey) throw new Error("API Key missing");

        const ai = new GoogleGenAI({ apiKey });
        
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: [
                {
                    role: 'user',
                    parts: [
                        { text: "You are an expert agriculture assistant for 'New Nikhil Khad Bhandar' in India. You speak simple Hinglish (Hindi + English). VERY IMPORTANT: Keep your answers VERY SHORT (max 30 words). Only answer questions about farming, crops, fertilizers, or the store. Do not write long paragraphs. Be friendly but direct." },
                        { text: input.trim() }
                    ]
                }
            ]
        });

        const replyText = response.text || "Sorry, samajh nahi aaya. Phir se bolo?";
        
        const botMsg: Message = { id: (Date.now() + 1).toString(), role: 'model', text: replyText };
        setMessages(prev => [...prev, botMsg]);

    } catch (error) {
        console.error("AI Error:", error);
        setMessages(prev => [...prev, { id: Date.now().toString(), role: 'model', text: "Network issue. Thodi der baad try karein." }]);
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

  if (!isAIOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex justify-end">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity animate-fade-in"
        onClick={() => setIsAIOpen(false)}
      />
      
      {/* Drawer Container */}
      <div className="relative w-full max-w-md bg-[#F8FAFC] h-full shadow-2xl flex flex-col animate-slide-in">
        
        {/* Header - Gradient */}
        <div className="px-5 py-4 bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] text-white shadow-lg z-10 rounded-b-[32px] flex justify-between items-center">
          <div className="flex items-center gap-4">
             <button 
                onClick={() => setIsAIOpen(false)}
                className="p-2 bg-white/20 hover:bg-white/30 rounded-full transition-colors active:scale-90"
             >
                <ArrowLeft size={20} className="text-white" />
             </button>
             <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/30 shadow-inner">
                    <Bot size={22} className="text-white fill-white/20" />
                </div>
                <div>
                    <h2 className="font-bold text-lg leading-none font-serif tracking-tight">Kisan Chat</h2>
                    <p className="text-[10px] text-indigo-100 font-medium flex items-center gap-1 mt-1 opacity-90">
                        <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span> Online • Gemini AI
                    </p>
                </div>
             </div>
          </div>
        </div>

        {/* Messages Area - Clean & Modern */}
        <div className="flex-1 overflow-y-auto p-4 space-y-5 bg-gradient-to-b from-gray-50 to-white">
           {messages.map((msg) => (
               <div 
                key={msg.id} 
                className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in-up`}
               >
                   {msg.role === 'model' && (
                       <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0 border border-indigo-200 mt-1 shadow-sm">
                           <Sprout size={16} className="text-indigo-600" />
                       </div>
                   )}
                   
                   <div className={`max-w-[85%] px-4 py-3 shadow-sm text-sm font-medium leading-relaxed ${
                       msg.role === 'user' 
                       ? 'bg-indigo-600 text-white rounded-[20px] rounded-tr-sm shadow-indigo-200' 
                       : 'bg-white text-gray-800 rounded-[20px] rounded-tl-sm border border-gray-100 shadow-sm'
                   }`}>
                       {msg.text}
                   </div>
               </div>
           ))}
           {isLoading && (
               <div className="flex gap-3 justify-start animate-fade-in">
                   <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center flex-shrink-0 border border-indigo-100">
                        <Loader2 size={14} className="text-indigo-500 animate-spin" />
                   </div>
                   <div className="bg-white px-4 py-3 rounded-[20px] rounded-tl-sm shadow-sm border border-gray-100 flex gap-1.5 items-center">
                        <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce"></span>
                        <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{animationDelay: '0.15s'}}></span>
                        <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{animationDelay: '0.3s'}}></span>
                   </div>
               </div>
           )}
           <div ref={messagesEndRef} />
        </div>

        {/* Input Area - Floating Capsule */}
        <div className="p-4 bg-white/80 backdrop-blur-md border-t border-indigo-50">
            <div className="relative flex items-center gap-2 bg-white p-1.5 pr-2 rounded-[30px] border border-gray-200 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-100 shadow-lg transition-all">
                <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyPress}
                    placeholder="Ask a question..."
                    className="w-full bg-transparent border-none outline-none text-sm p-3 max-h-32 min-h-[44px] resize-none text-gray-800 placeholder-gray-400 font-medium ml-1"
                    rows={1}
                />
                <button 
                    onClick={handleSend}
                    disabled={!input.trim() || isLoading}
                    className="w-10 h-10 bg-indigo-600 text-white rounded-full flex items-center justify-center shadow-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed active:scale-90 transition-all flex-shrink-0"
                >
                    <Send size={18} className="ml-0.5" />
                </button>
            </div>
            <p className="text-[9px] text-center text-gray-400 mt-2 font-medium tracking-wide">AI can make mistakes. Verify important info.</p>
        </div>
      </div>
    </div>
  );
};