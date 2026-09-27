import { useState } from 'react';
import { useChatStore } from '../store/useChatStore';
import { Member } from '../types';
import { LogIn, KeyRound, Users, ChevronRight } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function Login() {
  const [step, setStep] = useState<1 | 2>(1);
  const [roomCode, setRoomCode] = useState('');
  const [members, setMembers] = useState<Member[]>([]);
  const [selectedMember, setSelectedMember] = useState<string>('');
  const [pin, setPin] = useState('');
  
  const { getRoomMembers, login, status, error } = useChatStore();

  const handleCheckRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomCode.trim()) return;
    
    const fetchedMembers = await getRoomMembers(roomCode);
    if (fetchedMembers && fetchedMembers.length > 0) {
      setMembers(fetchedMembers);
      setStep(2);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMember || !pin) return;
    
    await login(roomCode, selectedMember, pin);
  };

  return (
    <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-3xl shadow-xl border border-gray-100">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-50 text-blue-500 mb-4">
          <LogIn size={32} />
        </div>
        <h2 className="text-3xl font-bold text-gray-900">مرسال</h2>
        <p className="mt-2 text-gray-500">مساحة آمنة للتواصل العائلي</p>
      </div>

      {error && (
        <div className="p-4 text-sm text-red-700 bg-red-50 rounded-xl border border-red-100 text-center">
          {error}
        </div>
      )}

      {step === 1 ? (
        <form onSubmit={handleCheckRoom} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              رمز الغرفة
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <KeyRound className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                required
                dir="ltr"
                className="block w-full pl-3 pr-10 py-3 border border-gray-200 rounded-xl text-center text-lg tracking-widest focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                placeholder="أدخل الرمز هنا"
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value)}
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={status === 'loading' || !roomCode.trim()}
            className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {status === 'loading' ? 'جاري التحقق...' : 'متابعة'}
            <ChevronRight className="mr-2 h-5 w-5" />
          </button>
        </form>
      ) : (
        <form onSubmit={handleLogin} className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              من أنت؟
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <Users className="h-5 w-5 text-gray-400" />
              </div>
              <select
                required
                className="block w-full pl-3 pr-10 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none appearance-none bg-white"
                value={selectedMember}
                onChange={(e) => setSelectedMember(e.target.value)}
              >
                <option value="" disabled>اختر اسمك</option>
                {members.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.display_name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {selectedMember && (
            <div className="animate-in fade-in zoom-in duration-300">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                الرمز السري (PIN)
              </label>
              <input
                type="password"
                required
                inputMode="numeric"
                dir="ltr"
                maxLength={4}
                className="block w-full px-3 py-3 border border-gray-200 rounded-xl text-center text-2xl tracking-[1em] focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none font-mono"
                placeholder="****"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
              />
            </div>
          )}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="flex-1 py-3 px-4 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all"
            >
              رجوع
            </button>
            <button
              type="submit"
              disabled={status === 'loading' || !selectedMember || !pin}
              className="flex-[2] flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {status === 'loading' ? 'جاري الدخول...' : 'دخول'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
