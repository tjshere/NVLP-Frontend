import React, { useState, useEffect } from 'react';
import StudentDashboard from './components/StudentDashboard';
import api from './api';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [courses, setCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Login form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // Sensory preferences state (lifted from SensoryPanel)
  const [darkMode, setDarkMode] = useState(false);
  const [lowAudio, setLowAudio] = useState(false);
  const [reduceAnimations, setReduceAnimations] = useState(false);

  // Check authentication and fetch data on mount
  useEffect(() => {
    const initializeApp = async () => {
      if (api.isAuthenticated()) {
        try {
          setIsLoading(true);
          
          // Fetch user profile and courses in parallel
          const [userProfile, coursesData] = await Promise.all([
            api.getUserProfile(),
            api.getCourses(),
          ]);

          setUser(userProfile);
          setCourses(coursesData);
          setIsAuthenticated(true);

          // Initialize sensory preferences from user profile
          if (userProfile.preferences) {
            setDarkMode(userProfile.preferences.dark_mode || false);
            setLowAudio(userProfile.preferences.low_audio || false);
            setReduceAnimations(userProfile.preferences.reduce_animations || false);
          }
        } catch (err) {
          console.error('Failed to fetch data:', err);
          setError(err.message);
          // If fetch fails, logout (token might be invalid)
          api.logout();
          setIsAuthenticated(false);
        } finally {
          setIsLoading(false);
        }
      } else {
        setIsLoading(false);
      }
    };

    initializeApp();
  }, []);

  // Handle login submission
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    setIsLoading(true);

    try {
      await api.login(email, password);
      
      // Fetch user data after successful login
      const [userProfile, coursesData] = await Promise.all([
        api.getUserProfile(),
        api.getCourses(),
      ]);

      setUser(userProfile);
      setCourses(coursesData);
      setIsAuthenticated(true);

      // Initialize sensory preferences from user profile
      if (userProfile.preferences) {
        setDarkMode(userProfile.preferences.dark_mode || false);
        setLowAudio(userProfile.preferences.low_audio || false);
        setReduceAnimations(userProfile.preferences.reduce_animations || false);
      }

      setEmail('');
      setPassword('');
    } catch (err) {
      console.error('Login failed:', err);
      setLoginError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle logout
  const handleLogout = () => {
    api.logout();
    setIsAuthenticated(false);
    setUser(null);
    setCourses([]);
    // Reset sensory preferences
    setDarkMode(false);
    setLowAudio(false);
    setReduceAnimations(false);
  };

  // Handle sensory preference updates and persist to backend
  const handleSensoryUpdate = async (preference, value) => {
    // Store previous value for rollback on error
    let previousValue;
    
    // Optimistically update local state immediately for responsive UI
    switch (preference) {
      case 'dark_mode':
        previousValue = darkMode;
        setDarkMode(value);
        break;
      case 'low_audio':
        previousValue = lowAudio;
        setLowAudio(value);
        break;
      case 'reduce_animations':
        previousValue = reduceAnimations;
        setReduceAnimations(value);
        break;
      default:
        console.warn(`Unknown preference: ${preference}`);
        return;
    }

    try {
      // Persist to backend
      const updatedPreferences = {
        ...user.preferences,
        [preference]: value,
      };

      await api.patchUserProfile({ preferences: updatedPreferences });

      // Update local user object with new preferences
      setUser((prevUser) => ({
        ...prevUser,
        preferences: updatedPreferences,
      }));

      console.log(`✓ Saved ${preference} = ${value}`);
    } catch (err) {
      console.error(`Failed to update ${preference}:`, err);
      
      // Rollback state to previous value on error
      switch (preference) {
        case 'dark_mode':
          setDarkMode(previousValue);
          break;
        case 'low_audio':
          setLowAudio(previousValue);
          break;
        case 'reduce_animations':
          setReduceAnimations(previousValue);
          break;
      }
      
      // Optionally show error notification to user
      console.error(`⚠️ Failed to save ${preference}. Changes reverted.`);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Login screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
          <h1 className="text-3xl font-bold text-gray-800 mb-2 text-center">NVLP</h1>
          <p className="text-gray-600 text-center mb-8">Neurodivergent Virtual Learning Platform</p>
          
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                placeholder="Enter your email"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                placeholder="Enter your password"
              />
            </div>

            {loginError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {loginError}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Logging in...' : 'Login'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Dashboard screen (authenticated)
  return (
    <div className={darkMode ? 'dark' : ''}>
      <StudentDashboard 
        user={user} 
        courses={courses} 
        onLogout={handleLogout}
        darkMode={darkMode}
        lowAudio={lowAudio}
        reduceAnimations={reduceAnimations}
        onSensoryUpdate={handleSensoryUpdate}
      />
    </div>
  );
}

export default App;