import React from 'react';
import { X } from 'lucide-react';

interface SubAccountFormHeaderProps {
  title: string;
  onClose: () => void;
}

const SubAccountFormHeader: React.FC<SubAccountFormHeaderProps> = ({ title, onClose }) => {
  return (
    <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
      <h2 className="text-xl font-semibold text-gray-900">
        {title}
      </h2>
      <button
        onClick={onClose}
        className="text-gray-400 hover:text-gray-500 focus:outline-none"
      >
        <X className="h-6 w-6" />
      </button>
    </div>
  );
};

export default SubAccountFormHeader;