import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRoomStore, Member } from '../../store/useRoomStore';
import { X, UserPlus, Trash2, Loader2, KeyRound } from 'lucide-react';
import FeedbackModal from '../FeedbackModal';

interface ManageMembersModalProps {
  roomId: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function ManageMembersModal({ roomId, isOpen, onClose }: ManageMembersModalProps) {
  const { members, addMember, deleteMember, isLoading } = useRoomStore();
  
  const [name, setName] = useState('');
  const [pin, setPin] = useState('');
  const [role, setRole] = useState<'admin' | 'child'>('child');
  
  const [modal, setModal] = useState<{isOpen: boolean; type: 'success'|'error'; title: string; message: string}>({
    isOpen: false, type: 'success', title: '', message: ''
  });

  const roomMembers = members[roomId] || [];

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pin.length !== 4) {
      setModal({ isOpen: true, type: 'error', title: 'خطأ', message: 'الرمز السري (PIN) يجب أن يكون 4 أرقام بالضبط.' });
      return;
    }
    
    try {
      await addMember(roomId, name, role, pin);
      setName('');
      setPin('');
      // Show short inline feedback instead of big modal for faster workflow, 
      // but keeping modal for errors as per heuristics (Visibility of system status).
    } catch (err: any) {
      setModal({ isOpen: true, type: 'error', title: 'خطأ', message: err.message || 'فشلت إضافة العضو' });
    }
  };

  const handleDelete = async (memberId: string) => {
    if (confirm('هل أنت متأكد من حذف هذا العضو؟ لن يتمكن من الدخول للغرفة بعد الآن.')) {
      try {
        await deleteMember(roomId, memberId);
      } catch (err: any) {
        setModal({ isOpen: true, type: 'error', title: 'خطأ', message: 'حدث خطأ أثناء الحذف' });
      }
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
              className="bg-white rounded-3xl shadow-2xl p-6 sm:p-8 w-full max-w-2xl pointer-events-auto relative max-h-[90vh] overflow-y-auto"
              dir="rtl"
            >
              <button onClick={onClose} className="absolute top-6 left-6 p-2 text-gray-400 hover:bg-gray-100 rounded-full transition-colors">
                <X size={20} />
              </button>

              <div className="mb-8">
                <h2 className="text-2xl font-black text-gray-900 mb-2">إدارة أعضاء الغرفة</h2>
                <p className="text-gray-500 font-medium">أضف الأطفال أو المشرفين (الآباء) الجدد إلى هذه الغرفة.</p>
              </div>

              {/* Add Member Form */}
              <form onSubmit={handleAddMember} className="bg-slate-50 p-6 rounded-2xl border border-gray-200 mb-8 grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-gray-700 mb-1">الاسم الدقيق</label>
                  <input type="text" required value={name} onChange={e => setName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="اسم الطفل أو المشرف"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">الرمز السري (PIN)</label>
                  <div className="relative">
                    <KeyRound size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input type="text" required value={pin} onChange={e => setPin(e.target.value.replace(/[^0-9]/g, '').slice(0,4))}
                      className="w-full pl-3 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      placeholder="4 أرقام" dir="ltr"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">الصلاحية</label>
                  <select value={role} onChange={e => setRole(e.target.value as 'admin'|'child')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                  >
                    <option value="child">طفل (مستخدم)</option>
                    <option value="admin">مشرف (أب/أم)</option>
                  </select>
                </div>
                <div className="md:col-span-4 mt-2">
                  <button type="submit" disabled={isLoading || name.length < 2 || pin.length !== 4} 
                    className="w-full bg-blue-600 text-white py-2 rounded-lg font-bold hover:bg-blue-700 transition flex items-center justify-center gap-2 disabled:opacity-50">
                    {isLoading ? <Loader2 className="animate-spin" size={18} /> : <><UserPlus size={18} /> إضافة عضو جديد</>}
                  </button>
                </div>
              </form>

              {/* Members List */}
              <h3 className="text-lg font-bold text-gray-900 mb-4">الأعضاء الحاليين ({roomMembers.length})</h3>
              {roomMembers.length === 0 ? (
                <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                  لا يوجد أعضاء في هذه الغرفة بعد.
                </div>
              ) : (
                <ul className="space-y-3">
                  {roomMembers.map(member => (
                    <li key={member.id} className="flex justify-between items-center p-4 bg-white border border-gray-200 rounded-xl hover:shadow-sm transition-shadow">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-bold text-gray-900">{member.display_name}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${member.role === 'admin' ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700'}`}>
                            {member.role === 'admin' ? 'مشرف' : 'طفل'}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500">PIN: ****</p>
                      </div>
                      <button 
                        onClick={() => handleDelete(member.id)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        title="حذف العضو"
                      >
                        <Trash2 size={20} />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
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
