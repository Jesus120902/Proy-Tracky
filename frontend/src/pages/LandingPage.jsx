import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ArrowRight, CheckCircle2, Navigation, Package, ShieldCheck, 
  Smartphone, Users, FileSignature, MapPin, BarChart3,
  ChevronDown, MessageCircle, PlayCircle, Menu, X, Rocket
} from 'lucide-react';

const LandingPage = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#020617] text-white selection:bg-primary-500/30 font-sans overflow-x-hidden">
      
      {/* ── HEADER ──────────────────────────────────────────────────────── */}
      <header className="fixed top-0 inset-x-0 z-50 bg-[#020617]/80 backdrop-blur-md border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-28 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="Tracky Logo" className="h-20 md:h-28 w-auto object-contain" />
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            <a href="#problema" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">Solución</a>
            <a href="#features" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">Características</a>
            <a href="#precios" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">Precios</a>
            <a href="#faq" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">FAQ</a>
          </nav>

          <div className="hidden md:flex items-center gap-4">
            <Link to="/login" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">Iniciar sesión</Link>
            <Link 
              to="/register" 
              className="text-sm font-medium bg-white text-slate-900 px-4 py-2 rounded-full hover:bg-slate-100 transition-colors"
            >
              Comenzar Gratis
            </Link>
          </div>

          {/* Mobile Toggle */}
          <button className="md:hidden p-2" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X /> : <Menu />}
          </button>
        </div>

        {/* Mobile Nav */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }} 
              animate={{ opacity: 1, y: 0 }} 
              exit={{ opacity: 0, y: -10 }}
              className="md:hidden absolute top-20 inset-x-0 bg-[#020617] border-b border-white/5 p-6 flex flex-col gap-4"
            >
              <a href="#problema" onClick={() => setIsMenuOpen(false)} className="text-lg text-slate-300">Solución</a>
              <a href="#features" onClick={() => setIsMenuOpen(false)} className="text-lg text-slate-300">Características</a>
              <a href="#precios" onClick={() => setIsMenuOpen(false)} className="text-lg text-slate-300">Precios</a>
              <Link to="/login" className="text-lg text-slate-300">Iniciar sesión</Link>
              <Link to="/register" className="bg-white text-slate-900 px-4 py-3 rounded-xl text-center font-medium">Comenzar Gratis</Link>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <main className="pt-20">
        
        {/* ── HERO ──────────────────────────────────────────────────────── */}
        <section className="relative pt-24 pb-32 overflow-hidden">
          {/* Background effects */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary-500/20 rounded-full blur-[120px] pointer-events-none" />
          
          <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-sm text-primary-400 mb-8"
            >
              <Rocket className="w-4 h-4" />
              <span>Tracky 2.0 ya está disponible</span>
            </motion.div>

            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-5xl md:text-7xl font-bold tracking-tight mb-8"
            >
              Control total de tu <br className="hidden md:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-cyan-400">
                operación logística
              </span>
            </motion.h1>

            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-10"
            >
              La plataforma definitiva para empresas con delivery propio. Rastreo GPS en tiempo real, prueba de entrega, y clientes felices.
            </motion.p>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <Link 
                to="/register" 
                className="w-full sm:w-auto px-8 py-4 bg-white text-slate-900 rounded-full font-medium flex items-center justify-center gap-2 hover:bg-slate-100 transition-all hover:scale-105"
              >
                Comenzar Gratis
                <ArrowRight className="w-4 h-4" />
              </Link>
              <button className="w-full sm:w-auto px-8 py-4 bg-white/5 text-white border border-white/10 rounded-full font-medium flex items-center justify-center gap-2 hover:bg-white/10 transition-all">
                <PlayCircle className="w-5 h-5" />
                Ver Demo
              </button>
            </motion.div>

            {/* Dashboard Mockup Placeholder */}
            <motion.div 
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.5 }}
              className="mt-20 relative mx-auto max-w-5xl rounded-[2rem] border border-white/10 bg-slate-900/50 p-2 md:p-4 backdrop-blur-sm shadow-2xl overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-transparent to-transparent z-10 pointer-events-none" />
              <img 
                src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2070&auto=format&fit=crop" 
                alt="Tracky Dashboard" 
                className="w-full h-auto rounded-[1.5rem] opacity-80"
              />
            </motion.div>
          </div>
        </section>

        {/* ── EMPRESAS ──────────────────────────────────────────────────── */}
        <section className="py-10 border-y border-white/5 bg-white/5">
          <div className="max-w-7xl mx-auto px-6 text-center">
            <p className="text-sm font-medium text-slate-400 mb-8 uppercase tracking-widest">
              Confiado por negocios de todos los tamaños
            </p>
            <div className="flex flex-wrap justify-center items-center gap-x-12 gap-y-8 opacity-60 grayscale">
              <span className="text-xl font-bold">Restaurantes</span>
              <span className="text-xl font-bold">Farmacias</span>
              <span className="text-xl font-bold">Dark Kitchens</span>
              <span className="text-xl font-bold">Retail</span>
              <span className="text-xl font-bold">Tiendas</span>
            </div>
          </div>
        </section>

        {/* ── PROBLEMA ──────────────────────────────────────────────────── */}
        <section id="problema" className="py-32">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center max-w-3xl mx-auto mb-20">
              <h2 className="text-3xl md:text-5xl font-bold mb-6">El caos de la logística manual</h2>
              <p className="text-lg text-slate-400">Administrar repartidores por WhatsApp o Excel se traduce en pérdidas económicas, estrés operativo y una mala experiencia para el cliente.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="p-8 rounded-3xl bg-white/5 border border-white/10">
                <div className="w-12 h-12 rounded-2xl bg-red-500/20 text-red-400 flex items-center justify-center mb-6">
                  <MessageCircle className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Dependencia de WhatsApp</h3>
                <p className="text-slate-400">Cientos de mensajes para saber dónde está el pedido. Información fragmentada y pérdida de tiempo.</p>
              </div>
              <div className="p-8 rounded-3xl bg-white/5 border border-white/10">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center mb-6">
                  <MapPin className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Falta de tracking GPS</h3>
                <p className="text-slate-400">Clientes molestos llamando al local porque no saben si su pedido está en camino o retrasado.</p>
              </div>
              <div className="p-8 rounded-3xl bg-white/5 border border-white/10">
                <div className="w-12 h-12 rounded-2xl bg-orange-500/20 text-orange-400 flex items-center justify-center mb-6">
                  <Users className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Repartidores descoordinados</h3>
                <p className="text-slate-400">Mala asignación de rutas, lo que resulta en más combustible quemado y pedidos entregados fríos.</p>
              </div>
            </div>
          </div>
        </section>

        {/* ── SOLUCIÓN / FEATURES ────────────────────────────────────────── */}
        <section id="features" className="py-32 bg-white/5 border-t border-white/5">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center max-w-3xl mx-auto mb-20">
              <h2 className="text-3xl md:text-5xl font-bold mb-6">Todo lo que necesitas en un solo lugar</h2>
              <p className="text-lg text-slate-400">Tracky simplifica tu logística dándote visibilidad 360° sobre cada etapa de tu proceso de entrega.</p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { icon: <MapPin />, title: "Mapa en tiempo real", desc: "Supervisa toda tu flota en vivo." },
                { icon: <Smartphone />, title: "Portal del conductor", desc: "App web para los repartidores." },
                { icon: <ShieldCheck />, title: "Tracking público", desc: "Link para que el cliente rastree." },
                { icon: <FileSignature />, title: "Firma Digital (POD)", desc: "Comprobante de entrega exacto." },
                { icon: <BarChart3 />, title: "Dashboard KPI", desc: "Analíticas de tus envíos." },
                { icon: <Package />, title: "Asignación auto", desc: "Enrutamiento inteligente." },
                { icon: <Users />, title: "Roles y Permisos", desc: "Administradores y operadores." },
                { icon: <CheckCircle2 />, title: "Alertas SMS/Email", desc: "Notificaciones automáticas." },
              ].map((f, i) => (
                <div key={i} className="p-6 rounded-2xl bg-[#020617] border border-white/5 hover:border-primary-500/50 transition-colors">
                  <div className="w-10 h-10 rounded-xl bg-primary-500/10 text-primary-400 flex items-center justify-center mb-4">
                    {f.icon}
                  </div>
                  <h3 className="font-semibold mb-2">{f.title}</h3>
                  <p className="text-sm text-slate-400">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── PLANES Y PRECIOS ──────────────────────────────────────────── */}
        <section id="precios" className="py-32">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center max-w-3xl mx-auto mb-20">
              <h2 className="text-3xl md:text-5xl font-bold mb-6">Precios simples y transparentes</h2>
              <p className="text-lg text-slate-400">Escala tu negocio de delivery con planes diseñados para tu volumen operativo.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {/* Free */}
              <div className="p-8 rounded-3xl bg-white/5 border border-white/10 flex flex-col">
                <h3 className="text-xl font-semibold mb-2">Prueba Gratis</h3>
                <div className="flex items-end gap-2 mb-6">
                  <span className="text-4xl font-bold">S/0</span>
                  <span className="text-slate-400 mb-1">/ 30 días</span>
                </div>
                <ul className="space-y-4 mb-8 flex-1">
                  <li className="flex gap-3 text-slate-300"><CheckCircle2 className="w-5 h-5 text-primary-400" /> Hasta 30 pedidos/mes</li>
                  <li className="flex gap-3 text-slate-300"><CheckCircle2 className="w-5 h-5 text-primary-400" /> 1 administrador</li>
                  <li className="flex gap-3 text-slate-300"><CheckCircle2 className="w-5 h-5 text-primary-400" /> Tracking GPS básico</li>
                </ul>
                <Link to="/register" className="w-full py-3 rounded-xl border border-white/20 text-center hover:bg-white/10 transition-colors">
                  Comenzar Gratis
                </Link>
              </div>

              {/* Pro */}
              <div className="p-8 rounded-3xl bg-gradient-to-b from-primary-900/40 to-[#020617] border border-primary-500/30 flex flex-col relative transform md:-translate-y-4 shadow-2xl shadow-primary-500/10">
                <div className="absolute top-0 inset-x-0 flex justify-center -translate-y-1/2">
                  <span className="bg-primary-500 text-white px-3 py-1 rounded-full text-xs font-semibold tracking-wide uppercase">Más Popular</span>
                </div>
                <h3 className="text-xl font-semibold mb-2 text-primary-300">Plan Pro</h3>
                <div className="flex items-end gap-2 mb-6">
                  <span className="text-4xl font-bold">S/79</span>
                  <span className="text-slate-400 mb-1">/ mes</span>
                </div>
                <ul className="space-y-4 mb-8 flex-1">
                  <li className="flex gap-3 text-white"><CheckCircle2 className="w-5 h-5 text-primary-400" /> Pedidos ilimitados</li>
                  <li className="flex gap-3 text-white"><CheckCircle2 className="w-5 h-5 text-primary-400" /> Conductores ilimitados</li>
                  <li className="flex gap-3 text-white"><CheckCircle2 className="w-5 h-5 text-primary-400" /> Dashboard y Reportes</li>
                  <li className="flex gap-3 text-white"><CheckCircle2 className="w-5 h-5 text-primary-400" /> Firma Digital (POD)</li>
                  <li className="flex gap-3 text-white"><CheckCircle2 className="w-5 h-5 text-primary-400" /> Soporte prioritario</li>
                </ul>
                <Link to="/register" className="w-full py-3 rounded-xl bg-primary-500 text-white text-center hover:bg-primary-600 transition-colors font-medium">
                  Suscribirme Ahora
                </Link>
              </div>

              {/* Business */}
              <div className="p-8 rounded-3xl bg-white/5 border border-white/10 flex flex-col">
                <h3 className="text-xl font-semibold mb-2">Business</h3>
                <div className="flex items-end gap-2 mb-6">
                  <span className="text-4xl font-bold">S/149</span>
                  <span className="text-slate-400 mb-1">/ mes</span>
                </div>
                <ul className="space-y-4 mb-8 flex-1">
                  <li className="flex gap-3 text-slate-300"><CheckCircle2 className="w-5 h-5 text-primary-400" /> Todo lo de Pro</li>
                  <li className="flex gap-3 text-slate-300"><CheckCircle2 className="w-5 h-5 text-primary-400" /> Multi sucursal</li>
                  <li className="flex gap-3 text-slate-300"><CheckCircle2 className="w-5 h-5 text-primary-400" /> API / Integraciones</li>
                  <li className="flex gap-3 text-slate-300"><CheckCircle2 className="w-5 h-5 text-primary-400" /> Usuarios ilimitados</li>
                  <li className="flex gap-3 text-slate-300"><CheckCircle2 className="w-5 h-5 text-primary-400" /> Soporte Premium 24/7</li>
                </ul>
                <button className="w-full py-3 rounded-xl border border-white/20 text-center hover:bg-white/10 transition-colors">
                  Hablar con ventas
                </button>
              </div>
            </div>
          </div>
        </section>

      </main>

      {/* ── FOOTER ──────────────────────────────────────────────────────── */}
      <footer className="py-12 border-t border-white/5 bg-[#020617]">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="Tracky Logo" className="h-24 w-auto object-contain" />
          </div>
          <div className="flex gap-6 text-sm text-slate-400">
            <a href="#" className="hover:text-white">Privacidad</a>
            <a href="#" className="hover:text-white">Términos</a>
            <a href="#" className="hover:text-white">Contacto</a>
          </div>
          <div className="text-sm text-slate-500">
            © {new Date().getFullYear()} Tracky SaaS. Todos los derechos reservados.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
