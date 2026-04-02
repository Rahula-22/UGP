import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { 
  Send, Brain, CheckCircle, AlertCircle,
  Loader2, X, Menu
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import Landing from './components/Landing';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import Chat from './components/Chat';
import Assessment from './components/Assessment';

const API_BASE = 'http://localhost:8000';

function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null);
  const [showSidebar, setShowSidebar] = useState(false);
  const [notification, setNotification] = useState(null);
  const [user, setUser] = useState(null);
  const [sessionToken, setSessionToken] = useState(null);
  const [currentView, setCurrentView] = useState('landing');
  const [authMode, setAuthMode] = useState('login'); // 'login' | 'register'
  const messagesEndRef = useRef(null);

  // Fetch status on mount
  useEffect(() => {
    fetchStatus();
  }, []);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Check for existing session
  useEffect(() => {
    const savedToken = localStorage.getItem('session_token');
    const savedUser = localStorage.getItem('user');
    
    if (savedToken && savedUser) {
      setSessionToken(savedToken);
      setUser(JSON.parse(savedUser));
      setCurrentView('dashboard');
    }
  }, []);

  const fetchStatus = async () => {
    try {
      const response = await axios.get(`${API_BASE}/api/status`);
      setStatus(response.data);
    } catch (error) {
      console.error('Error fetching status:', error);
    }
  };

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
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
        message: userMessage
      });

      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: response.data.response,
        sources: response.data.sources
      }]);
    } catch (error) {
      showNotification('Error getting response: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleLoginSuccess = (userData, token) => {
    setUser(userData);
    setSessionToken(token);
    setCurrentView('dashboard');
  };

  const handleLogout = () => {
    localStorage.removeItem('session_token');
    localStorage.removeItem('user');
    setUser(null);
    setSessionToken(null);
    setAuthMode('login');
    setCurrentView('landing');
  };

  const handleNavigate = (view) => {
    setCurrentView(view);
  };

  const goToLogin = () => {
    setAuthMode('login');
    setCurrentView('login');
  };

  const goToRegister = () => {
    setAuthMode('register');
    setCurrentView('login');
  };

  if (currentView === 'landing') {
    return <Landing onSignIn={goToLogin} onSignUp={goToRegister} />;
  }

  if (currentView === 'login') {
    return (
      <Login
        onLoginSuccess={handleLoginSuccess}
        defaultIsRegister={authMode === 'register'}
        onBack={() => setCurrentView('landing')}
      />
    );
  }

  if (currentView === 'dashboard') {
    return <Dashboard user={user} onNavigate={handleNavigate} onLogout={handleLogout} />;
  }

  if (currentView === 'chat') {
    return <Chat sessionToken={sessionToken} onBack={() => handleNavigate('dashboard')} />;
  }

  if (currentView === 'assessment') {
    return <Assessment sessionToken={sessionToken} onBack={() => handleNavigate('dashboard')} />;
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Sidebar */}
      <div className={`${showSidebar ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 fixed md:relative z-20 w-80 bg-white border-r border-gray-200 transition-transform duration-300 ease-in-out h-full`}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <Brain className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-gray-900">AI Companion</h1>
                  <p className="text-xs text-gray-500">Mental Health Support</p>
                </div>
              </div>
              <button
                onClick={() => setShowSidebar(false)}
                className="md:hidden text-gray-500 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* System Ready Status */}
          <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-green-50 to-emerald-50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center animate-pulse">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm font-semibold text-green-900">System Ready</p>
                <p className="text-xs text-green-700">AI is configured and ready to help</p>
              </div>
            </div>
          </div>

          {/* Info Section */}
          <div className="flex-1 p-6 overflow-y-auto">
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-2">About This AI</h3>
                <p className="text-xs text-gray-600 leading-relaxed">
                  I'm your mental health companion, trained on professional documents to provide supportive information.
                </p>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-2">How to Use</h3>
                <ul className="text-xs text-gray-600 space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="text-indigo-600 mt-0.5">•</span>
                    <span>Ask questions about mental health and well-being</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-indigo-600 mt-0.5">•</span>
                    <span>Get information based on trusted documents</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-indigo-600 mt-0.5">•</span>
                    <span>View sources for transparency</span>
                  </li>
                </ul>
              </div>

              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-xs text-yellow-800">
                  <strong>Important:</strong> This AI provides information, not medical advice. Please consult healthcare professionals for personal medical concerns.
                </p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200 bg-gray-50">
            <p className="text-xs text-gray-500 text-center">
              Powered by Groq AI • RAG System
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowSidebar(!showSidebar)}
              className="md:hidden text-gray-600 hover:text-gray-900"
            >
              <Menu className="w-6 h-6" />
            </button>
            <h2 className="text-xl font-semibold text-gray-900">Chat</h2>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-gray-600">Online</span>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.length === 0 && (
            <div className="flex items-center justify-center h-full">
              <div className="text-center max-w-md">
                <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Brain className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Welcome to Your AI Companion
                </h3>
                <p className="text-gray-600 mb-4">
                  I'm here to support you with mental health information based on professional documents.
                </p>
                <div className="text-sm text-gray-500 space-y-2">
                  <p className="flex items-center justify-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    System is ready
                  </p>
                  <p className="flex items-center justify-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Knowledge base loaded
                  </p>
                  <p className="flex items-center justify-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    AI configured
                  </p>
                </div>
                <p className="text-sm text-gray-600 mt-4">Start by asking a question below!</p>
              </div>
            </div>
          )}

          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-3xl ${message.role === 'user' ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white' : 'bg-white border border-gray-200'} rounded-2xl px-6 py-4 shadow-sm`}>
                {message.role === 'assistant' && (
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-6 h-6 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
                      <Brain className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-sm font-medium text-gray-700">AI Companion</span>
                  </div>
                )}
                <div className={`markdown-content ${message.role === 'user' ? 'text-white' : 'text-gray-800'}`}>
                  <ReactMarkdown>{message.content}</ReactMarkdown>
                </div>
                {message.sources && message.sources.length > 0 && (
                  <details className="mt-3 pt-3 border-t border-gray-200">
                    <summary className="text-sm text-gray-600 cursor-pointer hover:text-gray-900">
                      📄 View Sources ({message.sources.length})
                    </summary>
                    <div className="mt-2 space-y-2">
                      {message.sources.map((source, idx) => (
                        <div key={idx} className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
                          <p className="font-medium">{source.source} (Page {source.page})</p>
                          <p className="text-gray-500 mt-1">{source.content}</p>
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

        {/* Input */}
        <div className="border-t border-gray-200 bg-white p-4">
          <form onSubmit={handleSendMessage} className="max-w-4xl mx-auto">
            <div className="flex gap-3">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask me anything about mental health..."
                disabled={loading}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl hover:from-indigo-600 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-medium"
              >
                <Send className="w-5 h-5" />
                Send
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Notification */}
      {notification && (
        <div className={`fixed bottom-4 right-4 px-6 py-4 rounded-lg shadow-lg ${notification.type === 'success' ? 'bg-green-500' : 'bg-red-500'} text-white flex items-center gap-3 z-50`}>
          {notification.type === 'success' ? (
            <CheckCircle className="w-5 h-5" />
          ) : (
            <AlertCircle className="w-5 h-5" />
          )}
          <span>{notification.message}</span>
        </div>
      )}
    </div>
  );
}

export default App;
