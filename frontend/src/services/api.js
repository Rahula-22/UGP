const API_BASE_URL = "http://localhost:8000/api";

export const api = {
  // Wellness Stats
  getWellnessStats: async (sessionToken) => {
    const res = await fetch(`${API_BASE_URL}/wellness-stats/${sessionToken}`);
    if (!res.ok) throw new Error("Failed to fetch wellness stats");
    return res.json();
  },

  updateWellnessStats: async (sessionToken, updates) => {
    const res = await fetch(`${API_BASE_URL}/wellness-stats/update`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ session_token: sessionToken, ...updates }),
    });
    if (!res.ok) throw new Error("Failed to update wellness stats");
    return res.json();
  },

  // Badges
  addBadge: async (sessionToken, badgeId, badgeName) => {
    const res = await fetch(`${API_BASE_URL}/badges/add`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        session_token: sessionToken,
        badge_id: badgeId,
        badge_name: badgeName,
      }),
    });
    if (!res.ok) throw new Error("Failed to add badge");
    return res.json();
  },

  getBadges: async (sessionToken) => {
    const res = await fetch(`${API_BASE_URL}/badges/${sessionToken}`);
    if (!res.ok) throw new Error("Failed to fetch badges");
    return res.json();
  },

  // Gratitude Entries
  addGratitudeEntry: async (sessionToken, entryText) => {
    const res = await fetch(`${API_BASE_URL}/gratitude/add`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        session_token: sessionToken,
        entry_text: entryText,
      }),
    });
    if (!res.ok) throw new Error("Failed to add gratitude entry");
    return res.json();
  },

  getGratitudeEntries: async (sessionToken, limit = 50) => {
    const res = await fetch(`${API_BASE_URL}/gratitude/${sessionToken}?limit=${limit}`);
    if (!res.ok) throw new Error("Failed to fetch gratitude entries");
    return res.json();
  },

  // Mood Journal
  saveMoodEntry: async (sessionToken, moodScore, emotions = [], triggers = "", notes = "") => {
    const res = await fetch(`${API_BASE_URL}/mood-journal`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        session_token: sessionToken,
        mood_score: moodScore,
        emotions,
        triggers,
        notes,
      }),
    });
    if (!res.ok) throw new Error("Failed to save mood entry");
    return res.json();
  },

  getMoodJournal: async (sessionToken, limit = 30) => {
    const res = await fetch(`${API_BASE_URL}/mood-journal/${sessionToken}?limit=${limit}`);
    if (!res.ok) throw new Error("Failed to fetch mood journal");
    return res.json();
  },
};
