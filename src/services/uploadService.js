import api from './api';

export const uploadService = {
  async uploadUserPhoto(file) {
    const formData = new FormData();
    formData.append('file', file);
    
    const token = localStorage.getItem('token');
    const response = await fetch('/api/upload/user/photo', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to upload photo');
    }
    
    return response.json();
  },

  async uploadDogPhoto(dogId, file) {
    const formData = new FormData();
    formData.append('file', file);
    
    const token = localStorage.getItem('token');
    const response = await fetch(`/api/upload/dog/${dogId}/photo`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to upload photo');
    }
    
    return response.json();
  },

  async uploadTrainingVideo(trainingId, file) {
    const formData = new FormData();
    formData.append('file', file);
    
    const token = localStorage.getItem('token');
    const response = await fetch(`/api/upload/training/${trainingId}/video`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to upload video');
    }
    
    return response.json();
  },

  async uploadSessionVideo(sessionId, file) {
    console.log(`Uploading session video: ${file.name}, size: ${file.size} bytes, type: ${file.type}`);
    const formData = new FormData();
    formData.append('file', file);
    
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`/api/upload/session/${sessionId}/video`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });
      
      if (!response.ok) {
        const error = await response.json();
        console.error('Upload error response:', error);
        throw new Error(error.error || error.details || 'Failed to upload video');
      }
      
      const result = await response.json();
      console.log('Upload successful:', result);
      return result;
    } catch (error) {
      console.error('Upload error:', error);
      throw error;
    }
  },

  async uploadEntryVideo(entryId, file) {
    console.log(`Uploading entry video: ${file.name}, size: ${file.size} bytes, type: ${file.type}`);
    const formData = new FormData();
    formData.append('file', file);
    
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`/api/upload/entry/${entryId}/video`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });
      
      if (!response.ok) {
        const error = await response.json();
        console.error('Upload error response:', error);
        throw new Error(error.error || error.details || 'Failed to upload video');
      }
      
      const result = await response.json();
      console.log('Upload successful:', result);
      return result;
    } catch (error) {
      console.error('Upload error:', error);
      throw error;
    }
  },
};

