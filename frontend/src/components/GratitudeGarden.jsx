import React from 'react';
import { Sprout, Plus } from 'lucide-react';

function GratitudeGarden({ gratitudeEntries, onAddGratitude }) {
  const plants = ['🌱', '🌿', '🪴', '🌻', '🌹', '🌸', '🌼', '🌳', '🌲', '🍀'];

  // Create visual representation based on entry count
  const displayPlants = gratitudeEntries && gratitudeEntries.length > 0
    ? plants.slice(0, Math.min(gratitudeEntries.length, plants.length))
    : [];

  return (
    <div className="rounded-3xl border border-gray-200/70 bg-white/80 p-6 shadow-sm backdrop-blur sm:p-8">
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <Sprout className="h-5 w-5 text-emerald-600" />
            <div className="text-base font-extrabold tracking-tight text-gray-900">Your Gratitude Garden</div>
          </div>
          <div className="mt-1 text-sm text-gray-600">
            Each entry plants a seed of appreciation. Watch your garden grow.
          </div>
        </div>
      </div>

      {/* Garden Visualization */}
      <div className="rounded-2xl bg-gradient-to-b from-sky-50 via-white to-emerald-50/30 p-8 mb-6 min-h-28 flex items-end justify-center gap-3 ring-1 ring-gray-200/60">
        {displayPlants.length === 0 ? (
          <div className="text-center py-8 flex flex-col items-center justify-center">
            <div className="text-5xl mb-4 opacity-50">🌱</div>
            <p className="text-gray-600 text-sm">Your garden is waiting for you.</p>
            <p className="text-gray-500 text-xs mt-1">Add a gratitude entry to plant your first seed.</p>
          </div>
        ) : (
          displayPlants.map((plant, idx) => (
            <div key={idx} className="text-4xl animate-bounce" style={{ animationDelay: `${idx * 0.1}s` }}>
              {plant}
            </div>
          ))
        )}
      </div>

      {/* Progress Stats */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 p-4 ring-1 ring-emerald-200/60">
          <div className="text-xs font-semibold text-emerald-700 uppercase">Entries</div>
          <div className="mt-2 text-3xl font-extrabold text-emerald-600">
            {gratitudeEntries?.length || 0}
          </div>
        </div>
        <div className="rounded-2xl bg-gradient-to-br from-sky-50 to-cyan-50 p-4 ring-1 ring-sky-200/60">
          <div className="text-xs font-semibold text-sky-700 uppercase">Growing</div>
          <div className="mt-2 text-sm text-sky-700 font-semibold">
            {(gratitudeEntries?.length || 0) === 0 ? 'Need to start' : 'Keep going!'}
          </div>
        </div>
      </div>

      {/* Recent Entries */}
      {gratitudeEntries && gratitudeEntries.length > 0 && (
        <div className="mb-6">
          <div className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-3">Recent Gratitudes</div>
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {gratitudeEntries.slice(-3).reverse().map((entry, idx) => (
              <div key={idx} className="rounded-lg bg-gray-50/70 p-3 border border-gray-200/60 text-sm text-gray-700">
                "{entry.text || entry}"
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add Button */}
      <button
        onClick={onAddGratitude}
        className="w-full flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 px-4 py-3 text-sm font-semibold text-white shadow hover:from-emerald-600 hover:to-teal-700 transition"
      >
        <Plus className="h-4 w-4" />
        Add Gratitude Entry
      </button>
    </div>
  );
}

export default GratitudeGarden;
