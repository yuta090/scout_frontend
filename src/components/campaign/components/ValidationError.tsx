import React from 'react';
import { AlertCircle } from 'lucide-react';

interface ValidationErrorProps {
  errors: string[];
}

const ValidationError: React.FC<ValidationErrorProps> = ({ errors }) => {
  if (!errors || errors.length === 0) return null;

  return (
    <div className="mt-1">
      {errors.map((error, index) => (
        <div key={index} className="flex items-start text-sm text-red-600">
          <AlertCircle className="h-4 w-4 mr-1 mt-0.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      ))}
    </div>
  );
};

export default ValidationError;