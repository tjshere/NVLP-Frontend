import React from 'react';
import { AiFillSound, AiOutlineBulb, AiOutlineCheckCircle } from "react-icons/ai";
import { FaPlayCircle } from "react-icons/fa";
import { Sparkles, Moon, Volume2, Film } from 'lucide-react';

// --- COMPONENT 1: SENSORY PANEL (Refactored - Stateless) ---
const SensoryPanel = ({ darkMode, lowAudio, reduceAnimations, onUpdate }) => {
  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm transition-colors duration-300">
      <h2 className="font-bold text-gray-800 dark:text-gray-100 mb-3 transition-colors duration-300">
        Sensory Controls
      </h2>
      <div className="flex flex-wrap gap-2">
        {/* Dark Mode Toggle */}
        <button 
          onClick={() => onUpdate('dark_mode', !darkMode)}
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
          onClick={() => onUpdate('low_audio', !lowAudio)}
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
          onClick={() => onUpdate('reduce_animations', !reduceAnimations)}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors duration-300 ${
            reduceAnimations 
              ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-700' 
              : 'bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-600'
          }`}
        >
          <Film size={16} />
          <span className="text-sm font-medium">Reduce Motion</span>
        </button>
      </div>
    </div>
  );
};

// --- COMPONENT 2: SMART TAGS (Built-in) ---
const SmartTags = ({ tags = [] }) => {
  return (
    <div className="bg-white dark:bg-gray-800 shadow rounded-xl p-5 transition-colors duration-300">
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="w-5 h-5 text-purple-600 dark:text-purple-400" />
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
const LearningPath = ({ courses }) => {
  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm transition-colors duration-300">
      <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4 transition-colors duration-300">
        Your Learning Path
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
                  <AiOutlineBulb className="text-blue-600 dark:text-blue-400 text-xl" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 dark:text-gray-100 transition-colors duration-300">
                    {course.title}
                  </h3>
                  {course.description && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 transition-colors duration-300">
                      {course.description}
                    </p>
                  )}
                </div>
              </div>
              <button className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium text-sm transition-colors duration-300">
                Continue →
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-400 dark:text-gray-500 text-center py-8 transition-colors duration-300">
          No courses available yet.
        </p>
      )}
    </div>
  );
};

const StudentDashboard = ({ 
  user, 
  courses, 
  onLogout, 
  darkMode, 
  lowAudio, 
  reduceAnimations, 
  onSensoryUpdate 
}) => {
  const studentName = user?.username || "Student";

  return (
    <div className={`min-h-screen flex flex-col p-6 transition-colors duration-300 ${
      darkMode ? 'bg-gray-900' : 'bg-gray-100'
    }`}>
      <header className="flex justify-between items-center bg-white dark:bg-gray-800 shadow-sm rounded-xl p-4 mb-6 transition-colors duration-300">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100 transition-colors duration-300">
          NVLP Student Dashboard
        </h1>
        <div className="flex items-center gap-4">
          <div className="text-lg text-gray-500 dark:text-gray-400 transition-colors duration-300">
            Welcome, {studentName}
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
           <SensoryPanel 
             darkMode={darkMode}
             lowAudio={lowAudio}
             reduceAnimations={reduceAnimations}
             onUpdate={onSensoryUpdate}
           />
           <SmartTags tags={["Content Chunking", "Text-to-Speech", "Focus Mode"]} />
        </div>

        {/* MAIN CONTENT */}
        <div className="lg:col-span-3 flex flex-col gap-6">
           <LearningPath courses={courses} />
           <div className="bg-blue-600 dark:bg-blue-700 text-white p-6 rounded-xl shadow-lg flex items-center justify-between transition-colors duration-300">
              <div>
                <h2 className="text-xl font-bold">Ready to learn?</h2>
                <p className="opacity-90">Resume your lesson where you left off.</p>
              </div>
              <button className="bg-white dark:bg-gray-100 text-blue-600 dark:text-blue-700 px-6 py-2 rounded-full font-bold flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-200 transition-colors duration-300">
                <FaPlayCircle /> Start
              </button>
           </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;