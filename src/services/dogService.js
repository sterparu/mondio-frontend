import api from './api';

export const dogService = {
  async getDogs() {
    const response = await api.get('/dogs');
    return response.data;
  },

  async createDog(dogData) {
    try {
      console.log('Creating dog with data:', dogData);
      const response = await api.post('/dogs', dogData);
      console.log('Dog created successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error creating dog:', error);
      console.error('Error details:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message,
      });
      throw error;
    }
  },

  async updateDog(id, dogData) {
    const response = await api.put(`/dogs/${id}`, dogData);
    return response.data;
  },

  async deleteDog(id) {
    const response = await api.delete(`/dogs/${id}`);
    return response.data;
  },
};

