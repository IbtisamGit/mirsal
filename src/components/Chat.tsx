import { useEffect, useState, useRef } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useChatStore } from '../store/useChatStore';
import { useMessageStore } from '../store/useMessageStore';
import { motion } from 'framer-motion';
import { Send, LogOut, Loader2, Info, Palette, Trash2 } from 'lucide-react';
import FeedbackModal from './FeedbackModal';
import DrawingBoard from './kids/DrawingBoard';
import { useAuthStore } from '../store/useAuthStore';
import { supabase } from '../lib/supabase';

export default function Chat() {
  const { session, clearSession } = useChatStore();
  const { user } = useAuthStore();
  const { messages, onlineUsers, isLoading, fetchMessages, sendMessage, deleteMessage, subscribeToRoom, unsubscribeFromRoom } = useMessageStore();
  const navigate = useNavigate();
  
  const [text, setText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [showPingMenu, setShowPingMenu] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [modal, setModal] = useState<{isOpen: boolean; type: 'success'|'error'; title: string; message: string}>({
    isOpen: false, type: 'error', title: '', message: ''
  });

  const [isPinging, setIsPinging] = useState(false);
  const prevMessagesLength = useRef(0);

  const [isQuietHours, setIsQuietHours] = useState(false);

  useEffect(() => {
    if (!session) return;
    
    // Check quiet hours
    const checkQuietHours = async () => {
      const { data } = await supabase.from('rooms').select('is_quiet_hours_enabled, quiet_hours_start, quiet_hours_end').eq('id', session.roomId).single();
      if (data && data.is_quiet_hours_enabled && data.quiet_hours_start && data.quiet_hours_end) {
        const now = new Date();
        const currentTime = now.getHours() * 60 + now.getMinutes();
        
        const [startH, startM] = data.quiet_hours_start.split(':').map(Number);
        const [endH, endM] = data.quiet_hours_end.split(':').map(Number);
        
        const startTime = startH * 60 + startM;
        const endTime = endH * 60 + endM;
        
        let quiet = false;
        if (startTime < endTime) {
          quiet = currentTime >= startTime && currentTime <= endTime;
        } else {
          // Crosses midnight (e.g., 22:00 to 06:00)
          quiet = currentTime >= startTime || currentTime <= endTime;
        }
        setIsQuietHours(quiet);
      } else {
        setIsQuietHours(false);
      }
    };
    
    checkQuietHours();
    // Re-check every minute
    const interval = setInterval(checkQuietHours, 60000);
    return () => clearInterval(interval);
  }, [session]);

  const playPingSound = () => {
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1760, ctx.currentTime + 0.1);
      
      gainNode.gain.setValueAtTime(0, ctx.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.5, ctx.currentTime + 0.05);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
      
      osc.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      osc.start();
      osc.stop(ctx.currentTime + 0.5);
    } catch(e) {}
  };

  useEffect(() => {
    if (session) {
      fetchMessages(session.roomId);
      subscribeToRoom(session.roomId, {
        memberId: session.memberId,
        displayName: session.displayName,
        avatarUrl: session.avatarUrl
      });
    }
    return () => {
      unsubscribeFromRoom();
    };
  }, [session, fetchMessages, subscribeToRoom, unsubscribeFromRoom]);

  useEffect(() => {
    // Check for new pings
    if (messages.length > prevMessagesLength.current && prevMessagesLength.current > 0) {
      const newMessages = messages.slice(prevMessagesLength.current);
      const hasNewPing = newMessages.some(m => m.message_type === 'ping');
      if (hasNewPing) {
        setIsPinging(true);
        playPingSound();
        setTimeout(() => setIsPinging(false), 500);
      }
    }
    prevMessagesLength.current = messages.length;

    // Auto-scroll to bottom on new message
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!session) {
    return <Navigate to="/" replace />;
  }

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;

    setIsSending(true);
    try {
      await sendMessage(session.roomId, session.memberId, text.trim(), 'text');
      setText('');
    } catch (err: any) {
      setModal({ isOpen: true, type: 'error', title: 'فشل الإرسال', message: err.message || 'حدث خطأ غير معروف أثناء الإرسال.' });
    } finally {
      setIsSending(false);
    }
  };

  const handleLeave = () => {
    clearSession();
    navigate('/');
  };

  return (
    <div className={`flex flex-col h-screen bg-slate-50 dark:bg-slate-900 font-sans transition-colors duration-300 ${isPinging ? 'animate-shake' : ''}`}>
      {/* Chat Header */}
      <header className="bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 px-4 py-4 flex items-center justify-between shadow-sm sticky top-0 z-10 transition-colors duration-300">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-tr from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-white font-bold shadow-md overflow-hidden border-2 border-blue-100">
            {session.avatarUrl ? (
              <img src={session.avatarUrl} alt="avatar" className="w-full h-full object-cover" />
            ) : (
              session.displayName.charAt(0)
            )}
          </div>
          <div>
            <h2 className="font-black text-gray-900 dark:text-white text-lg leading-tight">{session.displayName}</h2>
            <div className="flex items-center gap-1.5 mt-0.5">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <p className="text-xs text-gray-500 font-medium">متصل بالغرفة ({onlineUsers.length})</p>
            </div>
          </div>
        </div>
        
        {/* Online Presence Avatars */}
        <div className="hidden sm:flex items-center mr-auto ml-4">
          <div className="flex -space-x-2 space-x-reverse rtl:space-x-reverse">
            {onlineUsers.slice(0, 4).map((u, i) => (
              <div 
                key={u.memberId} 
                className="w-8 h-8 rounded-full border-2 border-white bg-gradient-to-tr from-gray-400 to-gray-600 flex items-center justify-center text-white text-[10px] font-bold z-10 shadow-sm"
                style={{ zIndex: 10 - i }}
                title={u.displayName}
              >
                {u.avatarUrl ? (
                  <img src={u.avatarUrl} alt="avatar" className="w-full h-full rounded-full object-cover" />
                ) : (
                  u.displayName.charAt(0)
                )}
              </div>
            ))}
            {onlineUsers.length > 4 && (
              <div className="w-8 h-8 rounded-full border-2 border-white bg-gray-100 flex items-center justify-center text-gray-600 text-[10px] font-bold shadow-sm" style={{ zIndex: 0 }}>
                +{onlineUsers.length - 4}
              </div>
            )}
          </div>
        </div>

        <button 
          onClick={handleLeave}
          className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors flex items-center gap-2 font-bold text-sm"
        >
          <LogOut size={18} />
          <span className="hidden sm:inline">الخروج من الغرفة</span>
        </button>
      </header>

      {/* Messages Area */}
      <main className={`flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 ${isQuietHours ? 'bg-slate-950' : ''}`}>
        {isQuietHours && (
          <div className="bg-indigo-900/50 border border-indigo-500/30 text-indigo-200 p-4 rounded-2xl text-center mb-6 backdrop-blur-sm mx-auto max-w-md">
            <h3 className="font-bold text-lg mb-1 flex items-center justify-center gap-2">
              <span className="text-2xl">🌙</span> حان وقت النوم!
            </h3>
            <p className="text-sm opacity-80">الدردشة مغلقة الآن للراحة. يمكنك فقط إرسال نداء سريع للضرورة.</p>
          </div>
        )}

        {isLoading && messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400 gap-3">
            <Loader2 className="animate-spin text-blue-500" size={32} />
            <p className="font-medium">جاري جلب الرسائل...</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center max-w-md mx-auto opacity-70">
            <div className="w-20 h-20 bg-blue-100 text-blue-500 rounded-full flex items-center justify-center mb-4">
              <Info size={32} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">الغرفة هادئة جداً!</h3>
            <p className="text-gray-500">أرسل أول رسالة لتبدأ التواصل مع عائلتك.</p>
          </div>
        ) : (
          messages.map((msg, idx) => {
            const isMe = msg.member_id === session.memberId;
            const showName = idx === 0 || messages[idx - 1].member_id !== msg.member_id;

            return (
              <motion.div 
                key={msg.id}
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className={`flex w-full group ${isMe ? 'justify-start' : 'justify-end'}`}
                dir="rtl"
              >
                <div className={`flex flex-col ${isMe ? 'items-start' : 'items-end'} max-w-[85%] sm:max-w-[75%]`}>
                  {showName && (
                    <div className="flex items-center gap-2 mb-1 px-1">
                      {msg.members?.avatar_url ? (
                        <img src={msg.members.avatar_url} alt="avatar" className="w-6 h-6 rounded-full object-cover border border-gray-200" />
                      ) : (
                        <div className="w-6 h-6 bg-gradient-to-tr from-gray-400 to-gray-500 rounded-full flex items-center justify-center text-[10px] text-white font-bold">
                          {msg.members?.display_name?.charAt(0) || 'ع'}
                        </div>
                      )}
                      <span className="text-xs font-bold text-gray-500">
                        {msg.members?.display_name || 'عضو'}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    {/* Delete button (Admin Only) */}
                    {user && (
                      <button 
                        onClick={() => deleteMessage(msg.id)}
                        className={`p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all ${isMe ? 'order-last' : 'order-first'}`}
                        title="حذف الرسالة"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                    <div 
                      className={`px-5 py-3 rounded-2xl shadow-sm relative ${
                      isMe 
                        ? 'bg-blue-600 text-white rounded-tr-sm' 
                        : 'bg-white border border-gray-100 text-gray-800 rounded-tl-sm'
                    }`}
                  >
                    {msg.message_type === 'drawing' ? (
                      <div className="bg-white rounded-xl p-1 mb-1">
                        <img src={msg.content} alt="رسمة" className="max-w-full rounded-lg" loading="lazy" />
                      </div>
                    ) : msg.message_type === 'ping' ? (
                      <div className="flex items-center justify-center py-2 px-1">
                        <motion.div
                          animate={{ 
                            scale: [1, 1.2, 1],
                            rotate: [0, -10, 10, -10, 10, 0]
                          }}
                          transition={{ 
                            duration: 0.5,
                            repeat: Infinity,
                            repeatDelay: 2
                          }}
                          className={`text-3xl sm:text-4xl ${isMe ? 'text-white' : 'text-amber-500'}`}
                        >
                          🔔
                        </motion.div>
                        <span className="font-bold text-lg sm:text-xl mr-3 font-black tracking-wide text-center">
                          {msg.content === 'ping' ? 'نداء سريع!' : msg.content}
                        </span>
                      </div>
                    ) : (
                      <p className="text-[15px] sm:text-base leading-relaxed break-words">{msg.content}</p>
                    )}
                    <span className={`text-[10px] mt-2 block ${isMe ? 'text-blue-200 text-right' : 'text-gray-400 text-left'}`}>
                      {new Date(msg.created_at).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
                </div>
              </motion.div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </main>

      {/* Input Area */}
      <footer className="bg-white dark:bg-slate-900 border-t border-gray-200 dark:border-slate-800 p-4 sm:p-6 pb-6 sm:pb-8 transition-colors duration-300 z-10 relative">
        <form onSubmit={handleSend} className="max-w-4xl mx-auto relative flex items-end gap-2">
          
          <div className="relative">
            <AnimatePresence>
              {showPingMenu && (
                <motion.div 
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute bottom-full mb-3 right-0 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-slate-700 p-2 min-w-[220px] flex flex-col gap-2 z-50"
                >
                  <div className="text-xs font-bold text-gray-400 text-center mb-1">اختر رسالة سريعة</div>
                  {[
                    { text: 'أنا بخير', icon: '👍', color: 'text-blue-500' },
                    { text: 'أفكر فيكم', icon: '❤️', color: 'text-red-500' },
                    { text: 'انتهيت من واجباتي', icon: '📚', color: 'text-green-500' },
                    { text: 'متى نأكل؟', icon: '🍕', color: 'text-orange-500' },
                    { text: 'أحتاج مساعدة', icon: '🆘', color: 'text-pink-600' }
                  ].map(pm => (
                    <button
                      key={pm.text}
                      type="button"
                      onClick={async () => {
                        setShowPingMenu(false);
                        try {
                          await sendMessage(session.roomId, session.memberId, `${pm.icon} ${pm.text}`, 'ping');
                          // Trigger email notification via Edge Function
                          await supabase.functions.invoke('send-ping-email', {
                            body: { roomId: session.roomId, childName: session.displayName, message: pm.text }
                          });
                        } catch (err: any) {
                          setModal({ isOpen: true, type: 'error', title: 'فشل النداء', message: err.message });
                        }
                      }}
                      className="p-3 bg-gray-50 hover:bg-amber-50 dark:bg-slate-700/50 dark:hover:bg-slate-700 rounded-xl font-bold text-gray-700 dark:text-gray-200 transition-colors flex items-center justify-between"
                    >
                      <span>{pm.text}</span>
                      <span className={`text-2xl ${pm.color}`}>{pm.icon}</span>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
            <button
              type="button"
              onClick={() => setShowPingMenu(!showPingMenu)}
              className={`w-14 h-14 shrink-0 rounded-2xl flex items-center justify-center transition-all shadow-sm transform hover:-translate-y-1 ${
                showPingMenu ? 'bg-amber-200 text-amber-700 dark:bg-amber-900 dark:text-amber-300' : 'bg-amber-100 text-amber-600 dark:bg-slate-800 dark:text-amber-400 hover:bg-amber-200 dark:hover:bg-slate-700'
              }`}
              title="رسائل سريعة"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/>
                <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>
              </svg>
            </button>
          </div>

          <button
            type="button"
            disabled={isQuietHours}
            onClick={() => setIsDrawing(true)}
            className={`w-14 h-14 shrink-0 rounded-2xl flex items-center justify-center transition-colors shadow-sm transform ${
              isQuietHours 
                ? 'bg-gray-100 text-gray-300 dark:bg-slate-800/50 dark:text-slate-600 cursor-not-allowed' 
                : 'bg-pink-100 text-pink-600 dark:bg-slate-800 dark:text-pink-400 hover:bg-pink-200 dark:hover:bg-slate-700 hover:-translate-y-1'
            }`}
            title="ارسم لوحة"
          >
            <Palette size={26} />
          </button>
          
          <div className="flex-1 relative">
            <input
              type="text"
              value={text}
              disabled={isQuietHours}
              onChange={(e) => setText(e.target.value)}
              placeholder={isQuietHours ? "الدردشة مغلقة الآن للراحة..." : "اكتب رسالتك هنا..."}
              className={`w-full text-base sm:text-lg rounded-2xl pl-14 pr-5 py-4 outline-none transition-all shadow-inner border ${
                isQuietHours
                  ? 'bg-gray-100 text-gray-400 border-gray-200 dark:bg-slate-900 dark:border-slate-800 dark:text-gray-600 cursor-not-allowed'
                  : 'bg-gray-50 dark:bg-slate-800 border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white focus:bg-white dark:focus:bg-slate-700 focus:ring-2 focus:ring-blue-500'
              }`}
              dir="rtl"
            />
          </div>
          <button
            type="submit"
            disabled={!text.trim() || isSending || isQuietHours}
            className="w-14 h-14 shrink-0 bg-blue-600 text-white rounded-2xl flex items-center justify-center hover:bg-blue-700 disabled:bg-gray-300 dark:disabled:bg-slate-800/80 disabled:text-gray-500 transition-colors shadow-md transform hover:scale-105 active:scale-95"
          >
            {isSending ? <Loader2 className="animate-spin" size={20} /> : <Send size={24} className="mr-1" />}
          </button>
        </form>
      </footer>

      <DrawingBoard
        isOpen={isDrawing}
        onClose={() => setIsDrawing(false)}
        onSend={async (dataUrl) => {
          try {
            await sendMessage(session.roomId, session.memberId, dataUrl, 'drawing');
          } catch (err: any) {
            setModal({ isOpen: true, type: 'error', title: 'فشل الإرسال', message: err.message });
          }
        }}
      />

      <FeedbackModal
        isOpen={modal.isOpen}
        onClose={() => setModal(prev => ({...prev, isOpen: false}))}
        type={modal.type}
        title={modal.title}
        message={modal.message}
      />
    </div>
  );
}
