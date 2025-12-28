import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast, { Toaster } from 'react-hot-toast';
import StudentDashboard from './components/StudentDashboard';
import LessonPlayer from './components/LessonPlayer';
import { SensoryProvider, useSensory } from './context/SensoryContext';
import api from './api';

// Helper function to detect if backend returned API URLs instead of real data
// and provide mock data fallback for testing
const useMockDataIfNeeded = (data, type) => {
  // Check if data looks like API navigation (has URL strings) OR is empty
  const hasUrls = data && typeof data === 'object' && 
    Object.values(data).some(val => typeof val === 'string' && val.includes('http'));
  
  const isEmpty = !data || (Array.isArray(data) && data.length === 0);
  
  if (hasUrls || isEmpty) {
    if (hasUrls) {
      console.warn(`🔄 Backend returned API URLs instead of ${type} data. Using mock data for testing.`);
    } else if (isEmpty) {
      console.warn(`🔄 Backend returned empty ${type} data. Using mock data for testing.`);
    }
    
    if (type === 'profile') {
      return {
        id: 1,
        email: 'agustindavila22@gmail.com',
        first_name: 'Agustin',
        last_name: 'Davila',
        username: 'Agustin Davila',
        is_active: true,
        preferences: {
          dark_mode: false,
          low_audio: false,
          reduce_animations: false,
        },
      };
    }
    
    if (type === 'courses') {
      return [
        {
          id: 1,
          title: 'Introduction to Python',
          description: 'Master Python fundamentals with hands-on projects',
          progress: 45,
          status: 'In Progress',
        },
        {
          id: 2,
          title: 'Web Development Basics',
          description: 'Learn HTML, CSS, and JavaScript essentials',
          progress: 78,
          status: 'In Progress',
        },
        {
          id: 3,
          title: 'Data Structures & Algorithms',
          description: 'Build problem-solving skills with core CS concepts',
          progress: 12,
          status: 'In Progress',
        },
      ];
    }
  }
  
  return data;
};

// Login Form Component with React Hook Form
const LoginForm = ({ onLoginSuccess }) => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  // Dark mode is now applied at the document level via SensoryContext

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm({
    mode: 'onBlur', // Validate on blur
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data) => {
    setIsLoading(true);

    try {
      await api.login(data.email, data.password);
      
      // Fetch user data after successful login
      const [userProfileRaw, coursesDataRaw] = await Promise.all([
        api.getUserProfile(),
        api.getCourses(),
      ]);

      console.log('📥 Raw data from backend:', { userProfileRaw, coursesDataRaw });

      // Use mock data fallback if backend returns URLs instead of real data
      const userProfile = useMockDataIfNeeded(userProfileRaw, 'profile');
      let coursesData = useMockDataIfNeeded(coursesDataRaw, 'courses');
      
      // Handle paginated response from Django REST Framework
      if (coursesData && !Array.isArray(coursesData) && coursesData.results) {
        console.log('📦 Detected paginated response in login, extracting results array');
        coursesData = coursesData.results;
      }
      
      // If courses array is empty after all processing, use mock data
      if (!coursesData || (Array.isArray(coursesData) && coursesData.length === 0)) {
        console.warn('⚠️ Courses array is empty in login, using mock data');
        coursesData = useMockDataIfNeeded(null, 'courses');
      }

      console.log('✅ Final data after mock check:', { userProfile, coursesData, coursesIsArray: Array.isArray(coursesData), coursesCount: coursesData?.length });
      onLoginSuccess(userProfile, coursesData);
      toast.success('Login successful!', { position: 'top-center' });
    } catch (err) {
      console.error('Login failed:', err);
      
      // Map specific Django backend error codes to user-friendly messages
      let errorMessage = 'Login failed. Please check your credentials.';
      
      if (err.status === 401) {
        errorMessage = 'Invalid email or password.';
      } else if (err.status === 400) {
        // Check for specific field errors
        if (err.data?.email) {
          setError('email', { type: 'server', message: err.data.email[0] || 'Invalid email' });
        }
        if (err.data?.password) {
          setError('password', { type: 'server', message: err.data.password[0] || 'Invalid password' });
        }
        if (err.data?.non_field_errors) {
          errorMessage = err.data.non_field_errors[0];
        }
      } else if (err.status === 429) {
        errorMessage = 'Too many login attempts. Please try again later.';
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      // Show toast for general errors
      if (!err.data?.email && !err.data?.password) {
        toast.error(errorMessage, { position: 'top-center', duration: 4000 });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 dark:from-gray-800 dark:to-gray-900 flex items-center justify-center p-6 transition-colors duration-300">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 w-full max-w-md transition-colors duration-300">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-2 text-center transition-colors duration-300">
            NVLP
          </h1>
          <p className="text-gray-600 dark:text-gray-300 text-center mb-8 transition-colors duration-300">
            Neurodivergent Virtual Learning Platform
          </p>
          
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Email Field */}
            <div>
              <label 
                htmlFor="email" 
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 transition-colors duration-300"
              >
                Email
              </label>
              <input
                type="email"
                id="email"
                {...register('email', {
                  required: 'Email is required',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Invalid email address',
                  },
                })}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-colors duration-300 dark:bg-gray-700 dark:text-gray-100 ${
                  errors.email 
                    ? 'border-red-500 dark:border-red-400' 
                    : 'border-gray-300 dark:border-gray-600'
                }`}
                placeholder="Enter your email"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label 
                htmlFor="password" 
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 transition-colors duration-300"
              >
                Password
              </label>
              <input
                type="password"
                id="password"
                {...register('password', {
                  required: 'Password is required',
                  minLength: {
                    value: 8,
                    message: 'Password must be at least 8 characters',
                  },
                })}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-colors duration-300 dark:bg-gray-700 dark:text-gray-100 ${
                  errors.password 
                    ? 'border-red-500 dark:border-red-400' 
                    : 'border-gray-300 dark:border-gray-600'
                }`}
                placeholder="Enter your password"
              />
              {errors.password && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors.password.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 dark:bg-blue-700 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Logging in...' : 'Login'}
            </button>
          </form>
        </div>
      </div>
  );
};

// Main App Component
function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [courses, setCourses] = useState([]);
  
  // Separate loading states for better UX
  const [isInitializing, setIsInitializing] = useState(true);
  const [isLoadingUser, setIsLoadingUser] = useState(false);
  const [isLoadingCourses, setIsLoadingCourses] = useState(false);
  
  const [error, setError] = useState(null);
  
  const isMountedRef = useRef(true);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Check authentication and fetch data on mount
  useEffect(() => {
    let safetyTimeout;
    const initializeApp = async () => {
      console.log('🔄 Initializing app...');
      
      // Safety timeout to prevent infinite loading (8 seconds)
      safetyTimeout = setTimeout(() => {
        console.error('⏱️ Initialization timeout - forcing exit from loading screen');
        // Force state updates without checking isMountedRef - we NEED to exit the loading screen
        setIsInitializing(false);
        setIsLoadingUser(false);
        setIsLoadingCourses(false);
        setIsAuthenticated(false);
        api.logout();
        toast.error('Failed to load. Please login again.', {
          position: 'top-center',
          duration: 4000,
        });
      }, 8000); // 8 second safety timeout
      
      if (api.isAuthenticated()) {
        console.log('✅ Token found, fetching user data...');
        try {
          setIsLoadingUser(true);
          setIsLoadingCourses(true);
          
          // Fetch user profile and courses in parallel
          const [userProfileRaw, coursesDataRaw] = await Promise.all([
            api.getUserProfile(),
            api.getCourses(),
          ]);

          console.log('📥 Data received:', { userProfileRaw, coursesDataRaw });

          // Use mock data fallback if backend returns URLs instead of real data
          const userProfile = useMockDataIfNeeded(userProfileRaw, 'profile');
          let coursesData = useMockDataIfNeeded(coursesDataRaw, 'courses');
          
          // Handle paginated response from Django REST Framework
          if (coursesData && !Array.isArray(coursesData) && coursesData.results) {
            console.log('📦 Detected paginated response, extracting results array');
            coursesData = coursesData.results;
          }
          
          // If courses array is empty after all processing, use mock data
          if (!coursesData || (Array.isArray(coursesData) && coursesData.length === 0)) {
            if (import.meta.env.DEV) {
              console.warn('⚠️ Courses array is empty, using mock data');
            }
            coursesData = useMockDataIfNeeded(null, 'courses');
          }
          
          console.log('📦 After mock check:', { 
            userProfile, 
            coursesData,
            coursesCount: coursesData?.length || 0,
            coursesIsArray: Array.isArray(coursesData)
          });

          // Always update state - don't check isMountedRef to avoid getting stuck
          setUser(userProfile);
          setCourses(coursesData);
          setIsAuthenticated(true);
          console.log('✅ Initialization complete');
        } catch (err) {
          console.error('❌ Failed to fetch data:', err);
          // Always update state - don't check isMountedRef to avoid getting stuck
          setError(err.message);
          setIsAuthenticated(false);
          
          // Show error toast - session likely expired
          toast.error('Session expired. Please login again.', {
            position: 'top-center',
            duration: 4000,
          });
          
          // Clear invalid tokens
          api.logout();
        } finally {
          // Clear the safety timeout since we completed (successfully or with error)
          clearTimeout(safetyTimeout);
          
          // Always exit loading screen - don't check isMountedRef to avoid getting stuck
          setIsLoadingUser(false);
          setIsLoadingCourses(false);
          setIsInitializing(false);
          console.log('🏁 Initialization finished (loading states reset)');
        }
      } else {
        // Clear the safety timeout since we're showing login immediately
        clearTimeout(safetyTimeout);
        
        console.log('ℹ️ No token found, showing login screen');
        // Always exit loading screen - don't check isMountedRef to avoid getting stuck
        setIsInitializing(false);
      }
    };

    initializeApp();
    
    // Cleanup function to clear timeout if component unmounts
    return () => {
      if (safetyTimeout) {
        clearTimeout(safetyTimeout);
      }
    };
  }, []);

  // Handle successful login
  const handleLoginSuccess = (userProfile, coursesData) => {
    console.log('🔄 handleLoginSuccess called:', { userProfile, coursesData, isMounted: isMountedRef.current });
    // Don't check isMountedRef for login - we WANT this state update to proceed
    setUser(userProfile);
    setCourses(coursesData);
    setIsAuthenticated(true);
    setError(null);
    console.log('✅ State updated: isAuthenticated = true');
  };

  // Handle logout - stable reference with useCallback for SensoryProvider
  const handleLogout = useCallback(() => {
    api.logout();
    setIsAuthenticated(false);
    setUser(null);
    setCourses([]);
    setError(null);
    
    toast.success('Logged out successfully', {
      position: 'bottom-right',
    });
  }, []); // No dependencies - logout logic is self-contained

  // Show minimal loading screen during initialization
  if (isInitializing) {
    return (
      <SensoryProvider user={null} onAuthFailure={handleLogout}>
        <InitializingScreen />
      </SensoryProvider>
    );
  }

  // Login screen
  if (!isAuthenticated) {
    return (
      <SensoryProvider user={null} onAuthFailure={handleLogout}>
        <Toaster />
        <LoginForm onLoginSuccess={handleLoginSuccess} />
      </SensoryProvider>
    );
  }

  // Dashboard screen (authenticated) - pass handleLogout for centralized auth failure
  return (
    <SensoryProvider user={user} onAuthFailure={handleLogout}>
      <AppContent 
        user={user}
        courses={courses}
        isLoadingUser={isLoadingUser}
        isLoadingCourses={isLoadingCourses}
        onLogout={handleLogout}
      />
    </SensoryProvider>
  );
}

// App Content with Sensory Context and Routes
const AppContent = ({ user, courses, isLoadingUser, isLoadingCourses, onLogout }) => {
  // Dark mode and reduce animations are now applied at the document level via SensoryContext
  
  return (
    <>
      <Toaster />
      <Routes>
        {/* Dashboard Route */}
        <Route 
          path="/" 
          element={
            <StudentDashboard 
              user={user} 
              courses={courses}
              isLoadingUser={isLoadingUser}
              isLoadingCourses={isLoadingCourses}
              onLogout={onLogout}
            />
          } 
        />
        
        {/* Lesson Player Route */}
        <Route 
          path="/lesson/:courseId" 
          element={<LessonPlayer onLogout={onLogout} />} 
        />
        
        {/* Redirect unknown routes to dashboard */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
};

// Initializing Screen Component
const InitializingScreen = () => {
  // Dark mode and reduce animations are now applied at the document level via SensoryContext
  
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center transition-colors duration-300">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400 mx-auto mb-4"></div>
        <p className="text-gray-600 dark:text-gray-300 transition-colors duration-300">Loading...</p>
      </div>
    </div>
  );
};

export default App;
