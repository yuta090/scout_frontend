import React, { useState } from 'react';
import { Search, X } from 'lucide-react';

interface KeywordSearchSectionProps {
  keywords: string[];
  onKeywordsChange: (keywords: string[]) => void;
}

const KeywordSearchSection: React.FC<KeywordSearchSectionProps> = ({
  keywords,
  onKeywordsChange
}) => {
  const [keyword, setKeyword] = useState('');

  const handleAddKeyword = () => {
    if (keyword.trim() && !keywords.includes(keyword.trim())) {
      onKeywordsChange([...keywords, keyword.trim()]);
      setKeyword('');
    }
  };

  const handleRemoveKeyword = (keywordToRemove: string) => {
    onKeywordsChange(keywords.filter(k => k !== keywordToRemove));
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        フリーワード検索
      </label>
      <div className="space-y-3">
        <div className="flex items-center space-x-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddKeyword();
                }
              }}
              placeholder="キーワードを入力..."
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <button
            onClick={handleAddKeyword}
            disabled={!keyword.trim()}
            className="px-4 py-2.5 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm transition-colors duration-200"
          >
            追加
          </button>
        </div>
        {keywords.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {keywords.map((kw, index) => (
              <span
                key={index}
                className="inline-flex items-center px-3 py-1.5 rounded-full text-sm bg-indigo-50 text-indigo-800 border border-indigo-100"
              >
                {kw}
                <button
                  onClick={() => handleRemoveKeyword(kw)}
                  className="ml-2 text-indigo-600 hover:text-indigo-800"
                >
                  <X className="h-4 w-4" />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default KeywordSearchSection;