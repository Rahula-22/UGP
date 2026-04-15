import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Send, Brain, Loader2, ArrowLeft, Mic, MicOff, History, Menu, X, Trash2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import RecommendedQuestions from './RecommendedQuestions';
import { API_BASE } from '../config/api';

const LANGUAGES = [
  { label: 'English',              code: 'en-US', name: 'English' },
  { label: 'हिंदी (Hindi)',         code: 'hi-IN', name: 'Hindi' },
  { label: 'বাংলা (Bengali)',       code: 'bn-IN', name: 'Bengali' },
  { label: 'தமிழ் (Tamil)',         code: 'ta-IN', name: 'Tamil' },
  { label: 'తెలుగు (Telugu)',       code: 'te-IN', name: 'Telugu' },
  { label: 'मराठी (Marathi)',       code: 'mr-IN', name: 'Marathi' },
  { label: 'ગુજરાતી (Gujarati)',    code: 'gu-IN', name: 'Gujarati' },
  { label: 'ಕನ್ನಡ (Kannada)',       code: 'kn-IN', name: 'Kannada' },
  { label: 'മലയാളം (Malayalam)',    code: 'ml-IN', name: 'Malayalam' },
  { label: 'ਪੰਜਾਬੀ (Punjabi)',      code: 'pa-IN', name: 'Punjabi' },
  { label: 'اردو (Urdu)',           code: 'ur-IN', name: 'Urdu' },
];

function Chat({ sessionToken, onBack }) {
  const [messages, setMessages] = useState([]);
  const [chatSessions, setChatSessions] = useState([]);
  const [currentSessionId, setCurrentSessionId] = useState(null);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [selectedLang, setSelectedLang] = useState(LANGUAGES[0]);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [voiceSupported] = useState(
    () => !!(window.SpeechRecognition || window.webkitSpeechRecognition)
  );
  const [userMood, setUserMood] = useState(null);
  const [userName, setUserName] = useState(null);
  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);

  const cleanSpeechChunk = (text) => text.replace(/\s+/g, ' ').trim();

  const mergeSegmentsByOverlap = (segments) => {
    if (!segments.length) return '';

    let merged = segments[0];

    for (let i = 1; i < segments.length; i++) {
      const next = segments[i];
      const mergedWords = merged.split(' ');
      const nextWords = next.split(' ');
      const maxOverlap = Math.min(mergedWords.length, nextWords.length);
      let overlap = 0;

      for (let size = maxOverlap; size > 0; size--) {
        const mergedTail = mergedWords.slice(-size).join(' ').toLowerCase();
        const nextHead = nextWords.slice(0, size).join(' ').toLowerCase();

        if (mergedTail === nextHead) {
          overlap = size;
          break;
        }
      }

      if (overlap === nextWords.length) {
        continue;
      }

      if (overlap > 0) {
        merged = `${merged} ${nextWords.slice(overlap).join(' ')}`.trim();
      } else if (!merged.toLowerCase().includes(next.toLowerCase())) {
        merged = `${merged} ${next}`.trim();
      }
    }

    return cleanSpeechChunk(merged);
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Load user personalization data
  useEffect(() => {
    try {
      const savedUser = localStorage.getItem('user');
      if (savedUser) {
        const user = JSON.parse(savedUser);
        setUserName(user.username || null);
      }

      const savedWellnessData = localStorage.getItem('userWellnessData');
      if (savedWellnessData) {
        const wellnessData = JSON.parse(savedWellnessData);
        setUserMood(wellnessData.currentMood || null);
      }
    } catch (error) {
      console.error('Error loading personalization data:', error);
    }
  }, []);

  useEffect(() => {
    const loadChatSessions = async () => {
      if (!sessionToken) return;
      try {
        const res = await axios.get(`${API_BASE}/api/chat-sessions/${sessionToken}`);
        console.log('Chat sessions loaded:', res.data.sessions);
        setChatSessions(res.data.sessions || []);
      } catch (error) {
        console.error('Failed to load chat sessions:', error);
      }
    };

    loadChatSessions();
  }, [sessionToken]);

  const createNewSession = async () => {
    if (!sessionToken) return;
    try {
      const res = await axios.post(`${API_BASE}/api/create-session?session_token=${sessionToken}`, {
        title: null
      });
      setCurrentSessionId(res.data.session_id);
      setMessages([]);
      setInput('');
      // Reload sessions
      const sessionsRes = await axios.get(`${API_BASE}/api/chat-sessions/${sessionToken}`);
      setChatSessions(sessionsRes.data.sessions || []);
    } catch (error) {
      console.error('Failed to create new session:', error);
    }
  };

  const loadSessionMessages = async (sessionId) => {
    if (!sessionToken) return;
    try {
      const res = await axios.get(`${API_BASE}/api/session-messages/${sessionToken}/${sessionId}`);
      console.log('Session messages loaded:', res.data.messages);

      // Convert messages to chat format
      const chatMessages = [];
      for (const msg of res.data.messages) {
        chatMessages.push({ role: 'user', content: msg.message });
        chatMessages.push({ role: 'assistant', content: msg.response });
      }
      setMessages(chatMessages);
      setCurrentSessionId(sessionId);
    } catch (error) {
      console.error('Failed to load session messages:', error);
    }
  };

  const deleteSession = async (e, sessionId) => {
    e.stopPropagation();
    e.preventDefault();

    if (!sessionToken) return;

    try {
      await axios.delete(`${API_BASE}/api/chat-sessions/${sessionToken}/${sessionId}`);
      setChatSessions(prev => prev.filter(session => session.id !== sessionId));
      if (currentSessionId === sessionId) {
        setMessages([]);
        setCurrentSessionId(null);
      }
    } catch (error) {
      console.error('Failed to delete session:', error);
      alert('Failed to delete session: ' + (error.response?.data?.detail || error.message));
    }
  };

  const toggleVoiceInput = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = selectedLang.code;
    recognition.interimResults = true;
    recognition.continuous = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event) => {
      const segments = [];

      // Rebuild transcript from current recognition results and merge overlaps.
      for (let i = 0; i < event.results.length; i++) {
        const transcript = cleanSpeechChunk(event.results[i][0].transcript);
        if (transcript) {
          segments.push(transcript);
        }
      }

      setInput(mergeSegmentsByOverlap(segments));
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);

    try {
      // Create a new session if we don't have one
      let sessionId = currentSessionId;
      if (!sessionId) {
        const sessionRes = await axios.post(`${API_BASE}/api/create-session?session_token=${sessionToken}`, {
          title: null
        });
        sessionId = sessionRes.data.session_id;
        setCurrentSessionId(sessionId);
      }

      const response = await axios.post(
        `${API_BASE}/api/chat-with-auth?session_token=${sessionToken}`,
        {
          message: userMessage,
          language: selectedLang.name,
          session_id: sessionId
        }
      );

      setMessages(prev => [...prev, {
        role: 'assistant',
        content: response.data.response
      }]);

      // Reload sessions to show updated list
      const sessionsRes = await axios.get(`${API_BASE}/api/chat-sessions/${sessionToken}`);
      setChatSessions(sessionsRes.data.sessions || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectRecommendedQuestion = (question) => {
    setInput(question);
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Sidebar */}
      <aside className={`fixed lg:relative top-0 left-0 h-screen w-64 border-r border-gray-200 bg-white transition-transform duration-300 z-20 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0`}>
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <History className="w-5 h-5 text-indigo-600" />
              <h2 className="text-lg font-semibold text-gray-900">History</h2>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-gray-500 hover:text-gray-700"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <button
            onClick={() => createNewSession()}
            className="w-full px-3 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-lg text-sm font-medium transition-colors"
          >
            + New Chat
          </button>
        </div>

        {/* Chat Sessions List */}
        <div className="flex-1 overflow-y-auto">
          {chatSessions.length === 0 ? (
            <div className="p-4 text-sm text-gray-500 text-center">
              No chat sessions yet
            </div>
          ) : (
            <div className="px-2 py-2 space-y-1">
              {chatSessions.map((session) => (
                <div
                  key={session.id}
                  className={`group flex items-center gap-2 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer ${
                    currentSessionId === session.id ? 'bg-indigo-50' : ''
                  }`}
                >
                  <button
                    onClick={() => {
                      loadSessionMessages(session.id);
                      setSidebarOpen(false);
                    }}
                    className="flex-1 text-left px-3 py-2 text-sm text-gray-700 truncate"
                    title={session.title}
                  >
                    {session.title}
                  </button>
                  <button
                    onClick={(e) => deleteSession(e, session.id)}
                    className="p-1 text-red-500 hover:text-red-700 transition-all"
                    title="Delete session"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-10 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className="flex-1 flex flex-col">
        <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden text-gray-600 hover:text-gray-900"
            >
              <Menu className="w-6 h-6" />
            </button>
            <button
              onClick={onBack}
              className="text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">AI Companion</h2>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-gray-600">Online</span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.length === 0 && (
            <div className="flex items-center justify-center h-full">
              <div className="text-center max-w-2xl">
                <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Brain className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">How can I help you today?</h3>
                <p className="text-gray-600 mb-6">Ask me anything about mental health and well-being.</p>

                {/* Recommended Questions */}
                <RecommendedQuestions
                  userMood={userMood}
                  userName={userName}
                  language={selectedLang.name}
                  onSelectQuestion={handleSelectRecommendedQuestion}
                />
              </div>
            </div>
          )}

          {messages.map((message, index) => (
            <div key={index} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-3xl ${message.role === 'user' ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white' : 'bg-white border border-gray-200'} rounded-2xl px-6 py-4 shadow-sm`}>
                {message.role === 'assistant' && (
                  <div className="flex items-center gap-2 mb-2">
                    <Brain className="w-5 h-5 text-indigo-600" />
                    <span className="text-sm font-medium text-gray-700">AI Companion</span>
                  </div>
                )}
                <div className={`markdown-content ${message.role === 'user' ? 'text-white' : 'text-gray-800'}`}>
                  <ReactMarkdown>{message.content}</ReactMarkdown>
                </div>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="bg-white border border-gray-200 rounded-2xl px-6 py-4 shadow-sm">
                <div className="flex items-center gap-2">
                  <Loader2 className="w-5 h-5 text-indigo-600 animate-spin" />
                  <span className="text-gray-600">Thinking...</span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="border-t border-gray-200 bg-white p-4">
          <form onSubmit={handleSendMessage} className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-2">
              <select
                value={selectedLang.code}
                onChange={(e) => setSelectedLang(LANGUAGES.find(l => l.code === e.target.value))}
                disabled={loading || isListening}
                className="text-sm px-3 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:opacity-50 bg-white text-gray-700"
              >
                {LANGUAGES.map(lang => (
                  <option key={lang.code} value={lang.code}>{lang.label}</option>
                ))}
              </select>
              {isListening && (
                <div className="flex items-center gap-2 text-red-500 text-sm">
                  <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse inline-block"></span>
                  Listening... speak now
                </div>
              )}
            </div>
            <div className="flex gap-3">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={isListening ? 'Listening...' : 'Ask me anything about mental health...'}
                disabled={loading}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:opacity-50"
              />
              {voiceSupported && (
                <button
                  type="button"
                  onClick={toggleVoiceInput}
                  disabled={loading}
                  title={isListening ? 'Stop listening' : 'Speak your question'}
                  className={`px-4 py-3 rounded-xl transition-all disabled:opacity-50 flex items-center justify-center ${
                    isListening
                      ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
                  }`}
                >
                  {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                </button>
              )}
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl hover:from-indigo-600 hover:to-purple-700 transition-all disabled:opacity-50 flex items-center gap-2 font-medium"
              >
                <Send className="w-5 h-5" />
                Send
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Chat;
