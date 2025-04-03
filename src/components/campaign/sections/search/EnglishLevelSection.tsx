import React from 'react';

interface EnglishLevelSectionProps {
  englishLevel: string;
  onEnglishLevelChange: (level: string) => void;
}

const ENGLISH_LEVELS = [
  { value: '1', label: '指定なし' },
  { value: '5', label: '簡単な会話が可能' },
  { value: '4', label: '日常会話が可能' },
  { value: '3', label: 'ビジネス会話が可能' },
  { value: '2', label: 'ネイティブレベルで会話可能' }
];

const EnglishLevelSection: React.FC<EnglishLevelSectionProps> = ({
  englishLevel,
  onEnglishLevelChange
}) => {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        英会話レベル
      </label>
      <div className="flex items-center space-x-2">
        <select
          value={englishLevel}
          onChange={(e) => onEnglishLevelChange(e.target.value)}
          className="w-64 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        >
          {ENGLISH_LEVELS.map(level => (
            <option key={level.value} value={level.value}>
              {level.label}
            </option>
          ))}
        </select>
        <span className="text-sm text-gray-500">以上</span>
      </div>
    </div>
  );
};

export default EnglishLevelSection;