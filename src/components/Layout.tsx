import { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { MessagesSquare, LogIn, UserPlus } from 'lucide-react';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans">
      {/* Global Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="bg-gradient-to-tr from-blue-500 to-indigo-500 text-white p-2 rounded-xl group-hover:rotate-12 transition-transform">
                <MessagesSquare size={24} />
              </div>
              <span className="font-bold text-2xl bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
                مرسال
              </span>
            </Link>

            <nav className="hidden md:flex gap-8 items-center font-medium text-gray-600">
              <Link to="/" className="hover:text-blue-600 transition-colors">الرئيسية</Link>
              <a href="#features" className="hover:text-blue-600 transition-colors">المميزات</a>
              <a href="#about" className="hover:text-blue-600 transition-colors">عن التطبيق</a>
            </nav>

            <div className="flex items-center gap-3">
              <Link to="/auth?mode=login" className="hidden sm:flex items-center gap-2 text-gray-600 hover:text-gray-900 font-medium px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors">
                <LogIn size={18} />
                دخول الآباء
              </Link>
              <Link to="/auth?mode=signup" className="flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-xl hover:bg-gray-800 transition-colors font-medium shadow-sm">
                <UserPlus size={18} />
                حساب جديد
              </Link>
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
