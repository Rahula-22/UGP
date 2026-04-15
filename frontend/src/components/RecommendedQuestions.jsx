import React, { useMemo } from 'react';
import { Sparkles, Brain, Heart, TrendingUp, Wind } from 'lucide-react';

/**
 * RecommendedQuestions Component
 * Generates and displays personalized suggested questions based on user data
 */
function RecommendedQuestions({ userMood, userName, language, onSelectQuestion }) {
  // Generate questions based on user personalization
  const questions = useMemo(() => {
    const baseQuestions = {
      anxiety: [
        "I'm feeling anxious. What are some grounding techniques I can use right now?",
        "How can I manage my anxiety before it gets worse?",
        "What's a quick way to calm my racing thoughts?",
        "Can you guide me through a breathing exercise?",
      ],
      sad: [
        "I'm feeling down today. Can you help me feel better?",
        "What are some small things I can do to improve my mood?",
        "How do I cope with sadness in a healthy way?",
        "Can you suggest some positive activities for today?",
      ],
      stressed: [
        "I'm overwhelmed with stress. Where should I start?",
        "What are effective stress management techniques?",
        "How can I reduce stress in my daily routine?",
        "Can you help me prioritize my tasks?",
      ],
      happy: [
        "How can I maintain this positive mood?",
        "What activities would enhance my well-being today?",
        "What habits support long-term happiness?",
        "Can you suggest gratitude practices?",
      ],
      neutral: [
        "What are some daily mental health practices I should try?",
        "How can I build better coping skills?",
        "What's one thing I can do today for my mental health?",
        "Can you help me understand my emotions better?",
      ],
    };

    const personalizedQuestions = {
      english: baseQuestions,
      hindi: {
        anxiety: [
          "मैं घबराहट महसूस कर रहा हूँ। अभी शांत होने के लिए क्या कर सकता हूँ?",
          "मैं अपनी चिंता को कैसे संभाल सकता हूँ?",
          "तेज़ सोच को शांत करने का तरीका क्या है?",
          "क्या आप मुझे सांस लेने के व्यायाम में मदद दे सकते हैं?",
        ],
        sad: [
          "मैं आज दुखी हूँ। क्या आप मुझे बेहतर महसूस कराने में मदद कर सकते हैं?",
          "अपने मूड को सुधारने के लिए क्या छोटी चीजें मैं कर सकता हूँ?",
          "उदासी से स्वस्थ तरीके से कैसे निपटें?",
          "आप मेरे लिए आज सकारात्मक गतिविधियों का सुझाव दे सकते हैं?",
        ],
        stressed: [
          "मैं तनाव से अभिभूत हूँ। मुझे कहाँ से शुरुआत करनी चाहिए?",
          "तनाव को प्रभावी ढंग से कैसे प्रबंधित करें?",
          "मैं अपनी दैनिक दिनचर्या में तनाव कैसे कम कर सकता हूँ?",
          "क्या आप मेरे कार्यों को प्राथमिकता देने में मदद कर सकते हैं?",
        ],
        happy: [
          "मैं इस सकारात्मक मूड को कैसे बनाए रखूँ?",
          "आज अपने कल्याण को बढ़ाने की गतिविधियाँ क्या हैं?",
          "दीर्घकालीन खुशी के लिए कौन सी आदतें मदद करती हैं?",
          "क्या आप कृतज्ञता प्रथाओं का सुझाव दे सकते हैं?",
        ],
        neutral: [
          "मुझे दैनिक मानसिक स्वास्थ्य प्रथाएं क्या करनी चाहिए?",
          "मैं बेहतर मुकाबला कौशल कैसे विकसित कर सकता हूँ?",
          "आज मानसिक स्वास्थ्य के लिए मैं क्या एक काम कर सकता हूँ?",
          "क्या आप मुझे अपनी भावनाओं को बेहतर समझने में मदद कर सकते हैं?",
        ],
      },
    };

    // Select the language-specific questions or default to English
    const moodQuestions = personalizedQuestions[language?.toLowerCase()] || baseQuestions;

    let selectedQuestions = moodQuestions.neutral || baseQuestions.neutral;

    // If mood is set, use mood-specific questions
    if (userMood && moodQuestions[userMood.toLowerCase()]) {
      selectedQuestions = moodQuestions[userMood.toLowerCase()];
    }

    // Shuffle and return 3-4 random questions
    return selectedQuestions
      .sort(() => Math.random() - 0.5)
      .slice(0, Math.min(4, selectedQuestions.length));
  }, [userMood, language]);

  const getIcon = (moodType) => {
    switch (moodType?.toLowerCase()) {
      case 'anxiety':
        return Wind;
      case 'sad':
        return Heart;
      case 'stressed':
        return TrendingUp;
      case 'happy':
        return Sparkles;
      default:
        return Brain;
    }
  };

  const getAccentColor = (moodType) => {
    switch (moodType?.toLowerCase()) {
      case 'anxiety':
        return 'from-blue-400 to-cyan-500';
      case 'sad':
        return 'from-rose-400 to-pink-500';
      case 'stressed':
        return 'from-yellow-400 to-orange-500';
      case 'happy':
        return 'from-emerald-400 to-green-500';
      default:
        return 'from-indigo-500 to-purple-600';
    }
  };

  const IconComponent = getIcon(userMood);

  return (
    <div className="mt-6 space-y-3">
      <div className="flex items-center gap-2 mb-4">
        <IconComponent className="w-5 h-5 text-indigo-600" />
        <h4 className="text-sm font-semibold text-gray-700">
          {userMood ? `Suggested for you` : 'Quick questions'}
        </h4>
      </div>

      <div className="grid grid-cols-1 gap-2 max-w-2xl">
        {questions.map((question, index) => (
          <button
            key={index}
            onClick={() => onSelectQuestion(question)}
            className={`group relative text-left p-3 rounded-xl border border-gray-200 bg-gradient-to-br ${getAccentColor(userMood)} bg-opacity-5 hover:bg-opacity-10 transition-all duration-200 hover:shadow-sm hover:-translate-y-0.5`}
          >
            <div className="flex items-start gap-3">
              <div className={`mt-0.5 w-5 h-5 rounded-full bg-gradient-to-br ${getAccentColor(userMood)} opacity-20 group-hover:opacity-100 transition-opacity flex-shrink-0`} />
              <p className="text-sm text-gray-700 group-hover:text-gray-900 font-medium">
                {question}
              </p>
            </div>
          </button>
        ))}
      </div>

      {userMood && (
        <p className="text-xs text-gray-500 mt-3">
          ✨ Personalized based on your current mood
        </p>
      )}
    </div>
  );
}

export default RecommendedQuestions;
