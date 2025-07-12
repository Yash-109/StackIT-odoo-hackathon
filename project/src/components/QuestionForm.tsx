import React, { useState } from 'react';
import { X, AlertTriangle, Tag, Eye } from 'lucide-react';
import { useLanguage } from '../hooks/useLanguage';
import { useAuth } from '../contexts/AuthContext';
import RichTextEditor from './RichTextEditor';
import ImageUpload from './ImageUpload';

interface QuestionFormProps {
  onClose: () => void;
  onSubmit: (question: { title: string; content: string; tags: string[]; images: string[] }) => void;
}

const QuestionForm: React.FC<QuestionFormProps> = ({ onClose, onSubmit }) => {
  const { t, currentLanguage } = useLanguage();
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [showGuidelines, setShowGuidelines] = useState(true);
  const [showPreview, setShowPreview] = useState(false);

  const popularTags = [
    'javascript', 'react', 'nodejs', 'python', 'html', 'css', 'typescript',
    'programming', 'web-development', 'database', 'api', 'frontend', 'backend'
  ];

  const handleTagAdd = (tag: string) => {
    const trimmedTag = tag.trim().toLowerCase();
    if (trimmedTag && !tags.includes(trimmedTag) && tags.length < 5) {
      setTags([...tags, trimmedTag]);
      setTagInput('');
    }
  };

  const handleTagRemove = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleTagInputKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      handleTagAdd(tagInput);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim() || tags.length === 0) {
      alert('Please fill in all required fields and add at least one tag.');
      return;
    }

    onSubmit({ title, content, tags, images });
    onClose();
  };

  const handleImageUpload = (files: File[]) => {
    // In a real app, you would upload these files to a server
    // For now, we'll create object URLs for preview
    const newImages = files.map(file => URL.createObjectURL(file));
    setImages([...images, ...newImages]);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white z-10">
          <h2 className="text-2xl font-bold text-gray-900">{t('askQuestion')}</h2>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setShowPreview(!showPreview)}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <Eye className="h-4 w-4" />
              <span>{t('preview')}</span>
            </button>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Guidelines Alert */}
        {showGuidelines && (
          <div className="m-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="font-medium text-yellow-800 mb-1">{t('guidelines')}</h3>
                <p className="text-sm text-yellow-700">{t('guidelinesText')}</p>
              </div>
              <button
                onClick={() => setShowGuidelines(false)}
                className="text-yellow-600 hover:text-yellow-800"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        <div className="flex">
          {/* Form */}
          <div className={`${showPreview ? 'w-1/2' : 'w-full'} transition-all duration-300`}>
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('title')} *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={t('titlePlaceholder')}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  required
                />
              </div>

              {/* Content */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('description')} *
                </label>
                <RichTextEditor
                  value={content}
                  onChange={setContent}
                  placeholder={t('descriptionPlaceholder')}
                  onImageUpload={handleImageUpload}
                  minHeight="h-48"
                />
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('tags')} * (1-5 tags)
                </label>
                
                {/* Tag Input */}
                <div className="flex flex-wrap gap-2 p-3 border border-gray-300 rounded-lg focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent">
                  {tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                    >
                      <Tag className="h-3 w-3 mr-1" />
                      {tag}
                      <button
                        type="button"
                        onClick={() => handleTagRemove(tag)}
                        className="ml-2 text-blue-600 hover:text-blue-800"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                  {tags.length < 5 && (
                    <input
                      type="text"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyPress={handleTagInputKeyPress}
                      placeholder={tags.length === 0 ? t('tagsPlaceholder') : 'Add another tag...'}
                      className="flex-1 min-w-[120px] outline-none"
                    />
                  )}
                </div>

                {/* Popular Tags */}
                <div className="mt-3">
                  <p className="text-sm text-gray-600 mb-2">Popular tags:</p>
                  <div className="flex flex-wrap gap-2">
                    {popularTags.slice(0, 8).map((tag) => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => handleTagAdd(tag)}
                        disabled={tags.includes(tag) || tags.length >= 5}
                        className="px-2 py-1 text-xs border border-gray-300 rounded-full hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('uploadImages')}
                </label>
                <ImageUpload images={images} onImagesChange={setImages} />
              </div>

              {/* Language Indicator */}
              <div className="flex items-center space-x-2 text-sm text-gray-500 bg-gray-50 p-3 rounded-lg">
                <span>Question will be posted in:</span>
                <span className="font-medium text-gray-700">
                  {currentLanguage === 'en' ? 'English' : 'हिन्दी'}
                </span>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end space-x-4 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  {t('cancel')}
                </button>
                <button
                  type="button"
                  className="px-6 py-2 text-blue-600 hover:text-blue-800 transition-colors"
                >
                  {t('saveAsDraft')}
                </button>
                <button
                  type="submit"
                  disabled={!title.trim() || !content.trim() || tags.length === 0}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {t('publishQuestion')}
                </button>
              </div>
            </form>
          </div>

          {/* Preview */}
          {showPreview && (
            <div className="w-1/2 border-l border-gray-200 p-6 bg-gray-50">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Preview</h3>
              <div className="bg-white rounded-lg p-6 border border-gray-200">
                {title && (
                  <h2 className="text-xl font-bold text-gray-900 mb-4">{title}</h2>
                )}
                {content && (
                  <div className="prose max-w-none mb-4">
                    <div dangerouslySetInnerHTML={{ __html: content.replace(/\n/g, '<br>') }} />
                  </div>
                )}
                {images.length > 0 && (
                  <div className="grid grid-cols-2 gap-2 mb-4">
                    {images.map((image, index) => (
                      <img
                        key={index}
                        src={image}
                        alt={`Preview ${index + 1}`}
                        className="rounded-lg border max-w-full h-auto"
                      />
                    ))}
                  </div>
                )}
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                      >
                        <Tag className="h-3 w-3 mr-1" />
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuestionForm;