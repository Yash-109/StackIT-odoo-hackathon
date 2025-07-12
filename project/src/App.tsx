import React, { useState, useEffect } from 'react';
import { AuthProvider } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { QuestionProvider } from './contexts/QuestionContext';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import QuestionCard from './components/QuestionCard';
import QuestionForm from './components/QuestionForm';
import QuestionDetail from './components/QuestionDetail';
import AuthModal from './components/auth/AuthModal';
import { useLanguage } from './hooks/useLanguage';
import { useAuth } from './contexts/AuthContext';
import { useQuestions } from './contexts/QuestionContext';
import { Question } from './types';
import Pagination from './components/Pagination';

const AppContent: React.FC = () => {
  const { t, currentLanguage } = useLanguage();
  const { isAuthenticated, user } = useAuth();
  const { addQuestion, addAnswer, getFilteredQuestions } = useQuestions();
  const [activeTab, setActiveTab] = useState('all');
  const [showQuestionForm, setShowQuestionForm] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [contentLanguage, setContentLanguage] = useState<'en' | 'hi' | 'both'>('both');
  const [currentPage, setCurrentPage] = useState(1);
  const QUESTIONS_PER_PAGE = 5;

  const handleQuestionSubmit = (questionData: { title: string; content: string; tags: string[]; images: string[] }) => {
    if (!user) return;

    addQuestion({
      title: questionData.title,
      content: questionData.content,
      images: questionData.images,
      author: user,
      tags: questionData.tags,
      answers: [],
      language: currentLanguage,
      isModerated: true,
      isPinned: false,
      isClosed: false,
    });
  };

  const handleAnswerSubmit = (answerData: { content: string; images: string[] }) => {
    if (!selectedQuestion || !user) return;

    addAnswer(selectedQuestion.id, {
      content: answerData.content,
      images: answerData.images,
      author: user,
      isAccepted: false,
      questionId: selectedQuestion.id,
      mentions: [],
    });
  };

  const handleAskQuestion = () => {
    if (!isAuthenticated) {
      setShowAuthModal(true);
    } else {
      setShowQuestionForm(true);
    }
  };

  const handleTabChange = (tab: string) => {
    if (activeTab === tab) {
      // If clicking the same tab, reset to first page and scroll to top
      setCurrentPage(1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    setActiveTab(tab);
  };

  const filteredQuestions = getFilteredQuestions(activeTab, contentLanguage);
  const totalPages = Math.ceil(filteredQuestions.length / QUESTIONS_PER_PAGE);
  const pagedQuestions = filteredQuestions.slice(
    (currentPage - 1) * QUESTIONS_PER_PAGE,
    currentPage * QUESTIONS_PER_PAGE
  );

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, contentLanguage, filteredQuestions.length]);

  if (selectedQuestion) {
    return (
      <QuestionDetail
        question={selectedQuestion}
        onClose={() => setSelectedQuestion(null)}
        onAnswerSubmit={handleAnswerSubmit}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
      <Header 
        onAskQuestion={handleAskQuestion}
        onMenuToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        isMobileMenuOpen={isMobileMenuOpen}
      />
      
      <div className="flex">
        {/* Mobile Sidebar Overlay */}
        {isMobileMenuOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}
        
        {/* Sidebar */}
        <div className={`
          fixed lg:static inset-y-0 left-0 z-40 w-64 transform transition-transform duration-300 ease-in-out
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}>
          <Sidebar 
            activeTab={activeTab} 
            onTabChange={handleTabChange} 
          />
        </div>
        
        {/* Main Content */}
        <main className="flex-1 lg:ml-0 p-4 lg:p-8">
          <div className="max-w-5xl mx-auto">
            {/* Header Section */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 mb-8">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    {activeTab === 'all' && t('allQuestions')}
                    {activeTab === 'recent' && t('recent')}
                    {activeTab === 'popular' && t('popular')}
                    {activeTab === 'trending' && t('trending')}
                    {activeTab === 'unanswered' && t('unanswered')}
                    {activeTab === 'answered' && t('answered')}
                    {activeTab === 'my' && t('myQuestions')}
                    {activeTab === 'followed' && t('followedQuestions')}
                  </h1>
                  <p className="text-gray-600 mt-1">
                    Discover knowledge, share expertise, and connect with the community
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-gray-900">{filteredQuestions.length}</div>
                  <div className="text-sm text-gray-500">questions found</div>
                </div>
              </div>

              {/* Language Filter */}
              <div className="flex items-center space-x-4">
                <span className="text-sm font-medium text-gray-700">Content Language:</span>
                <div className="flex space-x-2">
                  {[
                    { value: 'both', label: '🌍 All', color: 'bg-gray-100 text-gray-700' },
                    { value: 'en', label: '🇺🇸 English', color: 'bg-blue-100 text-blue-700' },
                    { value: 'hi', label: '🇮🇳 हिन्दी', color: 'bg-orange-100 text-orange-700' }
                  ].map((lang) => (
                    <button
                      key={lang.value}
                      onClick={() => setContentLanguage(lang.value as 'en' | 'hi' | 'both')}
                      className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${
                        contentLanguage === lang.value
                          ? `${lang.color} shadow-md transform scale-105`
                          : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      {lang.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Questions List */}
            <div className="space-y-6">
              {pagedQuestions.map((question) => (
                <QuestionCard
                  key={question.id}
                  question={question}
                  onClick={() => setSelectedQuestion(question)}
                />
              ))}
            </div>
            {/* Pagination */}
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />

            {/* Empty State */}
            {filteredQuestions.length === 0 && (
              <div className="text-center py-16">
                <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-12 max-w-md mx-auto">
                  <div className="text-6xl mb-4">🤔</div>
                  <div className="text-xl font-semibold text-gray-900 mb-2">No questions found</div>
                  <div className="text-gray-600 mb-6">
                    {activeTab === 'my' 
                      ? "You haven't asked any questions yet."
                      : "Try adjusting your filters or be the first to ask!"
                    }
                  </div>
                  {!isAuthenticated ? (
                    <button
                      onClick={() => setShowAuthModal(true)}
                      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 rounded-xl font-semibold transition-all transform hover:scale-105 shadow-lg"
                    >
                      {t('login')} to ask questions
                    </button>
                  ) : (
                    <button
                      onClick={() => setShowQuestionForm(true)}
                      className="bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white px-8 py-3 rounded-xl font-semibold transition-all transform hover:scale-105 shadow-lg"
                    >
                      Ask the first question!
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Modals */}
      {showQuestionForm && (
        <QuestionForm
          onClose={() => setShowQuestionForm(false)}
          onSubmit={handleQuestionSubmit}
        />
      )}

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        initialMode="login"
      />
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <QuestionProvider>
          <AppContent />
        </QuestionProvider>
      </NotificationProvider>
    </AuthProvider>
  );
}

export default App;