import React, { useState } from 'react';
import { X, Send, Bot, User, CheckCircle2 } from 'lucide-react';
import { useApp } from '../context/AppContext';

interface ChatMessage {
  id: string;
  sender: 'bot' | 'user';
  text: string;
  time: string;
}

export const LiveChatModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { language, user } = useApp();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      sender: 'bot',
      text:
        language === 'bn'
          ? 'হ্যালো! MALL ক্লাউড কাস্টমার সার্ভিসে আপনাকে স্বাগতম। ডিপোজিট, উইথড্রয়াল বা VIP টাস্ক নিয়ে কোনো প্রশ্ন থাকলে নির্দ্বিধায় জানান।'
          : 'Hello! Welcome to MALL Cloud Customer Support. How can we help you with deposits, withdrawals, or VIP tasks today?',
      time: 'Just now',
    },
  ]);
  const [input, setInput] = useState('');

  const quickReplies = [
    { label: 'How to deposit?', reply: 'Click on "Recharge" on the home screen, select TRC-20, copy the address or scan the QR code, and send at least 10 USDT.' },
    { label: 'Withdrawal time?', reply: 'Withdrawals are typically reviewed and broadcast to the TRON blockchain within 10-30 minutes.' },
    { label: 'How to upgrade VIP?', reply: 'Your VIP status automatically unlocks as your balance reaches the tier threshold: VIP 1 (20 USDT), VIP 2 (499 USDT), VIP 3 (899 USDT).' },
  ];

  const handleSend = (textToSend?: string) => {
    const text = textToSend || input.trim();
    if (!text) return;

    const userMsg: ChatMessage = {
      id: String(Date.now()),
      sender: 'user',
      text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInput('');

    // Automated bot reply
    setTimeout(() => {
      let botResponse = language === 'bn'
        ? 'ধন্যবাদ আপনার বার্তার জন্য। আমাদের একজন এজেন্ট খুব শীঘ্রই আপনার সাথে যোগাযোগ করবেন। যেকোনো সমস্যায় ডিপোজিট পেজে প্রদর্শিত TRC-20 ওয়ালেট চেক করুন।'
        : 'Thank you for reaching out. An agent is reviewing your query. For instant deposits, ensure you use the generated TRC-20 address and allow 1-2 minutes for blockchain confirmations.';

      const lower = text.toLowerCase();
      if (lower.includes('deposit') || lower.includes('recharge') || lower.includes('ডিপোজিট')) {
        botResponse = 'For recharge, visit Home > Recharge. Minimum transfer is 10 USDT on TRON (TRC-20). Balance will reflect automatically.';
      } else if (lower.includes('withdraw') || lower.includes('উইথড্র')) {
        botResponse = 'To withdraw, bind your TRC-20 wallet in "Wallet management" or "Withdrawal", enter amount and submit. Minimum is 5 USDT.';
      }

      setMessages((prev) => [
        ...prev,
        {
          id: String(Date.now() + 1),
          sender: 'bot',
          text: botResponse,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-2xl max-w-sm w-full h-[520px] shadow-2xl border border-neutral-100 flex flex-col overflow-hidden">
        {/* Chat Header */}
        <div className="bg-gradient-to-r from-neutral-900 to-neutral-800 text-white p-3.5 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-full bg-rose-700 flex items-center justify-center text-white font-bold">
              <Bot size={18} />
            </div>
            <div>
              <h4 className="text-xs font-bold leading-tight">MALL Support Official</h4>
              <p className="text-[10px] text-emerald-400 flex items-center space-x-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>Online (07:00 - 23:00 UK)</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Messages Body */}
        <div className="flex-1 p-3 overflow-y-auto space-y-3 bg-neutral-50/60 text-xs">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 shadow-xs leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-rose-800 text-white rounded-tr-none'
                    : 'bg-white text-neutral-800 border border-neutral-200/70 rounded-tl-none'
                }`}
              >
                <p>{msg.text}</p>
                <span
                  className={`text-[9px] block mt-1 ${
                    msg.sender === 'user' ? 'text-rose-200 text-right' : 'text-neutral-400'
                  }`}
                >
                  {msg.time}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Quick prompt suggestions */}
        <div className="px-2.5 py-1.5 bg-white border-t border-neutral-100 flex space-x-1.5 overflow-x-auto no-scrollbar">
          {quickReplies.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(q.label)}
              className="text-[10px] px-2.5 py-1 rounded-full bg-neutral-100 text-neutral-700 whitespace-nowrap hover:bg-neutral-200 transition-colors"
            >
              {q.label}
            </button>
          ))}
        </div>

        {/* Input bar */}
        <div className="p-2.5 bg-white border-t border-neutral-100 flex items-center space-x-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Type your message..."
            className="flex-1 bg-neutral-100 text-neutral-900 px-3 py-2 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-rose-800"
          />
          <button
            onClick={() => handleSend()}
            disabled={!input.trim()}
            className="w-9 h-9 rounded-xl bg-rose-800 text-white flex items-center justify-center hover:bg-rose-900 disabled:opacity-40 transition-all"
          >
            <Send size={15} />
          </button>
        </div>
      </div>
    </div>
  );
};
