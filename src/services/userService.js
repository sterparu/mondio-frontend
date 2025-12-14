import api from './api';
import { trainerService } from './trainerService';

export const userService = {
  async getUser() {
    try {
      const response = await api.get('/user');
      const userData = response.data;
      
      // Check if user is a trainer
      try {
        const trainerProfile = await trainerService.getTrainerProfile();
        if (trainerProfile.isTrainer) {
          userData.isTrainer = true;
          userData.trainer = trainerProfile.trainer;
        } else {
          userData.isTrainer = false;
        }
      } catch (error) {
        // If trainer profile doesn't exist, user is not a trainer
        userData.isTrainer = false;
      }
      
      return userData;
    } catch (error) {
      // Log error details for debugging
      if (error.response?.status !== 404) {
        console.error('User service error:', {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
          message: error.message,
        });
      }
      throw error;
    }
  },
};


