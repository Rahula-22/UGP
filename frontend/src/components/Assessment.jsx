import React, { useState } from 'react';
import axios from 'axios';
import { ArrowLeft, CheckCircle, AlertCircle, Loader2, ChevronRight, ChevronLeft, ShieldAlert } from 'lucide-react';

const API_BASE = 'http://localhost:8000';

// ─── DASS-42 ────────────────────────────────────────────────────────────────

const DASS42_DATA = {
  id: 'dass42',
  title: 'DASS-42',
  subtitle: 'Depression Anxiety Stress Scales',
  tagline: 'Measures depression, anxiety, and stress over the past week.',
  timeEstimate: '5–10 min · 42 questions',
  accentFrom: 'from-purple-500',
  accentTo: 'to-pink-600',
  instructions: `Rate each statement based on the past week:\n• NEVER — Did not apply to me at all\n• SOMETIMES — Applied to me to some degree, or some of the time\n• OFTEN — Applied to me to a considerable degree, or a good part of time\n• ALMOST ALWAYS — Applied to me very much, or most of the time`,
  timeframe: 'Over the past week, how much did this apply to you?',
  questions: [
    { id: 1,  text: "I found myself getting upset by quite trivial things",                                                                                                       scale: "stress" },
    { id: 2,  text: "I was aware of dryness of my mouth",                                                                                                                         scale: "anxiety" },
    { id: 3,  text: "I couldn't seem to experience any positive feeling at all",                                                                                                  scale: "depression" },
    { id: 4,  text: "I experienced breathing difficulty (e.g., excessively rapid breathing, breathlessness in the absence of physical exertion)",                                 scale: "anxiety" },
    { id: 5,  text: "I just couldn't seem to get going",                                                                                                                          scale: "depression" },
    { id: 6,  text: "I tended to over-react to situations",                                                                                                                       scale: "stress" },
    { id: 7,  text: "I had a feeling of shakiness (e.g., legs going to give way)",                                                                                                scale: "anxiety" },
    { id: 8,  text: "I found it difficult to relax",                                                                                                                              scale: "stress" },
    { id: 9,  text: "I found myself in situations that made me so anxious I was most relieved when they ended",                                                                   scale: "anxiety" },
    { id: 10, text: "I felt that I had nothing to look forward to",                                                                                                               scale: "depression" },
    { id: 11, text: "I found myself getting upset rather easily",                                                                                                                 scale: "stress" },
    { id: 12, text: "I felt that I was using a lot of nervous energy",                                                                                                            scale: "stress" },
    { id: 13, text: "I felt sad and depressed",                                                                                                                                   scale: "depression" },
    { id: 14, text: "I found myself getting impatient when I was delayed in any way (e.g., lifts, traffic lights, being kept waiting)",                                           scale: "stress" },
    { id: 15, text: "I had a feeling of faintness",                                                                                                                               scale: "anxiety" },
    { id: 16, text: "I felt that I had lost interest in just about everything",                                                                                                   scale: "depression" },
    { id: 17, text: "I felt I wasn't worth much as a person",                                                                                                                     scale: "depression" },
    { id: 18, text: "I felt that I was rather touchy",                                                                                                                            scale: "stress" },
    { id: 19, text: "I perspired noticeably (e.g., hands sweaty) in the absence of high temperatures or physical exertion",                                                       scale: "anxiety" },
    { id: 20, text: "I felt scared without any good reason",                                                                                                                      scale: "anxiety" },
    { id: 21, text: "I felt that life wasn't worthwhile",                                                                                                                         scale: "depression" },
    { id: 22, text: "I found it hard to wind down",                                                                                                                               scale: "stress" },
    { id: 23, text: "I had difficulty in swallowing",                                                                                                                             scale: "anxiety" },
    { id: 24, text: "I couldn't seem to get any enjoyment out of the things I did",                                                                                               scale: "depression" },
    { id: 25, text: "I was aware of the action of my heart in the absence of physical exertion (e.g., sense of heart rate increase, heart missing a beat)",                      scale: "anxiety" },
    { id: 26, text: "I felt down-hearted and blue",                                                                                                                               scale: "depression" },
    { id: 27, text: "I found that I was very irritable",                                                                                                                          scale: "stress" },
    { id: 28, text: "I felt I was close to panic",                                                                                                                                scale: "anxiety" },
    { id: 29, text: "I found it hard to calm down after something upset me",                                                                                                      scale: "stress" },
    { id: 30, text: "I feared that I would be \"thrown\" by some trivial but unfamiliar task",                                                                                    scale: "anxiety" },
    { id: 31, text: "I was unable to become enthusiastic about anything",                                                                                                         scale: "depression" },
    { id: 32, text: "I found it difficult to tolerate interruptions to what I was doing",                                                                                         scale: "stress" },
    { id: 33, text: "I was in a state of nervous tension",                                                                                                                        scale: "stress" },
    { id: 34, text: "I felt I was pretty worthless",                                                                                                                              scale: "depression" },
    { id: 35, text: "I was intolerant of anything that kept me from getting on with what I was doing",                                                                            scale: "stress" },
    { id: 36, text: "I felt terrified",                                                                                                                                           scale: "anxiety" },
    { id: 37, text: "I could see nothing in the future to be hopeful about",                                                                                                      scale: "depression" },
    { id: 38, text: "I felt that life was meaningless",                                                                                                                           scale: "depression" },
    { id: 39, text: "I found myself getting agitated",                                                                                                                            scale: "stress" },
    { id: 40, text: "I was worried about situations in which I might panic and make a fool of myself",                                                                            scale: "anxiety" },
    { id: 41, text: "I experienced trembling (e.g., in the hands)",                                                                                                               scale: "anxiety" },
    { id: 42, text: "I found it difficult to work up the initiative to do things",                                                                                                scale: "depression" },
  ],
  options: [
    { value: 0, label: 'Never',         description: 'Did not apply to me at all' },
    { value: 1, label: 'Sometimes',     description: 'Applied to me to some degree, or some of the time' },
    { value: 2, label: 'Often',         description: 'Applied to me to a considerable degree, or a good part of time' },
    { value: 3, label: 'Almost Always', description: 'Applied to me very much, or most of the time' },
  ],
};

// ─── PHQ-9 ──────────────────────────────────────────────────────────────────

const PHQ9_DATA = {
  id: 'phq9',
  title: 'PHQ-9',
  subtitle: 'Patient Health Questionnaire',
  tagline: 'Screens for depressive disorder severity over the past two weeks.',
  timeEstimate: '2–3 min · 9 questions',
  accentFrom: 'from-blue-500',
  accentTo: 'to-indigo-600',
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
    { id: 8, text: "Moving or speaking so slowly that other people could have noticed? Or the opposite — being so fidgety or restless that you have been moving around a lot more than usual" },
    { id: 9, text: "Thoughts that you would be better off dead, or of hurting yourself in some way", critical: true },
  ],
  options: [
    { value: 0, label: 'Not at all',               description: '0 days' },
    { value: 1, label: 'Several days',             description: 'About 1–6 days' },
    { value: 2, label: 'More than half the days',  description: 'About 7–11 days' },
    { value: 3, label: 'Nearly every day',         description: 'About 12–14 days' },
  ],
  getSeverity: (score) => {
    if (score <= 4)  return { level: 'Minimal or None',     color: 'green',  band: '0–4',   action: 'Monitor; may not require treatment' };
    if (score <= 9)  return { level: 'Mild',                color: 'yellow', band: '5–9',   action: 'Clinical judgement required; repeat PHQ-9 at follow-up' };
    if (score <= 14) return { level: 'Moderate',            color: 'orange', band: '10–14', action: 'Treatment plan, considering counselling or pharmacotherapy' };
    if (score <= 19) return { level: 'Moderately Severe',   color: 'red',    band: '15–19', action: 'Active treatment required — antidepressants and/or psychotherapy' };
    return           { level: 'Severe',                     color: 'red',    band: '20–27', action: 'Immediate initiation of pharmacotherapy and, if severe impairment or poor response, expedited referral' };
  },
};

// ─── GAD-7 ──────────────────────────────────────────────────────────────────

const GAD7_DATA = {
  id: 'gad7',
  title: 'GAD-7',
  subtitle: 'Generalized Anxiety Disorder Scale',
  tagline: 'Screens for generalized anxiety disorder severity over the past two weeks.',
  timeEstimate: '1–2 min · 7 questions',
  accentFrom: 'from-teal-500',
  accentTo: 'to-cyan-600',
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
    if (score <= 4)  return { level: 'Minimal',   color: 'green',  band: '0–4',  action: 'Monitor symptoms' };
    if (score <= 9)  return { level: 'Mild',      color: 'yellow', band: '5–9',  action: 'Monitor; possible clinically significant anxiety' };
    if (score <= 14) return { level: 'Moderate',  color: 'orange', band: '10–14', action: 'Possible clinically significant anxiety — consider treatment' };
    return           { level: 'Severe',           color: 'red',    band: '≥15',  action: 'Active treatment likely needed' };
  },
};

const ALL_TOOLS = [DASS42_DATA, PHQ9_DATA, GAD7_DATA];

// ─── Severity colour helpers ─────────────────────────────────────────────────

const SEVERITY_STYLES = {
  green:  { badge: 'bg-green-100 text-green-800',  bar: 'bg-green-500' },
  yellow: { badge: 'bg-yellow-100 text-yellow-800', bar: 'bg-yellow-500' },
  orange: { badge: 'bg-orange-100 text-orange-800', bar: 'bg-orange-500' },
  red:    { badge: 'bg-red-100 text-red-800',       bar: 'bg-red-500' },
};

// ─── Main component ──────────────────────────────────────────────────────────

function Assessment({ sessionToken, onBack }) {
  const [activeTool, setActiveTool]           = useState(null);   // null → selector
  const [showInstructions, setShowInstructions] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [responses, setResponses]             = useState({});
  const [loading, setLoading]                 = useState(false);
  const [result, setResult]                   = useState(null);

  // ── helpers ───────────────────────────────────────────────────────────────

  const resetToSelector = () => {
    setActiveTool(null);
    setShowInstructions(false);
    setCurrentQuestion(0);
    setResponses({});
    setResult(null);
  };

  const selectTool = (tool) => {
    setActiveTool(tool);
    setShowInstructions(true);
    setCurrentQuestion(0);
    setResponses({});
    setResult(null);
  };

  const handleAnswer = (value) => {
    const qId = activeTool.questions[currentQuestion].id;
    const newResponses = { ...responses, [qId]: value };
    setResponses(newResponses);

    if (currentQuestion < activeTool.questions.length - 1) {
      setTimeout(() => setCurrentQuestion(currentQuestion + 1), 300);
    } else {
      submitAssessment(newResponses);
    }
  };

  const submitAssessment = async (finalResponses) => {
    setLoading(true);
    try {
      const response = await axios.post(`${API_BASE}/api/submit-assessment`, {
        responses: finalResponses,
        session_token: sessionToken,
        assessment_type: activeTool.id,
      });
      setResult(response.data);
    } catch (error) {
      console.error('Error submitting assessment:', error);
      alert('Error submitting assessment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ── DASS-42 score helpers (client-side detail) ────────────────────────────

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
    const ranges = {
      depression: { normal: 9, mild: 13, moderate: 20, severe: 27 },
      anxiety:    { normal: 7, mild: 9,  moderate: 14, severe: 19 },
      stress:     { normal: 14, mild: 18, moderate: 25, severe: 33 },
    };
    const r = ranges[type];
    if (score <= r.normal)   return { level: 'Normal',           color: 'green'  };
    if (score <= r.mild)     return { level: 'Mild',             color: 'yellow' };
    if (score <= r.moderate) return { level: 'Moderate',         color: 'orange' };
    if (score <= r.severe)   return { level: 'Severe',           color: 'red'    };
    return                          { level: 'Extremely Severe', color: 'red'    };
  };

  // ── PHQ-9 / GAD-7 score helpers ───────────────────────────────────────────

  const calcSimpleTotal = (tool) =>
    tool.questions.reduce((sum, q) => sum + (responses[q.id] || 0), 0);

  const phq9Item9Flagged = () =>
    activeTool?.id === 'phq9' && (responses[9] || 0) > 0;

  // ─────────────────────────────────────────────────────────────────────────
  // VIEWS
  // ─────────────────────────────────────────────────────────────────────────

  // ── 1. Tool selector ──────────────────────────────────────────────────────
  if (!activeTool) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-4">
        <div className="max-w-2xl w-full">
          <div className="text-center mb-10">
            <button onClick={onBack} className="flex items-center gap-2 text-gray-500 hover:text-gray-800 mb-6 mx-auto transition-colors">
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Mental Health Screening</h1>
            <p className="text-gray-500 text-sm max-w-md mx-auto">
              Select a validated screening tool. These instruments are for monitoring symptom severity only and <strong>cannot replace a clinical assessment or diagnosis</strong>.
            </p>
          </div>

          <div className="space-y-4">
            {ALL_TOOLS.map(tool => (
              <button
                key={tool.id}
                onClick={() => selectTool(tool)}
                className="w-full bg-white rounded-2xl shadow-sm border border-gray-200 p-6 text-left hover:shadow-md hover:border-indigo-300 transition-all group"
              >
                <div className="flex items-center gap-5">
                  <div className={`w-14 h-14 bg-gradient-to-br ${tool.accentFrom} ${tool.accentTo} rounded-xl flex items-center justify-center flex-shrink-0`}>
                    <span className="text-white font-bold text-xs text-center leading-tight px-1">{tool.title}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-3">
                      <h3 className="text-lg font-semibold text-gray-900">{tool.subtitle}</h3>
                      <span className="text-xs text-gray-400 flex-shrink-0">{tool.timeEstimate}</span>
                    </div>
                    <p className="text-sm text-gray-500 mt-0.5">{tool.tagline}</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-indigo-500 group-hover:translate-x-1 transition-all flex-shrink-0" />
                </div>
              </button>
            ))}
          </div>

          <div className="mt-6 bg-amber-50 border border-amber-200 rounded-xl p-4">
            <p className="text-xs text-amber-800">
              <strong>Disclaimer:</strong> These screening tools are not diagnostic instruments. Results should be interpreted in the context of a full clinical evaluation by a qualified healthcare professional.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ── 2. Instructions ───────────────────────────────────────────────────────
  if (showInstructions) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-4">
        <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <div className={`w-20 h-20 bg-gradient-to-br ${activeTool.accentFrom} ${activeTool.accentTo} rounded-full flex items-center justify-center mx-auto mb-4`}>
              <CheckCircle className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-1">{activeTool.title}</h2>
            <p className="text-gray-500 font-medium">{activeTool.subtitle}</p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 mb-5">
            <h3 className="font-semibold text-blue-900 mb-2">Instructions</h3>
            <p className="text-sm text-blue-800 whitespace-pre-line">{activeTool.instructions}</p>
          </div>

          <div className="space-y-2 mb-5">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
              <span>{activeTool.questions.length} questions · {activeTool.timeEstimate}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
              <span>Completely confidential</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
              <span>You can go back and change answers before submitting</span>
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-yellow-800">
              <strong>Important:</strong> This tool is for screening and monitoring symptom severity only. It cannot replace a clinical assessment and diagnosis by a qualified professional.
            </p>
          </div>

          <div className="flex gap-3">
            <button onClick={resetToSelector} className="flex-1 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-all">
              Back
            </button>
            <button
              onClick={() => setShowInstructions(false)}
              className={`flex-1 py-3 bg-gradient-to-r ${activeTool.accentFrom} ${activeTool.accentTo} text-white rounded-lg font-medium transition-all hover:opacity-90`}
            >
              Begin Assessment
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── 3. Loading ────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-purple-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Analysing your responses…</p>
        </div>
      </div>
    );
  }

  // ── 4. Results ────────────────────────────────────────────────────────────
  if (result) {
    const crisisBlock = (
      <div className="bg-red-50 border border-red-200 rounded-xl p-5 mb-5">
        <h3 className="font-semibold text-red-900 mb-2">🆘 Need Immediate Help?</h3>
        <ul className="text-sm text-red-800 space-y-1">
          <li>• <strong>Call 988</strong> — Suicide &amp; Crisis Lifeline (24/7)</li>
          <li>• <strong>Text "HELLO" to 741741</strong> — Crisis Text Line</li>
          <li>• <strong>Call 911</strong> — For immediate emergencies</li>
        </ul>
      </div>
    );

    // DASS-42 result
    if (activeTool.id === 'dass42') {
      const scores = calcDass42Scores();
      const subs = [
        { label: 'Depression', score: scores.depression, max: 84, sev: getDass42Severity(scores.depression, 'depression') },
        { label: 'Anxiety',    score: scores.anxiety,    max: 84, sev: getDass42Severity(scores.anxiety,    'anxiety')    },
        { label: 'Stress',     score: scores.stress,     max: 84, sev: getDass42Severity(scores.stress,     'stress')     },
      ];
      return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-4">
          <div className="max-w-3xl w-full bg-white rounded-2xl shadow-xl p-8">
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-1">Assessment Complete</h2>
              <p className="text-gray-500">DASS-42 results based on your responses</p>
            </div>

            <div className="space-y-4 mb-6">
              {subs.map(({ label, score, max, sev }) => {
                const styles = SEVERITY_STYLES[sev.color];
                return (
                  <div key={label} className="bg-gray-50 rounded-xl p-5">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h3 className="text-base font-semibold text-gray-900">{label}</h3>
                        <p className="text-xs text-gray-500">Score: {score}/{max}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${styles.badge}`}>{sev.level}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div className={`${styles.bar} h-2.5 rounded-full transition-all`} style={{ width: `${Math.min((score / max) * 100, 100)}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 mb-5">
              <h3 className="font-semibold text-blue-900 mb-1">Understanding Your Results</h3>
              <p className="text-sm text-blue-800">
                The DASS-42 measures Depression, Anxiety, and Stress based on the past week. If you're experiencing moderate-to-severe symptoms in any category, we strongly recommend speaking with a mental health professional. These scores are <strong>not</strong> diagnostic.
              </p>
            </div>
            {crisisBlock}
            <button onClick={onBack} className="w-full py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg font-medium hover:opacity-90 transition-all">
              Return to Dashboard
            </button>
          </div>
        </div>
      );
    }

    // PHQ-9 result
    if (activeTool.id === 'phq9') {
      const total = calcSimpleTotal(PHQ9_DATA);
      const sev   = PHQ9_DATA.getSeverity(total);
      const styles = SEVERITY_STYLES[sev.color];
      const item9Flag = phq9Item9Flagged();
      return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-4">
          <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl p-8">
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-1">Assessment Complete</h2>
              <p className="text-gray-500">PHQ-9 Depression Screening</p>
            </div>

            {/* Score card */}
            <div className="bg-gray-50 rounded-xl p-6 mb-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Total Score</h3>
                  <p className="text-sm text-gray-500">Range: 0–27 · Scoring band: {sev.band}</p>
                </div>
                <div className="text-right">
                  <span className="text-4xl font-bold text-gray-900">{total}</span>
                  <span className="text-gray-400 text-sm">/27</span>
                </div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3 mb-3">
                <div className={`${styles.bar} h-3 rounded-full transition-all`} style={{ width: `${(total / 27) * 100}%` }} />
              </div>
              <div className="flex items-center justify-between">
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${styles.badge}`}>{sev.level}</span>
                <p className="text-sm text-gray-600 text-right max-w-xs">{sev.action}</p>
              </div>
            </div>

            {/* Critical action — item 9 */}
            {item9Flag && (
              <div className="bg-red-50 border-2 border-red-400 rounded-xl p-5 mb-5">
                <div className="flex items-start gap-3">
                  <ShieldAlert className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-bold text-red-900 mb-1">Critical Action Required</h3>
                    <p className="text-sm text-red-800">
                      You indicated thoughts of self-harm or being better off dead (item 9). <strong>Please perform a suicide risk assessment immediately or contact a mental health professional.</strong>
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Clinical notes */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 mb-5">
              <h3 className="font-semibold text-blue-900 mb-2">Clinical Notes</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Rule out bipolar disorder, normal bereavement, and medical disorders causing depression.</li>
                <li>• PHQ-9 is a screening tool — results require clinical interpretation.</li>
                <li>• A score ≥10 has 88% sensitivity and 88% specificity for major depression.</li>
              </ul>
            </div>

            {crisisBlock}
            <button onClick={onBack} className="w-full py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg font-medium hover:opacity-90 transition-all">
              Return to Dashboard
            </button>
          </div>
        </div>
      );
    }

    // GAD-7 result
    if (activeTool.id === 'gad7') {
      const total = calcSimpleTotal(GAD7_DATA);
      const sev   = GAD7_DATA.getSeverity(total);
      const styles = SEVERITY_STYLES[sev.color];
      return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-4">
          <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl p-8">
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-1">Assessment Complete</h2>
              <p className="text-gray-500">GAD-7 Anxiety Screening</p>
            </div>

            {/* Score card */}
            <div className="bg-gray-50 rounded-xl p-6 mb-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Total Score</h3>
                  <p className="text-sm text-gray-500">Range: 0–21 · Scoring band: {sev.band}</p>
                </div>
                <div className="text-right">
                  <span className="text-4xl font-bold text-gray-900">{total}</span>
                  <span className="text-gray-400 text-sm">/21</span>
                </div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3 mb-3">
                <div className={`${styles.bar} h-3 rounded-full transition-all`} style={{ width: `${(total / 21) * 100}%` }} />
              </div>
              <div className="flex items-center justify-between">
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${styles.badge}`}>{sev.level}</span>
                <p className="text-sm text-gray-600 text-right max-w-xs">{sev.action}</p>
              </div>
            </div>

            {/* Clinical notes */}
            <div className="bg-teal-50 border border-teal-200 rounded-xl p-5 mb-5">
              <h3 className="font-semibold text-teal-900 mb-2">Clinical Notes</h3>
              <ul className="text-sm text-teal-800 space-y-1">
                <li>• Rule out medical causes before diagnosing an anxiety disorder (e.g., ECG for arrhythmias, TSH for thyroid disease).</li>
                <li>• A score ≥10 is recommended as the cut-off for further evaluation of GAD.</li>
                <li>• GAD-7 is a screening tool — results require clinical interpretation.</li>
              </ul>
            </div>

            {crisisBlock}
            <button onClick={onBack} className="w-full py-3 bg-gradient-to-r from-teal-500 to-cyan-600 text-white rounded-lg font-medium hover:opacity-90 transition-all">
              Return to Dashboard
            </button>
          </div>
        </div>
      );
    }
  }

  // ── 5. Question screen ────────────────────────────────────────────────────
  const progress      = ((currentQuestion + 1) / activeTool.questions.length) * 100;
  const answeredCount = Object.keys(responses).length;
  const currentQ      = activeTool.questions[currentQuestion];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-4">
      <div className="max-w-3xl mx-auto pt-8">
        <button onClick={resetToSelector} className="mb-6 flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors">
          <ArrowLeft className="w-5 h-5" /> Exit Assessment
        </button>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xl font-bold text-gray-900">{activeTool.title} — {activeTool.subtitle}</h2>
              <span className="text-sm text-gray-400">{answeredCount}/{activeTool.questions.length}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 mb-1">
              <div
                className={`bg-gradient-to-r ${activeTool.accentFrom} ${activeTool.accentTo} h-2 rounded-full transition-all duration-300`}
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-xs text-gray-400">Question {currentQuestion + 1} of {activeTool.questions.length}</p>
          </div>

          {/* Timeframe banner */}
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 mb-5">
            <p className="text-sm text-purple-800 font-medium">{activeTool.timeframe}</p>
          </div>

          {/* Critical item warning */}
          {currentQ.critical && (
            <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
              <ShieldAlert className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-800">
                <strong>Sensitive question:</strong> If you are having thoughts of self-harm, please contact a crisis line immediately — 988 (call/text) or text HELLO to 741741.
              </p>
            </div>
          )}

          {/* Question text */}
          <h3 className="text-xl font-semibold text-gray-900 mb-6">{currentQ.text}</h3>

          {/* Options */}
          <div className="space-y-3">
            {activeTool.options.map(option => {
              const isSelected = responses[currentQ.id] === option.value;
              return (
                <button
                  key={option.value}
                  onClick={() => handleAnswer(option.value)}
                  className={`w-full p-5 text-left border-2 rounded-xl transition-all group ${
                    isSelected
                      ? 'border-indigo-500 bg-indigo-50'
                      : 'border-gray-200 hover:border-indigo-400 hover:bg-indigo-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-semibold text-gray-900 text-base block">{option.label}</span>
                      <span className="text-sm text-gray-500">{option.description}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {isSelected && <CheckCircle className="w-5 h-5 text-indigo-600" />}
                      <ChevronRight className={`w-5 h-5 transition-all ${isSelected ? 'text-indigo-600 translate-x-1' : 'text-gray-400 group-hover:text-indigo-500 group-hover:translate-x-1'}`} />
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between mt-6">
            <button
              onClick={() => setCurrentQuestion(q => Math.max(0, q - 1))}
              disabled={currentQuestion === 0}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-5 h-5" /> Previous
            </button>
            <p className="text-xs text-gray-400">Your responses are confidential</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Assessment;
