import React, { useState } from 'react';
import { Search } from 'lucide-react';

interface CompanySearchSectionProps {
  companies: string[];
  onCompaniesChange: (companies: string[]) => void;
  recentOnly: boolean;
  onRecentOnlyChange: (checked: boolean) => void;
  exclude: boolean;
  onExcludeChange: (checked: boolean) => void;
}

const CompanySearchSection: React.FC<CompanySearchSectionProps> = ({
  companies,
  onCompaniesChange,
  recentOnly,
  onRecentOnlyChange,
  exclude,
  onExcludeChange
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const handleAddCompany = (company: string) => {
    if (companies.length >= 10) return;
    if (!companies.includes(company)) {
      onCompaniesChange([...companies, company]);
    }
    setSearchTerm('');
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        企業名
      </label>
      <div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="例）株式会社〇〇（複数入力可）"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && searchTerm.trim()) {
                e.preventDefault();
                handleAddCompany(searchTerm.trim());
              }
            }}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
        <p className="mt-2 text-sm text-gray-500">
          最大10個まで設定できます。
        </p>
        {companies.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {companies.map((company, index) => (
              <span
                key={index}
                className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-indigo-50 text-indigo-700 border border-indigo-100"
              >
                {company}
                <button
                  type="button"
                  onClick={() => onCompaniesChange(companies.filter((_, i) => i !== index))}
                  className="ml-2 text-indigo-400 hover:text-indigo-600"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
        <div className="mt-4 space-x-4">
          <label className="inline-flex items-center">
            <input
              type="checkbox"
              checked={recentOnly}
              onChange={(e) => onRecentOnlyChange(e.target.checked)}
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            />
            <span className="ml-2 text-sm text-gray-700">直近のみ</span>
          </label>
          <label className="inline-flex items-center">
            <input
              type="checkbox"
              checked={exclude}
              onChange={(e) => onExcludeChange(e.target.checked)}
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            />
            <span className="ml-2 text-sm text-gray-700">アプローチ対象から外す</span>
          </label>
        </div>
      </div>
    </div>
  );
};

export default CompanySearchSection;