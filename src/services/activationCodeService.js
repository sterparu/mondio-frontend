import api from './api';

export const activationCodeService = {
  async generateCode() {
    const response = await api.post('/activation-codes/generate');
    return response.data;
  },

  async getCodes() {
    const response = await api.get('/activation-codes');
    return response.data;
  },

  async deleteCode(codeId) {
    const response = await api.delete(`/activation-codes/${codeId}`);
    return response.data;
  },
};
