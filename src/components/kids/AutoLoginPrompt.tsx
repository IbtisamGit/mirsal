import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useChatStore } from '../../store/useChatStore';
import { useNavigate } from 'react-router-dom';
import { Play, LogOut, Loader2, UserCircle2 } from 'lucide-react';
import FeedbackModal from '../FeedbackModal';

interface AutoLoginPromptProps {
  onCancel: () => void;
}

export default function AutoLoginPrompt({ onCancel }: AutoLoginPromptProps) {
  const { session, verifyAndResumeSession, clearSession, isLoading } = useChatStore();
  const navigate = useNavigate();
  
  const [modal, setModal] = useState<{isOpen: boolean; type: 'success'|'error'; title: string; message: string}>({
    isOpen: false, type: 'error', title: '', message: ''
  });

  if (!session) return null;

  const handleResume = async () => {
    const isValid = await verifyAndResumeSession();
    if (isValid) {
      navigate('/chat');
    } else {
      setModal({ 
        isOpen: true, 
        type: 'error', 
        title: 'عذراً', 
        message: 'تم إغلاق الغرفة أو إزالة حسابك من قبل الآباء. يرجى طلب رمز دخول جديد.'
      });
    }
  };

  const handleLogout = () => {
    clearSession();
    onCancel();
  };

  return (
    <>
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="bg-white/80 backdrop-blur-xl p-8 rounded-[2rem] shadow-2xl border border-white/40 max-w-md w-full mx-auto relative overflow-hidden"
        >
          {/* Aesthetic background blobs */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-400/20 rounded-full blur-2xl -z-10" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-purple-400/20 rounded-full blur-2xl -z-10" />

          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-tr from-blue-500 to-purple-500 text-white rounded-[2rem] rotate-3 mb-6 shadow-xl shadow-blue-500/30">
              <UserCircle2 size={40} />
            </div>
            <h2 className="text-2xl font-black text-gray-900 mb-2">مرحباً بعودتك!</h2>
            <p className="text-gray-500 font-medium text-lg">
              هل أنت <span className="text-blue-600 font-bold">{session.displayName}</span>؟
            </p>
          </div>

          <div className="space-y-4 relative z-10">
            <button
              onClick={handleResume}
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 rounded-2xl font-bold text-lg hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg shadow-blue-500/30 flex items-center justify-center gap-3 disabled:opacity-70"
            >
              {isLoading ? <Loader2 className="animate-spin" size={24} /> : <><Play size={20} fill="currentColor" /> دخول الغرفة فوراً</>}
            </button>
            
            <button
              onClick={handleLogout}
              disabled={isLoading}
              className="w-full bg-gray-100 text-gray-600 py-4 rounded-2xl font-bold hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
            >
              <LogOut size={18} /> لست أنا (تسجيل خروج)
            </button>
          </div>
        </motion.div>
      </AnimatePresence>

      <FeedbackModal
        isOpen={modal.isOpen}
        onClose={() => {
          setModal(prev => ({...prev, isOpen: false}));
          onCancel();
        }}
        type={modal.type}
        title={modal.title}
        message={modal.message}
      />
    </>
  );
}
