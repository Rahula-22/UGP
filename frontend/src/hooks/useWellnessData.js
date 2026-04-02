import { useState, useEffect, useCallback } from "react";
import { api } from "../services/api";

export const useWellnessData = (sessionToken) => {
  const [wellnessPoints, setWellnessPoints] = useState(0);
  const [streak, setStreak] = useState(0);
  const [longestStreak, setLongestStreak] = useState(0);
  const [badges, setBadges] = useState([]);
  const [gratitudeEntries, setGratitudeEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      if (!sessionToken) return;

      try {
        setLoading(true);
        setError(null);

        // Fetch all data in parallel
        const [statsRes, badgesRes, gratitudeRes] = await Promise.all([
          api.getWellnessStats(sessionToken),
          api.getBadges(sessionToken),
          api.getGratitudeEntries(sessionToken),
        ]);

        if (statsRes.stats) {
          setWellnessPoints(statsRes.stats.wellness_points || 0);
          setStreak(statsRes.stats.current_streak || 0);
          setLongestStreak(statsRes.stats.longest_streak || 0);
        }

        if (badgesRes.badges) {
          setBadges(badgesRes.badges);
        }

        if (gratitudeRes.entries) {
          setGratitudeEntries(gratitudeRes.entries);
        }
      } catch (err) {
        setError(err.message);
        console.error("Failed to load wellness data:", err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [sessionToken]);

  // Add points
  const addPoints = useCallback(
    async (points) => {
      if (!sessionToken) return;

      try {
        const newTotal = wellnessPoints + points;
        setWellnessPoints(newTotal);

        await api.updateWellnessStats(sessionToken, { points });
      } catch (err) {
        console.error("Failed to add points:", err);
        setWellnessPoints(wellnessPoints); // Rollback
      }
    },
    [sessionToken, wellnessPoints]
  );

  // Update streak
  const updateStreak = useCallback(
    async (currentStreak, longestStreakVal) => {
      if (!sessionToken) return;

      try {
        setStreak(currentStreak);
        setLongestStreak(longestStreakVal);

        await api.updateWellnessStats(sessionToken, {
          streak: currentStreak,
          longest_streak: longestStreakVal,
        });
      } catch (err) {
        console.error("Failed to update streak:", err);
      }
    },
    [sessionToken]
  );

  // Add badge
  const addBadge = useCallback(
    async (badgeId, badgeName) => {
      if (!sessionToken) return;

      try {
        const result = await api.addBadge(sessionToken, badgeId, badgeName);

        if (result.success) {
          setBadges([
            ...badges,
            { badge_id: badgeId, badge_name: badgeName, created_at: new Date().toISOString() },
          ]);
        }

        return result;
      } catch (err) {
        console.error("Failed to add badge:", err);
        throw err;
      }
    },
    [sessionToken, badges]
  );

  // Add gratitude entry
  const addGratitudeEntry = useCallback(
    async (entryText) => {
      if (!sessionToken) return;

      try {
        const result = await api.addGratitudeEntry(sessionToken, entryText);

        if (result.success) {
          setGratitudeEntries([
            {
              id: result.entry_id,
              entry_text: entryText,
              created_at: new Date().toISOString(),
            },
            ...gratitudeEntries,
          ]);
        }

        return result;
      } catch (err) {
        console.error("Failed to add gratitude entry:", err);
        throw err;
      }
    },
    [sessionToken, gratitudeEntries]
  );

  return {
    wellnessPoints,
    streak,
    longestStreak,
    badges,
    gratitudeEntries,
    loading,
    error,
    addPoints,
    updateStreak,
    addBadge,
    addGratitudeEntry,
  };
};
