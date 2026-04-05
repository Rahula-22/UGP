import React, { useState, useEffect } from "react";
import { Wind, Play, Pause, RotateCcw } from "lucide-react";

function BreathingGame() {
  const [isActive, setIsActive] = useState(false);
  const [phase, setPhase] = useState("idle"); // idle, inhale, hold, exhale
  const [circleScale, setCircleScale] = useState(1);
  const [sessionTime, setSessionTime] = useState(0);
  const [breathCount, setBreathCount] = useState(0);

  const phases = {
    idle: { duration: 0, text: "Ready?", scale: 1, color: "from-sky-400 to-blue-400" },
    inhale: { duration: 5, text: "Breathe in calm", scale: 1.8, color: "from-emerald-400 to-teal-400" },
    hold: { duration: 4, text: "Hold your breath", scale: 1.8, color: "from-violet-400 to-purple-400" },
    exhale: { duration: 6, text: "Breathe out stress", scale: 0.6, color: "from-rose-400 to-orange-400" },
    buffer: { duration: 3, text: "Rest & reset", scale: 1, color: "from-blue-300 to-cyan-300" },
  };

  useEffect(() => {
    if (!isActive) return;

    const phaseOrder = ["inhale", "hold", "exhale", "buffer"];
    let currentPhaseIndex = 0;
    let elapsedTime = 0;

    const interval = setInterval(() => {
      const currentPhase = phases[phaseOrder[currentPhaseIndex]];
      const phaseProgress = (elapsedTime % (currentPhase.duration * 1000)) / (currentPhase.duration * 1000);

      // Set phase and animate circle
      setPhase(phaseOrder[currentPhaseIndex]);

      if (phaseOrder[currentPhaseIndex] === "inhale") {
        setCircleScale(1 + (currentPhase.scale - 1) * phaseProgress);
      } else if (phaseOrder[currentPhaseIndex] === "exhale") {
        setCircleScale(1.8 - (1.8 - currentPhase.scale) * phaseProgress);
      } else {
        setCircleScale(currentPhase.scale);
      }

      // Move to next phase
      if (elapsedTime > 0 && elapsedTime % (currentPhase.duration * 1000) < 50) {
        currentPhaseIndex = (currentPhaseIndex + 1) % phaseOrder.length;
        if (currentPhaseIndex === 0) {
          setBreathCount((c) => c + 1);
        }
      }

      elapsedTime += 50;
      setSessionTime(Math.floor(elapsedTime / 1000));
    }, 50);

    return () => clearInterval(interval);
  }, [isActive]);

  const handleReset = () => {
    setIsActive(false);
    setPhase("idle");
    setCircleScale(1);
    setSessionTime(0);
    setBreathCount(0);
  };

  const currentPhaseData = phases[phase];

  return (
    <div className="rounded-3xl border border-gray-200/70 bg-gradient-to-br from-white via-sky-50/50 to-blue-50/50 p-6 shadow-sm backdrop-blur sm:p-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500 to-cyan-600 text-white shadow">
          <Wind className="h-6 w-6" />
        </div>
        <div>
          <div className="text-base font-extrabold tracking-tight text-gray-900">Serenity Circle Breathing</div>
          <div className="mt-1 text-sm text-gray-600">Synchronize your breath with the expanding and contracting circle</div>
        </div>
      </div>

      <div className="flex flex-col items-center justify-center gap-8">
        {/* Animated Circle */}
        <div className="relative flex h-64 w-64 items-center justify-center">
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-sky-100 to-blue-100 opacity-20 blur-3xl" />

          <div
            className={`relative flex h-56 w-56 items-center justify-center rounded-full bg-gradient-to-br ${currentPhaseData.color} shadow-2xl transition-transform duration-300 ease-in-out`}
            style={{
              transform: `scale(${circleScale})`,
              opacity: isActive ? 0.8 : 0.5,
            }}
          />

          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="text-center">
              <div className="text-3xl font-extrabold tracking-tight text-gray-900">{currentPhaseData.text}</div>
              {isActive && (
                <div className="mt-4 text-lg font-bold text-sky-600">
                  Breath {breathCount > 0 ? breathCount : 1}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 w-full">
          <div className="rounded-2xl bg-white/70 p-4 ring-1 ring-gray-200/70">
            <div className="text-xs font-semibold text-gray-600">Duration</div>
            <div className="mt-1 text-2xl font-extrabold text-gray-900">{sessionTime}s</div>
          </div>
          <div className="rounded-2xl bg-white/70 p-4 ring-1 ring-gray-200/70">
            <div className="text-xs font-semibold text-gray-600">Breaths</div>
            <div className="mt-1 text-2xl font-extrabold text-gray-900">{breathCount}</div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => setIsActive(!isActive)}
            className={`inline-flex items-center justify-center gap-2 rounded-2xl px-6 py-3 text-sm font-semibold text-white shadow transition ${
              isActive
                ? "bg-gradient-to-r from-rose-500 to-orange-500 hover:from-rose-600 hover:to-orange-600"
                : "bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700"
            }`}
          >
            {isActive ? (
              <>
                <Pause className="h-4 w-4" />
                Pause
              </>
            ) : (
              <>
                <Play className="h-4 w-4" />
                Start
              </>
            )}
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-6 py-3 text-sm font-semibold text-gray-700 shadow ring-1 ring-gray-200/70 hover:bg-gray-50"
          >
            <RotateCcw className="h-4 w-4" />
            Reset
          </button>
        </div>

        {/* Tips */}
        <div className="w-full rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 p-4 ring-1 ring-emerald-200/70">
          <div className="text-xs font-semibold text-emerald-700 mb-2">💡 About this pattern:</div>
          <div className="text-sm text-emerald-900 space-y-1">
            <p>• Inhale: 5 seconds (deeper breath intake)</p>
            <p>• Hold: 4 seconds (maintain calm state)</p>
            <p>• Exhale: 7 seconds (extended release of tension)</p>
            <p>• Buffer: 3 seconds (rest between cycles)</p>
            <p>• Total cycle: 19 seconds per breath</p>
            <p className="mt-2 font-semibold">Start with 3-5 cycles and gradually build endurance</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BreathingGame;
