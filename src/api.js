import axios from 'axios';

// Central API service for handling all backend requests with Axios
// Use environment variable for API base URL, fallback to localhost for development
const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';
const TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';

// Create Axios instance with default configuration
const axiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 second timeout
});

// Request interceptor: automatically attach Authorization header if token exists
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor: handle 401 and attempt token refresh
axiosInstance.interceptors.response.use(
  (response) => {
    // Handle 204 No Content - return empty object
    if (response.status === 204) {
      return { data: {} };
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 Unauthorized
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
      
      if (refreshToken) {
        try {
          // Attempt to refresh the access token
          const response = await axios.post(`${BASE_URL}/auth/token/refresh/`, {
            refresh: refreshToken,
          });

          const newAccessToken = response.data.access;
          
          // Store new access token
          localStorage.setItem(TOKEN_KEY, newAccessToken);

          // Update authorization header and retry original request
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return axiosInstance(originalRequest);
        } catch (refreshError) {
          // Token refresh failed - clear tokens and logout
          console.error('Token refresh failed:', refreshError);
          localStorage.removeItem(TOKEN_KEY);
          localStorage.removeItem(REFRESH_TOKEN_KEY);
          
          // Redirect to login or trigger logout
          window.location.href = '/';
          
          return Promise.reject(refreshError);
        }
      } else {
        // No refresh token available - clear access token
        localStorage.removeItem(TOKEN_KEY);
      }
    }

    // Format error for consistent handling
    const formattedError = {
      message: error.response?.data?.message || 
               error.response?.data?.detail || 
               error.message || 
               'An unexpected error occurred',
      status: error.response?.status,
      data: error.response?.data,
    };

    return Promise.reject(formattedError);
  }
);

// API Methods
export const api = {
  // Authentication
  login: async (email, password) => {
    const response = await axiosInstance.post('/auth/login/', { email, password });
    
    // Store access and refresh tokens if login successful (Django Simple JWT)
    if (response.data.access) {
      localStorage.setItem(TOKEN_KEY, response.data.access);
    }
    if (response.data.refresh) {
      localStorage.setItem(REFRESH_TOKEN_KEY, response.data.refresh);
    }
    
    return response.data;
  },

  logout: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  },

  // User profile
  getUserProfile: async () => {
    const response = await axiosInstance.get('/auth/profile/');
    return response.data;
  },

  // Update user profile (PATCH)
  patchUserProfile: async (data) => {
    const response = await axiosInstance.patch('/auth/profile/', data);
    return response.data;
  },

  // Courses
  getCourses: async () => {
    const response = await axiosInstance.get('/courses/');
    return response.data;
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    return !!localStorage.getItem(TOKEN_KEY);
  },

  // Refresh access token
  refreshToken: async () => {
    const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await axios.post(`${BASE_URL}/auth/token/refresh/`, {
      refresh: refreshToken,
    });

    if (response.data.access) {
      localStorage.setItem(TOKEN_KEY, response.data.access);
    }

    return response.data;
  },
};

export default api;
