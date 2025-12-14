import api from './api';

export const trainingService = {
  async getTrainings() {
    const response = await api.get('/trainings');
    return response.data;
  },

  async createTraining(trainingData) {
    const response = await api.post('/trainings', trainingData);
    return response.data;
  },

  async updateTraining(id, trainingData) {
    const response = await api.put(`/trainings/${id}`, trainingData);
    return response.data;
  },

  async deleteTraining(id) {
    try {
      console.log(`Attempting to delete training with id: ${id}`);
      const response = await api.delete(`/trainings/${id}`);
      console.log('Delete response:', response);
      return response.data;
    } catch (error) {
      console.error('Training deletion error:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message,
        config: {
          method: error.config?.method,
          url: error.config?.url,
        }
      });
      throw error;
    }
  },
};

