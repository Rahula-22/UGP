import React, { useMemo, useState, useEffect } from "react";
import {
  Brain,
  LayoutDashboard,
  BookOpen,
  UserCircle2,
  LogOut,
  MessageCircle,
  ClipboardList,
  Sparkles,
  Wind,
  Headphones,
  PhoneCall,
  Newspaper,
  ChevronRight,
  HeartPulse,
  ShieldCheck,
  TrendingUp,
  CalendarDays,
  Gamepad2,
  Users,
} from "lucide-react";
import MoodBuddy from "./MoodBuddy";
import DailyMoodCheckIn from "./DailyMoodCheckIn";
import StreakCard from "./StreakCard";
import WellnessPointsCard from "./WellnessPointsCard";
import BadgesSection from "./BadgesSection";
import GratitudeGarden from "./GratitudeGarden";
import DailyPositiveMessage from "./DailyPositiveMessage";
import WellnessGamesPage from "./WellnessGamesPage";
import { COUNSELLORS } from "../config/counsellors";

function Dashboard({ user, onNavigate, onLogout }) {
  const [activeNav, setActiveNav] = useState("dashboard");
  const [selectedGameId, setSelectedGameId] = useState(null);
  const [currentMood, setCurrentMood] = useState(null);
  const [hasCheckedInToday, setHasCheckedInToday] = useState(false);
  const [streak, setStreak] = useState(3);
  const [longestStreak, setLongestStreak] = useState(7);
  const [wellnessPoints, setWellnessPoints] = useState(145);
  const [unlockedBadges, setUnlockedBadges] = useState(["first-step", "brave-heart", "3-day-streak"]);
  const [gratitudeEntries, setGratitudeEntries] = useState([
    "Today I am grateful for my supportive friend",
    "I appreciate my ability to rest",
    "I'm thankful for this safe space",
  ]);

  const pointsBreakdown = useMemo(() => ({
    moodCheckin: 30,
    chat: 60,
    assessment: 40,
    breathingExercise: 10,
    gratitudeEntry: 5,
  }), []);

  useEffect(() => {
    const savedData = localStorage.getItem("userWellnessData");
    if (savedData) {
      const data = JSON.parse(savedData);
      setCurrentMood(data.currentMood || null);
      setHasCheckedInToday(data.hasCheckedInToday || false);
      setStreak(data.streak || 0);
      setLongestStreak(data.longestStreak || 0);
      setWellnessPoints(data.wellnessPoints || 0);
      setUnlockedBadges(data.unlockedBadges || []);
      setGratitudeEntries(data.gratitudeEntries || []);
    }
  }, []);

  const handleMoodSelect = (moodId) => {
    setCurrentMood(moodId);
    setHasCheckedInToday(true);

    const userData = {
      currentMood: moodId,
      hasCheckedInToday: true,
      streak,
      longestStreak,
      wellnessPoints,
      unlockedBadges,
      gratitudeEntries,
    };
    localStorage.setItem("userWellnessData", JSON.stringify(userData));
  };

  const handleAddGratitude = () => {
    const newEntry = prompt("What are you grateful for today?");
    if (newEntry) {
      setGratitudeEntries([...gratitudeEntries, newEntry]);
    }
  };

  const greeting = useMemo(() => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 18) return "Good afternoon";
    return "Good evening";
  }, []);

  const todayLabel = useMemo(() => {
    try {
      return new Intl.DateTimeFormat(undefined, { weekday: "long", month: "short", day: "numeric" }).format(new Date());
    } catch {
      return new Date().toDateString();
    }
  }, []);

  const quote = useMemo(() => {
    const quotes = [
      {
        text: "You don't have to control your thoughts. You just have to stop letting them control you.",
        author: "Dan Millman",
      },
      {
        text: "Small steps still move you forward. Be gentle with yourself today.",
        author: "Serenely",
      },
      {
        text: "Breathe. This moment is allowed to be imperfect.",
        author: "Serenely",
      },
      {
        text: "Your feelings are valid - and they can change. One kind action at a time.",
        author: "Serenely",
      },
    ];
    const idx = Math.abs(Math.floor(Date.now() / (1000 * 60 * 60 * 24))) % quotes.length;
    return quotes[idx];
  }, []);

  const resources = useMemo(
    () => [
      {
        title: "Breathing Exercise",
        desc: "A quick 60-second reset to calm your body.",
        icon: Wind,
        accent: "from-sky-500 to-violet-600",
        onClick: () => {
          setSelectedGameId("breathing");
          setActiveNav("games");
        },
      },
      {
        title: "Meditation",
        desc: "Short sessions to ease stress and improve sleep.",
        icon: Headphones,
        accent: "from-emerald-500 to-teal-600",
        onClick: () => window.open("https://www.youtube.com/watch?v=H_uc-uQ3Nkc", "_blank", "noopener"),
      },
      {
        title: "Emergency Helpline",
        desc: "If you're in crisis, get help immediately.",
        icon: PhoneCall,
        accent: "from-rose-500 to-orange-500",
        onClick: () => setActiveNav("resources"),
      },
      {
        title: "Read Articles",
        desc: "Practical guides for anxiety, sleep, and habits.",
        icon: Newspaper,
        accent: "from-violet-500 to-fuchsia-600",
        onClick: () => window.open("https://www.iitk.ac.in/counsel/blog.php", "_blank", "noopener"),
      },
    ],
    [setActiveNav, setSelectedGameId]
  );

  const overviewStats = useMemo(
    () => [
      {
        label: "Today",
        value: todayLabel,
        icon: CalendarDays,
        tone: "bg-sky-50 text-sky-900 ring-sky-200/70",
      },
      {
        label: "Wellness focus",
        value: "Small steps",
        icon: TrendingUp,
        tone: "bg-violet-50 text-violet-900 ring-violet-200/70",
      },
      {
        label: "Privacy",
        value: "Secure session",
        icon: ShieldCheck,
        tone: "bg-emerald-50 text-emerald-900 ring-emerald-200/70",
      },
    ],
    [todayLabel]
  );

  const featuredCounsellors = useMemo(() => COUNSELLORS.slice(0, 3), []);

  const NavButton = ({ id, icon: Icon, label }) => {
    const active = activeNav === id;
    return (
      <button
        type="button"
        onClick={() => setActiveNav(id)}
        className={`inline-flex items-center gap-2 rounded-2xl px-3 py-2 text-sm font-semibold transition ${
          active ? "bg-white shadow-sm text-gray-900" : "text-gray-600 hover:bg-white/70 hover:text-gray-900"
        }`}
      >
        <Icon className="h-4 w-4" />
        <span className="hidden sm:inline">{label}</span>
      </button>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-violet-50">
      <div className="sticky top-0 z-30 border-b border-gray-200/70 bg-white/70 backdrop-blur">
        <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500 to-violet-600 text-white shadow">
                <Brain className="h-6 w-6" />
              </div>
              <div className="leading-tight">
                <div className="text-sm font-extrabold tracking-tight text-gray-900">Serenely</div>
                <div className="text-xs text-gray-500">Personal wellness dashboard</div>
              </div>
            </div>

            <div className="hidden items-center gap-2 rounded-3xl bg-gradient-to-r from-sky-100/70 via-white to-emerald-100/60 p-1 md:flex">
              <NavButton id="dashboard" icon={LayoutDashboard} label="Dashboard" />
              <NavButton id="games" icon={Gamepad2} label="Games" />
              <NavButton id="resources" icon={BookOpen} label="Resources" />
              <NavButton id="profile" icon={UserCircle2} label="Profile" />
              <button
                type="button"
                onClick={onLogout}
                className="inline-flex items-center gap-2 rounded-2xl px-3 py-2 text-sm font-semibold text-gray-600 hover:bg-white/70 hover:text-red-700"
                title="Logout"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden text-right sm:block">
                <div className="text-sm font-semibold text-gray-900">{user?.username || "User"}</div>
                <div className="text-xs text-gray-500">{user?.email || "--"}</div>
              </div>
              <div className="h-10 w-10 rounded-2xl bg-white shadow-sm ring-1 ring-gray-200/70 flex items-center justify-center text-gray-700">
                <UserCircle2 className="h-6 w-6" />
              </div>
            </div>
          </div>

          <div className="mt-3 flex items-center justify-between gap-2 rounded-3xl bg-white/60 p-1 shadow-sm ring-1 ring-gray-200/60 md:hidden">
            <NavButton id="dashboard" icon={LayoutDashboard} label="Dashboard" />
            <NavButton id="games" icon={Gamepad2} label="Games" />
            <NavButton id="resources" icon={BookOpen} label="Resources" />
            <NavButton id="profile" icon={UserCircle2} label="Profile" />
            <button
              type="button"
              onClick={onLogout}
              className="inline-flex items-center gap-2 rounded-2xl px-3 py-2 text-sm font-semibold text-gray-600 hover:bg-white hover:text-red-700"
              title="Logout"
            >
              <LogOut className="h-4 w-4" />
              <span className="sr-only">Logout</span>
            </button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10">
        <div className="rounded-3xl border border-gray-200/70 bg-white/70 p-6 shadow-sm backdrop-blur sm:p-8">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-sky-200 bg-white/70 px-3 py-1 text-xs font-semibold text-sky-700">
                <Sparkles className="h-4 w-4" />
                Today's check-in • {todayLabel}
              </div>
              <h2 className="mt-4 text-2xl font-extrabold tracking-tight text-gray-900 sm:text-3xl">
                {greeting}, {user?.username || "there"}.
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-gray-600">
                We are here to support your mental well-being. Take a breath, choose a tool, and start where you are.
              </p>

              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                {overviewStats.map((s) => {
                  const Icon = s.icon;
                  return (
                    <div key={s.label} className={`rounded-2xl px-4 py-3 ring-1 ${s.tone}`}>
                      <div className="flex items-center gap-2 text-xs font-semibold opacity-80">
                        <Icon className="h-4 w-4" />
                        {s.label}
                      </div>
                      <div className="mt-1 text-sm font-extrabold tracking-tight">{s.value}</div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="rounded-3xl bg-gradient-to-br from-sky-500/10 via-violet-600/10 to-emerald-500/10 p-5 ring-1 ring-gray-200/60 md:w-[22rem]">
              <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500 to-violet-600 text-white shadow">
                  <HeartPulse className="h-6 w-6" />
                </div>
                <div>
                  <div className="text-sm font-extrabold text-gray-900">Your gentle reminder</div>
                  <div className="mt-1 text-sm text-gray-600">Progress counts, even when it is quiet.</div>
                </div>
              </div>
              <div className="mt-4 flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => onNavigate("assessment")}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-4 py-2.5 text-sm font-semibold text-gray-800 shadow-sm ring-1 ring-gray-200/70 hover:bg-gray-50"
                >
                  Take a quick assessment <ChevronRight className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => onNavigate("chat")}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-sky-500 to-violet-600 px-4 py-2.5 text-sm font-semibold text-white shadow hover:from-sky-600 hover:to-violet-700"
                >
                  Talk to your companion <ChevronRight className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => onNavigate("counsellors")}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 px-4 py-2.5 text-sm font-semibold text-white shadow hover:from-emerald-600 hover:to-teal-700"
                >
                  Book a counsellor session <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {activeNav === "dashboard" && (
          <>
            <div className="mt-8">
              <MoodBuddy userMood={currentMood || "neutral"} />
            </div>

            <div className="mt-8">
              <DailyMoodCheckIn
                currentMood={currentMood}
                onMoodSelect={handleMoodSelect}
                hasCheckedInToday={hasCheckedInToday}
              />
            </div>

            <div className="mt-8 rounded-3xl border border-gray-200/70 bg-white/80 p-6 shadow-sm backdrop-blur transition hover:shadow-lg sm:p-8">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 text-white shadow">
                    <Gamepad2 className="h-6 w-6" />
                  </div>
                  <div>
                    <div className="text-base font-extrabold tracking-tight text-gray-900">Wellness Games</div>
                    <div className="mt-1 text-sm text-gray-600">Interactive games to reduce stress and build mental resilience.</div>
                  </div>
                </div>
                <div className="hidden rounded-2xl bg-purple-50 px-3 py-1.5 text-xs font-semibold text-purple-700 ring-1 ring-purple-200 sm:inline-flex">
                  Quick & Fun
                </div>
              </div>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="text-sm text-gray-600">
                  Try Serenity Circle Breathing and Transform Your Thoughts games. Quick sessions designed with techniques from Calm and Headspace.
                </div>
                <button
                  type="button"
                  onClick={() => setActiveNav("games")}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-violet-500 to-purple-600 px-5 py-3 text-sm font-semibold text-white shadow hover:from-violet-600 hover:to-purple-700"
                >
                  Play Games <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="mt-8 grid gap-6 lg:grid-cols-3">
              <StreakCard streak={streak} longestStreak={longestStreak} />
              <WellnessPointsCard points={wellnessPoints} pointsBreakdown={pointsBreakdown} />
              <div className="lg:col-span-1">
                <div className="rounded-3xl border border-gray-200/70 bg-white/80 p-6 shadow-sm backdrop-blur">
                  <div className="text-base font-extrabold tracking-tight text-gray-900 mb-2">Quick Stats</div>
                  <div className="space-y-3">
                    <div className="rounded-lg bg-gradient-to-br from-sky-50 to-blue-50 p-3 ring-1 ring-sky-200/60">
                      <div className="text-xs text-sky-700 font-semibold">Mood Today</div>
                      <div className="mt-1 text-lg font-bold text-sky-900">
                        {currentMood ? currentMood.charAt(0).toUpperCase() + currentMood.slice(1) : "Not yet"}
                      </div>
                    </div>
                    <div className="rounded-lg bg-gradient-to-br from-emerald-50 to-teal-50 p-3 ring-1 ring-emerald-200/60">
                      <div className="text-xs text-emerald-700 font-semibold">Total Entry</div>
                      <div className="mt-1 text-lg font-bold text-emerald-900">{gratitudeEntries.length}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 grid gap-6 lg:grid-cols-2">
              <div className="rounded-3xl border border-gray-200/70 bg-white/80 p-6 shadow-sm backdrop-blur transition hover:shadow-lg sm:p-8">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500 to-violet-600 text-white shadow">
                      <MessageCircle className="h-6 w-6" />
                    </div>
                    <div>
                      <div className="text-base font-extrabold tracking-tight text-gray-900">Ask a Question</div>
                      <div className="mt-1 text-sm text-gray-600">Talk to our AI and share what you feel.</div>
                    </div>
                  </div>
                  <div className="hidden rounded-2xl bg-sky-50 px-3 py-1.5 text-xs font-semibold text-sky-700 ring-1 ring-sky-200 sm:inline-flex">
                    24/7 support
                  </div>
                </div>
                <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="text-sm text-gray-600">
                    Get grounded guidance, coping strategies, and explanations in simple language.
                  </div>
                  <button
                    type="button"
                    onClick={() => onNavigate("chat")}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-sky-500 to-violet-600 px-5 py-3 text-sm font-semibold text-white shadow hover:from-sky-600 hover:to-violet-700"
                  >
                    Start Chat <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="rounded-3xl border border-gray-200/70 bg-white/80 p-6 shadow-sm backdrop-blur transition hover:shadow-lg sm:p-8">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-600 text-white shadow">
                      <ClipboardList className="h-6 w-6" />
                    </div>
                    <div>
                      <div className="text-base font-extrabold tracking-tight text-gray-900">Mental Health Assessment</div>
                      <div className="mt-1 text-sm text-gray-600">Take a quick assessment to check your status.</div>
                    </div>
                  </div>
                  <div className="hidden rounded-2xl bg-violet-50 px-3 py-1.5 text-xs font-semibold text-violet-700 ring-1 ring-violet-200 sm:inline-flex">
                    2-10 min
                  </div>
                </div>
                <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="text-sm text-gray-600">
                    Choose from validated tools and receive a clear, supportive interpretation.
                  </div>
                  <button
                    type="button"
                    onClick={() => onNavigate("assessment")}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-violet-500 to-fuchsia-600 px-5 py-3 text-sm font-semibold text-white shadow hover:from-violet-600 hover:to-fuchsia-700"
                  >
                    Start Assessment <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-8 rounded-3xl border border-gray-200/70 bg-white/80 p-6 shadow-sm backdrop-blur sm:p-8">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <div className="text-base font-extrabold tracking-tight text-gray-900">Counsellors</div>
                  <div className="mt-1 text-sm text-gray-600">
                    Users can now connect with comic-inspired placeholder counsellors and book a session when they need extra support.
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => onNavigate("counsellors")}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 px-5 py-3 text-sm font-semibold text-white shadow hover:from-emerald-600 hover:to-teal-700"
                >
                  Browse counsellors <ChevronRight className="h-4 w-4" />
                </button>
              </div>

              <div className="mt-6 grid gap-4 lg:grid-cols-3">
                {featuredCounsellors.map((counsellor) => (
                  <button
                    key={counsellor.id}
                    type="button"
                    onClick={() => onNavigate("counsellors")}
                    className="group rounded-3xl border border-gray-200/70 bg-gradient-to-br from-white to-emerald-50/50 p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow"
                  >
                    <div className="overflow-hidden rounded-[1.5rem] bg-white ring-1 ring-gray-200/70">
                      <img
                        src={counsellor.image}
                        alt={counsellor.imageAlt}
                        className="h-44 w-full object-cover transition duration-300 group-hover:scale-[1.02]"
                      />
                    </div>
                    <div className="flex items-start justify-between gap-4">
                      <div className="mt-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow">
                        <Users className="h-6 w-6" />
                      </div>
                      <div className="mt-4 rounded-full bg-white px-3 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-200/70">
                        Demo
                      </div>
                    </div>
                    <div className="mt-4 text-base font-extrabold tracking-tight text-gray-900">{counsellor.name}</div>
                    <div className="mt-1 text-sm text-gray-500">{counsellor.civilianName}</div>
                    <div className="mt-3 text-sm leading-relaxed text-gray-600">{counsellor.tagline}</div>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {counsellor.focus.slice(0, 2).map((focus) => (
                        <span
                          key={`${counsellor.id}-${focus}`}
                          className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-gray-700 ring-1 ring-gray-200"
                        >
                          {focus}
                        </span>
                      ))}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-8">
              <DailyPositiveMessage />
            </div>

            <div className="mt-8">
              <BadgesSection unlockedBadges={unlockedBadges} />
            </div>

            <div className="mt-8">
              <GratitudeGarden gratitudeEntries={gratitudeEntries} onAddGratitude={handleAddGratitude} />
            </div>

            <div className="mt-8">
              <div className="flex items-end justify-between gap-4">
                <div>
                  <div className="text-lg font-extrabold tracking-tight text-gray-900">Quick help & resources</div>
                  <div className="mt-1 text-sm text-gray-600">Fast tools you can use right now.</div>
                </div>
                <div className="hidden text-sm font-semibold text-gray-500 sm:block">Explore</div>
              </div>

              <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {resources.map((r) => {
                  const Icon = r.icon;
                  return (
                    <button
                      key={r.title}
                      type="button"
                      onClick={r.onClick}
                      className="group rounded-3xl border border-gray-200/70 bg-white/80 p-5 text-left shadow-sm backdrop-blur transition hover:-translate-y-0.5 hover:shadow"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className={`flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br ${r.accent} text-white shadow`}>
                          <Icon className="h-5 w-5" />
                        </div>
                        <ChevronRight className="h-5 w-5 text-gray-300 transition group-hover:translate-x-0.5 group-hover:text-gray-500" />
                      </div>
                      <div className="mt-4 text-sm font-extrabold text-gray-900">{r.title}</div>
                      <div className="mt-1 text-sm leading-relaxed text-gray-600">{r.desc}</div>
                    </button>
                  );
                })}
              </div>

            </div>

            <div className="mt-8 grid gap-6 lg:grid-cols-3">
              <div className="rounded-3xl border border-gray-200/70 bg-white/80 p-6 shadow-sm backdrop-blur sm:p-8 lg:col-span-2">
                <div className="text-sm font-extrabold text-gray-900">Privacy and care</div>
                <div className="mt-2 text-sm leading-relaxed text-gray-600">
                  Your check-ins are personal. This app provides supportive information and wellness tools -- it is not a substitute
                  for professional medical advice, diagnosis, or treatment.
                </div>
                <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                  <div className="rounded-2xl bg-sky-50 px-4 py-3 text-sm text-sky-900 ring-1 ring-sky-200/70">
                    <span className="font-extrabold">Secure sessions</span> and minimal data.
                  </div>
                  <div className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-900 ring-1 ring-emerald-200/70">
                    <span className="font-extrabold">Stigma-free</span> support, designed to feel calm.
                  </div>
                </div>
              </div>

              <div className="rounded-3xl border border-gray-200/70 bg-white/80 p-6 shadow-sm backdrop-blur sm:p-8">
                <div className="text-sm font-extrabold text-gray-900">Your profile</div>
                <div className="mt-4 rounded-3xl bg-gradient-to-br from-sky-500/10 via-white to-violet-600/10 p-5 ring-1 ring-gray-200/60">
                  <div className="text-xs font-semibold text-gray-500">Signed in as</div>
                  <div className="mt-2 text-sm font-extrabold text-gray-900">{user?.username || "User"}</div>
                  <div className="mt-1 text-sm text-gray-600">{user?.email || "--"}</div>
                </div>
                <button
                  type="button"
                  onClick={onLogout}
                  className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </button>
              </div>
            </div>
          </>
        )}

        {activeNav === "games" && (
          <WellnessGamesPage
            initialGame={selectedGameId}
            onNavigate={(page) => {
              if (page !== "games") {
                setSelectedGameId(null);
              }
              setActiveNav(page);
            }}
          />
        )}

        {activeNav === "resources" && (
          <div className="mt-8">
            <div className="rounded-3xl border border-gray-200/70 bg-white/80 p-6 shadow-sm backdrop-blur sm:p-8">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <div className="text-lg font-extrabold tracking-tight text-gray-900">Resources</div>
                  <div className="mt-1 text-sm text-gray-600">Pick something small you can do right now.</div>
                </div>
                <div className="rounded-2xl bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-800 ring-1 ring-emerald-200/70">
                  Calm, quick, repeatable
                </div>
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {resources.map((r) => {
                  const Icon = r.icon;
                  return (
                    <button
                      key={r.title}
                      type="button"
                      onClick={r.onClick}
                      className="group rounded-3xl border border-gray-200/70 bg-white/80 p-5 text-left shadow-sm backdrop-blur transition hover:-translate-y-0.5 hover:shadow"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className={`flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br ${r.accent} text-white shadow`}>
                          <Icon className="h-5 w-5" />
                        </div>
                        <ChevronRight className="h-5 w-5 text-gray-300 transition group-hover:translate-x-0.5 group-hover:text-gray-500" />
                      </div>
                      <div className="mt-4 text-sm font-extrabold text-gray-900">{r.title}</div>
                      <div className="mt-1 text-sm leading-relaxed text-gray-600">{r.desc}</div>
                    </button>
                  );
                })}
              </div>

              <div className="mt-6 rounded-3xl border border-rose-200 bg-rose-50/70 p-6 shadow-sm">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-rose-500 text-white shadow">
                    <PhoneCall className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-sm font-extrabold text-rose-900">In crisis? Get help now</div>
                    <div className="mt-2 text-sm leading-relaxed text-rose-800">
                      If you are in immediate danger, call your local emergency number right now.
                    </div>
                    <div className="mt-3 grid gap-2 text-sm text-rose-900 sm:grid-cols-2">
                      <div className="rounded-xl bg-white/60 px-3 py-2 ring-1 ring-rose-200/70">
                        US & Canada: <span className="font-extrabold">988</span> (call or text)
                      </div>
                      <div className="rounded-xl bg-white/60 px-3 py-2 ring-1 ring-rose-200/70">
                        UK & ROI: <span className="font-extrabold">Samaritans 116 123</span>
                      </div>
                      <div className="rounded-xl bg-white/60 px-3 py-2 ring-1 ring-rose-200/70">
                        India: <span className="font-extrabold">Tele-MANAS 14416</span> or <span className="font-extrabold">1-800-891-4416</span>
                      </div>
                      <div className="rounded-xl bg-white/60 px-3 py-2 ring-1 ring-rose-200/70">
                        Europe emergency: <span className="font-extrabold">112</span>
                      </div>
                    </div>
                    <div className="mt-3 text-xs text-rose-700">
                      If these do not match your location, contact your country's national crisis line or nearest hospital emergency department.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeNav === "profile" && (
          <div className="mt-8 grid gap-6 lg:grid-cols-3">
            <div className="rounded-3xl border border-gray-200/70 bg-white/80 p-6 shadow-sm backdrop-blur sm:p-8 lg:col-span-2">
              <div className="text-lg font-extrabold tracking-tight text-gray-900">Your profile</div>
              <div className="mt-2 text-sm text-gray-600">Account details and session controls.</div>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <div className="rounded-3xl bg-gradient-to-br from-sky-500/10 via-white to-violet-600/10 p-6 ring-1 ring-gray-200/60">
                  <div className="text-xs font-semibold text-gray-500">Username</div>
                  <div className="mt-2 text-sm font-extrabold text-gray-900">{user?.username || "User"}</div>
                </div>
                <div className="rounded-3xl bg-gradient-to-br from-emerald-500/10 via-white to-sky-500/10 p-6 ring-1 ring-gray-200/60">
                  <div className="text-xs font-semibold text-gray-500">Email</div>
                  <div className="mt-2 text-sm font-extrabold text-gray-900">{user?.email || "--"}</div>
                </div>
              </div>

              <div className="mt-6 rounded-3xl border border-gray-200/70 bg-white/70 p-6 shadow-sm">
                <div className="text-sm font-extrabold text-gray-900">Safety note</div>
                <div className="mt-2 text-sm leading-relaxed text-gray-600">
                  This app is designed for supportive guidance and self-care tools. If you are worried about your safety,
                  consider contacting a trusted person or local emergency services.
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-gray-200/70 bg-white/80 p-6 shadow-sm backdrop-blur sm:p-8">
              <div className="text-sm font-extrabold text-gray-900">Session</div>
              <div className="mt-4 rounded-3xl bg-sky-50/70 p-5 ring-1 ring-sky-200/70">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500 to-violet-600 text-white shadow">
                    <UserCircle2 className="h-6 w-6" />
                  </div>
                  <div>
                    <div className="text-sm font-extrabold text-gray-900">Signed in</div>
                    <div className="mt-1 text-sm text-gray-700">Your session is active on this device.</div>
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={onLogout}
                className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
