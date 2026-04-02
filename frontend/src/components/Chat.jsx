import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Send, Brain, Loader2, ArrowLeft, Mic, MicOff } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

const API_BASE = 'http://localhost:8000';

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
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [selectedLang, setSelectedLang] = useState(LANGUAGES[0]);
  const [voiceSupported] = useState(
    () => !!(window.SpeechRecognition || window.webkitSpeechRecognition)
  );
  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const toggleVoiceInput = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = selectedLang.code;
    recognition.interimResults = true;
    recognition.continuous = true;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => setIsListening(true);

    recognition.onresult = (event) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript + ' ';
        } else {
          interimTranscript += transcript;
        }
      }

      // Update input with both interim and final results
      const displayText = finalTranscript || interimTranscript;
      setInput(prev => {
        // If we have a new final result, append it
        if (finalTranscript) {
          return (prev.split(/\s+/).slice(0, -1).join(' ') || '') + ' ' + finalTranscript;
        }
        // Otherwise show interim results
        return (prev.split(/\s+/).slice(0, -1).join(' ') || '') + ' ' + interimTranscript;
      });
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
    };

    recognition.onend = () => {
      setIsListening(false);
      recognition.stop();
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
      const response = await axios.post(`${API_BASE}/api/chat`, {
        message: userMessage,
        language: selectedLang.name
      });

      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: response.data.response,
        sources: response.data.sources
      }]);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <div className="flex-1 flex flex-col">
        <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
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
              <div className="text-center max-w-md">
                <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Brain className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">How can I help you today?</h3>
                <p className="text-gray-600">Ask me anything about mental health and well-being.</p>
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
                {message.sources && message.sources.length > 0 && (
                  <details className="mt-3 pt-3 border-t border-gray-200">
                    <summary className="text-sm text-gray-600 cursor-pointer">📄 Sources ({message.sources.length})</summary>
                    <div className="mt-2 space-y-2">
                      {message.sources.map((source, idx) => (
                        <div key={idx} className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
                          <p className="font-medium">{source.source} (Page {source.page})</p>
                        </div>
                      ))}
                    </div>
                  </details>
                )}
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
