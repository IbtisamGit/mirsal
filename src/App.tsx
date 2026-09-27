import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useChatStore } from './store/useChatStore';
import { useAuthStore } from './store/useAuthStore';
import { useThemeStore } from './store/useThemeStore';

import Home from './pages/Home';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import Chat from './components/Chat';
import Settings from './pages/Settings';
import AdultProtectedRoute from './components/AdultProtectedRoute';

export default function App() {
  const { session: childSession, hydrateSession: hydrateChildSession } = useChatStore();
  const { initializeAuth } = useAuthStore();
  const { theme } = useThemeStore();

  useEffect(() => {
    // 1. Initialize Adult Auth State (Supabase Auth)
    initializeAuth();
    
    // 2. Initialize Child Session State (LocalStorage)
    hydrateChildSession();

    // 3. Initialize Theme
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [initializeAuth, hydrateChildSession, theme]);

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/auth" element={<Auth />} />

        {/* Protected Adult Routes (Supabase Auth Required) */}
        <Route element={<AdultProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/settings" element={<Settings />} />
        </Route>

        {/* Protected Child Routes (Room Code + PIN Session Required) */}
        <Route 
          path="/chat" 
          element={childSession ? <Chat /> : <Navigate to="/" replace />} 
        />
      </Routes>
    </BrowserRouter>
  );
}
