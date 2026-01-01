import React, { useState } from 'react';
import { CheckCircle2, Circle, AlertCircle, ArrowRight, Trophy } from 'lucide-react';
import SmartText from './SmartText';
import toast from 'react-hot-toast';

/**
 * QuizSystem Component
 * Features: Immediate feedback, Hint logic, XP reward display
 */
const QuizSystem = ({ questions = [], onComplete, darkMode }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isCorrect, setIsCorrect] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [score, setScore] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [finalScore, setFinalScore] = useState(0);

  // Fallback for empty questions array
  if (!questions || questions.length === 0) {
    return (
      <div className={`p-8 text-center rounded-xl border-2 border-dashed ${
        darkMode 
          ? 'bg-gray-800/50 border-gray-700' 
          : 'bg-gray-50 border-gray-200'
      }`}>
        <p className={darkMode ? 'text-gray-400' : 'text-gray-500'}>
          No knowledge check available for this lesson yet.
        </p>
      </div>
    );
  }

  const handleAnswerSelect = (index) => {
    if (showFeedback) return;
    setSelectedAnswer(index);
  };

  const checkAnswer = () => {
    if (selectedAnswer === null) return;
    
    const correct = selectedAnswer === questions[currentQuestion].correctAnswer;
    setIsCorrect(correct);
    setShowFeedback(true);
    
    if (correct) {
      setScore(prev => prev + 1);
      toast.success('Great job!', { icon: '🌟', duration: 1500 });
    } else {
      toast.error('Not quite. Check the hint!', { duration: 2000 });
    }
  };

  const nextQuestion = () => {
    if (currentQuestion + 1 < questions.length) {
      setCurrentQuestion(prev => prev + 1);
      setSelectedAnswer(null);
      setShowFeedback(false);
      setIsCorrect(null);
    } else {
      // Score is already updated by checkAnswer(), so use it directly
      // (checkAnswer increments score if correct, so no need to add isCorrect again)
      setFinalScore(score);
      setCompleted(true);
      // Pass final score back to parent component
      if (onComplete) {
        onComplete(score);
      }
    }
  };

  if (completed) {
    const totalQuestions = questions.length;
    const percentage = Math.round((finalScore / totalQuestions) * 100);
    const xpEarned = finalScore * 10; // 10 XP per correct answer
    
    return (
      <div className={`text-center p-8 ${darkMode ? '' : ''}`}>
        <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full mb-4 ${
          darkMode ? 'bg-yellow-900/30' : 'bg-yellow-100'
        }`}>
          <Trophy className={`w-10 h-10 ${darkMode ? 'text-yellow-500' : 'text-yellow-600'}`} />
        </div>
        <h3 className={`text-2xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          Checkpoint Complete!
        </h3>
        
        {/* Score Display */}
        <div className={`mb-4 p-4 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
          <div className="text-4xl font-bold mb-2 text-blue-600 dark:text-blue-400">
            {finalScore}/{totalQuestions}
          </div>
          <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            {percentage}% Correct
          </div>
        </div>

        {/* XP Reward */}
        <div className={`mb-6 p-4 rounded-xl border-2 ${darkMode ? 'bg-yellow-900/20 border-yellow-700' : 'bg-yellow-50 border-yellow-200'}`}>
          <div className="flex items-center justify-center gap-2 mb-1">
            <span className="text-2xl">⭐</span>
            <span className={`text-xl font-bold ${darkMode ? 'text-yellow-400' : 'text-yellow-600'}`}>
              +{xpEarned} XP
            </span>
          </div>
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Great job! Keep learning to earn more XP.
          </p>
        </div>

        <p className={`mb-6 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          You've successfully validated your learning for this section.
        </p>
        <button
          onClick={() => window.location.href = '/'}
          className="w-full px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-shadow shadow-lg hover:shadow-blue-500/20"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  const q = questions[currentQuestion];

  return (
    <div className="max-w-md mx-auto py-2">
      {/* Progress Header */}
      <div className="mb-6">
        <div className="flex justify-between items-end mb-2">
          <span className="text-xs font-bold uppercase tracking-widest text-blue-500">
            Progress
          </span>
          <span className={`text-xs font-mono ${darkMode ? 'text-gray-400' : 'text-gray-400'}`}>
            {currentQuestion + 1} / {questions.length}
          </span>
        </div>
        <div className={`w-full h-1.5 rounded-full overflow-hidden ${
          darkMode ? 'bg-gray-700' : 'bg-gray-200'
        }`}>
          <div 
            className="bg-blue-500 h-full transition-all duration-500" 
            style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
          />
        </div>
        <h3 className={`text-xl font-bold mt-6 leading-tight ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          <SmartText>{q.question}</SmartText>
        </h3>
      </div>

      {/* Answer Options */}
      <div className="space-y-3">
        {q.options.map((option, index) => {
          const isSelected = selectedAnswer === index;
          const isCorrectOption = showFeedback && index === q.correctAnswer;
          const isWrongSelection = showFeedback && isSelected && index !== q.correctAnswer;

          return (
            <button
              key={index}
              onClick={() => handleAnswerSelect(index)}
              disabled={showFeedback}
              className={`w-full text-left p-4 rounded-xl border-2 transition-all flex items-center justify-between ${
                isSelected 
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30' 
                  : darkMode
                    ? 'border-gray-700 hover:border-gray-600'
                    : 'border-gray-100 hover:border-gray-300'
              } ${isCorrectOption ? 'border-green-500 bg-green-50 dark:bg-green-900/40 ring-1 ring-green-500' : ''} 
                ${isWrongSelection ? 'border-red-500 bg-red-50 dark:bg-red-900/40' : ''}
              `}
            >
              <div className="flex items-center gap-3 pr-2">
                <div className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                  isSelected ? 'border-blue-500' : darkMode ? 'border-gray-600' : 'border-gray-300'
                } ${isCorrectOption ? 'border-green-500 bg-green-500' : ''}`}>
                  {isCorrectOption ? (
                    <CheckCircle2 className="text-white w-4 h-4" />
                  ) : isSelected ? (
                    <div className="w-2.5 h-2.5 bg-blue-500 rounded-full" />
                  ) : null}
                </div>
                <span className={`text-base ${darkMode ? 'text-gray-200' : 'text-gray-700'} ${isCorrectOption ? 'font-semibold' : ''}`}>
                  <SmartText>{option}</SmartText>
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Action Footer */}
      <div className="mt-8 min-h-[120px]">
        {!showFeedback ? (
          <button
            disabled={selectedAnswer === null}
            onClick={checkAnswer}
            className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold disabled:opacity-30 hover:bg-blue-700 transition-all shadow-md active:scale-95"
          >
            Check Answer
          </button>
        ) : (
          <div className="space-y-4">
            <div className={`p-4 rounded-xl flex items-start gap-3 border ${
              isCorrect 
                ? darkMode
                  ? 'bg-green-900/20 border-green-800 text-green-300'
                  : 'bg-green-50 border-green-200 text-green-800'
                : darkMode
                  ? 'bg-orange-900/20 border-orange-800 text-orange-300'
                  : 'bg-orange-50 border-orange-200 text-orange-800'
            }`}>
              {isCorrect ? <CheckCircle2 size={20} className="mt-0.5" /> : <AlertCircle size={20} className="mt-0.5" />}
              <div>
                <p className="text-sm font-bold mb-1">{isCorrect ? 'Correct!' : 'Try Again'}</p>
                <p className="text-sm opacity-90 leading-relaxed">
                  <SmartText>{isCorrect ? q.successMessage : q.hint}</SmartText>
                </p>
              </div>
            </div>
            <button
              onClick={nextQuestion}
              className={`w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors ${
                darkMode
                  ? 'bg-gray-100 text-gray-900 hover:bg-white'
                  : 'bg-gray-900 text-white hover:bg-black'
              }`}
            >
              {currentQuestion + 1 < questions.length ? 'Next Question' : 'Finish Lesson'}
              <ArrowRight size={18} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuizSystem;

