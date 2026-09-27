import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRoomStore, Room } from '../../store/useRoomStore';
import { X, Settings, KeyRound, Loader2, AlertCircle, Power, Trash2 } from 'lucide-react';
import FeedbackModal from '../FeedbackModal';

interface RoomSettingsModalProps {
  room: Room;
  isOpen: boolean;
  onClose: () => void;
}

export default function RoomSettingsModal({ room, isOpen, onClose }: RoomSettingsModalProps) {
  const { updateRoomPassword, toggleRoomStatus, deleteRoom, isLoading } = useRoomStore();
  
  const [newPassword, setNewPassword] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmDeleteText, setConfirmDeleteText] = useState('');
  
  const [modal, setModal] = useState<{isOpen: boolean; type: 'success'|'error'; title: string; message: string}>({
    isOpen: false, type: 'success', title: '', message: ''
  });

  // Default to true if not set (for backward compatibility before migration)
  const isActive = room.is_active !== false;

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 4) {
      setModal({ isOpen: true, type: 'error', title: 'خطأ', message: 'كلمة المرور يجب أن تكون 4 أحرف على الأقل.' });
      return;
    }

    try {
      await updateRoomPassword(room.id, newPassword);
      setNewPassword('');
      setModal({ isOpen: true, type: 'success', title: 'تم التحديث', message: 'تم تغيير كلمة مرور الغرفة بنجاح.' });
    } catch (err: any) {
      setModal({ isOpen: true, type: 'error', title: 'خطأ', message: err.message || 'حدث خطأ أثناء التحديث' });
    }
  };

  const handleToggleStatus = async () => {
    try {
      await toggleRoomStatus(room.id, !isActive);
      // Optional success feedback
    } catch (err: any) {
      setModal({ isOpen: true, type: 'error', title: 'خطأ', message: 'يرجى تشغيل أمر SQL لإضافة حقل is_active أولاً.' });
    }
  };

  const handleDeleteRoom = async () => {
    if (confirmDeleteText !== room.room_code) {
      setModal({ isOpen: true, type: 'error', title: 'خطأ', message: 'رمز التأكيد غير متطابق.' });
      return;
    }

    try {
      await deleteRoom(room.id);
      onClose(); // close the modal completely because the room is gone
    } catch (err: any) {
      setModal({ isOpen: true, type: 'error', title: 'خطأ', message: 'حدث خطأ أثناء الحذف.' });
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
              className="bg-white rounded-3xl shadow-2xl p-6 sm:p-8 w-full max-w-lg pointer-events-auto relative max-h-[95vh] overflow-y-auto"
              dir="rtl"
            >
              <button onClick={onClose} className="absolute top-6 left-6 p-2 text-gray-400 hover:bg-gray-100 rounded-full transition-colors">
                <X size={20} />
              </button>

              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 text-slate-700 mb-4">
                  <Settings size={32} />
                </div>
                <h2 className="text-2xl font-black text-gray-900 mb-2">إعدادات الغرفة</h2>
                <p className="text-gray-500 font-medium">إدارة الأمان والإعدادات المتقدمة للغرفة.</p>
              </div>

              <div className="space-y-6">
                
                {/* Status Toggle */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-5 bg-slate-50 rounded-2xl border border-gray-200 gap-4">
                  <div>
                    <h3 className="font-bold text-gray-900 flex items-center gap-2 mb-1">
                      <Power size={18} className={isActive ? "text-green-600" : "text-gray-400"} />
                      {isActive ? 'الغرفة نشطة' : 'الغرفة متوقفة مؤقتاً'}
                    </h3>
                    <p className="text-sm text-gray-500">عند الإيقاف، لن يتمكن الأطفال من الدخول أو المراسلة.</p>
                  </div>
                  <button 
                    onClick={handleToggleStatus}
                    disabled={isLoading}
                    className={`px-4 py-2 rounded-xl font-bold text-sm transition-colors whitespace-nowrap ${isActive ? 'bg-orange-100 text-orange-700 hover:bg-orange-200' : 'bg-green-100 text-green-700 hover:bg-green-200'}`}
                  >
                    {isActive ? 'إيقاف الغرفة' : 'تفعيل الغرفة'}
                  </button>
                </div>

                {/* Password Change */}
                <div className="bg-slate-50 p-5 rounded-2xl border border-gray-200">
                  <h3 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                    <KeyRound size={18} className="text-blue-600" /> تغيير كلمة مرور الغرفة
                  </h3>
                  <p className="text-sm text-gray-500 mb-4">في حال نسيان كلمة المرور الأساسية للغرفة، يمكنك تعيين كلمة مرور جديدة هنا ليتمكن الأطفال من الدخول.</p>
                  
                  <form onSubmit={handleUpdatePassword}>
                    <div className="mb-3">
                      <input 
                        type="password" required dir="ltr"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        placeholder="كلمة المرور الجديدة"
                        value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
                      />
                    </div>
                    <button type="submit" disabled={isLoading || newPassword.length < 4} className="w-full bg-blue-600 text-white py-2 rounded-lg font-bold hover:bg-blue-700 transition flex items-center justify-center disabled:opacity-50">
                      {isLoading && !isDeleting ? <Loader2 className="animate-spin" size={20} /> : 'تحديث كلمة المرور'}
                    </button>
                  </form>
                </div>

                {/* Danger Zone */}
                <div className="bg-red-50 p-5 rounded-2xl border border-red-100">
                  <h3 className="font-bold text-red-700 mb-2 flex items-center gap-2">
                    <AlertCircle size={18} /> منطقة الخطر
                  </h3>
                  <p className="text-sm text-red-800/80 mb-4">حذف الغرفة سيؤدي إلى مسح جميع المحادثات وحسابات الأطفال المرتبطة بها نهائياً. لا يمكن التراجع عن هذا الإجراء.</p>
                  
                  {!isDeleting ? (
                    <button 
                      onClick={() => setIsDeleting(true)}
                      className="w-full bg-red-100 text-red-700 py-2 rounded-lg font-bold hover:bg-red-200 transition flex items-center justify-center gap-2"
                    >
                      <Trash2 size={18} /> حذف الغرفة نهائياً
                    </button>
                  ) : (
                    <div className="space-y-3">
                      <label className="block text-sm font-bold text-red-700">لتأكيد الحذف، اكتب كود الغرفة ({room.room_code})</label>
                      <input 
                        type="text" dir="ltr"
                        className="w-full px-3 py-2 border border-red-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none uppercase"
                        placeholder={room.room_code}
                        value={confirmDeleteText} onChange={(e) => setConfirmDeleteText(e.target.value.toUpperCase())}
                      />
                      <div className="flex gap-2">
                        <button 
                          onClick={() => { setIsDeleting(false); setConfirmDeleteText(''); }}
                          className="flex-1 bg-white text-gray-600 border border-gray-200 py-2 rounded-lg font-bold hover:bg-gray-50 transition"
                        >
                          إلغاء
                        </button>
                        <button 
                          onClick={handleDeleteRoom}
                          disabled={confirmDeleteText !== room.room_code || isLoading}
                          className="flex-[2] bg-red-600 text-white py-2 rounded-lg font-bold hover:bg-red-700 transition disabled:opacity-50 flex items-center justify-center"
                        >
                          {isLoading ? <Loader2 className="animate-spin" size={20} /> : 'تأكيد الحذف'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>

              </div>
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
