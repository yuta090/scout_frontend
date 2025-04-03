import React from 'react';
import { AlertCircle } from 'lucide-react';
import { ValidationErrors } from '../hooks/useFormValidation';

interface ErrorSummaryProps {
  errors: ValidationErrors;
}

const ErrorSummary: React.FC<ErrorSummaryProps> = ({ errors }) => {
  if (Object.keys(errors).length === 0) return null;

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
    <div className="bg-red-50 border border-red-200 rounded-md p-4">
      <div className="flex">
        <AlertCircle className="h-5 w-5 text-red-400" />
        <div className="ml-3">
          <h3 className="text-sm font-medium text-red-800">
            以下のエラーを修正してください:
          </h3>
          <div className="mt-2 text-sm text-red-700">
            <ul className="list-disc pl-5 space-y-1">
              {allErrors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ErrorSummary;