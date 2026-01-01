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
    // Handle 204 No Content - set data to empty object
    if (response.status === 204) {
      response.data = {};
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Handle network errors (no response)
    if (!error.response) {
      const networkError = {
        message: error.message || 'Network error. Please check your connection.',
        status: 0,
        data: null,
      };
      return Promise.reject(networkError);
    }

    // Handle timeout errors
    if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
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
          const response = await axiosInstance.post('/auth/token/refresh/', {
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

    // Only format errors that have a response (actual HTTP errors)
    const formattedError = {
      message: error.response?.data?.message || 
               error.response?.data?.detail || 
               error.message || 
               'An unexpected error occurred',
      status: error.response?.status,
      data: error.response?.data,
      isNetworkError: false, // Has response, so not a network error
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

  // Get specific course details
  getCourse: async (courseId) => {
    const response = await axiosInstance.get(`/courses/${courseId}/`);
    return response.data;
  },

  // Lessons (mock endpoint - will use course content_metadata)
  getLesson: async (lessonId) => {
    // Extract course ID from lessonId (format: "lesson-{courseId}-1")
    const courseId = lessonId.split('-')[1] || '1';
    
    // Different mock lessons for different courses
    const lessons = {
      '1': {
        id: lessonId,
        title: 'Introduction to Python',
        videoUrl: 'https://www.youtube.com/watch?v=rfscVS0vtbw',
        videoId: 'rfscVS0vtbw',
        transcript: [
          { time: 0, text: 'Welcome to this lesson on Python programming fundamentals.' },
          { time: 5, text: 'Today we will explore variables, functions, and control flow in Python.' },
          { time: 12, text: 'Let\'s start with variables. In Python, you can create variables simply by assigning values.' },
          { time: 20, text: 'Python uses dynamic typing, so you don\'t need to declare variable types.' },
          { time: 30, text: 'Functions in Python are defined using the def keyword.' },
          { time: 38, text: 'Control flow in Python uses indentation instead of braces.' },
          { time: 48, text: 'Practice is key to mastering Python. Try writing code every day!' },
        ],
        content: `
# Introduction to Python

## What are Variables?

Variables in Python are dynamically typed. You can assign any value to a variable without declaring its type.

### Key Concepts:
- **Dynamic Typing**: No type declarations needed
- **Assignment**: Use = to assign values
- **Scope**: Variables are scoped to functions or modules

## Functions

Python functions are defined with the \`def\` keyword.

### Benefits:
- Code reusability
- Better organization
- Easier debugging

## Practice Exercise

Try creating a simple Python program that uses variables and functions to calculate the area of a rectangle.
        `.trim(),
        duration: 60,
        questions: [
          {
            question: 'How do you create a variable in Python?',
            options: [
              'You must declare the type first (e.g., int x = 5)',
              'Simply assign a value (e.g., x = 5)',
              'Use the var keyword (e.g., var x = 5)',
              'Variables are created automatically'
            ],
            correctAnswer: 1,
            successMessage: 'Correct! Python uses dynamic typing - just assign a value!',
            hint: 'In Python, you don\'t need to declare variable types. Just use the assignment operator =.'
          },
          {
            question: 'What keyword is used to define a function in Python?',
            options: [
              'function',
              'def',
              'func',
              'define'
            ],
            correctAnswer: 1,
            successMessage: 'Great! The def keyword is used to define functions in Python.',
            hint: 'Think about the keyword that comes before the function name in Python.'
          },
          {
            question: 'How does Python indicate code blocks?',
            options: [
              'Using curly braces { }',
              'Using square brackets [ ]',
              'Using indentation',
              'Using parentheses ( )'
            ],
            correctAnswer: 2,
            successMessage: 'Exactly! Python uses indentation to define code blocks, which makes code more readable.',
            hint: 'Python is known for its use of whitespace to structure code.'
          }
        ],
      },
      '2': {
        id: lessonId,
        title: 'Web Development Basics',
        videoUrl: 'https://www.youtube.com/watch?v=kUMe1FH4CHE',
        videoId: 'kUMe1FH4CHE',
        transcript: [
          { time: 0, text: 'Welcome to web development basics.' },
          { time: 5, text: 'Today we\'ll learn about HTML, CSS, and JavaScript.' },
          { time: 12, text: 'HTML provides the structure of a webpage.' },
          { time: 20, text: 'CSS is used to style and layout web pages.' },
          { time: 30, text: 'JavaScript adds interactivity to your websites.' },
          { time: 38, text: 'Together, these three technologies form the foundation of web development.' },
          { time: 48, text: 'Let\'s start building your first webpage!' },
        ],
        content: `
# Web Development Basics

## HTML - Structure

HTML (HyperText Markup Language) provides the structure of your webpage.

### Key Concepts:
- **Tags**: HTML elements are created with tags
- **Attributes**: Tags can have attributes
- **Semantic HTML**: Use meaningful tags

## CSS - Styling

CSS (Cascading Style Sheets) controls the appearance of your webpage.

### Benefits:
- Separation of concerns
- Consistent styling
- Responsive design

## JavaScript - Interactivity

JavaScript makes your webpage interactive and dynamic.
        `.trim(),
        duration: 60,
        questions: [
          {
            question: 'What does HTML stand for?',
            options: [
              'HyperText Markup Language',
              'High Tech Modern Language',
              'Home Tool Markup Language',
              'Hyperlink Text Markup Language'
            ],
            correctAnswer: 0,
            successMessage: 'Correct! HTML stands for HyperText Markup Language.',
            hint: 'HTML is the standard markup language for creating web pages.'
          },
          {
            question: 'What is the primary purpose of CSS?',
            options: [
              'To add interactivity to web pages',
              'To structure web page content',
              'To style and layout web pages',
              'To store data on the server'
            ],
            correctAnswer: 2,
            successMessage: 'Right! CSS is used to style and control the layout of web pages.',
            hint: 'CSS controls how HTML elements are displayed on screen.'
          }
        ],
      },
      '3': {
        id: lessonId,
        title: 'Data Structures & Algorithms',
        videoUrl: 'https://www.youtube.com/watch?v=RBSGKlAvoiM',
        videoId: 'RBSGKlAvoiM',
        transcript: [
          { time: 0, text: 'Welcome to data structures and algorithms.' },
          { time: 5, text: 'Today we\'ll explore fundamental data structures like arrays and linked lists.' },
          { time: 12, text: 'Data structures are ways of organizing and storing data.' },
          { time: 20, text: 'Algorithms are step-by-step procedures for solving problems.' },
          { time: 30, text: 'Understanding time and space complexity is crucial.' },
          { time: 38, text: 'We\'ll learn about Big O notation to analyze algorithm efficiency.' },
          { time: 48, text: 'Let\'s dive into arrays and their operations!' },
        ],
        content: `
# Data Structures & Algorithms

## What are Data Structures?

Data structures are ways of organizing and storing data in computer memory.

### Key Concepts:
- **Arrays**: Ordered collections of elements
- **Linked Lists**: Dynamic data structures
- **Trees**: Hierarchical data organization

## Algorithms

Algorithms are step-by-step procedures for solving problems.

### Benefits:
- Problem-solving skills
- Efficient code
- Better understanding of computer science

## Big O Notation

Big O notation describes the time and space complexity of algorithms.
        `.trim(),
        duration: 60,
        questions: [
          {
            question: 'What is a data structure?',
            options: [
              'A programming language',
              'A way of organizing and storing data',
              'A type of algorithm',
              'A computer hardware component'
            ],
            correctAnswer: 1,
            successMessage: 'Correct! Data structures are ways of organizing and storing data in computer memory.',
            hint: 'Data structures help organize information efficiently.'
          },
          {
            question: 'What does Big O notation describe?',
            options: [
              'The size of data structures',
              'The time and space complexity of algorithms',
              'The number of variables in a program',
              'The speed of a computer processor'
            ],
            correctAnswer: 1,
            successMessage: 'Exactly! Big O notation describes how algorithm performance scales with input size.',
            hint: 'Big O notation helps analyze algorithm efficiency.'
          }
        ],
      },
    };
    
    // Return lesson for course, or default to course 1
    return lessons[courseId] || lessons['1'];
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
      const response = await axiosInstance.get('/ef/timer/');
      // Response interceptor already handles response.data, so we use response.data directly
      const timersList = Array.isArray(response.data) ? response.data : (response.data?.results || []);
      
      if (timersList.length > 0) {
        return timersList[0]; // Return first timer
      }
      
      // Create default timer if none exists
      const newTimerResponse = await axiosInstance.post('/ef/timer/', {
        work_duration: 25,
        break_duration: 5,
        long_break_duration: 15,
        cycles_to_long_break: 4,
        current_status: 'idle',
        session_start_time: null,
      });
      // Response interceptor already handles response.data
      return newTimerResponse.data;
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

  // Progress Tracking (Insights)
  // Get all progress records for the authenticated user
  getProgress: async () => {
    const response = await axiosInstance.get('/progress/');
    return response.data;
  },

  // Create or update progress for a course
  updateProgress: async (courseId, data) => {
    // data shape: { completion_rate: number, engagement_time: duration }
    const response = await axiosInstance.post('/progress/', {
      course: courseId,
      ...data,
    });
    return response.data;
  },

  // Patch existing progress record
  patchProgress: async (progressId, data) => {
    const response = await axiosInstance.patch(`/progress/${progressId}/`, data);
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

    const response = await axiosInstance.post('/auth/token/refresh/', {
      refresh: refreshToken,
    });

    if (response.data.access) {
      localStorage.setItem(TOKEN_KEY, response.data.access);
    }

    return response.data;
  },
};

export default api;
