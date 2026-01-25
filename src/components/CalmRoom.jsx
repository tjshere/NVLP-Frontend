import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Wind, Waves, Trees, CloudRain, Play, Pause, ArrowLeft, Volume2, VolumeX } from 'lucide-react';
import { useSensory } from '../context/SensoryContext';
import SmartText from './SmartText';

const CalmRoom = () => {
  const navigate = useNavigate();
  const { reduceAnimations } = useSensory();
  const [activeMode, setActiveMode] = useState('ocean');
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);

  // Mode configurations with gradients and ambient sounds
  const modes = {
    ocean: {
      name: 'Ocean',
      icon: Waves,
      gradient: 'from-blue-400 via-blue-500 to-indigo-600',
      description: 'Let the waves wash over you',
      audioUrl: 'https://example.com/ocean-waves.mp3', // Placeholder URL
    },
    forest: {
      name: 'Forest',
      icon: Trees,
      gradient: 'from-green-400 via-emerald-500 to-teal-600',
      description: 'Find peace among the trees',
      audioUrl: 'https://example.com/forest-sounds.mp3', // Placeholder URL
    },
    rain: {
      name: 'Rain',
      icon: CloudRain,
      gradient: 'from-slate-400 via-slate-500 to-slate-600',
      description: 'Listen to the gentle rainfall',
      audioUrl: 'https://example.com/rain-sounds.mp3', // Placeholder URL
    },
  };

  const currentMode = modes[activeMode];

  // Handle mode changes
  const handleModeChange = (mode) => {
    setActiveMode(mode);
    setIsPlaying(false); // Pause when switching modes
  };

  // Handle play/pause
  const togglePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play().catch(err => {
          console.warn('Audio playback failed:', err);
        });
      }
      setIsPlaying(!isPlaying);
    }
  };

  // Update audio source when mode changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.src = currentMode.audioUrl;
      audioRef.current.load();
    }
  }, [activeMode, currentMode.audioUrl]);

  return (
    <div 
      className={`min-h-screen relative overflow-hidden transition-all duration-[3000ms] bg-gradient-to-br ${currentMode.gradient}`}
    >
      {/* Animated background overlay (subtle movement) */}
      <div 
        className={`absolute inset-0 opacity-20 ${
          reduceAnimations ? '' : 'animate-pulse'
        }`}
        style={{
          background: 'radial-gradient(circle at 50% 50%, rgba(255,255,255,0.1) 0%, transparent 50%)',
        }}
      />

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between p-6">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md text-white rounded-lg hover:bg-white/20 transition-all duration-300"
        >
          <ArrowLeft size={20} />
          <SmartText>Back to Dashboard</SmartText>
        </button>
        
        <div className="flex items-center gap-2 text-white">
          <Wind className="w-6 h-6" />
          <h1 className="text-2xl font-light tracking-wide">
            <SmartText>Sensory Room</SmartText>
          </h1>
        </div>
        
        <div className="w-32" /> {/* Spacer for centering */}
      </header>

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-[calc(100vh-200px)] px-6">
        {/* Mode Title and Description */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            {React.createElement(currentMode.icon, {
              className: `w-16 h-16 text-white ${reduceAnimations ? '' : 'animate-bounce'}`,
              strokeWidth: 1.5,
            })}
          </div>
          <h2 className="text-5xl font-light text-white mb-3 tracking-wide">
            <SmartText>{currentMode.name}</SmartText>
          </h2>
          <p className="text-xl text-white/80 font-light">
            <SmartText>{currentMode.description}</SmartText>
          </p>
        </div>

        {/* Mode Selection */}
        <div className="flex gap-4 mb-12">
          {Object.entries(modes).map(([key, mode]) => {
            const IconComponent = mode.icon;
            return (
              <button
                key={key}
                onClick={() => handleModeChange(key)}
                className={`flex flex-col items-center gap-2 px-6 py-4 rounded-2xl backdrop-blur-md transition-all duration-300 ${
                  activeMode === key
                    ? 'bg-white/30 scale-110 shadow-xl'
                    : 'bg-white/10 hover:bg-white/20 hover:scale-105'
                }`}
              >
                <IconComponent 
                  className="w-8 h-8 text-white" 
                  strokeWidth={1.5} 
                />
                <span className="text-sm font-medium text-white">
                  <SmartText>{mode.name}</SmartText>
                </span>
              </button>
            );
          })}
        </div>

        {/* Play/Pause Control */}
        <button
          onClick={togglePlayPause}
          className={`flex items-center gap-3 px-8 py-4 bg-white/20 backdrop-blur-md text-white rounded-full hover:bg-white/30 transition-all duration-300 shadow-2xl ${
            reduceAnimations ? '' : 'hover:scale-105'
          }`}
        >
          {isPlaying ? (
            <>
              <Pause className="w-6 h-6" />
              <span className="text-lg font-medium"><SmartText>Pause</SmartText></span>
            </>
          ) : (
            <>
              <Play className="w-6 h-6" />
              <span className="text-lg font-medium"><SmartText>Play</SmartText></span>
            </>
          )}
        </button>

        {/* Audio Status Indicator */}
        <div className="mt-8 flex items-center gap-2 text-white/60 text-sm">
          {isPlaying ? (
            <>
              <Volume2 size={16} />
              <SmartText>Audio playing</SmartText>
            </>
          ) : (
            <>
              <VolumeX size={16} />
              <SmartText>Audio paused</SmartText>
            </>
          )}
        </div>
      </div>

      {/* Breathing Exercise Hint */}
      <div className="relative z-10 text-center pb-8">
        <p className="text-white/60 text-sm font-light">
          <SmartText>Take a deep breath. You're doing great.</SmartText>
        </p>
      </div>

      {/* Hidden Audio Element */}
      <audio
        ref={audioRef}
        loop
        className="hidden"
      />
    </div>
  );
};

export default CalmRoom;
