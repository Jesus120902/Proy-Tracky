import React, { useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  LineChart, Line, PieChart, Pie, Cell, AreaChart, Area 
} from 'recharts';
import { 
  TrendingUp, 
  Users, 
  Package, 
  CheckCircle2, 
  Activity, 
  Calendar, 
  Clock,
  Download,
  Filter,
  ArrowUpRight,
  ArrowDownRight,
  Loader2
} from 'lucide-react';
import { statsApi } from '../services/api';
import { useToast } from '../components/Toast';

const RADIAN = Math.PI / 180;
const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

const StatCard = ({ title, value, change, icon: Icon, colorClass }) => (
  <div className="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-xl shadow-slate-200/40 relative overflow-hidden group">
    <div className={`absolute top-0 right-0 w-24 h-24 ${colorClass} opacity-[0.03] rounded-bl-full -mr-8 -mt-8 group-hover:scale-110 transition-transform`}></div>
    <div className="flex items-center justify-between mb-4">
      <div className={`p-3 rounded-2xl ${colorClass.replace('bg-', 'bg-opacity-10 ')} ${colorClass.replace('bg-', 'text-')}`}>
        <Icon size={24} />
      </div>
      {change && (
        <div className={`flex items-center gap-1 text-xs font-black ${change > 0 ? 'text-green-600' : 'text-red-500'}`}>
          {change > 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
          {Math.abs(change)}%
        </div>
      )}
    </div>
    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{title}</p>
    <h3 className="text-3xl font-black text-slate-900 tracking-tight">{value}</h3>
  </div>
);

const Reports = ({ user }) => {
  const [summary, setSummary] = useState(null);
  const [trends, setTrends] = useState([]);
  const [distribution, setDistribution] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [sumRes, trendRes, distRes] = await Promise.all([
          statsApi.getSummary(),
          statsApi.getTrends(),
          statsApi.getDistribution()
        ]);
        setSummary(sumRes.data);
        setTrends(trendRes.data);
        setDistribution(distRes.data);
      } catch (err) {
        addToast("Error al cargar analíticas", 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-40 space-y-4">
         <Loader2 className="animate-spin text-primary-600" size={40} />
         <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Procesando métricas de rendimiento...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
           <h1 className="text-4xl font-black text-slate-900 tracking-tight">Análisis Operativo</h1>
           <p className="text-slate-500 mt-1 font-medium italic">Resultados estratégicos para <span className="text-primary-600 font-black">{user.company?.name || 'la organización'}</span>.</p>
        </div>
        <div className="flex gap-3">
          <button className="bg-white border border-slate-200 text-slate-600 font-black px-6 py-3 rounded-2xl shadow-sm flex items-center gap-2 hover:bg-slate-50 transition-all text-sm uppercase tracking-widest">
            <Calendar size={18} /> Últimos 7 Días
          </button>
          <button className="bg-secondary-900 text-white font-black px-6 py-3 rounded-2xl shadow-xl shadow-secondary-900/20 flex items-center gap-2 hover:bg-black transition-all text-sm uppercase tracking-widest">
            <Download size={18} /> Exportar PDF
          </button>
        </div>
      </div>

      {/* KPI Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Órdenes Totales" value={summary?.totalOrders} change={+12} icon={Package} colorClass="bg-primary-600" />
        <StatCard title="Éxito de Entrega" value={`${summary?.successRate}%`} change={+4.2} icon={CheckCircle2} colorClass="bg-green-500" />
        <StatCard title="Conductores en Ruta" value={summary?.activeDrivers} icon={Activity} colorClass="bg-blue-500" />
        <StatCard title="En Espera" value={summary?.pendingOrders} change={-2} icon={Clock} colorClass="bg-amber-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Gráfica de Tendencia (Lineal) */}
        <div className="lg:col-span-2 bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between mb-8">
             <div>
                <h3 className="text-xl font-black text-slate-900 tracking-tight">Tendencia de Entregas</h3>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Volumen histórico por día</p>
             </div>
             <TrendingUp className="text-primary-200" size={32} />
          </div>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trends}>
                <defs>
                  <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 900}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 900}} />
                <Tooltip 
                  contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', padding: '1rem' }}
                  itemStyle={{ fontWeight: 900, textTransform: 'uppercase', fontSize: '10px' }}
                />
                <Area type="monotone" dataKey="ordenes" stroke="#3b82f6" strokeWidth={4} fillOpacity={1} fill="url(#colorOrders)" />
                <Area type="monotone" dataKey="entregadas" stroke="#10b981" strokeWidth={4} fillOpacity={0} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Gráfica de Distribución (Pie) */}
        <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm flex flex-col">
           <div className="mb-8">
              <h3 className="text-xl font-black text-slate-900 tracking-tight">Distribución de Estados</h3>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Composición actual de carga</p>
           </div>
           <div className="h-[300px] w-full flex-1">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={distribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={8}
                    dataKey="value"
                  >
                    {distribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} cornerRadius={10} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                    itemStyle={{ fontWeight: 900, textTransform: 'uppercase', fontSize: '10px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
           </div>
           <div className="mt-6 flex flex-wrap gap-4 justify-center">
              {distribution.map((entry, index) => (
                <div key={entry.name} className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">{entry.name}</span>
                </div>
              ))}
           </div>
        </div>
      </div>

      {/* Driver Efficiency Table Preview */}
      <div className="bg-secondary-900 rounded-[2.5rem] p-10 text-white overflow-hidden relative">
         <div className="absolute top-0 right-0 p-12 opacity-10 rotate-12">
            <Users size={200} />
         </div>
         <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="max-w-md">
               <h3 className="text-3xl font-black mb-4 tracking-tight leading-tight">Optimización Automática de Rutas</h3>
               <p className="text-slate-400 font-medium mb-6">Hemos detectado que tu tasa de éxito ha subido un <span className="text-green-400 font-black">4.2%</span> este mes. Recomendamos asignar más pedidos a la zona Norte.</p>
               <button className="bg-white text-secondary-900 font-black px-8 py-3 rounded-2xl hover:scale-105 transition-transform uppercase tracking-widest text-xs">
                  Ver Detalles de Flota
               </button>
            </div>
            <div className="bg-white/10 p-8 rounded-[2rem] border border-white/10 backdrop-blur-md">
               <div className="space-y-4">
                  <div className="flex items-center justify-between gap-12">
                     <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Puntualidad Global</span>
                     <span className="font-black text-xl">98.4%</span>
                  </div>
                  <div className="w-48 h-1 bg-white/20 rounded-full overflow-hidden">
                     <div className="bg-green-400 h-full w-[98%]"></div>
                  </div>
                  <div className="flex items-center justify-between gap-12">
                     <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Ahorro Estimado</span>
                     <span className="font-black text-xl">$1,450.00</span>
                  </div>
                  <div className="w-48 h-1 bg-white/20 rounded-full overflow-hidden">
                     <div className="bg-blue-400 h-full w-[72%]"></div>
                  </div>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
};

export default Reports;
