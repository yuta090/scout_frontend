import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Search, X } from 'lucide-react';

interface AdvancedSearchSectionProps {
  onSearch?: (criteria: AdvancedSearchCriteria) => void;
}

export interface AdvancedSearchCriteria {
  keywords: string[];
  experience: {
    min: number;
    max: number;
  };
  education: string[];
  skills: string[];
  certifications: string[];
}

const AdvancedSearchSection: React.FC<AdvancedSearchSectionProps> = ({ onSearch }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [criteria, setCriteria] = useState<AdvancedSearchCriteria>({
    keywords: [],
    experience: { min: 0, max: 0 },
    education: [],
    skills: [],
    certifications: []
  });
  const [keyword, setKeyword] = useState('');

  const handleAddKeyword = () => {
    if (keyword.trim() && !criteria.keywords.includes(keyword.trim())) {
      setCriteria({
        ...criteria,
        keywords: [...criteria.keywords, keyword.trim()]
      });
      setKeyword('');
    }
  };

  const handleRemoveKeyword = (keywordToRemove: string) => {
    setCriteria({
      ...criteria,
      keywords: criteria.keywords.filter(k => k !== keywordToRemove)
    });
  };

  return (
    <div className="space-y-4">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between px-4 py-2.5 bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-gray-50 transition-all duration-200"
        style={{
          background: 'linear-gradient(to bottom, #ffffff, #f8f9fa)'
        }}
      >
        <div className="flex items-center space-x-2">
          <Search className="h-5 w-5 text-gray-600" />
          <span className="font-medium text-gray-800">詳細検索</span>
        </div>
        <div className="flex items-center space-x-2">
          {criteria.keywords.length > 0 && (
            <span className="text-sm text-indigo-600">
              {criteria.keywords.length}件の条件
            </span>
          )}
          {isExpanded ? (
            <ChevronUp className="h-5 w-5 text-gray-500" />
          ) : (
            <ChevronDown className="h-5 w-5 text-gray-500" />
          )}
        </div>
      </button>

      {isExpanded && (
        <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-6 space-y-6 animate-slideDown">
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
              {criteria.keywords.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {criteria.keywords.map((kw, index) => (
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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              経験年数
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="number"
                min="0"
                value={criteria.experience.min || ''}
                onChange={(e) => setCriteria({
                  ...criteria,
                  experience: {
                    ...criteria.experience,
                    min: parseInt(e.target.value) || 0
                  }
                })}
                placeholder="最小"
                className="w-28 px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
              <span className="text-gray-500">〜</span>
              <input
                type="number"
                min="0"
                value={criteria.experience.max || ''}
                onChange={(e) => setCriteria({
                  ...criteria,
                  experience: {
                    ...criteria.experience,
                    max: parseInt(e.target.value) || 0
                  }
                })}
                placeholder="最大"
                className="w-28 px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
              <span className="text-sm text-gray-500">年</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              学歴
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {['高校卒', '専門学校卒', '短大卒', '大学卒', '大学院卒'].map((edu) => (
                <label key={edu} className="relative flex items-center">
                  <input
                    type="checkbox"
                    checked={criteria.education.includes(edu)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setCriteria({
                          ...criteria,
                          education: [...criteria.education, edu]
                        });
                      } else {
                        setCriteria({
                          ...criteria,
                          education: criteria.education.filter(e => e !== edu)
                        });
                      }
                    }}
                    className="sr-only"
                  />
                  <div className={`
                    w-full px-4 py-2.5 text-sm font-medium rounded-lg border transition-all duration-200
                    ${criteria.education.includes(edu)
                      ? 'bg-indigo-50 border-indigo-200 text-indigo-700'
                      : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                    }
                  `}>
                    {edu}
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div className="flex justify-end space-x-4 pt-6 border-t">
            <button
              onClick={() => {
                setCriteria({
                  keywords: [],
                  experience: { min: 0, max: 0 },
                  education: [],
                  skills: [],
                  certifications: []
                });
                setKeyword('');
              }}
              className="px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 shadow-sm transition-colors duration-200"
            >
              クリア
            </button>
            <button
              onClick={() => onSearch?.(criteria)}
              className="px-4 py-2.5 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-lg hover:bg-indigo-700 shadow-sm transition-colors duration-200"
            >
              検索条件を適用
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdvancedSearchSection;