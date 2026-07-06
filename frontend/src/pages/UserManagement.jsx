import React, { useState, useEffect } from 'react';
import { 
  Users, 
  UserPlus, 
  Trash2, 
  Shield, 
  Mail, 
  Key, 
  Building2,
  Loader2,
  Search,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import { usersApi, companiesApi } from '../services/api';
import { useToast } from '../components/Toast';
import ConfirmModal from '../components/ConfirmModal';

const UserManagement = ({ user: currentUser }) => {
  const [users, setUsers] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const { addToast } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'driver',
    companyId: currentUser.company?.id || currentUser.company?._id || ''
  });

  const fetchData = async () => {
    try {
      const companyId = currentUser.company?.id || currentUser.company?._id || currentUser.company;
      const data = await usersApi.getAll(companyId);
      setUsers(data || []);
      
      // Si es superadmin, cargar lista de empresas para el select
      if (currentUser.role === 'superadmin') {
        const compRes = await companiesApi.getAll();
        setCompanies(compRes.data);
      }
    } catch (err) {
      addToast('Error al cargar datos', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await usersApi.create(formData);
      addToast('Usuario creado con éxito', 'success');
      setIsModalOpen(false);
      fetchData();
      setFormData({ 
        name: '', email: '', password: '', 
        role: 'driver', 
        companyId: currentUser.company?.id || currentUser.company?._id || '' 
      });
    } catch (err) {
      addToast(err.response?.data?.message || 'Error al crear usuario', 'error');
    }
  };

  const handleDelete = async () => {
    try {
      await usersApi.delete(selectedUser.id || selectedUser._id);
      addToast('Usuario eliminado', 'success');
      fetchData();
    } catch (err) {
      addToast('Error al eliminar', 'error');
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
           <div className="flex items-center gap-2 mb-2">
              <Shield className="text-primary-600" size={24} />
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Identity & Access Control</span>
           </div>
           <h1 className="text-4xl font-black text-slate-900 tracking-tight">Gestión de Cuentas</h1>
           <p className="text-slate-500 mt-1 font-medium italic">Administra el talento humano y los permisos de acceso de <span className="text-primary-600 font-black">{currentUser.company?.name || 'la plataforma'}</span>.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-primary-600 hover:bg-primary-700 text-white font-black px-8 py-4 rounded-3xl shadow-2xl shadow-primary-500/30 flex items-center gap-2 transition-all hover:translate-y-[-2px]"
        >
          <UserPlus size={24} /> Nuevo Usuario
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-40">
           <Loader2 className="animate-spin text-primary-600" size={40} />
        </div>
      ) : (
        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/40 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Identidad</th>
                  <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Rol</th>
                  <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Empresa</th>
                  <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Estado</th>
                  <th className="px-8 py-6"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {users.map(u => (
                  <tr key={u.id || u._id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-8 py-6">
                       <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-primary-600 font-black">
                            {u.name.charAt(0)}
                          </div>
                          <div>
                             <p className="font-black text-slate-900">{u.name}</p>
                             <p className="text-xs text-slate-400">{u.email}</p>
                          </div>
                       </div>
                    </td>
                    <td className="px-8 py-6">
                       <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${
                         u.role === 'admin' ? 'bg-indigo-100 text-indigo-700' :
                         u.role === 'superadmin' ? 'bg-rose-100 text-rose-700' : 
                         'bg-slate-100 text-slate-600'
                       }`}>
                         {u.role}
                       </span>
                    </td>
                    <td className="px-8 py-6">
                       <div className="flex items-center gap-2 text-slate-500 font-medium">
                          <Building2 size={14} />
                          <span className="text-sm">{u.company?.name || 'Plataforma Tracky'}</span>
                       </div>
                    </td>
                    <td className="px-8 py-6">
                       <div className="flex items-center gap-2 text-green-500 font-black text-[10px] uppercase">
                          <CheckCircle2 size={14} /> Activo
                       </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                       {(u.id || u._id) !== (currentUser.id || currentUser._id) && (
                         <button 
                           onClick={() => { setSelectedUser(u); setIsConfirmOpen(true); }}
                           className="p-3 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                         >
                           <Trash2 size={18} />
                         </button>
                       )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal Creación */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md animate-in fade-in" onClick={() => setIsModalOpen(false)}></div>
          <div className="bg-white rounded-[3rem] w-full max-w-xl p-10 relative shadow-2xl animate-in zoom-in-95 duration-300">
            <h2 className="text-3xl font-black mb-2">Añadir Talento</h2>
            <p className="text-slate-400 mb-8">Define los parámetros de acceso para el nuevo integrante.</p>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Nombre Completo</label>
                <input 
                  required
                  className="w-full bg-slate-50 border-2 border-transparent focus:border-primary-500 focus:bg-white rounded-2xl py-3.5 px-6 outline-none transition-all font-bold"
                  placeholder="Ej: John Doe"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Email Corporativo</label>
                  <input 
                    required type="email"
                    className="w-full bg-slate-50 border-2 border-transparent focus:border-primary-500 focus:bg-white rounded-2xl py-3.5 px-6 outline-none transition-all font-bold"
                    placeholder="john@empresa.com"
                    value={formData.email}
                    onChange={e => setFormData({...formData, email: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Contraseña Temporal</label>
                  <input 
                    required type="password"
                    className="w-full bg-slate-50 border-2 border-transparent focus:border-primary-500 focus:bg-white rounded-2xl py-3.5 px-6 outline-none transition-all font-bold"
                    value={formData.password}
                    onChange={e => setFormData({...formData, password: e.target.value})}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Nivel de Acceso</label>
                    <select 
                      className="w-full bg-slate-50 border-2 border-transparent focus:border-primary-500 focus:bg-white rounded-2xl py-3.5 px-6 outline-none transition-all font-bold appearance-none"
                      value={formData.role}
                      onChange={e => setFormData({...formData, role: e.target.value})}
                    >
                       <option value="driver">Repartidor (Driver)</option>
                       <option value="admin">Administrador (Empresa)</option>
                       {currentUser.role === 'superadmin' && <option value="superadmin">Super Admin (Master)</option>}
                    </select>
                 </div>
                 {currentUser.role === 'superadmin' && (
                   <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Vincular a Empresa</label>
                      <select 
                        required
                        className="w-full bg-slate-50 border-2 border-transparent focus:border-primary-500 focus:bg-white rounded-2xl py-3.5 px-6 outline-none transition-all font-bold appearance-none"
                        value={formData.companyId}
                        onChange={e => setFormData({...formData, companyId: e.target.value})}
                      >
                         <option value="">-- Seleccionar Empresa --</option>
                         <option value="plataforma">Software Central (Tracky)</option>
                         {companies.map(c => (
                           <option key={c.id || c._id} value={c.id || c._id}>{c.name}</option>
                         ))}
                      </select>
                   </div>
                 )}
              </div>

              <div className="flex gap-4 pt-6">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 bg-slate-100 text-slate-600 font-bold py-4 rounded-2xl">Cancelar</button>
                <button type="submit" className="flex-[2] bg-primary-600 text-white font-black py-4 rounded-2xl shadow-xl shadow-primary-500/20">Crear Acceso Seguro</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmModal 
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleDelete}
        title="¿Eliminar Acceso?"
        message={`Esta acción revocará de inmediato el acceso de ${selectedUser?.name} a la plataforma.`}
        variant="danger"
      />
    </div>
  );
};

export default UserManagement;
