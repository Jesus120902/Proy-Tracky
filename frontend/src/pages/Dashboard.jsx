import React, { useEffect, useState } from 'react';
import { Package, Truck, Clock, CheckCircle2, AlertCircle, TrendingUp, Building, DollarSign, Activity } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import KPICard from '../components/KPICard';
import api, { ordersApi, driversApi } from '../services/api';

const Dashboard = ({ user }) => {
  const [stats, setStats] = useState({
    totalOrders: 0,
    activeDrivers: 0,
    pendingDeliveries: 0,
    completedToday: 0
  });
  
  // Para Super Admin
  const [saasStats, setSaasStats] = useState({
    totalCompanies: 0,
    mrr: 0,
    activeUsers: 0,
    trials: 0
  });
  
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (user.role === 'superadmin') {
          // Obtener métricas SaaS (Simuladas por ahora si no hay endpoint específico)
          try {
            const { data } = await api.get('/stats/saas');
            setSaasStats(data);
          } catch (e) {
             // Mock en caso no haya ruta real aún
             setSaasStats({
               totalCompanies: 45,
               mrr: 12500,
               activeUsers: 342,
               trials: 12
             });
          }
        } else {
          const companyId = user.company?.id || user.company?._id || user.company;
          const [ordersRes, driversRes] = await Promise.all([
            ordersApi.getAll({ companyId }),
            driversApi.getAll(companyId)
          ]);

          const orders = ordersRes.data.orders || [];
          const drvs = driversRes.data || [];

          setStats({
            totalOrders: orders.length,
            activeDrivers: drvs.filter(d => d.status === 'on-delivery').length,
            pendingDeliveries: orders.filter(o => o.status === 'pending' || o.status === 'assigned').length,
            completedToday: orders.filter(o => o.status === 'delivered').length
          });
          setDrivers(drvs);
        }
      } catch (error) {
        console.error("Error cargando dashboard:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user.role]);

  if (user.role === 'superadmin') {
    return (
      <div className="space-y-8 animate-in fade-in duration-500">
        <div>
          <h1 className="text-3xl font-black text-secondary-900 tracking-tight">SaaS Admin Overview</h1>
          <p className="text-secondary-500 mt-1 font-medium">Control general de la plataforma Tracky.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <KPICard title="MRR (Ingreso Mensual)" value={`S/${saasStats.mrr}`} icon={DollarSign} trend="up" trendValue="15" color="green" />
          <KPICard title="Empresas Registradas" value={saasStats.totalCompanies} icon={Building} trend="up" trendValue="5" color="blue" />
          <KPICard title="Usuarios Activos" value={saasStats.activeUsers} icon={Users} trend="up" trendValue="8" color="purple" />
          <KPICard title="Pruebas Activas" value={saasStats.trials} icon={Activity} trend="down" trendValue="2" color="yellow" />
        </div>
        
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-secondary-100 min-h-[400px] flex items-center justify-center text-slate-400">
           Aquí irán las gráficas de crecimiento ARR/MRR
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-secondary-900 tracking-tight">Panel Corporativo</h1>
          <p className="text-secondary-500 mt-1 font-medium">
            Hola, <span className="text-primary-600 font-black">{user.name}</span>. Gestionando flota para <span className="text-secondary-900 font-bold">{user.company?.name}</span>.
          </p>
        </div>
        <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 bg-white px-4 py-2 rounded-xl border border-secondary-100 shadow-sm">
          ID Org: <span className="text-secondary-900 italic">#{user.company?._id?.slice(-8)}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard title="Total Órdenes" value={stats.totalOrders} icon={Package} trend="up" trendValue="12" color="blue" />
        <KPICard title="Conductores Activos" value={stats.activeDrivers} icon={Truck} trend="up" trendValue="5" color="purple" />
        <KPICard title="Pendientes" value={stats.pendingDeliveries} icon={Clock} trend="down" trendValue="8" color="yellow" />
        <KPICard title="Entregas Hoy" value={stats.completedToday} icon={CheckCircle2} trend="up" trendValue="15" color="green" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-2 rounded-2xl shadow-sm border border-secondary-100 min-h-[400px]">
          <div className="p-4 border-b border-secondary-50">
            <h3 className="font-bold text-secondary-900">Ubicación de Flota</h3>
          </div>
          <div className="h-[350px]">
             <MapContainer center={[-12.0464, -77.0428]} zoom={12} scrollWheelZoom={false}>
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                {drivers.map(driver => (
                  driver.location?.lat && driver.location?.lng ? (
                    <Marker key={driver._id} position={[driver.location.lat, driver.location.lng]}>
                      <Popup>
                        <div className="text-sm">
                          <p className="font-bold">{driver.name}</p>
                          <p className="text-secondary-500">{driver.vehicle?.plate} - {driver.status}</p>
                        </div>
                      </Popup>
                    </Marker>
                  ) : null
                ))}
              </MapContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-secondary-100">
          <h3 className="font-bold text-secondary-900 mb-6">Alertas del Sistema</h3>
          <div className="space-y-6">
            {[
              { type: 'warning', text: 'Retraso en entrega ORD-1204', time: 'Hace 5min' },
              { type: 'info', text: 'Conductor asignado a ORD-1205', time: 'Hace 12min' },
              { type: 'error', text: 'Ruta bloqueada en Av. Central', time: 'Hace 20min' },
              { type: 'success', text: 'Nueva orden creada #1206', time: 'Hace 45min' },
            ].map((alert, i) => (
              <div key={i} className="flex gap-4">
                <div className={`mt-1 h-2 w-2 rounded-full flex-shrink-0 ${
                  alert.type === 'error' ? 'bg-red-500' : 
                  alert.type === 'warning' ? 'bg-yellow-500' : 
                  alert.type === 'success' ? 'bg-green-500' : 'bg-blue-500'
                }`} />
                <div>
                  <p className="text-sm font-medium text-secondary-800">{alert.text}</p>
                  <p className="text-xs text-secondary-400 mt-1">{alert.time}</p>
                </div>
              </div>
            ))}
          </div>
          <button className="w-full mt-8 py-2 text-sm font-semibold text-primary-600 hover:bg-primary-50 rounded-lg transition-colors">
            Ver todas las notificaciones
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
