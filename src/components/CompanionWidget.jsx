import React from 'react';
import { Bot, Sparkles, MessageCircle } from 'lucide-react';
import { useSensory } from '../context/SensoryContext';
import SmartText from './SmartText';

const CompanionWidget = ({ companion, onChatClick }) => {
  const { reduceAnimations } = useSensory();

  if (!companion) return null;

  const companions = {
    lucas: {
      id: 'lucas',
      name: 'Lucas',
      icon: Bot,
      theme: {
        gradient: 'bg-blue-600',
        bg: 'bg-blue-50/50 dark:bg-blue-900/20',
        text: 'text-blue-700 dark:text-blue-300',
        border: 'border-blue-200 dark:border-blue-800',
        button: 'bg-blue-600 hover:bg-blue-700',
      },
      greeting: 'Ready to work.',
      style: 'Structured & Focused',
    },
    dani: {
      id: 'dani',
      name: 'Dani',
      icon: Sparkles,
      theme: {
        gradient: 'bg-pink-600',
        bg: 'bg-pink-50/50 dark:bg-pink-900/20',
        text: 'text-pink-700 dark:text-pink-300',
        border: 'border-pink-200 dark:border-pink-800',
        button: 'bg-pink-600 hover:bg-pink-700',
      },
      greeting: 'Let\'s make some progress.',
      style: 'Encouraging & Supportive',
    },
  };

  const companionData = companions[companion.id] || companions[companion];
  const IconComponent = companionData.icon;

  return (
    <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md shadow-lg rounded-xl p-5 border border-gray-200/50 dark:border-gray-700/50 transition-all duration-300 hover:shadow-xl">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className={`w-12 h-12 rounded-full ${companionData.theme.gradient} flex items-center justify-center shadow-md ${
          reduceAnimations ? '' : 'animate-pulse'
        }`}>
          <IconComponent className="w-6 h-6 text-white" strokeWidth={2} />
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
            <SmartText>{companionData.name}</SmartText>
            <span className={`text-xs px-2 py-0.5 rounded-full ${companionData.theme.bg} ${companionData.theme.text} font-medium`}>
              AI
            </span>
          </h3>
          <p className={`text-sm ${companionData.theme.text}`}>
            <SmartText>Your AI Companion</SmartText>
          </p>
        </div>
      </div>

      {/* Greeting Message */}
      <div className={`mb-4 p-3 rounded-lg ${companionData.theme.bg} border ${companionData.theme.border}`}>
        <p className={`text-sm font-medium ${companionData.theme.text}`}>
          <SmartText>"{companionData.greeting}"</SmartText>
        </p>
      </div>

      {/* Chat Button */}
      <button
        onClick={onChatClick}
        className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-white font-semibold transition-all duration-300 shadow-md ${companionData.theme.button} ${
          reduceAnimations ? '' : 'hover:scale-105 hover:shadow-lg'
        }`}
      >
        <MessageCircle size={18} />
        <SmartText>Chat now</SmartText>
      </button>

      {/* Style Badge */}
      <div className="mt-3 flex items-center justify-center">
        <span className="text-xs text-gray-500 dark:text-gray-400">
          <SmartText>{companionData.style}</SmartText>
        </span>
      </div>
    </div>
  );
};

export default CompanionWidget;
