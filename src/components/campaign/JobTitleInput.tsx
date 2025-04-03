import React, { useState, useEffect, useRef } from 'react';
import { Search } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface JobTitleInputProps {
  value: string;
  onChange: (value: string, jobDetails?: any) => void;
  customerId: string | undefined;
  required?: boolean;
}

const JobTitleInput: React.FC<JobTitleInputProps> = ({
  value,
  onChange,
  customerId,
  required = false
}) => {
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchJobTitles = async () => {
      if (!customerId) return;
      
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('campaigns')
          .select('job_details')
          .eq('customer_id', customerId) // Filter by customer_id
          .order('created_at', { ascending: false });

        if (error) throw error;

        // Extract and deduplicate job titles
        const jobDetails = data
          ?.flatMap(campaign => {
            const jobTypes = campaign.job_details?.job_type || [];
            return Array.isArray(jobTypes) 
              ? jobTypes.map((job: any) => ({
                  name: job.name,
                  quantity: job.quantity,
                  locations: job.locations,
                  age_range: job.age_range,
                  search_criteria: job.search_criteria
                })).filter(Boolean)
              : [];
          })
          .filter((job, index, self) => 
            index === self.findIndex(j => j.name === job.name)
          ) || [];

        setSuggestions(jobDetails);
      } catch (err) {
        console.error('Error fetching job titles:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchJobTitles();
  }, [customerId]);

  const filteredSuggestions = suggestions
    .filter(job => 
      job.name.toLowerCase().includes(value.toLowerCase()) &&
      job.name.toLowerCase() !== value.toLowerCase()
    )
    .slice(0, 5);

  return (
    <div className="relative">
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onBlur={() => {
            setTimeout(() => setIsOpen(false), 200);
          }}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          placeholder="AirWorkに掲載中のスカウトする職種名を入力"
          required={required}
        />
        {loading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-600"></div>
          </div>
        )}
      </div>

      {isOpen && filteredSuggestions.length > 0 && (
        <div className="absolute z-10 w-full mt-1 bg-white shadow-lg rounded-md border border-gray-200">
          <ul className="py-1">
            {filteredSuggestions.map((job, index) => (
              <li
                key={index}
                className="px-4 py-2 hover:bg-gray-50 cursor-pointer flex items-center"
                onClick={() => {
                  // 既存の値を保持するため、必要な情報のみを渡す
                  const jobDetails = {
                    quantity: job.quantity,
                    locations: job.locations,
                    age_range: job.age_range,
                    search_criteria: job.search_criteria
                  };
                  onChange(job.name, jobDetails);
                  setIsOpen(false);
                }}
              >
                <Search className="h-4 w-4 text-gray-400 mr-2" />
                <span>{job.name}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default JobTitleInput;