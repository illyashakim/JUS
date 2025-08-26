import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Add any auth tokens here if needed
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('API Error:', error);
    return Promise.reject(error);
  }
);

export const printerAPI = {
  // Get all printers
  getPrinters: async () => {
    const response = await api.get('/printers');
    return response.data;
  },

  // Get specific printer
  getPrinter: async (id) => {
    const response = await api.get(`/printers/${id}`);
    return response.data;
  },

  // Add new printer
  addPrinter: async (printerData) => {
    const response = await api.post('/printers', printerData);
    return response.data;
  },

  // Delete printer
  deletePrinter: async (id) => {
    const response = await api.delete(`/printers/${id}`);
    return response.data;
  },

  // Scan printer
  scanPrinter: async (id) => {
    const response = await api.post(`/printers/${id}/scan`);
    return response.data;
  },

  // Get dashboard data
  getDashboard: async () => {
    const response = await api.get('/dashboard');
    return response.data;
  },
};

export default api;