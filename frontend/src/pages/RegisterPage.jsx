import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useToast } from '../components/Toast';
import { auth, db } from '../firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { collection, addDoc, doc, updateDoc, Timestamp } from 'firebase/firestore';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    companyName: '',
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { addToast } = useToast();

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const generateSlug = (name) =>
    name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      return addToast('Las contraseñas no coinciden', 'error');
    }

    try {
      setLoading(true);
      const slug = generateSlug(formData.companyName);

      // 1. Crear en Firebase Auth
      const cred = await createUserWithEmailAndPassword(auth, formData.email, formData.password);

      // 2. Crear empresa en Firestore
      const companyRef = await addDoc(collection(db, 'companies'), {
        name: formData.companyName,
        slug,
        subscriptionPlan: 'free',
        subscriptionStatus: 'trialing',
        maxDrivers: 10,
        active: true,
        createdAt: Timestamp.now(),
      });

      // 3. Crear usuario en Firestore
      await addDoc(collection(db, 'users'), {
        uid: cred.user.uid,
        name: formData.name,
        email: formData.email,
        role: 'admin',
        companyId: companyRef.id,
        active: true,
        createdAt: Timestamp.now(),
      });

      addToast('Cuenta creada con éxito. ¡Bienvenido a Tracky!', 'success');
      navigate('/dashboard');
    } catch (error) {
      let msg = 'Error al crear la cuenta';
      if (error.code === 'auth/email-already-in-use') {
        msg = 'El correo ya está registrado';
      } else if (error.message) {
        msg = error.message;
      }
      addToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] text-white flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <h2 className="text-3xl font-bold tracking-tight text-white mb-2">Comienza tu prueba gratis</h2>
        <p className="text-sm text-slate-400">30 días gratis en Tracky Spark.</p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-slate-900/50 backdrop-blur-xl py-8 px-4 shadow-2xl sm:rounded-3xl border border-white/10 sm:px-10">
          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-medium text-slate-300">Nombre de tu Empresa</label>
              <input
                name="companyName"
                type="text"
                required
                value={formData.companyName}
                onChange={handleChange}
                className="appearance-none block w-full px-3 py-2 border border-slate-700 rounded-xl bg-slate-800 text-white focus:ring-2 focus:ring-primary-500 sm:text-sm"
                placeholder="Ej. Delivery Express"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300">Tu Nombre</label>
              <input
                name="name"
                type="text"
                required
                value={formData.name}
                onChange={handleChange}
                className="appearance-none block w-full px-3 py-2 border border-slate-700 rounded-xl bg-slate-800 text-white focus:ring-2 focus:ring-primary-500 sm:text-sm"
                placeholder="Juan Pérez"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300">Correo Electrónico</label>
              <input
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="appearance-none block w-full px-3 py-2 border border-slate-700 rounded-xl bg-slate-800 text-white focus:ring-2 focus:ring-primary-500 sm:text-sm"
                placeholder="juan@empresa.com"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300">Contraseña</label>
                <input
                  name="password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="appearance-none block w-full px-3 py-2 border border-slate-700 rounded-xl bg-slate-800 text-white sm:text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300">Confirmar</label>
                <input
                  name="confirmPassword"
                  type="password"
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="appearance-none block w-full px-3 py-2 border border-slate-700 rounded-xl bg-slate-800 text-white sm:text-sm"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-3 px-4 rounded-xl text-sm font-medium text-white bg-primary-600 hover:bg-primary-500 transition-colors disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Crear cuenta'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
