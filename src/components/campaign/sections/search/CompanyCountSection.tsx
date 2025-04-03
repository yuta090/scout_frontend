import React from 'react';

interface CompanyCountSectionProps {
  companyCount: string;
  onCompanyCountChange: (count: string) => void;
}

const COMPANY_COUNT_OPTIONS = [
  { value: '1', label: '1社以下' },
  { value: '2', label: '2社以下' },
  { value: '3', label: '3社以下' },
  { value: '4', label: '4社以下' },
  { value: '5', label: '5社以下' },
  { value: '6', label: '指定なし' }
];

const CompanyCountSection: React.FC<CompanyCountSectionProps> = ({
  companyCount,
  onCompanyCountChange
}) => {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        経験社数
      </label>
      <select
        value={companyCount}
        onChange={(e) => onCompanyCountChange(e.target.value)}
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
      >
        {COMPANY_COUNT_OPTIONS.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default CompanyCountSection;