import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { KeyRound, Users, X, Lock } from 'lucide-react';
import { useChatStore } from '../store/useChatStore';
import { useNavigate } from 'react-router-dom';

interface KidsEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialRoomCode?: string;
}

export default function KidsEntryModal({ isOpen, onClose, initialRoomCode }: KidsEntryModalProps) {
  const [step, setStep] = useState<1 | 2>(1);
  const [roomCode, setRoomCode] = useState(initialRoomCode || '');
  const [roomPassword, setRoomPassword] = useState('');
  const [members, setMembers] = useState<any[]>([]);
  const [selectedMember, setSelectedMember] = useState<string>('');
  const [pin, setPin] = useState('');
  
  const { getRoomMembers, login, status, error } = useChatStore();
  const navigate = useNavigate();

  const handleCheckRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomCode.trim() || !roomPassword.trim()) return;
    const fetchedMembers = await getRoomMembers(roomCode, roomPassword);
    if (fetchedMembers && fetchedMembers.length > 0) {
      setMembers(fetchedMembers);
      setStep(2);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMember || !pin) return;
    const success = await login(roomCode, selectedMember, pin);
    if (success) {
      onClose();
      navigate('/chat');
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
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50"
          />
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4 pointer-events-none">
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="bg-white rounded-[2rem] shadow-2xl p-6 sm:p-8 w-full max-w-md pointer-events-auto relative overflow-hidden border border-blue-50"
            >
              <button
                onClick={onClose}
                className="absolute top-4 left-4 p-2 bg-gray-50 text-gray-400 hover:bg-gray-100 hover:text-gray-600 rounded-full transition-colors"
                title="إغلاق"
              >
                <X size={20} />
              </button>

              <div className="text-center mb-8">
                <h2 className="text-3xl font-black bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-500">
                  {step === 1 ? 'أهلاً بك' : 'اختر شخصيتك'}
                </h2>
                <p className="text-gray-500 mt-2 font-medium">
                  {step === 1 ? 'أدخل الرمز وكلمة المرور للبدء' : 'من أنت؟ أدخل الرمز السري الخاص بك'}
                </p>
              </div>

              {error && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="p-3 mb-6 text-sm text-red-600 bg-red-50 rounded-xl text-center font-medium border border-red-100">
                  {error}
                </motion.div>
              )}

              {step === 1 ? (
                <form onSubmit={handleCheckRoom} className="space-y-6">
                  <div>
                    <div className="relative group">
                      <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                        <KeyRound className="h-6 w-6 text-blue-400 transition-colors" />
                      </div>
                      <input
                        type="text" required dir="ltr"
                        className="block w-full pl-4 pr-12 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl text-center text-xl font-bold tracking-widest focus:bg-white focus:ring-0 focus:border-blue-500 transition-all outline-none"
                        placeholder="رمز الغرفة"
                        value={roomCode}
                        onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="relative group">
                      <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                        <Lock className="h-6 w-6 text-blue-400 transition-colors" />
                      </div>
                      <input
                        type="password" required dir="ltr"
                        className="block w-full pl-4 pr-12 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl text-center text-xl font-bold tracking-widest focus:bg-white focus:ring-0 focus:border-blue-500 transition-all outline-none"
                        placeholder="كلمة مرور الغرفة"
                        value={roomPassword}
                        onChange={(e) => setRoomPassword(e.target.value)}
                      />
                    </div>
                  </div>
                  <button
                    type="submit" disabled={status === 'loading' || !roomCode.trim() || !roomPassword.trim()}
                    className="w-full flex justify-center items-center py-4 px-4 rounded-2xl shadow-lg shadow-blue-500/30 text-lg font-bold text-white bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 disabled:opacity-50 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
                  >
                    {status === 'loading' ? 'جاري التحقق...' : 'انطلق'}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleLogin} className="space-y-6">
                  <div>
                    <div className="relative group">
                      <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                        <Users className="h-6 w-6 text-purple-400 transition-colors" />
                      </div>
                      <select
                        required
                        className="block w-full pl-4 pr-12 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl font-bold text-lg text-gray-700 focus:bg-white focus:ring-0 focus:border-purple-500 transition-all outline-none appearance-none"
                        value={selectedMember}
                        onChange={(e) => setSelectedMember(e.target.value)}
                      >
                        <option value="" disabled>اختر اسمك من هنا</option>
                        {members.map((m) => (
                          <option key={m.id} value={m.id}>{m.display_name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {selectedMember && (
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
                      <input
                        type="password" required inputMode="numeric" dir="ltr" maxLength={4}
                        className="block w-full px-4 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl text-center text-3xl font-mono tracking-[0.5em] focus:bg-white focus:ring-0 focus:border-purple-500 transition-all outline-none"
                        placeholder="****"
                        value={pin} onChange={(e) => setPin(e.target.value.replace(/[^0-9]/g, '').slice(0,4))}
                      />
                    </motion.div>
                  )}

                  <div className="flex gap-3 pt-2">
                    <button
                      type="button" onClick={() => setStep(1)}
                      className="flex-1 py-4 px-4 rounded-2xl font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors"
                    >
                      رجوع
                    </button>
                    <button
                      type="submit" disabled={status === 'loading' || !selectedMember || pin.length !== 4}
                      className="flex-[2] flex justify-center items-center py-4 px-4 rounded-2xl shadow-lg shadow-purple-500/30 text-lg font-bold text-white bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 transition-all transform hover:-translate-y-0.5"
                    >
                      {status === 'loading' ? 'لحظة...' : 'دخول الغرفة'}
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
