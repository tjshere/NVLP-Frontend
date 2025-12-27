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
  timeout: 5000, // 5 second timeout (reduced for faster failure detection)
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

    // Handle timeout errors specifically
    if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
      console.error('⏱️ Request timeout:', error);
      const timeoutError = {
        message: 'Request timeout. Please check your connection.',
        status: 0,
        data: null,
      };
      return Promise.reject(timeoutError);
    }

    // Handle 401 Unauthorized
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
      
      if (refreshToken) {
        try {
          console.log('🔄 Attempting token refresh...');
          // Attempt to refresh the access token with a timeout
          const response = await axios.post(`${BASE_URL}/auth/token/refresh/`, {
            refresh: refreshToken,
          }, { timeout: 5000 });

          const newAccessToken = response.data.access;
          
          // Store new access token
          localStorage.setItem(TOKEN_KEY, newAccessToken);
          console.log('✅ Token refreshed successfully');

          // Update authorization header and retry original request
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return axiosInstance(originalRequest);
        } catch (refreshError) {
          // Token refresh failed - clear tokens and logout
          console.error('❌ Token refresh failed:', refreshError);
          localStorage.removeItem(TOKEN_KEY);
          localStorage.removeItem(REFRESH_TOKEN_KEY);
          
          // Don't redirect here - let the app handle it
          // This prevents the interceptor from hanging the UI
          const authError = {
            message: 'Authentication failed. Please login again.',
            status: 401,
            data: null,
          };
          return Promise.reject(authError);
        }
      } else {
        // No refresh token available - clear access token
        console.warn('⚠️ No refresh token available');
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

  // Task Breaker (Executive Function Toolkit)
  // Get all tasks for the authenticated user
  getTasks: async () => {
    const response = await axiosInstance.get('/ef/tasks/');
    return response.data;
  },

  // Create a new task with steps
  createTask: async (taskData) => {
    // taskData shape: { main_task_title: string, steps: [{ step_description: string, order: number }] }
    const response = await axiosInstance.post('/ef/tasks/', taskData);
    return response.data;
  },

  // Update an entire task (including steps)
  updateTask: async (taskId, taskData) => {
    const response = await axiosInstance.put(`/ef/tasks/${taskId}/`, taskData);
    return response.data;
  },

  // Partially update a task (e.g., mark as complete)
  patchTask: async (taskId, partialData) => {
    const response = await axiosInstance.patch(`/ef/tasks/${taskId}/`, partialData);
    return response.data;
  },

  // Delete a task
  deleteTask: async (taskId) => {
    const response = await axiosInstance.delete(`/ef/tasks/${taskId}/`);
    return response.data;
  },

  // Update a specific step's completion status (uses custom backend endpoint)
  updateTaskStep: async (taskId, stepId, isComplete) => {
    const response = await axiosInstance.patch(`/ef/tasks/${taskId}/update_step/${stepId}/`, {
      is_step_complete: isComplete
    });
    return response.data;
  },

  // Pomodoro Timer (Focus Engine)
  // Get all timers for the authenticated user
  getTimers: async () => {
    const response = await axiosInstance.get('/ef/timer/');
    return response.data;
  },

  // Get or create the user's default timer
  getOrCreateTimer: async () => {
    try {
      const timers = await axiosInstance.get('/ef/timer/');
      const timersList = Array.isArray(timers.data) ? timers.data : (timers.data.results || []);
      
      if (timersList.length > 0) {
        return timersList[0]; // Return first timer
      }
      
      // Create default timer if none exists
      const newTimer = await axiosInstance.post('/ef/timer/', {
        work_duration: 25,
        break_duration: 5,
        long_break_duration: 15,
        cycles_to_long_break: 4,
        current_status: 'idle',
        session_start_time: null,
      });
      return newTimer.data;
    } catch (error) {
      console.error('Failed to get or create timer:', error);
      throw error;
    }
  },

  // Update timer settings
  updateTimer: async (timerId, data) => {
    const response = await axiosInstance.patch(`/ef/timer/${timerId}/`, data);
    return response.data;
  },

  // Delete a timer
  deleteTimer: async (timerId) => {
    const response = await axiosInstance.delete(`/ef/timer/${timerId}/`);
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
