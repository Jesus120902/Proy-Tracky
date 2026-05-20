import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Orders from './pages/Orders';
import Drivers from './pages/Drivers';
import MapView from './pages/MapView';
import LoginPage from './pages/LoginPage';
import PublicTracking from './pages/PublicTracking';
import Companies from './pages/Companies';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import DriverHome from './pages/DriverHome';
import UserManagement from './pages/UserManagement';
import { ToastProvider, useToast } from './components/Toast';
import { clearSession } from './services/api';

const AppContent = () => {
  const [userInfo, setUserInfo] = useState(() => {
    try {
      const stored = localStorage.getItem('userInfo');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const { addToast } = useToast();

  const loginHandler = (data) => {
    localStorage.setItem('userInfo', JSON.stringify(data));
    setUserInfo(data);
  };

  const logoutHandler = () => {
    clearSession();
    setUserInfo(null);
  };

  // Escuchar logout forzado por JWT expirado / inválido
  useEffect(() => {
    const handleForcedLogout = () => {
      clearSession();
      setUserInfo(null);
      addToast('Sesión expirada. Por favor inicia sesión nuevamente.', 'error');
    };

    window.addEventListener('tracky:logout', handleForcedLogout);
    return () => window.removeEventListener('tracky:logout', handleForcedLogout);
  }, [addToast]);

  // ── Rutas públicas (sin sesión) ──────────────────────────────
  if (!userInfo) {
    return (
      <Router>
        <Routes>
          <Route path="/track" element={<PublicTracking />} />
          <Route path="/track/:id" element={<PublicTracking />} />
          <Route path="*" element={<LoginPage onLogin={loginHandler} />} />
        </Routes>
      </Router>
    );
  }

  // ── Portal del conductor (vista móvil simplificada) ───────────
  if (userInfo.role === 'driver') {
    return (
      <Router>
        <Routes>
          <Route path="/track" element={<PublicTracking />} />
          <Route path="/track/:id" element={<PublicTracking />} />
          <Route
            path="*"
            element={<DriverHome user={userInfo} onLogout={logoutHandler} />}
          />
        </Routes>
      </Router>
    );
  }

  // ── Panel administrativo ─────────────────────────────────────
  return (
    <Router>
      <Layout user={userInfo} onLogout={logoutHandler}>
        <Routes>
          <Route path="/" element={<Dashboard user={userInfo} />} />
          <Route path="/orders" element={<Orders user={userInfo} />} />
          <Route path="/drivers" element={<Drivers user={userInfo} />} />
          <Route path="/map" element={<MapView user={userInfo} />} />
          <Route path="/reports" element={<Reports user={userInfo} />} />
          <Route path="/settings" element={<Settings user={userInfo} />} />
          {(userInfo.role === 'superadmin' || userInfo.role === 'admin') && (
            <>
              <Route path="/companies" element={<Companies user={userInfo} />} />
              <Route path="/users" element={<UserManagement user={userInfo} />} />
            </>
          )}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </Router>
  );
};

const App = () => (
  <ToastProvider>
    <AppContent />
  </ToastProvider>
);

export default App;
