import React from "react";

function DailyMoodCheckIn({ currentMood, onMoodSelect, hasCheckedInToday }) {
  const moods = [
    { id: "happy", emoji: "😊", label: "Happy", color: "bg-yellow-50 border-yellow-200 hover:bg-yellow-100" },
    { id: "calm", emoji: "😌", label: "Calm", color: "bg-blue-50 border-blue-200 hover:bg-blue-100" },
    { id: "neutral", emoji: "😐", label: "Neutral", color: "bg-gray-50 border-gray-200 hover:bg-gray-100" },
    { id: "sad", emoji: "😢", label: "Sad", color: "bg-purple-50 border-purple-200 hover:bg-purple-100" },
    { id: "stressed", emoji: "😰", label: "Stressed", color: "bg-orange-50 border-orange-200 hover:bg-orange-100" },
  ];

  const handleMoodSelect = (moodId) => {
    onMoodSelect(moodId);
  };

  return (
    <div className="rounded-3xl border border-gray-200/70 bg-white/80 p-6 shadow-sm backdrop-blur sm:p-8">
      <style>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes pulse-scale {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.05);
          }
        }

        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-2px);
          }
        }

        .mood-button {
          animation: slideIn 0.3s ease-out forwards;
        }

        .mood-button:nth-child(1) { animation-delay: 0.05s; }
        .mood-button:nth-child(2) { animation-delay: 0.1s; }
        .mood-button:nth-child(3) { animation-delay: 0.15s; }
        .mood-button:nth-child(4) { animation-delay: 0.2s; }
        .mood-button:nth-child(5) { animation-delay: 0.25s; }

        .mood-button:hover {
          animation: float 2s ease-in-out infinite;
        }

        .mood-button.selected {
          animation: pulse-scale 0.6s ease-out;
        }

        .success-message {
          animation: slideIn 0.4s ease-out;
        }

        .checkmark {
          animation: slideIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
      `}</style>

      <div className="flex items-center justify-between gap-4 mb-6">
        <div>
          <div className="text-lg font-extrabold tracking-tight text-gray-900">How are you feeling today?</div>
          <div className="mt-1 text-sm text-gray-600">
            {hasCheckedInToday
              ? "Thank you for checking in today."
              : "Share your mood with us. This is just for you."}
          </div>
        </div>
        {hasCheckedInToday && (
          <div className="rounded-2xl bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-200 success-message">
            ✓ Done today
          </div>
        )}
      </div>

      <div className="grid grid-cols-5 gap-4">
        {moods.map((mood) => (
          <button
            key={mood.id}
            onClick={() => handleMoodSelect(mood.id)}
            className={`mood-button relative flex flex-col items-center gap-3 rounded-2xl border-2 p-4 text-center transition ${
              currentMood === mood.id
                ? "selected border-emerald-500 bg-emerald-50/50 ring-2 ring-emerald-300"
                : "border-gray-200 " + mood.color
            }`}
          >
            <div className="text-3xl">{mood.emoji}</div>
            <div className="text-xs font-semibold text-gray-700">{mood.label}</div>
            {currentMood === mood.id && (
              <div className="checkmark absolute -top-2 -right-2 h-5 w-5 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs font-bold">
                ✓
              </div>
            )}
          </button>
        ))}
      </div>

      {currentMood && !hasCheckedInToday && (
        <div className="mt-6 rounded-2xl bg-emerald-50 p-4 border border-emerald-200 success-message">
          <div className="text-sm leading-relaxed text-emerald-900">
            ✨ <span className="font-semibold">Thank you for checking in.</span> Small steps matter. You are doing
            your best and that is enough.
          </div>
        </div>
      )}
    </div>
  );
}

export default DailyMoodCheckIn;
