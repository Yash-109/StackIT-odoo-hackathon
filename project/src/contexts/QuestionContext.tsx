import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Question, Answer } from '../types';
import { mockQuestions } from '../data/mockData';
import { useAuth } from './AuthContext';
import { useNotifications } from './NotificationContext';

interface QuestionContextType {
  questions: Question[];
  addQuestion: (question: Omit<Question, 'id' | 'createdAt' | 'updatedAt' | 'votes' | 'upvotes' | 'downvotes' | 'views' | 'followers'>) => void;
  updateQuestion: (questionId: string, updates: Partial<Question>) => void;
  voteQuestion: (questionId: string, voteType: 'up' | 'down') => void;
  addAnswer: (questionId: string, answer: Omit<Answer, 'id' | 'createdAt' | 'updatedAt' | 'votes' | 'upvotes' | 'downvotes' | 'comments'>) => void;
  voteAnswer: (questionId: string, answerId: string, voteType: 'up' | 'down') => void;
  acceptAnswer: (questionId: string, answerId: string) => void;
  followQuestion: (questionId: string) => void;
  getFilteredQuestions: (filter: string, language?: 'en' | 'hi' | 'both') => Question[];
}

const QuestionContext = createContext<QuestionContextType | undefined>(undefined);

export const useQuestions = () => {
  const context = useContext(QuestionContext);
  if (!context) {
    throw new Error('useQuestions must be used within a QuestionProvider');
  }
  return context;
};

interface QuestionProviderProps {
  children: ReactNode;
}

export const QuestionProvider: React.FC<QuestionProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const { addNotification } = useNotifications();
  const [questions, setQuestions] = useState<Question[]>(mockQuestions);

  const addQuestion = (questionData: Omit<Question, 'id' | 'createdAt' | 'updatedAt' | 'votes' | 'upvotes' | 'downvotes' | 'views' | 'followers'>) => {
    const newQuestion: Question = {
      ...questionData,
      id: Date.now().toString(),
      votes: 0,
      upvotes: [],
      downvotes: [],
      views: 0,
      followers: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setQuestions(prev => [newQuestion, ...prev]);
  };

  const updateQuestion = (questionId: string, updates: Partial<Question>) => {
    setQuestions(prev => prev.map(q => 
      q.id === questionId 
        ? { ...q, ...updates, updatedAt: new Date().toISOString() }
        : q
    ));
  };

  const voteQuestion = (questionId: string, voteType: 'up' | 'down') => {
    if (!user) return;

    setQuestions(prev => prev.map(question => {
      if (question.id !== questionId) return question;

      const upvotes = [...question.upvotes];
      const downvotes = [...question.downvotes];
      
      // Remove user from both arrays first
      const upIndex = upvotes.indexOf(user.id);
      const downIndex = downvotes.indexOf(user.id);
      
      if (upIndex > -1) upvotes.splice(upIndex, 1);
      if (downIndex > -1) downvotes.splice(downIndex, 1);

      // Add to appropriate array if not already there
      if (voteType === 'up' && !upvotes.includes(user.id)) {
        upvotes.push(user.id);
      } else if (voteType === 'down' && !downvotes.includes(user.id)) {
        downvotes.push(user.id);
      }

      const votes = upvotes.length - downvotes.length;

      // Notify question author if it's an upvote from someone else
      if (voteType === 'up' && question.author.id !== user.id && !question.upvotes.includes(user.id)) {
        addNotification({
          type: 'vote',
          title: 'Question Upvoted',
          message: `${user.name} upvoted your question: "${question.title}"`,
          userId: question.author.id,
          fromUser: user,
          relatedId: questionId,
          isRead: false
        });
      }

      return {
        ...question,
        votes,
        upvotes,
        downvotes,
        updatedAt: new Date().toISOString()
      };
    }));
  };

  const addAnswer = (questionId: string, answerData: Omit<Answer, 'id' | 'createdAt' | 'updatedAt' | 'votes' | 'upvotes' | 'downvotes' | 'comments'>) => {
    const newAnswer: Answer = {
      ...answerData,
      id: Date.now().toString(),
      votes: 0,
      upvotes: [],
      downvotes: [],
      comments: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setQuestions(prev => prev.map(question => {
      if (question.id !== questionId) return question;

      // Notify question author
      if (question.author.id !== newAnswer.author.id) {
        addNotification({
          type: 'answer',
          title: 'New Answer',
          message: `${newAnswer.author.name} answered your question: "${question.title}"`,
          userId: question.author.id,
          fromUser: newAnswer.author,
          relatedId: questionId,
          isRead: false
        });
      }

      // Notify followers
      question.followers.forEach(followerId => {
        if (followerId !== newAnswer.author.id) {
          addNotification({
            type: 'answer',
            title: 'New Answer on Followed Question',
            message: `${newAnswer.author.name} answered a question you follow: "${question.title}"`,
            userId: followerId,
            fromUser: newAnswer.author,
            relatedId: questionId,
            isRead: false
          });
        }
      });

      return {
        ...question,
        answers: [...question.answers, newAnswer],
        updatedAt: new Date().toISOString()
      };
    }));
  };

  const voteAnswer = (questionId: string, answerId: string, voteType: 'up' | 'down') => {
    if (!user) return;

    setQuestions(prev => prev.map(question => {
      if (question.id !== questionId) return question;

      const updatedAnswers = question.answers.map(answer => {
        if (answer.id !== answerId) return answer;

        const upvotes = [...answer.upvotes];
        const downvotes = [...answer.downvotes];
        
        // Remove user from both arrays first
        const upIndex = upvotes.indexOf(user.id);
        const downIndex = downvotes.indexOf(user.id);
        
        if (upIndex > -1) upvotes.splice(upIndex, 1);
        if (downIndex > -1) downvotes.splice(downIndex, 1);

        // Add to appropriate array if not already there
        if (voteType === 'up' && !upvotes.includes(user.id)) {
          upvotes.push(user.id);
        } else if (voteType === 'down' && !downvotes.includes(user.id)) {
          downvotes.push(user.id);
        }

        const votes = upvotes.length - downvotes.length;

        // Notify answer author if it's an upvote from someone else
        if (voteType === 'up' && answer.author.id !== user.id && !answer.upvotes.includes(user.id)) {
          addNotification({
            type: 'vote',
            title: 'Answer Upvoted',
            message: `${user.name} upvoted your answer`,
            userId: answer.author.id,
            fromUser: user,
            relatedId: questionId,
            isRead: false
          });
        }

        return {
          ...answer,
          votes,
          upvotes,
          downvotes,
          updatedAt: new Date().toISOString()
        };
      });

      return {
        ...question,
        answers: updatedAnswers,
        updatedAt: new Date().toISOString()
      };
    }));
  };

  const acceptAnswer = (questionId: string, answerId: string) => {
    if (!user) return;

    setQuestions(prev => prev.map(question => {
      if (question.id !== questionId || question.author.id !== user.id) return question;

      const updatedAnswers = question.answers.map(answer => ({
        ...answer,
        isAccepted: answer.id === answerId,
        updatedAt: new Date().toISOString()
      }));

      // Notify the answer author
      const acceptedAnswer = updatedAnswers.find(a => a.id === answerId);
      if (acceptedAnswer && acceptedAnswer.author.id !== user.id) {
        addNotification({
          type: 'answer',
          title: 'Answer Accepted',
          message: `${user.name} accepted your answer to: "${question.title}"`,
          userId: acceptedAnswer.author.id,
          fromUser: user,
          relatedId: questionId,
          isRead: false
        });
      }

      return {
        ...question,
        answers: updatedAnswers,
        updatedAt: new Date().toISOString()
      };
    }));
  };

  const followQuestion = (questionId: string) => {
    if (!user) return;

    setQuestions(prev => prev.map(question => {
      if (question.id !== questionId) return question;

      const followers = [...question.followers];
      const isFollowing = followers.includes(user.id);

      if (isFollowing) {
        const index = followers.indexOf(user.id);
        followers.splice(index, 1);
      } else {
        followers.push(user.id);
        
        // Notify question author
        if (question.author.id !== user.id) {
          addNotification({
            type: 'follow',
            title: 'Question Followed',
            message: `${user.name} started following your question: "${question.title}"`,
            userId: question.author.id,
            fromUser: user,
            relatedId: questionId,
            isRead: false
          });
        }
      }

      return {
        ...question,
        followers,
        updatedAt: new Date().toISOString()
      };
    }));
  };

  const getFilteredQuestions = (filter: string, language: 'en' | 'hi' | 'both' = 'both') => {
    let filtered = [...questions];

    // Filter by language
    if (language !== 'both') {
      filtered = filtered.filter(q => q.language === language);
    }

    // Filter by category
    switch (filter) {
      case 'recent':
        filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case 'popular':
        filtered = filtered.filter(q => q.votes >= 10).sort((a, b) => b.votes - a.votes);
        break;
      case 'trending':
        // Questions with high activity in last 24 hours
        const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        filtered = filtered.filter(q => {
          const questionDate = new Date(q.createdAt);
          const hasRecentActivity = questionDate > oneDayAgo || 
            q.answers.some(a => new Date(a.createdAt) > oneDayAgo);
          return hasRecentActivity && (q.votes > 5 || q.views > 50);
        }).sort((a, b) => (b.votes + b.views + b.answers.length) - (a.votes + a.views + a.answers.length));
        break;
      case 'unanswered':
        filtered = filtered.filter(q => q.answers.length === 0);
        break;
      case 'answered':
        filtered = filtered.filter(q => q.answers.length > 0);
        break;
      case 'my':
        filtered = user ? filtered.filter(q => q.author.id === user.id) : [];
        break;
      case 'followed':
        filtered = user ? filtered.filter(q => q.followers.includes(user.id)) : [];
        break;
      default:
        // All questions, sorted by recent activity
        filtered.sort((a, b) => {
          const aLatest = Math.max(
            new Date(a.updatedAt).getTime(),
            ...a.answers.map(ans => new Date(ans.updatedAt).getTime())
          );
          const bLatest = Math.max(
            new Date(b.updatedAt).getTime(),
            ...b.answers.map(ans => new Date(ans.updatedAt).getTime())
          );
          return bLatest - aLatest;
        });
    }

    return filtered;
  };

  // Simulate view increment when questions are accessed
  const incrementViews = (questionId: string) => {
    setQuestions(prev => prev.map(q => 
      q.id === questionId 
        ? { ...q, views: q.views + 1 }
        : q
    ));
  };

  const value: QuestionContextType = {
    questions,
    addQuestion,
    updateQuestion,
    voteQuestion,
    addAnswer,
    voteAnswer,
    acceptAnswer,
    followQuestion,
    getFilteredQuestions
  };

  return (
    <QuestionContext.Provider value={value}>
      {children}
    </QuestionContext.Provider>
  );
};