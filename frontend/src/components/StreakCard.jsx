import React from 'react';
import { Flame } from 'lucide-react';

function StreakCard({ streak, longestStreak }) {
  return (
    <div className="rounded-3xl border border-gray-200/70 bg-white/80 p-6 shadow-sm backdrop-blur">
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

        @keyframes flameFlicker {
          0%, 100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.8;
            transform: scale(1.05);
          }
        }

        @keyframes countUp {
          from {
            opacity: 0;
            transform: scale(0.8);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        .streak-header {
          animation: slideIn 0.4s ease-out;
        }

        .streak-flame {
          animation: flameFlicker 2s ease-in-out infinite;
        }

        .streak-number {
          animation: countUp 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        .streak-box {
          animation: slideIn 0.4s ease-out;
        }

        .streak-box:nth-child(1) {
          animation-delay: 0.1s;
        }

        .streak-box:nth-child(2) {
          animation-delay: 0.2s;
        }

        .progress-bar {
          animation: slideIn 0.6s ease-out 0.3s both;
        }

        .progress-fill {
          animation: slideIn 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) 0.4s both;
        }
      `}</style>

      <div className="flex items-start justify-between gap-4 mb-6 streak-header">
        <div>
          <div className="text-base font-extrabold tracking-tight text-gray-900">Care Streak</div>
          <div className="mt-1 text-sm text-gray-600">
            Every check-in is an act of self-care.
          </div>
        </div>
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-400 to-red-500 text-white shadow streak-flame">
          <Flame className="h-6 w-6" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="streak-box rounded-2xl bg-gradient-to-br from-orange-50 to-red-50 p-5 ring-1 ring-orange-200/60">
          <div className="text-xs font-semibold text-orange-700 uppercase tracking-wide">This Week</div>
          <div className="mt-3 flex items-baseline gap-2">
            <div className="streak-number text-4xl font-extrabold text-orange-600">{streak}</div>
            <div className="text-sm text-orange-600">check-ins</div>
          </div>
          <div className="mt-3 text-xs text-orange-700">
            {streak === 0
              ? 'Ready to check in?'
              : `Thank you for showing up ${streak} ${streak === 1 ? 'time' : 'times'} this week.`}
          </div>
        </div>

        <div className="streak-box rounded-2xl bg-gradient-to-br from-sky-50 to-violet-50 p-5 ring-1 ring-sky-200/60">
          <div className="text-xs font-semibold text-sky-700 uppercase tracking-wide">Best Week</div>
          <div className="mt-3 flex items-baseline gap-2">
            <div className="streak-number text-4xl font-extrabold text-sky-600">{longestStreak}</div>
            <div className="text-sm text-sky-600">check-ins</div>
          </div>
          <div className="mt-3 text-xs text-sky-700">
            Your best effort. Every week is a fresh start.
          </div>
        </div>
      </div>

      {streak > 0 && (
        <div className="progress-bar mt-5 h-2 rounded-full bg-gray-200/50 overflow-hidden">
          <div
            className="progress-fill h-full bg-gradient-to-r from-orange-400 to-red-500 rounded-full transition-all duration-1000"
            style={{ width: `${Math.min((streak / longestStreak) * 100, 100)}%` }}
          />
        </div>
      )}
    </div>
  );
}

export default StreakCard;
