// services/imageUpload.js
import { API } from './auth'; // Use your existing API instance

export const imageUploadService = {
  uploadImage: async (file) => {
    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await API.post('/admin/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 30000, // 30 second timeout
      });

      if (response.data.success) {
        return response.data.imageUrl;
      } else {
        throw new Error(response.data.error || 'Upload failed');
      }
    } catch (error) {
      console.error('Image upload error:', error);
      
      if (error.response) {
        // Server responded with error status
        throw new Error(error.response.data?.error || `Upload failed: ${error.response.status}`);
      } else if (error.request) {
        // Request was made but no response received
        throw new Error('No response from server. Please check your connection.');
      } else {
        // Something else happened
        throw new Error(error.message || 'Upload failed');
      }
    }
  },
};