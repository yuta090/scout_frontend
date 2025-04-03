import React from 'react';

interface EmploymentStatusSectionProps {
  employmentStatus: string | null;
  onEmploymentStatusChange: (status: string | null) => void;
}

const EMPLOYMENT_STATUS_OPTIONS = [
  { value: null, label: '問わない' },
  { value: 'true', label: '現職' },
  { value: 'false', label: '離職' }
];

const EmploymentStatusSection: React.FC<EmploymentStatusSectionProps> = ({
  employmentStatus,
  onEmploymentStatusChange
}) => {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        就労状況
      </label>
      <div className="flex bg-gray-100 p-1 rounded-lg">
        {EMPLOYMENT_STATUS_OPTIONS.map(option => (
          <button
            key={String(option.value)}
            type="button"
            onClick={() => onEmploymentStatusChange(option.value)}
            className={`
              flex-1 px-4 py-2 text-sm font-medium rounded-md transition-all duration-200
              ${employmentStatus === option.value
                ? 'bg-white text-indigo-700 shadow-sm'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }
            `}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default EmploymentStatusSection;