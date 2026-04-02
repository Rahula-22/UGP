import { useState, useCallback, useEffect } from "react";
import { api } from "../services/api";

export const useMoodCheckIn = (sessionToken) => {
  const [currentMood, setCurrentMood] = useState(null);
  const [hasCheckedInToday, setHasCheckedInToday] = useState(false);
  const [lastCheckInDate, setLastCheckInDate] = useState(null);
  const [loading, setLoading] = useState(false);

  // Check if already checked in today
  useEffect(() => {
    const checkInStatus = localStorage.getItem("lastMoodCheckInDate");
    const today = new Date().toDateString();

    if (checkInStatus === today) {
      setHasCheckedInToday(true);
      const saved = localStorage.getItem("currentMood");
      if (saved) setCurrentMood(saved);
    }
  }, []);

  const handleMoodSelect = useCallback(
    async (mood, sessionToken) => {
      setLoading(true);
      try {
        const today = new Date().toDateString();

        // Save mood locally
        setCurrentMood(mood);
        setHasCheckedInToday(true);
        setLastCheckInDate(today);

        localStorage.setItem("currentMood", mood);
        localStorage.setItem("lastMoodCheckInDate", today);

        // Save to backend
        await api.saveMoodEntry(sessionToken, getMoodScore(mood));

        // Add points for mood check-in
        return { success: true, pointsEarned: 10 };
      } catch (err) {
        console.error("Failed to save mood:", err);
        return { success: false, error: err.message };
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const getMoodScore = (mood) => {
    const scores = { happy: 5, calm: 4, neutral: 3, sad: 2, stressed: 1 };
    return scores[mood] || 3;
  };

  return {
    currentMood,
    hasCheckedInToday,
    lastCheckInDate,
    loading,
    handleMoodSelect,
  };
};

export const calculateStreak = (lastCheckInDate) => {
  if (!lastCheckInDate) return 0;

  const last = new Date(lastCheckInDate);
  const today = new Date();

  const diffTime = Math.abs(today - last);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  // If checked in yesterday or today, streak continues
  if (diffDays <= 1) return true;
  return false;
};
