import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRoomStore, Room } from '../../store/useRoomStore';
import { X, Moon, Clock, Loader2 } from 'lucide-react';
import FeedbackModal from '../FeedbackModal';

interface QuietHoursModalProps {
  room: Room;
  isOpen: boolean;
  onClose: () => void;
}

export default function QuietHoursModal({ room, isOpen, onClose }: QuietHoursModalProps) {
  const { updateQuietHours, isLoading } = useRoomStore();
  
  const [enabled, setEnabled] = useState(room.is_quiet_hours_enabled);
  const [start, setStart] = useState(room.quiet_hours_start?.slice(0,5) || '22:00');
  const [end, setEnd] = useState(room.quiet_hours_end?.slice(0,5) || '07:00');
  
  const [modal, setModal] = useState<{isOpen: boolean; type: 'success'|'error'; title: string; message: string}>({
    isOpen: false, type: 'success', title: '', message: ''
  });

  // Sync state if room prop changes
  useEffect(() => {
    setEnabled(room.is_quiet_hours_enabled);
    setStart(room.quiet_hours_start?.slice(0,5) || '22:00');
    setEnd(room.quiet_hours_end?.slice(0,5) || '07:00');
  }, [room]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateQuietHours(room.id, enabled, enabled ? start : null, enabled ? end : null);
      setModal({ isOpen: true, type: 'success', title: 'تم الحفظ', message: 'تم تحديث إعدادات أوقات الهدوء بنجاح.' });
    } catch (err: any) {
      setModal({ isOpen: true, type: 'error', title: 'خطأ', message: err.message || 'حدث خطأ غير متوقع' });
    }
  };

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
              className="bg-white rounded-3xl shadow-2xl p-6 sm:p-8 w-full max-w-md pointer-events-auto relative"
              dir="rtl"
            >
              <button onClick={onClose} className="absolute top-6 left-6 p-2 text-gray-400 hover:bg-gray-100 rounded-full transition-colors">
                <X size={20} />
              </button>

              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-purple-50 text-purple-600 mb-4">
                  <Moon size={32} />
                </div>
                <h2 className="text-2xl font-black text-gray-900 mb-2">أوقات الهدوء والنوم</h2>
                <p className="text-gray-500 font-medium">سيتم إغلاق المحادثة تلقائياً خلال هذه الأوقات لضمان راحة الأطفال.</p>
              </div>

              <form onSubmit={handleSave} className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-gray-200">
                  <label htmlFor="quiet-toggle" className="font-bold text-gray-900 cursor-pointer select-none">تفعيل أوقات الهدوء</label>
                  <div className="relative inline-block w-12 h-6 align-middle select-none">
                    <input type="checkbox" id="quiet-toggle" checked={enabled} onChange={e => setEnabled(e.target.checked)}
                      className="checked:bg-purple-600 outline-none focus:outline-none right-4 checked:right-0 duration-200 ease-in absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer border-gray-300 checked:border-purple-600 top-0 left-0"
                    />
                    <label htmlFor="quiet-toggle" className={`block overflow-hidden h-6 rounded-full cursor-pointer transition-colors ${enabled ? 'bg-purple-600' : 'bg-gray-300'}`}></label>
                  </div>
                </div>

                <AnimatePresence>
                  {enabled && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="space-y-4 overflow-hidden">
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">وقت البدء (تُغلق الدردشة)</label>
                        <div className="relative">
                          <Clock size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                          <input type="time" required value={start} onChange={e => setStart(e.target.value)}
                            className="w-full pl-3 pr-10 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none font-sans"
                            dir="ltr"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">وقت الانتهاء (تُفتح الدردشة)</label>
                        <div className="relative">
                          <Clock size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                          <input type="time" required value={end} onChange={e => setEnd(e.target.value)}
                            className="w-full pl-3 pr-10 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none font-sans"
                            dir="ltr"
                          />
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <button type="submit" disabled={isLoading} className="w-full bg-gray-900 text-white py-3 rounded-xl font-bold hover:bg-gray-800 transition flex items-center justify-center shadow-md mt-4">
                  {isLoading ? <Loader2 className="animate-spin" size={20} /> : 'حفظ الإعدادات'}
                </button>
              </form>
            </motion.div>
          </div>
          
          <FeedbackModal
            isOpen={modal.isOpen}
            onClose={() => setModal(prev => ({...prev, isOpen: false}))}
            type={modal.type}
            title={modal.title}
            message={modal.message}
          />
        </>
      )}
    </AnimatePresence>
  );
}
