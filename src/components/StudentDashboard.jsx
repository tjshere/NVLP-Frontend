import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Moon, Volume2, Film, Loader2, Check, AlertCircle, Lightbulb, PlayCircle, CheckCircle, User, Type, BookOpen, TextIcon } from 'lucide-react';
import { useSensory } from '../context/SensoryContext';
import { ProfileSummarySkeleton, CourseListSkeleton } from './Skeleton';
import SmartText from './SmartText';
import TaskBreaker from './TaskBreaker';
import FocusEngine from './FocusEngine';
import ProgressInsights from './ProgressInsights';
import api from '../api';

// --- COMPONENT 1: SENSORY PANEL (Refactored - Stateless with Context) ---
const SensoryPanel = () => {
  const { 
    darkMode, 
    lowAudio, 
    reduceAnimations,
    dyslexicFont,
    bionicReading,
    fontSize,
    savingStatus, 
    updatePreference 
  } = useSensory();
  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm transition-colors duration-300">
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-bold text-gray-800 dark:text-gray-100 transition-colors duration-300">
          Sensory Controls
        </h2>
        {/* Saving Status Indicator */}
        {savingStatus === 'saving' && (
          <div className="flex items-center gap-1 text-blue-600 dark:text-blue-400 text-xs">
            <Loader2 size={14} className={reduceAnimations ? '' : 'animate-spin'} />
            <span>Saving...</span>
          </div>
        )}
        {savingStatus === 'saved' && (
          <div className={`flex items-center gap-1 text-green-600 dark:text-green-400 text-xs ${reduceAnimations ? '' : 'animate-fade-in'}`}>
            <Check size={14} />
            <span>Saved</span>
          </div>
        )}
        {savingStatus === 'error' && (
          <div className="flex items-center gap-1 text-red-600 dark:text-red-400 text-xs">
            <AlertCircle size={14} />
            <span>Error</span>
          </div>
        )}
      </div>
      
      <div className="flex flex-wrap gap-2">
        {/* Dark Mode Toggle */}
        <button 
          onClick={() => updatePreference('dark_mode', !darkMode)}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors duration-300 ${
            darkMode 
              ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-700' 
              : 'bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-600'
          }`}
        >
          <Moon size={16} />
          <span className="text-sm font-medium">Dark Mode</span>
        </button>

        {/* Audio Toggle */}
        <button 
          onClick={() => updatePreference('low_audio', !lowAudio)}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors duration-300 ${
            lowAudio 
              ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-700' 
              : 'bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-600'
          }`}
        >
          <Volume2 size={16} />
          <span className="text-sm font-medium">Low Audio</span>
        </button>

        {/* Animation Toggle */}
        <button 
          onClick={() => updatePreference('reduce_animations', !reduceAnimations)}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors duration-300 ${
            reduceAnimations 
              ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-700' 
              : 'bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-600'
          }`}
        >
          <Film size={16} />
          <span className="text-sm font-medium">Reduce Motion</span>
        </button>
        
        {/* Dyslexic Font Toggle */}
        <button 
          onClick={() => updatePreference('dyslexic_font', !dyslexicFont)}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors duration-300 ${
            dyslexicFont 
              ? 'bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-700' 
              : 'bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-600'
          }`}
        >
          <Type size={16} />
          <span className="text-sm font-medium">Dyslexic Font</span>
        </button>
        
        {/* Bionic Reading Toggle */}
        <button 
          onClick={() => updatePreference('bionic_reading', !bionicReading)}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors duration-300 ${
            bionicReading 
              ? 'bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-700' 
              : 'bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-600'
          }`}
        >
          <BookOpen size={16} />
          <span className="text-sm font-medium">Bionic Reading</span>
        </button>
        
        {/* Font Size Selector */}
        <div className="flex items-center gap-1 px-2 py-1 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 transition-colors duration-300">
          <TextIcon size={14} className="text-gray-500 dark:text-gray-400" />
          <button
            onClick={() => updatePreference('font_size', 'small')}
            className={`px-2 py-1 rounded text-xs font-medium transition-colors duration-300 ${
              fontSize === 'small'
                ? 'bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            A
          </button>
          <button
            onClick={() => updatePreference('font_size', 'medium')}
            className={`px-2 py-1 rounded text-sm font-medium transition-colors duration-300 ${
              fontSize === 'medium'
                ? 'bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            A
          </button>
          <button
            onClick={() => updatePreference('font_size', 'large')}
            className={`px-2 py-1 rounded text-base font-medium transition-colors duration-300 ${
              fontSize === 'large'
                ? 'bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            A
          </button>
        </div>
      </div>
      
      {/* Helper Text for Low Audio */}
      {lowAudio && (
        <div className="mt-3 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800 transition-all duration-300">
          <p className="text-xs text-blue-700 dark:text-blue-300 flex items-center gap-1">
            <Volume2 size={12} />
            <SmartText>Audio is now capped at a comfortable level.</SmartText>
          </p>
        </div>
      )}
      
      {/* Helper Text for Bionic Reading */}
      {bionicReading && (
        <div className="mt-3 p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800 transition-all duration-300">
          <p className="text-xs text-purple-700 dark:text-purple-300 flex items-center gap-1">
            <BookOpen size={12} />
            <SmartText>Bionic Reading mode active - words are partially bolded for faster reading.</SmartText>
          </p>
        </div>
      )}
    </div>
  );
};

// --- COMPONENT 2: PROFILE SUMMARY ---
const ProfileSummary = ({ user }) => {
  // Robust avatar initial extraction with fallback
  const getAvatarContent = () => {
    if (user?.username && typeof user.username === 'string' && user.username.length > 0) {
      return user.username.charAt(0).toUpperCase();
    }
    return <User size={20} />;
  };

  return (
    <div className="bg-white dark:bg-gray-800 shadow rounded-xl p-5 transition-colors duration-300">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
          {getAvatarContent()}
        </div>
        <div>
          <h3 className="font-bold text-gray-800 dark:text-gray-100 transition-colors duration-300">
            {user?.username || 'Student'}
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 transition-colors duration-300">
            {user?.email || 'student@nvlp.edu'}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2 pt-2 border-t border-gray-200 dark:border-gray-700">
        <span className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2 py-1 rounded-md text-xs font-medium flex items-center gap-1 transition-colors duration-300">
          <CheckCircle size={12} />
          Student
        </span>
        {user?.is_active && (
          <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 px-2 py-1 rounded-md text-xs font-medium transition-colors duration-300">
            Active
          </span>
        )}
      </div>
    </div>
  );
};

// --- COMPONENT 3: SMART TAGS (Built-in) ---
const SmartTags = ({ tags = [] }) => {
  return (
    <div className="bg-white dark:bg-gray-800 shadow rounded-xl p-5 transition-colors duration-300">
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="w-5 h-5 text-purple-600 dark:text-purple-400 transition-colors duration-300" />
        <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100 transition-colors duration-300">
          AI Personalization Active
        </h2>
      </div>

      {tags.length === 0 ? (
        <p className="text-gray-400 dark:text-gray-500 text-sm transition-colors duration-300">
          No active AI filters.
        </p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {tags.map((tag, index) => (
            <span 
              key={index} 
              className="bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 px-3 py-1 rounded-full text-sm font-medium border border-purple-200 dark:border-purple-700 transition-colors duration-300"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

// --- MAIN DASHBOARD ---
const LearningPath = ({ courses, isLoading }) => {
  const navigate = useNavigate();
  
  // Show skeleton while loading
  if (isLoading) {
    return <CourseListSkeleton count={3} />;
  }

  const handleStartLesson = (courseId) => {
    navigate(`/lesson/${courseId}`);
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm transition-colors duration-300">
      <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4 transition-colors duration-300">
        <SmartText>Your Learning Path</SmartText>
      </h2>
      
      {courses && courses.length > 0 ? (
        <div className="space-y-3">
          {courses.map((course) => (
            <div 
              key={course.id} 
              className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-300"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center transition-colors duration-300">
                  <Lightbulb className="text-blue-600 dark:text-blue-400" size={20} />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 dark:text-gray-100 transition-colors duration-300">
                    <SmartText>{course.title}</SmartText>
                  </h3>
                  {course.description && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 transition-colors duration-300">
                      <SmartText>{course.description}</SmartText>
                    </p>
                  )}
                </div>
              </div>
              <button 
                onClick={() => handleStartLesson(course.id)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 dark:bg-blue-700 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 font-medium text-sm transition-colors duration-300"
              >
                <PlayCircle size={16} />
                <SmartText>Start Lesson</SmartText>
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-400 dark:text-gray-500 text-center py-8 transition-colors duration-300">
          <SmartText>No courses available yet.</SmartText>
        </p>
      )}
    </div>
  );
};

const StudentDashboard = ({ 
  user, 
  courses, 
  onLogout,
  isLoadingUser = false,
  isLoadingCourses = false,
}) => {
  const { darkMode } = useSensory();
  const studentName = user?.username || "Student";
  const [tasks, setTasks] = useState([]);
  const [isLoadingTasks, setIsLoadingTasks] = useState(true);

  // Load tasks for FocusEngine and TaskBreaker coordination
  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      setIsLoadingTasks(true);
      const tasksData = await api.getTasks();
      const tasksList = Array.isArray(tasksData) ? tasksData : (tasksData.results || []);
      setTasks(tasksList);
    } catch (error) {
      console.error('Failed to load tasks:', error);
    } finally {
      setIsLoadingTasks(false);
    }
  };

  // Callback to refresh tasks when TaskBreaker updates them
  const handleTasksChange = () => {
    loadTasks();
  };

  return (
    <div className={`min-h-screen flex flex-col p-6 transition-colors duration-300 ${
      darkMode ? 'bg-gray-900' : 'bg-gray-100'
    }`}>
      <header className="flex justify-between items-center bg-white dark:bg-gray-800 shadow-sm rounded-xl p-4 mb-6 transition-colors duration-300">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100 transition-colors duration-300">
          <SmartText>NVLP Student Dashboard</SmartText>
        </h1>
        <div className="flex items-center gap-4">
          <div className="text-lg text-gray-500 dark:text-gray-400 transition-colors duration-300">
            <SmartText>Welcome, {studentName}</SmartText>
          </div>
          {onLogout && (
            <button
              onClick={onLogout}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-300"
            >
              Logout
            </button>
          )}
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* LEFT SIDEBAR */}
        <div className="lg:col-span-1 flex flex-col gap-6">
           {isLoadingUser ? <ProfileSummarySkeleton /> : <ProfileSummary user={user} />}
           <SensoryPanel />
           <SmartTags tags={["Content Chunking", "Text-to-Speech", "Focus Mode"]} />
        </div>

        {/* MAIN CONTENT */}
        <div className="lg:col-span-3 flex flex-col gap-6">
           {/* Progress Insights - Dopamine Dashboard */}
           <ProgressInsights tasks={tasks} user={user} />
           
           {/* Focus Engine - Pomodoro Timer */}
           <FocusEngine tasks={tasks} />
           
           <LearningPath courses={courses} isLoading={isLoadingCourses} />
           
           {/* Task Breaker - Executive Function Toolkit */}
           <TaskBreaker onTasksChange={handleTasksChange} />
           
           <div className="bg-blue-600 dark:bg-blue-700 text-white p-6 rounded-xl shadow-lg flex items-center justify-between transition-colors duration-300">
              <div>
                <h2 className="text-xl font-bold"><SmartText>Ready to learn?</SmartText></h2>
                <p className="opacity-90"><SmartText>Resume your lesson where you left off.</SmartText></p>
              </div>
              <button className="bg-white dark:bg-gray-100 text-blue-600 dark:text-blue-700 px-6 py-2 rounded-full font-bold flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-200 transition-colors duration-300">
                <PlayCircle size={20} /> <SmartText>Start</SmartText>
              </button>
           </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
// Phase 7: Neuro-Inclusive Lesson Player with React Router integrated