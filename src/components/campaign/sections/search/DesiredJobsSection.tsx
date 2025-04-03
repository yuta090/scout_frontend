import React, { useState } from 'react';
import { JOB_CATEGORIES } from '../../../../lib/jobCategories';
import JobExperienceModal from './JobExperienceModal';

interface DesiredJobsSectionProps {
  selectedJobs: string[];
  onJobsChange: (jobs: string[]) => void;
}

const DesiredJobsSection: React.FC<DesiredJobsSectionProps> = ({
  selectedJobs,
  onJobsChange
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const getSelectedJobNames = () => {
    return selectedJobs.map(value => {
      for (const category of JOB_CATEGORIES) {
        for (const subcategory of category.subcategories || []) {
          const job = subcategory.jobs?.find(j => j.value === value);
          if (job) {
            return job.name;
          }
        }
      }
      return value;
    });
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        希望職種
      </label>
      <div>
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="w-full px-4 py-2 text-left border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        >
          {selectedJobs.length > 0 ? (
            <span className="text-gray-900">
              {selectedJobs.length}個の職種を選択中
            </span>
          ) : (
            <span className="text-gray-500">
              職種を選択してください
            </span>
          )}
        </button>

        {selectedJobs.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {getSelectedJobNames().map((name, index) => (
              <span
                key={index}
                className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-indigo-50 text-indigo-700 border border-indigo-100"
              >
                {name}
                <button
                  type="button"
                  onClick={() => onJobsChange(selectedJobs.filter((_, i) => i !== index))}
                  className="ml-2 text-indigo-400 hover:text-indigo-600"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {isModalOpen && (
        <JobExperienceModal
          selectedExperience={selectedJobs}
          onExperienceChange={onJobsChange}
          onClose={() => setIsModalOpen(false)}
          title="希望職種を選択"
        />
      )}
    </div>
  );
};

export default DesiredJobsSection;