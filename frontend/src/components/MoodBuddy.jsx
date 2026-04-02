import React, { useEffect, useState } from "react";
import { Smile, Heart, MessageCircle } from "lucide-react";

function MoodBuddy({ userMood }) {
  const [message, setMessage] = useState("");
  const [isAnimating, setIsAnimating] = useState(false);

  const messages = {
    happy: [
      "You did something good by showing up today.",
      "I am proud of you for checking in.",
      "Keep spreading that positive energy!",
      "Your happiness brightens my day too.",
    ],
    calm: [
      "I am here with you.",
      "You are doing great staying present.",
      "Breathe. You have got this.",
      "Peace looks good on you.",
    ],
    neutral: [
      "Let us take one small step today.",
      "You are doing your best and that is enough.",
      "All feelings are welcome here.",
      "Progress, not perfection.",
    ],
    sad: [
      "I am here with you, always.",
      "Your feelings are valid and important.",
      "It is okay to have hard days.",
      "You deserve kindness, especially from yourself.",
    ],
    stressed: [
      "Let me help you find calm.",
      "One breath at a time.",
      "You are stronger than this moment.",
      "Small steps lead to big changes.",
    ],
  };

  useEffect(() => {
    const moodMessages = messages[userMood] || messages.neutral;
    const randomMessage = moodMessages[Math.floor(Math.random() * moodMessages.length)];
    setMessage(randomMessage);
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 500);
  }, [userMood]);

  const getMoodEmoji = () => {
    switch (userMood) {
      case "happy":
        return "😊";
      case "calm":
        return "😌";
      case "neutral":
        return "😐";
      case "sad":
        return "😢";
      case "stressed":
        return "😰";
      default:
        return "🌟";
    }
  };

  return (
    <div className="rounded-3xl border border-emerald-200/60 bg-gradient-to-br from-emerald-50/60 to-teal-50/40 p-6 shadow-sm">
      <div className="flex items-start gap-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 text-4xl shadow-md flex-shrink-0">
          {getMoodEmoji()}
        </div>

        <div className="flex-1 pt-1">
          <div className="text-sm font-semibold text-emerald-900">Mood Buddy</div>
          <div
            className={`mt-2 text-sm leading-relaxed text-emerald-800 transition-all duration-500 ${
              isAnimating ? "opacity-0 scale-95" : "opacity-100 scale-100"
            }`}
          >
            "{message}"
          </div>
        </div>
      </div>
    </div>
  );
}

export default MoodBuddy;
