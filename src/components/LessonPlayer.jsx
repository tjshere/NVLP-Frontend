import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
// Note: Using direct iframe instead of react-player due to React 19 compatibility issues
import { 
  X, 
  Maximize2, 
  Minimize2, 
  Play, 
  Pause, 
  Volume2, 
  VolumeX,
  Eye,
  EyeOff,
  ArrowLeft,
  Loader2,
  CheckCircle,
  Clock
} from 'lucide-react';
import { useSensory } from '../context/SensoryContext';
import SmartText from './SmartText';
import api from '../api';
import toast from 'react-hot-toast';

const LessonPlayer = ({ onLogout }) => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { 
    darkMode, 
    lowAudio, 
    reduceAnimations,
    dyslexicFont,
    fontSize
  } = useSensory();

  // Lesson data state
  const [lesson, setLesson] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Player state
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(lowAudio ? 0.3 : 1.0);
  const [muted, setMuted] = useState(false);
  const [playerReady, setPlayerReady] = useState(false);
  const playerRef = useRef(null);
  const youtubePlayerRef = useRef(null); // YouTube IFrame API player instance

  // UI state
  const [focusMode, setFocusMode] = useState(false);
  const [showTranscript, setShowTranscript] = useState(true);
  const [activeTab, setActiveTab] = useState('transcript'); // 'transcript' or 'notes'

  // Progress tracking
  const [watchedPercentage, setWatchedPercentage] = useState(0);
  const [engagementStartTime, setEngagementStartTime] = useState(Date.now());
  const progressIntervalRef = useRef(null);

  // Apply font classes dynamically
  const fontClasses = `${dyslexicFont ? 'font-dyslexic' : ''} ${fontSize !== 'medium' ? `font-${fontSize}` : ''}`;

  // Generate lesson ID from course ID (for mock data)
  // In production, you'd have a separate lessonId parameter in the route
  const lessonId = `lesson-${courseId}-1`;

  // Handle back navigation
  const handleClose = useCallback(() => {
    navigate('/');
  }, [navigate]);

  // Load YouTube IFrame API script
  useEffect(() => {
    if (window.YT && window.YT.Player) {
      return; // Already loaded
    }

    // Check if script is already being loaded
    if (document.querySelector('script[src*="youtube.com/iframe_api"]')) {
      return;
    }

    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    const firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

    // Set up global callback for when API is ready
    window.onYouTubeIframeAPIReady = () => {
      console.log('✅ YouTube IFrame API loaded');
    };
    
    // Note: YouTube iframe may show aria-hidden warnings in console
    // This is a known YouTube player issue, not our code
    // See: https://github.com/youtube/youtube-iframe-player/issues
  }, []);

  // Cleanup YouTube player on unmount
  useEffect(() => {
    return () => {
      if (youtubePlayerRef.current && youtubePlayerRef.current.destroy) {
        youtubePlayerRef.current.destroy();
      }
    };
  }, []);

  // Load lesson data
  useEffect(() => {
    const loadLesson = async () => {
      try {
        setIsLoading(true);
        const data = await api.getLesson(lessonId);
        setLesson(data);
        setError(null);
      } catch (err) {
        console.error('Failed to load lesson:', err);
        setError('Failed to load lesson. Please try again.');
        toast.error('Failed to load lesson');
      } finally {
        setIsLoading(false);
      }
    };

    if (lessonId && courseId) {
      loadLesson();
    }
  }, [lessonId, courseId]);

  // Sync volume with lowAudio preference
  useEffect(() => {
    setVolume(lowAudio ? 0.3 : 1.0);
  }, [lowAudio]);



  // Track engagement time and send progress updates
  useEffect(() => {
    if (!playing || !courseId) return;

    progressIntervalRef.current = setInterval(() => {
      const engagementTime = Math.floor((Date.now() - engagementStartTime) / 1000);
      const completionRate = Math.min(Math.floor(watchedPercentage), 100);

      // Send progress update to backend (creates if doesn't exist)
      api.updateProgress(courseId, {
        completion_rate: completionRate,
        engagement_time: `00:${String(Math.floor(engagementTime / 60)).padStart(2, '0')}:${String(engagementTime % 60).padStart(2, '0')}`,
      }).catch(err => {
        // Silently handle errors - progress tracking is non-critical
        if (err.status !== 404) {
          console.error('Failed to update progress:', err);
        }
      });
    }, 30000); // Update every 30 seconds

    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, [playing, courseId, watchedPercentage, engagementStartTime]);

  // Progress tracking using YouTube API when available
  useEffect(() => {
    if (playerReady && playing && youtubePlayerRef.current) {
      const timer = setInterval(() => {
        try {
          // Try to get current time from YouTube API
          if (youtubePlayerRef.current && youtubePlayerRef.current.getCurrentTime) {
            const currentTime = youtubePlayerRef.current.getCurrentTime();
            const duration = youtubePlayerRef.current.getDuration();
            setCurrentTime(currentTime);
            setDuration(duration);
            const percentage = duration > 0 ? (currentTime / duration) * 100 : 0;
            setWatchedPercentage(Math.min(percentage, 100));
          } else {
            // Fallback: increment timer
            setCurrentTime(prev => {
              const newTime = prev + 1;
              const newPercentage = duration > 0 ? (newTime / duration) * 100 : 0;
              setWatchedPercentage(Math.min(newPercentage, 100));
              return newTime;
            });
          }
        } catch (error) {
          // Fallback on error
          setCurrentTime(prev => prev + 1);
        }
      }, 1000);
      
      return () => clearInterval(timer);
    }
  }, [playerReady, playing, duration]);

  // Timeout for video loading (30 seconds)
  useEffect(() => {
    if (lesson && !playerReady) {
      const timeout = setTimeout(() => {
        if (!playerReady) {
          console.warn('⚠️ Video loading timeout - but continuing anyway');
          setPlayerReady(true);
        }
      }, 30000); // 30 second timeout

      return () => clearTimeout(timeout);
    }
  }, [lesson, playerReady]);

  // Seek to specific time (for transcript clicks)
  const seekTo = useCallback((time) => {
    if (!playerReady) {
      toast.error('Video is still loading. Please wait...');
      return;
    }
    
    try {
      // Use YouTube IFrame API for seamless seeking
      if (youtubePlayerRef.current && youtubePlayerRef.current.seekTo) {
        youtubePlayerRef.current.seekTo(time, true); // true = allowSeekAhead
        youtubePlayerRef.current.playVideo(); // Auto-play after seeking
        setCurrentTime(time);
        setPlaying(true);
        toast.success(`Jumped to ${Math.floor(time / 60)}:${String(Math.floor(time % 60)).padStart(2, '0')}`, {
          duration: 1500,
        });
      } else {
        // Fallback: reload iframe with timestamp (will show thumbnail briefly)
        const iframe = playerRef.current;
        if (iframe && iframe.src) {
          const videoId = lesson?.videoUrl.includes('youtube.com/watch?v=')
            ? lesson.videoUrl.split('v=')[1]?.split('&')[0]
            : lesson?.videoUrl.includes('youtu.be/')
            ? lesson.videoUrl.split('youtu.be/')[1]?.split('?')[0]
            : null;
          
          if (videoId) {
            const newUrl = `https://www.youtube.com/embed/${videoId}?enablejsapi=1&start=${Math.floor(time)}&autoplay=1&origin=${window.location.origin}&controls=1&modestbranding=1&rel=0`;
            iframe.src = newUrl;
            setCurrentTime(time);
            setPlaying(true);
            toast.success(`Jumped to ${Math.floor(time / 60)}:${String(Math.floor(time % 60)).padStart(2, '0')}`, {
              duration: 1500,
            });
          }
        }
      }
    } catch (error) {
      console.error('Error seeking to time:', error);
      toast.error('Unable to seek to that time');
    }
  }, [playerReady, lesson]);

  // Get current transcript item
  const getCurrentTranscriptIndex = useCallback(() => {
    if (!lesson?.transcript) return -1;
    for (let i = lesson.transcript.length - 1; i >= 0; i--) {
      if (currentTime >= lesson.transcript[i].time) {
        return i;
      }
    }
    return -1;
  }, [lesson, currentTime]);

  // Format time (seconds to mm:ss)
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (isLoading) {
    return (
      <div className={`fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 ${fontClasses}`}>
        <div className="flex flex-col items-center gap-4">
          <Loader2 className={`w-12 h-12 text-white ${reduceAnimations ? '' : 'animate-spin'}`} />
          <p className="text-white text-lg">Loading lesson...</p>
        </div>
      </div>
    );
  }

  if (error || !lesson) {
    return (
      <div className={`fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 ${fontClasses}`}>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-xl max-w-md">
          <h3 className="text-xl font-bold text-red-600 dark:text-red-400 mb-4">Error</h3>
          <p className="text-gray-700 dark:text-gray-300 mb-6">{error || 'Lesson not found'}</p>
          <button
            onClick={handleClose}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const currentTranscriptIndex = getCurrentTranscriptIndex();

  return (
    <div className={`fixed inset-0 z-50 ${darkMode ? 'bg-gray-900' : 'bg-gray-100'} ${fontClasses}`}>
      {/* Header (hidden in focus mode) */}
      {!focusMode && (
        <div className={`flex items-center justify-between p-4 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-b transition-colors duration-300`}>
          <div className="flex items-center gap-4">
            <button
              onClick={handleClose}
              className={`p-2 rounded-lg ${darkMode ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-100 text-gray-700'} transition-colors`}
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                <SmartText>{lesson.title}</SmartText>
              </h2>
              <div className="flex items-center gap-4 mt-1 text-sm text-gray-500 dark:text-gray-400">
                <span className="flex items-center gap-1">
                  <Clock size={14} />
                  {formatTime(duration)}
                </span>
                <span className="flex items-center gap-1">
                  <CheckCircle size={14} />
                  {Math.floor(watchedPercentage)}% Complete
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Transcript Toggle */}
            <button
              onClick={() => setShowTranscript(!showTranscript)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                showTranscript
                  ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                  : darkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {showTranscript ? <Eye size={16} /> : <EyeOff size={16} />}
              <span className="text-sm">Transcript</span>
            </button>

            {/* Focus Mode Toggle */}
            <button
              onClick={() => setFocusMode(!focusMode)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                focusMode
                  ? 'bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300'
                  : darkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {focusMode ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
              <span className="text-sm">Focus Mode</span>
            </button>

            {/* Close Button */}
            <button
              onClick={handleClose}
              className={`p-2 rounded-lg ${darkMode ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-100 text-gray-700'} transition-colors`}
            >
              <X size={20} />
            </button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className={`flex ${focusMode ? 'h-full' : 'h-[calc(100vh-73px)]'}`}>
        {/* Video Player Section */}
        <div className={`${showTranscript && !focusMode ? 'w-2/3' : 'w-full'} flex flex-col bg-black`}>
          {/* React Player */}
          <div className="flex-1 relative bg-black" style={{ minHeight: '400px', height: '100%' }}>
            {lesson?.videoUrl ? (
              <div className="absolute inset-0 w-full h-full" style={{ minHeight: '400px' }}>
                {/* Convert YouTube watch URL to embed URL */}
                {(() => {
                  const videoId = lesson.videoUrl.includes('youtube.com/watch?v=')
                    ? lesson.videoUrl.split('v=')[1]?.split('&')[0]
                    : lesson.videoUrl.includes('youtu.be/')
                    ? lesson.videoUrl.split('youtu.be/')[1]?.split('?')[0]
                    : null;
                  
                  const embedUrl = videoId 
                    ? `https://www.youtube.com/embed/${videoId}?enablejsapi=1&origin=${window.location.origin}&controls=1&modestbranding=1&rel=0`
                    : lesson.videoUrl;
                  
                  // Use direct iframe with YouTube IFrame API for seamless seeking
                  const iframeId = `youtube-player-${courseId}`;
                  
                  return (
                    <iframe
                      id={iframeId}
                      ref={(ref) => {
                        playerRef.current = ref;
                      }}
                      src={embedUrl}
                      width="100%"
                      height="100%"
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                      }}
                      onLoad={() => {
                        console.log('✅ YouTube iframe loaded');
                        
                        // Initialize YouTube IFrame API player
                        const initPlayer = () => {
                          if (window.YT && window.YT.Player) {
                            try {
                              youtubePlayerRef.current = new window.YT.Player(iframeId, {
                                events: {
                                  onReady: (event) => {
                                    console.log('✅ YouTube player API ready');
                                    setPlayerReady(true);
                                    const duration = event.target.getDuration();
                                    setDuration(duration || 600);
                                    toast.success('Video loaded!', { duration: 2000 });
                                  },
                                  onStateChange: (event) => {
                                    // Track playing state
                                    if (event.data === window.YT.PlayerState.PLAYING) {
                                      setPlaying(true);
                                    } else if (event.data === window.YT.PlayerState.PAUSED) {
                                      setPlaying(false);
                                    }
                                  },
                                  onError: (error) => {
                                    console.error('❌ YouTube player error:', error);
                                  },
                                },
                              });
                            } catch (err) {
                              console.error('Failed to initialize YouTube player:', err);
                              // Fallback: just set ready without API
                              setPlayerReady(true);
                              setDuration(600);
                              toast.success('Video loaded!', { duration: 2000 });
                            }
                          } else {
                            // Wait for API to load (max 5 seconds)
                            let attempts = 0;
                            const checkAPI = setInterval(() => {
                              attempts++;
                              if (window.YT && window.YT.Player) {
                                clearInterval(checkAPI);
                                initPlayer();
                              } else if (attempts > 10) {
                                clearInterval(checkAPI);
                                // Fallback if API doesn't load
                                setPlayerReady(true);
                                setDuration(600);
                                toast.success('Video loaded!', { duration: 2000 });
                              }
                            }, 500);
                          }
                        };
                        
                        initPlayer();
                      }}
                      onError={(e) => {
                        console.error('❌ Iframe load error:', e);
                        toast.error('Failed to load video iframe');
                      }}
                    />
                  );
                })()}
              </div>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-white">
                <p>No video URL available</p>
              </div>
            )}
            
            {!playerReady && lesson && (
              <div className="absolute inset-0 flex flex-col items-center justify-center z-20 bg-black bg-opacity-75 pointer-events-none">
                <div className="text-center">
                  <Loader2 className={`w-12 h-12 text-white mx-auto mb-4 ${reduceAnimations ? '' : 'animate-spin'}`} />
                  <p className="text-white text-lg mb-2">Loading video...</p>
                  <p className="text-white text-sm opacity-75 mb-4">This may take a few moments</p>
                  {lesson.videoUrl && (
                    <a
                      href={lesson.videoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:text-blue-300 underline text-sm pointer-events-auto"
                    >
                      Open video in new tab if it doesn't load
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* Custom Play/Pause Overlay - Note: YouTube iframe has built-in controls */}
            {playerReady && (
              <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity bg-black bg-opacity-10 z-20 pointer-events-none">
                <div className="text-white text-sm bg-black bg-opacity-50 px-4 py-2 rounded">
                  Use YouTube player controls below
                </div>
              </div>
            )}
          </div>

          {/* Video Controls Info */}
          <div className={`p-4 ${darkMode ? 'bg-gray-800' : 'bg-gray-900'}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="text-white text-sm">
                  Use YouTube player controls above to play, pause, and adjust volume
                </span>
              </div>

              {focusMode && (
                <button
                  onClick={() => setFocusMode(false)}
                  className="px-3 py-1 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm"
                >
                  Exit Focus Mode
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Transcript/Content Sidebar */}
        {showTranscript && !focusMode && (
          <div className={`w-1/3 flex flex-col ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-l transition-colors duration-300`}>
            {/* Tabs */}
            <div className={`flex border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <button
                onClick={() => setActiveTab('transcript')}
                className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                  activeTab === 'transcript'
                    ? darkMode
                      ? 'border-b-2 border-blue-500 text-blue-400'
                      : 'border-b-2 border-blue-600 text-blue-600'
                    : darkMode
                      ? 'text-gray-400 hover:text-gray-300'
                      : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Interactive Transcript
              </button>
              <button
                onClick={() => setActiveTab('notes')}
                className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                  activeTab === 'notes'
                    ? darkMode
                      ? 'border-b-2 border-blue-500 text-blue-400'
                      : 'border-b-2 border-blue-600 text-blue-600'
                    : darkMode
                      ? 'text-gray-400 hover:text-gray-300'
                      : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Lesson Notes
              </button>
            </div>

            {/* Tab Content */}
            <div className="flex-1 overflow-y-auto p-4">
              {activeTab === 'transcript' ? (
                <div className="space-y-2">
                  {lesson.transcript?.map((item, index) => (
                    <button
                      key={index}
                      onClick={() => seekTo(item.time)}
                      className={`w-full text-left p-3 rounded-lg transition-colors ${
                        index === currentTranscriptIndex
                          ? darkMode
                            ? 'bg-blue-900 bg-opacity-50 border-l-4 border-blue-500'
                            : 'bg-blue-50 border-l-4 border-blue-600'
                          : darkMode
                            ? 'hover:bg-gray-700'
                            : 'hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        <span className={`text-xs font-mono ${darkMode ? 'text-gray-400' : 'text-gray-500'} min-w-[40px]`}>
                          {formatTime(item.time)}
                        </span>
                        <p className={`text-sm ${index === currentTranscriptIndex ? (darkMode ? 'text-blue-300 font-medium' : 'text-blue-700 font-medium') : (darkMode ? 'text-gray-300' : 'text-gray-700')}`}>
                          <SmartText>{item.text}</SmartText>
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className={`prose ${darkMode ? 'prose-invert' : ''} max-w-none`}>
                  <SmartText>{lesson.content}</SmartText>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LessonPlayer;

