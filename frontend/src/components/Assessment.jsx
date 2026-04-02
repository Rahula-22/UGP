import React, { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import {
  ArrowLeft, CheckCircle, Loader2, ChevronRight, ChevronLeft,
  ShieldAlert, MessageCircle, BookOpen, TrendingUp, Heart,
  Send, Brain, RefreshCw, Sparkles, Clock, Lock, Star,
} from 'lucide-react';

const API_BASE = 'http://localhost:8000';

// ─── ASSESSMENT DATA ─────────────────────────────────────────────────────────

const DASS42_DATA = {
  id: 'dass42', title: 'DASS-42', subtitle: 'Depression Anxiety Stress Scales',
  tagline: 'Measures depression, anxiety, and stress over the past week.',
  timeEstimate: '5–10 min · 42 questions',
  accentFrom: 'from-purple-500', accentTo: 'to-pink-600',
  instructions: `Rate each statement based on the past week:\n• NEVER — Did not apply to me at all\n• SOMETIMES — Applied to some degree, or some of the time\n• OFTEN — Applied to a considerable degree, or a good part of time\n• ALMOST ALWAYS — Applied very much, or most of the time`,
  timeframe: 'Over the past week, how much did this apply to you?',
  questions: [
    { id: 1,  text: "I found myself getting upset by quite trivial things", scale: "stress" },
    { id: 2,  text: "I was aware of dryness of my mouth", scale: "anxiety" },
    { id: 3,  text: "I couldn't seem to experience any positive feeling at all", scale: "depression" },
    { id: 4,  text: "I experienced breathing difficulty (e.g., excessively rapid breathing, breathlessness in the absence of physical exertion)", scale: "anxiety" },
    { id: 5,  text: "I just couldn't seem to get going", scale: "depression" },
    { id: 6,  text: "I tended to over-react to situations", scale: "stress" },
    { id: 7,  text: "I had a feeling of shakiness (e.g., legs going to give way)", scale: "anxiety" },
    { id: 8,  text: "I found it difficult to relax", scale: "stress" },
    { id: 9,  text: "I found myself in situations that made me so anxious I was most relieved when they ended", scale: "anxiety" },
    { id: 10, text: "I felt that I had nothing to look forward to", scale: "depression" },
    { id: 11, text: "I found myself getting upset rather easily", scale: "stress" },
    { id: 12, text: "I felt that I was using a lot of nervous energy", scale: "stress" },
    { id: 13, text: "I felt sad and depressed", scale: "depression" },
    { id: 14, text: "I found myself getting impatient when I was delayed in any way (e.g., lifts, traffic lights, being kept waiting)", scale: "stress" },
    { id: 15, text: "I had a feeling of faintness", scale: "anxiety" },
    { id: 16, text: "I felt that I had lost interest in just about everything", scale: "depression" },
    { id: 17, text: "I felt I wasn't worth much as a person", scale: "depression" },
    { id: 18, text: "I felt that I was rather touchy", scale: "stress" },
    { id: 19, text: "I perspired noticeably (e.g., hands sweaty) in the absence of high temperatures or physical exertion", scale: "anxiety" },
    { id: 20, text: "I felt scared without any good reason", scale: "anxiety" },
    { id: 21, text: "I felt that life wasn't worthwhile", scale: "depression" },
    { id: 22, text: "I found it hard to wind down", scale: "stress" },
    { id: 23, text: "I had difficulty in swallowing", scale: "anxiety" },
    { id: 24, text: "I couldn't seem to get any enjoyment out of the things I did", scale: "depression" },
    { id: 25, text: "I was aware of the action of my heart in the absence of physical exertion (e.g., sense of heart rate increase, heart missing a beat)", scale: "anxiety" },
    { id: 26, text: "I felt down-hearted and blue", scale: "depression" },
    { id: 27, text: "I found that I was very irritable", scale: "stress" },
    { id: 28, text: "I felt I was close to panic", scale: "anxiety" },
    { id: 29, text: "I found it hard to calm down after something upset me", scale: "stress" },
    { id: 30, text: "I feared that I would be \"thrown\" by some trivial but unfamiliar task", scale: "anxiety" },
    { id: 31, text: "I was unable to become enthusiastic about anything", scale: "depression" },
    { id: 32, text: "I found it difficult to tolerate interruptions to what I was doing", scale: "stress" },
    { id: 33, text: "I was in a state of nervous tension", scale: "stress" },
    { id: 34, text: "I felt I was pretty worthless", scale: "depression" },
    { id: 35, text: "I was intolerant of anything that kept me from getting on with what I was doing", scale: "stress" },
    { id: 36, text: "I felt terrified", scale: "anxiety" },
    { id: 37, text: "I could see nothing in the future to be hopeful about", scale: "depression" },
    { id: 38, text: "I felt that life was meaningless", scale: "depression" },
    { id: 39, text: "I found myself getting agitated", scale: "stress" },
    { id: 40, text: "I was worried about situations in which I might panic and make a fool of myself", scale: "anxiety" },
    { id: 41, text: "I experienced trembling (e.g., in the hands)", scale: "anxiety" },
    { id: 42, text: "I found it difficult to work up the initiative to do things", scale: "depression" },
  ],
  options: [
    { value: 0, label: 'Never',         description: 'Did not apply to me at all' },
    { value: 1, label: 'Sometimes',     description: 'Applied to me to some degree, or some of the time' },
    { value: 2, label: 'Often',         description: 'Applied to me to a considerable degree, or a good part of time' },
    { value: 3, label: 'Almost Always', description: 'Applied to me very much, or most of the time' },
  ],
};

const PHQ9_DATA = {
  id: 'phq9', title: 'PHQ-9', subtitle: 'Patient Health Questionnaire',
  tagline: 'Screens for depressive disorder severity over the past two weeks.',
  timeEstimate: '2–3 min · 9 questions',
  accentFrom: 'from-blue-500', accentTo: 'to-indigo-600',
  instructions: `For each of the following problems, indicate how often you have been bothered over the past 2 weeks.\n\nNot at all → 0   |   Several days → 1   |   More than half the days → 2   |   Nearly every day → 3`,
  timeframe: 'Over the last 2 weeks, how often have you been bothered by…',
  questions: [
    { id: 1, text: "Little interest or pleasure in doing things" },
    { id: 2, text: "Feeling down, depressed, or hopeless" },
    { id: 3, text: "Trouble falling or staying asleep, or sleeping too much" },
    { id: 4, text: "Feeling tired or having little energy" },
    { id: 5, text: "Poor appetite or overeating" },
    { id: 6, text: "Feeling bad about yourself — or that you are a failure or have let yourself or your family down" },
    { id: 7, text: "Trouble concentrating on things, such as reading the newspaper or watching television" },
    { id: 8, text: "Moving or speaking so slowly that other people could have noticed? Or being so fidgety or restless that you have been moving around a lot more than usual" },
    { id: 9, text: "Thoughts that you would be better off dead, or of hurting yourself in some way", critical: true },
  ],
  options: [
    { value: 0, label: 'Not at all',               description: '0 days' },
    { value: 1, label: 'Several days',             description: 'About 1–6 days' },
    { value: 2, label: 'More than half the days',  description: 'About 7–11 days' },
    { value: 3, label: 'Nearly every day',         description: 'About 12–14 days' },
  ],
  getSeverity: (score) => {
    if (score <= 4)  return { level: 'Minimal or None',   color: 'green',  band: '0–4' };
    if (score <= 9)  return { level: 'Mild',              color: 'yellow', band: '5–9' };
    if (score <= 14) return { level: 'Moderate',          color: 'orange', band: '10–14' };
    if (score <= 19) return { level: 'Moderately Severe', color: 'red',    band: '15–19' };
    return           { level: 'Severe',                   color: 'red',    band: '20–27' };
  },
};

const GAD7_DATA = {
  id: 'gad7', title: 'GAD-7', subtitle: 'Generalized Anxiety Disorder Scale',
  tagline: 'Screens for generalized anxiety disorder severity over the past two weeks.',
  timeEstimate: '1–2 min · 7 questions',
  accentFrom: 'from-teal-500', accentTo: 'to-cyan-600',
  instructions: `For each of the following problems, indicate how often you have been bothered over the past 2 weeks.\n\nNot at all → 0   |   Several days → 1   |   More than half the days → 2   |   Nearly every day → 3`,
  timeframe: 'Over the last 2 weeks, how often have you been bothered by…',
  questions: [
    { id: 1, text: "Feeling nervous, anxious, or on edge" },
    { id: 2, text: "Not being able to stop or control worrying" },
    { id: 3, text: "Worrying too much about different things" },
    { id: 4, text: "Trouble relaxing" },
    { id: 5, text: "Being so restless that it is hard to sit still" },
    { id: 6, text: "Becoming easily annoyed or irritable" },
    { id: 7, text: "Feeling afraid as if something awful might happen" },
  ],
  options: [
    { value: 0, label: 'Not at all',               description: '0 days' },
    { value: 1, label: 'Several days',             description: 'About 1–6 days' },
    { value: 2, label: 'More than half the days',  description: 'About 7–11 days' },
    { value: 3, label: 'Nearly every day',         description: 'About 12–14 days' },
  ],
  getSeverity: (score) => {
    if (score <= 4)  return { level: 'Minimal',  color: 'green',  band: '0–4' };
    if (score <= 9)  return { level: 'Mild',     color: 'yellow', band: '5–9' };
    if (score <= 14) return { level: 'Moderate', color: 'orange', band: '10–14' };
    return           { level: 'Severe',          color: 'red',    band: '≥15' };
  },
};

const ALL_TOOLS = [DASS42_DATA, PHQ9_DATA, GAD7_DATA];

const SEVERITY_STYLES = {
  green:  { badge: 'bg-green-100 text-green-800',   bar: 'bg-green-500' },
  yellow: { badge: 'bg-yellow-100 text-yellow-800', bar: 'bg-yellow-500' },
  orange: { badge: 'bg-orange-100 text-orange-800', bar: 'bg-orange-500' },
  red:    { badge: 'bg-red-100 text-red-800',        bar: 'bg-red-500' },
};

// ─── SUPPORT CONTENT ─────────────────────────────────────────────────────────

const COPING_CONTENT = {
  depression: {
    headline: 'Managing Low Mood',
    techniques: [
      { icon: '🚶', name: 'Behavioural Activation',
        desc: 'Depression reduces motivation — but acting first creates mood improvement, not vice versa.',
        meta: { time: '10–30 min', goal: 'Build momentum', when: 'Low mood, low energy' },
        steps: ['List 3 small activities you used to enjoy.', 'Schedule one today, even for 10 minutes.', 'Do it regardless of how you feel — motivation follows action.', 'Notice how you feel before and after.'] },
      { icon: '📓', name: 'Gratitude Journaling',
        desc: 'Intentionally focusing on small positives gradually retrains a depressed mind.',
        meta: { time: '3–5 min', goal: 'Shift attention', when: 'End of day' },
        steps: ['Each evening, write 3 specific things that went okay today.', 'They can be tiny (a hot drink, a moment of quiet).', 'Try for 7 consecutive days and notice any shift.'] },
      { icon: '☀️', name: 'Morning Sunlight',
        desc: 'Light exposure within an hour of waking boosts serotonin and regulates your body clock.',
        meta: { time: '10–15 min', goal: 'Regulate rhythm', when: 'Morning' },
        steps: ['Go outside within 1 hour of waking.', 'Spend 10–15 minutes in natural daylight.', 'Even on cloudy days, outdoor light is far brighter than indoors.'] },
      { icon: '🤝', name: 'Social Connection',
        desc: 'Isolation deepens depression. Even brief contact helps.',
        meta: { time: '2–15 min', goal: 'Reduce isolation', when: 'Anytime' },
        steps: ['Send one message to a friend or family member today.', "It doesn't need to be deep — \"thinking of you\" counts.", 'If possible, arrange a brief in-person meeting this week.'] },
    ],
  },
  anxiety: {
    headline: 'Managing Anxiety & Worry',
    techniques: [
      { icon: '🌬️', name: '4-7-8 Breathing',
        desc: 'Activates the parasympathetic nervous system and reduces anxiety within minutes.',
        meta: { time: '2–4 min', goal: 'Calm the body', when: 'Panic, racing thoughts' },
        steps: ['Breathe in through your nose for 4 counts.', 'Hold for 7 counts.', 'Exhale slowly through your mouth for 8 counts.', 'Repeat 4–6 cycles whenever anxiety spikes.'] },
      { icon: '🌱', name: '5-4-3-2-1 Grounding',
        desc: 'Anchors you in the present moment and interrupts the anxiety spiral.',
        meta: { time: '2–5 min', goal: 'Re-ground attention', when: 'Spiralling worry' },
        steps: ['Name 5 things you can see.', 'Name 4 things you can physically touch or feel.', 'Name 3 things you can hear.', 'Name 2 things you can smell.', 'Name 1 thing you can taste.'] },
      { icon: '📋', name: 'Worry Postponement',
        desc: 'Contains worry to a specific time, freeing the rest of your day.',
        meta: { time: '15 min/day', goal: 'Contain worry', when: 'Chronic worrying' },
        steps: ["When a worry arrives, jot it down briefly on a notepad.", "Tell yourself: \"I'll deal with this at my worry time.\"", 'Schedule 15 minutes daily as "worry time" (e.g., 6 PM).', 'Work through your list then — and not before.'] },
      { icon: '💪', name: 'Progressive Muscle Relaxation',
        desc: 'Releases physical tension that builds up silently during ongoing anxiety.',
        meta: { time: '8–12 min', goal: 'Release tension', when: 'Body tension, restlessness' },
        steps: ['Sit comfortably. Start at your feet.', 'Tense each muscle group firmly for 5 seconds.', 'Release and notice the wave of relaxation for 10 seconds.', 'Work upward: feet → calves → thighs → abdomen → shoulders → face.'] },
    ],
  },
  stress: {
    headline: 'Managing Stress & Overwhelm',
    techniques: [
      { icon: '📦', name: 'Box Breathing',
        desc: 'A rapid nervous-system reset used by emergency responders.',
        meta: { time: '2 min', goal: 'Reset', when: 'Before stressful moments' },
        steps: ['Breathe in for 4 counts.', 'Hold for 4 counts.', 'Breathe out for 4 counts.', 'Hold for 4 counts.', 'Repeat for 2 minutes. Use before stressful moments.'] },
      { icon: '📅', name: 'Priority Matrix',
        desc: 'Clears overwhelm by showing what actually needs your attention today.',
        meta: { time: '10 min', goal: 'Reduce overwhelm', when: 'Too many tasks' },
        steps: ['List all current tasks on paper.', 'Sort: Urgent & Important → do now; Important not urgent → schedule; Urgent not important → delegate; Neither → drop.', 'Commit to only the top 3 tasks today.'] },
      { icon: '🏃', name: 'Movement Break',
        desc: 'Physical activity metabolises stress hormones within 20 minutes.',
        meta: { time: '10–20 min', goal: 'Discharge stress', when: 'After conflict / long focus' },
        steps: ['When stress peaks, stand up immediately.', 'Take a 10-minute walk, outside if possible.', 'Focus on your surroundings rather than your thoughts.'] },
      { icon: '🛡️', name: 'Setting Limits',
        desc: 'Chronic stress often comes from over-commitment and difficulty saying no.',
        meta: { time: '5–10 min', goal: 'Protect energy', when: 'Over-committed' },
        steps: ['Identify one thing you are doing out of obligation rather than choice.', 'Practice: "I appreciate you asking, but I can\'t take that on right now."', 'Protect three non-negotiables daily: sleep, meals, and at least 20 min of rest.'] },
    ],
  },
};

const CBT_EXERCISES = {
  depression: {
    name: 'Thought Record', icon: '📝',
    intro: 'Depression traps us in negative thoughts that feel true but often aren\'t the full picture. A thought record helps you examine the evidence objectively.',
    steps: [
      { label: 'The thought', prompt: 'What negative thought are you having? Write it as precisely as possible.' },
      { label: 'Belief strength', prompt: 'How strongly do you believe this thought right now? (0–100%)' },
      { label: 'Evidence FOR', prompt: 'What facts support this thought being true?' },
      { label: 'Evidence AGAINST', prompt: 'What facts suggest it might not be entirely true or not the full picture?' },
      { label: 'Balanced thought', prompt: 'Write a more balanced, realistic thought that takes ALL the evidence into account.' },
      { label: 'Re-rate belief', prompt: 'Now how strongly do you believe the original thought? (0–100%). What changed?' },
    ],
  },
  anxiety: {
    name: 'Decatastrophising', icon: '🔍',
    intro: 'Anxiety magnifies threats. This exercise helps you realistically evaluate how bad something actually is — and how capable you are of handling it.',
    steps: [
      { label: 'The worry', prompt: 'What situation is making you anxious? Describe it specifically.' },
      { label: 'Worst case', prompt: 'What is the absolute worst realistic outcome you fear?' },
      { label: 'Best case', prompt: 'What is the most hopeful realistic outcome?' },
      { label: 'Most likely', prompt: 'What will probably actually happen?' },
      { label: 'Your resources', prompt: 'Even if the worst happened, what resources, skills, or people could help you cope?' },
      { label: 'New perspective', prompt: 'How do you see this situation now? Write a more balanced view.' },
    ],
  },
  stress: {
    name: 'Cognitive Restructuring', icon: '🔄',
    intro: 'Stress is often driven by rigid demands we place on ourselves and the world. Restructuring helps identify and soften those inflexible rules.',
    steps: [
      { label: 'The stressor', prompt: 'Describe the situation causing you the most stress right now.' },
      { label: 'The thought', prompt: 'What thoughts are driving the stress? (e.g., "I must be perfect", "I can\'t cope with this")' },
      { label: 'Name the trap', prompt: 'Is this catastrophising? All-or-nothing thinking? Should/must statements? Mind-reading? Perfectionism?' },
      { label: 'The friend test', prompt: 'What would you say to a close friend who had this exact thought?' },
      { label: 'Reframe', prompt: 'Write a more flexible, compassionate alternative to your original thought.' },
    ],
  },
};

const LIFESTYLE_TIPS = [
  { icon: '😴', title: 'Sleep', tip: 'Keep a consistent bed and wake time — even weekends. Avoid screens 1 hour before bed. 7–9 hours is optimal for most adults.' },
  { icon: '🚶', title: 'Movement', tip: '30 minutes of moderate activity most days. A brisk walk counts. Exercise is one of the most effective mood-regulators available.' },
  { icon: '☀️', title: 'Sunlight', tip: '10–15 minutes of morning sunlight regulates your circadian rhythm and supports serotonin production.' },
  { icon: '🥗', title: 'Nutrition', tip: 'Eat at regular intervals. Reduce ultra-processed food and sugar. Omega-3s, leafy greens, and fermented foods support brain chemistry.' },
  { icon: '🤝', title: 'Social', tip: 'Even brief, quality social contact strongly protects mental health. Reach out to one person today — even a short message counts.' },
  { icon: '📵', title: 'Digital Limits', tip: 'Limit social media to 30 min/day. News overload increases anxiety. Use your phone\'s built-in screen time tools to enforce this.' },
];

const EMOTION_OPTIONS = [
  '😔 Sad', '😰 Anxious', '😠 Irritable', '😴 Exhausted',
  '😶 Numb', '😊 Okay', '😟 Worried', '😭 Overwhelmed',
  '🤗 Hopeful', '😤 Frustrated', '😌 Calm', '😕 Confused',
];

const MOOD_LABELS = { 1: 'Very Low', 2: 'Low', 3: 'Below Average', 4: 'Slightly Low', 5: 'Neutral', 6: 'Slightly Good', 7: 'Good', 8: 'Very Good', 9: 'Great', 10: 'Excellent' };

const MOOD_EMOJIS = { 1: '😞', 2: '😟', 3: '😕', 4: '🙁', 5: '😐', 6: '🙂', 7: '😊', 8: '😄', 9: '😁', 10: '🤩' };

const SCALE_BADGE = {
  stress:     { label: 'Stress',     bg: 'bg-orange-100', text: 'text-orange-700', dot: 'bg-orange-400' },
  anxiety:    { label: 'Anxiety',    bg: 'bg-blue-100',   text: 'text-blue-700',   dot: 'bg-blue-400'   },
  depression: { label: 'Depression', bg: 'bg-purple-100', text: 'text-purple-700', dot: 'bg-purple-400' },
};

// ─── COMPONENT ───────────────────────────────────────────────────────────────

function Assessment({ sessionToken, onBack }) {
  // ── questionnaire state ────────────────────────────────────────────────────
  const [activeTool, setActiveTool]             = useState(null);
  const [showInstructions, setShowInstructions] = useState(false);
  const [currentQuestion, setCurrentQuestion]   = useState(0);
  const [responses, setResponses]               = useState({});
  const [loading, setLoading]                   = useState(false);
  const [result, setResult]                     = useState(null);

  // ── question animation state ───────────────────────────────────────────────
  const [questionVisible, setQuestionVisible]   = useState(true);
  const [showMilestone, setShowMilestone]       = useState(false);

  // ── support hub state ──────────────────────────────────────────────────────
  const [showSupport, setShowSupport]         = useState(false);
  const [supportTab, setSupportTab]           = useState('summary');
  const [aiSummary, setAiSummary]             = useState('');
  const [summaryLoading, setSummaryLoading]   = useState(false);
  const [expandedTechnique, setExpandedTechnique] = useState(null);
  const [cbtAnswers, setCbtAnswers]           = useState({});

  // ── talk tab state ─────────────────────────────────────────────────────────
  const [chatMessages, setChatMessages]       = useState([]);
  const [chatInput, setChatInput]             = useState('');
  const [chatLoading, setChatLoading]         = useState(false);
  const chatEndRef                            = useRef(null);

  // ── journal state ──────────────────────────────────────────────────────────
  const [journalMood, setJournalMood]         = useState(5);
  const [journalEmotions, setJournalEmotions] = useState([]);
  const [journalTriggers, setJournalTriggers] = useState('');
  const [journalNotes, setJournalNotes]       = useState('');
  const [journalSaving, setJournalSaving]     = useState(false);
  const [journalSaved, setJournalSaved]       = useState(false);
  const [journalHistory, setJournalHistory]   = useState([]);

  // ── progress state ─────────────────────────────────────────────────────────
  const [assessmentHistory, setAssessmentHistory] = useState([]);
  const [historyLoading, setHistoryLoading]       = useState(false);

  // ── effects ────────────────────────────────────────────────────────────────
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  useEffect(() => {
    if (showSupport && result) {
      loadAiSummary();
      loadAssessmentHistory();
      loadJournalHistory();
    }
  }, [showSupport]);

  useEffect(() => {
    if (supportTab === 'talk' && chatMessages.length === 0 && aiSummary) {
      const firstLine = aiSummary.split('\n').find(l => l.trim()) || '';
      setChatMessages([{
        role: 'assistant',
        content: `Hi, I've reviewed your ${activeTool?.title} results. ${firstLine}\n\nI'm here to support you — how are you feeling right now?`,
      }]);
    }
  }, [supportTab, aiSummary]);

  // Keyboard shortcuts for answering questions (1/2/3/4)
  useEffect(() => {
    if (!activeTool || showInstructions || result || loading) return;
    const handler = (e) => {
      const key = parseInt(e.key);
      if (key >= 1 && key <= activeTool.options.length) {
        handleAnswer(activeTool.options[key - 1].value);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [activeTool, showInstructions, result, loading, currentQuestion, responses]);

  // ── helpers ────────────────────────────────────────────────────────────────

  const resetToSelector = () => {
    setActiveTool(null); setShowInstructions(false); setCurrentQuestion(0);
    setResponses({}); setResult(null); setShowSupport(false);
    setSupportTab('summary'); setAiSummary(''); setChatMessages([]);
    setCbtAnswers({}); setJournalSaved(false); setQuestionVisible(true);
    setShowMilestone(false);
  };

  const selectTool = (tool) => {
    setActiveTool(tool); setShowInstructions(true);
    setCurrentQuestion(0); setResponses({}); setResult(null);
  };

  const handleAnswer = (value) => {
    const qId = activeTool.questions[currentQuestion].id;
    const newResponses = { ...responses, [qId]: value };
    setResponses(newResponses);

    const nextQ = currentQuestion + 1;
    const total = activeTool.questions.length;
    const half  = Math.floor(total / 2);

    if (nextQ < total) {
      setQuestionVisible(false);
      setTimeout(() => {
        setCurrentQuestion(nextQ);
        setQuestionVisible(true);
        // Show encouragement at halfway point
        if (nextQ === half) {
          setShowMilestone(true);
          setTimeout(() => setShowMilestone(false), 2800);
        }
      }, 180);
    } else {
      submitAssessment(newResponses);
    }
  };

  const submitAssessment = async (finalResponses) => {
    setLoading(true);
    try {
      const res = await axios.post(`${API_BASE}/api/submit-assessment`, {
        responses: finalResponses,
        session_token: sessionToken,
        assessment_type: activeTool.id,
      });
      setResult(res.data);
    } catch (err) {
      console.error(err);
      alert('Error submitting assessment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // DASS-42 subscale scoring
  const calcDass42Scores = () => {
    let dep = 0, anx = 0, str = 0;
    DASS42_DATA.questions.forEach(q => {
      const s = responses[q.id] || 0;
      if (q.scale === 'depression') dep += s;
      else if (q.scale === 'anxiety') anx += s;
      else str += s;
    });
    return { depression: dep * 2, anxiety: anx * 2, stress: str * 2 };
  };

  const getDass42Severity = (score, type) => {
    const r = { depression: { normal: 9, mild: 13, moderate: 20, severe: 27 }, anxiety: { normal: 7, mild: 9, moderate: 14, severe: 19 }, stress: { normal: 14, mild: 18, moderate: 25, severe: 33 } }[type];
    if (score <= r.normal)   return { level: 'Normal',           color: 'green'  };
    if (score <= r.mild)     return { level: 'Mild',             color: 'yellow' };
    if (score <= r.moderate) return { level: 'Moderate',         color: 'orange' };
    if (score <= r.severe)   return { level: 'Severe',           color: 'red'    };
    return                          { level: 'Extremely Severe', color: 'red'    };
  };

  const calcSimpleTotal = (tool) => tool.questions.reduce((s, q) => s + (responses[q.id] || 0), 0);

  const phq9Item9Flagged = () => activeTool?.id === 'phq9' && (responses[9] || 0) > 0;

  const getDominantIssue = () => {
    if (activeTool?.id === 'phq9') return 'depression';
    if (activeTool?.id === 'gad7') return 'anxiety';
    const sc = calcDass42Scores();
    const rank = { Normal: 0, Mild: 1, Moderate: 2, Severe: 3, 'Extremely Severe': 4 };
    const items = [
      { type: 'depression', r: rank[getDass42Severity(sc.depression, 'depression').level] || 0 },
      { type: 'anxiety',    r: rank[getDass42Severity(sc.anxiety,    'anxiety').level]    || 0 },
      { type: 'stress',     r: rank[getDass42Severity(sc.stress,     'stress').level]     || 0 },
    ];
    return items.sort((a, b) => b.r - a.r)[0].type;
  };

  const isHighRisk = () => {
    if (!result) return false;
    if (phq9Item9Flagged()) return true;
    const sev = getResultSeverity();
    return sev === 'severe' || sev === 'extremely_severe' || sev === 'moderately_severe';
  };

  const getResultSeverity = () => {
    if (activeTool?.id === 'dass42') {
      const sc = calcDass42Scores();
      const sevs = [
        getDass42Severity(sc.depression, 'depression'),
        getDass42Severity(sc.anxiety,    'anxiety'),
        getDass42Severity(sc.stress,     'stress'),
      ];
      const order = ['Normal', 'Mild', 'Moderate', 'Severe', 'Extremely Severe'];
      const dominant = sevs.sort((a, b) => order.indexOf(b.level) - order.indexOf(a.level))[0];
      const labelToKey = {
        'Normal': 'normal', 'Mild': 'mild', 'Moderate': 'moderate',
        'Severe': 'severe', 'Extremely Severe': 'extremely_severe',
      };
      return labelToKey[dominant.level] || 'normal';
    }
    return result?.interpretation?.severity || 'unknown';
  };

  const getResultScore = () => {
    if (activeTool?.id === 'phq9') return calcSimpleTotal(PHQ9_DATA);
    if (activeTool?.id === 'gad7') return calcSimpleTotal(GAD7_DATA);
    return result?.score || 0;
  };

  const buildDass42Subscales = () => {
    const sc = calcDass42Scores();
    const labelToKey = {
      'Normal': 'normal', 'Mild': 'mild', 'Moderate': 'moderate',
      'Severe': 'severe', 'Extremely Severe': 'extremely_severe',
    };
    const toEntry = (score, scale) => {
      const sev = getDass42Severity(score, scale);
      return { score, label: sev.level, severity: labelToKey[sev.level] || 'normal' };
    };
    return {
      depression: toEntry(sc.depression, 'depression'),
      anxiety:    toEntry(sc.anxiety,    'anxiety'),
      stress:     toEntry(sc.stress,     'stress'),
    };
  };

  // ── support hub data loaders ───────────────────────────────────────────────

  const loadAiSummary = async () => {
    if (aiSummary || summaryLoading) return;
    setSummaryLoading(true);
    try {
      const body = {
        session_token: sessionToken,
        score: getResultScore(),
        assessment_type: activeTool?.id,
        severity: getResultSeverity(),
        item9_positive: phq9Item9Flagged(),
      };
      if (activeTool?.id === 'dass42') {
        body.dass42_subscales = buildDass42Subscales();
      }
      const res = await axios.post(`${API_BASE}/api/assessment-support`, body);
      setAiSummary(res.data.interpretation);
    } catch (err) {
      setAiSummary('We could not generate a personalised interpretation right now. Please review your score above.');
    } finally {
      setSummaryLoading(false);
    }
  };

  const loadAssessmentHistory = async () => {
    if (assessmentHistory.length > 0 || historyLoading) return;
    setHistoryLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/api/get-assessments/${sessionToken}`);
      setAssessmentHistory(res.data.assessments || []);
    } catch (err) {
      console.error(err);
    } finally {
      setHistoryLoading(false);
    }
  };

  const loadJournalHistory = async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/mood-journal/${sessionToken}`);
      setJournalHistory(res.data.entries || []);
    } catch (err) {
      console.error(err);
    }
  };

  // ── talk tab handler ───────────────────────────────────────────────────────

  const handleSendChat = async (e) => {
    e.preventDefault();
    if (!chatInput.trim() || chatLoading) return;
    const msg = chatInput.trim();
    setChatInput('');
    const updatedHistory = [...chatMessages, { role: 'user', content: msg }];
    setChatMessages(updatedHistory);
    setChatLoading(true);
    try {
      const body = {
        session_token: sessionToken,
        message: msg,
        assessment_type: activeTool?.id,
        score: getResultScore(),
        severity: getResultSeverity(),
        chat_history: updatedHistory,
      };
      if (activeTool?.id === 'dass42') {
        body.dass42_subscales = buildDass42Subscales();
      }
      const res = await axios.post(`${API_BASE}/api/assessment-chat`, body);
      setChatMessages(prev => [...prev, { role: 'assistant', content: res.data.response }]);
    } catch (err) {
      setChatMessages(prev => [...prev, { role: 'assistant', content: 'Could not reach the server. Please try again.' }]);
    } finally {
      setChatLoading(false);
    }
  };

  // ── journal handler ────────────────────────────────────────────────────────

  const saveJournalEntry = async () => {
    setJournalSaving(true);
    try {
      await axios.post(`${API_BASE}/api/mood-journal`, {
        session_token: sessionToken,
        mood_score: journalMood,
        emotions: journalEmotions,
        triggers: journalTriggers,
        notes: journalNotes,
      });
      setJournalSaved(true);
      setJournalEmotions([]); setJournalTriggers(''); setJournalNotes('');
      await loadJournalHistory();
    } catch (err) {
      alert('Could not save entry. Please try again.');
    } finally {
      setJournalSaving(false);
    }
  };

  // ─────────────────────────────────────────────────────────────────────────
  // VIEW: Tool Selector
  // ─────────────────────────────────────────────────────────────────────────
  if (!activeTool) {
    const TOOL_META = {
      dass42: { emoji: '🧠', desc: 'Depression · Anxiety · Stress', color: 'from-purple-500 to-pink-600' },
      phq9:   { emoji: '💙', desc: 'Depression screening',           color: 'from-blue-500 to-indigo-600' },
      gad7:   { emoji: '🌿', desc: 'Anxiety screening',              color: 'from-teal-500 to-cyan-600'   },
    };
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
        <div className="max-w-xl w-full">

          {/* Back */}
          <button onClick={onBack} className="flex items-center gap-2 text-gray-500 hover:text-gray-800 mb-8 transition-colors text-sm group">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" /> Back to Dashboard
          </button>

          {/* Hero */}
          <div className="text-center mb-10">
            <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-lg shadow-indigo-200">
              <Heart className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2 tracking-tight">Mental Health Check-In</h1>
            <p className="text-gray-500 text-sm max-w-sm mx-auto leading-relaxed">
              Taking a few minutes to check in with yourself is a meaningful act of self-care. Choose a validated tool below.
            </p>
          </div>

          {/* Tool cards */}
          <div className="space-y-3 mb-6">
            {ALL_TOOLS.map(tool => {
              const meta = TOOL_META[tool.id];
              return (
                <button key={tool.id} onClick={() => selectTool(tool)}
                  className="w-full bg-white rounded-2xl border border-gray-100 p-5 text-left hover:shadow-md hover:border-indigo-200 transition-all duration-200 group shadow-sm">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 bg-gradient-to-br ${meta.color} rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm text-xl`}>
                      {meta.emoji}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-0.5">
                        <h3 className="text-base font-semibold text-gray-900">{tool.subtitle}</h3>
                        <div className="flex items-center gap-1.5 flex-shrink-0">
                          <Clock className="w-3.5 h-3.5 text-gray-400" />
                          <span className="text-xs text-gray-400">{tool.timeEstimate}</span>
                        </div>
                      </div>
                      <p className="text-sm text-gray-500">{tool.tagline}</p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all flex-shrink-0" />
                  </div>
                </button>
              );
            })}
          </div>

          {/* Disclaimer */}
          <div className="flex items-start gap-3 bg-amber-50 border border-amber-100 rounded-xl p-4">
            <span className="text-amber-500 flex-shrink-0 mt-0.5">⚠️</span>
            <p className="text-xs text-amber-800 leading-relaxed">
              <strong>For self-monitoring only.</strong> These tools are not diagnostic instruments and cannot replace assessment by a qualified healthcare professional.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // VIEW: Instructions
  // ─────────────────────────────────────────────────────────────────────────
  if (showInstructions) {
    const features = [
      { icon: <CheckCircle className="w-4 h-4 text-green-500" />, text: `${activeTool.questions.length} questions · ${activeTool.timeEstimate}` },
      { icon: <Lock className="w-4 h-4 text-indigo-400" />,       text: 'Completely confidential' },
      { icon: <RefreshCw className="w-4 h-4 text-blue-400" />,    text: 'You can go back and change answers' },
    ];
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
        <div className="max-w-lg w-full">

          {/* Header card with gradient */}
          <div className={`bg-gradient-to-br ${activeTool.accentFrom} ${activeTool.accentTo} rounded-2xl p-8 text-center mb-4 shadow-lg`}>
            <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Brain className="w-7 h-7 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-1">{activeTool.title}</h2>
            <p className="text-white/80 text-sm">{activeTool.subtitle}</p>
          </div>

          {/* Content card */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-4">
            <h3 className="font-semibold text-gray-800 mb-3 text-sm uppercase tracking-wide">How to answer</h3>
            <div className="bg-indigo-50 rounded-xl p-4 mb-4">
              <p className="text-sm text-indigo-800 whitespace-pre-line leading-relaxed">{activeTool.instructions}</p>
            </div>
            <div className="space-y-2.5">
              {features.map((f, i) => (
                <div key={i} className="flex items-center gap-3 text-sm text-gray-600">
                  {f.icon}<span>{f.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Notice */}
          <div className="bg-yellow-50 border border-yellow-100 rounded-xl p-3.5 mb-5 flex items-start gap-2.5">
            <span className="flex-shrink-0 mt-0.5">💡</span>
            <p className="text-xs text-yellow-800 leading-relaxed">Answer honestly — there are no right or wrong responses. This tool is for your own awareness, not evaluation by others.</p>
          </div>

          <div className="flex gap-3">
            <button onClick={resetToSelector} className="flex-1 py-3 border-2 border-gray-200 text-gray-600 rounded-xl font-medium hover:bg-gray-50 transition-all text-sm">
              Back
            </button>
            <button onClick={() => setShowInstructions(false)}
              className={`flex-1 py-3 bg-gradient-to-r ${activeTool.accentFrom} ${activeTool.accentTo} text-white rounded-xl font-semibold hover:opacity-90 transition-all shadow-md text-sm`}>
              Begin Assessment
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // VIEW: Loading
  // ─────────────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className={`w-20 h-20 bg-gradient-to-br ${activeTool.accentFrom} ${activeTool.accentTo} rounded-full flex items-center justify-center mx-auto mb-5 shadow-lg animate-pulse`}>
            <Brain className="w-10 h-10 text-white" />
          </div>
          <h3 className="text-lg font-semibold text-gray-800 mb-1">Reviewing your responses…</h3>
          <p className="text-gray-500 text-sm">This will only take a moment</p>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // VIEW: Support Hub (after result, when user clicks "Get Support")
  // ─────────────────────────────────────────────────────────────────────────
  if (result && showSupport) {
    const dominantIssue = getDominantIssue();
    const coping = COPING_CONTENT[dominantIssue] || COPING_CONTENT.depression;
    const cbtEx  = CBT_EXERCISES[dominantIssue]  || CBT_EXERCISES.depression;
    const highRisk = isHighRisk();

    const TABS = [
      { id: 'summary',  label: 'Support',  icon: Heart },
      { id: 'talk',     label: 'Talk',     icon: MessageCircle },
      { id: 'journal',  label: 'Journal',  icon: BookOpen },
      { id: 'progress', label: 'Progress', icon: TrendingUp },
    ];

    const crisisBlock = (
      <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-4 mb-4">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
            <ShieldAlert className="w-4 h-4 text-red-600" />
          </div>
          <div>
            <p className="font-bold text-red-900 text-sm mb-2">Crisis Resources — Available 24/7</p>
            <ul className="text-sm text-red-800 space-y-1">
              <li>• <strong>Call or text 988</strong> — Suicide &amp; Crisis Lifeline</li>
              <li>• <strong>Text HELLO to 741741</strong> — Crisis Text Line</li>
              <li>• <strong>Call 911</strong> — Immediate emergency</li>
            </ul>
          </div>
        </div>
      </div>
    );

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-purple-50/30">
        {/* Header */}
        <div className="bg-white/90 backdrop-blur border-b border-gray-100 px-4 py-3.5 flex items-center gap-3 sticky top-0 z-20">
          <button onClick={() => setShowSupport(false)} className="text-gray-500 hover:text-gray-800 flex-shrink-0 p-1 rounded-lg hover:bg-gray-100 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className={`w-9 h-9 bg-gradient-to-br ${activeTool.accentFrom} ${activeTool.accentTo} rounded-xl flex items-center justify-center flex-shrink-0`}>
            <Heart className="w-4 h-4 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-base sm:text-lg font-bold text-gray-900 leading-none mb-0.5">Personalised Support</p>
            <p className="text-sm text-gray-400">{activeTool.title} · {getResultSeverity().replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}</p>
          </div>
        </div>

        {/* Tab bar */}
        <div className="bg-white/90 backdrop-blur border-b border-gray-100 px-2 sticky top-[61px] z-20">
          <div className="flex">
            {TABS.map(tab => {
              const Icon = tab.icon;
              const active = supportTab === tab.id;
              return (
                <button key={tab.id} onClick={() => setSupportTab(tab.id)}
                  className={`flex items-center gap-1.5 px-4 py-3.5 text-base font-medium border-b-2 flex-1 justify-center transition-all ${
                    active ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-400 hover:text-gray-700 hover:border-gray-200'
                  }`}>
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">

          {/* ── SUMMARY TAB ─────────────────────────────────────────────── */}
          {supportTab === 'summary' && (
            <div className="space-y-5">
              {highRisk && crisisBlock}

              {/* AI Interpretation */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-7">
                <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-3 flex items-center gap-2 uppercase tracking-wide">
                  <Sparkles className="w-4 h-4 text-indigo-400" /> Understanding Your Result
                </h3>
                {summaryLoading ? (
                  <div className="space-y-2.5 py-2">
                    <div className="h-3 bg-gray-100 rounded-full animate-pulse w-full" />
                    <div className="h-3 bg-gray-100 rounded-full animate-pulse w-5/6" />
                    <div className="h-3 bg-gray-100 rounded-full animate-pulse w-4/5" />
                    <div className="h-3 bg-gray-100 rounded-full animate-pulse w-3/4" />
                    <p className="text-sm text-gray-400 mt-3 text-center">Generating personalised interpretation…</p>
                  </div>
                ) : (
                  <div>
                    <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">{aiSummary}</p>
                    <p className="text-sm text-gray-400 mt-4 pt-3 border-t border-gray-100 italic">Screening result only — not a clinical diagnosis. Always consult a qualified professional.</p>
                  </div>
                )}
              </div>

              {/* Coping Techniques */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-7">
                <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-0.5 uppercase tracking-wide">{coping.headline}</h3>
                <p className="text-sm text-gray-400 mb-4">Evidence-based techniques for your primary concern</p>
                <div className="grid gap-3 sm:grid-cols-2">
                  {coping.techniques.map((t, i) => (
                    <div
                      key={i}
                      className={`group rounded-2xl border bg-white transition-all ${
                        expandedTechnique === i
                          ? 'border-indigo-200 shadow-sm'
                          : 'border-gray-100 hover:border-indigo-150 hover:shadow-sm'
                      }`}
                    >
                      <button onClick={() => setExpandedTechnique(expandedTechnique === i ? null : i)}
                        className="w-full p-5 text-left">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-3 min-w-0">
                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-2xl ring-1 ring-indigo-100 flex-shrink-0">
                              {t.icon}
                            </div>
                            <div className="min-w-0">
                              <p className="font-semibold text-gray-900 text-base leading-tight">{t.name}</p>
                              <p className="text-sm text-gray-500 mt-1 leading-relaxed">{t.desc}</p>

                              <div className="mt-3 flex flex-wrap gap-2">
                                {t.meta?.time && (
                                  <span className="inline-flex items-center gap-1 rounded-full bg-gray-50 px-2.5 py-1 text-xs font-semibold text-gray-700 ring-1 ring-gray-200">
                                    <Clock className="w-3.5 h-3.5 text-gray-400" />
                                    {t.meta.time}
                                  </span>
                                )}
                                {t.meta?.goal && (
                                  <span className="inline-flex items-center rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-700 ring-1 ring-indigo-100">
                                    {t.meta.goal}
                                  </span>
                                )}
                                {t.meta?.when && (
                                  <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-100">
                                    Best when: {t.meta.when}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          <ChevronRight className={`w-4 h-4 text-gray-300 transition-transform flex-shrink-0 mt-1 ${
                            expandedTechnique === i ? 'rotate-90 text-indigo-400' : 'group-hover:text-gray-500'
                          }`} />
                        </div>
                      </button>
                      {expandedTechnique === i && (
                        <div className="px-4 pb-4 bg-indigo-50/60 border-t border-indigo-100 rounded-b-2xl">
                          <div className="pt-3 flex items-center justify-between gap-3">
                            <p className="text-sm font-bold text-indigo-900 uppercase tracking-wide">How to do it</p>
                            <span className="text-sm text-indigo-700 font-semibold">Tap to collapse</span>
                          </div>
                          <ol className="space-y-2 mt-3">
                            {t.steps.map((step, si) => (
                              <li key={si} className="flex gap-3 text-sm text-gray-700">
                                <span className="w-5 h-5 bg-indigo-500 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">{si + 1}</span>
                                <span className="leading-relaxed">{step}</span>
                              </li>
                            ))}
                          </ol>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* CBT Exercise */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-base font-bold text-gray-900 mb-1 uppercase tracking-wide flex items-center gap-2">
                  <span>{cbtEx.icon}</span> CBT Exercise: {cbtEx.name}
                </h3>
                <p className="text-sm text-gray-500 mb-5 leading-relaxed">{cbtEx.intro}</p>
                <div className="space-y-4">
                  {cbtEx.steps.map((step, i) => (
                    <div key={i}>
                      <label className="block text-base font-semibold text-gray-700 mb-1 flex items-center gap-2">
                        <span className="inline-flex items-center justify-center w-5 h-5 bg-purple-100 text-purple-700 rounded-full text-xs font-bold">{i + 1}</span>
                        {step.label}
                      </label>
                      <p className="text-sm text-gray-500 mb-2 leading-relaxed">{step.prompt}</p>
                      <textarea
                        rows={2}
                        value={cbtAnswers[i] || ''}
                        onChange={e => setCbtAnswers(prev => ({ ...prev, [i]: e.target.value }))}
                        placeholder="Write your answer here…"
                        className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-400 focus:border-transparent resize-none transition-shadow"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Lifestyle Tips */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-7">
                <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-4 uppercase tracking-wide">Lifestyle Recommendations</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {LIFESTYLE_TIPS.map((tip, i) => (
                    <div key={i} className="flex gap-3 p-4 bg-gray-50 rounded-xl hover:bg-indigo-50/50 transition-colors">
                      <span className="text-2xl flex-shrink-0">{tip.icon}</span>
                      <div>
                        <p className="text-base font-semibold text-gray-800">{tip.title}</p>
                        <p className="text-sm text-gray-500 mt-1 leading-relaxed">{tip.tip}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Professional Help */}
              {['moderate', 'moderately_severe', 'severe', 'extremely_severe'].includes(getResultSeverity()) && (
                <div className="bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-100 rounded-2xl p-5">
                  <h3 className="font-bold text-indigo-900 mb-2 flex items-center gap-2">
                    <Star className="w-4 h-4 text-indigo-500" /> Professional Support Recommended
                  </h3>
                  <p className="text-sm text-indigo-800 mb-3 leading-relaxed">Your score suggests speaking with a mental health professional would be beneficial. Seeking support is a sign of strength, not weakness.</p>
                  <ul className="text-sm text-indigo-800 space-y-1.5">
                    <li>• Ask your GP for a referral to a psychologist or psychiatrist</li>
                    <li>• Search for therapists via <strong>Psychology Today</strong> or <strong>BetterHelp</strong></li>
                    <li>• Contact a community mental health centre</li>
                    <li>• If in crisis: <strong>988</strong> (call or text)</li>
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* ── TALK TAB ─────────────────────────────────────────────────── */}
          {supportTab === 'talk' && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col" style={{ height: '72vh' }}>
              <div className="p-4 border-b border-gray-100 flex items-center gap-3">
                <div className={`w-9 h-9 bg-gradient-to-br ${activeTool.accentFrom} ${activeTool.accentTo} rounded-full flex items-center justify-center flex-shrink-0`}>
                  <MessageCircle className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-800">AI Companion</p>
                  <p className="text-xs text-gray-400">Supportive conversation — not a replacement for therapy</p>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {chatMessages.length === 0 && (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center text-gray-400 px-8">
                      <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <MessageCircle className="w-6 h-6 opacity-40" />
                      </div>
                      <p className="text-sm">Loading your personalised greeting…</p>
                    </div>
                  </div>
                )}
                {chatMessages.map((msg, i) => (
                  <div key={i} className={`flex gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    {msg.role === 'assistant' && (
                      <div className={`w-7 h-7 bg-gradient-to-br ${activeTool.accentFrom} ${activeTool.accentTo} rounded-full flex items-center justify-center flex-shrink-0 mt-1`}>
                        <Brain className="w-3.5 h-3.5 text-white" />
                      </div>
                    )}
                    <div className={`max-w-xs sm:max-w-sm rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-br-sm'
                        : 'bg-gray-100 text-gray-800 rounded-bl-sm'
                    }`}>
                      {msg.content.split('\n').map((line, li) => (
                        <span key={li}>{line}{li < msg.content.split('\n').length - 1 && <br />}</span>
                      ))}
                    </div>
                  </div>
                ))}
                {chatLoading && (
                  <div className="flex gap-2 justify-start">
                    <div className={`w-7 h-7 bg-gradient-to-br ${activeTool.accentFrom} ${activeTool.accentTo} rounded-full flex items-center justify-center flex-shrink-0`}>
                      <Brain className="w-3.5 h-3.5 text-white" />
                    </div>
                    <div className="bg-gray-100 rounded-2xl rounded-bl-sm px-4 py-3 flex items-center gap-1.5">
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              <form onSubmit={handleSendChat} className="p-3 border-t border-gray-100 flex gap-2">
                <input
                  type="text" value={chatInput} onChange={e => setChatInput(e.target.value)}
                  placeholder="Share how you're feeling…" disabled={chatLoading}
                  className="flex-1 px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-400 focus:border-transparent disabled:opacity-50 bg-gray-50 focus:bg-white transition-colors"
                />
                <button type="submit" disabled={chatLoading || !chatInput.trim()}
                  className={`px-4 py-2.5 bg-gradient-to-r ${activeTool.accentFrom} ${activeTool.accentTo} text-white rounded-xl disabled:opacity-40 transition-all hover:opacity-90`}>
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          )}

          {/* ── JOURNAL TAB ──────────────────────────────────────────────── */}
          {supportTab === 'journal' && (
            <div className="space-y-5">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-sm font-bold text-gray-900 mb-5 uppercase tracking-wide">Today's Mood Log</h3>

                {journalSaved && (
                  <div className="flex items-center gap-2.5 bg-green-50 border border-green-200 rounded-xl p-4 mb-5 text-sm text-green-800">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className="font-medium">Entry saved successfully.</span>
                    <button onClick={() => setJournalSaved(false)} className="ml-auto text-green-600 hover:text-green-800 text-xs underline">Log another</button>
                  </div>
                )}

                {!journalSaved && (
                  <>
                    {/* Mood slider */}
                    <div className="mb-6">
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-sm font-semibold text-gray-700">How are you feeling?</label>
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">{MOOD_EMOJIS[journalMood]}</span>
                          <span className="text-sm font-bold text-indigo-600">{MOOD_LABELS[journalMood]}</span>
                        </div>
                      </div>
                      <input type="range" min={1} max={10} value={journalMood} onChange={e => setJournalMood(Number(e.target.value))}
                        className="w-full accent-indigo-500 h-2" />
                      <div className="flex justify-between text-xs text-gray-400 mt-1.5">
                        <span>😞 Very Low</span>
                        <span>😐 Neutral</span>
                        <span>🤩 Excellent</span>
                      </div>
                    </div>

                    {/* Emotions */}
                    <div className="mb-5">
                      <label className="block text-sm font-semibold text-gray-700 mb-2.5">Emotions right now</label>
                      <div className="flex flex-wrap gap-2">
                        {EMOTION_OPTIONS.map(em => (
                          <button key={em} type="button"
                            onClick={() => setJournalEmotions(prev => prev.includes(em) ? prev.filter(e => e !== em) : [...prev, em])}
                            className={`px-3 py-1.5 rounded-full text-sm border transition-all ${
                              journalEmotions.includes(em)
                                ? 'bg-indigo-500 text-white border-indigo-500 shadow-sm'
                                : 'bg-white text-gray-600 border-gray-200 hover:border-indigo-300 hover:bg-indigo-50'
                            }`}>
                            {em}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Triggers */}
                    <div className="mb-4">
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">Triggers or notable events</label>
                      <input type="text" value={journalTriggers} onChange={e => setJournalTriggers(e.target.value)}
                        placeholder="What happened today that affected your mood?"
                        className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-400 focus:border-transparent bg-gray-50 focus:bg-white transition-colors" />
                    </div>

                    {/* Notes */}
                    <div className="mb-5">
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">Notes & reflections</label>
                      <textarea rows={3} value={journalNotes} onChange={e => setJournalNotes(e.target.value)}
                        placeholder="Any thoughts, reflections, or things you want to remember…"
                        className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-400 focus:border-transparent resize-none bg-gray-50 focus:bg-white transition-colors" />
                    </div>

                    <button onClick={saveJournalEntry} disabled={journalSaving}
                      className="w-full py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl text-sm font-semibold disabled:opacity-50 hover:opacity-90 transition-all shadow-md shadow-indigo-200">
                      {journalSaving
                        ? <span className="flex items-center justify-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Saving…</span>
                        : 'Save Entry'
                      }
                    </button>
                  </>
                )}
              </div>

              {/* Journal history */}
              {journalHistory.length > 0 && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                  <h3 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wide">Past Entries</h3>
                  <div className="space-y-3">
                    {journalHistory.slice(0, 10).map((entry, i) => {
                      const moodColour = entry.mood_score >= 7 ? 'green' : entry.mood_score >= 4 ? 'yellow' : 'red';
                      const emotions = JSON.parse(entry.emotions || '[]');
                      return (
                        <div key={i} className="border border-gray-100 rounded-xl p-4 hover:border-indigo-100 transition-colors">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <span className="text-lg">{MOOD_EMOJIS[entry.mood_score] || '😐'}</span>
                              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${SEVERITY_STYLES[moodColour]?.badge}`}>
                                {entry.mood_score}/10
                              </span>
                            </div>
                            <span className="text-xs text-gray-400">{new Date(entry.created_at).toLocaleDateString()}</span>
                          </div>
                          {emotions.length > 0 && (
                            <div className="flex flex-wrap gap-1 mb-2">
                              {emotions.map((em, ei) => <span key={ei} className="text-xs bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full">{em}</span>)}
                            </div>
                          )}
                          {entry.notes && <p className="text-xs text-gray-500 leading-relaxed">{entry.notes}</p>}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── PROGRESS TAB ─────────────────────────────────────────────── */}
          {supportTab === 'progress' && (
            <div className="space-y-5">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-sm font-bold text-gray-900 mb-0.5 uppercase tracking-wide">Assessment History</h3>
                <p className="text-xs text-gray-400 mb-5">Track how your scores change over time</p>
                {historyLoading ? (
                  <div className="space-y-3 py-2">
                    {[1,2,3].map(n => (
                      <div key={n} className="h-16 bg-gray-100 rounded-xl animate-pulse" />
                    ))}
                  </div>
                ) : assessmentHistory.length === 0 ? (
                  <div className="text-center py-10">
                    <TrendingUp className="w-10 h-10 text-gray-200 mx-auto mb-2" />
                    <p className="text-sm text-gray-400">No previous assessments found.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {assessmentHistory.map((a, i) => {
                      const typeLabel = a.assessment_type?.toUpperCase() || 'DASS-42';
                      const maxScore = { phq9: 27, gad7: 21, dass42: 126 }[a.assessment_type] || 126;
                      const pct = Math.min((a.score / maxScore) * 100, 100);
                      const barColour = pct < 30 ? 'bg-green-500' : pct < 55 ? 'bg-yellow-500' : pct < 75 ? 'bg-orange-500' : 'bg-red-500';
                      return (
                        <div key={i} className="border border-gray-100 rounded-xl p-4 hover:border-indigo-100 transition-colors">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-bold text-gray-800">{typeLabel}</span>
                              <span className="text-xs text-gray-400">{new Date(a.created_at).toLocaleDateString()}</span>
                            </div>
                            <span className="text-sm font-bold text-gray-700">{a.score}<span className="text-gray-400 font-normal text-xs">/{maxScore}</span></span>
                          </div>
                          <div className="w-full bg-gray-100 rounded-full h-2">
                            <div className={`${barColour} h-2 rounded-full transition-all duration-500`} style={{ width: `${pct}%` }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Follow-up prompt */}
              <div className="bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-100 rounded-2xl p-5">
                <h3 className="font-bold text-indigo-900 mb-2 flex items-center gap-2">
                  <RefreshCw className="w-4 h-4 text-indigo-500" /> Schedule a Follow-Up
                </h3>
                <p className="text-sm text-indigo-800 mb-4 leading-relaxed">
                  Repeating this assessment in 2–4 weeks helps track whether symptoms are improving. Useful information to share with a professional.
                </p>
                <button onClick={resetToSelector}
                  className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-colors shadow-md shadow-indigo-200">
                  Take assessment again
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // VIEW: Result Screens (DASS-42 / PHQ-9 / GAD-7)
  // ─────────────────────────────────────────────────────────────────────────
  if (result) {
    const crisisBlock = (
      <div className="bg-red-50 border border-red-200 rounded-2xl p-5 mb-4">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
            <ShieldAlert className="w-4 h-4 text-red-600" />
          </div>
          <div>
            <h3 className="font-bold text-red-900 mb-1.5 text-sm">Need Immediate Help?</h3>
            <ul className="text-sm text-red-800 space-y-1">
              <li>• <strong>Call or text 988</strong> — Suicide &amp; Crisis Lifeline (24/7)</li>
              <li>• <strong>Text HELLO to 741741</strong> — Crisis Text Line</li>
              <li>• <strong>Call 911</strong> — For immediate emergencies</li>
            </ul>
          </div>
        </div>
      </div>
    );

    const supportButton = (
      <button onClick={() => setShowSupport(true)}
        className={`w-full py-3.5 bg-gradient-to-r ${activeTool.accentFrom} ${activeTool.accentTo} text-white rounded-xl font-semibold hover:opacity-90 transition-all flex items-center justify-center gap-2 shadow-lg`}>
        <Heart className="w-5 h-5" /> Get Personalised Support
      </button>
    );

    // DASS-42 results
    if (activeTool.id === 'dass42') {
      const scores = calcDass42Scores();
      const subs = [
        { label: 'Depression', score: scores.depression, max: 84, sev: getDass42Severity(scores.depression, 'depression'), emoji: '😔' },
        { label: 'Anxiety',    score: scores.anxiety,    max: 84, sev: getDass42Severity(scores.anxiety,    'anxiety'),    emoji: '😰' },
        { label: 'Stress',     score: scores.stress,     max: 84, sev: getDass42Severity(scores.stress,     'stress'),     emoji: '😤' },
      ];
      return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
          <div className="max-w-xl w-full">
            {/* Hero */}
            <div className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl p-8 text-center mb-4 shadow-xl shadow-purple-200">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-1">Well done for completing it</h2>
              <p className="text-white/80 text-sm">DASS-42 results based on your responses</p>
            </div>

            {/* Scores */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-4">
              <h3 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wide">Your Scores</h3>
              <div className="space-y-4">
                {subs.map(({ label, score, max, sev, emoji }) => {
                  const st = SEVERITY_STYLES[sev.color];
                  const pct = Math.min((score / max) * 100, 100);
                  return (
                    <div key={label}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{emoji}</span>
                          <span className="text-sm font-semibold text-gray-800">{label}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-400">{score}/{max}</span>
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${st.badge}`}>{sev.level}</span>
                        </div>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2.5">
                        <div className={`${st.bar} h-2.5 rounded-full transition-all duration-700`} style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-4">
              <p className="text-sm text-blue-800 leading-relaxed">This screening is <strong>not a diagnosis</strong>. If you're experiencing moderate-to-severe symptoms, speaking with a mental health professional is recommended.</p>
            </div>

            {crisisBlock}

            <div className="space-y-3">
              {supportButton}
              <button onClick={onBack} className="w-full py-3 border-2 border-gray-200 text-gray-600 rounded-xl font-medium hover:bg-gray-50 transition-all text-sm">
                Return to Dashboard
              </button>
            </div>
          </div>
        </div>
      );
    }

    // PHQ-9 results
    if (activeTool.id === 'phq9') {
      const total = calcSimpleTotal(PHQ9_DATA);
      const sev   = PHQ9_DATA.getSeverity(total);
      const st    = SEVERITY_STYLES[sev.color];
      const pct   = (total / 27) * 100;
      return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center p-4">
          <div className="max-w-md w-full">
            <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl p-8 text-center mb-4 shadow-xl shadow-blue-200">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-1">Well done for completing it</h2>
              <p className="text-white/80 text-sm">PHQ-9 Depression Screening</p>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-4">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Total Score</h3>
                  <p className="text-sm text-gray-400 mt-0.5">Band: {sev.band} · out of 27</p>
                </div>
                <div className="text-right">
                  <span className="text-4xl font-bold text-gray-900">{total}</span>
                  <span className="text-gray-400 text-sm font-normal">/27</span>
                </div>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-3 mb-3">
                <div className={`${st.bar} h-3 rounded-full transition-all duration-700`} style={{ width: `${pct}%` }} />
              </div>
              <span className={`px-3 py-1 rounded-full text-sm font-bold ${st.badge}`}>{sev.level}</span>
            </div>

            {phq9Item9Flagged() && (
              <div className="bg-red-50 border-2 border-red-300 rounded-2xl p-5 mb-4">
                <div className="flex items-start gap-3">
                  <ShieldAlert className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-bold text-red-900 mb-1">Critical Action Required</h3>
                    <p className="text-sm text-red-800 leading-relaxed">You indicated thoughts of self-harm or being better off dead (item 9). <strong>Please contact a mental health professional or crisis line immediately.</strong></p>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-4">
              <p className="text-sm text-blue-800 leading-relaxed">This is a <strong>screening result, not a diagnosis</strong>. Rule out bipolar disorder, bereavement, and medical causes before concluding depression.</p>
            </div>

            {crisisBlock}

            <div className="space-y-3">
              {supportButton}
              <button onClick={onBack} className="w-full py-3 border-2 border-gray-200 text-gray-600 rounded-xl font-medium hover:bg-gray-50 transition-all text-sm">
                Return to Dashboard
              </button>
            </div>
          </div>
        </div>
      );
    }

    // GAD-7 results
    if (activeTool.id === 'gad7') {
      const total = calcSimpleTotal(GAD7_DATA);
      const sev   = GAD7_DATA.getSeverity(total);
      const st    = SEVERITY_STYLES[sev.color];
      const pct   = (total / 21) * 100;
      return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-teal-50 to-cyan-50 flex items-center justify-center p-4">
          <div className="max-w-md w-full">
            <div className="bg-gradient-to-br from-teal-500 to-cyan-600 rounded-2xl p-8 text-center mb-4 shadow-xl shadow-teal-200">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-1">Well done for completing it</h2>
              <p className="text-white/80 text-sm">GAD-7 Anxiety Screening</p>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-4">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Total Score</h3>
                  <p className="text-sm text-gray-400 mt-0.5">Band: {sev.band} · out of 21</p>
                </div>
                <div className="text-right">
                  <span className="text-4xl font-bold text-gray-900">{total}</span>
                  <span className="text-gray-400 text-sm font-normal">/21</span>
                </div>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-3 mb-3">
                <div className={`${st.bar} h-3 rounded-full transition-all duration-700`} style={{ width: `${pct}%` }} />
              </div>
              <span className={`px-3 py-1 rounded-full text-sm font-bold ${st.badge}`}>{sev.level}</span>
            </div>

            <div className="bg-teal-50 border border-teal-100 rounded-xl p-4 mb-4">
              <p className="text-sm text-teal-800 leading-relaxed">This is a <strong>screening result, not a diagnosis</strong>. Rule out medical causes (ECG for arrhythmias, TSH for thyroid disease) before diagnosing an anxiety disorder.</p>
            </div>

            {crisisBlock}

            <div className="space-y-3">
              {supportButton}
              <button onClick={onBack} className="w-full py-3 border-2 border-gray-200 text-gray-600 rounded-xl font-medium hover:bg-gray-50 transition-all text-sm">
                Return to Dashboard
              </button>
            </div>
          </div>
        </div>
      );
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // VIEW: Question Screen
  // ─────────────────────────────────────────────────────────────────────────
  const progress      = ((currentQuestion + 1) / activeTool.questions.length) * 100;
  const answeredCount = Object.keys(responses).length;
  const currentQ      = activeTool.questions[currentQuestion];
  const scaleBadge    = currentQ.scale ? SCALE_BADGE[currentQ.scale] : null;
  const progressPct   = Math.round((currentQuestion / activeTool.questions.length) * 100);

  const OPTION_COLORS = [
    { ring: 'focus:ring-gray-400',   selected: 'border-gray-400 bg-gray-50',   dot: 'bg-gray-400'   },
    { ring: 'focus:ring-blue-400',   selected: 'border-blue-400 bg-blue-50',   dot: 'bg-blue-400'   },
    { ring: 'focus:ring-orange-400', selected: 'border-orange-400 bg-orange-50', dot: 'bg-orange-400' },
    { ring: 'focus:ring-red-400',    selected: 'border-red-400 bg-red-50',     dot: 'bg-red-400'    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-purple-50 p-4">

      {/* Milestone celebration overlay */}
      {showMilestone && (
        <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
          <div className="bg-white border border-indigo-100 rounded-2xl shadow-2xl px-8 py-5 text-center animate-bounce">
            <p className="text-2xl mb-1">🌟</p>
            <p className="text-base font-bold text-gray-900">Halfway there!</p>
            <p className="text-sm text-gray-500">You're doing great — keep going</p>
          </div>
        </div>
      )}

      <div className="max-w-2xl mx-auto pt-6">
        {/* Top nav */}
        <div className="flex items-center justify-between mb-6">
          <button onClick={resetToSelector} className="flex items-center gap-1.5 text-gray-500 hover:text-gray-800 transition-colors text-sm group">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" /> Exit
          </button>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-400 font-medium">{answeredCount}/{activeTool.questions.length}</span>
            <span className="text-xs text-gray-300">·</span>
            <span className="text-sm font-semibold text-indigo-600">{progressPct}%</span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mb-6">
          <div className="w-full bg-gray-200 rounded-full h-1.5">
            <div
              className={`bg-gradient-to-r ${activeTool.accentFrom} ${activeTool.accentTo} h-1.5 rounded-full transition-all duration-500`}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Question card */}
        <div
          className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8"
          style={{
            opacity: questionVisible ? 1 : 0,
            transform: questionVisible ? 'translateY(0)' : 'translateY(8px)',
            transition: 'opacity 0.18s ease, transform 0.18s ease',
          }}
        >
          {/* Header row */}
          <div className="flex items-start justify-between gap-3 mb-5">
            <div className="flex items-center gap-3">
              <div className={`w-9 h-9 bg-gradient-to-br ${activeTool.accentFrom} ${activeTool.accentTo} rounded-xl flex items-center justify-center flex-shrink-0`}>
                <span className="text-white text-xs font-bold">{currentQuestion + 1}</span>
              </div>
              <p className="text-xs text-gray-400 leading-snug max-w-xs">{activeTool.timeframe}</p>
            </div>
            {scaleBadge && (
              <span className={`flex-shrink-0 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${scaleBadge.bg} ${scaleBadge.text}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${scaleBadge.dot}`} />
                {scaleBadge.label}
              </span>
            )}
          </div>

          {/* Critical flag */}
          {currentQ.critical && (
            <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl p-3.5 mb-4">
              <ShieldAlert className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-800 leading-relaxed"><strong>Sensitive question:</strong> If you are having thoughts of self-harm, please contact a crisis line immediately — call or text <strong>988</strong>, or text HELLO to 741741.</p>
            </div>
          )}

          {/* Question text */}
          <h3 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-7 leading-snug">{currentQ.text}</h3>

          {/* Options */}
          <div className="space-y-3">
            {activeTool.options.map((option, idx) => {
              const isSelected = responses[currentQ.id] === option.value;
              const col = OPTION_COLORS[idx] || OPTION_COLORS[0];
              return (
                <button
                  key={option.value}
                  onClick={() => handleAnswer(option.value)}
                  className={`w-full p-4 text-left border-2 rounded-xl transition-all duration-150 group flex items-center gap-4 ${
                    isSelected
                      ? `${col.selected} shadow-sm`
                      : 'border-gray-100 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {/* Radio dot */}
                  <div className={`w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all ${
                    isSelected ? `${col.dot} border-transparent` : 'border-gray-300 group-hover:border-gray-400'
                  }`}>
                    {isSelected && <span className="w-2 h-2 bg-white rounded-full" />}
                  </div>
                  {/* Label */}
                  <div className="flex-1 min-w-0">
                    <span className="font-semibold text-gray-900 text-sm block">{option.label}</span>
                    <span className="text-xs text-gray-400 mt-0.5 block">{option.description}</span>
                  </div>
                  {/* Keyboard hint */}
                  <span className="text-xs text-gray-300 flex-shrink-0 hidden sm:block font-mono border border-gray-200 rounded px-1.5 py-0.5">
                    {idx + 1}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Bottom nav */}
          <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-100">
            <button
              onClick={() => {
                setQuestionVisible(false);
                setTimeout(() => { setCurrentQuestion(q => Math.max(0, q - 1)); setQuestionVisible(true); }, 180);
              }}
              disabled={currentQuestion === 0}
              className="flex items-center gap-1.5 px-3 py-2 text-sm text-gray-500 hover:text-gray-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors rounded-lg hover:bg-gray-100">
              <ChevronLeft className="w-4 h-4" /> Previous
            </button>
            <p className="text-xs text-gray-400">Press 1–{activeTool.options.length} to answer</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Assessment;
