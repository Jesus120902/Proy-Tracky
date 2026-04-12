import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Trash2, 
  ExternalLink, 
  Users, 
  Package, 
  TrendingUp, 
  ShieldCheck, 
  Globe,
  Settings,
  MoreVertical,
  ChevronRight,
  Loader2
} from 'lucide-react';
import { companiesApi } from '../services/api';
import { useToast } from '../components/Toast';
import ConfirmModal from '../components/ConfirmModal';

const CompanyCard = ({ company, onDelete }) => (
  <div className="bg-white rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/40 p-6 group hover:translate-y-[-4px] transition-all duration-300">
    <div className="flex justify-between items-start mb-6">
      <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center border border-slate-100 overflow-hidden shadow-inner group-hover:scale-105 transition-transform">
        {company.logoUrl ? (
          <img src={company.logoUrl} alt={company.name} className="w-full h-full object-cover" />
        ) : (
          <Globe className="text-slate-300" size={28} />
        )}
      </div>
      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <button className="p-2 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all">
          <Settings size={18} />
        </button>
        <button 
          onClick={() => onDelete(company)}
          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
        >
          <Trash2 size={18} />
        </button>
      </div>
    </div>

    <div>
      <h3 className="text-xl font-black text-slate-900 tracking-tight mb-1">{company.name}</h3>
      <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mb-4 flex items-center gap-1">
        <Globe size={12} className="text-primary-500" /> {company.slug}.tracky.app
      </p>
    </div>

    <div className="flex gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100 mb-6">
      <div className="flex-1">
        <p className="text-[10px] uppercase font-black text-slate-400 tracking-tighter mb-1">Órdenes</p>
        <div className="flex items-center gap-2">
           <Package size={14} className="text-primary-600" />
           <span className="font-black text-slate-800">{company.orderCount || 0}</span>
        </div>
      </div>
      <div className="w-px bg-slate-200 h-8 self-center"></div>
      <div className="flex-1">
        <p className="text-[10px] uppercase font-black text-slate-400 tracking-tighter mb-1">Flota</p>
        <div className="flex items-center gap-2">
           <Users size={14} className="text-primary-600" />
           <span className="font-black text-slate-800">{company.driverCount || 0}</span>
        </div>
      </div>
    </div>

    <div className="flex items-center justify-between pt-2 border-t border-slate-50">
      <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
        company.settings?.plan === 'premium' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-500'
      }`}>
        Plan {company.settings?.plan || 'Free'}
      </span>
      <button className="flex items-center gap-1 text-[10px] font-black uppercase text-primary-600 hover:gap-2 transition-all">
        Ver Panel <ChevronRight size={14} />
      </button>
    </div>
  </div>
);

const Companies = () => {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const { addToast } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    logoUrl: '',
    plan: 'free',
    primaryColor: '#3b82f6'
  });

  const fetchData = async () => {
    try {
      const { data } = await companiesApi.getAll();
      setCompanies(data);
    } catch (err) {
      addToast(err.friendlyMessage, 'error');
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
      await companiesApi.create(formData);
      addToast('Organización creada con éxito', 'success');
      setIsModalOpen(false);
      fetchData();
      setFormData({ name: '', slug: '', logoUrl: '', plan: 'free', primaryColor: '#3b82f6' });
    } catch (err) {
      addToast(err.friendlyMessage, 'error');
    }
  };

  const handleDelete = async () => {
    try {
      await companiesApi.delete(selectedCompany._id);
      addToast('Empresa eliminada permanentemente', 'success');
      fetchData();
    } catch (err) {
      addToast(err.friendlyMessage, 'error');
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
           <div className="flex items-center gap-2 mb-2">
              <ShieldCheck className="text-primary-600" size={24} />
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Master Control Panel</span>
           </div>
           <h1 className="text-4xl font-black text-slate-900 tracking-tight">Gestión de Organizaciones</h1>
           <p className="text-slate-500 mt-1 font-medium italic">Control centralizado del ecosistema SaaS Tracky.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-primary-600 hover:bg-primary-700 text-white font-black px-8 py-4 rounded-3xl shadow-2xl shadow-primary-500/30 flex items-center gap-2 transition-all hover:translate-y-[-2px] active:translate-y-0"
        >
          <Plus size={24} /> Registrar Nueva Empresa
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-40 space-y-4">
           <Loader2 className="animate-spin text-primary-600" size={40} />
           <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Accediendo al registro maestro...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {companies.map(company => (
            <CompanyCard 
              key={company._id} 
              company={company} 
              onDelete={(comp) => {
                setSelectedCompany(comp);
                setIsConfirmOpen(true);
              }}
            />
          ))}
        </div>
      )}

      {/* Modal de Creación */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-md" onClick={() => setIsModalOpen(false)}></div>
          <div className="bg-white rounded-[3rem] w-full max-w-xl p-10 relative overflow-hidden shadow-2xl animate-in zoom-in-95">
            <h2 className="text-3xl font-black mb-2 tracking-tight">Expandir Ecosistema</h2>
            <p className="text-slate-400 mb-8 font-medium">Configura los parámetros básicos de la nueva organización.</p>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Nombre Comercial</label>
                  <input 
                    required
                    className="w-full bg-slate-50 border-2 border-transparent focus:border-primary-500 focus:bg-white rounded-2xl py-3 px-5 outline-none transition-all font-bold"
                    placeholder="Logística Global S.A."
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Slug Único (URL)</label>
                  <input 
                    required
                    className="w-full bg-slate-50 border-2 border-transparent focus:border-primary-500 focus:bg-white rounded-2xl py-3 px-5 outline-none transition-all font-bold italic"
                    placeholder="logistica-global"
                    value={formData.slug}
                    onChange={e => setFormData({...formData, slug: e.target.value.toLowerCase().replace(/\s+/g, '-')})}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">URL del Logotipo (PNG/SVG)</label>
                <input 
                  className="w-full bg-slate-50 border-2 border-transparent focus:border-primary-500 focus:bg-white rounded-2xl py-3 px-5 outline-none transition-all font-bold"
                  placeholder="https://ejemplo.com/logo.png"
                  value={formData.logoUrl}
                  onChange={e => setFormData({...formData, logoUrl: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Plan SaaS</label>
                    <select 
                      className="w-full bg-slate-50 border-2 border-transparent focus:border-primary-500 focus:bg-white rounded-2xl py-3 px-5 outline-none transition-all font-bold appearance-none"
                      value={formData.plan}
                      onChange={e => setFormData({...formData, plan: e.target.value})}
                    >
                       <option value="free">Free Starter</option>
                       <option value="premium">Premium Business</option>
                       <option value="enterprise">Enterprise VIP</option>
                    </select>
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Color de Marca</label>
                    <div className="flex gap-4 items-center">
                       <input 
                        type="color"
                        className="w-12 h-12 bg-transparent border-none cursor-pointer"
                        value={formData.primaryColor}
                        onChange={e => setFormData({...formData, primaryColor: e.target.value})}
                      />
                      <span className="font-mono text-xs font-bold text-slate-400">{formData.primaryColor}</span>
                    </div>
                 </div>
              </div>

              <div className="flex gap-4 pt-6">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold py-4 rounded-2xl transition-all"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  className="flex-[2] bg-primary-600 hover:bg-primary-700 text-white font-black py-4 rounded-2xl shadow-xl shadow-primary-500/20 transition-all uppercase tracking-widest text-sm"
                >
                  Confirmar Registro
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmación de Eliminación */}
      <ConfirmModal 
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleDelete}
        title="¿Eliminar Organización?"
        message={`Esta acción es IRREVERSIBLE. Se borrarán todas las órdenes, conductores y configuraciones vinculadas a ${selectedCompany?.name}. La empresa perderá acceso inmediato.`}
        confirmText="Eliminar Permanentemente"
        variant="danger"
      />
    </div>
  );
};

export default Companies;
