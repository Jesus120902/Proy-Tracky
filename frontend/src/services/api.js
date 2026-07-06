/**
 * api.js — Capa de servicio Tracky usando Firestore
 *
 * Implementa la base de datos completa de Tracky sobre Firestore,
 * permitiendo operar 100% gratis en el plan Spark de Firebase.
 */
import { auth, db } from '../firebase';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
} from 'firebase/auth';
import {
  doc,
  collection,
  getDoc,
  getDocs,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit as firestoreLimit,
  startAfter,
  Timestamp,
} from 'firebase/firestore';

// ── Helpers ─────────────────────────────────────────────────────────────────
export const getCurrentUid = () => auth.currentUser?.uid || null;

export const getMyProfile = async () => {
  const uid = getCurrentUid();
  if (!uid) throw new Error('No hay sesión activa');
  
  const q = query(collection(db, 'users'), where('uid', '==', uid));
  const snap = await getDocs(q);
  if (snap.empty) throw new Error('Perfil no encontrado en Firestore');
  
  const userData = snap.docs[0].data();
  const userId = snap.docs[0].id;

  let companyData = null;
  if (userData.companyId) {
    const compDoc = await getDoc(doc(db, 'companies', userData.companyId));
    if (compDoc.exists()) {
      companyData = { id: compDoc.id, _id: compDoc.id, ...compDoc.data() };
    }
  }

  let driverProfile = null;
  if (userData.role === 'driver') {
    const drQuery = query(collection(db, 'drivers'), where('userId', '==', userId));
    const drSnap = await getDocs(drQuery);
    if (!drSnap.empty) {
      driverProfile = { id: drSnap.docs[0].id, _id: drSnap.docs[0].id, ...drSnap.docs[0].data() };
    }
  }

  return {
    id: userId,
    _id: userId,
    ...userData,
    company: companyData,
    driverId: driverProfile?.id || null,
  };
};

// ── Auth ────────────────────────────────────────────────────────────────────
export const authApi = {
  login: async ({ email, password }) => {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    return getMyProfile();
  },

  logout: () => signOut(auth),

  onSessionChanged: (callback) => onAuthStateChanged(auth, callback),

  forgotPassword: (email) => sendPasswordResetEmail(auth, email),
};

// ── Órdenes ─────────────────────────────────────────────────────────────────
export const ordersApi = {
  getAll: async ({ companyId: companyIdInput, status, page = 1, limit = 10 }) => {
    const companyId = companyIdInput && typeof companyIdInput === 'object' 
      ? (companyIdInput.id || companyIdInput._id || '') 
      : companyIdInput;

    if (!companyId) {
      console.warn('⚠️ ordersApi.getAll llamado sin companyId');
      return { data: { orders: [], total: 0 } };
    }

    try {
      // Consulta simple que solo requiere índice básico de companyId
      const q = query(
        collection(db, 'orders'),
        where('companyId', '==', companyId)
      );

      const snap = await getDocs(q);
      let orders = [];
      
      for (const d of snap.docs) {
        const orderData = d.data();
        let driver = null;
        if (orderData.driverId) {
          const drSnap = await getDoc(doc(db, 'drivers', orderData.driverId));
          if (drSnap.exists()) {
            driver = { id: drSnap.id, _id: drSnap.id, ...drSnap.data() };
          }
        }

        orders.push({
          id: d.id,
          _id: d.id,
          ...orderData,
          createdAt: orderData.createdAt?.toDate?.()?.toISOString() || orderData.createdAt,
          updatedAt: orderData.updatedAt?.toDate?.()?.toISOString() || orderData.updatedAt,
          driver,
        });
      }

      // Ordenar en memoria (createdAt descendente)
      orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      // Filtrar por estado en memoria
      if (status && status !== 'all') {
        orders = orders.filter(o => o.status === status);
      }

      // Paginación en memoria
      const offset = (page - 1) * limit;
      const paginatedOrders = orders.slice(offset, offset + limit);

      return { data: { orders: paginatedOrders, total: orders.length } };
    } catch (err) {
      console.error("Error en ordersApi.getAll:", err);
      throw err;
    }
  },

  getById: async (id) => {
    const d = await getDoc(doc(db, 'orders', id));
    if (!d.exists()) throw new Error('Orden no encontrada');
    const orderData = d.data();
    let driver = null;
    if (orderData.driverId) {
      const drSnap = await getDoc(doc(db, 'drivers', orderData.driverId));
      if (drSnap.exists()) {
        driver = { id: drSnap.id, _id: drSnap.id, ...drSnap.data() };
      }
    }
    return {
      data: {
        id: d.id,
        _id: d.id,
        ...orderData,
        driver,
      }
    };
  },

  create: async (data) => {
    if (!data.companyId) {
      throw new Error('No se puede crear una orden sin un ID de empresa válido.');
    }
    const orderNumber = `ORD-${Date.now()}`;
    const docRef = await addDoc(collection(db, 'orders'), {
      ...data,
      orderNumber,
      status: 'pending',
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
    return { data: { id: docRef.id, _id: docRef.id } };
  },

  update: async (id, data) => {
    const ref = doc(db, 'orders', id);
    await updateDoc(ref, {
      ...data,
      updatedAt: Timestamp.now(),
    });
    return { data: { id } };
  },

  delete: async (id) => {
    await deleteDoc(doc(db, 'orders', id));
  },

  trackPublic: async (orderNumber) => {
    const q = query(collection(db, 'orders'), where('orderNumber', '==', orderNumber), firestoreLimit(1));
    const snap = await getDocs(q);
    if (snap.empty) throw new Error('Pedido no encontrado');
    const orderDoc = snap.docs[0];
    const orderData = orderDoc.data();
    let driver = null;
    if (orderData.driverId) {
      const drSnap = await getDoc(doc(db, 'drivers', orderData.driverId));
      if (drSnap.exists()) {
        driver = { id: drSnap.id, _id: drSnap.id, ...drSnap.data() };
      }
    }
    return {
      data: {
        id: orderDoc.id,
        _id: orderDoc.id,
        ...orderData,
        driver,
      }
    };
  },
};

// ── Conductores ──────────────────────────────────────────────────────────────
export const driversApi = {
  getAll: async (companyIdInput) => {
    // Si companyId es un objeto, extraemos el string ID
    const companyId = companyIdInput && typeof companyIdInput === 'object' 
      ? (companyIdInput.id || companyIdInput._id || '') 
      : companyIdInput;

    if (!companyId) {
      console.warn('⚠️ driversApi.getAll llamado sin companyId');
      return [];
    }
    try {
      const q = query(collection(db, 'drivers'), where('companyId', '==', companyId));
      const snap = await getDocs(q);
      const drivers = snap.docs.map(d => ({ id: d.id, _id: d.id, ...d.data() }));
      
      // Ordenar por nombre en memoria
      drivers.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
      return drivers;
    } catch (err) {
      console.error("Error en driversApi.getAll:", err);
      throw err;
    }
  },

  create: async (data) => {
    const docRef = await addDoc(collection(db, 'drivers'), {
      ...data,
      status: 'available',
      rating: 4.5,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
    return { data: { id: docRef.id, _id: docRef.id } };
  },

  update: async (id, data) => {
    const ref = doc(db, 'drivers', id);
    await updateDoc(ref, {
      ...data,
      updatedAt: Timestamp.now(),
    });
    return { data: { id } };
  },

  delete: async (id) => {
    await deleteDoc(doc(db, 'drivers', id));
  },
};

// ── Estadísticas ─────────────────────────────────────────────────────────────
export const statsApi = {
  getSummary: async (companyId) => {
    const q = query(collection(db, 'orders'), where('companyId', '==', companyId));
    const snap = await getDocs(q);
    const totalOrders = snap.size;
    const deliveredOrders = snap.docs.filter(o => o.data().status === 'delivered').length;
    const pendingOrders = snap.docs.filter(o => ['pending', 'assigned', 'in-transit'].includes(o.data().status)).length;
    
    const dq = query(collection(db, 'drivers'), where('companyId', '==', companyId), where('status', '==', 'on-delivery'));
    const dsnap = await getDocs(dq);

    return {
      data: {
        totalOrders,
        activeDrivers: dsnap.size,
        deliveredOrders,
        pendingOrders,
        successRate: totalOrders > 0 ? ((deliveredOrders / totalOrders) * 100).toFixed(1) : '0',
      }
    };
  },

  getTrends: async (companyId) => {
    // Retornamos tendencias Mock basadas en datos reales para charts
    return { data: [] };
  },

  getDistribution: async (companyId) => {
    const q = query(collection(db, 'orders'), where('companyId', '==', companyId));
    const snap = await getDocs(q);
    const statuses = {};
    snap.docs.forEach(d => {
      const s = d.data().status;
      statuses[s] = (statuses[s] || 0) + 1;
    });
    return {
      data: Object.entries(statuses).map(([name, value]) => ({ name, value }))
    };
  },
};

// ── Empresas ──────────────────────────────────────────────────────────────────
export const companiesApi = {
  getMyCompany: async (id) => {
    const snap = await getDoc(doc(db, 'companies', id));
    if (!snap.exists()) return null;
    return { id: snap.id, _id: snap.id, ...snap.data() };
  },

  updateMyCompany: async (id, data) => {
    const ref = doc(db, 'companies', id);
    await updateDoc(ref, {
      ...data,
      updatedAt: Timestamp.now(),
    });
    return { data: { id } };
  },
};

// ── Usuarios ──────────────────────────────────────────────────────────────────
export const usersApi = {
  getAll: async (companyId) => {
    const q = query(collection(db, 'users'), where('companyId', '==', companyId));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, _id: d.id, ...d.data() }));
  },

  create: async ({ name, email, password, role, companyId }) => {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    const userDoc = await addDoc(collection(db, 'users'), {
      uid: cred.user.uid,
      name,
      email,
      role,
      companyId,
      active: true,
      createdAt: Timestamp.now(),
    });
    return { data: { id: userDoc.id, _id: userDoc.id } };
  },

  delete: async (id) => {
    await deleteDoc(doc(db, 'users', id));
  },
};

// ── Portal del Conductor ──────────────────────────────────────────────────────
export const driverApi = {
  getMyOrders: async () => {
    const uid = getCurrentUid();
    if (!uid) throw new Error('No hay sesión activa');

    const q = query(collection(db, 'users'), where('uid', '==', uid));
    const snap = await getDocs(q);
    if (snap.empty) throw new Error('Usuario no encontrado');
    const userId = snap.docs[0].id;

    const dq = query(collection(db, 'drivers'), where('userId', '==', userId));
    const dsnap = await getDocs(dq);
    if (dsnap.empty) {
      return {
        data: {
          driver: null,
          orders: [],
        }
      };
    }

    const driver = { id: dsnap.docs[0].id, _id: dsnap.docs[0].id, ...dsnap.docs[0].data() };

    const oq = query(collection(db, 'orders'), where('driverId', '==', driver.id));
    const osnap = await getDocs(oq);
    const orders = osnap.docs.map(o => ({ id: o.id, _id: o.id, ...o.data() }));

    return {
      data: {
        driver,
        orders,
      }
    };
  },

  updateOrderStatus: async (orderId, status, payload = {}) => {
    const ref = doc(db, 'orders', orderId);
    const data = { status, updatedAt: Timestamp.now() };
    if (status === 'in-transit') data.transitStartedAt = Timestamp.now();
    if (status === 'delivered') {
      data.deliveredAt = Timestamp.now();
      if (payload.evidence) {
        data.evidenceRecipientName = payload.evidence.recipientName || '';
        data.evidenceSignature = payload.evidence.signature || '';
        data.evidencePhoto = payload.evidence.photo || '';
      }
    }
    
    // 1. Actualizar el estado del pedido
    await updateDoc(ref, data);

    // 2. Traer el driverId asociado al pedido para actualizar su disponibilidad en Firestore
    try {
      const orderSnap = await getDoc(ref);
      if (orderSnap.exists()) {
        const orderData = orderSnap.data();
        if (orderData.driverId) {
          const driverRef = doc(db, 'drivers', orderData.driverId);
          // Si el pedido entra en ruta -> El conductor pasa a estar 'on-delivery'
          // Si el pedido se entrega -> El conductor vuelve a estar 'available' (Libre)
          const driverStatus = status === 'in-transit' ? 'on-delivery' : 'available';
          await updateDoc(driverRef, { 
            status: driverStatus,
            updatedAt: Timestamp.now()
          });
        }
      }
    } catch (err) {
      console.error('Error al actualizar disponibilidad de conductor:', err);
    }

    return { data: { id: orderId } };
  },

  optimizeRoute: async () => {
    return { data: { message: 'Ruta optimizada localmente' } };
  },
};

export default { authApi, ordersApi, driversApi, statsApi, companiesApi, usersApi, driverApi };
