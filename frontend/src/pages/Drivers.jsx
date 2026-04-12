import React, { useEffect, useState } from 'react';
import { driversApi } from '../services/api';
import { Plus, Search, MoreVertical, Phone, Mail, Truck, Star, X, MapPin, Check, ShieldCheck, Trash2, Edit2 } from 'lucide-react';
import { useToast } from '../components/Toast';
import ConfirmModal from '../components/ConfirmModal';

const DriverCard = ({ driver, onEdit, onDelete }) => {
  const [showMenu, setShowMenu] = useState(false);

  const statusConfig = {
    available: { color: 'text-green-600 bg-green-50 border-green-200', label: 'Disponible', dot: 'bg-green-500' },
    'on-delivery': { color: 'text-primary-600 bg-primary-50 border-primary-200', label: 'En Entrega', dot: 'bg-primary-500' },
    offline: { color: 'text-slate-400 bg-slate-50 border-slate-200', label: 'Desconectado', dot: 'bg-slate-300' },
  };

  const status = statusConfig[driver.status] || statusConfig.offline;

  return (
    <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-secondary-100 hover:shadow-xl hover:shadow-primary-500/5 transition-all group animate-in fade-in relative">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center text-primary-700 text-xl font-black border-2 border-white shadow-sm ring-1 ring-primary-100">
              {driver.name.charAt(0)}
            </div>
            <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${status.dot}`}></div>
          </div>
          <div>
            <h3 className="font-black text-secondary-900 text-lg leading-tight uppercase tracking-tight">{driver.name}</h3>
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider mt-2 border ${status.color}`}>
              {status.label}
            </span>
          </div>
        </div>
        
        <div className="relative">
          <button 
            onClick={() => setShowMenu(!showMenu)}
            className="p-2 text-secondary-300 hover:bg-secondary-50 hover:text-secondary-900 rounded-xl transition-all outline-none"
          >
            <MoreVertical size={20} />
          </button>
          
          {showMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-2xl border border-secondary-100 z-10 overflow-hidden animate-in zoom-in-95 duration-200">
               <button 
                 onClick={() => { onEdit(driver); setShowMenu(false); }}
                 className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-secondary-600 hover:bg-primary-50 hover:text-primary-600 transition-all text-left"
               >
                 <Edit2 size={16} /> Editar Perfil
               </button>
               <button 
                 onClick={() => { onDelete(driver._id); setShowMenu(false); }}
                 className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-red-600 hover:bg-red-50 transition-all text-left border-t border-secondary-50"
               >
                 <Trash2 size={16} /> Eliminar
               </button>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mt-6">
        <div className="bg-slate-50 p-3 rounded-2xl border border-transparent">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Vehículo</p>
          <div className="flex items-center gap-2 text-slate-700">
            <Truck size={14} className="text-primary-500" />
            <span className="text-xs font-bold">{driver.vehicle.plate}</span>
          </div>
        </div>
        <div className="bg-slate-50 p-3 rounded-2xl border border-transparent">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Calificación</p>
          <div className="flex items-center gap-2 text-slate-700">
            <Star size={14} className="text-yellow-400 fill-yellow-400" />
            <span className="text-xs font-bold">{driver.rating} / 5</span>
          </div>
        </div>
      </div>

      <div className="mt-4 px-1">
         <div className="flex items-center gap-2 text-slate-500 mb-1">
            <MapPin size={14} className="text-slate-400" />
            <p className="text-[10px] font-bold uppercase tracking-tight">Última Coordenada</p>
         </div>
         <p className="text-[10px] text-slate-600 font-bold pl-6 font-mono">
            LAT: {driver.location.lat.toFixed(6)} | LNG: {driver.location.lng.toFixed(6)}
         </p>
      </div>

      <div className="mt-6 flex gap-2">
        <button className="flex-1 bg-secondary-900 text-white hover:bg-black py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-xl shadow-secondary-900/10 active:scale-95">
          Enviar Mensaje
        </button>
      </div>
    </div>
  );
};

const Drivers = () => {
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { addToast } = useToast();
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDriver, setEditingDriver] = useState(null);
  const [driverToDelete, setDriverToDelete] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    vehicleType: 'Van',
    plate: '',
    status: 'available'
  });

  useEffect(() => {
    fetchDrivers();
  }, []);

  const fetchDrivers = async () => {
    try {
      setLoading(true);
      const res = await driversApi.getAll();
      setDrivers(res.data);
    } catch (error) {
      addToast(error.friendlyMessage || "Error cargando conductores", 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOrUpdateDriver = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        status: formData.status,
        vehicle: {
          type: formData.vehicleType,
          plate: formData.plate
        }
      };

      if (editingDriver) {
        const res = await driversApi.update(editingDriver._id, payload);
        setDrivers(drivers.map(d => d._id === editingDriver._id ? res.data : d));
        setEditingDriver(null);
      } else {
        const res = await driversApi.create(payload);
        setDrivers([res.data, ...drivers]);
        setIsModalOpen(false);
      }
      resetForm();
      addToast(editingDriver ? "Conductor actualizado" : "Conductor registrado con éxito", 'success');
    } catch (error) {
      addToast(error.friendlyMessage || "Error al procesar conductor", 'error');
    }
  };

  const resetForm = () => {
    setFormData({ name: '', email: '', phone: '', vehicleType: 'Van', plate: '', status: 'available' });
  };

  const handleEditClick = (driver) => {
    setEditingDriver(driver);
    setFormData({
      name: driver.name,
      email: driver.email,
      phone: driver.phone,
      vehicleType: driver.vehicle.type,
      plate: driver.vehicle.plate,
      status: driver.status
    });
  };

  const confirmDelete = async () => {
    if (!driverToDelete) return;
    try {
      await driversApi.delete(driverToDelete);
      setDrivers(drivers.filter(d => d._id !== driverToDelete));
      addToast("Conductor eliminado y órdenes liberadas", 'success');
    } catch (error) {
      addToast(error.friendlyMessage || "Error al eliminar", 'error');
    } finally {
      setDriverToDelete(null);
    }
  };

  const filteredDrivers = drivers.filter(d => 
    d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.vehicle.plate.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in slide-in-from-right-4 duration-500 relative pb-20">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-secondary-900 tracking-tight">Gestión de Flota</h1>
          <p className="text-secondary-500 mt-1 font-medium">Moniteroo de disponibilidad y control de conductores en producción.</p>
        </div>
        <button 
          onClick={() => { resetForm(); setIsModalOpen(true); }}
          className="flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-8 py-4 rounded-2xl font-black transition-all shadow-xl shadow-primary-500/20 active:scale-95"
        >
          <Plus size={20} />
          REGISTRAR CONDUCTOR
        </button>
      </div>

      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white p-6 rounded-[2.5rem] border border-secondary-50 shadow-sm shadow-indigo-500/5">
        <div className="relative w-full md:w-96 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-secondary-400 group-focus-within:text-primary-500 transition-colors" size={20} />
          <input 
            type="text" 
            placeholder="Buscar conductor, placa o vehículo..." 
            className="w-full pl-12 pr-4 py-3 bg-secondary-50 border-none rounded-2xl focus:ring-4 focus:ring-primary-500/10 outline-none transition-all shadow-inner"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex gap-2">
           <div className="flex items-center gap-3 px-6 py-3 bg-green-50 text-green-700 rounded-2xl border border-green-100 text-[10px] font-black uppercase tracking-widest shadow-sm">
             <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse"></div>
             {drivers.filter(d => d.status === 'available').length} Libres
           </div>
           <div className="flex items-center gap-3 px-6 py-3 bg-primary-50 text-primary-700 rounded-2xl border border-primary-100 text-[10px] font-black uppercase tracking-widest shadow-sm">
             <div className="w-2.5 h-2.5 bg-primary-500 rounded-full animate-pulse"></div>
             {drivers.filter(d => d.status === 'on-delivery').length} Activos
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 pb-10">
        {loading ? (
          [1,2,3,4,5,6].map(i => (
            <div key={i} className="h-80 bg-white rounded-[2rem] animate-pulse border border-secondary-100"></div>
          ))
        ) : filteredDrivers.length === 0 ? (
          <div className="col-span-full py-32 text-center bg-white rounded-[2.5rem] border border-dashed border-slate-200">
             <Truck size={48} className="mx-auto text-slate-200 mb-4" />
             <p className="font-bold text-secondary-400 tracking-tight">No hay conductores registrados con esos criterios</p>
          </div>
        ) : (
          filteredDrivers.map(driver => (
            <DriverCard key={driver._id} driver={driver} onEdit={handleEditClick} onDelete={(id) => setDriverToDelete(id)} />
          ))
        )}
      </div>

      {/* MODAL: Registrar / Editar Conductor */}
      {(isModalOpen || editingDriver) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-secondary-950/40 backdrop-blur-sm animate-in fade-in" onClick={() => { setIsModalOpen(false); setEditingDriver(null); }}></div>
          <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl relative z-10 overflow-hidden animate-in zoom-in-95">
             <div className="p-8 pb-4 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary-50 rounded-lg text-primary-600">
                    <ShieldCheck size={24} />
                  </div>
                  <h2 className="text-2xl font-black text-secondary-900 tracking-tight">{editingDriver ? 'Editar Perfil' : 'Nuevo Registro'}</h2>
                </div>
                <button onClick={() => { setIsModalOpen(false); setEditingDriver(null); }} className="p-2 hover:bg-secondary-50 rounded-xl transition-all"><X size={24} /></button>
             </div>
             
             <form onSubmit={handleCreateOrUpdateDriver} className="p-8 space-y-6">
                <div className="space-y-4">
                   <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-secondary-400 ml-1">Nombre Completo</label>
                      <input 
                        required
                        type="text" 
                        className="w-full bg-secondary-50 border-none rounded-2xl p-4 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all shadow-inner"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                      />
                   </div>

                   <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-secondary-400 ml-1">Email</label>
                        <input 
                          required
                          type="email" 
                          className="w-full bg-secondary-50 border-none rounded-2xl p-4 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all shadow-inner"
                          value={formData.email}
                          onChange={(e) => setFormData({...formData, email: e.target.value})}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-secondary-400 ml-1">Teléfono</label>
                        <input 
                          required
                          type="tel" 
                          className="w-full bg-secondary-50 border-none rounded-2xl p-4 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all shadow-inner"
                          value={formData.phone}
                          onChange={(e) => setFormData({...formData, phone: e.target.value})}
                        />
                      </div>
                   </div>

                   <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-secondary-400 ml-1">Tipo de Vehículo</label>
                        <select 
                          className="w-full bg-secondary-50 border-none rounded-2xl p-4 cursor-pointer font-bold text-secondary-700 h-[56px]"
                          value={formData.vehicleType}
                          onChange={(e) => setFormData({...formData, vehicleType: e.target.value})}
                        >
                          <option value="Van">Van</option>
                          <option value="Truck">Truck</option>
                          <option value="Motorcycle">Motorcycle</option>
                          <option value="Car">Car</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-secondary-400 ml-1">Placa / Matrícula</label>
                        <input 
                          required
                          type="text" 
                          className="w-full bg-secondary-50 border-none rounded-2xl p-4 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all shadow-inner"
                          value={formData.plate}
                          onChange={(e) => setFormData({...formData, plate: e.target.value})}
                        />
                      </div>
                   </div>

                   <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-secondary-400 ml-1">Estado de Disponibilidad</label>
                      <select 
                        className="w-full bg-secondary-50 border-none rounded-2xl p-4 cursor-pointer font-bold text-secondary-900 h-[56px]"
                        value={formData.status}
                        onChange={(e) => setFormData({...formData, status: e.target.value})}
                      >
                        <option value="available">Disponible</option>
                        <option value="on-delivery">En Ruta / Ocupado</option>
                        <option value="offline">Fuera de Servicio</option>
                      </select>
                   </div>
                </div>

                <div className="pt-4 flex gap-4">
                   <button 
                     type="submit" 
                     className="flex-1 bg-secondary-950 hover:bg-black text-white font-black py-4 rounded-2xl shadow-xl shadow-secondary-950/10 transition-all uppercase tracking-widest"
                   >
                     {editingDriver ? 'GUARDAR ACTUALIZACIÓN' : 'REGISTRAR FLOTA'}
                   </button>
                </div>
             </form>
          </div>
        </div>
      )}

      {/* Confirmación Premium */}
      <ConfirmModal 
        isOpen={!!driverToDelete}
        onClose={() => setDriverToDelete(null)}
        onConfirm={confirmDelete}
        title="¿Baja de Conductor?"
        message="Esta acción desactivará al conductor y reasignará sus pedidos pendientes automáticamente."
        confirmText="DAR DE BAJA"
      />
    </div>
  );
};

export default Drivers;
