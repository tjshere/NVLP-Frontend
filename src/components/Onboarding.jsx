import React, { useState } from 'react';
import { Bot, Sparkles, BookOpen, Timer, CheckSquare, ChevronRight, Sun, Moon, Zap, ZapOff, Type } from 'lucide-react';
import { useSensory } from '../context/SensoryContext';

const STEPS = ['welcome', 'companion', 'sensory'];

const Onboarding = ({ onComplete }) => {
  const [step, setStep] = useState(0);
  const [selectedCompanion, setSelectedCompanion] = useState(null);
  const { darkMode, reduceAnimations, fontSize, updatePreference } = useSensory();

  const companions = [
    {
      id: 'lucas',
      name: 'Lucas',
      icon: Bot,
      style: 'Structured & Focused',
      description: 'Clear plans, step-by-step guidance, and direct communication.',
      colorBg: 'bg-blue-600',
      colorBorder: 'border-blue-500',
      colorLight: 'bg-blue-50 dark:bg-blue-900/20',
    },
    {
      id: 'dani',
      name: 'Dani',
      icon: Sparkles,
      style: 'Encouraging & Supportive',
      description: 'Warm encouragement, celebrates your wins, keeps you motivated.',
      colorBg: 'bg-pink-600',
      colorBorder: 'border-pink-500',
      colorLight: 'bg-pink-50 dark:bg-pink-900/20',
    },
  ];

  const features = [
    { icon: BookOpen, title: 'Structured Lessons', desc: 'Video lessons with transcripts and quizzes' },
    { icon: Timer, title: 'Focus Engine', desc: 'Pomodoro timer built for your rhythm' },
    { icon: CheckSquare, title: 'Task Breaker', desc: 'Break big tasks into manageable steps' },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-slate-100 dark:bg-gray-950 flex flex-col items-center justify-center p-6 transition-colors duration-300">

      {/* Step progress indicator */}
      <div className="flex gap-2 mb-10">
        {STEPS.map((_, i) => (
          <div
            key={i}
            className={`h-2 rounded-full transition-all duration-300 ${
              i === step
                ? 'w-8 bg-blue-600'
                : i < step
                ? 'w-2 bg-blue-400'
                : 'w-2 bg-gray-300 dark:bg-gray-600'
            }`}
          />
        ))}
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-2xl p-10 transition-colors duration-300">

        {/* Step 1: Welcome */}
        {step === 0 && (
          <div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
              Welcome to NVLP
            </h1>
            <p className="text-gray-500 dark:text-gray-400 text-lg mb-8">
              A learning platform built around how your mind works.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
              {features.map(({ icon: Icon, title, desc }) => (
                <div key={title} className="bg-slate-50 dark:bg-gray-700 rounded-xl p-5">
                  <Icon className="text-blue-600 mb-3" size={24} />
                  <h3 className="font-semibold text-gray-800 dark:text-gray-100 mb-1">{title}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{desc}</p>
                </div>
              ))}
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setStep(1)}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
              >
                Get Started <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Companion */}
        {step === 1 && (
          <div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Choose your companion
            </h2>
            <p className="text-gray-500 dark:text-gray-400 mb-8">
              Your AI learning partner. You can change this any time.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
              {companions.map((c) => {
                const Icon = c.icon;
                const isSelected = selectedCompanion === c.id;
                return (
                  <button
                    key={c.id}
                    onClick={() => setSelectedCompanion(c.id)}
                    className={`text-left p-6 rounded-xl border-2 transition-all duration-200 ${
                      isSelected
                        ? `${c.colorLight} ${c.colorBorder}`
                        : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 bg-white dark:bg-gray-800'
                    }`}
                  >
                    <div className={`w-14 h-14 rounded-full ${c.colorBg} flex items-center justify-center mb-4`}>
                      <Icon className="text-white" size={28} />
                    </div>
                    <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-1">{c.name}</h3>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">{c.style}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{c.description}</p>
                  </button>
                );
              })}
            </div>

            <div className="flex justify-between items-center">
              <button
                onClick={() => setStep(0)}
                className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 px-4 py-2 rounded-lg transition-colors"
              >
                Back
              </button>
              <button
                onClick={() => setStep(2)}
                disabled={!selectedCompanion}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-semibold transition-colors"
              >
                Continue <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Sensory Setup */}
        {step === 2 && (
          <div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Set up your environment
            </h2>
            <p className="text-gray-500 dark:text-gray-400 mb-8">
              These can be changed any time from the settings panel.
            </p>

            <div className="space-y-4 mb-10">
              {/* Dark Mode */}
              <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-gray-700 rounded-xl">
                <div className="flex items-center gap-3">
                  {darkMode
                    ? <Moon className="text-blue-500" size={20} />
                    : <Sun className="text-yellow-500" size={20} />
                  }
                  <div>
                    <p className="font-medium text-gray-800 dark:text-gray-100">Dark Mode</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Easier on the eyes in low light</p>
                  </div>
                </div>
                <button
                  onClick={() => updatePreference('dark_mode', !darkMode)}
                  className={`relative w-12 h-6 rounded-full transition-colors duration-200 ${darkMode ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-500'}`}
                >
                  <span className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform duration-200 ${darkMode ? 'translate-x-7' : 'translate-x-1'}`} />
                </button>
              </div>

              {/* Reduce Animations */}
              <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-gray-700 rounded-xl">
                <div className="flex items-center gap-3">
                  {reduceAnimations
                    ? <ZapOff className="text-orange-500" size={20} />
                    : <Zap className="text-orange-500" size={20} />
                  }
                  <div>
                    <p className="font-medium text-gray-800 dark:text-gray-100">Reduce Animations</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Minimizes motion and transitions</p>
                  </div>
                </div>
                <button
                  onClick={() => updatePreference('reduce_animations', !reduceAnimations)}
                  className={`relative w-12 h-6 rounded-full transition-colors duration-200 ${reduceAnimations ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-500'}`}
                >
                  <span className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform duration-200 ${reduceAnimations ? 'translate-x-7' : 'translate-x-1'}`} />
                </button>
              </div>

              {/* Font Size */}
              <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-gray-700 rounded-xl">
                <div className="flex items-center gap-3">
                  <Type className="text-purple-500" size={20} />
                  <div>
                    <p className="font-medium text-gray-800 dark:text-gray-100">Text Size</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Adjust for comfortable reading</p>
                  </div>
                </div>
                <div className="flex gap-1">
                  {['small', 'medium', 'large'].map((size) => (
                    <button
                      key={size}
                      onClick={() => updatePreference('font_size', size)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                        fontSize === size
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-500'
                      }`}
                    >
                      {size.charAt(0).toUpperCase() + size.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <button
                onClick={() => setStep(1)}
                className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 px-4 py-2 rounded-lg transition-colors"
              >
                Back
              </button>
              <button
                onClick={() => onComplete(selectedCompanion)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
              >
                Go to Dashboard
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default Onboarding;
