import React, { useState, useEffect } from 'react';
import { useToast } from '../components/Toast';
import api from '../services/api';
import { CreditCard, Calendar, CheckCircle2, AlertTriangle, Zap, ShieldCheck } from 'lucide-react';

const ClientPortal = ({ user }) => {
  const [planData, setPlanData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();

  useEffect(() => {
    fetchPlan();
  }, []);

  const fetchPlan = async () => {
    try {
      const { data } = await api.get('/billing/plan');
      setPlanData(data);
    } catch (error) {
      addToast('Error al cargar información del plan', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = async (planType) => {
    try {
      const { data } = await api.post('/billing/create-preference', { plan: planType });
      // Redirigir a Mercado Pago
      if (data.init_point) {
        window.location.href = data.init_point;
      }
    } catch (error) {
      addToast(error.response?.data?.message || 'Error al iniciar pago', 'error');
    }
  };

  if (loading) return <div className="p-8 text-center">Cargando portal...</div>;

  const isTrial = planData?.status === 'trialing';
  const daysLeft = planData?.endDate 
    ? Math.ceil((new Date(planData.endDate) - new Date()) / (1000 * 60 * 60 * 24))
    : 0;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Portal del Cliente</h1>
          <p className="text-slate-500">Administra tu suscripción y facturación.</p>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        
        {/* Resumen del Plan */}
        <div className="md:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-1">Plan Actual</p>
              <h2 className="text-3xl font-bold capitalize flex items-center gap-3">
                {planData?.plan || 'Free'}
                {isTrial && (
                  <span className="text-xs font-semibold bg-amber-100 text-amber-700 px-2 py-1 rounded-full uppercase tracking-wider">
                    Trial
                  </span>
                )}
                {planData?.status === 'active' && (
                  <span className="text-xs font-semibold bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full uppercase tracking-wider">
                    Activo
                  </span>
                )}
              </h2>
            </div>
            
            {planData?.plan !== 'business' && (
              <button 
                onClick={() => handleUpgrade('business')}
                className="hidden sm:flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-slate-800"
              >
                <Zap className="w-4 h-4 text-amber-400" />
                Upgrade a Business
              </button>
            )}
          </div>
          
          <div className="p-6 bg-slate-50 grid sm:grid-cols-2 gap-4">
            <div className="flex items-center gap-3 bg-white p-4 rounded-xl border border-slate-100">
              <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Renovación / Fin</p>
                <p className="font-semibold">{planData?.endDate ? new Date(planData.endDate).toLocaleDateString() : 'N/A'}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 bg-white p-4 rounded-xl border border-slate-100">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${daysLeft < 7 ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'}`}>
                {daysLeft < 7 ? <AlertTriangle className="w-5 h-5" /> : <ShieldCheck className="w-5 h-5" />}
              </div>
              <div>
                <p className="text-sm text-slate-500">Días restantes</p>
                <p className={`font-semibold ${daysLeft < 7 ? 'text-red-600' : ''}`}>
                  {daysLeft} días {isTrial ? 'de prueba' : ''}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Método de Pago */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-slate-400" />
            Método de Pago
          </h3>
          {planData?.status === 'active' ? (
            <div className="text-center py-6">
              <p className="text-slate-600 mb-2">Suscripción gestionada vía Mercado Pago</p>
              <button className="text-blue-600 font-medium hover:underline">
                Gestionar en Mercado Pago
              </button>
            </div>
          ) : (
            <div className="text-center py-6">
              <p className="text-slate-500 text-sm mb-4">No tienes un método de pago activo. Suscríbete para continuar usando Tracky sin interrupciones.</p>
            </div>
          )}
        </div>
      </div>

      {/* Pricing Options si es trial o free */}
      {(isTrial || planData?.plan === 'free') && (
        <div className="mt-8">
          <h2 className="text-xl font-bold mb-4">Elige tu plan</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-2xl border-2 border-slate-200 hover:border-blue-500 transition-colors">
              <h3 className="text-xl font-bold mb-2">Pro</h3>
              <p className="text-3xl font-black mb-4">S/79 <span className="text-sm font-normal text-slate-500">/mes</span></p>
              <ul className="space-y-2 mb-6">
                <li className="flex gap-2"><CheckCircle2 className="w-5 h-5 text-emerald-500" /> Pedidos ilimitados</li>
                <li className="flex gap-2"><CheckCircle2 className="w-5 h-5 text-emerald-500" /> Conductores ilimitados</li>
                <li className="flex gap-2"><CheckCircle2 className="w-5 h-5 text-emerald-500" /> Soporte prioritario</li>
              </ul>
              <button 
                onClick={() => handleUpgrade('pro')}
                className="w-full py-3 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700"
              >
                Elegir Plan Pro
              </button>
            </div>

            <div className="bg-slate-900 text-white p-6 rounded-2xl border-2 border-slate-800 relative">
              <div className="absolute top-0 right-0 bg-blue-500 text-xs font-bold px-3 py-1 rounded-bl-xl rounded-tr-xl">RECOMENDADO</div>
              <h3 className="text-xl font-bold mb-2">Business</h3>
              <p className="text-3xl font-black mb-4">S/149 <span className="text-sm font-normal text-slate-400">/mes</span></p>
              <ul className="space-y-2 mb-6 text-slate-300">
                <li className="flex gap-2"><CheckCircle2 className="w-5 h-5 text-blue-400" /> Todo lo de Pro</li>
                <li className="flex gap-2"><CheckCircle2 className="w-5 h-5 text-blue-400" /> Multi sucursal y API</li>
                <li className="flex gap-2"><CheckCircle2 className="w-5 h-5 text-blue-400" /> Soporte 24/7</li>
              </ul>
              <button 
                onClick={() => handleUpgrade('business')}
                className="w-full py-3 rounded-xl bg-white text-slate-900 font-medium hover:bg-slate-100"
              >
                Elegir Plan Business
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default ClientPortal;
