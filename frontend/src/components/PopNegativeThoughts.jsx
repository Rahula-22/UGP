import React, { useState, useEffect, useRef } from "react";
import { RotateCcw, Heart } from "lucide-react";

function PopNegativeThoughts() {
  const negativeThoughts = [
    {
      id: 1,
      negative: "I am not good enough",
      positive: "I am trying and that is enough",
      color: "from-slate-200 to-slate-300",
    },
    {
      id: 2,
      negative: "I am stressed",
      positive: "This feeling will pass",
      color: "from-gray-200 to-slate-200",
    },
    {
      id: 3,
      negative: "I am alone",
      positive: "I am connected and supported",
      color: "from-slate-300 to-gray-300",
    },
    {
      id: 4,
      negative: "I am a failure",
      positive: "I am growing and learning",
      color: "from-gray-300 to-slate-300",
    },
    {
      id: 5,
      negative: "I cannot handle this",
      positive: "I have overcome challenges before",
      color: "from-slate-200 to-gray-200",
    },
    {
      id: 6,
      negative: "Nobody cares about me",
      positive: "I deserve love and care",
      color: "from-gray-200 to-slate-300",
    },
    {
      id: 7,
      negative: "I am broken",
      positive: "I am healing and whole",
      color: "from-slate-300 to-slate-200",
    },
    {
      id: 8,
      negative: "I will never be happy",
      positive: "Joy and peace are within reach",
      color: "from-gray-300 to-gray-200",
    },
  ];

  const [thoughts, setThoughts] = useState(negativeThoughts);
  const [transformedThoughts, setTransformedThoughts] = useState(new Set());
  const [burstingThoughts, setBurstingThoughts] = useState(new Set());
  const [showAllTransformed, setShowAllTransformed] = useState(false);
  const [sparkles, setSparkles] = useState([]);
  const [centerMessage, setCenterMessage] = useState("");
  const [showCenterMessage, setShowCenterMessage] = useState(false);
  const timersRef = useRef([]);

  const clearTimers = () => {
    timersRef.current.forEach((timerId) => window.clearTimeout(timerId));
    timersRef.current = [];
  };

  const playBurstSound = () => {
    try {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextClass) return;

      const audioContext = new AudioContextClass();
      const now = audioContext.currentTime;

      const masterGain = audioContext.createGain();
      masterGain.gain.setValueAtTime(0.0001, now);
      masterGain.gain.exponentialRampToValueAtTime(0.45, now + 0.01);
      masterGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.28);
      masterGain.connect(audioContext.destination);

      // Primary cracker hit.
      const snapOsc = audioContext.createOscillator();
      const snapGain = audioContext.createGain();
      snapOsc.type = "square";
      snapOsc.frequency.setValueAtTime(210, now);
      snapOsc.frequency.exponentialRampToValueAtTime(70, now + 0.07);
      snapGain.gain.setValueAtTime(0.0001, now);
      snapGain.gain.exponentialRampToValueAtTime(0.5, now + 0.004);
      snapGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.08);
      snapOsc.connect(snapGain);
      snapGain.connect(masterGain);
      snapOsc.start(now);
      snapOsc.stop(now + 0.09);

      const createCrackle = (startAt, bandFreq, peakGain) => {
        const crackBuffer = audioContext.createBuffer(1, audioContext.sampleRate * 0.1, audioContext.sampleRate);
        const crackData = crackBuffer.getChannelData(0);
        for (let i = 0; i < crackData.length; i += 1) {
          const fade = 1 - i / crackData.length;
          crackData[i] = (Math.random() * 2 - 1) * fade * fade;
        }

        const crackSource = audioContext.createBufferSource();
        crackSource.buffer = crackBuffer;

        const bandPass = audioContext.createBiquadFilter();
        bandPass.type = "bandpass";
        bandPass.frequency.setValueAtTime(bandFreq, now + startAt);
        bandPass.Q.setValueAtTime(2.2, now + startAt);

        const crackGain = audioContext.createGain();
        crackGain.gain.setValueAtTime(0.0001, now + startAt);
        crackGain.gain.exponentialRampToValueAtTime(peakGain, now + startAt + 0.006);
        crackGain.gain.exponentialRampToValueAtTime(0.0001, now + startAt + 0.085);

        crackSource.connect(bandPass);
        bandPass.connect(crackGain);
        crackGain.connect(masterGain);
        crackSource.start(now + startAt);
        crackSource.stop(now + startAt + 0.095);
      };

      // Layered crackles emulate Diwali cracker texture.
      createCrackle(0.012, 2500, 0.34);
      createCrackle(0.04, 3200, 0.27);
      createCrackle(0.075, 2100, 0.23);

      [0.03, 0.06].forEach((offset, index) => {
        const sparkleOsc = audioContext.createOscillator();
        const sparkleGain = audioContext.createGain();
        sparkleOsc.type = index === 0 ? "triangle" : "sine";
        sparkleOsc.frequency.setValueAtTime(index === 0 ? 1180 : 1620, now + offset);
        sparkleOsc.frequency.exponentialRampToValueAtTime(index === 0 ? 860 : 1180, now + offset + 0.05);
        sparkleGain.gain.setValueAtTime(0.0001, now + offset);
        sparkleGain.gain.exponentialRampToValueAtTime(0.09, now + offset + 0.01);
        sparkleGain.gain.exponentialRampToValueAtTime(0.0001, now + offset + 0.08);
        sparkleOsc.connect(sparkleGain);
        sparkleGain.connect(masterGain);
        sparkleOsc.start(now + offset);
        sparkleOsc.stop(now + offset + 0.09);
      });

      window.setTimeout(() => {
        audioContext.close().catch(() => {});
      }, 300);
    } catch {
      // Ignore audio failures so the game still works.
    }
  };

  const createSparkles = (thoughtId) => {
    const groupId = `${thoughtId}-${Date.now()}`;
    const generatedSparkles = Array.from({ length: 28 }, (_, index) => ({
      id: `${groupId}-${index}`,
      groupId,
      left: `${48 + (Math.random() * 10 - 5)}%`,
      top: `${66 + (Math.random() * 8 - 4)}%`,
      size: 2 + (index % 4),
      length: 14 + (index % 8),
      angle: -120 + (index * 9 + Math.random() * 8),
      delay: `${index * 18}ms`,
      hue: index % 3 === 0 ? "bg-yellow-200" : index % 3 === 1 ? "bg-amber-300" : "bg-yellow-100",
    }));

    setSparkles((current) => [...current, ...generatedSparkles]);
    window.setTimeout(() => {
      setSparkles((current) => current.filter((sparkle) => sparkle.groupId !== groupId));
    }, 1200);
  };

  const handleTransformThought = (id) => {
    clearTimers();
    setCenterMessage("");
    setShowCenterMessage(false);

    playBurstSound();
    createSparkles(id);
    setBurstingThoughts((prev) => new Set(prev).add(id));

    const burstTimer = window.setTimeout(() => {
      setTransformedThoughts((prev) => new Set(prev).add(id));
      setBurstingThoughts((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }, 3000);

    const messageTimer = window.setTimeout(() => {
      const thought = thoughts.find((item) => item.id === id);
      setCenterMessage(thought?.positive || "You are doing your best, and that is enough.");
      window.setTimeout(() => setShowCenterMessage(true), 30);

      const hideMessageTimer = window.setTimeout(() => {
        setShowCenterMessage(false);
        window.setTimeout(() => setCenterMessage(""), 700);
      }, 2300);

      timersRef.current.push(hideMessageTimer);
    }, 3000);

    timersRef.current.push(burstTimer, messageTimer);
  };

  const handleResetGame = () => {
    clearTimers();
    setTransformedThoughts(new Set());
    setBurstingThoughts(new Set());
    setCenterMessage("");
    setShowCenterMessage(false);
    setShowAllTransformed(false);
  };

  const allTransformed = transformedThoughts.size === thoughts.length;

  useEffect(() => {
    if (allTransformed && transformedThoughts.size > 0) {
      setShowAllTransformed(true);
    }
  }, [allTransformed, transformedThoughts.size]);

  useEffect(() => () => clearTimers(), []);

  return (
    <div className="rounded-3xl border border-gray-200/70 bg-gradient-to-br from-white via-slate-50/50 to-blue-50/50 p-6 shadow-sm backdrop-blur sm:p-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 text-white shadow">
          <Heart className="h-6 w-6" />
        </div>
        <div>
          <div className="text-base font-extrabold tracking-tight text-gray-900">Transform Your Thoughts</div>
          <div className="mt-1 text-sm text-gray-600">Click each thought cloud to replace negativity with compassion</div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold text-gray-700">Progress</span>
          <span className="text-sm font-bold text-purple-600">
            {transformedThoughts.size} of {thoughts.length} transformed
          </span>
        </div>
        <div className="h-2 w-full rounded-full bg-gray-300 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-violet-500 to-purple-600 transition-all duration-300"
            style={{ width: `${(transformedThoughts.size / thoughts.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Thought Clouds Grid */}
      <div className="mb-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {thoughts.map((thought) => {
          const isTransformed = transformedThoughts.has(thought.id);
          const isBursting = burstingThoughts.has(thought.id);

          return (
            <div key={thought.id} className="relative h-56">
              <button
                type="button"
                onClick={() => !isTransformed && handleTransformThought(thought.id)}
                disabled={isTransformed || isBursting}
                className={`group relative w-full h-full overflow-visible transition-all duration-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 ${
                  isTransformed
                    ? "opacity-95"
                    : isBursting
                      ? "cursor-wait scale-[1.04]"
                      : "cursor-pointer hover:-translate-y-1 hover:scale-[1.02]"
                }`}
              >
                <div className="absolute inset-x-0 bottom-2 top-8">
                  <div
                    className={`absolute left-[6%] top-[20%] h-20 w-20 rounded-full shadow-2xl transition-all duration-500 ${
                      isTransformed || isBursting ? "bg-yellow-100/90" : "bg-white/72"
                    }`}
                  />
                  <div
                    className={`absolute left-[24%] top-[4%] h-28 w-28 rounded-full shadow-2xl transition-all duration-500 ${
                      isTransformed || isBursting ? "bg-yellow-100/95" : "bg-white/78"
                    }`}
                  />
                  <div
                    className={`absolute left-[50%] top-[16%] h-24 w-24 rounded-full shadow-2xl transition-all duration-500 ${
                      isTransformed || isBursting ? "bg-yellow-50/95" : "bg-white/74"
                    }`}
                  />
                  <div
                    className={`absolute right-[10%] top-[22%] h-18 w-18 rounded-full shadow-2xl transition-all duration-500 ${
                      isTransformed || isBursting ? "bg-yellow-100/85" : "bg-white/68"
                    }`}
                  />
                  <div
                    className={`absolute left-[11%] right-[11%] bottom-0 h-[60%] rounded-[48px] shadow-2xl transition-all duration-500 ${
                      isTransformed
                        ? "bg-gradient-to-br from-emerald-100 to-teal-100"
                        : isBursting
                          ? "bg-gradient-to-br from-yellow-100 via-amber-100 to-yellow-200"
                          : "bg-gradient-to-br from-slate-100 via-slate-200 to-slate-300"
                    }`}
                  />
                  <div
                    className={`absolute inset-[8%] rounded-[40px] ring-1 transition-all duration-500 ${
                      isTransformed
                        ? "ring-emerald-200/70 bg-white/45"
                        : isBursting
                          ? "ring-yellow-200/70 bg-yellow-50/30"
                          : "ring-white/30 bg-white/20"
                    }`}
                  />

                  {sparkles
                    .filter((sparkle) => sparkle.groupId.startsWith(`${thought.id}-`))
                    .map((sparkle) => (
                      <React.Fragment key={sparkle.id}>
                        <span
                          className={`pointer-events-none absolute rounded-full shadow-[0_0_30px_rgba(253,224,71,1)] animate-ping ${sparkle.hue}`}
                          style={{
                            left: sparkle.left,
                            top: sparkle.top,
                            width: `${sparkle.size + 1}px`,
                            height: `${sparkle.size + 1}px`,
                            animationDelay: sparkle.delay,
                            animationDuration: "1050ms",
                          }}
                        />
                        <span
                          className="pointer-events-none absolute origin-left rounded-full bg-gradient-to-r from-yellow-100 via-amber-200 to-transparent opacity-90 animate-pulse"
                          style={{
                            left: sparkle.left,
                            top: sparkle.top,
                            width: `${sparkle.length}px`,
                            height: "2px",
                            transform: `rotate(${sparkle.angle}deg)`,
                            animationDelay: sparkle.delay,
                            animationDuration: "900ms",
                            boxShadow: "0 0 12px rgba(253,224,71,0.9)",
                          }}
                        />
                      </React.Fragment>
                    ))}
                </div>

                <div className="absolute inset-0 flex flex-col items-center justify-center px-5 py-4">
                  {isBursting && (
                    <div className="max-w-[80%] text-center">
                      <div className="text-[10px] font-bold tracking-[0.35em] text-amber-700 uppercase">
                        Burst
                      </div>
                      <div className="mt-3 text-sm font-extrabold leading-snug text-amber-900">
                        Letting go...
                      </div>
                    </div>
                  )}

                  {!isBursting && (
                    <div className="max-w-[80%] text-center">
                      <div className="text-[10px] font-bold tracking-[0.35em] text-slate-700 uppercase opacity-70">
                        Thought Cloud
                      </div>
                      <div className="mt-3 text-sm font-extrabold leading-snug text-slate-900">
                        {thought.negative}
                      </div>
                      <div className="mt-3 text-xs font-semibold text-slate-700">Tap to clear the cloud</div>
                    </div>
                  )}
                </div>
              </button>
            </div>
          );
        })}
      </div>

      <div
        className={`fixed inset-0 z-50 flex items-center justify-center bg-slate-900/10 px-4 transition-opacity duration-700 ${
          showCenterMessage && centerMessage ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      >
        <div className="max-w-2xl rounded-[2rem] border border-white/60 bg-white/80 px-6 py-7 text-center shadow-[0_30px_80px_rgba(15,23,42,0.18)] backdrop-blur-md sm:px-10 sm:py-9">
          <div className="mx-auto mb-4 h-14 w-14 rounded-full bg-gradient-to-br from-yellow-200 to-yellow-50 shadow-[0_0_30px_rgba(253,224,71,0.45)]" />
          <div className="text-[10px] font-bold tracking-[0.45em] text-yellow-700 uppercase">Supportive message</div>
          <div className="mt-4 text-2xl font-extrabold leading-tight text-slate-900 sm:text-3xl">
            {centerMessage}
          </div>
          <div className="mt-3 text-sm text-slate-600">You can pause, breathe, and keep going one thought at a time.</div>
        </div>
      </div>

      {/* Completion Message */}
      {showAllTransformed && (
        <div className="mb-8 rounded-3xl bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 p-6 ring-2 ring-emerald-300 border border-emerald-200/70">
          <div className="text-center">
            <div className="text-base font-extrabold text-emerald-900 mb-2">All Thoughts Transformed</div>
            <div className="mt-2 text-sm text-emerald-800 leading-relaxed">
              You've successfully reframed all your negative thoughts into compassionate affirmations. This skill of cognitive 
              reframing strengthens your mental resilience. Practice this daily to build lasting emotional strength.
            </div>
          </div>
        </div>
      )}

      {/* Tips */}
      <div className="rounded-2xl bg-gradient-to-br from-slate-50 to-blue-50 p-4 ring-1 ring-slate-200/70 mb-6">
        <div className="text-xs font-semibold text-slate-700 mb-2">How Thought Transformation Works:</div>
        <div className="text-sm text-slate-900 space-y-1">
          <p>• Identifies limiting beliefs holding you back</p>
          <p>• Practices cognitive reframing techniques</p>
          <p>• Builds neuroplasticity and resilience</p>
          <p>• Creates lasting positive thought patterns</p>
        </div>
      </div>

      {/* Reset Button */}
      {showAllTransformed && (
        <button
          type="button"
          onClick={handleResetGame}
          className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-violet-500 to-purple-600 px-6 py-3 text-sm font-semibold text-white shadow hover:from-violet-600 hover:to-purple-700 transition"
        >
          <RotateCcw className="h-4 w-4" />
          Play Again
        </button>
      )}
    </div>
  );
}

export default PopNegativeThoughts;
