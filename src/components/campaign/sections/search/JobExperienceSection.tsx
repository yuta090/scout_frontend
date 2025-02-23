import React, { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { JOB_CATEGORIES } from '../../../../lib/jobCategories';

interface JobExperienceSectionProps {
  selectedExperience: string[];
  onExperienceChange: (experience: string[]) => void;
}

const JobExperienceSection: React.FC<JobExperienceSectionProps> = ({
  selectedExperience,
  onExperienceChange
}) => {
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);
  const [expandedSubcategories, setExpandedSubcategories] = useState<string[]>([]);

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev =>
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const toggleSubcategory = (subcategoryId: string) => {
    setExpandedSubcategories(prev =>
      prev.includes(subcategoryId)
        ? prev.filter(id => id !== subcategoryId)
        : [...prev, subcategoryId]
    );
  };

  const handleJobSelect = (jobId: string) => {
    const newExperience = selectedExperience.includes(jobId)
      ? selectedExperience.filter(id => id !== jobId)
      : [...selectedExperience, jobId];
    onExperienceChange(newExperience);
  };

  // 中項目のチェック状態を計算
  const isSubcategorySelected = (subcategory: { jobs?: { id: string }[] }) => {
    if (!subcategory.jobs) return false;
    return subcategory.jobs.every(job => selectedExperience.includes(job.id));
  };

  // 中項目のチェックボックスがクリックされたときの処理
  const handleSubcategorySelect = (subcategory: { jobs?: { id: string }[] }) => {
    if (!subcategory.jobs) return;

    const isAllSelected = isSubcategorySelected(subcategory);
    const jobIds = subcategory.jobs.map(job => job.id);

    if (isAllSelected) {
      // 全て選択されている場合は、全て解除
      onExperienceChange(selectedExperience.filter(id => !jobIds.includes(id)));
    } else {
      // 一部または未選択の場合は、全て選択
      const newExperience = [...selectedExperience];
      jobIds.forEach(id => {
        if (!newExperience.includes(id)) {
          newExperience.push(id);
        }
      });
      onExperienceChange(newExperience);
    }
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        職種経験
      </label>
      <div className="space-y-2 bg-white rounded-lg border border-gray-200">
        {JOB_CATEGORIES.map(category => (
          <div key={category.id} className="border-b border-gray-200 last:border-b-0">
            <button
              onClick={() => toggleCategory(category.id)}
              className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors duration-200"
            >
              <div className="flex items-center">
                <ChevronDown
                  className={`h-5 w-5 text-gray-400 transition-transform duration-200 ${
                    expandedCategories.includes(category.id) ? 'transform rotate-0' : 'transform -rotate-90'
                  }`}
                />
                <span className="ml-2 font-medium text-gray-900">{category.name}</span>
              </div>
              {category.subcategories?.some(sub =>
                sub.jobs?.some(job => selectedExperience.includes(job.id))
              ) && (
                <span className="text-sm text-indigo-600">選択中</span>
              )}
            </button>

            <div
              className={`overflow-hidden transition-all duration-200 ${
                expandedCategories.includes(category.id) ? 'max-h-[2000px]' : 'max-h-0'
              }`}
            >
              <div className="bg-gray-50 pl-6">
                {category.subcategories?.map(subcategory => (
                  <div key={subcategory.id} className="border-t border-gray-200 first:border-t-0">
                    <div className="flex items-center px-4 py-2.5 hover:bg-gray-100 transition-colors duration-200">
                      <input
                        type="checkbox"
                        checked={isSubcategorySelected(subcategory)}
                        onChange={() => handleSubcategorySelect(subcategory)}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      />
                      <button
                        onClick={() => toggleSubcategory(subcategory.id)}
                        className="flex-1 flex items-center ml-2 text-left"
                      >
                        <ChevronRight
                          className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${
                            expandedSubcategories.includes(subcategory.id) ? 'transform rotate-90' : ''
                          }`}
                        />
                        <span className="ml-2 text-sm font-medium text-gray-700">
                          {subcategory.name}
                        </span>
                      </button>
                      {subcategory.jobs?.some(job => selectedExperience.includes(job.id)) && (
                        <span className="text-xs text-indigo-600">選択中</span>
                      )}
                    </div>

                    <div
                      className={`overflow-hidden transition-all duration-200 ${
                        expandedSubcategories.includes(subcategory.id) ? 'max-h-[1000px]' : 'max-h-0'
                      }`}
                    >
                      <div className="bg-white pl-12 py-2">
                        {subcategory.jobs?.map(job => (
                          <label
                            key={job.id}
                            className="flex items-center px-4 py-2 hover:bg-gray-50 cursor-pointer"
                          >
                            <input
                              type="checkbox"
                              checked={selectedExperience.includes(job.id)}
                              onChange={() => handleJobSelect(job.id)}
                              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                            />
                            <span className="ml-3 text-sm text-gray-700">{job.name}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {selectedExperience.length > 0 && (
        <div className="mt-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">選択中の職種:</h4>
          <div className="flex flex-wrap gap-2">
            {selectedExperience.map(jobId => {
              const job = JOB_CATEGORIES.flatMap(cat => 
                cat.subcategories?.flatMap(sub => 
                  sub.jobs?.find(j => j.id === jobId)
                ) || []
              ).find(Boolean);
              
              if (job) {
                return (
                  <span
                    key={jobId}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-indigo-50 text-indigo-700 border border-indigo-100"
                  >
                    {job.name}
                  </span>
                );
              }
              return null;
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default JobExperienceSection;