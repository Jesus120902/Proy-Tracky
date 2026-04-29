import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  Truck,
  Map as MapIcon,
  BarChart3,
  Menu,
  LogOut,
  Bell,
  Search,
  Settings as SettingsIcon,
  HelpCircle,
  ChevronRight,
  ShieldAlert,
  Users
} from 'lucide-react';
import useSocket from '../hooks/useSocket';
import { useToast } from '../components/Toast';

const SidebarItem = ({ icon: Icon, label, path, active, onClick }) => (
  <Link
    to={path}
    onClick={onClick}
    className={`flex items-center justify-between group px-4 py-3 rounded-xl transition-all duration-300 ${active
        ? 'bg-primary-600 text-white shadow-lg shadow-primary-900/40 ring-1 ring-white/10'
        : 'text-slate-400 hover:bg-white/5 hover:text-white'
      }`}
  >
    <div className="flex items-center gap-3">
      <Icon size={20} className={`${active ? 'text-white' : 'text-slate-500 group-hover:text-primary-400'} transition-colors`} />
      <span className="font-medium text-sm">{label}</span>
    </div>
    {active && <ChevronRight size={14} className="opacity-50" />}
  </Link>
);

const Navbar = ({ toggleSidebar, user }) => (
  <header className="h-16 border-b border-secondary-200 bg-white/80 backdrop-blur-xl sticky top-0 z-30 px-6 flex items-center justify-between shadow-sm">
    <div className="flex items-center gap-4">
      <button
        onClick={toggleSidebar}
        className="p-2 hover:bg-secondary-100 rounded-lg lg:hidden transition-colors"
      >
        <Menu size={20} />
      </button>
      <div className="relative hidden md:block group">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary-400 group-focus-within:text-primary-500 transition-colors" size={18} />
        <input
          type="text"
          placeholder="Buscar en la organización..."
          className="pl-10 pr-4 py-2 bg-secondary-50 border border-transparent rounded-xl w-64 focus:bg-white focus:border-primary-100 focus:ring-4 focus:ring-primary-500/10 transition-all outline-none text-sm"
        />
      </div>
    </div>

    <div className="flex items-center gap-3">
      <div className="flex items-center gap-3 pl-2 group">
        <div className="text-right hidden sm:block">
          <p className="text-sm font-black text-secondary-900 leading-none">{user.name}</p>
          <p className="text-[10px] uppercase tracking-wider text-primary-600 mt-1 font-black">{user.role}</p>
        </div>
        <div className="relative">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-blue-600 flex items-center justify-center text-white font-black border-2 border-white shadow-lg">
            {user.name.charAt(0)}
          </div>
          <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
        </div>
      </div>
    </div>
  </header>
);

const Layout = ({ children, user, onLogout }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
    { icon: Package, label: 'Órdenes', path: '/orders' },
    /* Funcionalidades ocultas para el hito del 30%
    { icon: Truck, label: 'Flota en Ruta', path: '/drivers' },
    { icon: BarChart3, label: 'Analítica', path: '/reports' },
    */
    { icon: MapIcon, label: 'Control Live', path: '/map' },
  ];

  /* 
  // Configuración y Administración (Oculto para demo 30%)
  if (user.role === 'admin') {
    menuItems.push({ icon: SettingsIcon, label: 'Configuración', path: '/settings' });
  }

  if (user.role === 'superadmin') {
    menuItems.push({ icon: ShieldAlert, label: 'Empresas SaaS', path: '/companies' });
  }

  if (user.role === 'superadmin' || user.role === 'admin') {
    menuItems.push({ icon: Users, label: 'Cuentas & Staff', path: '/users' });
  }
  */

  const { on } = useSocket(user.company?._id || user.company);
  const { addToast } = useToast();

  useEffect(() => {
    if (!on) return;

    // Escuchar eventos globales para notificaciones
    on('order_status_update', (data) => {
      const statusText = data?.status ? data.status.toUpperCase() : 'ACTUALIZADO';
      addToast(`Pedido ${data?.orderNumber || 'S/N'} cambió a: ${statusText}`, 'info');
    });

    on('driver_location_update', (data) => {
      // Opcional: Notificar inicio de ruta
    });
  }, [on, addToast]);

  // Estilo dinámico basado en branding de la empresa
  const primaryColor = user.company?.branding?.primaryColor || '#3b82f6';

  return (
    <div className="min-h-screen bg-secondary-50 flex font-sans antialiased text-secondary-900" style={{ '--primary-600': primaryColor }}>
      {/* Sidebar Desktop */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-72 bg-slate-950 transform transition-transform duration-300 lg:translate-x-0 lg:static lg:inset-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="h-full flex flex-col p-6">
          <div className="flex items-center gap-3 px-2 mb-10">
            <div className="w-12 h-12 bg-primary-600 rounded-2xl flex items-center justify-center text-white shadow-2xl shadow-primary-500/20 ring-1 ring-white/10 overflow-hidden">
              {user.company?.logoUrl ? (
                <img src={user.company.logoUrl} alt="Logo" className="w-full h-full object-cover" />
              ) : (
                <Truck size={28} />
              )}
            </div>
            <div>
              <h1 className="text-xl font-black text-white tracking-tighter truncate max-w-[160px]">
                {user.company?.name || 'Tracky Admin'}
              </h1>
              <p className="text-[9px] uppercase tracking-[0.2em] text-primary-500 font-black leading-none mt-1">ORGANIZACIÓN VERIFICADA</p>
            </div>
          </div>

          <div className="flex-1 space-y-1.5 overflow-y-auto pr-2 custom-scrollbar">
            <p className="px-4 text-[10px] uppercase tracking-widest text-slate-600 font-black mb-4">Operaciones</p>
            {menuItems.map((item) => (
              <SidebarItem
                key={item.path}
                {...item}
                active={location.pathname === item.path}
                onClick={() => setIsSidebarOpen(false)}
              />
            ))}
          </div>

          <div className="mt-auto pt-6 space-y-4">
            <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
              <div className="flex items-center gap-3 mb-2">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Plan Actual</p>
                <span className="text-[8px] bg-primary-500/20 text-primary-400 px-2 py-0.5 rounded-full font-black uppercase tracking-tighter">
                  {user.company?.settings?.plan || 'Enterprise'}
                </span>
              </div>
              <p className="text-xs font-bold text-white mb-2">Cuota de Conductores</p>
              <div className="w-full bg-white/10 h-1 rounded-full overflow-hidden">
                <div className="bg-primary-500 h-full w-[40%] rounded-full shadow-[0_0_10px_rgba(59,130,246,0.5)]"></div>
              </div>
            </div>

            <button
              onClick={onLogout}
              className="flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-400/10 rounded-xl w-full transition-all group"
            >
              <LogOut size={20} className="group-hover:translate-x-[-2px] transition-transform" />
              <span className="font-bold text-sm">Cerrar Sesión Segura</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Navbar toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} user={user} />
        <main className="flex-1 overflow-y-auto p-6 md:p-8 lg:p-10 scroll-smooth">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>

      {/* Overlay for mobile sidebar */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-secondary-950/40 backdrop-blur-md lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default Layout;
