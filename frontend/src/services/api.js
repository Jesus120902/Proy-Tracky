import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
});

// ── Helpers de sesión ───────────────────────────────────────────
const getSession = () => {
  try {
    return JSON.parse(localStorage.getItem('userInfo'));
  } catch {
    return null;
  }
};

const saveSession = (data) => {
  localStorage.setItem('userInfo', JSON.stringify(data));
};

const clearSession = () => {
  localStorage.removeItem('userInfo');
};

// ── Request interceptor: adjunta Access Token ───────────────────
api.interceptors.request.use(
  (config) => {
    const session = getSession();
    if (session?.token) {
      config.headers.Authorization = `Bearer ${session.token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response interceptor: maneja errores y 401 con auto-refresh ─
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else prom.resolve(token);
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // ── Auto-refresh cuando el access token expira (401) ────────
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes('/auth/login') &&
      !originalRequest.url?.includes('/auth/refresh')
    ) {
      if (isRefreshing) {
        // Encolar las peticiones que fallan mientras se refresca
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const session = getSession();
      const refreshToken = session?.refreshToken;

      if (!refreshToken) {
        isRefreshing = false;
        clearSession();
        window.dispatchEvent(new Event('tracky:logout'));
        error.friendlyMessage = 'Sesión expirada. Por favor inicia sesión nuevamente.';
        return Promise.reject(error);
      }

      try {
        const { data } = await axios.post(`${API_BASE_URL}/auth/refresh`, {
          refreshToken,
        });

        // Actualizar el access token en localStorage
        const updatedSession = { ...session, token: data.token };
        saveSession(updatedSession);

        api.defaults.headers.common.Authorization = `Bearer ${data.token}`;
        processQueue(null, data.token);

        originalRequest.headers.Authorization = `Bearer ${data.token}`;
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        clearSession();
        window.dispatchEvent(new Event('tracky:logout'));
        error.friendlyMessage = 'Sesión expirada. Por favor inicia sesión nuevamente.';
        return Promise.reject(error);
      } finally {
        isRefreshing = false;
      }
    }

    // ── Mensajes de error amigables ──────────────────────────────
    let message = 'Error inesperado en el servidor';
    if (!error.response) {
      message = 'No se pudo conectar con el servidor. Verifica tu conexión.';
    } else {
      const { status, data } = error.response;
      if (status === 401) message = data?.message || 'No autorizado.';
      else if (status === 403) message = data?.message || 'No tienes permisos para esta acción.';
      else if (status === 404) message = 'El recurso solicitado no existe.';
      else if (status === 400) message = data?.message || 'Datos inválidos enviados.';
      else if (status === 500) message = 'Error interno del servidor.';
      else message = data?.message || message;
    }

    error.friendlyMessage = message;
    return Promise.reject(error);
  }
);

// ── APIs ─────────────────────────────────────────────────────────
export const authApi = {
  login: (credentials) => api.post('/auth/login', credentials),
  refresh: (refreshToken) => api.post('/auth/refresh', { refreshToken }),
  me: () => api.get('/auth/me'),
};

export const ordersApi = {
  getAll: (params) => api.get('/orders', { params }),
  getById: (id) => api.get(`/orders/${id}`),
  create: (data) => api.post('/orders', data),
  update: (id, data) => api.put(`/orders/${id}`, data),
  delete: (id) => api.delete(`/orders/${id}`),
  trackPublic: (orderNumber) => api.get(`/orders/track/${orderNumber}`),
};

export const driversApi = {
  getAll: (status) => api.get('/drivers', { params: { status } }),
  getById: (id) => api.get(`/drivers/${id}`),
  create: (data) => api.post('/drivers', data),
  update: (id, data) => api.put(`/drivers/${id}`, data),
  delete: (id) => api.delete(`/drivers/${id}`),
  updateLocation: (id, location) => api.patch(`/drivers/${id}/location`, location),
  getHistory: (id, date) => api.get(`/drivers/${id}/history`, { params: { date } }),
};

export const statsApi = {
  getSummary: () => api.get('/stats/summary'),
  getTrends: () => api.get('/stats/trends'),
  getDistribution: () => api.get('/stats/distribution'),
};

export const companiesApi = {
  getAll: () => api.get('/companies'),
  create: (data) => api.post('/companies', data),
  delete: (id) => api.delete(`/companies/${id}`),
  getMyCompany: () => api.get('/companies/me'),
  updateMyCompany: (data) => api.put('/companies/me', data),
};

export const usersApi = {
  getAll: () => api.get('/users'),
  create: (data) => api.post('/users', data),
  update: (id, data) => api.put(`/users/${id}`, data),
  delete: (id) => api.delete(`/users/${id}`),
};

export const driverApi = {
  getMyOrders: () => api.get('/driver/my-orders'),
  updateOrderStatus: (orderId, status, location) =>
    api.patch(`/driver/orders/${orderId}/status`, { status, location }),
};

export { getSession, saveSession, clearSession };
export default api;
