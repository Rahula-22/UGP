import React from 'react';
import { Zap } from 'lucide-react';

function WellnessPointsCard({ points, pointsBreakdown }) {
  // pointsBreakdown example: { moodCheckin: 10, chat: 15, assessment: 20, breathingExercise: 5, gratitudeEntry: 8 }

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

        @keyframes spark {
          0%, 100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.7;
            transform: scale(1.1);
          }
        }

        @keyframes pointsFloat {
          from {
            opacity: 0;
            transform: scale(0.5);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        .points-header {
          animation: slideIn 0.4s ease-out;
        }

        .points-icon {
          animation: spark 2s ease-in-out infinite;
        }

        .points-display {
          animation: pointsFloat 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        .breakdown-item {
          animation: slideIn 0.4s ease-out;
          transition: all 0.3s ease;
        }

        .breakdown-item:hover {
          transform: translateX(4px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .breakdown-item:nth-child(1) { animation-delay: 0.1s; }
        .breakdown-item:nth-child(2) { animation-delay: 0.15s; }
        .breakdown-item:nth-child(3) { animation-delay: 0.2s; }
        .breakdown-item:nth-child(4) { animation-delay: 0.25s; }
        .breakdown-item:nth-child(5) { animation-delay: 0.3s; }
      `}</style>

      <div className="flex items-start justify-between gap-4 mb-6 points-header">
        <div>
          <div className="text-base font-extrabold tracking-tight text-gray-900">Your Care Score</div>
          <div className="mt-1 text-sm text-gray-600">
            Track your self-care journey.
          </div>
        </div>
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 text-white shadow points-icon">
          <Zap className="h-6 w-6" />
        </div>
      </div>

      <div className="rounded-2xl bg-gradient-to-br from-violet-50 to-purple-50 p-6 ring-1 ring-violet-200/60 mb-6 points-display">
        <div className="text-xs font-semibold text-violet-700 uppercase tracking-wide">Your Progress</div>
        <div className="mt-3 flex items-baseline gap-3">
          <div className="text-5xl font-extrabold text-violet-600">{points}</div>
          <div className="text-sm font-semibold text-violet-600">progress</div>
        </div>
        <div className="mt-3 text-sm text-violet-700">
          Every moment of self-care counts.
        </div>
      </div>

    </div>
  );
}

export default WellnessPointsCard;
