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
import LandingPage from './pages/LandingPage';
import RegisterPage from './pages/RegisterPage';
import ClientPortal from './pages/ClientPortal';
import { ToastProvider, useToast } from './components/Toast';
import { auth } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { authApi, getMyProfile } from './services/api';

const AppContent = () => {
  const [userInfo, setUserInfo] = useState(undefined); // undefined = cargando, null = no autenticado
  const { addToast } = useToast();

  useEffect(() => {
    // Escuchar cambios de sesión Firebase Auth
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          // Cargar perfil completo desde Data Connect
          const profile = await getMyProfile();
          setUserInfo({
            _id: profile.id,
            uid: firebaseUser.uid,
            name: profile.name,
            email: profile.email,
            role: profile.role,
            company: profile.company,
            driverId: profile.driverProfile?.id || null,
          });
        } catch (err) {
          console.error('Error cargando perfil:', err);
          // Si hay sesión Firebase pero no hay perfil en Data Connect,
          // podría ser un usuario recién registrado — cerrar sesión
          await auth.signOut();
          setUserInfo(null);
          addToast('Error al cargar tu perfil. Intenta nuevamente.', 'error');
        }
      } else {
        setUserInfo(null);
      }
    });

    return () => unsubscribe();
  }, []);

  const loginHandler = (data) => {
    setUserInfo(data);
  };

  const logoutHandler = async () => {
    await authApi.logout();
    setUserInfo(null);
  };

  // Pantalla de carga mientras Firebase verifica la sesión
  if (userInfo === undefined) {
    return (
      <div className="min-h-screen bg-secondary-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-secondary-400 font-semibold tracking-widest text-xs uppercase">
            Cargando Tracky...
          </p>
        </div>
      </div>
    );
  }

  // ── Rutas públicas (sin sesión) ──────────────────────────────
  if (!userInfo) {
    return (
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage onLogin={loginHandler} />} />
          <Route path="/register" element={<RegisterPage onLogin={loginHandler} />} />
          <Route path="/track" element={<PublicTracking />} />
          <Route path="/track/:id" element={<PublicTracking />} />
          <Route path="*" element={<Navigate to="/" replace />} />
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
      <Routes>
        {/* Rutas públicas accesibles incluso logueado */}
        <Route path="/track" element={<PublicTracking />} />
        <Route path="/track/:id" element={<PublicTracking />} />

        {/* Aplicación Core */}
        <Route path="*" element={
          <Layout user={userInfo} onLogout={logoutHandler}>
            <Routes>
              <Route path="/" element={<Dashboard user={userInfo} />} />
              <Route path="/dashboard" element={<Dashboard user={userInfo} />} />
              <Route path="/portal" element={<ClientPortal user={userInfo} />} />
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
        } />
      </Routes>
    </Router>
  );
};

const App = () => (
  <ToastProvider>
    <AppContent />
  </ToastProvider>
);

export default App;
