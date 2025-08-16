import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      // Only redirect if not already on login page
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Document service
export const documentService = {
  uploadImage: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await api.post('/documents/upload-image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  saveDocument: async (originalText, correctedText = null) => {
    const response = await api.post('/documents/', {
      original_text: originalText,
      corrected_text: correctedText,
    });
    return response.data;
  },

  getDocuments: async () => {
    const response = await api.get('/documents/');
    return response.data;
  },

  getDocument: async (id) => {
    const response = await api.get(`/documents/${id}`);
    return response.data;
  },

  updateDocument: async (id, correctedText) => {
    const response = await api.put(`/documents/${id}`, {
      corrected_text: correctedText,
    });
    return response.data;
  },

  deleteDocument: async (id) => {
    const response = await api.delete(`/documents/${id}`);
    return response.data;
  },
};
