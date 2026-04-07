'use client';

import { useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const SCOUT_MODE_KEY = 'flagfooty_scout_mode_dismissed';

export function useAuthGuard() {
  const { isAuthenticated } = useAuth();
  const [showScoutPopup, setShowScoutPopup] = useState(false);
  const [isScoutMode, setIsScoutMode] = useState(false);
  const [showScoutBanner, setShowScoutBanner] = useState(false);

  useEffect(() => {
    // Check if scout mode was already dismissed in this session
    if (typeof window !== 'undefined') {
      const dismissed = sessionStorage.getItem(SCOUT_MODE_KEY);
      if (dismissed === 'true') {
        setIsScoutMode(true);
      }
    }
  }, []);

  const handleInteraction = () => {
    // If authenticated, allow interaction without popup
    if (isAuthenticated) {
      return true;
    }

    // If in scout mode, allow interaction
    if (isScoutMode) {
      return true;
    }

    // If not authenticated and not in scout mode, show popup
    const dismissed = sessionStorage.getItem(SCOUT_MODE_KEY);
    if (dismissed !== 'true') {
      setShowScoutPopup(true);
      return false;
    }

    return true;
  };

  const dismissScoutPopup = () => {
    setShowScoutPopup(false);
  };

  const enterScoutMode = () => {
    sessionStorage.setItem(SCOUT_MODE_KEY, 'true');
    setIsScoutMode(true);
    setShowScoutPopup(false);
  };

  const handleSaveAction = () => {
    // If authenticated, allow save
    if (isAuthenticated) {
      return true;
    }

    // If not authenticated, show scout banner
    setShowScoutBanner(true);
    setTimeout(() => setShowScoutBanner(false), 5000);
    return false;
  };

  return {
    isAuthenticated,
    isScoutMode,
    showScoutPopup,
    showScoutBanner,
    handleInteraction,
    dismissScoutPopup,
    enterScoutMode,
    handleSaveAction,
  };
}
