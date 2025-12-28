import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Pin, X, Settings, Loader2, Clock, Target } from 'lucide-react';
import api from '../api';
import toast from 'react-hot-toast';
import { useSensory } from '../context/SensoryContext';
import SmartText from './SmartText';

/**
 * FocusEngine Component - Pomodoro Timer with Task Integration
 * 
 * Features:
 * - Real-time countdown timer with work/break cycles
 * - Task/step pinning for focused work
 * - Backend persistence and recovery
 * - Focus mode UI (hide distractions)
 * - Sensory integration (audio, animations, reduce motion)
 * - Auto-sync with Django PomodoroTimerModel
 */
const FocusEngine = ({ tasks = [] }) => {
  const { reduceAnimations, lowAudio } = useSensory();
  
  // Timer settings
  const [timerId, setTimerId] = useState(null);
  const [workDuration, setWorkDuration] = useState(25); // minutes
  const [breakDuration, setBreakDuration] = useState(5);
  const [longBreakDuration, setLongBreakDuration] = useState(15);
  const [cyclesToLongBreak, setCyclesToLongBreak] = useState(4);
  
  // Timer state
  const [timeLeft, setTimeLeft] = useState(25 * 60); // seconds
  const [isRunning, setIsRunning] = useState(false);
  const [mode, setMode] = useState('work'); // 'work' | 'break' | 'longBreak'
  const [cyclesCompleted, setCyclesCompleted] = useState(0);
  
  // UI state
  const [isLoading, setIsLoading] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [pinnedTask, setPinnedTask] = useState(null);
  const [pinnedStep, setPinnedStep] = useState(null);
  const [focusMode, setFocusMode] = useState(false);
  
  // Refs for interval and audio
  const intervalRef = useRef(null);
  const sessionStartRef = useRef(null);
  const audioContextRef = useRef(null);
  
  // Initialize timer from backend
  useEffect(() => {
    initializeTimer();
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);
  
  const initializeTimer = async () => {
    try {
      setIsLoading(true);
      const timer = await api.getOrCreateTimer();
      
      setTimerId(timer.id);
      setWorkDuration(timer.work_duration || 25);
      setBreakDuration(timer.break_duration || 5);
      setLongBreakDuration(timer.long_break_duration || 15);
      setCyclesToLongBreak(timer.cycles_to_long_break || 4);
      
      // Recover session if timer was running
      if (timer.current_status === 'working' || timer.current_status === 'breaking') {
        recoverSession(timer);
      } else {
        setTimeLeft(timer.work_duration * 60);
      }
    } catch (error) {
      console.error('Failed to initialize timer:', error);
      toast.error('Failed to load timer settings');
      // Use defaults
      setTimeLeft(25 * 60);
    } finally {
      setIsLoading(false);
    }
  };
  
  const recoverSession = (timer) => {
    if (!timer.session_start_time) {
      setTimeLeft(timer.work_duration * 60);
      return;
    }
    
    const startTime = new Date(timer.session_start_time);
    const now = new Date();
    const elapsed = Math.floor((now - startTime) / 1000); // seconds
    
    const isWorking = timer.current_status === 'working';
    const totalDuration = isWorking ? timer.work_duration * 60 : timer.break_duration * 60;
    const remaining = totalDuration - elapsed;
    
    if (remaining > 0) {
      setTimeLeft(remaining);
      setMode(isWorking ? 'work' : 'break');
      setIsRunning(true);
      sessionStartRef.current = startTime;
      toast.success('Session recovered! Timer resumed.');
    } else {
      // Session expired while offline
      setTimeLeft(timer.work_duration * 60);
      toast.info('Previous session expired.');
    }
  };
  
  // Countdown logic
  useEffect(() => {
    if (isRunning && !isLoading) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            handleTimerComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, isLoading]);
  
  const handleTimerComplete = () => {
    setIsRunning(false);
    playCompletionSound();
    
    if (mode === 'work') {
      const newCycles = cyclesCompleted + 1;
      setCyclesCompleted(newCycles);
      
      // Track engagement time for completed work session
      trackEngagementTime(workDuration);
      
      if (newCycles % cyclesToLongBreak === 0) {
        // Long break
        setMode('longBreak');
        setTimeLeft(longBreakDuration * 60);
        toast.success('🎉 Work session complete! Take a long break!', {
          duration: 5000,
          icon: '☕',
        });
      } else {
        // Short break
        setMode('break');
        setTimeLeft(breakDuration * 60);
        toast.success('✅ Work session complete! Take a short break.', {
          duration: 4000,
        });
      }
    } else {
      // Break complete, back to work
      setMode('work');
      setTimeLeft(workDuration * 60);
      toast.success('Break complete! Ready to focus?', {
        duration: 3000,
      });
    }
    
    // Sync completion to backend
    syncTimerState('idle');
  };
  
  const trackEngagementTime = async (minutes) => {
    // Store engagement time in localStorage for insights
    try {
      const existingTime = parseInt(localStorage.getItem('total_focus_minutes') || '0');
      const newTotal = existingTime + minutes;
      localStorage.setItem('total_focus_minutes', newTotal.toString());
      
      // Also store today's date for streak calculation
      const today = new Date().toDateString();
      const focusDates = JSON.parse(localStorage.getItem('focus_dates') || '[]');
      if (!focusDates.includes(today)) {
        focusDates.push(today);
        localStorage.setItem('focus_dates', JSON.stringify(focusDates));
      }
      
      console.log(`✅ Tracked ${minutes} focus minutes. Total: ${newTotal}`);
    } catch (error) {
      console.error('Failed to track engagement time:', error);
    }
  };
  
  const handleStart = async () => {
    setIsRunning(true);
    setFocusMode(true);
    sessionStartRef.current = new Date();
    
    const status = mode === 'work' ? 'working' : 'breaking';
    await syncTimerState(status);
    
    toast.success(mode === 'work' ? '🎯 Focus mode activated!' : '☕ Break time!', {
      duration: 2000,
    });
  };
  
  const handlePause = async () => {
    setIsRunning(false);
    setFocusMode(false);
    await syncTimerState('paused');
  };
  
  const handleReset = async () => {
    setIsRunning(false);
    setFocusMode(false);
    setTimeLeft(workDuration * 60);
    setMode('work');
    sessionStartRef.current = null;
    await syncTimerState('idle');
    toast.success('Timer reset');
  };
  
  const syncTimerState = async (status) => {
    if (!timerId) return;
    
    try {
      await api.updateTimer(timerId, {
        current_status: status,
        session_start_time: status === 'idle' || status === 'paused' ? null : sessionStartRef.current?.toISOString(),
      });
    } catch (error) {
      console.error('Failed to sync timer state:', error);
    }
  };
  
  const handleSaveSettings = async () => {
    if (!timerId) return;
    
    try {
      await api.updateTimer(timerId, {
        work_duration: workDuration,
        break_duration: breakDuration,
        long_break_duration: longBreakDuration,
        cycles_to_long_break: cyclesToLongBreak,
      });
      
      // Reset timer with new duration
      setTimeLeft(workDuration * 60);
      setMode('work');
      setIsRunning(false);
      setShowSettings(false);
      
      toast.success('Timer settings saved!');
    } catch (error) {
      console.error('Failed to save settings:', error);
      toast.error('Failed to save settings');
    }
  };
  
  const handlePinTask = (task, step) => {
    setPinnedTask(task);
    setPinnedStep(step);
    toast.success(`Pinned: ${step.step_description}`, {
      duration: 2000,
    });
  };
  
  const handleUnpin = () => {
    setPinnedTask(null);
    setPinnedStep(null);
    toast.success('Task unpinned');
  };
  
  const playCompletionSound = () => {
    if (lowAudio) return; // Respect low audio preference
    
    // Simple beep using Web Audio API
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      }
      
      const ctx = audioContextRef.current;
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      oscillator.frequency.value = 800;
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
      
      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + 0.5);
    } catch (error) {
      console.error('Failed to play sound:', error);
    }
  };
  
  // Format time as MM:SS
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Calculate progress percentage
  const getProgress = () => {
    const total = mode === 'work' ? workDuration * 60 : 
                  mode === 'break' ? breakDuration * 60 : 
                  longBreakDuration * 60;
    return ((total - timeLeft) / total) * 100;
  };
  
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
    <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm transition-colors duration-300 ${
      focusMode ? 'ring-4 ring-indigo-500 dark:ring-indigo-400' : ''
    }`}>
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="text-indigo-600 dark:text-indigo-400" size={24} />
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">
              <SmartText>Focus Engine</SmartText>
            </h2>
            {focusMode && (
              <span className={`ml-2 px-2 py-1 bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 text-xs font-medium rounded-full ${
                reduceAnimations ? '' : 'animate-pulse'
              }`}>
                <SmartText>FOCUS MODE</SmartText>
              </span>
            )}
          </div>
          
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors duration-300"
          >
            <Settings size={20} />
          </button>
        </div>
      </div>
      
      {/* Settings Panel */}
      {showSettings && (
        <div className="p-6 bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600 transition-colors duration-300">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
            <SmartText>Timer Settings</SmartText>
          </h3>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                <SmartText>Work Duration (min)</SmartText>
              </label>
              <input
                type="number"
                value={workDuration}
                onChange={(e) => setWorkDuration(Number(e.target.value))}
                min="1"
                max="60"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                <SmartText>Break Duration (min)</SmartText>
              </label>
              <input
                type="number"
                value={breakDuration}
                onChange={(e) => setBreakDuration(Number(e.target.value))}
                min="1"
                max="30"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                <SmartText>Long Break (min)</SmartText>
              </label>
              <input
                type="number"
                value={longBreakDuration}
                onChange={(e) => setLongBreakDuration(Number(e.target.value))}
                min="1"
                max="60"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                <SmartText>Cycles to Long Break</SmartText>
              </label>
              <input
                type="number"
                value={cyclesToLongBreak}
                onChange={(e) => setCyclesToLongBreak(Number(e.target.value))}
                min="2"
                max="10"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              />
            </div>
          </div>
          <button
            onClick={handleSaveSettings}
            className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors duration-300 text-sm font-medium"
          >
            <SmartText>Save Settings</SmartText>
          </button>
        </div>
      )}
      
      {/* Timer Display */}
      <div className="p-8">
        {/* Mode Indicator */}
        <div className="text-center mb-4">
          <span className={`inline-block px-4 py-1 rounded-full text-sm font-medium ${
            mode === 'work' 
              ? 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300'
              : mode === 'break'
              ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300'
              : 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
          }`}>
            <SmartText>
              {mode === 'work' ? 'Work Session' : mode === 'break' ? 'Short Break' : 'Long Break'}
            </SmartText>
          </span>
        </div>
        
        {/* Timer Circle */}
        <div className="relative w-72 h-72 mx-auto mb-6 overflow-visible">
          {/* Progress Ring (only if animations enabled) */}
          {!reduceAnimations && (
            <svg 
              className="w-full h-full transform -rotate-90" 
              viewBox="0 0 288 288"
              style={{ overflow: 'visible' }}
            >
              <circle
                cx="144"
                cy="144"
                r="132"
                stroke="currentColor"
                strokeWidth="8"
                fill="none"
                className="text-gray-200 dark:text-gray-700"
              />
              <circle
                cx="144"
                cy="144"
                r="132"
                stroke="currentColor"
                strokeWidth="8"
                fill="none"
                strokeDasharray={`${2 * Math.PI * 132}`}
                strokeDashoffset={`${2 * Math.PI * 132 * (1 - getProgress() / 100)}`}
                className={`transition-all duration-1000 ${
                  mode === 'work'
                    ? 'text-red-500'
                    : mode === 'break'
                    ? 'text-green-500'
                    : 'text-blue-500'
                }`}
                strokeLinecap="round"
              />
            </svg>
          )}
          
          {/* Time Display */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-6xl font-bold text-gray-800 dark:text-gray-100 tabular-nums">
                {formatTime(timeLeft)}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                <SmartText>Cycle {cyclesCompleted + 1} of {cyclesToLongBreak}</SmartText>
              </div>
            </div>
          </div>
        </div>
        
        {/* Controls */}
        <div className="flex items-center justify-center gap-4 mb-6">
          {!isRunning ? (
            <button
              onClick={handleStart}
              className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors duration-300 font-medium"
            >
              <Play size={20} />
              <SmartText>Start</SmartText>
            </button>
          ) : (
            <button
              onClick={handlePause}
              className="flex items-center gap-2 px-6 py-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors duration-300 font-medium"
            >
              <Pause size={20} />
              <SmartText>Pause</SmartText>
            </button>
          )}
          
          <button
            onClick={handleReset}
            className="flex items-center gap-2 px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors duration-300 font-medium"
          >
            <RotateCcw size={20} />
            <SmartText>Reset</SmartText>
          </button>
        </div>
        
        {/* Pinned Task */}
        {pinnedTask && pinnedStep && (
          <div className="mt-6 p-4 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-lg transition-colors duration-300">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3 flex-1">
                <Target className="text-indigo-600 dark:text-indigo-400 mt-0.5" size={20} />
                <div>
                  <div className="text-xs text-indigo-600 dark:text-indigo-400 font-medium mb-1">
                    <SmartText>CURRENT FOCUS</SmartText>
                  </div>
                  <div className="text-sm font-semibold text-gray-800 dark:text-gray-100 mb-1">
                    <SmartText>{pinnedTask.main_task_title}</SmartText>
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    <SmartText>{pinnedStep.step_description}</SmartText>
                  </div>
                </div>
              </div>
              <button
                onClick={handleUnpin}
                className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300"
              >
                <X size={18} />
              </button>
            </div>
          </div>
        )}
        
        {/* Task Selection for Pinning */}
        {!pinnedTask && tasks.length > 0 && (
          <div className="mt-6">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
              <Pin size={16} />
              <SmartText>Pin a task step to focus on:</SmartText>
            </h3>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {tasks.filter(task => !task.is_complete).map(task => (
                <div key={task.id} className="text-sm">
                  <div className="font-medium text-gray-700 dark:text-gray-300 mb-1">
                    <SmartText>{task.main_task_title}</SmartText>
                  </div>
                  {task.steps.filter(step => !step.is_step_complete).map(step => (
                    <button
                      key={step.id}
                      onClick={() => handlePinTask(task, step)}
                      className="w-full text-left px-3 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors duration-300"
                    >
                      <SmartText>{step.step_description}</SmartText>
                    </button>
                  ))}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FocusEngine;

