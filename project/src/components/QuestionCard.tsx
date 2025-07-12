import React from 'react';
import { ArrowUp, ArrowDown, MessageCircle, Eye, Clock, Tag, Heart, Bookmark, Share2, CheckCircle, Pin } from 'lucide-react';
import { Question } from '../types';
import { useLanguage } from '../hooks/useLanguage';
import { useAuth } from '../contexts/AuthContext';
import { useQuestions } from '../contexts/QuestionContext';
import UserAvatar from './UserAvatar';

interface QuestionCardProps {
  question: Question;
  onClick: () => void;
}

const QuestionCard: React.FC<QuestionCardProps> = ({ question, onClick }) => {
  const { t } = useLanguage();
  const { isAuthenticated, user } = useAuth();
  const { voteQuestion, followQuestion } = useQuestions();

  const formatDate = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return t('now');
    if (diffInMinutes < 60) return `${diffInMinutes} ${diffInMinutes === 1 ? t('minuteAgo') : t('minutesAgo')}`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} ${diffInHours === 1 ? t('hourAgo') : t('hoursAgo')}`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} ${diffInDays === 1 ? t('dayAgo') : t('daysAgo')}`;
  };

  const handleVote = (e: React.MouseEvent, type: 'up' | 'down') => {
    e.stopPropagation();
    if (!isAuthenticated) return;
    voteQuestion(question.id, type);
  };

  const handleFollow = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isAuthenticated) return;
    followQuestion(question.id);
  };

  const handleAction = (e: React.MouseEvent, action: string) => {
    e.stopPropagation();
    if (!isAuthenticated) return;
    // Handle actions like bookmark, share, etc.
  };

  const isUpvoted = user && question.upvotes.includes(user.id);
  const isDownvoted = user && question.downvotes.includes(user.id);
  const isFollowing = user && question.followers.includes(user.id);
  const hasAcceptedAnswer = question.answers.some(answer => answer.isAccepted);

  return (
    <div
      onClick={onClick}
      className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-xl transition-all duration-300 cursor-pointer group hover:border-blue-300 relative overflow-hidden"
    >
      {/* Gradient overlay for pinned questions */}
      {question.isPinned && (
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500"></div>
      )}
      
      <div className="flex items-start space-x-4">
        {/* Vote and Stats */}
        <div className="flex flex-col items-center space-y-3 text-gray-500 min-w-[70px]">
          <div className="flex flex-col items-center bg-gray-50 rounded-xl p-3 group-hover:bg-gradient-to-b group-hover:from-blue-50 group-hover:to-purple-50 transition-all">
            <button
              onClick={(e) => handleVote(e, 'up')}
              className={`p-2 rounded-lg transition-all ${
                isAuthenticated 
                  ? isUpvoted
                    ? 'bg-green-500 text-white shadow-lg'
                    : 'hover:bg-green-100 hover:text-green-600 hover:scale-110'
                  : 'cursor-not-allowed opacity-50'
              }`}
              disabled={!isAuthenticated}
            >
              <ArrowUp className="h-5 w-5" />
            </button>
            <span className="text-xl font-bold text-gray-900 my-2">{question.votes}</span>
            <button
              onClick={(e) => handleVote(e, 'down')}
              className={`p-2 rounded-lg transition-all ${
                isAuthenticated 
                  ? isDownvoted
                    ? 'bg-red-500 text-white shadow-lg'
                    : 'hover:bg-red-100 hover:text-red-600 hover:scale-110'
                  : 'cursor-not-allowed opacity-50'
              }`}
              disabled={!isAuthenticated}
            >
              <ArrowDown className="h-5 w-5" />
            </button>
          </div>
          <div className="text-xs text-center font-medium">
            <div>{t('votes')}</div>
          </div>
          
          <div className="flex flex-col items-center bg-blue-50 rounded-xl p-2">
            <div className="flex items-center space-x-1">
              <MessageCircle className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-bold text-blue-700">{question.answers.length}</span>
            </div>
            <div className="text-xs text-blue-600">{t('answers')}</div>
          </div>
          
          <div className="flex flex-col items-center bg-purple-50 rounded-xl p-2">
            <div className="flex items-center space-x-1">
              <Eye className="h-4 w-4 text-purple-600" />
              <span className="text-sm font-bold text-purple-700">{question.views}</span>
            </div>
            <div className="text-xs text-purple-600">{t('views')}</div>
          </div>
        </div>

        {/* Question Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                {question.isPinned && (
                  <div className="flex items-center space-x-1 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                    <Pin className="h-3 w-3" />
                    <span>Pinned</span>
                  </div>
                )}
                {hasAcceptedAnswer && (
                  <div className="flex items-center space-x-1 bg-gradient-to-r from-green-400 to-emerald-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                    <CheckCircle className="h-3 w-3" />
                    <span>Solved</span>
                  </div>
                )}
                <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                  {question.language === 'en' ? '🇺🇸 English' : '🇮🇳 हिन्दी'}
                </span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2 leading-tight">
                {question.title}
              </h3>
            </div>
          </div>
          
          <p className="text-gray-600 mb-4 line-clamp-2 leading-relaxed">{question.content}</p>
          
          {/* Images Preview */}
          {question.images.length > 0 && (
            <div className="flex space-x-2 mb-4">
              {question.images.slice(0, 3).map((image, index) => (
                <img
                  key={index}
                  src={image}
                  alt="Question attachment"
                  className="w-20 h-20 object-cover rounded-xl border-2 border-gray-200 hover:border-blue-300 transition-colors"
                />
              ))}
              {question.images.length > 3 && (
                <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex items-center justify-center text-gray-500 text-sm font-bold border-2 border-gray-200">
                  +{question.images.length - 3}
                </div>
              )}
            </div>
          )}

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-4">
            {question.tags.map((tag, index) => (
              <span
                key={tag}
                className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium transition-all hover:scale-105 cursor-pointer ${
                  index % 5 === 0 ? 'bg-blue-100 text-blue-800 hover:bg-blue-200' :
                  index % 5 === 1 ? 'bg-purple-100 text-purple-800 hover:bg-purple-200' :
                  index % 5 === 2 ? 'bg-green-100 text-green-800 hover:bg-green-200' :
                  index % 5 === 3 ? 'bg-orange-100 text-orange-800 hover:bg-orange-200' :
                  'bg-pink-100 text-pink-800 hover:bg-pink-200'
                }`}
              >
                <Tag className="h-3 w-3 mr-1" />
                {tag}
              </span>
            ))}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between">
            {/* Author Info */}
            <div className="flex items-center space-x-3">
              <UserAvatar
                src={question.author.avatar}
                alt={question.author.name}
                size="md"
              />
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-semibold text-gray-700">{question.author.name}</span>
                  {question.author.isVerified && (
                    <div className="w-4 h-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-2.5 h-2.5 text-white" />
                    </div>
                  )}
                </div>
                <div className="text-xs text-gray-500 flex items-center space-x-1">
                  <span>{question.author.reputation} pts</span>
                </div>
              </div>
            </div>

            {/* Actions and Date */}
            <div className="flex items-center space-x-3">
              {/* Action Buttons */}
              <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-all duration-300">
                <button
                  onClick={(e) => handleAction(e, 'bookmark')}
                  className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all hover:scale-110"
                  title={t('bookmark')}
                >
                  <Bookmark className="h-4 w-4" />
                </button>
                <button
                  onClick={handleFollow}
                  className={`p-2 rounded-lg transition-all hover:scale-110 ${
                    isFollowing
                      ? 'text-red-600 bg-red-50'
                      : 'text-gray-400 hover:text-red-600 hover:bg-red-50'
                  }`}
                  title={isFollowing ? t('unfollow') : t('follow')}
                >
                  <Heart className={`h-4 w-4 ${isFollowing ? 'fill-current' : ''}`} />
                </button>
                <button
                  onClick={(e) => handleAction(e, 'share')}
                  className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all hover:scale-110"
                  title={t('share')}
                >
                  <Share2 className="h-4 w-4" />
                </button>
              </div>

              {/* Date */}
              <div className="flex items-center space-x-1 text-sm text-gray-500 bg-gray-50 px-3 py-1 rounded-full">
                <Clock className="h-4 w-4" />
                <span>{formatDate(question.createdAt)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuestionCard;