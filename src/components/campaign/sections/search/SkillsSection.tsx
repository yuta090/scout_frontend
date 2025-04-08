import React, { useState } from 'react';

interface SkillsSectionProps {
  skills: string[];
  onSkillsChange: (skills: string[]) => void;
}

const SkillsSection: React.FC<SkillsSectionProps> = ({
  skills,
  onSkillsChange
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const handleAddSkill = (skill: string) => {
    if (skills.length >= 10) return;
    if (!skills.includes(skill)) {
      onSkillsChange([...skills, skill]);
    }
    setSearchTerm('');
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        スキル
      </label>
      <div>
        <div className="relative">
          <input
            type="text"
            placeholder="スキルを検索する"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && searchTerm.trim()) {
                e.preventDefault();
                handleAddSkill(searchTerm.trim());
              }
            }}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
        <p className="mt-2 text-sm text-gray-500">
          最大10個まで設定できます。
        </p>
        {skills.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {skills.map((skill, index) => (
              <span
                key={index}
                className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-indigo-50 text-indigo-700 border border-indigo-100"
              >
                {skill}
                <button
                  type="button"
                  onClick={() => onSkillsChange(skills.filter((_, i) => i !== index))}
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

export default SkillsSection;