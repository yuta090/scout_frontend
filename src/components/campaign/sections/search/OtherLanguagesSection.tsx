import React, { useState } from 'react';
import { Plus } from 'lucide-react';

interface OtherLanguagesSectionProps {
  languages: string[];
  onLanguagesChange: (languages: string[]) => void;
  includeAll: boolean;
  onIncludeAllChange: (includeAll: boolean) => void;
}

const LANGUAGE_OPTIONS = [
  { value: '0', label: '指定なし' },
  { value: '1', label: 'アラビア語' },
  { value: '2', label: 'イタリア語' },
  { value: '3', label: 'インドネシア語' },
  { value: '4', label: 'オランダ語' },
  { value: '5', label: '韓国語/朝鮮語' },
  { value: '6', label: '広東語' },
  { value: '7', label: 'スウェーデン語' },
  { value: '8', label: 'スペイン語' },
  { value: '9', label: 'スワヒリ語' },
  { value: '10', label: 'タイ語' },
  { value: '11', label: '台湾語' },
  { value: '12', label: 'タガログ語' },
  { value: '13', label: 'ドイツ語' },
  { value: '14', label: 'ノルウェー語' },
  { value: '15', label: 'ヒンディー語' },
  { value: '16', label: 'フィンランド語' },
  { value: '17', label: 'フランス語' },
  { value: '18', label: '北京語' },
  { value: '19', label: 'ベトナム語' },
  { value: '20', label: 'ヘブライ語' },
  { value: '21', label: 'ポルトガル語' },
  { value: '22', label: 'マレーシア語' },
  { value: '23', label: 'ロシア語' }
];

const OtherLanguagesSection: React.FC<OtherLanguagesSectionProps> = ({
  languages,
  onLanguagesChange,
  includeAll,
  onIncludeAllChange
}) => {
  const [selectedLanguage, setSelectedLanguage] = useState('0');

  const handleAddLanguage = () => {
    if (selectedLanguage === '0') return;
    if (languages.length >= 10) return;
    
    const language = LANGUAGE_OPTIONS.find(opt => opt.value === selectedLanguage);
    if (language && !languages.includes(language.label)) {
      onLanguagesChange([...languages, language.label]);
      setSelectedLanguage('0');
    }
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        その他の語学
      </label>
      <div>
        <p className="text-sm text-gray-500 mb-2">
          最大10個まで選択できます。
        </p>
        <div className="flex space-x-2">
          <select
            value={selectedLanguage}
            onChange={(e) => setSelectedLanguage(e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          >
            {LANGUAGE_OPTIONS.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={handleAddLanguage}
            disabled={selectedLanguage === '0' || languages.length >= 10}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus className="h-5 w-5" />
          </button>
        </div>

        {languages.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {languages.map((language, index) => (
              <span
                key={index}
                className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-indigo-50 text-indigo-700 border border-indigo-100"
              >
                {language}
                <button
                  type="button"
                  onClick={() => onLanguagesChange(languages.filter((_, i) => i !== index))}
                  className="ml-2 text-indigo-400 hover:text-indigo-600"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}

        <div className="mt-4 flex bg-gray-100 p-1 rounded-lg">
          <button
            type="button"
            onClick={() => onIncludeAllChange(true)}
            className={`
              flex-1 px-4 py-2 text-sm font-medium rounded-md transition-all duration-200
              ${includeAll
                ? 'bg-white text-indigo-700 shadow-sm'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }
            `}
          >
            いずれかを含む
          </button>
          <button
            type="button"
            onClick={() => onIncludeAllChange(false)}
            className={`
              flex-1 px-4 py-2 text-sm font-medium rounded-md transition-all duration-200
              ${!includeAll
                ? 'bg-white text-indigo-700 shadow-sm'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }
            `}
          >
            すべて含む
          </button>
        </div>
      </div>
    </div>
  );
};

export default OtherLanguagesSection;