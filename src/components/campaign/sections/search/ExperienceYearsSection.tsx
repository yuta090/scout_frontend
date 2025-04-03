import React from 'react';

interface ExperienceYearsSectionProps {
  experience: {
    min: number;
    max: number;
  };
  onExperienceChange: (experience: { min: number; max: number }) => void;
}

const EXPERIENCE_YEARS_OPTIONS = [
  { value: 6, label: '指定なし' },
  { value: 1, label: '1年' },
  { value: 2, label: '3年' },
  { value: 3, label: '5年' },
  { value: 4, label: '10年' },
  { value: 5, label: '20年' }
];

const ExperienceYearsSection: React.FC<ExperienceYearsSectionProps> = ({
  experience,
  onExperienceChange
}) => {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        経験職種の経験年数
      </label>
      <div className="flex items-center space-x-2">
        <select
          name="candidateFilter.minExpYearsId"
          value={experience.min}
          onChange={(e) => onExperienceChange({
            ...experience,
            min: parseInt(e.target.value)
          })}
          className="w-32 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        >
          {EXPERIENCE_YEARS_OPTIONS.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <span className="text-sm text-gray-500">〜</span>
        <select
          name="candidateFilter.maxExpYearsId"
          value={experience.max}
          onChange={(e) => onExperienceChange({
            ...experience,
            max: parseInt(e.target.value)
          })}
          className="w-32 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        >
          {EXPERIENCE_YEARS_OPTIONS.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default ExperienceYearsSection;