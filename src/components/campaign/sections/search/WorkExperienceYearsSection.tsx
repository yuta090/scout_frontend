import React from 'react';
import { HelpCircle } from 'lucide-react';

interface WorkExperienceYearsSectionProps {
  workExperience: {
    min: string;
    max: string;
  };
  onWorkExperienceChange: (years: { min: string; max: string }) => void;
}

const WorkExperienceYearsSection: React.FC<WorkExperienceYearsSectionProps> = ({
  workExperience,
  onWorkExperienceChange
}) => {
  return (
    <div className="space-y-2">
      <div className="flex items-center space-x-2">
        <label className="text-sm font-medium text-gray-700">
          総勤務年数（自動計算）
        </label>
        <button
          type="button"
          className="text-gray-400 hover:text-gray-500"
          title="総勤務年数は職歴から自動計算されます"
        >
          <HelpCircle className="h-5 w-5" />
        </button>
      </div>
      <div className="flex items-center space-x-2">
        <input
          type="text"
          name="candidateFilter.minimumWorkExperienceYears"
          placeholder="指定なし"
          value={workExperience.min}
          onChange={(e) => onWorkExperienceChange({
            ...workExperience,
            min: e.target.value
          })}
          className="w-28 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        />
        <span className="text-sm text-gray-500">年以上 〜</span>
        <input
          type="text"
          name="candidateFilter.maximumWorkExperienceYears"
          placeholder="指定なし"
          value={workExperience.max}
          onChange={(e) => onWorkExperienceChange({
            ...workExperience,
            max: e.target.value
          })}
          className="w-28 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        />
        <span className="text-sm text-gray-500">年以下</span>
      </div>
    </div>
  );
};

export default WorkExperienceYearsSection;