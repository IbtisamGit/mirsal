import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useChatStore } from './store/useChatStore';
import Home from './pages/Home';
import Chat from './components/Chat';

// Placeholders for adult flow
function Auth() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-2xl shadow-sm text-center max-w-md w-full">
        <h2 className="text-2xl font-bold mb-4">تسجيل الدخول / حساب جديد</h2>
        <p className="text-gray-500 mb-6">هذه الصفحة مخصصة لإنشاء حساب جديد كولي أمر لإدارة الغرف.</p>
        <p className="text-sm text-blue-600 bg-blue-50 p-4 rounded-xl">(Placeholder for Adult Auth Flow)</p>
      </div>
    </div>
  );
}

function Dashboard() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-2xl shadow-sm text-center max-w-md w-full">
        <h2 className="text-2xl font-bold mb-4">لوحة التحكم</h2>
        <p className="text-gray-500 mb-6">هنا يمكنك إنشاء غرف عائلية جديدة وتوليد رموز الدخول.</p>
        <p className="text-sm text-purple-600 bg-purple-50 p-4 rounded-xl">(Placeholder for Adult Dashboard)</p>
      </div>
    </div>
  );
}

export default function App() {
  const { session, hydrateSession } = useChatStore();

  useEffect(() => {
    hydrateSession();
  }, [hydrateSession]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route 
          path="/chat" 
          element={session ? <Chat /> : <Navigate to="/" replace />} 
        />
      </Routes>
    </BrowserRouter>
  );
}
