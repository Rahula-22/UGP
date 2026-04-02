import React from 'react';
import { Award } from 'lucide-react';

function BadgesSection({ unlockedBadges, lockedBadges }) {
  const allBadges = [
    {
      id: 'first-step',
      name: 'First Step',
      emoji: '👣',
      description: 'You took your first mood check-in',
      icon: '👣',
    },
    {
      id: 'brave-heart',
      name: 'Brave Heart',
      emoji: '❤️',
      description: 'You opened up in a chat conversation',
      icon: '❤️',
    },
    {
      id: 'calm-starter',
      name: 'Calm Starter',
      emoji: '🧘',
      description: 'You completed your first breathing exercise',
      icon: '🧘',
    },
    {
      id: '3-day-streak',
      name: '3-Day Streak',
      emoji: '🔥',
      description: 'You checked in for 3 days in a row',
      icon: '🔥',
    },
    {
      id: '7-day-streak',
      name: '7-Day Streak',
      emoji: '⚡',
      description: 'You checked in for 7 days in a row',
      icon: '⚡',
    },
    {
      id: 'reflection-writer',
      name: 'Reflection Writer',
      emoji: '✍️',
      description: 'You wrote 5 gratitude entries',
      icon: '✍️',
    },
    {
      id: 'getting-better',
      name: 'Getting Better',
      emoji: '📈',
      description: 'You earned 100 wellness points',
      icon: '📈',
    },
    {
      id: 'self-care-champion',
      name: 'Self-Care Champion',
      emoji: '👑',
      description: 'You reached a 30-day check-in streak',
      icon: '👑',
    },
  ];

  const badgesUnlocked = unlockedBadges || [];

  return (
    <div className="rounded-3xl border border-gray-200/70 bg-white/80 p-6 shadow-sm backdrop-blur sm:p-8">
      <div className="mb-6">
        <div className="flex items-center gap-2">
          <Award className="h-5 w-5 text-amber-600" />
          <div className="text-base font-extrabold tracking-tight text-gray-900">Your Small Wins</div>
        </div>
        <div className="mt-1 text-sm text-gray-600">
          Celebrate each step forward. Every moment of self-care matters.
        </div>
      </div>

      {/* Unlocked Badges */}
      {badgesUnlocked.length > 0 && (
        <div className="mb-8">
          <div className="mb-4 text-xs font-semibold text-emerald-700 uppercase tracking-wide">✓ Unlocked</div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {allBadges.map((badge) => (
              badgesUnlocked.includes(badge.id) && (
                <div
                  key={badge.id}
                  className="group rounded-2xl border-2 border-emerald-300 bg-gradient-to-br from-emerald-50 to-teal-50 p-4 text-center shadow-sm ring-1 ring-emerald-200/60 transition hover:shadow"
                >
                  <div className="text-4xl mb-2 group-hover:scale-110 transition">{badge.emoji}</div>
                  <div className="text-xs font-semibold text-gray-900">{badge.name}</div>
                  <div className="mt-2 text-xs text-gray-600 leading-tight">{badge.description}</div>
                </div>
              )
            ))}
          </div>
        </div>
      )}

      {/* Locked Badges */}
      {badgesUnlocked.length < allBadges.length && (
        <div>
          <div className="mb-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">🔒 Coming Soon</div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {allBadges.map((badge) => (
              !badgesUnlocked.includes(badge.id) && (
                <div
                  key={badge.id}
                  className="rounded-2xl border-2 border-gray-200 bg-gray-50/50 p-4 text-center opacity-60"
                >
                  <div className="text-4xl mb-2 grayscale">{badge.emoji}</div>
                  <div className="text-xs font-semibold text-gray-700">{badge.name}</div>
                  <div className="mt-2 text-xs text-gray-500 leading-tight">{badge.description}</div>
                </div>
              )
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default BadgesSection;
