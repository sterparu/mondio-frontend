import axios from 'axios';

// Folosește variabila de mediu pentru URL-ul backend-ului
// În development: http://localhost:3000 (folosește proxy din vite.config.js)
// În producție: URL-ul complet al backend-ului Heroku (ex: https://mondio-backend.herokuapp.com)
const getApiUrl = () => {
  // În producție, folosește variabila de mediu
  if (import.meta.env.PROD && import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  // În development, folosește proxy-ul Vite
  return '/api';
};

const api = axios.create({
  baseURL: getApiUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  } else {
    console.warn('No token found in localStorage');
  }
  return config;
});

// Handle 401 errors (unauthorized) and ignore 404 for /user endpoint
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 unauthorized - redirect to login
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
      return Promise.reject(error);
    }
    
    // Ignore 404 errors for /user endpoint if backend doesn't have it implemented
    // This prevents errors from showing up when backend tries to validate user
    if (error.response?.status === 404 && error.config?.url?.includes('/user')) {
      console.warn('User endpoint not available, ignoring 404 error');
      // Return a mock response to prevent the error from propagating
      return Promise.resolve({
        data: { email: 'User' },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: error.config
      });
    }
    
    return Promise.reject(error);
  }
);

export default api;

