import React, { useState, useEffect } from 'react';
import { AlertCircle, ChevronUp, ChevronDown, X } from 'lucide-react';
import { ValidationErrors } from '../hooks/useFormValidation';

interface FloatingErrorSummaryProps {
  errors: ValidationErrors;
}

const FloatingErrorSummary: React.FC<FloatingErrorSummaryProps> = ({ errors }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const hasErrors = Object.keys(errors).length > 0;
    if (hasErrors) {
      setIsVisible(true);
      setIsExpanded(true);
    } else {
      setIsVisible(false);
      setIsExpanded(false);
    }
  }, [errors]);

  if (!isVisible) return null;

  const getAllErrors = () => {
    const allErrors: string[] = [];

    if (errors.customer) {
      allErrors.push(...errors.customer);
    }

    if (errors.basicInfo) {
      if (errors.basicInfo.title) allErrors.push(...errors.basicInfo.title);
      if (errors.basicInfo.platform) allErrors.push(...errors.basicInfo.platform);
    }

    if (errors.jobTypes) {
      Object.values(errors.jobTypes).forEach(jobType => {
        if (jobType.name) allErrors.push(...jobType.name);
        if (jobType.locations) allErrors.push(...jobType.locations);
        if (jobType.quantity) allErrors.push(...jobType.quantity);
      });
    }

    if (errors.deliverySchedule) {
      if (errors.deliverySchedule.period) allErrors.push(...errors.deliverySchedule.period);
      if (errors.deliverySchedule.days) allErrors.push(...errors.deliverySchedule.days);
    }

    if (errors.total) {
      allErrors.push(...errors.total);
    }

    return allErrors;
  };

  const allErrors = getAllErrors();
  if (allErrors.length === 0) return null;

  return (
    <div className="fixed bottom-32 right-6 z-50 max-w-md w-full bg-white rounded-lg shadow-xl border border-red-200 transition-all duration-300">
      <div className="flex items-center justify-between p-4 bg-red-50 rounded-t-lg">
        <div 
          className="flex items-center text-red-800 flex-1 cursor-pointer"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
          <span className="font-medium">
            {allErrors.length}件のエラーがあります
          </span>
          {isExpanded ? (
            <ChevronDown className="h-5 w-5 text-red-500 ml-2" />
          ) : (
            <ChevronUp className="h-5 w-5 text-red-500 ml-2" />
          )}
        </div>
        <button
          onClick={() => setIsVisible(false)}
          className="ml-4 p-1.5 text-gray-400 hover:text-gray-600 rounded-full hover:bg-red-100 transition-colors duration-200"
          title="閉じる"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
      
      {isExpanded && (
        <div className="max-h-60 overflow-y-auto p-4 bg-white rounded-b-lg">
          <ul className="space-y-2">
            {allErrors.map((error, index) => (
              <li key={index} className="flex items-start text-sm text-red-600">
                <AlertCircle className="h-4 w-4 mt-0.5 mr-2 flex-shrink-0" />
                <span style={{ whiteSpace: 'pre-line' }}>{error}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default FloatingErrorSummary;