import api from './api';

export const trainerService = {
  async getTrainerProfile() {
    const response = await api.get('/trainer/profile');
    return response.data;
  },

  async createTrainerProfile(name, bio) {
    const response = await api.post('/trainer/profile', { name, bio });
    return response.data;
  },

  async updateTrainerProfile(name, bio) {
    const response = await api.put('/trainer/profile', { name, bio });
    return response.data;
  },

  async getUsers() {
    const response = await api.get('/trainer/users');
    return response.data;
  },

  async assignToDog(dogId) {
    const response = await api.post(`/trainer/assign/dog/${dogId}`);
    return response.data;
  },

  async removeFromDog(dogId) {
    const response = await api.delete(`/trainer/assign/dog/${dogId}`);
    return response.data;
  },

  async addTrainerNote(sessionId, entryId, trainerNote) {
    const response = await api.put(`/sessions/${sessionId}/entries/${entryId}/trainer-note`, {
      trainerNote,
    });
    return response.data;
  },
};
