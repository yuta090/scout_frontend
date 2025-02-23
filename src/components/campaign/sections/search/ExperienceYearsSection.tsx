import React from 'react';

interface ExperienceYearsSectionProps {
  experience: {
    min: number;
    max: number;
  };
  onExperienceChange: (experience: { min: number; max: number }) => void;
}

const ExperienceYearsSection: React.FC<ExperienceYearsSectionProps> = ({
  experience,
  onExperienceChange
}) => {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        経験年数
      </label>
      <div className="flex items-center space-x-2">
        <input
          type="number"
          min="0"
          value={experience.min || ''}
          onChange={(e) => onExperienceChange({
            ...experience,
            min: parseInt(e.target.value) || 0
          })}
          placeholder="最小"
          className="w-28 px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        />
        <span className="text-gray-500">〜</span>
        <input
          type="number"
          min="0"
          value={experience.max || ''}
          onChange={(e) => onExperienceChange({
            ...experience,
            max: parseInt(e.target.value) || 0
          })}
          placeholder="最大"
          className="w-28 px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        />
        <span className="text-sm text-gray-500">年</span>
      </div>
    </div>
  );
};

export default ExperienceYearsSection;