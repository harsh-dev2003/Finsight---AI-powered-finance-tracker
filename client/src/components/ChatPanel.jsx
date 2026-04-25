import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Sparkles } from 'lucide-react';
import api from '../services/api';

const ChatPanel = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([{ role: 'AI', content: "Hi! I'm FinSight, your personal AI finance advisor. Ask me anything about your spending." }]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const endOfMessagesRef = useRef(null);

  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMsg = input.trim();
    setMessages(prev => [...prev, { role: 'USER', content: userMsg }]);
    setInput('');
    setLoading(true);

    try {
      const { data } = await api.post('/chat', { message: userMsg });
      setMessages(prev => [...prev, { role: 'AI', content: data.reply }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'AI', content: "Oops, I'm currently unavailable." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="z-50">
      <button 
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-8 right-8 p-4 rounded-full gradient-accent hover:scale-110 hover:shadow-[0_0_30px_rgba(108,99,255,0.6)] text-white shadow-2xl transition-all duration-300 z-40 ${isOpen ? 'scale-0 opacity-0' : 'scale-100 opacity-100'}`}
      >
        <MessageSquare size={26} />
      </button>

      <div className={`fixed bottom-8 right-8 w-[calc(100vw-4rem)] max-w-[400px] h-[550px] glass-card rounded-[2rem] flex flex-col overflow-hidden transition-all duration-500 transform origin-bottom-right shadow-[0_20px_50px_rgba(0,0,0,0.5)] ${isOpen ? 'scale-100 opacity-100 z-50 translate-y-0' : 'scale-95 opacity-0 -z-10 translate-y-10 pointer-events-none'}`}>
        
        <div className="bg-sidebar/80 backdrop-blur-xl p-5 border-b border-white/5 flex justify-between items-center relative z-10">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-accent/20 text-accent"><Sparkles size={18} /></div>
            <div>
              <span className="font-bold text-textPrimary block text-[15px]">FinSight AI</span>
              <span className="text-xs text-success font-medium flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse"></span> Online
              </span>
            </div>
          </div>
          <button onClick={() => setIsOpen(false)} className="p-2 bg-white/5 hover:bg-white/10 rounded-full text-textMuted hover:text-white transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-5 bg-background/30 custom-scrollbar relative">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-accent/5 blur-[80px] rounded-full pointer-events-none"></div>

          {messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === 'USER' ? 'justify-end' : 'justify-start'} relative z-10 animate-fade-in`}>
              <div className={`max-w-[85%] px-5 py-3.5 rounded-3xl text-[14.5px] leading-relaxed font-medium shadow-sm ${msg.role === 'USER' ? 'gradient-accent text-white rounded-br-sm' : 'bg-sidebar/90 border border-white/5 text-textPrimary rounded-bl-sm'}`}>
                {msg.content}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start relative z-10 animate-fade-in">
              <div className="bg-sidebar/90 border border-white/5 text-textMuted px-5 py-3.5 rounded-3xl rounded-bl-sm text-sm flex items-center gap-1.5 font-medium">
                FinSight is thinking
                <span className="flex gap-0.5 ml-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent/60 animate-bounce"></span>
                  <span className="w-1.5 h-1.5 rounded-full bg-accent/60 animate-bounce delay-100"></span>
                  <span className="w-1.5 h-1.5 rounded-full bg-accent/60 animate-bounce delay-200"></span>
                </span>
              </div>
            </div>
          )}
          <div ref={endOfMessagesRef} />
        </div>

        <div className="p-4 bg-sidebar/80 backdrop-blur-xl border-t border-white/5 flex gap-3 relative z-10">
          <input 
            type="text" 
            placeholder="Ask about your spending..." 
            className="flex-1 bg-background/50 border border-white/10 rounded-2xl px-5 py-3.5 text-sm font-medium text-textPrimary outline-none focus:border-accent/50 focus:bg-sidebar transition-all shadow-inner"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          />
          <button 
            onClick={handleSend}
            disabled={loading || !input.trim()}
            className="gradient-accent text-white p-3.5 rounded-2xl hover:brightness-110 disabled:opacity-50 disabled:grayscale transition-all flex items-center justify-center shadow-lg w-[52px]"
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatPanel;
