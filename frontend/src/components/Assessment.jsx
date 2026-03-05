import React, { useState } from 'react';
import axios from 'axios';
import { ArrowLeft, CheckCircle, AlertCircle, Loader2, ChevronRight, ChevronLeft } from 'lucide-react';

const API_BASE = 'http://localhost:8000';

// DASS-42 (Depression Anxiety Stress Scales) Questionnaire
const QUESTIONNAIRE = {
  title: "Mental Health Assessment (DASS-42)",
  description: "Please read each statement and indicate how much the statement applied to you over the past week. There are no right or wrong answers. Do not spend too much time on any statement.",
  instructions: `The rating scale is as follows:
• NEVER - Did not apply to me at all
• SOMETIMES - Applied to me to some degree, or some of the time
• OFTEN - Applied to me to a considerable degree, or a good part of time
• ALMOST ALWAYS - Applied to me very much, or most of the time`,
  
  questions: [
    { id: 1, text: "I found myself getting upset by quite trivial things", scale: "stress" },
    { id: 2, text: "I was aware of dryness of my mouth", scale: "anxiety" },
    { id: 3, text: "I couldn't seem to experience any positive feeling at all", scale: "depression" },
    { id: 4, text: "I experienced breathing difficulty (eg, excessively rapid breathing, breathlessness in the absence of physical exertion)", scale: "anxiety" },
    { id: 5, text: "I just couldn't seem to get going", scale: "depression" },
    { id: 6, text: "I tended to over-react to situations", scale: "stress" },
    { id: 7, text: "I had a feeling of shakiness (eg, legs going to give way)", scale: "anxiety" },
    { id: 8, text: "I found it difficult to relax", scale: "stress" },
    { id: 9, text: "I found myself in situations that made me so anxious I was most relieved when they ended", scale: "anxiety" },
    { id: 10, text: "I felt that I had nothing to look forward to", scale: "depression" },
    { id: 11, text: "I found myself getting upset rather easily", scale: "stress" },
    { id: 12, text: "I felt that I was using a lot of nervous energy", scale: "stress" },
    { id: 13, text: "I felt sad and depressed", scale: "depression" },
    { id: 14, text: "I found myself getting impatient when I was delayed in any way (eg, lifts, traffic lights, being kept waiting)", scale: "stress" },
    { id: 15, text: "I had a feeling of faintness", scale: "anxiety" },
    { id: 16, text: "I felt that I had lost interest in just about everything", scale: "depression" },
    { id: 17, text: "I felt I wasn't worth much as a person", scale: "depression" },
    { id: 18, text: "I felt that I was rather touchy", scale: "stress" },
    { id: 19, text: "I perspired noticeably (eg, hands sweaty) in the absence of high temperatures or physical exertion", scale: "anxiety" },
    { id: 20, text: "I felt scared without any good reason", scale: "anxiety" },
    { id: 21, text: "I felt that life wasn't worthwhile", scale: "depression" },
    { id: 22, text: "I found it hard to wind down", scale: "stress" },
    { id: 23, text: "I had difficulty in swallowing", scale: "anxiety" },
    { id: 24, text: "I couldn't seem to get any enjoyment out of the things I did", scale: "depression" },
    { id: 25, text: "I was aware of the action of my heart in the absence of physical exertion (eg, sense of heart rate increase, heart missing a beat)", scale: "anxiety" },
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
    { id: 41, text: "I experienced trembling (eg, in the hands)", scale: "anxiety" },
    { id: 42, text: "I found it difficult to work up the initiative to do things", scale: "depression" }
  ],
  
  options: [
    { value: 0, label: "Never", description: "Did not apply to me at all" },
    { value: 1, label: "Sometimes", description: "Applied to me to some degree, or some of the time" },
    { value: 2, label: "Often", description: "Applied to me to a considerable degree, or a good part of time" },
    { value: 3, label: "Almost Always", description: "Applied to me very much, or most of the time" }
  ]
};

function Assessment({ sessionToken, onBack }) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [responses, setResponses] = useState({});
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [showInstructions, setShowInstructions] = useState(true);

  const handleAnswer = (value) => {
    const newResponses = { ...responses, [QUESTIONNAIRE.questions[currentQuestion].id]: value };
    setResponses(newResponses);

    if (currentQuestion < QUESTIONNAIRE.questions.length - 1) {
      setTimeout(() => setCurrentQuestion(currentQuestion + 1), 300);
    } else {
      submitAssessment(newResponses);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const submitAssessment = async (finalResponses) => {
    setLoading(true);
    try {
      const response = await axios.post(`${API_BASE}/api/submit-assessment`, {
        responses: finalResponses,
        session_token: sessionToken
      });
      setResult(response.data);
    } catch (error) {
      console.error('Error submitting assessment:', error);
      alert('Error submitting assessment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const calculateDetailedScores = () => {
    let depression = 0, anxiety = 0, stress = 0;
    
    QUESTIONNAIRE.questions.forEach(q => {
      const score = responses[q.id] || 0;
      if (q.scale === 'depression') depression += score;
      else if (q.scale === 'anxiety') anxiety += score;
      else if (q.scale === 'stress') stress += score;
    });

    // DASS-42 scores are multiplied by 2 to align with DASS-21
    return {
      depression: depression * 2,
      anxiety: anxiety * 2,
      stress: stress * 2,
      total: (depression + anxiety + stress) * 2
    };
  };

  const getSeverityLevel = (score, type) => {
    const ranges = {
      depression: { normal: 9, mild: 13, moderate: 20, severe: 27 },
      anxiety: { normal: 7, mild: 9, moderate: 14, severe: 19 },
      stress: { normal: 14, mild: 18, moderate: 25, severe: 33 }
    };

    const r = ranges[type];
    if (score <= r.normal) return { level: 'Normal', color: 'green' };
    if (score <= r.mild) return { level: 'Mild', color: 'yellow' };
    if (score <= r.moderate) return { level: 'Moderate', color: 'orange' };
    if (score <= r.severe) return { level: 'Severe', color: 'red' };
    return { level: 'Extremely Severe', color: 'red' };
  };

  const progress = ((currentQuestion + 1) / QUESTIONNAIRE.questions.length) * 100;
  const answeredCount = Object.keys(responses).length;

  if (showInstructions) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-4">
        <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">{QUESTIONNAIRE.title}</h2>
            <p className="text-gray-600">{QUESTIONNAIRE.description}</p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-6">
            <h3 className="font-semibold text-blue-900 mb-3">Instructions:</h3>
            <div className="text-sm text-blue-800 whitespace-pre-line">{QUESTIONNAIRE.instructions}</div>
          </div>

          <div className="space-y-3 mb-6">
            <div className="flex items-center gap-3 text-sm text-gray-700">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span>42 questions total</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-700">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span>Takes approximately 5-10 minutes</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-700">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span>Completely confidential and private</span>
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-yellow-800">
              <strong>Important:</strong> This assessment is for informational purposes only and does not replace professional medical advice, diagnosis, or treatment.
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={onBack}
              className="flex-1 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-all"
            >
              Cancel
            </button>
            <button
              onClick={() => setShowInstructions(false)}
              className="flex-1 py-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-lg font-medium hover:from-purple-600 hover:to-pink-700 transition-all"
            >
              Begin Assessment
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (result) {
    const scores = calculateDetailedScores();
    const depSeverity = getSeverityLevel(scores.depression, 'depression');
    const anxSeverity = getSeverityLevel(scores.anxiety, 'anxiety');
    const strSeverity = getSeverityLevel(scores.stress, 'stress');

    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-4">
        <div className="max-w-3xl w-full bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Assessment Complete</h2>
            <p className="text-gray-600">Thank you for completing the DASS-42 screening</p>
          </div>

          <div className="space-y-6 mb-8">
            {/* Depression Score */}
            <div className="bg-gray-50 rounded-xl p-6">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Depression</h3>
                  <p className="text-sm text-gray-600">Score: {scores.depression}/84</p>
                </div>
                <span className={`px-4 py-2 rounded-full font-semibold bg-${depSeverity.color}-100 text-${depSeverity.color}-800`}>
                  {depSeverity.level}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className={`bg-${depSeverity.color}-500 h-3 rounded-full transition-all`}
                  style={{ width: `${Math.min((scores.depression / 84) * 100, 100)}%` }}
                ></div>
              </div>
            </div>

            {/* Anxiety Score */}
            <div className="bg-gray-50 rounded-xl p-6">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Anxiety</h3>
                  <p className="text-sm text-gray-600">Score: {scores.anxiety}/84</p>
                </div>
                <span className={`px-4 py-2 rounded-full font-semibold bg-${anxSeverity.color}-100 text-${anxSeverity.color}-800`}>
                  {anxSeverity.level}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className={`bg-${anxSeverity.color}-500 h-3 rounded-full transition-all`}
                  style={{ width: `${Math.min((scores.anxiety / 84) * 100, 100)}%` }}
                ></div>
              </div>
            </div>

            {/* Stress Score */}
            <div className="bg-gray-50 rounded-xl p-6">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Stress</h3>
                  <p className="text-sm text-gray-600">Score: {scores.stress}/84</p>
                </div>
                <span className={`px-4 py-2 rounded-full font-semibold bg-${strSeverity.color}-100 text-${strSeverity.color}-800`}>
                  {strSeverity.level}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className={`bg-${strSeverity.color}-500 h-3 rounded-full transition-all`}
                  style={{ width: `${Math.min((scores.stress / 84) * 100, 100)}%` }}
                ></div>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-6">
            <h3 className="font-semibold text-blue-900 mb-2">Understanding Your Results</h3>
            <p className="text-sm text-blue-800 mb-3">
              The DASS-42 measures three aspects of mental health: Depression, Anxiety, and Stress. These results provide insight into your current emotional state based on your responses over the past week.
            </p>
            <p className="text-sm text-blue-800">
              If you're experiencing moderate to severe symptoms in any category, we strongly recommend speaking with a mental health professional.
            </p>
          </div>

          <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-6">
            <h3 className="font-semibold text-red-900 mb-2">🆘 Need Immediate Help?</h3>
            <ul className="text-sm text-red-800 space-y-1">
              <li>• <strong>Call 988</strong> - Suicide & Crisis Lifeline (24/7)</li>
              <li>• <strong>Text "HELLO" to 741741</strong> - Crisis Text Line</li>
              <li>• <strong>Call 911</strong> - For immediate emergencies</li>
            </ul>
          </div>

          <button
            onClick={onBack}
            className="w-full py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg font-medium hover:from-indigo-600 hover:to-purple-700 transition-all"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-purple-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Analyzing your responses...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-4">
      <div className="max-w-3xl mx-auto pt-8">
        <button
          onClick={onBack}
          className="mb-6 flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Exit Assessment
        </button>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-900">DASS-42 Assessment</h2>
              <span className="text-sm text-gray-500">{answeredCount}/{QUESTIONNAIRE.questions.length}</span>
            </div>
            
            <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
              <div 
                className="bg-gradient-to-r from-purple-500 to-pink-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <p className="text-sm text-gray-500">
              Question {currentQuestion + 1} of {QUESTIONNAIRE.questions.length}
            </p>
          </div>

          <div className="mb-8">
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-purple-800 font-medium">
                Over the past week, how much did this apply to you?
              </p>
            </div>

            <h3 className="text-xl font-semibold text-gray-900 mb-6">
              {QUESTIONNAIRE.questions[currentQuestion].text}
            </h3>

            <div className="space-y-3">
              {QUESTIONNAIRE.options.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleAnswer(option.value)}
                  className="w-full p-5 text-left border-2 border-gray-200 rounded-xl hover:border-purple-500 hover:bg-purple-50 transition-all group"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-semibold text-gray-900 text-lg block mb-1">
                        {option.label}
                      </span>
                      <span className="text-sm text-gray-600">
                        {option.description}
                      </span>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-purple-600 group-hover:translate-x-1 transition-all" />
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <button
              onClick={handlePrevious}
              disabled={currentQuestion === 0}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
              Previous
            </button>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg px-4 py-2">
              <p className="text-xs text-yellow-800">
                Your responses are confidential and private
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Assessment;