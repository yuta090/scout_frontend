import React from 'react';

interface ManagementCountSectionProps {
  managementCount: string;
  onManagementCountChange: (count: string) => void;
}

const MANAGEMENT_COUNT_OPTIONS = [
  { value: '1', label: '指定なし' },
  { value: '2', label: '1人以上' },
  { value: '3', label: '5人以上' },
  { value: '4', label: '10人以上' },
  { value: '5', label: '30人以上' },
  { value: '6', label: '100人以上' },
  { value: '7', label: '500人以上' },
  { value: '8', label: '1,000人以上' }
];

const ManagementCountSection: React.FC<ManagementCountSectionProps> = ({
  managementCount,
  onManagementCountChange
}) => {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        マネジメント経験人数
      </label>
      <select
        value={managementCount}
        onChange={(e) => onManagementCountChange(e.target.value)}
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
      >
        {MANAGEMENT_COUNT_OPTIONS.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default ManagementCountSection;