import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Search } from 'lucide-react';
import KeywordSearchSection from './KeywordSearchSection';
import JobExperienceSection from './JobExperienceSection';
import ExperienceYearsSection from './ExperienceYearsSection';
import EducationSection from './EducationSection';
import type { SearchCriteria } from '../../types';

interface SearchSectionProps {
  onSearch?: (criteria: SearchCriteria) => void;
}

const SearchSection: React.FC<SearchSectionProps> = ({ onSearch }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [criteria, setCriteria] = useState<SearchCriteria>({
    keywords: [],
    jobExperience: [],
    experience: { min: 0, max: 0 },
    education: []
  });

  const handleSearch = () => {
    onSearch?.(criteria);
  };

  const handleClear = () => {
    setCriteria({
      keywords: [],
      jobExperience: [],
      experience: { min: 0, max: 0 },
      education: []
    });
  };

  const hasActiveFilters = Object.values(criteria).some(value => 
    Array.isArray(value) ? value.length > 0 : 
    typeof value === 'object' ? Object.values(value).some(v => v !== 0) : 
    value !== 0
  );

  return (
    <div className="space-y-4">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between px-4 py-2.5 bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-gray-50 transition-all duration-200"
      >
        <div className="flex items-center space-x-2">
          <Search className="h-5 w-5 text-gray-600" />
          <span className="font-medium text-gray-800">詳細検索</span>
        </div>
        <div className="flex items-center space-x-2">
          {hasActiveFilters && (
            <span className="text-sm text-indigo-600">
              条件あり
            </span>
          )}
          {isExpanded ? (
            <ChevronUp className="h-5 w-5 text-gray-500" />
          ) : (
            <ChevronDown className="h-5 w-5 text-gray-500" />
          )}
        </div>
      </button>

      {isExpanded && (
        <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-6 space-y-6 animate-slideDown">
          <KeywordSearchSection
            keywords={criteria.keywords}
            onKeywordsChange={(keywords) => setCriteria({ ...criteria, keywords })}
          />

          <JobExperienceSection
            selectedExperience={criteria.jobExperience}
            onExperienceChange={(jobExperience) => setCriteria({ ...criteria, jobExperience })}
          />

          <ExperienceYearsSection
            experience={criteria.experience}
            onExperienceChange={(experience) => setCriteria({ ...criteria, experience })}
          />

          <EducationSection
            selectedEducation={criteria.education}
            onEducationChange={(education) => setCriteria({ ...criteria, education })}
          />

          <div className="flex justify-end space-x-4 pt-6 border-t">
            <button
              onClick={handleClear}
              className="px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 shadow-sm transition-colors duration-200"
            >
              クリア
            </button>
            <button
              onClick={handleSearch}
              className="px-4 py-2.5 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-lg hover:bg-indigo-700 shadow-sm transition-colors duration-200"
            >
              検索条件を適用
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchSection;