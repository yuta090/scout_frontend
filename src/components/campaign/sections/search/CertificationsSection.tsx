import React, { useState } from 'react';
import { Search } from 'lucide-react';

interface CertificationsSectionProps {
  certifications: string[];
  onCertificationsChange: (certifications: string[]) => void;
}

const CertificationsSection: React.FC<CertificationsSectionProps> = ({
  certifications,
  onCertificationsChange
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const handleAddCertification = (certification: string) => {
    if (certifications.length >= 10) return;
    if (!certifications.includes(certification)) {
      onCertificationsChange([...certifications, certification]);
    }
    setSearchTerm('');
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        保有資格
      </label>
      <div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="保有資格を検索する"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && searchTerm.trim()) {
                e.preventDefault();
                handleAddCertification(searchTerm.trim());
              }
            }}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
        <p className="mt-2 text-sm text-gray-500">
          最大10個まで設定できます。
        </p>
        {certifications.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {certifications.map((certification, index) => (
              <span
                key={index}
                className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-indigo-50 text-indigo-700 border border-indigo-100"
              >
                {certification}
                <button
                  type="button"
                  onClick={() => onCertificationsChange(certifications.filter((_, i) => i !== index))}
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

export default CertificationsSection;