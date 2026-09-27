import { useEffect, useRef, useState } from 'react';
import { useChatStore } from '../store/useChatStore';
import { format } from 'date-fns';
import { Send, LogOut, Loader2 } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// A short beep sound for notification (base64 encoded small wav)
const beepUrl = 'data:audio/wav;base64,UklGRl9vT19XQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YU'+'v'.repeat(100); 
const playNotificationSound = () => {
  try {
    const audio = new Audio(beepUrl);
    // Real implementation would use a better beep sound, but creating a quick oscillator is more reliable
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    gain.gain.setValueAtTime(0.1, ctx.currentTime);
    osc.start();
    gain.gain.exponentialRampToValueAtTime(0.00001, ctx.currentTime + 0.1);
    osc.stop(ctx.currentTime + 0.1);
  } catch(e) {
    console.error('Audio play failed', e);
  }
};

export default function Chat() {
  const { session, messages, status, fetchMessages, subscribeToMessages, unsubscribeFromMessages, sendMessage, logout } = useChatStore();
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchMessages();
    subscribeToMessages();
    
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        document.title = 'Mirsal - Secure Family Chat';
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      unsubscribeFromMessages();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  const previousMessageCount = useRef(messages.length);

  useEffect(() => {
    // Auto-scroll to bottom
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });

    // Handle new message notifications
    if (messages.length > previousMessageCount.current) {
      const latestMsg = messages[messages.length - 1];
      if (latestMsg && latestMsg.member_id !== session?.memberId) {
        if (document.visibilityState !== 'visible') {
          document.title = '(1) رسالة جديدة!';
        }
        playNotificationSound();
      }
    }
    previousMessageCount.current = messages.length;
  }, [messages, session?.memberId]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    
    const currentMessage = newMessage;
    setNewMessage('');
    await sendMessage(currentMessage);
  };

  return (
    <div className="flex flex-col h-[100dvh] w-full max-w-3xl mx-auto bg-gray-50 shadow-2xl relative overflow-hidden sm:h-[90vh] sm:rounded-3xl sm:border sm:border-gray-200">
      {/* Header */}
      <header className="bg-white px-6 py-4 border-b border-gray-100 flex items-center justify-between z-10 shadow-sm">
        <div className="flex flex-col">
          <h1 className="text-xl font-bold text-gray-900">غرفة العائلة</h1>
          <span className="text-xs text-gray-500">
            مرحباً بك، <span className="font-semibold text-blue-600">{session?.displayName}</span>
          </span>
        </div>
        <button
          onClick={logout}
          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
          title="تسجيل الخروج"
        >
          <LogOut size={20} />
        </button>
      </header>

      {/* Messages Area */}
      <main 
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 relative"
      >
        {status === 'loading' && messages.length === 0 ? (
          <div className="flex flex-col space-y-4 p-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className={cn("flex", i % 2 === 0 ? "justify-end" : "justify-start")}>
                <div className="bg-gray-200 animate-pulse h-12 w-48 rounded-2xl"></div>
              </div>
            ))}
          </div>
        ) : messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-3">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
              <Loader2 className="animate-spin text-gray-300" size={24} />
            </div>
            <p>لا توجد رسائل سابقة. كن أول من يرسل!</p>
          </div>
        ) : (
          messages.map((msg, idx) => {
            const isMe = msg.member_id === session?.memberId;
            const showName = !isMe && (idx === 0 || messages[idx - 1].member_id !== msg.member_id);
            
            return (
              <div
                key={msg.id}
                className={cn(
                  "flex flex-col max-w-[80%] animate-in fade-in slide-in-from-bottom-2 duration-300",
                  isMe ? "mr-auto items-start" : "ml-auto items-end"
                )}
              >
                {showName && (
                  <span className="text-xs text-gray-500 mb-1 px-2">
                    {msg.members?.display_name || 'عضو'}
                  </span>
                )}
                <div
                  className={cn(
                    "px-4 py-2.5 rounded-2xl text-[15px] leading-relaxed shadow-sm relative",
                    isMe
                      ? "bg-blue-600 text-white rounded-tr-sm"
                      : "bg-white text-gray-800 border border-gray-100 rounded-tl-sm"
                  )}
                >
                  <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                  <span
                    className={cn(
                      "text-[10px] mt-1 block text-left opacity-70",
                      isMe ? "text-blue-100" : "text-gray-400"
                    )}
                    dir="ltr"
                  >
                    {format(new Date(msg.created_at), 'hh:mm a')}
                  </span>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </main>

      {/* Input Area */}
      <footer className="bg-white border-t border-gray-100 p-3 sm:p-4 z-10">
        <form onSubmit={handleSend} className="flex gap-2 items-center bg-gray-50 p-1.5 rounded-full border border-gray-200 focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
          <input
            type="text"
            className="flex-1 bg-transparent border-none focus:ring-0 px-4 py-2 text-gray-800 outline-none placeholder:text-gray-400"
            placeholder="اكتب رسالتك هنا..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            dir="auto"
          />
          <button
            type="submit"
            disabled={!newMessage.trim()}
            className="p-2.5 bg-blue-600 text-white rounded-full hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            <Send size={18} className="rotate-180" />
          </button>
        </form>
      </footer>
    </div>
  );
}
