import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Send,
  Sparkles,
  Bot,
  User,
  ChevronRight,
  Minimize2,
  GripHorizontal,
} from 'lucide-react';

interface Message {
  id: string;
  sender: 'bot' | 'user';
  text: string;
  time: string;
  actionUrl?: string;
  actionLabel?: string;
}

const QUICK_QUESTIONS = [
  { label: '🚀 How does free trial work?', query: 'How does the free trial class work?' },
  { label: '⏰ Timezone & scheduling?', query: 'How does timezone conversion work?' },
  { label: '💻 Subjects & grade tracks?', query: 'What subjects and grades do you teach?' },
  { label: '📅 Book a Trial Class', query: 'I want to book a trial class now' },
];

export const ChatbotWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const navigate = useNavigate();
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Dragging state
  const [position, setPosition] = useState<{ x: number; y: number } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef<{ startX: number; startY: number; initialX: number; initialY: number }>({
    startX: 0,
    startY: 0,
    initialX: 0,
    initialY: 0,
  });

  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'bot',
      text: "Hi there! 👋 I'm **Codey**, your CodeYoung EdTech Advisor. Drag me anywhere on screen! Ask me anything about our 1-on-1 live coding & math trial classes, timezones, or mentor allocation!",
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  useEffect(() => {
    if (isOpen) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const hasDraggedRef = useRef(false);

  // Handle Mouse Dragging
  const handleMouseDown = (e: React.MouseEvent) => {
    if (isOpen && (e.target as HTMLElement).closest('input, textarea, button')) return;

    setIsDragging(true);
    hasDraggedRef.current = false;
    const containerWidth = isOpen ? Math.min(380, window.innerWidth - 32) : 64;
    const containerHeight = isOpen ? 500 : 64;
    const currentX = position ? position.x : Math.max(16, window.innerWidth - containerWidth - 16);
    const currentY = position ? position.y : Math.max(16, window.innerHeight - containerHeight - 80);

    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      initialX: currentX,
      initialY: currentY,
    };
  };

  // Handle Touch Dragging for Mobile Devices
  const handleTouchStart = (e: React.TouchEvent) => {
    if (isOpen && (e.target as HTMLElement).closest('input, textarea, button')) return;
    if (e.touches.length !== 1) return;

    setIsDragging(true);
    hasDraggedRef.current = false;
    const touch = e.touches[0];
    const containerWidth = isOpen ? Math.min(380, window.innerWidth - 32) : 64;
    const containerHeight = isOpen ? 500 : 64;
    const currentX = position ? position.x : Math.max(16, window.innerWidth - containerWidth - 16);
    const currentY = position ? position.y : Math.max(16, window.innerHeight - containerHeight - 80);

    dragRef.current = {
      startX: touch.clientX,
      startY: touch.clientY,
      initialX: currentX,
      initialY: currentY,
    };
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const dx = e.clientX - dragRef.current.startX;
      const dy = e.clientY - dragRef.current.startY;
      if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
        hasDraggedRef.current = true;
      }
      const containerWidth = isOpen ? Math.min(380, window.innerWidth - 32) : 64;
      const containerHeight = isOpen ? 500 : 64;

      const newX = Math.max(8, Math.min(window.innerWidth - containerWidth - 8, dragRef.current.initialX + dx));
      const newY = Math.max(8, Math.min(window.innerHeight - containerHeight - 8, dragRef.current.initialY + dy));
      setPosition({ x: newX, y: newY });
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isDragging || e.touches.length !== 1) return;
      const touch = e.touches[0];
      const dx = touch.clientX - dragRef.current.startX;
      const dy = touch.clientY - dragRef.current.startY;
      if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
        hasDraggedRef.current = true;
      }
      const containerWidth = isOpen ? Math.min(380, window.innerWidth - 32) : 64;
      const containerHeight = isOpen ? 500 : 64;

      const newX = Math.max(8, Math.min(window.innerWidth - containerWidth - 8, dragRef.current.initialX + dx));
      const newY = Math.max(8, Math.min(window.innerHeight - containerHeight - 8, dragRef.current.initialY + dy));
      setPosition({ x: newX, y: newY });
    };

    const handleDragEnd = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleDragEnd);
      window.addEventListener('touchmove', handleTouchMove);
      window.addEventListener('touchend', handleDragEnd);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleDragEnd);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleDragEnd);
    };
  }, [isDragging, isOpen]);

  const generateBotResponse = (userQuery: string): { text: string; actionUrl?: string; actionLabel?: string } => {
    const q = userQuery.toLowerCase();

    if (q.includes('book') || q.includes('schedule') || q.includes('appointment') || q.includes('sign up')) {
      return {
        text: "Ready to get started? 🚀 Our 1-on-1 trial class takes under 2 minutes to book! You can choose your local timezone, pick an available date, and instantly reserve a slot.",
        actionUrl: '/book',
        actionLabel: '📅 Go to Trial Class Booking',
      };
    }

    if (q.includes('free') || q.includes('trial') || q.includes('cost') || q.includes('price')) {
      return {
        text: "Yes! The 30-minute 1-on-1 trial class is **100% Free** with zero credit card required. Your child will work live with an expert mentor and build a real hands-on project!",
        actionUrl: '/book',
        actionLabel: 'Reserve Free 1-on-1 Trial',
      };
    }

    if (q.includes('timezone') || q.includes('time') || q.includes('dst') || q.includes('slot')) {
      return {
        text: "TrialFlow automatically detects your local timezone (US Eastern EDT/EST, Pacific, London GMT/BST, Gulf GST, IST, etc.) and seamlessly matches your requested time with active mentors while handling Daylight Saving Time conversions!",
        actionUrl: '/book',
        actionLabel: 'Select Your Timezone & Date',
      };
    }

    if (q.includes('subject') || q.includes('grade') || q.includes('age') || q.includes('coding') || q.includes('math') || q.includes('python')) {
      return {
        text: "We offer 3 tailored tracks for Grades 1–12 (Ages 6–17):\n\n• 🐍 **Coding & AI Track**: Scratch, Python, AI Logic & Game Development.\n• 📐 **Math & Logic Track**: Visual Problem Solving & Olympiad Reasoning.\n• 🤖 **Robotics & STEM Track**: Microcontroller simulations & 3D Science.",
        actionUrl: '/book',
        actionLabel: 'Choose Student Track',
      };
    }

    if (q.includes('mentor') || q.includes('teacher') || q.includes('instructor') || q.includes('who')) {
      return {
        text: "Our mentors are expert computer science & mathematics educators located in GMT+5:30 (Asia/Kolkata). To guarantee exceptional teaching quality, our backend limits each mentor to a maximum of **2 trial classes per day**!",
      };
    }

    if (q.includes('hello') || q.includes('hi') || q.includes('hey')) {
      return {
        text: "Hello! 😊 How can I help you today? Feel free to ask about our trial sessions, subjects, or click below to reserve a spot for your child!",
        actionUrl: '/book',
        actionLabel: 'Book Free Trial Class',
      };
    }

    return {
      text: "That's a great question! At TrialFlow, we connect parents with top mentors for 30-minute interactive 1-on-1 trial sessions across global timezones. Would you like to check available time slots for your area?",
      actionUrl: '/book',
      actionLabel: 'Check Available Time Slots',
    };
  };

  const handleSend = (userText: string) => {
    if (!userText.trim()) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: userText,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    setTimeout(() => {
      const botReply = generateBotResponse(userText);
      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        text: botReply.text,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        actionUrl: botReply.actionUrl,
        actionLabel: botReply.actionLabel,
      };
      setMessages((prev) => [...prev, botMsg]);
      setIsTyping(false);
    }, 600);
  };

  const handleQuickQuestion = (query: string) => {
    handleSend(query);
  };

  const containerStyle: React.CSSProperties = position
    ? { position: 'fixed', left: `${position.x}px`, top: `${position.y}px`, zIndex: 9999 }
    : {};

  return (
    <div
      style={containerStyle}
      className={`select-none ${!position ? 'fixed right-4 bottom-20 md:bottom-6 z-[9999]' : ''}`}
    >
      {/* Expandable Chatbot Panel */}
      {isOpen ? (
        <div className={`w-[calc(100vw-32px)] sm:w-[380px] max-w-[380px] h-[75vh] max-h-[520px] bg-white border border-slate-200 rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 duration-300 ${isDragging ? 'cursor-grabbing opacity-90 scale-[1.01]' : ''}`}>
          
          {/* Header Drag Handle */}
          <div
            onMouseDown={handleMouseDown}
            onTouchStart={handleTouchStart}
            className="p-3.5 bg-gradient-to-r from-coral-500 via-coral-600 to-amber-500 text-white flex items-center justify-between shadow-md cursor-grab active:cursor-grabbing shrink-0"
            title="Click or drag anywhere on screen"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 shadow-inner">
                <Bot className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-extrabold text-sm text-white">Codey AI Assistant</h3>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                </div>
                <p className="text-[11px] text-coral-100 font-medium flex items-center gap-1">
                  <GripHorizontal className="w-3 h-3" /> Drag Anywhere • Online
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-xl hover:bg-white/20 text-white transition-colors"
                title="Minimize chat"
              >
                <Minimize2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3.5 bg-slate-50/50 text-xs">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-2.5 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.sender === 'bot' && (
                  <div className="w-7 h-7 rounded-xl bg-coral-50 border border-coral-200 text-coral-600 flex items-center justify-center shrink-0 mt-0.5">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div className={`max-w-[82%] space-y-2`}>
                  <div
                    className={`p-3 rounded-2xl leading-relaxed font-medium ${
                      msg.sender === 'user'
                        ? 'bg-gradient-to-r from-coral-500 to-amber-500 text-white rounded-tr-none shadow-sm'
                        : 'bg-white border border-slate-200 text-slate-800 rounded-tl-none shadow-sm whitespace-pre-wrap'
                    }`}
                  >
                    {msg.text}
                  </div>

                  {msg.actionUrl && (
                    <button
                      onClick={() => {
                        setIsOpen(false);
                        navigate(msg.actionUrl!);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="w-full py-2 px-3 bg-coral-500 hover:bg-coral-600 text-white text-[11px] font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 active:scale-95"
                    >
                      {msg.actionLabel} <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  )}

                  <span
                    className={`text-[9px] font-mono block ${
                      msg.sender === 'user' ? 'text-right text-slate-400' : 'text-left text-slate-400'
                    }`}
                  >
                    {msg.time}
                  </span>
                </div>

                {msg.sender === 'user' && (
                  <div className="w-7 h-7 rounded-xl bg-slate-200 text-slate-700 flex items-center justify-center shrink-0 mt-0.5">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            ))}

            {isTyping && (
              <div className="flex gap-2.5 items-center text-slate-400 text-[11px]">
                <div className="w-7 h-7 rounded-xl bg-coral-50 border border-coral-200 text-coral-600 flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="bg-white border border-slate-200 p-2.5 rounded-2xl flex items-center gap-1 shadow-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-coral-500 animate-bounce" />
                  <span className="w-1.5 h-1.5 rounded-full bg-coral-500 animate-bounce delay-150" />
                  <span className="w-1.5 h-1.5 rounded-full bg-coral-500 animate-bounce delay-300" />
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Quick Questions Chips */}
          <div className="px-3 py-2 bg-slate-100 border-t border-slate-200 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            {QUICK_QUESTIONS.map((item, i) => (
              <button
                key={i}
                onClick={() => handleQuickQuestion(item.query)}
                className="px-2.5 py-1 bg-white hover:bg-coral-50 hover:border-coral-300 border border-slate-200 rounded-full text-[10px] font-bold text-slate-700 whitespace-nowrap transition-colors shrink-0 shadow-2xs"
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* Input Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend(input);
            }}
            className="p-3 bg-white border-t border-slate-200 flex items-center gap-2"
          >
            <input
              type="text"
              placeholder="Ask Codey AI about trial class..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-coral-500 transition-all font-medium"
            />
            <button
              type="submit"
              disabled={!input.trim()}
              className="p-2.5 bg-gradient-to-r from-coral-500 to-amber-500 hover:from-coral-600 hover:to-amber-600 disabled:opacity-40 text-white rounded-xl transition-all shadow-md shadow-coral-500/20 active:scale-95"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      ) : (
        /* Circular Floating Launcher Button with Animated Robot */
        <div
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
          onClick={() => {
            if (!hasDraggedRef.current) {
              setIsOpen(true);
            }
          }}
          className="group relative cursor-pointer cursor-grab active:cursor-grabbing w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-tr from-coral-500 via-coral-600 via-amber-500 to-indigo-600 hover:from-coral-600 hover:to-indigo-700 text-white shadow-2xl shadow-coral-500/40 flex items-center justify-center border-2 border-white/90 hover:scale-110 active:scale-90 transition-all duration-300"
          title="Click to open Codey AI Assistant"
        >
          {/* Animated Pulsing Ring Aura */}
          <span className="absolute -inset-1 rounded-full bg-gradient-to-r from-coral-500 to-indigo-600 opacity-75 blur-md group-hover:opacity-100 animate-pulse -z-10" />

          {/* Animated Waving/Bouncing Robot Container */}
          <div className="relative flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
            <Bot className="w-7 h-7 sm:w-8 sm:h-8 text-white animate-bounce group-hover:rotate-12 transition-transform duration-300" />

            {/* Glowing Online Indicator Dot */}
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500 border-2 border-white"></span>
            </span>

            {/* Micro Sparkle Accent */}
            <Sparkles className="w-3.5 h-3.5 text-amber-200 absolute -bottom-1 -left-1 animate-spin duration-3000" />
          </div>

          {/* Floating Tooltip Pill */}
          <span className="absolute right-full mr-3 px-3 py-1.5 bg-slate-900 text-white text-[11px] font-black rounded-xl shadow-xl whitespace-nowrap opacity-0 group-hover:opacity-100 transition-all pointer-events-none hidden sm:block border border-slate-700">
            🤖 Ask Codey AI Assistant
          </span>
        </div>
      )}
    </div>
  );
};
