import React, { useState } from 'react';

interface ExperienceSearchSectionProps {
  experiences: string[];
  onExperiencesChange: (experiences: string[]) => void;
}

const ExperienceSearchSection: React.FC<ExperienceSearchSectionProps> = ({
  experiences,
  onExperiencesChange
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const handleAddExperience = (experience: string) => {
    if (experiences.length >= 10) return;
    if (!experiences.includes(experience)) {
      onExperiencesChange([...experiences, experience]);
    }
    setSearchTerm('');
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        経験
      </label>
      <div>
        <div className="relative">
          <input
            type="text"
            placeholder="経験を検索する"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && searchTerm.trim()) {
                e.preventDefault();
                handleAddExperience(searchTerm.trim());
              }
            }}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
        <p className="mt-2 text-sm text-gray-500">
          最大10個まで設定できます。
        </p>
        {experiences.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {experiences.map((experience, index) => (
              <span
                key={index}
                className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-indigo-50 text-indigo-700 border border-indigo-100"
              >
                {experience}
                <button
                  type="button"
                  onClick={() => onExperiencesChange(experiences.filter((_, i) => i !== index))}
                  className="ml-2 text-indigo-400 hover:text-indigo-600"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ExperienceSearchSection;