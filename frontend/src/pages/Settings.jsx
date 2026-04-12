import React, { useState, useEffect } from 'react';
import { 
  Settings as SettingsIcon, 
  Palette, 
  Globe, 
  UploadCloud, 
  Save, 
  RefreshCcw,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Building2,
  Mail,
  ShieldCheck
} from 'lucide-react';
import { companiesApi } from '../services/api';
import { useToast } from '../components/Toast';

const Settings = ({ user }) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [company, setCompany] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    logoUrl: '',
    primaryColor: '#3b82f6'
  });
  const { addToast } = useToast();

  useEffect(() => {
    const fetchCompany = async () => {
      try {
        const { data } = await companiesApi.getMyCompany();
        setCompany(data);
        setFormData({
          name: data.name,
          logoUrl: data.logoUrl || '',
          primaryColor: data.branding?.primaryColor || '#3b82f6'
        });
      } catch (err) {
        addToast("Error al cargar configuración", 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchCompany();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await companiesApi.updateMyCompany({
        name: formData.name,
        logoUrl: formData.logoUrl,
        branding: { primaryColor: formData.primaryColor }
      });
      setCompany(data);
      addToast("Configuración de marca actualizada", 'success');
      // Forzar actualización de color en el DOM (variables CSS)
      document.documentElement.style.setProperty('--primary-600', formData.primaryColor);
      
      // Nota: Para que el Sidebar se actualice totalmente, lo ideal es recargar la sesión 
      // o usar un Context global. Por ahora, el usuario verá el cambio al refrescar.
    } catch (err) {
      addToast(err.friendlyMessage, 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-40 space-y-4">
         <Loader2 className="animate-spin text-primary-600" size={40} />
         <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Cargando identidad corporativa...</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-10 animate-in fade-in duration-700 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
           <div className="flex items-center gap-2 mb-2">
              <Palette className="text-primary-600" size={24} />
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Branding & Identity</span>
           </div>
           <h1 className="text-4xl font-black text-slate-900 tracking-tight">Ajustes de la Organización</h1>
           <p className="text-slate-500 mt-1 font-medium italic">Personaliza la experiencia visual de tus clientes y equipo.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Formulario */}
        <div className="lg:col-span-2 space-y-8">
           <form onSubmit={handleSubmit} className="bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-sm space-y-8">
              <div className="space-y-6">
                 <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Nombre de la Empresa</label>
                    <div className="relative">
                       <Building2 className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                       <input 
                        className="w-full bg-slate-50 border-2 border-transparent focus:border-primary-500 focus:bg-white rounded-2xl py-4 pl-14 pr-6 outline-none transition-all font-bold"
                        value={formData.name}
                        onChange={e => setFormData({...formData, name: e.target.value})}
                      />
                    </div>
                 </div>

                 <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">URL del Logotipo</label>
                    <div className="relative">
                       <UploadCloud className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                       <input 
                        className="w-full bg-slate-50 border-2 border-transparent focus:border-primary-500 focus:bg-white rounded-2xl py-4 pl-14 pr-6 outline-none transition-all font-bold"
                        placeholder="https://ejemplo.com/logo.png"
                        value={formData.logoUrl}
                        onChange={e => setFormData({...formData, logoUrl: e.target.value})}
                      />
                    </div>
                    <p className="text-[10px] text-slate-400 font-medium ml-1">Se recomienda formato SVG o PNG con fondo transparente.</p>
                 </div>

                 <div className="pt-4 flex items-center justify-between border-t border-slate-50">
                    <div className="space-y-1">
                       <h4 className="font-black text-slate-900 leading-tight">Color Primario de la Marca</h4>
                       <p className="text-xs text-slate-400 font-medium">Define el tono predominante en la interfaz.</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <div 
                          className="w-12 h-12 rounded-2xl shadow-xl transition-all"
                          style={{ backgroundColor: formData.primaryColor }}
                        ></div>
                        <input 
                          type="color"
                          className="w-14 h-14 bg-transparent border-none cursor-pointer"
                          value={formData.primaryColor}
                          onChange={e => setFormData({...formData, primaryColor: e.target.value})}
                        />
                    </div>
                 </div>
              </div>

              <div className="pt-6">
                 <button 
                  type="submit"
                  disabled={saving}
                  className="w-full bg-primary-600 hover:bg-primary-700 disabled:bg-slate-300 text-white font-black py-4 rounded-2xl shadow-xl shadow-primary-500/20 transition-all flex items-center justify-center gap-2 uppercase tracking-widest text-sm"
                 >
                   {saving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                   {saving ? "Guardando Cambios..." : "Guardar Configuración"}
                 </button>
              </div>
           </form>

           {/* Info Plan */}
           <div className="bg-slate-950 rounded-[2.5rem] p-10 text-white flex items-center justify-between overflow-hidden relative">
              <div className="absolute right-0 bottom-0 opacity-10 -mr-10 -mb-10">
                 <ShieldCheck size={200} />
              </div>
              <div className="relative z-10">
                 <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary-400 mb-2">SaaS Plan Status</p>
                 <h3 className="text-2xl font-black mb-4 tracking-tight">Plan {company?.settings?.plan || 'Starter'}</h3>
                 <p className="text-slate-400 font-medium text-sm max-w-sm">Tu empresa tiene activo el plan de crecimiento. Disfrutas de analíticas avanzadas y rastreo en tiempo real ilimitado.</p>
              </div>
              <div className="relative z-10">
                 <button className="bg-white/10 hover:bg-white/20 border border-white/10 text-white font-black px-6 py-3 rounded-2xl transition-all text-xs uppercase tracking-widest">
                    Gestionar Suscripción
                 </button>
              </div>
           </div>
        </div>

        {/* Live Preview */}
        <div className="space-y-6">
           <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-4">Empresa (Vista Cliente)</h3>
           <div className="bg-white rounded-[3rem] border-4 border-slate-100 shadow-2xl overflow-hidden pointer-events-none sticky top-10">
              <div className="p-1 border-b border-slate-50 flex items-center justify-center gap-2">
                 <div className="w-2 h-2 rounded-full bg-red-400"></div>
                 <div className="w-2 h-2 rounded-full bg-amber-400"></div>
                 <div className="w-2 h-2 rounded-full bg-green-400"></div>
                 <span className="text-[9px] font-bold text-slate-300 ml-2">tracky.app/{company?.slug}</span>
              </div>
              <div className="p-8 space-y-6">
                 {/* Logo Preview */}
                 <div className="flex justify-center mb-8">
                    <div className="w-16 h-16 rounded-2xl bg-white border border-slate-100 shadow-inner flex items-center justify-center overflow-hidden">
                       {formData.logoUrl ? (
                         <img src={formData.logoUrl} className="w-full h-full object-cover" />
                       ) : (
                         <Building2 className="text-slate-200" size={30} />
                       )}
                    </div>
                 </div>
                 
                 <div className="space-y-2">
                    <div className="h-4 bg-slate-100 rounded-full w-2/3"></div>
                    <div className="h-8 bg-slate-200 rounded-2xl w-full"></div>
                 </div>

                 <div className="py-4 space-y-4">
                    <div 
                      className="h-12 rounded-2xl shadow-lg flex items-center justify-center transition-all"
                      style={{ backgroundColor: formData.primaryColor }}
                    >
                       <div className="h-2 w-20 bg-white/30 rounded-full"></div>
                    </div>
                    <div className="flex gap-2">
                       <div className="h-10 rounded-xl bg-slate-100 w-1/2"></div>
                       <div className="h-10 rounded-xl bg-slate-100 w-1/2"></div>
                    </div>
                 </div>

                 <div className="pt-4 border-t border-slate-50">
                    <div className="flex gap-4">
                       <div 
                        className="w-8 h-8 rounded-lg opacity-20"
                        style={{ backgroundColor: formData.primaryColor }}
                       ></div>
                       <div className="space-y-1 flex-1">
                          <div className="h-2 bg-slate-100 rounded-full w-full"></div>
                          <div className="h-2 bg-slate-50 rounded-full w-2/3"></div>
                       </div>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
