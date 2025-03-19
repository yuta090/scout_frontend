import React from 'react';

interface JobChangeCountSectionProps {
  jobChangeCount: string;
  onJobChangeCountChange: (count: string) => void;
}

const JOB_CHANGE_COUNT_OPTIONS = [
  { value: '1', label: '指定なし' },
  { value: '2', label: '1回以下' },
  { value: '3', label: '2回以下' },
  { value: '4', label: '3回以下' },
  { value: '5', label: '4回以下' },
  { value: '6', label: '5回以下' }
];

const JobChangeCountSection: React.FC<JobChangeCountSectionProps> = ({
  jobChangeCount,
  onJobChangeCountChange
}) => {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        転職回数
      </label>
      <select
        value={jobChangeCount}
        onChange={(e) => onJobChangeCountChange(e.target.value)}
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
      >
        {JOB_CHANGE_COUNT_OPTIONS.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default JobChangeCountSection;