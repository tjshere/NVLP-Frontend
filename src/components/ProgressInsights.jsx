import React, { useState, useEffect } from 'react';
import { TrendingUp, Target, Flame, Zap, Award, BarChart3, Loader2 } from 'lucide-react';
import api from '../api';
import { useSensory } from '../context/SensoryContext';
import SmartText from './SmartText';

/**
 * ProgressInsights Component - Dopamine Dashboard
 * 
 * Features:
 * - "Wins" Card showing completed tasks/steps
 * - Focus Streak tracking consecutive days with focus sessions
 * - Focus Minutes calculation from Pomodoro sessions
 * - AI-Driven Affirmation placeholder (tailored to NeuroProfile)
 * - Sensory-friendly charts (static bars if reduce_animations, high contrast if darkMode)
 * - Real-time data aggregation from tasks and progress records
 */
const ProgressInsights = ({ tasks = [], user }) => {
  const { reduceAnimations, darkMode } = useSensory();
  
  // Stats state
  const [tasksSmashed, setTasksSmashed] = useState(0);
  const [focusMinutes, setFocusMinutes] = useState(0);
  const [focusStreak, setFocusStreak] = useState(0);
  const [weeklyWins, setWeeklyWins] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Calculate statistics
  useEffect(() => {
    calculateStats();
  }, [tasks]);
  
  const calculateStats = async () => {
    try {
      setIsLoading(true);
      
      // Calculate Tasks Smashed (completed steps)
      let completedSteps = 0;
      tasks.forEach(task => {
        completedSteps += task.steps.filter(step => step.is_step_complete).length;
      });
      setTasksSmashed(completedSteps);
      
      // Fetch progress data for engagement time
      const progressData = await api.getProgress();
      const progressList = Array.isArray(progressData) ? progressData : (progressData.results || []);
      
      // Calculate total focus minutes from engagement_time (backend)
      let totalMinutes = 0;
      progressList.forEach(progress => {
        if (progress.engagement_time) {
          // engagement_time is in format "HH:MM:SS" or duration seconds
          totalMinutes += parseDuration(progress.engagement_time);
        }
      });
      
      // Add focus minutes from localStorage (tracked by FocusEngine)
      const storedMinutes = parseInt(localStorage.getItem('total_focus_minutes') || '0');
      totalMinutes += storedMinutes;
      setFocusMinutes(totalMinutes);
      
      // Calculate focus streak from localStorage
      const focusDates = JSON.parse(localStorage.getItem('focus_dates') || '[]');
      setFocusStreak(calculateStreakFromDates(focusDates));
      
      // Calculate weekly wins (last 7 days)
      setWeeklyWins(calculateWeeklyWins(tasks));
      
    } catch (error) {
      console.error('Failed to calculate stats:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const parseDuration = (duration) => {
    // Parse Django DurationField format (can be "HH:MM:SS" or seconds)
    if (typeof duration === 'string') {
      const parts = duration.split(':');
      if (parts.length === 3) {
        const hours = parseInt(parts[0]);
        const minutes = parseInt(parts[1]);
        return hours * 60 + minutes;
      }
    }
    return 0;
  };
  
  const calculateStreakFromDates = (focusDates) => {
    // Calculate consecutive days streak from array of date strings
    if (focusDates.length === 0) return 0;
    
    // Sort dates in descending order (most recent first)
    const sortedDates = focusDates
      .map(dateStr => new Date(dateStr))
      .sort((a, b) => b - a);
    
    // Check for consecutive days starting from today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    let streak = 0;
    let checkDate = new Date(today);
    
    for (let i = 0; i < sortedDates.length; i++) {
      const focusDate = new Date(sortedDates[i]);
      focusDate.setHours(0, 0, 0, 0);
      
      if (focusDate.getTime() === checkDate.getTime()) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1); // Check previous day
      } else {
        break; // Streak broken
      }
    }
    
    return streak;
  };
  
  const calculateWeeklyWins = (tasks) => {
    // Calculate completed steps for each day of the week
    // For now, return a simple pattern (would need timestamp data for real tracking)
    const today = new Date().getDay();
    const wins = [0, 0, 0, 0, 0, 0, 0];
    
    // Distribute completed tasks across the week (mock for now)
    const completedTasks = tasks.filter(t => t.is_complete).length;
    for (let i = 0; i <= today && i < 7; i++) {
      wins[i] = Math.floor(Math.random() * (completedTasks + 1));
    }
    
    return wins;
  };
  
  const getAffirmation = () => {
    // AI-Driven Affirmation tailored to NeuroProfile
    const efNeeds = user?.neuro_profile?.ef_needs || 'moderate';
    
    const affirmations = {
      high: [
        "🎯 Every small step counts! You've made real progress today.",
        "💪 Breaking tasks into chunks is your superpower!",
        "✨ You're building momentum, one step at a time.",
      ],
      moderate: [
        "🚀 Great work staying focused! Your effort shows.",
        "🌟 You're making steady progress - keep it up!",
        "🎉 Your dedication is paying off!",
      ],
      low: [
        "💎 Excellent execution! You're crushing your goals.",
        "🔥 Your focus and drive are impressive!",
        "⚡ Outstanding progress this week!",
      ],
    };
    
    const messages = affirmations[efNeeds] || affirmations.moderate;
    return messages[Math.floor(Math.random() * messages.length)];
  };
  
  const getChartColors = () => {
    if (darkMode) {
      return {
        primary: 'bg-purple-500',
        secondary: 'bg-emerald-500',
        text: 'text-purple-400',
      };
    }
    return {
      primary: 'bg-indigo-500',
      secondary: 'bg-blue-500',
      text: 'text-indigo-600',
    };
  };
  
  const colors = getChartColors();
  const maxWins = Math.max(...weeklyWins, 1);
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm transition-colors duration-300">
        <div className="flex items-center justify-center py-8">
          <Loader2 size={32} className={`text-indigo-600 dark:text-indigo-400 ${reduceAnimations ? '' : 'animate-spin'}`} />
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      {/* Header with Affirmation */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 dark:from-purple-800 dark:to-indigo-800 p-6 rounded-xl shadow-lg transition-colors duration-300">
        <div className="flex items-center gap-3 mb-2">
          <TrendingUp className="text-white" size={28} />
          <h2 className="text-2xl font-bold text-white">
            <SmartText>Your Progress</SmartText>
          </h2>
        </div>
        <p className="text-white/90 text-lg">
          <SmartText>{getAffirmation()}</SmartText>
        </p>
      </div>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Tasks Smashed Card */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm transition-colors duration-300 border-l-4 border-purple-500">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Target className={`${colors.text} dark:text-purple-400`} size={24} />
              <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400">
                <SmartText>Tasks Smashed</SmartText>
              </h3>
            </div>
            <Award className="text-yellow-500" size={20} />
          </div>
          <div className={`text-4xl font-bold ${colors.text} dark:text-purple-400`}>
            {tasksSmashed}
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            <SmartText>Completed steps</SmartText>
          </p>
        </div>
        
        {/* Focus Minutes Card */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm transition-colors duration-300 border-l-4 border-emerald-500">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Zap className="text-emerald-600 dark:text-emerald-400" size={24} />
              <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400">
                <SmartText>Focus Minutes</SmartText>
              </h3>
            </div>
          </div>
          <div className="text-4xl font-bold text-emerald-600 dark:text-emerald-400">
            {focusMinutes}
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            <SmartText>Total focused time</SmartText>
          </p>
        </div>
        
        {/* Focus Streak Card */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm transition-colors duration-300 border-l-4 border-orange-500">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Flame className="text-orange-600 dark:text-orange-400" size={24} />
              <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400">
                <SmartText>Focus Streak</SmartText>
              </h3>
            </div>
          </div>
          <div className="text-4xl font-bold text-orange-600 dark:text-orange-400">
            {focusStreak}
            <span className="text-xl ml-1">🔥</span>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            <SmartText>Days with focus sessions</SmartText>
          </p>
        </div>
      </div>
      
      {/* Weekly Wins Chart */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm transition-colors duration-300">
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className={`${colors.text} dark:text-indigo-400`} size={24} />
          <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100">
            <SmartText>Weekly Wins</SmartText>
          </h3>
        </div>
        
        {/* Bar Chart (Sensory-Friendly) */}
        <div className="flex items-end justify-between gap-2 h-32">
          {weeklyWins.map((wins, index) => {
            const height = (wins / maxWins) * 100;
            const today = new Date().getDay();
            const isToday = index === today;
            
            return (
              <div key={index} className="flex-1 flex flex-col items-center gap-2">
                <div className="relative w-full flex items-end justify-center h-24">
                  <div
                    className={`w-full rounded-t-lg ${
                      isToday ? colors.primary : colors.secondary
                    } ${
                      reduceAnimations ? '' : 'transition-all duration-500'
                    }`}
                    style={{ height: `${height}%` }}
                  >
                    {wins > 0 && (
                      <div className="text-white text-xs font-bold text-center pt-1">
                        {wins}
                      </div>
                    )}
                  </div>
                </div>
                <div className={`text-xs font-medium ${
                  isToday 
                    ? 'text-indigo-600 dark:text-indigo-400' 
                    : 'text-gray-500 dark:text-gray-400'
                }`}>
                  <SmartText>{days[index]}</SmartText>
                </div>
              </div>
            );
          })}
        </div>
        
        <div className="mt-4 p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg border border-indigo-200 dark:border-indigo-800">
          <p className="text-sm text-indigo-700 dark:text-indigo-300">
            <SmartText>
              💡 Tip: Consistency beats intensity. Even one focused session a day builds momentum!
            </SmartText>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProgressInsights;

