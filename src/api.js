// Central API service for handling all backend requests
const BASE_URL = 'http://localhost:8000/api';
const TOKEN_KEY = 'access_token';

// Helper function to get auth headers with JWT token
const getAuthHeaders = () => {
  const token = localStorage.getItem(TOKEN_KEY);
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

// Generic fetch wrapper with error handling
const apiFetch = async (endpoint, options = {}) => {
  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        ...getAuthHeaders(),
        ...options.headers,
      },
    });

    // Handle non-200 responses
    if (!response.ok) {
      // Handle 401 Unauthorized - remove invalid token
      if (response.status === 401) {
        localStorage.removeItem(TOKEN_KEY);
      }
      
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
    }

    // Handle 204 No Content or empty response body
    if (response.status === 204 || response.headers.get('content-length') === '0') {
      return {};
    }

    return await response.json();
  } catch (error) {
    console.error(`API Error [${endpoint}]:`, error);
    throw error;
  }
};

// API Methods
export const api = {
  // Authentication
  login: async (email, password) => {
    const response = await apiFetch('/auth/login/', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    
    // Store access token if login successful (Django Simple JWT)
    if (response.access) {
      localStorage.setItem(TOKEN_KEY, response.access);
    }
    
    return response;
  },

  logout: () => {
    localStorage.removeItem(TOKEN_KEY);
  },

  // User profile
  getUserProfile: async () => {
    return await apiFetch('/auth/profile/');
  },

  // Update user profile (PATCH)
  patchUserProfile: async (data) => {
    return await apiFetch('/auth/profile/', {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  // Courses
  getCourses: async () => {
    return await apiFetch('/courses/');
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    return !!localStorage.getItem(TOKEN_KEY);
  },
};

export default api;

