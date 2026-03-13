import React, { useState } from 'react';
import { Bot, Sparkles } from 'lucide-react';
import { useSensory } from '../context/SensoryContext';
import SmartText from './SmartText';

const CompanionSelector = ({ onSelect, isOpen, onClose }) => {
  const { reduceAnimations } = useSensory();
  const [selectedCompanion, setSelectedCompanion] = useState(null);

  const companions = {
    lucas: {
      id: 'lucas',
      name: 'Lucas',
      icon: Bot,
      theme: {
        primary: 'bg-blue-600',
        bg: 'bg-blue-100 dark:bg-blue-900/30',
        text: 'text-blue-700 dark:text-blue-300',
        border: 'border-blue-300 dark:border-blue-700',
        hover: 'hover:border-blue-500 dark:hover:border-blue-400',
        button: 'bg-blue-600 hover:bg-blue-700',
      },
      style: 'Structured & Focused',
      greeting: 'All systems go. What\'s the plan?',
    },
    dani: {
      id: 'dani',
      name: 'Dani',
      icon: Sparkles,
      theme: {
        primary: 'bg-pink-600',
        bg: 'bg-pink-100 dark:bg-pink-900/30',
        text: 'text-pink-700 dark:text-pink-300',
        border: 'border-pink-300 dark:border-pink-700',
        hover: 'hover:border-pink-500 dark:hover:border-pink-400',
        button: 'bg-pink-600 hover:bg-pink-700',
      },
      style: 'Encouraging & Supportive',
      greeting: 'Hey there! Ready to start?',
    },
  };

  const handleSelect = (companionId) => {
    setSelectedCompanion(companionId);
  };

  const handleConfirm = () => {
    if (selectedCompanion) {
      onSelect(companions[selectedCompanion]);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div 
        className={`bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-3xl w-full p-8 transition-all duration-300 ${
          reduceAnimations ? '' : 'animate-fade-in'
        }`}
      >
        {/* Header */}
        <div className="mb-6">
          <div>
            <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-2">
              <SmartText>Select Your Study Companion</SmartText>
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              <SmartText>Choose a learning assistant to support your educational journey</SmartText>
            </p>
          </div>
        </div>

        {/* Companion Options */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {Object.values(companions).map((companion) => {
            const IconComponent = companion.icon;
            const isSelected = selectedCompanion === companion.id;

            return (
              <button
                key={companion.id}
                onClick={() => handleSelect(companion.id)}
                className={`relative p-6 rounded-xl border-2 transition-all duration-300 text-left ${
                  isSelected
                    ? `${companion.theme.bg} ${companion.theme.border} scale-105 shadow-lg`
                    : `bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 ${companion.theme.hover}`
                } ${reduceAnimations ? '' : 'hover:scale-105'}`}
              >
                {/* Selection Indicator */}
                {isSelected && (
                  <div className="absolute top-4 right-4">
                    <div className={`w-6 h-6 rounded-full ${companion.theme.primary} flex items-center justify-center`}>
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                )}

                {/* Avatar Icon */}
                <div className={`w-20 h-20 rounded-full ${companion.theme.primary} flex items-center justify-center mb-6 shadow-lg ${
                  reduceAnimations ? '' : 'transition-transform duration-300'
                }`}>
                  <IconComponent className="w-10 h-10 text-white" strokeWidth={2} />
                </div>

                {/* Name */}
                <div className="mb-4">
                  <h3 className={`text-3xl font-bold ${isSelected ? companion.theme.text : 'text-gray-800 dark:text-gray-100'}`}>
                    <SmartText>{companion.name}</SmartText>
                  </h3>
                </div>

                {/* Style Badge */}
                <div className="mt-4">
                  <span className={`inline-block px-4 py-2 rounded-full text-sm font-medium ${
                    isSelected 
                      ? `${companion.theme.bg} ${companion.theme.text}` 
                      : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300'
                  }`}>
                    <SmartText>Style: {companion.style}</SmartText>
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Confirm Button */}
        <div className="flex justify-end">
          <button
            onClick={handleConfirm}
            disabled={!selectedCompanion}
            className={`px-8 py-3 rounded-lg font-semibold text-white transition-all duration-300 shadow-lg ${
              selectedCompanion
                ? `${companions[selectedCompanion].theme.primary} hover:shadow-xl ${reduceAnimations ? '' : 'hover:scale-105'}`
                : 'bg-gray-300 dark:bg-gray-600 cursor-not-allowed'
            }`}
          >
            <SmartText>Confirm Selection</SmartText>
          </button>
        </div>
      </div>
    </div>
  );
};

export default CompanionSelector;
