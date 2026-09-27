import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, XCircle, X } from 'lucide-react';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  type: 'success' | 'error';
  onConfirm?: () => void;
}

export default function FeedbackModal({ isOpen, onClose, title, message, type, onConfirm }: FeedbackModalProps) {
  const isSuccess = type === 'success';

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100]"
          />
          <div className="fixed inset-0 flex items-center justify-center z-[100] p-4 pointer-events-none">
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="bg-white rounded-3xl shadow-2xl p-6 sm:p-8 w-full max-w-sm pointer-events-auto relative text-center overflow-hidden"
            >
              <button
                onClick={onClose}
                className="absolute top-4 left-4 p-2 text-gray-400 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X size={20} />
              </button>

              <div className="flex justify-center mb-6 mt-4">
                <div className={`p-4 rounded-full ${isSuccess ? 'bg-green-50 text-green-500' : 'bg-red-50 text-red-500'}`}>
                  {isSuccess ? <CheckCircle2 size={48} /> : <XCircle size={48} />}
                </div>
              </div>

              <h3 className="text-2xl font-bold text-gray-900 mb-2">{title}</h3>
              <p className="text-gray-600 mb-8 leading-relaxed">{message}</p>

              <button
                onClick={() => {
                  onClose();
                  if (onConfirm) onConfirm();
                }}
                className={`w-full py-3 px-4 rounded-xl font-bold text-white transition-all transform hover:-translate-y-0.5 ${
                  isSuccess 
                    ? 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 shadow-lg shadow-green-500/30' 
                    : 'bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600 shadow-lg shadow-red-500/30'
                }`}
              >
                حسناً
              </button>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
