import React, { useState, useMemo } from 'react';
import { X, ChevronRight, ChevronDown, Search } from 'lucide-react';
import { JOB_CATEGORIES } from '../../../../lib/jobCategories';

interface JobExperienceModalProps {
  selectedExperience: string[];
  onExperienceChange: (experience: string[]) => void;
  onClose: () => void;
  title?: string; // タイトルをカスタマイズできるようにする
}

const JobExperienceModal: React.FC<JobExperienceModalProps> = ({
  selectedExperience,
  onExperienceChange,
  onClose,
  title = '職務経験を選択' // デフォルトのタイトル
}) => {
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);
  const [expandedSubcategories, setExpandedSubcategories] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const MAX_SELECTIONS = 100;

  // 検索結果を計算
  const filteredCategories = useMemo(() => {
    if (!searchTerm) return JOB_CATEGORIES;

    const searchLower = searchTerm.toLowerCase();
    return JOB_CATEGORIES.map(category => ({
      ...category,
      subcategories: category.subcategories?.map(subcategory => ({
        ...subcategory,
        jobs: subcategory.jobs?.filter(job => 
          job.name.toLowerCase().includes(searchLower)
        )
      })).filter(subcategory => subcategory.jobs && subcategory.jobs.length > 0)
    })).filter(category => category.subcategories && category.subcategories.length > 0);
  }, [searchTerm]);

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
    if (selectedExperience.includes(jobId)) {
      onExperienceChange(selectedExperience.filter(id => id !== jobId));
    } else if (selectedExperience.length < MAX_SELECTIONS) {
      onExperienceChange([...selectedExperience, jobId]);
    }
  };

  // サブカテゴリー内の全jobが選択されているかどうか
  const isSubcategorySelected = (subcategory: any) => {
    if (!subcategory.jobs) return false;
    return subcategory.jobs.every((job: any) => selectedExperience.includes(job.value));
  };

  // サブカテゴリーのチェックボックス変更時の処理
  const handleSubcategorySelect = (subcategory: any) => {
    if (!subcategory.jobs) return;
    const allJobValues = subcategory.jobs.map((job: any) => job.value);
    if (allJobValues.every(value => selectedExperience.includes(value))) {
      // すべて選択済みの場合は解除
      onExperienceChange(selectedExperience.filter(value => !allJobValues.includes(value)));
    } else {
      // 未選択のjobがあれば追加
      let newSelection = [...selectedExperience];
      allJobValues.forEach(value => {
        if (!newSelection.includes(value) && newSelection.length < MAX_SELECTIONS) {
          newSelection.push(value);
        }
      });
      onExperienceChange(newSelection);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-start justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden mt-20">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 focus:outline-none"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* 検索フォーム */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="職種名で検索..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
        </div>

        <div className="overflow-y-auto" style={{ maxHeight: 'calc(90vh - 250px)' }}>
          <div className="px-6 py-4">
            {filteredCategories.map(category => (
              <div key={category.id} className="border-b border-gray-200 last:border-b-0">
                <button
                  onClick={() => toggleCategory(category.id)}
                  className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors duration-200"
                >
                  <div className="flex items-center">
                    {expandedCategories.includes(category.id) ? (
                      <ChevronDown className="h-5 w-5 text-gray-400" />
                    ) : (
                      <ChevronRight className="h-5 w-5 text-gray-400" />
                    )}
                    <span className="ml-2 font-medium text-gray-900">{category.name}</span>
                  </div>
                  {category.subcategories?.some(sub =>
                    sub.jobs?.some(job => selectedExperience.includes(job.value))
                  ) && (
                    <span className="text-sm text-indigo-600">選択中</span>
                  )}
                </button>

                <div className={`${expandedCategories.includes(category.id) || searchTerm ? '' : 'hidden'}`}>
                  {category.subcategories?.map(subcategory => (
                    <div key={subcategory.id} className="pl-8">
                      <div className="flex items-center px-4 py-2">
                        <input
                          type="checkbox"
                          checked={isSubcategorySelected(subcategory)}
                          onChange={() => handleSubcategorySelect(subcategory)}
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                        />
                        <button
                          onClick={() => toggleSubcategory(subcategory.id)}
                          className="flex-1 flex items-center ml-2"
                        >
                          {expandedSubcategories.includes(subcategory.id) ? (
                            <ChevronDown className="h-4 w-4 text-gray-400" />
                          ) : (
                            <ChevronRight className="h-4 w-4 text-gray-400" />
                          )}
                          <span className="ml-2 text-gray-700">{subcategory.name}</span>
                        </button>
                        {subcategory.jobs?.some(job => selectedExperience.includes(job.value)) && (
                          <span className="text-sm text-indigo-600">選択中</span>
                        )}
                      </div>

                      <div className={`${expandedSubcategories.includes(subcategory.id) || searchTerm ? '' : 'hidden'}`}>
                        <div className="pl-8">
                          {subcategory.jobs?.map(job => (
                            <label
                              key={job.value}
                              className="flex items-center px-4 py-2 hover:bg-gray-50 cursor-pointer"
                            >
                              <input
                                type="checkbox"
                                checked={selectedExperience.includes(job.value)}
                                onChange={() => handleJobSelect(job.value)}
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
            ))}
          </div>
        </div>

        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-500">
              選択中: {selectedExperience.length}/{MAX_SELECTIONS}
            </div>
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700"
            >
              完了
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobExperienceModal;