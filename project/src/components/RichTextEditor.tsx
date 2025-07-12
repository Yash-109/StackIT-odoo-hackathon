import React, { useState } from 'react';
import { 
  Bold, Italic, Underline, Strikethrough, 
  List, ListOrdered, Link, Image, Smile,
  AlignLeft, AlignCenter, AlignRight, AlignJustify,
  Type, Palette
} from 'lucide-react';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  onImageUpload?: (files: File[]) => void;
  minHeight?: string;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  placeholder,
  onImageUpload,
  minHeight = 'h-40'
}) => {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showFontSizeMenu, setShowFontSizeMenu] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);

  const emojis = [
    '😀', '😊', '😍', '🤔', '👍', '👎', '❤️', '🔥', '💡', '✅', '❌', '⚡',
    '🎉', '🚀', '💯', '🤝', '👏', '🙏', '💪', '🎯', '📚', '💻', '🌟', '⭐'
  ];

  const fontSizes = ['12px', '14px', '16px', '18px', '20px', '24px', '28px', '32px'];
  const colors = [
    '#000000', '#333333', '#666666', '#999999', '#CCCCCC',
    '#FF0000', '#FF6600', '#FFCC00', '#00FF00', '#0066FF',
    '#6600FF', '#FF0066', '#00FFFF', '#FF00FF', '#FFFF00'
  ];

  const insertText = (text: string) => {
    onChange(value + text);
  };

  const insertEmoji = (emoji: string) => {
    insertText(emoji);
    setShowEmojiPicker(false);
  };

  const insertLink = () => {
    const url = prompt('Enter URL:');
    const text = prompt('Enter link text:');
    if (url && text) {
      insertText(`[${text}](${url})`);
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (onImageUpload) {
      onImageUpload(files);
    }
  };

  const formatText = (format: string) => {
    const selection = window.getSelection();
    if (selection && selection.toString()) {
      const selectedText = selection.toString();
      let formattedText = '';
      
      switch (format) {
        case 'bold':
          formattedText = `**${selectedText}**`;
          break;
        case 'italic':
          formattedText = `*${selectedText}*`;
          break;
        case 'underline':
          formattedText = `<u>${selectedText}</u>`;
          break;
        case 'strikethrough':
          formattedText = `~~${selectedText}~~`;
          break;
        default:
          formattedText = selectedText;
      }
      
      const newValue = value.replace(selectedText, formattedText);
      onChange(newValue);
    }
  };

  return (
    <div className="border border-gray-300 rounded-lg overflow-hidden bg-white">
      {/* Toolbar */}
      <div className="bg-gray-50 border-b border-gray-200 p-3">
        <div className="flex flex-wrap items-center gap-1">
          {/* Text Formatting */}
          <div className="flex items-center border-r border-gray-300 pr-2 mr-2">
            <button
              type="button"
              onClick={() => formatText('bold')}
              className="p-2 hover:bg-gray-200 rounded transition-colors"
              title="Bold"
            >
              <Bold className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => formatText('italic')}
              className="p-2 hover:bg-gray-200 rounded transition-colors"
              title="Italic"
            >
              <Italic className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => formatText('underline')}
              className="p-2 hover:bg-gray-200 rounded transition-colors"
              title="Underline"
            >
              <Underline className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => formatText('strikethrough')}
              className="p-2 hover:bg-gray-200 rounded transition-colors"
              title="Strikethrough"
            >
              <Strikethrough className="h-4 w-4" />
            </button>
          </div>

          {/* Lists */}
          <div className="flex items-center border-r border-gray-300 pr-2 mr-2">
            <button
              type="button"
              onClick={() => insertText('\n• ')}
              className="p-2 hover:bg-gray-200 rounded transition-colors"
              title="Bullet List"
            >
              <List className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => insertText('\n1. ')}
              className="p-2 hover:bg-gray-200 rounded transition-colors"
              title="Numbered List"
            >
              <ListOrdered className="h-4 w-4" />
            </button>
          </div>

          {/* Alignment */}
          <div className="flex items-center border-r border-gray-300 pr-2 mr-2">
            <button
              type="button"
              className="p-2 hover:bg-gray-200 rounded transition-colors"
              title="Align Left"
            >
              <AlignLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              className="p-2 hover:bg-gray-200 rounded transition-colors"
              title="Align Center"
            >
              <AlignCenter className="h-4 w-4" />
            </button>
            <button
              type="button"
              className="p-2 hover:bg-gray-200 rounded transition-colors"
              title="Align Right"
            >
              <AlignRight className="h-4 w-4" />
            </button>
            <button
              type="button"
              className="p-2 hover:bg-gray-200 rounded transition-colors"
              title="Justify"
            >
              <AlignJustify className="h-4 w-4" />
            </button>
          </div>

          {/* Font Size */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowFontSizeMenu(!showFontSizeMenu)}
              className="p-2 hover:bg-gray-200 rounded transition-colors"
              title="Font Size"
            >
              <Type className="h-4 w-4" />
            </button>
            {showFontSizeMenu && (
              <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg p-2 z-10 min-w-[80px]">
                {fontSizes.map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => {
                      insertText(`<span style="font-size: ${size}">`);
                      setShowFontSizeMenu(false);
                    }}
                    className="block w-full text-left px-2 py-1 hover:bg-gray-100 rounded text-sm"
                  >
                    {size}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Text Color */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowColorPicker(!showColorPicker)}
              className="p-2 hover:bg-gray-200 rounded transition-colors"
              title="Text Color"
            >
              <Palette className="h-4 w-4" />
            </button>
            {showColorPicker && (
              <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg p-2 z-10">
                <div className="grid grid-cols-5 gap-1">
                  {colors.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => {
                        insertText(`<span style="color: ${color}">`);
                        setShowColorPicker(false);
                      }}
                      className="w-6 h-6 rounded border border-gray-300 hover:scale-110 transition-transform"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Link */}
          <button
            type="button"
            onClick={insertLink}
            className="p-2 hover:bg-gray-200 rounded transition-colors"
            title="Insert Link"
          >
            <Link className="h-4 w-4" />
          </button>

          {/* Image */}
          <label className="p-2 hover:bg-gray-200 rounded transition-colors cursor-pointer" title="Insert Image">
            <Image className="h-4 w-4" />
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
          </label>

          {/* Emoji */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="p-2 hover:bg-gray-200 rounded transition-colors"
              title="Insert Emoji"
            >
              <Smile className="h-4 w-4" />
            </button>
            {showEmojiPicker && (
              <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg p-3 z-10 w-64">
                <div className="grid grid-cols-8 gap-1">
                  {emojis.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => insertEmoji(emoji)}
                      className="p-1 hover:bg-gray-100 rounded text-lg transition-colors"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Text Area */}
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full ${minHeight} p-4 resize-none focus:outline-none text-gray-900 leading-relaxed`}
        style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}
      />
    </div>
  );
};

export default RichTextEditor;