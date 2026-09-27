import { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { MessagesSquare, LogIn, UserPlus, LayoutDashboard, Settings } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { useThemeStore } from '../store/useThemeStore';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { user } = useAuthStore();
  const { theme } = useThemeStore();

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-900 transition-colors duration-300 font-sans">
      {/* Global Header */}
      <header className={`sticky top-0 z-50 backdrop-blur-md border-b shadow-sm transition-colors duration-300 ${
        theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white/80 border-gray-100'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 flex-row-reverse">
            {/* Logo is now on the left (due to flex-row-reverse) */}
            <Link to="/" className="flex items-center gap-2 group">
              <div className="bg-gradient-to-tr from-blue-500 to-indigo-500 text-white p-2 rounded-xl group-hover:-rotate-12 transition-transform">
                <MessagesSquare size={24} />
              </div>
              <span className="font-bold text-2xl bg-clip-text text-transparent bg-gradient-to-l from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">
                مرسال
              </span>
            </Link>

            <nav className="hidden md:flex gap-8 items-center font-medium text-gray-600 dark:text-gray-300">
              <a href="/#about" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">عن التطبيق</a>
              <a href="/#features" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">المميزات</a>
              <Link to="/" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">الرئيسية</Link>
            </nav>

            {/* Profile/Auth Buttons are now on the right */}
            <div className="flex items-center gap-3 relative">
              {user ? (
                <>
                  <Link to="/dashboard" className="hidden sm:flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-5 py-2 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all font-medium shadow-md shadow-blue-500/20">
                    <LayoutDashboard size={18} />
                    لوحة التحكم
                  </Link>

                  <div className="relative group">
                    <button className="flex items-center gap-3 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 px-3 py-1.5 rounded-full hover:shadow-md transition-all">
                      <span className="font-bold text-gray-700 dark:text-gray-200 max-w-[100px] truncate hidden sm:block">
                        {user.user_metadata?.full_name || 'حسابي'}
                      </span>
                      <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-500 flex items-center justify-center text-white font-bold overflow-hidden">
                        {user.user_metadata?.avatar_url ? (
                          <img src={user.user_metadata.avatar_url} alt="avatar" className="w-full h-full object-cover" />
                        ) : (
                          user.user_metadata?.full_name?.charAt(0) || 'م'
                        )}
                      </div>
                    </button>
                    
                    {/* Dropdown Menu */}
                    <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-gray-100 dark:border-slate-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform origin-top-right scale-95 group-hover:scale-100 flex flex-col overflow-hidden z-50">
                      <Link to="/settings" className="flex items-center gap-2 px-4 py-3 text-gray-700 dark:text-gray-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors font-medium border-b border-gray-50 dark:border-slate-700 text-right justify-end">
                        إعدادات الحساب <Settings size={18} />
                      </Link>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <Link to="/auth?mode=login" className="hidden sm:flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white font-medium px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors">
                    دخول الآباء <LogIn size={18} />
                  </Link>
                  <Link to="/auth?mode=signup" className="flex items-center gap-2 bg-gray-900 dark:bg-indigo-600 text-white px-4 py-2 rounded-xl hover:bg-gray-800 dark:hover:bg-indigo-700 transition-colors font-medium shadow-sm">
                    حساب جديد <UserPlus size={18} />
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 relative">
        {children}
      </main>

      {/* Global Footer */}
      <footer className="bg-white border-t border-gray-100 py-12 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2 opacity-80">
            <MessagesSquare size={20} className="text-blue-600" />
            <span className="font-bold text-lg text-gray-800">مرسال</span>
          </div>
          <p className="text-gray-500 text-sm">
            © {new Date().getFullYear()} تطبيق مرسال. جميع الحقوق محفوظة. للتواصل العائلي الآمن.
          </p>
          <div className="flex gap-4 text-sm text-gray-500 font-medium">
            <a href="#" className="hover:text-blue-600">سياسة الخصوصية</a>
            <a href="#" className="hover:text-blue-600">الشروط والأحكام</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
