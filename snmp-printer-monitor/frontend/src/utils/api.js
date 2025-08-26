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
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    console.log(`API Response: ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error(`API Error: ${error.response?.status} ${error.config?.url}`, error.response?.data);
    return Promise.reject(error);
  }
);

export const printerAPI = {
  // Get all printers
  getPrinters: () => api.get('/printers'),

  // Add a new printer
  addPrinter: (printerData) => api.post('/printers', printerData),

  // Remove a printer
  removePrinter: (printerId) => api.delete(`/printers/${printerId}`),

  // Test printer connection
  testPrinter: (printerId) => api.post(`/printers/${printerId}/test`),
};

export const monitoringAPI = {
  // Start monitoring
  startMonitoring: () => api.post('/monitoring/start'),

  // Stop monitoring
  stopMonitoring: () => api.post('/monitoring/stop'),

  // Get monitoring status
  getMonitoringStatus: () => api.get('/monitoring/status'),
};

export default api;