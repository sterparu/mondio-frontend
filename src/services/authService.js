import api from './api';

export const authService = {
  async register(email, password, activationCode) {
    const response = await api.post('/register', { email, password, activationCode });
    return response.data;
  },

  async login(email, password) {
    const response = await api.post('/login', { email, password });
    const { token } = response.data;
    if (token) {
      localStorage.setItem('token', token);
    }
    return response.data;
  },

  logout() {
    localStorage.removeItem('token');
  },

  isAuthenticated() {
    return !!localStorage.getItem('token');
  },
};


