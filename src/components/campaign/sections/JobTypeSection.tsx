import React, { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { JobType, SearchCriteria } from '../../../lib/types';
import { PREFECTURES } from '../types';
import JobTitleInput from '../JobTitleInput';
import SearchSection from './search/SearchSection';

interface JobTypeSectionProps {
  jobTypes: JobType[];
  activeJobTypeId: string;
  customerId?: string;
  onAddJobType: (jobType: JobType) => void;
  onRemoveJobType: (id: string) => void;
  onUpdateJobType: (id: string, updates: Partial<JobType>) => void;
  onActiveJobTypeChange: (id: string) => void;
}

const getInitialSearchCriteria = (): SearchCriteria => ({
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
});

const JobTypeSection: React.FC<JobTypeSectionProps> = ({
  jobTypes,
  activeJobTypeId,
  customerId,
  onAddJobType,
  onRemoveJobType,
  onUpdateJobType,
  onActiveJobTypeChange
}) => {
  const getActiveJobType = () => jobTypes.find(jt => jt.id === activeJobTypeId);
  const totalQuantity = jobTypes.reduce((total, job) => total + (job.quantity || 0), 0);

  const toggleLocation = (jobTypeId: string, location: string) => {
    const jobType = jobTypes.find(jt => jt.id === jobTypeId);
    if (!jobType) return;

    const newLocations = jobType.locations.includes(location)
      ? jobType.locations.filter(loc => loc !== location)
      : jobType.locations.length < 10
        ? [...jobType.locations, location]
        : jobType.locations;

    onUpdateJobType(jobTypeId, { locations: newLocations });
  };

  const handleSearch = (criteria: SearchCriteria) => {
    const activeJob = getActiveJobType();
    if (!activeJob) return;

    onUpdateJobType(activeJobTypeId, {
      ...activeJob,
      search_criteria: { ...criteria }
    });
  };

  const handleAgeRangeChange = (index: 0 | 1, value: string) => {
    const activeJob = getActiveJobType();
    if (!activeJob) return;

    const numericValue = value.replace(/[^0-9]/g, '');
    const parsedValue = numericValue === '' ? '' : parseInt(numericValue);
    const newAgeRange = [...(activeJob.age_range || ['', ''])] as [number | '', number | ''];
    newAgeRange[index] = parsedValue;

    onUpdateJobType(activeJobTypeId, {
      ...activeJob,
      age_range: newAgeRange
    });
  };

  const handleJobTitleChange = (value: string, jobDetails?: any) => {
    const activeJob = getActiveJobType();
    if (!activeJob) return;

    const updates: Partial<JobType> = {
      name: value
    };

    // 過去の職種の情報が提供された場合
    if (jobDetails) {
      // 各項目について、既存の値がない場合のみ過去の職種の値を使用
      if (!activeJob.quantity || activeJob.quantity === 100) { // デフォルト値の場合も更新
        updates.quantity = jobDetails.quantity;
      }
      if (!activeJob.locations?.length) {
        updates.locations = jobDetails.locations;
      }
      // 年齢範囲は両方とも空の場合のみ更新
      if ((!activeJob.age_range?.[0] && !activeJob.age_range?.[1]) && jobDetails.age_range) {
        updates.age_range = jobDetails.age_range;
      }
      // 検索条件は全ての値が空の場合のみ更新
      const isSearchCriteriaEmpty = !activeJob.search_criteria || Object.entries(activeJob.search_criteria).every(([key, value]) => {
        if (Array.isArray(value)) {
          return value.length === 0;
        }
        if (typeof value === 'object' && value !== null) {
          return Object.values(value).every(v => v === '' || v === 0 || v === null);
        }
        return !value || value === '1' || value === '6' || value === false;
      });

      if (isSearchCriteriaEmpty && jobDetails.search_criteria) {
        updates.search_criteria = { ...jobDetails.search_criteria };
      }
    }

    onUpdateJobType(activeJobTypeId, updates);
  };

  const handleNewJobType = () => {
    const newJobType: JobType = {
      id: `job-${Date.now()}`,
      name: '',
      locations: [],
      quantity: 100,
      search_criteria: getInitialSearchCriteria()
    };
    onAddJobType(newJobType);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h3 className="text-lg font-medium text-gray-900">スカウト設定</h3>
          <div className="flex items-center">
            <span className="text-sm font-medium text-gray-700">1日の合計スカウト送信数:</span>
            <div className="ml-2">
              <span className={`text-sm font-medium ${totalQuantity >= 500 ? 'text-red-600' : 'text-indigo-600'}`}>
                {totalQuantity.toLocaleString()}
              </span>
              <span className="text-sm font-medium text-gray-700">通</span>
            </div>
          </div>
        </div>
        <button
          onClick={handleNewJobType}
          className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white ${
            totalQuantity >= 500 
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-indigo-600 hover:bg-indigo-700'
          }`}
          disabled={totalQuantity >= 500}
        >
          <Plus className="h-4 w-4 mr-1" />
          職種を追加
        </button>
      </div>

      {jobTypes.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-500">
            「職種を追加」ボタンをクリックして職種を追加してください
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="border-b">
            <nav className="-mb-px flex flex-wrap">
              {jobTypes.map((jobType) => (
                <div
                  key={jobType.id}
                  className={`py-4 px-6 border-b-2 font-medium text-sm flex items-center cursor-pointer ${
                    activeJobTypeId === jobType.id
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                  onClick={() => onActiveJobTypeChange(jobType.id)}
                >
                  <span>{jobType.name || '新規職種'}</span>
                  {jobTypes.length > 1 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemoveJobType(jobType.id);
                      }}
                      className="ml-2 text-gray-400 hover:text-red-500"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
            </nav>
          </div>

          {activeJobTypeId && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  スカウトする職種 <span className="text-red-500">*</span>
                </label>
                <JobTitleInput
                  value={getActiveJobType()?.name || ''}
                  onChange={handleJobTitleChange}
                  customerId={customerId}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  スカウト年齢範囲
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="\d*"
                    value={getActiveJobType()?.age_range?.[0] ?? ''}
                    onChange={(e) => handleAgeRangeChange(0, e.target.value)}
                    className="w-24 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="最小"
                  />
                  <span className="text-gray-500">〜</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="\d*"
                    value={getActiveJobType()?.age_range?.[1] ?? ''}
                    onChange={(e) => handleAgeRangeChange(1, e.target.value)}
                    className="w-24 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="最大"
                  />
                  <span className="text-sm text-gray-500">歳</span>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-sm font-medium text-gray-700">
                    1日のスカウト送信数
                  </label>
                  <span className="text-sm text-gray-500">
                    最大: 500通/日
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    min="0"
                    value={getActiveJobType()?.quantity || 0}
                    onChange={(e) => {
                      let value = parseInt(e.target.value) || 0;
                      const currentTotal = totalQuantity - (getActiveJobType()?.quantity || 0);
                      const available = 500 - currentTotal;

                      value = Math.max(0, Math.min(value, available));
                      onUpdateJobType(activeJobTypeId, { quantity: value });
                    }}
                    className="w-32 px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                  <span className="text-sm text-gray-500">通/日</span>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-sm font-medium text-gray-700">
                    スカウトする地域（最大10箇所まで選択可能）
                  </label>
                  <span className="text-sm text-gray-500">
                    選択中: {getActiveJobType()?.locations.length || 0}箇所
                  </span>
                </div>
                <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
                  {PREFECTURES.map((prefecture) => {
                    const isSelected = getActiveJobType()?.locations.includes(prefecture);
                    const isDisabled = !isSelected && (getActiveJobType()?.locations.length || 0) >= 10;

                    return (
                      <button
                        key={prefecture}
                        onClick={() => toggleLocation(activeJobTypeId, prefecture)}
                        disabled={isDisabled}
                        className={`px-3 py-2 text-sm font-medium rounded-md ${
                          isSelected
                            ? 'bg-indigo-100 text-indigo-700'
                            : isDisabled
                              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {prefecture}
                      </button>
                    );
                  })}
                </div>
              </div>

              <SearchSection 
                onSearch={handleSearch}
                ageRange={getActiveJobType()?.age_range}
                initialCriteria={getActiveJobType()?.search_criteria}
                key={activeJobTypeId}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default JobTypeSection;