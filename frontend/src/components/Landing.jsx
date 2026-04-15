import React from 'react';
import {
  Brain,
  MessageCircle,
  ClipboardList,
  ArrowRight,
  Sparkles,
  HeartPulse,
  LineChart,
  Flower2,
  CalendarCheck2,
  Users,
  Mail,
  Phone,
} from 'lucide-react';
import heroImage from '../assets/image.png';
import { COUNSELLORS } from '../config/counsellors';

function FeatureCard({ icon: Icon, title, description }) {
  return (
    <div className="group relative overflow-hidden rounded-3xl border border-gray-200/70 bg-white/80 p-6 shadow-sm backdrop-blur transition hover:-translate-y-0.5 hover:shadow-xl">
      <div className="absolute inset-0 opacity-0 transition group-hover:opacity-100">
        <div className="absolute -top-28 -right-28 h-72 w-72 rounded-full bg-gradient-to-br from-sky-200/60 via-purple-200/50 to-emerald-200/60 blur-3xl" />
      </div>
      <div className="relative">
        <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500 to-violet-600 text-white shadow">
          <Icon className="h-6 w-6" />
        </div>
        <h3 className="text-base font-extrabold tracking-tight text-gray-900">{title}</h3>
        <p className="mt-2 text-sm leading-relaxed text-gray-600">{description}</p>
      </div>
    </div>
  );
}

function TestimonialCard({ quote, name, meta }) {
  return (
    <div className="rounded-3xl border border-gray-200/70 bg-white/80 p-6 shadow-sm backdrop-blur">
      <div className="text-sm leading-relaxed text-gray-700">“{quote}”</div>
      <div className="mt-5 flex items-center justify-between gap-4">
        <div>
          <div className="text-sm font-extrabold text-gray-900">{name}</div>
          <div className="text-xs text-gray-500">{meta}</div>
        </div>
        <div className="inline-flex items-center gap-1 text-amber-500">
          {'★★★★★'.split('').map((s, i) => (
            <span key={`${name}-${i}`} className="text-sm">
              {s}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function Landing({ onSignIn, onSignUp }) {
  const featuredCounsellors = COUNSELLORS.slice(0, 3);

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-violet-50">
      {/* Decorative background */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-24 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-sky-200/60 blur-3xl" />
        <div className="absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-emerald-200/50 blur-3xl" />
        <div className="absolute bottom-[-6rem] right-[-6rem] h-[34rem] w-[34rem] rounded-full bg-violet-200/60 blur-3xl" />
      </div>

      {/* Top nav */}
      <header className="relative">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500 to-violet-600 text-white shadow">
              <Brain className="h-6 w-6" />
            </div>
            <div>
              <div className="text-sm font-extrabold tracking-tight text-gray-900">Serenely</div>
              <div className="text-xs text-gray-500">Emotional support • Therapy tools • Self-care</div>
            </div>
          </div>

          <div className="hidden items-center gap-3 md:flex">
            <button
              onClick={onSignIn}
              className="rounded-xl px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-white/60"
            >
              Sign in
            </button>
            <button
              onClick={onSignUp}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-sky-500 to-violet-600 px-4 py-2 text-sm font-semibold text-white shadow hover:from-sky-600 hover:to-violet-700"
            >
              Create account <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <main className="relative">
        <section className="mx-auto grid max-w-7xl items-center gap-10 px-6 pb-16 pt-6 md:grid-cols-2 md:pt-10">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-sky-200 bg-white/70 px-3 py-1 text-xs font-semibold text-sky-700 backdrop-blur">
              <Sparkles className="h-4 w-4" />
              A calmer way to get support
            </div>

            <h1 className="mt-5 text-4xl font-extrabold tracking-tight text-gray-900 md:text-5xl">
              Your Mental Health Matters
            </h1>

            <p className="mt-4 max-w-xl text-base leading-relaxed text-gray-600">
              Emotional support, therapy tools, and self care - in one modern platform. Chat with an AI companion,
              track your mood, meditate with guided sessions, browse counsellors, and connect with
              supportive groups.
            </p>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <button
                onClick={onSignUp}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-sky-500 to-violet-600 px-6 py-3 text-sm font-semibold text-white shadow-lg hover:from-sky-600 hover:to-violet-700"
              >
                Take a Free Assessment <ArrowRight className="h-4 w-4" />
              </button>
              <button
                onClick={onSignIn}
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-gray-200 bg-white px-6 py-3 text-sm font-semibold text-gray-800 shadow-sm hover:bg-gray-50"
              >
                Talk to Someone
              </button>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-2 sm:grid-cols-3">
              {[
                'Private, stigma-free experience',
                'Evidence-informed tools',
                'Built for daily self-care',
              ].map((t) => (
                <div key={t} className="text-xs font-semibold text-gray-600">
                  <span className="mr-2 inline-block h-2 w-2 rounded-full bg-emerald-400 align-middle" />
                  <span className="align-middle">{t}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="overflow-hidden rounded-3xl border border-white/60 bg-white/40 p-3 shadow-2xl backdrop-blur">
              <img
                src={heroImage}
                alt="Mental health illustration"
                className="h-full w-full min-h-[320px] object-cover rounded-3xl"
              />
            </div>
            <div className="pointer-events-none absolute -bottom-7 left-6 rounded-2xl border border-white/50 bg-white/70 px-4 py-3 text-xs font-semibold text-gray-700 shadow-sm backdrop-blur">
              Calm design • Real tools • Everyday support
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="mx-auto max-w-7xl px-6 pb-16">
          <div className="mb-8">
            <h2 className="text-2xl font-extrabold tracking-tight text-gray-900">
              Wellness support that fits your day
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-gray-600">
              A clean, minimal experience designed to help you feel supported — not judged.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            <FeatureCard
              icon={MessageCircle}
              title="AI Chat Support (24/7)"
              description="A gentle emotional support chatbot for check-ins, coping skills, and guided reflections anytime."
            />
            <FeatureCard
              icon={LineChart}
              title="Mood Tracking"
              description="Track daily mood and emotions to notice patterns, triggers, and progress over time."
            />
            <FeatureCard
              icon={Flower2}
              title="Guided Meditation"
              description="Audio/video-style sessions for stress relief, better sleep, and mindfulness in minutes."
            />
            <FeatureCard
              icon={CalendarCheck2}
              title="Counsellor Booking"
              description="Browse counsellor profiles and reserve a session when you need more personal support."
            />
            <FeatureCard
              icon={Users}
              title="Community Support Groups"
              description="Join moderated groups to feel less alone and learn from people on a similar journey."
            />
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-6 pb-16">
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-2xl font-extrabold tracking-tight text-gray-900">
                Meet the demo counsellors
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-gray-600">
                For now, this section uses playful character placeholders so users can explore the booking flow.
              </p>
            </div>
            <button
              onClick={onSignUp}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 px-5 py-3 text-sm font-semibold text-white shadow hover:from-emerald-600 hover:to-teal-700"
            >
              Explore counsellors <ArrowRight className="h-4 w-4" />
            </button>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            {featuredCounsellors.map((counsellor) => (
              <div
                key={counsellor.id}
                className="rounded-3xl border border-gray-200/70 bg-white/80 p-6 shadow-sm backdrop-blur"
              >
                <div className="overflow-hidden rounded-[1.5rem] bg-gradient-to-br from-slate-100 via-white to-slate-200 ring-1 ring-gray-200/70">
                  <img
                    src={counsellor.image}
                    alt={counsellor.imageAlt}
                    className="h-48 w-full object-cover"
                  />
                </div>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="mt-4 text-base font-extrabold tracking-tight text-gray-900">{counsellor.name}</div>
                    <div className="mt-1 text-sm text-gray-500">{counsellor.civilianName}</div>
                  </div>
                  <div className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-200/70">
                    Demo
                  </div>
                </div>
                <div className="mt-4 text-sm font-semibold text-gray-800">{counsellor.tagline}</div>
                <div className="mt-3 text-sm leading-relaxed text-gray-600">{counsellor.style}</div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {counsellor.focus.slice(0, 2).map((item) => (
                    <span
                      key={`${counsellor.id}-${item}`}
                      className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* How it works */}
        <section className="mx-auto max-w-7xl px-6 pb-16">
          <div className="rounded-3xl border border-gray-200/70 bg-white/70 p-8 shadow-sm backdrop-blur">
            <div className="flex items-end justify-between gap-6">
              <div>
                <h2 className="text-2xl font-extrabold tracking-tight text-gray-900">How it works</h2>
                <p className="mt-2 max-w-2xl text-sm leading-relaxed text-gray-600">
                  A simple flow that helps you start gently and build consistent support.
                </p>
              </div>
              <button
                onClick={onSignUp}
                className="hidden rounded-2xl bg-gradient-to-r from-sky-500 to-violet-600 px-5 py-2.5 text-sm font-semibold text-white shadow hover:from-sky-600 hover:to-violet-700 md:inline-flex"
              >
                Get Started
              </button>
            </div>

            <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {[
                { n: 1, title: 'Sign Up', desc: 'Create your private space in under a minute.' },
                { n: 2, title: 'Take Mental Health Assessment', desc: 'Get a quick snapshot and clear language insights.' },
                { n: 3, title: 'Choose Your Support', desc: 'Talk to your companion or book a counsellor session when needed.' },
                { n: 4, title: 'Track Progress', desc: 'Log mood and revisit patterns to see what helps.' },
              ].map((s) => (
                <div key={s.n} className="rounded-3xl border border-gray-200/70 bg-white/70 p-6 shadow-sm">
                  <div className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500 to-violet-600 text-sm font-extrabold text-white">
                    {s.n}
                  </div>
                  <div className="mt-4 text-sm font-extrabold text-gray-900">{s.title}</div>
                  <div className="mt-2 text-sm leading-relaxed text-gray-600">{s.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="mx-auto max-w-7xl px-6 pb-16">
          <div className="mb-8">
            <h2 className="text-2xl font-extrabold tracking-tight text-gray-900">Trusted by people building healthier habits</h2>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-gray-600">
              A few words from users who wanted support that feels calm, modern, and real.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            <TestimonialCard
              quote="The mood tracking helped me notice patterns I never connected before. It feels supportive without being overwhelming."
              name="Aisha M."
              meta="Mood tracking • 3 weeks"
            />
            <TestimonialCard
              quote="The guided meditations are short and actually doable. I use the sleep one almost every night."
              name="Jordan L."
              meta="Meditation • Better sleep"
            />
            <TestimonialCard
              quote="I like having a private space to check in. The tone feels kind, and the layout is clean and calming."
              name="Sam R."
              meta="AI chat • Daily check-ins"
            />
          </div>
        </section>

        {/* About */}
        <section className="mx-auto max-w-7xl px-6 pb-20">
          <div className="rounded-3xl border border-gray-200/70 bg-white/70 p-10 shadow-sm backdrop-blur">
            <div className="grid gap-10 md:grid-cols-5 md:items-center">
              <div className="md:col-span-3">
                <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white/60 px-3 py-1 text-xs font-semibold text-emerald-700">
                  <HeartPulse className="h-4 w-4" />
                  Our mission
                </div>
                <h2 className="mt-5 text-2xl font-extrabold tracking-tight text-gray-900">Accessible, affordable, stigma-free support</h2>
                <p className="mt-3 text-sm leading-relaxed text-gray-600">
                  Serenely exists to make mental health support easier to reach — whether you’re looking for a gentle check-in,
                  structured self-care, professional help, or a community that understands. We design for calm, privacy, and
                  real-life routines so support feels approachable every day.
                </p>
                <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                  <button
                    onClick={onSignUp}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-sky-500 to-violet-600 px-6 py-3 text-sm font-semibold text-white shadow hover:from-sky-600 hover:to-violet-700"
                  >
                    Get Started <ArrowRight className="h-4 w-4" />
                  </button>
                  <button
                    onClick={onSignIn}
                    className="rounded-2xl border border-gray-200 bg-white px-6 py-3 text-sm font-semibold text-gray-800 shadow-sm hover:bg-gray-50"
                  >
                    Sign in
                  </button>
                </div>
              </div>
              <div className="md:col-span-2">
                <div className="rounded-3xl bg-gradient-to-br from-sky-500/10 via-violet-600/10 to-emerald-500/10 p-8 ring-1 ring-gray-200/60">
                  <div className="text-sm font-extrabold text-gray-900">What you’ll get</div>
                  <ul className="mt-4 space-y-3 text-sm text-gray-600">
                    {[
                      'A calm space to reflect and track progress',
                      'Support tools you can use in minutes',
                      'Optional professional and community support',
                      'A modern, minimal, responsive experience',
                    ].map((t) => (
                      <li key={t} className="flex items-start gap-3">
                        <span className="mt-1 inline-block h-2 w-2 rounded-full bg-sky-500" />
                        <span className="leading-relaxed">{t}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="relative border-t border-gray-200/70 bg-white/60 backdrop-blur">
          <div className="mx-auto max-w-7xl px-6 py-12">
            <div className="grid gap-10 md:grid-cols-4">
              <div className="md:col-span-2">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500 to-violet-600 text-white shadow">
                    <Brain className="h-6 w-6" />
                  </div>
                  <div>
                    <div className="text-sm font-extrabold tracking-tight text-gray-900">Serenely</div>
                    <div className="text-xs text-gray-500">Mental wellness support for real life</div>
                  </div>
                </div>
                <p className="mt-4 max-w-lg text-sm leading-relaxed text-gray-600">
                  Built to make support feel accessible and stigma-free — with calm design, practical tools, and clear boundaries.
                </p>
                <div className="mt-5 space-y-2 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-sky-600" />
                    <span>support@serenely.health</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-sky-600" />
                    <span>+1 (555) 014-2039</span>
                  </div>
                </div>
              </div>

              <div>
                <div className="text-sm font-extrabold text-gray-900">Company</div>
                <ul className="mt-4 space-y-2 text-sm text-gray-600">
                  <li>
                    <button type="button" className="hover:text-gray-900">
                      About
                    </button>
                  </li>
                  <li>
                    <button type="button" className="hover:text-gray-900">
                      Contact
                    </button>
                  </li>
                  <li>
                    <button type="button" className="hover:text-gray-900">
                      Support groups
                    </button>
                  </li>
                </ul>
              </div>

              <div>
                <div className="text-sm font-extrabold text-gray-900">Legal</div>
                <ul className="mt-4 space-y-2 text-sm text-gray-600">
                  <li>
                    <button type="button" className="hover:text-gray-900">
                      Privacy Policy
                    </button>
                  </li>
                  <li>
                    <button type="button" className="hover:text-gray-900">
                      Terms of Service
                    </button>
                  </li>
                </ul>

                <div className="mt-6 text-sm font-extrabold text-gray-900">Social</div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {['Twitter/X', 'Instagram', 'LinkedIn'].map((s) => (
                    <button
                      key={s}
                      type="button"
                      className="rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 shadow-sm hover:bg-gray-50"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-10 flex flex-col gap-3 border-t border-gray-200/70 pt-6 text-xs text-gray-500 md:flex-row md:items-center md:justify-between">
              <div>© {new Date().getFullYear()} Serenely. All rights reserved.</div>
              <div className="max-w-2xl leading-relaxed">
                This platform provides supportive tools and information and is not a substitute for professional diagnosis or treatment.
                If you are in immediate danger or crisis, contact local emergency services right away.
              </div>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}

