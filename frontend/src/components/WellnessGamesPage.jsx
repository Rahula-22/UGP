import React, { useState, useEffect } from "react";
import { ArrowLeft, Gamepad2, Wind, Heart } from "lucide-react";
import BreathingGame from "./BreathingGame";
import PopNegativeThoughts from "./PopNegativeThoughts";

function WellnessGamesPage({ onNavigate, initialGame = null }) {
  const [selectedGame, setSelectedGame] = useState(null);

  const games = [
    {
      id: "breathing",
      name: "Serenity Circle Breathing",
      description: "Deep breathing exercise with 5-4-6 pattern. Inhale, hold, exhale, rest. Each cycle 18 seconds.",
      icon: Wind,
      color: "from-sky-500 to-cyan-600",
      duration: "3-10 min",
      benefits: ["Deep relaxation", "Lowers anxiety", "Improves lung capacity"],
      component: <BreathingGame />,
    },
    {
      id: "thoughts",
      name: "Transform Your Thoughts",
      description: "Click thought clouds to transform negative beliefs into compassionate affirmations. Practice cognitive reframing.",
      icon: Heart,
      color: "from-violet-500 to-purple-600",
      duration: "3-5 min",
      benefits: ["Reframes limiting beliefs", "Builds resilience", "Improves mindset"],
      component: <PopNegativeThoughts />,
    },
  ];

  useEffect(() => {
    if (initialGame) {
      setSelectedGame(initialGame);
    }
  }, [initialGame]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-violet-50">
      {/* Header */}
      <div className="sticky top-0 z-20 border-b border-gray-200/70 bg-white/70 backdrop-blur">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => onNavigate("dashboard")}
              className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-gray-600 shadow-sm ring-1 ring-gray-200/70 hover:bg-gray-50 hover:text-gray-900 transition"
              title="Back to dashboard"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 text-white shadow">
                  <Gamepad2 className="h-6 w-6" />
                </div>
                <div className="leading-tight">
                  <div className="text-sm font-extrabold tracking-tight text-gray-900">Wellness Games</div>
                  <div className="text-xs text-gray-500">Interactive tools for mental health</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10">
        {!selectedGame ? (
          <>
            {/* Welcome Section */}
            <div className="rounded-3xl border border-gray-200/70 bg-white/70 p-6 shadow-sm backdrop-blur sm:p-8 mb-8">
              <div className="max-w-3xl">
                <div className="inline-flex items-center gap-2 rounded-full border border-purple-200 bg-white/70 px-3 py-1 text-xs font-semibold text-purple-700 mb-4">
                  <Gamepad2 className="h-4 w-4" />
                  Wellness Tools • Interactive
                </div>
                <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
                  Play & Heal
                </h1>
                <p className="mt-4 text-lg text-gray-600 leading-relaxed">
                  Science-backed interactive games designed to reduce stress, manage emotions, and build mental resilience. 
                  Each game is quick, effective, and based on proven therapeutic techniques used in apps like Calm and Headspace.
                </p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <div className="rounded-full bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700 ring-1 ring-emerald-200/70">
                    ✓ Evidence-based
                  </div>
                  <div className="rounded-full bg-sky-50 px-4 py-2 text-sm font-semibold text-sky-700 ring-1 ring-sky-200/70">
                    ✓ Quick sessions
                  </div>
                  <div className="rounded-full bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-700 ring-1 ring-rose-200/70">
                    ✓ Instantly calming
                  </div>
                </div>
              </div>
            </div>

            {/* Games Grid */}
            <div className="grid gap-6 md:grid-cols-2">
              {games.map((game) => {
                const Icon = game.icon;
                return (
                  <button
                    key={game.id}
                    type="button"
                    onClick={() => setSelectedGame(game.id)}
                    className="group rounded-3xl border border-gray-200/70 bg-white/80 p-6 shadow-sm backdrop-blur transition hover:shadow-lg hover:-translate-y-1 text-left"
                  >
                    {/* Top Section */}
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <div className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${game.color} text-white shadow-lg`}>
                        <Icon className="h-7 w-7" />
                      </div>
                      <div className="inline-flex rounded-full bg-purple-50 px-3 py-1 text-xs font-semibold text-purple-700 ring-1 ring-purple-200/70">
                        {game.duration}
                      </div>
                    </div>

                    {/* Title and Description */}
                    <div className="mb-4">
                      <h3 className="text-xl font-extrabold tracking-tight text-gray-900 mb-2">
                        {game.name}
                      </h3>
                      <p className="text-sm text-gray-600 leading-relaxed">
                        {game.description}
                      </p>
                    </div>

                    {/* Benefits */}
                    <div className="mb-6">
                      <div className="text-xs font-semibold text-gray-500 mb-2">Key Benefits:</div>
                      <div className="space-y-1">
                        {game.benefits.map((benefit, idx) => (
                          <div key={idx} className="text-sm text-gray-700 flex items-center gap-2">
                            <span className="text-green-500 font-bold">✓</span>
                            {benefit}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* CTA */}
                    <div className={`rounded-2xl bg-gradient-to-r ${game.color} p-0.5`}>
                      <div className={`rounded-2xl bg-gradient-to-r ${game.color} px-4 py-3 text-center text-sm font-semibold text-white group-hover:shadow-lg transition`}>
                        Start Game →
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Info Section */}
            <div className="mt-10 grid gap-6 md:grid-cols-2">
              <div className="rounded-3xl border border-sky-200/70 bg-sky-50/70 p-6 shadow-sm">
                <div className="flex items-start gap-3">
                  <div className="text-2xl">💡</div>
                  <div>
                    <div className="text-sm font-extrabold text-sky-900">Evidence-Based Design</div>
                    <div className="mt-2 text-sm text-sky-800 leading-relaxed">
                      Both games use proven psychological techniques including breathing exercises and cognitive reframing, 
                      as recognized by therapists and wellness apps worldwide.
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-3xl border border-emerald-200/70 bg-emerald-50/70 p-6 shadow-sm">
                <div className="flex items-start gap-3">
                  <div className="text-2xl">🎯</div>
                  <div>
                    <div className="text-sm font-extrabold text-emerald-900">Quick & Effective</div>
                    <div className="mt-2 text-sm text-emerald-800 leading-relaxed">
                      Sessions take 2-5 minutes. Research shows regular use improves emotional regulation and stress resilience 
                      even with short, consistent practice.
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-3xl border border-rose-200/70 bg-rose-50/70 p-6 shadow-sm">
                <div className="flex items-start gap-3">
                  <div className="text-2xl">🌱</div>
                  <div>
                    <div className="text-sm font-extrabold text-rose-900">Build Resilience</div>
                    <div className="mt-2 text-sm text-rose-800 leading-relaxed">
                      These games help you practice coping strategies in a safe environment, building mental strength 
                      and emotional awareness over time.
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-3xl border border-purple-200/70 bg-purple-50/70 p-6 shadow-sm">
                <div className="flex items-start gap-3">
                  <div className="text-2xl">✨</div>
                  <div>
                    <div className="text-sm font-extrabold text-purple-900">Supplement, Not Replace</div>
                    <div className="mt-2 text-sm text-purple-800 leading-relaxed">
                      These tools are designed for self-care and wellness support. They complement professional mental health care 
                      but do not replace therapy or medical treatment.
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Tips Section */}
            <div className="mt-10 rounded-3xl border border-gray-200/70 bg-white/70 p-6 shadow-sm backdrop-blur sm:p-8">
              <h2 className="text-xl font-extrabold tracking-tight text-gray-900 mb-6">Getting the Most from Wellness Games</h2>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-2xl bg-gradient-to-br from-blue-50 to-cyan-50 p-4 ring-1 ring-blue-200/70">
                  <div className="text-sm font-extrabold text-blue-900 mb-2">📅 Consistency Matters</div>
                  <div className="text-sm text-blue-800">
                    Try to use these games once daily. Regular practice compounds benefits over weeks and months.
                  </div>
                </div>

                <div className="rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 p-4 ring-1 ring-emerald-200/70">
                  <div className="text-sm font-extrabold text-emerald-900 mb-2">🧘 Find Your Routine</div>
                  <div className="text-sm text-emerald-800">
                    Morning breathing for energy, evening games for relaxation. Experiment to find what works best.
                  </div>
                </div>

                <div className="rounded-2xl bg-gradient-to-br from-rose-50 to-pink-50 p-4 ring-1 ring-rose-200/70">
                  <div className="text-sm font-extrabold text-rose-900 mb-2">🌍 Create Space</div>
                  <div className="text-sm text-rose-800">
                    Find a quiet, comfortable place. Even 2-3 minutes of focused practice creates measurable benefits.
                  </div>
                </div>

                <div className="rounded-2xl bg-gradient-to-br from-violet-50 to-purple-50 p-4 ring-1 ring-violet-200/70">
                  <div className="text-sm font-extrabold text-violet-900 mb-2">💭 Combine Tools</div>
                  <div className="text-sm text-violet-800">
                    Use games alongside mood check-ins, journaling, and chat to create a holistic wellness routine.
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Single Game View */}
            <div className="mb-6">
              <button
                type="button"
                onClick={() => setSelectedGame(null)}
                className="inline-flex items-center gap-2 rounded-2xl bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm ring-1 ring-gray-200/70 hover:bg-gray-50 transition"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Games
              </button>
            </div>

            {games.find((g) => g.id === selectedGame)?.component}
          </>
        )}
      </div>
    </div>
  );
}

export default WellnessGamesPage;
