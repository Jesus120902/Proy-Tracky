import axios from 'axios';

// En producción, VITE_API_URL vendrá de las variables de entorno (.env o panel de control)
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Interceptor para añadir el token JWT a todas las peticiones
api.interceptors.request.use(
  (config) => {
    const userInfo = localStorage.getItem('userInfo') 
      ? JSON.parse(localStorage.getItem('userInfo')) 
      : null;
    
    if (userInfo && userInfo.token) {
      config.headers.Authorization = `Bearer ${userInfo.token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor para manejar errores globalmente de forma amigable
api.interceptors.response.use(
  (response) => response,
  (error) => {
    let message = 'Error inesperado en el servidor';
    
    if (!error.response) {
      message = 'No se pudo conectar con el servidor. Verifica tu conexión.';
    } else {
      const { status, data } = error.response;
      if (status === 401) {
        message = 'Sesión expirada o credenciales inválidas.';
      }
      else if (status === 404) message = 'El recurso solicitado no existe.';
      else if (status === 400) message = data.message || 'Error en los datos enviados.';
      else if (status === 500) message = 'Error interno en el servidor logístico.';
      else message = data.message || message;
    }
    
    error.friendlyMessage = message;
    return Promise.reject(error);
  }
);

export const authApi = {
  login: (credentials) => api.post('/auth/login', credentials),
};

export const ordersApi = {
  getAll: () => api.get('/orders'),
  getById: (id) => api.get(`/orders/${id}`),
  create: (data) => api.post('/orders', data),
  update: (id, data) => api.put(`/orders/${id}`, data),
  delete: (id) => api.delete(`/orders/${id}`),
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
  delete: (id) => api.delete(`/users/${id}`),
};

export const driverApi = {
  getMyOrders: () => api.get('/driver/my-orders'),
  updateOrderStatus: (orderId, status, extraData = {}) => api.patch(`/driver/orders/${orderId}/status`, { status, ...extraData }),
};

export default api;
