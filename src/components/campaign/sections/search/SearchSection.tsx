import React, { useState, useRef, useCallback, useEffect } from 'react';
import { ChevronDown, ChevronUp, Search, Tag, HelpCircle } from 'lucide-react';
import JobExperienceSection from './JobExperienceSection';
import ExperienceYearsSection from './ExperienceYearsSection';
import EducationSection from './EducationSection';
import GraduationYearSection from './GraduationYearSection';
import WorkExperienceYearsSection from './WorkExperienceYearsSection';
import SkillsSection from './SkillsSection';
import ExperienceSearchSection from './ExperienceSearchSection';
import CertificationsSection from './CertificationsSection';
import EnglishLevelSection from './EnglishLevelSection';
import CompanyCountSection from './CompanyCountSection';
import ManagementCountSection from './ManagementCountSection';
import EmploymentStatusSection from './EmploymentStatusSection';
import CompanySearchSection from './CompanySearchSection';
import OtherLanguagesSection from './OtherLanguagesSection';
import FreeWordSection from './FreeWordSection';
import DesiredJobsSection from './DesiredJobsSection';
import type { SearchCriteria } from '../../../../lib/types';
import { JOB_CATEGORIES } from '../../../../lib/jobCategories';

interface SearchSectionProps {
  onSearch?: (criteria: SearchCriteria) => void;
  ageRange?: [number | '', number | ''];
  initialCriteria?: SearchCriteria;
}

const defaultCriteria: SearchCriteria = {
  keywords: [],
  jobExperience: [],
  desiredJobs: [],
  experience: { min: 0, max: 0 },
  education: [],
  graduationYear: { min: '', max: '' },
  workExperience: { min: '', max: '' },
  skills: [],
  experiences: [],
  certifications: [],
  englishLevel: '1',
  companyCount: '6',
  managementCount: '1',
  employmentStatus: null,
  companies: [],
  recentOnly: false,
  exclude: false,
  otherLanguages: [],
  includeAllLanguages: false,
  freeWordOr: '',
  freeWordAnd: '',
  freeWordExclude: ''
};

const SearchSection: React.FC<SearchSectionProps> = ({ onSearch, ageRange, initialCriteria }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const searchSectionRef = useRef<HTMLDivElement>(null);
  const [criteria, setCriteria] = useState<SearchCriteria>(initialCriteria || defaultCriteria);

  useEffect(() => {
    if (initialCriteria) {
      setCriteria(initialCriteria);
    }
  }, [initialCriteria]);

  const updateCriteria = useCallback((updates: Partial<SearchCriteria>) => {
    const newCriteria = { ...criteria, ...updates };
    setCriteria(newCriteria);
    onSearch?.(newCriteria);
  }, [criteria, onSearch]);

  const getJobName = (value: string): string => {
    for (const category of JOB_CATEGORIES) {
      for (const subcategory of category.subcategories || []) {
        const job = subcategory.jobs?.find(j => j.value === value);
        if (job) {
          return `${subcategory.name} - ${job.name}`;
        }
      }
    }
    return value;
  };

  const getSearchSummary = () => {
    const summary = [];

    if (criteria.jobExperience?.length > 0) {
      summary.push({
        title: '職種経験',
        items: criteria.jobExperience.map(value => getJobName(value)),
        count: criteria.jobExperience.length,
        showDetails: true
      });
    }

    if (criteria.desiredJobs?.length > 0) {
      summary.push({
        title: '希望職種',
        items: criteria.desiredJobs.map(value => getJobName(value)),
        count: criteria.desiredJobs.length,
        showDetails: true
      });
    }

    if (criteria.education?.length > 0) {
      summary.push({
        title: '学歴',
        items: criteria.education,
        count: criteria.education.length,
        showDetails: true
      });
    }

    if (criteria.graduationYear?.min || criteria.graduationYear?.max) {
      const items = [];
      if (criteria.graduationYear.min) {
        items.push(`${criteria.graduationYear.min}年以降`);
      }
      if (criteria.graduationYear.max) {
        items.push(`${criteria.graduationYear.max}年以前`);
      }
      summary.push({
        title: '最終学歴卒業年',
        items,
        count: items.length,
        showDetails: true
      });
    }

    if (criteria.skills?.length > 0) {
      summary.push({
        title: 'スキル',
        items: criteria.skills,
        count: criteria.skills.length,
        showDetails: true
      });
    }

    if (criteria.certifications?.length > 0) {
      summary.push({
        title: '資格',
        items: criteria.certifications,
        count: criteria.certifications.length,
        showDetails: true
      });
    }

    if (criteria.experience?.min > 0 || criteria.experience?.max > 0) {
      summary.push({
        title: '経験年数',
        items: [`${criteria.experience.min}年〜${criteria.experience.max}年`],
        count: 1,
        showDetails: true
      });
    }

    if (criteria.companies?.length > 0) {
      summary.push({
        title: '企業',
        items: criteria.companies,
        count: criteria.companies.length,
        showDetails: true
      });
    }

    if (criteria.otherLanguages?.length > 0) {
      summary.push({
        title: '語学',
        items: criteria.otherLanguages,
        count: criteria.otherLanguages.length,
        showDetails: true
      });
    }

    if (criteria.managementCount !== '1') {
      summary.push({
        title: 'マネジメント経験',
        items: [criteria.managementCount],
        count: 1,
        showDetails: true
      });
    }

    return summary;
  };

  const handleClear = () => {
    setCriteria(defaultCriteria);
    onSearch?.(defaultCriteria);
  };

  const handleApply = () => {
    onSearch?.(criteria);
    setIsExpanded(false);
    if (searchSectionRef.current) {
      searchSectionRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const hasActiveFilters = getSearchSummary().length > 0;

  return (
    <div className="space-y-4" ref={searchSectionRef}>
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
            <Tag className="h-4 w-4 text-indigo-600" />
          )}
          {isExpanded ? (
            <ChevronUp className="h-5 w-5 text-gray-500" />
          ) : (
            <ChevronDown className="h-5 w-5 text-gray-500" />
          )}
        </div>
      </button>

      {!isExpanded && hasActiveFilters && (
        <div className="bg-gray-50 rounded-lg p-4 space-y-4 animate-slideDown">
          <h3 className="text-sm font-medium text-gray-700">適用中の検索条件</h3>
          <div className="space-y-3">
            {getSearchSummary().map((section, index) => (
              <div key={index} className="space-y-2">
                <h4 className="text-xs font-medium text-gray-600">
                  {section.title} ({section.count}件)
                </h4>
                <div className="flex flex-wrap gap-2">
                  {section.items.map((item, itemIndex) => (
                    <span
                      key={itemIndex}
                      className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {isExpanded && (
        <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-6 space-y-6 animate-slideDown">
          <JobExperienceSection
            selectedExperience={criteria.jobExperience || []}
            onExperienceChange={(jobExperience) => updateCriteria({ jobExperience })}
          />

          <ExperienceYearsSection
            experience={criteria.experience || { min: 0, max: 0 }}
            onExperienceChange={(experience) => updateCriteria({ experience })}
          />

          <EducationSection
            selectedEducation={criteria.education || []}
            onEducationChange={(education) => updateCriteria({ education })}
          />

          <GraduationYearSection
            graduationYear={criteria.graduationYear || { min: '', max: '' }}
            onGraduationYearChange={(graduationYear) => updateCriteria({ graduationYear })}
            ageRange={ageRange}
          />

          <WorkExperienceYearsSection
            workExperience={criteria.workExperience || { min: '', max: '' }}
            onWorkExperienceChange={(workExperience) => updateCriteria({ workExperience })}
          />

          <SkillsSection
            skills={criteria.skills || []}
            onSkillsChange={(skills) => updateCriteria({ skills })}
          />

          <ExperienceSearchSection
            experiences={criteria.experiences || []}
            onExperiencesChange={(experiences) => updateCriteria({ experiences })}
          />

          <CertificationsSection
            certifications={criteria.certifications || []}
            onCertificationsChange={(certifications) => updateCriteria({ certifications })}
          />

          <EnglishLevelSection
            englishLevel={criteria.englishLevel || '1'}
            onEnglishLevelChange={(englishLevel) => updateCriteria({ englishLevel })}
          />

          <CompanyCountSection
            companyCount={criteria.companyCount || '6'}
            onCompanyCountChange={(companyCount) => updateCriteria({ companyCount })}
          />

          <ManagementCountSection
            managementCount={criteria.managementCount || '1'}
            onManagementCountChange={(managementCount) => updateCriteria({ managementCount })}
          />

          <EmploymentStatusSection
            employmentStatus={criteria.employmentStatus}
            onEmploymentStatusChange={(employmentStatus) => updateCriteria({ employmentStatus })}
          />

          <CompanySearchSection
            companies={criteria.companies || []}
            onCompaniesChange={(companies) => updateCriteria({ companies })}
            recentOnly={criteria.recentOnly || false}
            onRecentOnlyChange={(recentOnly) => updateCriteria({ recentOnly })}
            exclude={criteria.exclude || false}
            onExcludeChange={(exclude) => updateCriteria({ exclude })}
          />

          <OtherLanguagesSection
            languages={criteria.otherLanguages || []}
            onLanguagesChange={(otherLanguages) => updateCriteria({ otherLanguages })}
            includeAll={criteria.includeAllLanguages || false}
            onIncludeAllChange={(includeAllLanguages) => updateCriteria({ includeAllLanguages })}
          />

          <FreeWordSection
            freeWordOr={criteria.freeWordOr || ''}
            freeWordAnd={criteria.freeWordAnd || ''}
            onFreeWordOrChange={(freeWordOr) => updateCriteria({ freeWordOr })}
            onFreeWordAndChange={(freeWordAnd) => updateCriteria({ freeWordAnd })}
          />

          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-700">
                除外フリーワード
              </label>
              <button
                type="button"
                className="text-gray-400 hover:text-gray-500"
                title="複数フリーワード入力できます。単語の間には空白を入れてください。"
              >
                <HelpCircle className="h-5 w-5" />
              </button>
            </div>
            <div>
              <div className="relative">
                <input
                  type="text"
                  placeholder="フリーワードを入力する"
                  value={criteria.freeWordExclude || ''}
                  onChange={(e) => updateCriteria({ freeWordExclude: e.target.value })}
                  maxLength={200}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
                <div className="absolute right-3 bottom-2 text-xs text-gray-400">
                  {(criteria.freeWordExclude || '').length}/200
                </div>
              </div>
            </div>
          </div>

          <DesiredJobsSection
            selectedJobs={criteria.desiredJobs || []}
            onJobsChange={(desiredJobs) => updateCriteria({ desiredJobs })}
          />

          <div className="flex justify-end space-x-4 pt-6 border-t">
            <button
              onClick={handleClear}
              className="px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 shadow-sm transition-colors duration-200"
            >
              クリア
            </button>
            <button
              onClick={handleApply}
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