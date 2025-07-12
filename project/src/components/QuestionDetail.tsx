import React, { useState } from 'react';
import { 
  ArrowUp, ArrowDown, MessageCircle, Eye, Calendar, Award, Edit, Trash2, X, 
  Heart, Bookmark, Share2, Flag, Check, Star, Users 
} from 'lucide-react';
import { Question, Answer } from '../types';
import { useLanguage } from '../hooks/useLanguage';
import { useAuth } from '../contexts/AuthContext';
import RichTextEditor from './RichTextEditor';
import ImageUpload from './ImageUpload';
import UserAvatar from './UserAvatar';

interface QuestionDetailProps {
  question: Question;
  onClose: () => void;
  onAnswerSubmit: (answer: { content: string; images: string[] }) => void;
}

const QuestionDetail: React.FC<QuestionDetailProps> = ({ question, onClose, onAnswerSubmit }) => {
  const { t } = useLanguage();
  const { isAuthenticated, user } = useAuth();
  const [answerContent, setAnswerContent] = useState('');
  const [answerImages, setAnswerImages] = useState<string[]>([]);
  const [showAnswerForm, setShowAnswerForm] = useState(false);
  const [sortBy, setSortBy] = useState<'votes' | 'newest' | 'oldest'>('votes');

  const handleAnswerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!answerContent.trim()) return;

    onAnswerSubmit({ content: answerContent, images: answerImages });
    setAnswerContent('');
    setAnswerImages([]);
    setShowAnswerForm(false);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const sortedAnswers = [...question.answers].sort((a, b) => {
    if (sortBy === 'votes') return b.votes - a.votes;
    if (sortBy === 'newest') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
  });

  const acceptedAnswer = question.answers.find(answer => answer.isAccepted);

  return (
    <div className="fixed inset-0 bg-white z-50 overflow-y-auto">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-semibold text-gray-900 truncate">{question.title}</h1>
            <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
              <span>Asked {formatDate(question.createdAt)}</span>
              <span>•</span>
              <span>{question.views} views</span>
              <span>•</span>
              <span>{question.answers.length} answers</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="ml-4 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Question */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
          <div className="flex items-start space-x-4">
            {/* Vote Section */}
            <div className="flex flex-col items-center space-y-2 min-w-[60px]">
              <button 
                className={`p-2 rounded transition-colors ${
                  isAuthenticated 
                    ? 'text-gray-400 hover:text-green-600 hover:bg-green-50' 
                    : 'text-gray-300 cursor-not-allowed'
                }`}
                disabled={!isAuthenticated}
              >
                <ArrowUp className="h-6 w-6" />
              </button>
              <span className="text-xl font-bold text-gray-900">{question.votes}</span>
              <button 
                className={`p-2 rounded transition-colors ${
                  isAuthenticated 
                    ? 'text-gray-400 hover:text-red-600 hover:bg-red-50' 
                    : 'text-gray-300 cursor-not-allowed'
                }`}
                disabled={!isAuthenticated}
              >
                <ArrowDown className="h-6 w-6" />
              </button>
              
              {/* Action Buttons */}
              <div className="flex flex-col space-y-2 mt-4">
                <button 
                  className={`p-2 rounded transition-colors ${
                    isAuthenticated 
                      ? 'text-gray-400 hover:text-red-600 hover:bg-red-50' 
                      : 'text-gray-300 cursor-not-allowed'
                  }`}
                  disabled={!isAuthenticated}
                  title={t('follow')}
                >
                  <Heart className="h-5 w-5" />
                </button>
                <button 
                  className={`p-2 rounded transition-colors ${
                    isAuthenticated 
                      ? 'text-gray-400 hover:text-blue-600 hover:bg-blue-50' 
                      : 'text-gray-300 cursor-not-allowed'
                  }`}
                  disabled={!isAuthenticated}
                  title={t('bookmark')}
                >
                  <Bookmark className="h-5 w-5" />
                </button>
                <button 
                  className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded transition-colors"
                  title={t('share')}
                >
                  <Share2 className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1">
              <div className="prose max-w-none mb-6">
                <div 
                  className="text-gray-700 text-base leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: question.content.replace(/\n/g, '<br>') }}
                />
              </div>

              {/* Images */}
              {question.images.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  {question.images.map((image, index) => (
                    <img
                      key={index}
                      src={image}
                      alt={`Question attachment ${index + 1}`}
                      className="rounded-lg border border-gray-200 max-w-full h-auto"
                    />
                  ))}
                </div>
              )}

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-6">
                {question.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 hover:bg-blue-200 transition-colors cursor-pointer"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {/* Author Info and Actions */}
              <div className="flex items-center justify-between border-t border-gray-100 pt-4">
                <div className="flex items-center space-x-3">
                  <UserAvatar
                    src={question.author.avatar}
                    alt={question.author.name}
                    size="lg"
                  />
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-gray-900">{question.author.name}</span>
                      {question.author.isVerified && (
                        <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                          <Check className="w-2 h-2 text-white" />
                        </div>
                      )}
                    </div>
                    <div className="text-sm text-gray-500 flex items-center space-x-2">
                      <Award className="h-4 w-4" />
                      <span>{question.author.reputation} reputation</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  {user?.id === question.author.id && (
                    <>
                      <button className="p-2 text-gray-400 hover:text-blue-600 transition-colors">
                        <Edit className="h-4 w-4" />
                      </button>
                      <button className="p-2 text-gray-400 hover:text-red-600 transition-colors">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </>
                  )}
                  <button className="p-2 text-gray-400 hover:text-orange-600 transition-colors">
                    <Flag className="h-4 w-4" />
                  </button>
                  <div className="text-sm text-gray-500 flex items-center space-x-1">
                    <Calendar className="h-4 w-4" />
                    <span>{formatDate(question.createdAt)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Answers Section */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              {question.answers.length} {t('answers')}
            </h2>
            
            {/* Sort Options */}
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'votes' | 'newest' | 'oldest')}
                className="text-sm border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="votes">Most votes</option>
                <option value="newest">Newest</option>
                <option value="oldest">Oldest</option>
              </select>
            </div>
          </div>

          {/* Accepted Answer */}
          {acceptedAnswer && (
            <div className="mb-4">
              <div className="flex items-center space-x-2 mb-2">
                <Check className="h-5 w-5 text-green-600" />
                <span className="text-sm font-medium text-green-600">{t('acceptedAnswer')}</span>
              </div>
              <AnswerCard answer={acceptedAnswer} isAccepted={true} />
            </div>
          )}

          {/* Other Answers */}
          {sortedAnswers.filter(answer => !answer.isAccepted).map((answer) => (
            <AnswerCard key={answer.id} answer={answer} isAccepted={false} />
          ))}
        </div>

        {/* Answer Form */}
        {isAuthenticated ? (
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('writeAnswer')}</h3>
            
            {!showAnswerForm ? (
              <button
                onClick={() => setShowAnswerForm(true)}
                className="w-full py-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-blue-400 hover:text-blue-600 transition-colors"
              >
                Click to write your answer...
              </button>
            ) : (
              <form onSubmit={handleAnswerSubmit} className="space-y-4">
                <RichTextEditor
                  value={answerContent}
                  onChange={setAnswerContent}
                  placeholder="Write your answer here..."
                  onImageUpload={(files) => {
                    const newImages = files.map(file => URL.createObjectURL(file));
                    setAnswerImages([...answerImages, ...newImages]);
                  }}
                  minHeight="h-48"
                />
                
                <ImageUpload images={answerImages} onImagesChange={setAnswerImages} />
                
                <div className="flex items-center justify-end space-x-4">
                  <button
                    type="button"
                    onClick={() => setShowAnswerForm(false)}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                  >
                    {t('cancel')}
                  </button>
                  <button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                  >
                    {t('publishAnswer')}
                  </button>
                </div>
              </form>
            )}
          </div>
        ) : (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
            <p className="text-gray-600 mb-4">You need to be logged in to post an answer.</p>
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors">
              {t('login')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// Answer Card Component
interface AnswerCardProps {
  answer: Answer;
  isAccepted: boolean;
}

const AnswerCard: React.FC<AnswerCardProps> = ({ answer, isAccepted }) => {
  const { t } = useLanguage();
  const { isAuthenticated, user } = useAuth();

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className={`bg-white border rounded-lg p-6 mb-4 ${
      isAccepted ? 'border-green-200 bg-green-50' : 'border-gray-200'
    }`}>
      <div className="flex items-start space-x-4">
        {/* Vote Section */}
        <div className="flex flex-col items-center space-y-2 min-w-[60px]">
          <button 
            className={`p-2 rounded transition-colors ${
              isAuthenticated 
                ? 'text-gray-400 hover:text-green-600 hover:bg-green-50' 
                : 'text-gray-300 cursor-not-allowed'
            }`}
            disabled={!isAuthenticated}
          >
            <ArrowUp className="h-5 w-5" />
          </button>
          <span className="font-bold text-gray-900">{answer.votes}</span>
          <button 
            className={`p-2 rounded transition-colors ${
              isAuthenticated 
                ? 'text-gray-400 hover:text-red-600 hover:bg-red-50' 
                : 'text-gray-300 cursor-not-allowed'
            }`}
            disabled={!isAuthenticated}
          >
            <ArrowDown className="h-5 w-5" />
          </button>
          
          {isAccepted && (
            <div className="bg-green-100 text-green-800 p-2 rounded-full mt-2">
              <Check className="h-4 w-4" />
            </div>
          )}
        </div>

        {/* Answer Content */}
        <div className="flex-1">
          <div className="prose max-w-none mb-4">
            <div 
              className="text-gray-700"
              dangerouslySetInnerHTML={{ __html: answer.content.replace(/\n/g, '<br>') }}
            />
          </div>

          {/* Answer Images */}
          {answer.images.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              {answer.images.map((image, index) => (
                <img
                  key={index}
                  src={image}
                  alt={`Answer attachment ${index + 1}`}
                  className="rounded-lg border border-gray-200 max-w-full h-auto"
                />
              ))}
            </div>
          )}

          {/* Answer Author */}
          <div className="flex items-center justify-between border-t border-gray-100 pt-4">
            <div className="flex items-center space-x-3">
              <UserAvatar
                src={answer.author.avatar}
                alt={answer.author.name}
                size="md"
              />
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-medium text-gray-900">{answer.author.name}</span>
                  {answer.author.isVerified && (
                    <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                      <Check className="w-2 h-2 text-white" />
                    </div>
                  )}
                </div>
                <div className="text-sm text-gray-500">{answer.author.reputation} reputation</div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              {user?.id === answer.author.id && (
                <>
                  <button className="p-1 text-gray-400 hover:text-blue-600 transition-colors">
                    <Edit className="h-4 w-4" />
                  </button>
                  <button className="p-1 text-gray-400 hover:text-red-600 transition-colors">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </>
              )}
              <button className="p-1 text-gray-400 hover:text-orange-600 transition-colors">
                <Flag className="h-4 w-4" />
              </button>
              <div className="text-sm text-gray-500">
                {formatDate(answer.createdAt)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuestionDetail;