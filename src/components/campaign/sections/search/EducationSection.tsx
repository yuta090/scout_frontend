import React from 'react';

interface EducationSectionProps {
  selectedEducation: string[];
  onEducationChange: (education: string[]) => void;
}

const educationOptions = ['高校卒', '専門学校卒', '短大卒', '大学卒', '大学院卒'];

const EducationSection: React.FC<EducationSectionProps> = ({
  selectedEducation,
  onEducationChange
}) => {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        学歴
      </label>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {educationOptions.map((edu) => (
          <label key={edu} className="relative flex items-center">
            <input
              type="checkbox"
              checked={selectedEducation.includes(edu)}
              onChange={(e) => {
                if (e.target.checked) {
                  onEducationChange([...selectedEducation, edu]);
                } else {
                  onEducationChange(selectedEducation.filter(e => e !== edu));
                }
              }}
              className="sr-only"
            />
            <div className={`
              w-full px-4 py-2.5 text-sm font-medium rounded-lg border transition-all duration-200
              ${selectedEducation.includes(edu)
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
  );
};

export default EducationSection;