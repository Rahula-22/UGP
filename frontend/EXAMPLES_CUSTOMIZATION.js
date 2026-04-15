/**
 * Example: Customizing Recommended Questions for Serenly
 *
 * This file demonstrates how to extend and customize the RecommendedQuestions
 * component for your specific use cases.
 */

// ============================================================================
// EXAMPLE 1: Adding a new mood category
// ============================================================================

const exampleMood = `
// In RecommendedQuestions.jsx, add to baseQuestions:

const baseQuestions = {
  anxiety: [...],
  sad: [...],
  stressed: [...],
  happy: [...],
  neutral: [...],

  // NEW MOOD
  overwhelmed: [
    "Help me break down what I'm dealing with right now",
    "What's the best approach when I feel like I can't handle everything?",
    "Can you help me prioritize what matters most?",
    "How do I know when to ask for help?",
  ],
};
`;

// ============================================================================
// EXAMPLE 2: Adding multi-language support (e.g., Spanish)
// ============================================================================

const exampleLanguage = `
const personalizedQuestions = {
  english: {
    anxiety: [
      "I'm feeling anxious. What are some grounding techniques I can use right now?",
      "How can I manage my anxiety before it gets worse?",
      "What's a quick way to calm my racing thoughts?",
      "Can you guide me through a breathing exercise?",
    ],
    // ... other moods
  },

  hindi: {
    // ... existing Hindi questions
  },

  // NEW LANGUAGE
  spanish: {
    anxiety: [
      "¿Cuáles son algunas técnicas de enraizamiento que puedo usar ahora?",
      "¿Cómo puedo manejar mi ansiedad antes de que empeore?",
      "¿Cuál es una forma rápida de calmar mis pensamientos acelerados?",
      "¿Puedes guiarme a través de un ejercicio de respiración?",
    ],
    sad: [
      "Estoy triste hoy. ¿Puedes ayudarme a sentirme mejor?",
      "¿Cuáles son algunas cosas pequeñas que puedo hacer para mejorar mi estado de ánimo?",
      "¿Cómo enfrento la tristeza de manera saludable?",
      "¿Puedes sugerir algunas actividades positivas para hoy?",
    ],
    stressed: [
      "Estoy abrumado por el estrés. ¿Por dónde debería empezar?",
      "¿Cuáles son técnicas efectivas de manejo del estrés?",
      "¿Cómo puedo reducir el estrés en mi rutina diaria?",
      "¿Puedes ayudarme a priorizar mis tareas?",
    ],
    happy: [
      "¿Cómo puedo mantener este estado de ánimo positivo?",
      "¿Qué actividades mejorarían mi bienestar hoy?",
      "¿Qué hábitos apoyan la felicidad a largo plazo?",
      "¿Puedes sugerir prácticas de gratitud?",
    ],
    neutral: [
      "¿Qué prácticas de salud mental diaria debería intentar?",
      "¿Cómo puedo desarrollar mejores habilidades de afrontamiento?",
      "¿Cuál es una cosa que pueda hacer hoy por mi salud mental?",
      "¿Puedes ayudarme a entender mis emociones mejor?",
    ],
  },
};

// Update LANGUAGES array in Chat.jsx:
const LANGUAGES = [
  { label: 'English',              code: 'en-US', name: 'English' },
  { label: 'हिंदी (Hindi)',         code: 'hi-IN', name: 'Hindi' },
  { label: 'Español (Spanish)',     code: 'es-ES', name: 'Spanish' }, // NEW
  // ... other languages
];

// Update getAccentColor for Spanish mood colors if different
`;

// ============================================================================
// EXAMPLE 3: Customizing styling and colors
// ============================================================================

const exampleStyling = `
// Change accent colors by mood in RecommendedQuestions.jsx

const getAccentColor = (moodType) => {
  switch (moodType?.toLowerCase()) {
    case 'anxiety':
      return 'from-blue-400 to-cyan-500';      // Current
      // Try: 'from-indigo-400 to-blue-500'   // Alternative

    case 'sad':
      return 'from-rose-400 to-pink-500';      // Current
      // Try: 'from-purple-400 to-pink-500'   // Alternative

    case 'stressed':
      return 'from-yellow-400 to-orange-500';  // Current
      // Try: 'from-red-400 to-orange-500'    // Alternative

    case 'happy':
      return 'from-emerald-400 to-green-500';  // Current
      // Try: 'from-lime-400 to-green-500'    // Alternative

    default:
      return 'from-indigo-500 to-purple-600';  // Current
  }
};

// Icons can also be customized by updating getIcon()
`;

// ============================================================================
// EXAMPLE 4: Backend integration (future enhancement)
// ============================================================================

const exampleBackendIntegration = `
// Future: Fetching questions from backend API

const [questions, setQuestions] = useState([]);
const [loading, setLoading] = useState(false);

useEffect(() => {
  const fetchRecommendedQuestions = async () => {
    try {
      const response = await axios.post(
        'https://api.serenly.com/api/recommended-questions',
        {
          userMood: userMood,
          language: language,
          conversationHistory: recentMessages, // Optional
          userName: userName,
        }
      );
      setQuestions(response.data.questions);
    } catch (error) {
      console.error('Error fetching recommended questions:', error);
      // Fallback to local questions
    }
  };

  if (userMood || language) {
    fetchRecommendedQuestions();
  }
}, [userMood, language]);
`;

// ============================================================================
// EXAMPLE 5: Tracking user question selections (analytics)
// ============================================================================

const exampleAnalytics = `
// Enhance handleSelectRecommendedQuestion to track analytics

const handleSelectRecommendedQuestion = (question) => {
  // Update input
  setInput(question);

  // Track analytics
  try {
    axios.post('https://api.serenly.com/api/analytics/question-selected', {
      question: question,
      userId: sessionToken,
      mood: userMood,
      language: selectedLang.name,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Analytics tracking failed:', error);
  }
};
`;

// ============================================================================
// EXAMPLE 6: Advanced personalization based on user history
// ============================================================================

const exampleAdvancedPersonalization = `
// Load conversation history and adjust questions

const [recentTopics, setRecentTopics] = useState([]);

useEffect(() => {
  // Extract topics from recent messages
  if (messages.length > 0) {
    const keywords = extractKeywords(messages); // Custom function
    setRecentTopics(keywords);
  }
}, [messages]);

// In RecommendedQuestions component:
const questions = useMemo(() => {
  let selectedQuestions = getBaseQuestions(userMood, language);

  // Re-rank questions by relevance to recent topics
  if (recentTopics.length > 0) {
    selectedQuestions = selectedQuestions
      .map(q => ({
        question: q,
        relevance: calculateRelevance(q, recentTopics),
      }))
      .sort((a, b) => b.relevance - a.relevance)
      .map(q => q.question);
  }

  return selectedQuestions.slice(0, 4);
}, [userMood, language, recentTopics]);
`;

// ============================================================================
// EXAMPLE 7: Mood-based question refresh
// ============================================================================

const exampleMoodRefresh = `
// Get fresh questions when mood changes

const [refreshKey, setRefreshKey] = useState(0);

useEffect(() => {
  // When mood changes, increment key to trigger new randomization
  setRefreshKey(prev => prev + 1);
}, [userMood]);

// In array shuffle:
.sort(() => Math.random() - 0.5)

// Better: Deterministic shuffle based on mood and time
.sort((a, b) => {
  const hash = moodType.charCodeAt(0) + new Date().getHours();
  return ((hash * a.length) % 10) - ((hash * b.length) % 10);
})
`;

// ============================================================================
// EXAMPLE 8: Testing recommended questions
// ============================================================================

const exampleTesting = `
// Test script for recommended questions

test('RecommendedQuestions renders with mood', () => {
  const { getByText } = render(
    <RecommendedQuestions
      userMood="anxiety"
      userName="Test User"
      language="English"
      onSelectQuestion={() => {}}
    />
  );

  // Should show anxiety-related questions
  expect(getByText(/grounding/i)).toBeInTheDocument();
});

test('RecommendedQuestions handles selection', () => {
  const mockCallback = jest.fn();
  const { getByText } = render(
    <RecommendedQuestions
      userMood="anxiety"
      userName="Test User"
      language="English"
      onSelectQuestion={mockCallback}
    />
  );

  // Click a question
  fireEvent.click(getByText(/grounding/i));

  // Callback should be called
  expect(mockCallback).toHaveBeenCalled();
});

test('RecommendedQuestions works without mood', () => {
  const { getByText } = render(
    <RecommendedQuestions
      userMood={null}
      userName={null}
      language="English"
      onSelectQuestion={() => {}}
    />
  );

  // Should show neutral/generic questions
  expect(getByText(/mental health/i)).toBeInTheDocument();
});
`;

// ============================================================================
// EXAMPLE 9: Configuration constants (for easier management)
// ============================================================================

const exampleConfig = `
// Create a config file: src/config/recommendations.js

export const MOOD_CATEGORIES = {
  ANXIETY: 'anxiety',
  SAD: 'sad',
  STRESSED: 'stressed',
  HAPPY: 'happy',
  NEUTRAL: 'neutral',
  OVERWHELMED: 'overwhelmed',
};

export const MOOD_COLORS = {
  anxiety: 'from-blue-400 to-cyan-500',
  sad: 'from-rose-400 to-pink-500',
  stressed: 'from-yellow-400 to-orange-500',
  happy: 'from-emerald-400 to-green-500',
  neutral: 'from-indigo-500 to-purple-600',
  overwhelmed: 'from-amber-400 to-red-500',
};

export const QUESTIONS_PER_DISPLAY = 4;
export const MIN_QUESTIONS = 3;

// Usage in component:
import { MOOD_CATEGORIES, MOOD_COLORS, QUESTIONS_PER_DISPLAY } from '../config/recommendations';
`;

// ============================================================================
// EXAMPLE 10: Accessibility improvements
// ============================================================================

const exampleAccessibility = `
// Enhanced accessibility attributes

const QuestionButton = ({ question, onSelect, icon, color }) => (
  <button
    onClick={() => onSelect(question)}
    className={...}
    // Accessibility
    aria-label={question}
    role="option"
    tabIndex={0}
    onKeyPress={(e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        onSelect(question);
      }
    }}
  >
    {/* content */}
  </button>
);

// Wrapper with ARIA attributes
<div role="listbox" aria-label="Suggested questions">
  {questions.map((q, i) => (
    <QuestionButton
      key={i}
      question={q}
      onSelect={onSelectQuestion}
    />
  ))}
</div>
`;

console.log('=== Recommended Questions Customization Examples ===');
console.log('See examples above for various customization patterns');
