import axios from 'axios';

const API_BASE_URL = "https://ssl-sentry-site.onrender.com/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Create axios instance with auth token
const createAuthAxios = () => {
  const token = localStorage.getItem('token');
  return axios.create({
    baseURL: API_BASE_URL,
    timeout: 60000,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    }
  });
};

// Auth API
export const authAPI = {
  register: async (data) => {
    try {
      const response = await api.post('/auth/register', data);
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Network error' };
    }
  },
  login: async (data) => {
    try {
      const response = await api.post('/auth/login', data);
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Network error' };
    }
  },
  getMe: async () => {
    try {
      const response = await createAuthAxios().get('/auth/me');
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Network error' };
    }
  },
  updateProfile: async (data) => {
    try {
      const response = await createAuthAxios().put('/auth/profile', data);
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Network error' };
    }
  },
  changePassword: async (data) => {
    try {
      const response = await createAuthAxios().put('/auth/change-password', data);
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Network error' };
    }
  },
  deleteAccount: async () => {
    try {
      const response = await createAuthAxios().delete('/auth/account');
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Network error' };
    }
  }
};

// Websites API
export const websitesAPI = {
  getAll: async () => {
    try {
      const response = await createAuthAxios().get('/websites');
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Network error' };
    }
  },
  add: async (data) => {
    try {
      const response = await createAuthAxios().post('/websites', data);
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Network error' };
    }
  },
  update: async (id, data) => {
    try {
      const response = await createAuthAxios().put(`/websites/${id}`, data);
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Network error' };
    }
  },
  delete: async (id) => {
    try {
      const response = await createAuthAxios().delete(`/websites/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Network error' };
    }
  },
  checkNow: async (id) => {
    try {
      const response = await createAuthAxios().post(`/websites/${id}/check`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Network error' };
    }
  }
};

// Notifications API
export const notificationsAPI = {
  getAll: async (params) => {
    try {
      const response = await createAuthAxios().get('/notifications', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Network error' };
    }
  },
  getUnreadCount: async () => {
    try {
      const response = await createAuthAxios().get('/notifications/unread-count');
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Network error' };
    }
  },
  markAsRead: async (id) => {
    try {
      const response = await createAuthAxios().put(`/notifications/${id}/read`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Network error' };
    }
  },
  markAllAsRead: async () => {
    try {
      const response = await createAuthAxios().put('/notifications/read-all');
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Network error' };
    }
  },
  delete: async (id) => {
    try {
      const response = await createAuthAxios().delete(`/notifications/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Network error' };
    }
  },
  clearAll: async () => {
    try {
      const response = await createAuthAxios().delete('/notifications');
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Network error' };
    }
  }
};

// Analyzer API (public)
export const analyzeWebsite = async (url) => {
  try {
    const response = await api.post('/analyzer/analyze', { url });
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, error: 'Network error' };
  }
};

export const checkSSL = async (url) => {
  try {
    const response = await api.post('/analyzer/ssl', { url });
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, error: 'Network error' };
  }
};

export const checkPerformance = async (url) => {
  try {
    const response = await api.post('/analyzer/performance', { url });
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, error: 'Network error' };
  }
};

// Helper to set auth token
export const setAuthToken = (token) => {
  if (token) {
    localStorage.setItem('token', token);
  } else {
    localStorage.removeItem('token');
  }
};

// Helper to get stored token
export const getAuthToken = () => localStorage.getItem('token');

export default api;
