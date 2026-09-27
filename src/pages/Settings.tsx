import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { useAuthStore } from '../store/useAuthStore';
import { useThemeStore } from '../store/useThemeStore';
import { motion } from 'framer-motion';
import { User, Palette, Moon, Sun, Loader2, Shuffle, Check } from 'lucide-react';
import { supabase } from '../lib/supabase';
import FeedbackModal from '../components/FeedbackModal';

export default function Settings() {
  const { user } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();
  
  const [name, setName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  
  const [modal, setModal] = useState<{isOpen: boolean; type: 'success'|'error'; title: string; message: string}>({
    isOpen: false, type: 'success', title: '', message: ''
  });

  useEffect(() => {
    if (user?.user_metadata) {
      setName(user.user_metadata.full_name || '');
      setAvatarUrl(user.user_metadata.avatar_url || '');
    }
  }, [user]);

  const handleGenerateAvatar = (e: React.MouseEvent) => {
    e.preventDefault();
    const randomSeed = Math.random().toString(36).substring(7);
    const newAvatar = `https://api.dicebear.com/7.x/adventurer/svg?seed=${randomSeed}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf`;
    setAvatarUrl(newAvatar);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    
    setIsSaving(true);
    try {
      const { error } = await supabase.auth.updateUser({
        data: { 
          full_name: name.trim(),
          avatar_url: avatarUrl 
        }
      });

      if (error) throw error;
      
      // Also update display_name and avatar_url in members table
      // Since they are the parent, they own the rooms, so we update their admin/owner profile across all their rooms
      if (user) {
        const { data: ownedRooms } = await supabase.from('rooms').select('id').eq('owner_id', user.id);
        if (ownedRooms && ownedRooms.length > 0) {
          const roomIds = ownedRooms.map(r => r.id);
          await supabase
            .from('members')
            .update({ display_name: name.trim(), avatar_url: avatarUrl })
            .in('room_id', roomIds)
            .in('role', ['owner', 'admin']);
        }
      }

      // Reload window to refresh user state globally
      window.location.reload();
      
    } catch (err: any) {
      setModal({ isOpen: true, type: 'error', title: 'خطأ', message: err.message || 'حدث خطأ أثناء حفظ التغييرات' });
      setIsSaving(false);
    }
  };

  return (
    <Layout>
      <div className="min-h-[calc(100vh-4rem)] bg-slate-50 dark:bg-slate-900 transition-colors duration-300 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto space-y-8">
          
          <div className="mb-10">
            <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-2">إعدادات الحساب</h1>
            <p className="text-gray-500 dark:text-gray-400 font-medium">تخصيص ملفك الشخصي ومظهر التطبيق.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Theme Settings */}
            <div className="md:col-span-1 space-y-6">
              <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-gray-200 dark:border-slate-700">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-2xl">
                    <Palette size={24} />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">المظهر</h2>
                </div>
                
                <button 
                  onClick={toggleTheme}
                  className="w-full flex items-center justify-between p-4 rounded-2xl border-2 border-gray-100 dark:border-slate-700 hover:border-indigo-500 dark:hover:border-indigo-500 transition-colors group"
                >
                  <div className="flex items-center gap-3 text-gray-700 dark:text-gray-200 font-bold">
                    {theme === 'dark' ? <Moon size={20} className="text-indigo-500" /> : <Sun size={20} className="text-orange-500" />}
                    {theme === 'dark' ? 'الوضع الليلي' : 'الوضع النهاري'}
                  </div>
                  <div className="w-12 h-6 bg-gray-200 dark:bg-indigo-600 rounded-full relative transition-colors">
                    <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${theme === 'dark' ? 'left-1 translate-x-0' : 'right-1 translate-x-0'}`} />
                  </div>
                </button>
              </div>
            </div>

            {/* Profile Settings */}
            <div className="md:col-span-2">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-slate-800 p-6 sm:p-8 rounded-3xl shadow-sm border border-gray-200 dark:border-slate-700"
              >
                <div className="flex items-center gap-3 mb-8">
                  <div className="p-3 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-2xl">
                    <User size={24} />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">الملف الشخصي</h2>
                </div>

                <form onSubmit={handleSaveProfile} className="space-y-8">
                  
                  {/* Avatar Picker */}
                  <div className="flex flex-col sm:flex-row items-center gap-6">
                    <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-[2rem] bg-slate-100 dark:bg-slate-700 border-4 border-white dark:border-slate-800 shadow-xl overflow-hidden flex-shrink-0">
                      {avatarUrl ? (
                        <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-4xl text-gray-400 font-black">
                          {name.charAt(0) || '?'}
                        </div>
                      )}
                    </div>
                    <div className="text-center sm:text-right space-y-3">
                      <h3 className="font-bold text-gray-900 dark:text-white">الصورة الرمزية (Avatar)</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xs">اضغط على الزر لتوليد شخصية عشوائية مرحة لتمثلك في الغرف العائلية.</p>
                      <button 
                        type="button"
                        onClick={handleGenerateAvatar}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-xl font-bold text-sm hover:bg-blue-100 dark:hover:bg-blue-500/20 transition-colors"
                      >
                        <Shuffle size={16} /> توليد صورة جديدة
                      </button>
                    </div>
                  </div>

                  {/* Name Input */}
                  <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">اسمك الحقيقي (أو لقبك)</label>
                    <input 
                      type="text" 
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-gray-900 dark:text-white font-medium focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                      placeholder="مثال: بابا، ماما، المهندس..."
                    />
                  </div>

                  <div className="pt-4 border-t border-gray-100 dark:border-slate-700">
                    <button 
                      type="submit"
                      disabled={isSaving || !name.trim()}
                      className="w-full sm:w-auto px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                    >
                      {isSaving ? <Loader2 className="animate-spin" size={20} /> : <><Check size={20} /> حفظ التغييرات</>}
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>

          </div>
        </div>
      </div>

      <FeedbackModal
        isOpen={modal.isOpen}
        onClose={() => setModal(prev => ({...prev, isOpen: false}))}
        type={modal.type}
        title={modal.title}
        message={modal.message}
      />
    </Layout>
  );
}
