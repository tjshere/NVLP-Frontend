import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import api from '../api';
import toast from 'react-hot-toast';

const SensoryContext = createContext(null);

export const useSensory = () => {
  const context = useContext(SensoryContext);
  if (!context) {
    throw new Error('useSensory must be used within a SensoryProvider');
  }
  return context;
};

export const SensoryProvider = ({ children, user, onAuthFailure }) => {
  // Sensory preferences state
  const [darkMode, setDarkMode] = useState(false);
  const [lowAudio, setLowAudio] = useState(false);
  const [reduceAnimations, setReduceAnimations] = useState(false);
  
  // Saving status for user feedback
  const [savingStatus, setSavingStatus] = useState('idle'); // 'idle' | 'saving' | 'saved' | 'error'
  
  // Track component mount status for cleanup
  const isMountedRef = useRef(true);
  const timeoutIdsRef = useRef([]);
  
  // Track request IDs to handle out-of-order responses
  const requestIdRef = useRef(0);
  
  // Track number of pending requests to prevent premature status reset
  const pendingRequestsRef = useRef(0);
  
  // Track "true" current preference values (synchronous, not affected by React batching)
  const preferencesRef = useRef({
    dark_mode: false,
    low_audio: false,
    reduce_animations: false,
  });

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      timeoutIdsRef.current.forEach(clearTimeout);
    };
  }, []);

  // Initialize sensory preferences when user data is loaded
  useEffect(() => {
    if (user?.preferences) {
      const prefs = user.preferences;
      setDarkMode(prefs.dark_mode || false);
      setLowAudio(prefs.low_audio || false);
      setReduceAnimations(prefs.reduce_animations || false);
      
      // Sync refs with loaded preferences
      preferencesRef.current = {
        dark_mode: prefs.dark_mode || false,
        low_audio: prefs.low_audio || false,
        reduce_animations: prefs.reduce_animations || false,
      };
    }
  }, [user]);

  // Reset preferences on logout (when user becomes null)
  useEffect(() => {
    if (!user) {
      setDarkMode(false);
      setLowAudio(false);
      setReduceAnimations(false);
      preferencesRef.current = {
        dark_mode: false,
        low_audio: false,
        reduce_animations: false,
      };
      setSavingStatus('idle');
      
      // Clear all pending timeouts
      timeoutIdsRef.current.forEach(clearTimeout);
      timeoutIdsRef.current = [];
      pendingRequestsRef.current = 0;
    }
  }, [user]);

  // Handle sensory preference updates with improved rollback and toast notifications
  const updatePreference = async (preference, value) => {
    // Defensive null check: prevent crashes during logout race conditions
    if (!user) {
      console.warn('Cannot update sensory preferences: user is null');
      return;
    }
    
    // Increment request ID to track this specific request (race condition handling)
    requestIdRef.current += 1;
    const currentRequestId = requestIdRef.current;
    
    // Store previous value for rollback on error (stale state closure fix)
    let previousValue;
    const previousPreferences = { ...preferencesRef.current };
    
    // Set saving status (only if mounted - memory leak prevention)
    if (isMountedRef.current) {
      setSavingStatus('saving');
    }
    
    // Update the ref synchronously with the new value (source of truth)
    // This prevents rapid toggle clicks from reading stale state
    switch (preference) {
      case 'dark_mode':
        previousValue = preferencesRef.current.dark_mode;
        preferencesRef.current.dark_mode = value;
        if (isMountedRef.current) {
          setDarkMode(value);
        }
        break;
      case 'low_audio':
        previousValue = preferencesRef.current.low_audio;
        preferencesRef.current.low_audio = value;
        if (isMountedRef.current) {
          setLowAudio(value);
        }
        break;
      case 'reduce_animations':
        previousValue = preferencesRef.current.reduce_animations;
        preferencesRef.current.reduce_animations = value;
        if (isMountedRef.current) {
          setReduceAnimations(value);
        }
        break;
      default:
        console.warn(`Unknown preference: ${preference}`);
        if (isMountedRef.current) {
          setSavingStatus('idle');
        }
        return;
    }
    
    // Increment pending requests counter after validation
    pendingRequestsRef.current += 1;

    try {
      // Build complete preferences from ref (always current, never stale)
      // This ensures rapid updates send the correct complete state
      const currentPreferences = { ...preferencesRef.current };

      // Send complete state to backend
      await api.patchUserProfile({ preferences: currentPreferences });

      console.log(`✓ Saved ${preference} = ${value}`);
      
      // Decrement pending requests counter (guarded to prevent negative values)
      if (pendingRequestsRef.current > 0) {
        pendingRequestsRef.current -= 1;
      }
      
      // Show success feedback only for the latest request (race condition handling)
      // Only update state if component is still mounted (memory leak prevention)
      if (isMountedRef.current && currentRequestId === requestIdRef.current) {
        setSavingStatus('saved');
        
        // Show non-intrusive toast notification
        toast.success('Preference saved', {
          duration: 2000,
          position: 'bottom-right',
          style: {
            background: reduceAnimations ? '#10b981' : undefined,
          },
        });
        
        // Reset status after 2 seconds, but only if no requests are pending
        const successTimeoutId = setTimeout(() => {
          if (isMountedRef.current && pendingRequestsRef.current === 0) {
            setSavingStatus('idle');
          }
        }, 2000);
        timeoutIdsRef.current.push(successTimeoutId);
      }
    } catch (err) {
      console.error(`Failed to update ${preference}:`, err);
      
      // CENTRALIZED AUTH FAILURE HANDLING
      // Check if error is due to authentication failure (401)
      if (err.status === 401) {
        console.warn('Authentication failed during preference update. Triggering global logout...');
        
        // Decrement before logout (guarded to prevent negative values)
        if (pendingRequestsRef.current > 0) {
          pendingRequestsRef.current -= 1;
        }
        
        // Show error toast
        toast.error('Session expired. Please login again.', {
          duration: 4000,
          position: 'top-center',
        });
        
        // Trigger centralized logout via callback (if provided)
        if (onAuthFailure && typeof onAuthFailure === 'function') {
          onAuthFailure();
        }
        
        return; // Exit early - logout will reset all state
      }
      
      // Decrement pending requests counter for non-auth errors (guarded)
      if (pendingRequestsRef.current > 0) {
        pendingRequestsRef.current -= 1;
      }
      
      // Only rollback if this is still the latest request (race condition handling)
      // Only update state if component is still mounted (memory leak prevention)
      if (isMountedRef.current && currentRequestId === requestIdRef.current) {
        // Robust rollback: Restore entire previous state
        preferencesRef.current = previousPreferences;
        
        // Rollback React state to previous value
        switch (preference) {
          case 'dark_mode':
            setDarkMode(previousValue);
            break;
          case 'low_audio':
            setLowAudio(previousValue);
            break;
          case 'reduce_animations':
            setReduceAnimations(previousValue);
            break;
        }
        
        // Show error feedback
        setSavingStatus('error');
        
        // Show non-intrusive toast notification with specific error message
        toast.error(err.message || 'Failed to save preference. Changes reverted.', {
          duration: 3000,
          position: 'bottom-right',
        });
        
        console.error(`⚠️ Failed to save ${preference}. Changes reverted.`);
        
        // Reset status after 3 seconds, but only if no requests are pending
        const errorTimeoutId = setTimeout(() => {
          if (isMountedRef.current && pendingRequestsRef.current === 0) {
            setSavingStatus('idle');
          }
        }, 3000);
        timeoutIdsRef.current.push(errorTimeoutId);
      } else {
        console.log(`Ignoring error for stale request ${currentRequestId} (latest is ${requestIdRef.current})`);
      }
    }
  };

  const value = {
    darkMode,
    lowAudio,
    reduceAnimations,
    savingStatus,
    updatePreference,
  };

  return (
    <SensoryContext.Provider value={value}>
      {children}
    </SensoryContext.Provider>
  );
};

