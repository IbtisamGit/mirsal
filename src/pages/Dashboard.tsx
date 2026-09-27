import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { useRoomStore, Room } from '../store/useRoomStore';
import { useAuthStore } from '../store/useAuthStore';
import { useChatStore } from '../store/useChatStore';
import { supabase } from '../lib/supabase';
import { motion } from 'framer-motion';
import { Plus, Users, Moon, KeyRound, Loader2, Copy, LogOut, Settings } from 'lucide-react';
import FeedbackModal from '../components/FeedbackModal';
import ManageMembersModal from '../components/dashboard/ManageMembersModal';
import QuietHoursModal from '../components/dashboard/QuietHoursModal';
import RoomSettingsModal from '../components/dashboard/RoomSettingsModal';
import KidsEntryModal from '../components/KidsEntryModal';

export default function Dashboard() {
  const { rooms, members, fetchRooms, createRoom, addMember, isLoading } = useRoomStore();
  const { user, signOut } = useAuthStore();
  const { saveSession } = useChatStore();
  const navigate = useNavigate();
  
  const [isCreating, setIsCreating] = useState(false);
  const [isEnteringRoomId, setIsEnteringRoomId] = useState<string | null>(null);
  const [newRoomPassword, setNewRoomPassword] = useState('');
  
  const [modal, setModal] = useState<{isOpen: boolean; type: 'success'|'error'; title: string; message: string}>({
    isOpen: false, type: 'success', title: '', message: ''
  });

  // Modal states for Room Management
  const [activeMembersRoom, setActiveMembersRoom] = useState<string | null>(null);
  const [activeQuietHoursRoom, setActiveQuietHoursRoom] = useState<Room | null>(null);
  const [activeSettingsRoom, setActiveSettingsRoom] = useState<Room | null>(null);

  useEffect(() => {
    fetchRooms();
  }, [fetchRooms]);

  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newRoomPassword.length < 4) {
      setModal({ isOpen: true, type: 'error', title: 'خطأ', message: 'كلمة المرور يجب أن تكون 4 أحرف على الأقل.'});
      return;
    }
    
    try {
      await createRoom(newRoomPassword);
      setIsCreating(false);
      setNewRoomPassword('');
      setModal({ isOpen: true, type: 'success', title: 'نجاح', message: 'تم إنشاء الغرفة بنجاح!'});
    } catch (err: any) {
      setModal({ isOpen: true, type: 'error', title: 'خطأ', message: err.message || 'حدث خطأ غير متوقع'});
    }
  };

  const handleQuickEnter = async (room: Room) => {
    setIsEnteringRoomId(room.id);
    try {
      const roomMembers = members[room.id] || [];
      
      // Look for an owner or admin member
      let adminMember = roomMembers.find(m => m.role === 'owner' || m.role === 'admin');
      
      // If no admin/owner member exists, automatically create one for the parent!
      if (!adminMember) {
        const parentName = user?.user_metadata?.full_name || 'المالك';
        await addMember(room.id, parentName, 'owner', '0000');
        // Re-fetch members isn't strictly necessary if the store updates locally, but we need the member ID.
        // Wait, addMember fetches members automatically inside the store! Let's just find it.
        const updatedMembers = useRoomStore.getState().members[room.id] || [];
        adminMember = updatedMembers.find(m => m.role === 'owner' || m.role === 'admin');
        
        if (!adminMember) {
           throw new Error('فشل في إنشاء عضو المشرف للغرفة. يرجى إضافته يدوياً من إدارة الأعضاء.');
        }
      }

      // Sync member profile with latest user metadata if it differs
      const userFullName = user?.user_metadata?.full_name;
      const userAvatar = user?.user_metadata?.avatar_url;
      
      if (adminMember && (userFullName && adminMember.display_name !== userFullName || userAvatar && adminMember.avatar_url !== userAvatar)) {
        const { error: updateError } = await supabase
          .from('members')
          .update({ display_name: userFullName || adminMember.display_name, avatar_url: userAvatar || adminMember.avatar_url })
          .eq('id', adminMember.id);
          
        if (!updateError) {
          adminMember = { ...adminMember, display_name: userFullName || adminMember.display_name, avatar_url: userAvatar || adminMember.avatar_url };
        }
      }

      // Bypass everything and immediately create a chat session
      saveSession({
        roomId: room.id,
        memberId: adminMember.id,
        displayName: adminMember.display_name,
        roomCode: room.room_code,
        avatarUrl: adminMember.avatar_url
      });

      // Go to chat!
      navigate('/chat');
      
    } catch (err: any) {
      setModal({ isOpen: true, type: 'error', title: 'خطأ في الدخول', message: err.message || 'حدث خطأ غير معروف' });
    } finally {
      setIsEnteringRoomId(null);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setModal({ isOpen: true, type: 'success', title: 'تم النسخ', message: `تم نسخ الكود: ${text}`});
  };

  return (
    <Layout>
      <div className="min-h-[calc(100vh-4rem)] bg-slate-50 dark:bg-slate-900 transition-colors duration-300 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
            <div>
              <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-2">لوحة التحكم</h1>
              <p className="text-gray-500 dark:text-gray-400 font-medium">قم بإدارة غرفك العائلية، أوقات الهدوء، وصلاحيات الأطفال من هنا.</p>
            </div>
            <div className="flex gap-3">
              <button onClick={signOut} className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 hover:text-red-600 transition-colors shadow-sm font-medium">
                <LogOut size={18} /> خروج
              </button>
              <button 
                onClick={() => setIsCreating(!isCreating)}
                className="flex items-center gap-2 bg-gray-900 text-white px-5 py-2 rounded-xl hover:bg-gray-800 transition-colors shadow-sm font-medium"
              >
                {isCreating ? 'إلغاء' : <><Plus size={18} /> إنشاء غرفة جديدة</>}
              </button>
            </div>
          </div>

          {/* Create Room Form */}
          {isCreating && (
            <motion.form 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 mb-8 max-w-md"
              onSubmit={handleCreateRoom}
            >
              <h3 className="text-xl font-bold mb-4">إنشاء غرفة عائلية</h3>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">كلمة مرور الغرفة (للحماية)</label>
                <div className="relative">
                  <KeyRound className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input 
                    type="password" required dir="ltr"
                    className="w-full pl-3 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="رمز سري للغرفة"
                    value={newRoomPassword} onChange={(e) => setNewRoomPassword(e.target.value)}
                  />
                </div>
              </div>
              <button type="submit" disabled={isLoading} className="w-full bg-blue-600 text-white py-2 rounded-lg font-bold hover:bg-blue-700 transition flex items-center justify-center gap-2">
                {isLoading ? <Loader2 className="animate-spin" size={20} /> : 'إنشاء وتوليد الرمز'}
              </button>
            </motion.form>
          )}

          {/* Rooms Grid */}
          {isLoading && rooms.length === 0 ? (
            <div className="flex justify-center py-20"><Loader2 className="animate-spin text-blue-500" size={40} /></div>
          ) : rooms.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-3xl border border-gray-200 border-dashed">
              <Users size={48} className="mx-auto text-gray-300 mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">لا توجد غرف حتى الآن</h3>
              <p className="text-gray-500">ابدأ بإنشاء غرفتك العائلية الأولى لتتمكن من إضافة أطفالك.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {rooms.map(room => (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  key={room.id} 
                  className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-200 flex flex-col gap-6"
                >
                  <div className="flex justify-between items-start border-b border-gray-100 pb-6">
                    <div>
                      <p className="text-sm font-bold text-blue-600 mb-1 tracking-wider uppercase">كود الغرفة</p>
                      <div className="flex items-center gap-3">
                        <h2 className="text-4xl font-black text-gray-900 tracking-widest">{room.room_code}</h2>
                        <button onClick={() => copyToClipboard(room.room_code)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition" title="نسخ الكود">
                          <Copy size={20} />
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {room.is_quiet_hours_enabled && (
                        <div className="flex items-center gap-1 bg-purple-50 text-purple-700 px-3 py-1 rounded-full text-sm font-bold border border-purple-100" title="وقت الهدوء مفعل">
                          <Moon size={16} />
                        </div>
                      )}
                      <button onClick={() => setActiveSettingsRoom(room)} className="p-2 text-gray-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition" title="إعدادات الغرفة">
                        <Settings size={20} />
                      </button>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <Users size={18} className="text-gray-400"/> أعضاء الغرفة ({(members[room.id] || []).length})
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {(members[room.id] || []).map(member => (
                        <div key={member.id} className="bg-slate-100 text-slate-700 px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${member.role === 'admin' ? 'bg-orange-500' : 'bg-green-500'}`} />
                          {member.display_name}
                        </div>
                      ))}
                      {(members[room.id] || []).length === 0 && (
                        <span className="text-sm text-gray-500 italic">لا يوجد أعضاء حالياً</span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-3 pt-4 border-t border-gray-100">
                    <button 
                      onClick={() => handleQuickEnter(room)}
                      disabled={isEnteringRoomId === room.id}
                      className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition shadow-sm flex items-center justify-center gap-2 disabled:opacity-70"
                    >
                      {isEnteringRoomId === room.id ? <Loader2 className="animate-spin" size={20} /> : 'دخول للدردشة'}
                    </button>
                    
                    <div className="flex flex-col sm:flex-row gap-3">
                      <button onClick={() => setActiveMembersRoom(room.id)} className="flex-1 bg-gray-50 text-gray-900 border border-gray-200 py-2.5 rounded-xl font-bold hover:bg-gray-100 transition shadow-sm">
                        إدارة الأعضاء
                      </button>
                      <button onClick={() => setActiveQuietHoursRoom(room)} className="flex-1 bg-purple-50 text-purple-700 border border-purple-100 py-2.5 rounded-xl font-bold hover:bg-purple-100 transition shadow-sm flex items-center justify-center gap-2">
                        <Moon size={18} /> أوقات الهدوء
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

        </div>
      </div>

      <FeedbackModal
        isOpen={modal.isOpen}
        onClose={() => setModal(prev => ({...prev, isOpen: false}))}
        type={modal.type}
        title={modal.title}
        message={modal.message}
      />

      {/* Feature Modals */}
      {activeMembersRoom && (
        <ManageMembersModal
          roomId={activeMembersRoom}
          isOpen={!!activeMembersRoom}
          onClose={() => setActiveMembersRoom(null)}
        />
      )}

      {activeQuietHoursRoom && (
        <QuietHoursModal
          room={activeQuietHoursRoom}
          isOpen={!!activeQuietHoursRoom}
          onClose={() => setActiveQuietHoursRoom(null)}
        />
      )}

      {activeSettingsRoom && (
        <RoomSettingsModal
          room={activeSettingsRoom}
          isOpen={!!activeSettingsRoom}
          onClose={() => setActiveSettingsRoom(null)}
        />
      )}
    </Layout>
  );
}
