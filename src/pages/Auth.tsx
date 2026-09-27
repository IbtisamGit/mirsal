import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Navigate, useSearchParams, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { ShieldCheck, Mail, Lock, Loader2 } from 'lucide-react';
import Layout from '../components/Layout';
import { motion } from 'framer-motion';
import FeedbackModal from '../components/FeedbackModal';

export default function Auth() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const initialMode = searchParams.get('mode') === 'signup' ? 'signup' : 'login';
  
  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Modal State
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    type: 'success' | 'error';
    title: string;
    message: string;
  }>({
    isOpen: false,
    type: 'success',
    title: '',
    message: ''
  });
  
  const { user } = useAuthStore();

  if (user) return <Navigate to="/dashboard" replace />;

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (mode === 'signup') {
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        
        // Handle case where Supabase requires email verification
        if (data.user && data.user.identities && data.user.identities.length === 0) {
           throw new Error('هذا البريد الإلكتروني مسجل مسبقاً، يرجى تسجيل الدخول.');
        }

        setModalState({
          isOpen: true,
          type: 'success',
          title: 'تم إنشاء الحساب بنجاح! 🎉',
          message: data.session 
            ? 'جاري توجيهك إلى لوحة التحكم...' 
            : 'يرجى التحقق من بريدك الإلكتروني لتفعيل الحساب. (إذا لم يصلك الإيميل، يمكنك إيقاف "Confirm email" من إعدادات Supabase).'
        });

      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
    } catch (err: any) {
      console.error("Auth Error: ", err);
      
      let errorMsg = err.message || 'حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.';
      
      // ترجمة الأخطاء الشائعة من Supabase
      if (errorMsg.includes('Invalid login credentials')) errorMsg = 'البريد الإلكتروني أو كلمة المرور غير صحيحة.';
      if (errorMsg.includes('already registered')) errorMsg = 'هذا البريد الإلكتروني مسجل بالفعل، يرجى تسجيل الدخول.';
      if (errorMsg.includes('Password should be')) errorMsg = 'كلمة المرور يجب أن تتكون من 6 أحرف على الأقل.';
      if (errorMsg.includes('Email not confirmed')) errorMsg = 'لم يتم تأكيد البريد الإلكتروني. يرجى مراجعة صندوق الوارد الخاص بك أو إيقاف "Confirm Email" من إعدادات Supabase.';
      if (errorMsg.includes('rate limit')) errorMsg = 'تم تجاوز الحد الأقصى للمحاولات. يرجى الانتظار قليلاً.';

      setModalState({
        isOpen: true,
        type: 'error',
        title: 'عذراً، لم نتمكن من إتمام العملية',
        message: errorMsg
      });
    } finally {
      setLoading(false);
    }
  };

  const handleModalClose = () => {
    setModalState(prev => ({ ...prev, isOpen: false }));
    // If it was a successful signup and we have a session, the router will auto-redirect anyway via `user` state.
    // If they need to check email, we can route them to login.
    if (modalState.type === 'success' && mode === 'signup') {
       setMode('login');
    }
  };

  return (
    <Layout>
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100 max-w-md w-full relative overflow-hidden">
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-50 rounded-full blur-3xl -z-10" />
          <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-purple-50 rounded-full blur-3xl -z-10" />

          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-50 text-blue-600 mb-4">
              <ShieldCheck size={32} />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">{mode === 'login' ? 'تسجيل دخول الآباء' : 'إنشاء حساب عائلي'}</h2>
            <p className="text-gray-500 mt-2">{mode === 'login' ? 'مرحباً بعودتك لإدارة غرفتك العائلية' : 'ابدأ بإنشاء بيئة تواصل آمنة لعائلتك'}</p>
          </div>

          <form onSubmit={handleAuth} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">البريد الإلكتروني</label>
              <div className="relative group">
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                </div>
                <input type="email" required dir="ltr" className="block w-full pl-3 pr-10 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all bg-gray-50 focus:bg-white" placeholder="parent@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">كلمة المرور</label>
              <div className="relative group">
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                </div>
                <input type="password" required dir="ltr" className="block w-full pl-3 pr-10 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all bg-gray-50 focus:bg-white" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} />
              </div>
            </div>

            <button type="submit" disabled={loading} className="w-full flex justify-center items-center py-3 px-4 rounded-xl shadow-md text-white bg-gray-900 hover:bg-gray-800 focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 disabled:opacity-50 transition-all font-medium mt-2">
              {loading ? <Loader2 className="animate-spin" size={20} /> : (mode === 'login' ? 'دخول' : 'إنشاء الحساب')}
            </button>
          </form>

          <div className="mt-6 text-center text-sm">
            <span className="text-gray-500">{mode === 'login' ? 'ليس لديك حساب؟ ' : 'لديك حساب بالفعل؟ '}</span>
            <button onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setModalState(prev => ({...prev, isOpen: false})); }} className="font-bold text-blue-600 hover:text-blue-700 transition-colors">
              {mode === 'login' ? 'إنشاء حساب جديد' : 'تسجيل الدخول'}
            </button>
          </div>
        </motion.div>
      </div>

      <FeedbackModal
        isOpen={modalState.isOpen}
        onClose={handleModalClose}
        type={modalState.type}
        title={modalState.title}
        message={modalState.message}
      />
    </Layout>
  );
}
