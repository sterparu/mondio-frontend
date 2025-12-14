import api from './api';

export const sessionService = {
  async getSessions() {
    const response = await api.get('/sessions');
    return response.data;
  },

  async createSession(sessionData) {
    console.log('Creating session with data:', sessionData);
    try {
      const response = await api.post('/sessions', sessionData);
      return response.data;
    } catch (error) {
      console.error('Session creation error:', error.response?.data || error.message);
      throw error;
    }
  },

  async updateSession(id, sessionData) {
    console.log('Updating session with data:', sessionData);
    try {
      const response = await api.put(`/sessions/${id}`, sessionData);
      return response.data;
    } catch (error) {
      console.error('Session update error:', error.response?.data || error.message);
      throw error;
    }
  },

  async deleteSession(id) {
    try {
      console.log(`Attempting to delete session with id: ${id}`);
      const response = await api.delete(`/sessions/${id}`);
      console.log('Delete response:', response);
      return response.data;
    } catch (error) {
      console.error('Session deletion error:', {
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

  async deleteEntry(sessionId, entryId) {
    try {
      const response = await api.delete(`/sessions/${sessionId}/entries/${entryId}`);
      return response.data;
    } catch (error) {
      console.error('Entry deletion error:', error.response?.data || error.message);
      throw error;
    }
  },
};

