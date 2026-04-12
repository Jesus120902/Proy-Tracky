import React, { useState } from 'react';
import { Truck, Lock, User, ArrowRight, Loader2 } from 'lucide-react';
import { authApi } from '../services/api';
import { useToast } from '../components/Toast';

const LoginPage = ({ onLogin }) => {
  const [email, setEmail] = useState('demo@empresa.com');
  const [password, setPassword] = useState('demo123');
  const [loading, setLoading] = useState(false);
  const { addToast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await authApi.login({ email, password });
      onLogin(data);
      addToast(`Bienvenido de nuevo, ${data.name}`, 'success');
    } catch (error) {
      addToast(error.friendlyMessage || "Error al iniciar sesión", 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-secondary-950 flex items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Elementos decorativos de fondo */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary-600/20 rounded-full blur-[120px] -mr-64 -mt-64"></div>
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] -ml-64 -mb-64"></div>

      <div className="w-full max-w-md animate-in zoom-in-95 duration-700 relative z-10">
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-8 rounded-[2.5rem] shadow-2xl">
          <div className="flex flex-col items-center mb-10">
            <div className="w-20 h-20 bg-primary-600 rounded-[2rem] flex items-center justify-center text-white shadow-2xl shadow-primary-500/50 mb-6 group transition-transform hover:scale-110">
              <Truck size={40} />
            </div>
            <h1 className="text-4xl font-black text-white tracking-tight">Tracky</h1>
            <p className="text-secondary-400 mt-2 font-black uppercase text-[10px] tracking-[0.3em]">Logística Inteligente SaaS</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-secondary-300 ml-1">Email Corporativo</label>
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-secondary-500 group-focus-within:text-primary-400 transition-colors" size={20} />
                <input 
                  required
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white outline-none focus:ring-4 focus:ring-primary-500/20 transition-all font-bold"
                  placeholder="admin@empresa.com"
                  disabled={loading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-secondary-300 ml-1">Contraseña</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-secondary-500 group-focus-within:text-primary-400 transition-colors" size={20} />
                <input 
                  required
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white outline-none focus:ring-4 focus:ring-primary-500/20 transition-all font-bold"
                  placeholder="••••••••"
                  disabled={loading}
                />
              </div>
            </div>

            <div className="flex items-center justify-between px-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="rounded border-white/20 bg-white/5 text-primary-600 focus:ring-0" />
                <span className="text-[10px] font-black uppercase text-secondary-400">Recordarme</span>
              </label>
              <a href="#" className="text-[10px] text-primary-400 hover:text-primary-300 font-black uppercase tracking-tighter">¿Problemas de acceso?</a>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-primary-600 hover:bg-primary-500 disabled:bg-secondary-800 disabled:cursor-not-allowed text-white font-black py-4 rounded-2xl shadow-xl shadow-primary-600/30 transition-all hover:translate-y-[-2px] active:translate-y-0 flex items-center justify-center gap-2 mt-4 uppercase tracking-widest text-sm"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  Verificando...
                </>
              ) : (
                <>
                  Iniciar Sesión Profesional
                  <ArrowRight size={20} />
                </>
              )}
            </button>
          </form>

          <p className="text-center text-secondary-500 text-[10px] font-bold uppercase tracking-widest mt-8">
            Para acceso al panel de dueño contacte a <a href="#" className="text-primary-400 font-black">Soporte Tracky</a>
          </p>
        </div>
        
        <p className="text-center text-secondary-600 text-[10px] mt-8 uppercase tracking-[0.2em] font-black">
          &copy; 2026 Tracky Technologies Inc. All Rights Reserved.
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
