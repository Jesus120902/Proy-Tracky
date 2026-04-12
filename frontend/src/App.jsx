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

import { ToastProvider, useToast } from './components/Toast';

const AppContent = () => {
  const [userInfo, setUserInfo] = useState(
    localStorage.getItem('userInfo') ? JSON.parse(localStorage.getItem('userInfo')) : null
  );

  const loginHandler = (data) => {
    localStorage.setItem('userInfo', JSON.stringify(data));
    setUserInfo(data);
  };

  const logoutHandler = () => {
    localStorage.removeItem('userInfo');
    setUserInfo(null);
  };

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

  // Si es un repartidor, solo ve su portal móvil simplificado
  if (userInfo.role === 'driver') {
    return (
      <Router>
        <Routes>
          <Route path="/track" element={<PublicTracking />} />
          <Route path="/track/:id" element={<PublicTracking />} />
          <Route path="*" element={<DriverHome user={userInfo} onLogout={logoutHandler} />} />
        </Routes>
      </Router>
    );
  }

  return (
    <Router>
      <Layout user={userInfo} onLogout={logoutHandler}>
        <Routes>
          <Route path="/" element={<Dashboard user={userInfo} />} />
          <Route path="/orders" element={<Orders user={userInfo} />} />
          <Route path="/drivers" element={<Drivers user={userInfo} />} />
          <Route path="/map" element={<MapView user={userInfo} />} />
          {(userInfo.role === 'superadmin' || userInfo.role === 'admin') && (
            <Route path="/companies" element={<Companies user={userInfo} />} />
          )}
          <Route path="/reports" element={<Reports user={userInfo} />} />
          <Route path="/settings" element={<Settings user={userInfo} />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Layout>
    </Router>
  );
};

const App = () => {
  return (
    <ToastProvider>
      <AppContent />
    </ToastProvider>
  );
};

export default App;
