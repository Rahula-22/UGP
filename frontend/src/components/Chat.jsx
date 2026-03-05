import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Send, Brain, Loader2, ArrowLeft } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

const API_BASE = 'http://localhost:8000';

function Chat({ sessionToken, onBack }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

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
