import React from 'react';
import { MessageCircle, ClipboardList, LogOut, Heart } from 'lucide-react';

function Dashboard({ user, onNavigate, onLogout }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Heart className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">Mental Health Companion</h1>
              <p className="text-xs text-gray-500">Your Personal Wellness Dashboard</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">{user.username}</p>
              <p className="text-xs text-gray-500">{user.email}</p>
            </div>
            <button
              onClick={onLogout}
              className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Welcome Section */}
        <div className="mb-12 text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Welcome back, {user.username}! 👋
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            How can we support your mental wellness journey today?
          </p>
        </div>

        {/* Action Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Ask a Question Card */}
          <button
            onClick={() => onNavigate('chat')}
            className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-8 text-left border-2 border-transparent hover:border-indigo-500"
          >
            <div className="flex items-start justify-between mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <MessageCircle className="w-8 h-8 text-white" />
              </div>
              <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center group-hover:bg-indigo-200 transition-colors">
                <span className="text-indigo-600 text-xl">→</span>
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">
              Ask a Question
            </h3>
            <p className="text-gray-600 mb-4">
              Get instant, AI-powered answers to your mental health questions based on professional resources.
            </p>
            <div className="flex items-center gap-2 text-indigo-600 font-medium">
              <span>Start conversation</span>
              <span className="group-hover:translate-x-1 transition-transform">→</span>
            </div>
          </button>

          {/* Mental Health Assessment Card */}
          <button
            onClick={() => onNavigate('assessment')}
            className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-8 text-left border-2 border-transparent hover:border-purple-500"
          >
            <div className="flex items-start justify-between mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <ClipboardList className="w-8 h-8 text-white" />
              </div>
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                <span className="text-purple-600 text-xl">→</span>
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">
              Check My Mental Health Status
            </h3>
            <p className="text-gray-600 mb-4">
              Take a confidential assessment to understand your current mental health status and get personalized insights.
            </p>
            <div className="flex items-center gap-2 text-purple-600 font-medium">
              <span>Begin assessment</span>
              <span className="group-hover:translate-x-1 transition-transform">→</span>
            </div>
          </button>
        </div>

        {/* Privacy Notice */}
        <div className="mt-12 max-w-2xl mx-auto">
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-white text-xl">🔒</span>
              </div>
              <div>
                <h4 className="font-semibold text-blue-900 mb-2">Your Privacy Matters</h4>
                <p className="text-sm text-blue-800 leading-relaxed">
                  All conversations and assessments are completely private and encrypted. Your data is never shared with third parties. 
                  This tool provides information and support, but is not a substitute for professional medical advice.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Emergency Resources */}
        <div className="mt-8 max-w-2xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-xl p-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-red-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-white text-xl">🆘</span>
              </div>
              <div>
                <h4 className="font-semibold text-red-900 mb-2">In Crisis? Get Help Now</h4>
                <p className="text-sm text-red-800 mb-3">
                  If you're experiencing a mental health crisis, please reach out immediately:
                </p>
                <ul className="text-sm text-red-800 space-y-1">
                  <li>• <strong>Call 988</strong> - Suicide & Crisis Lifeline (24/7)</li>
                  <li>• <strong>Text "HELLO" to 741741</strong> - Crisis Text Line</li>
                  <li>• <strong>Call 911</strong> - For immediate emergencies</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
