import React from 'react';

interface CustomerProgressBarProps {
  current: number;
  total: number;
  message: string;
}

const CustomerProgressBar: React.FC<CustomerProgressBarProps> = ({
  current,
  total,
  message
}) => {
  if (total === 0) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 bg-white border-t border-gray-200 shadow-lg p-4 z-50">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-700">
              {message}
            </span>
            <span className="text-sm text-indigo-600 font-medium">
              {current}/{total}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-indigo-600 h-2 rounded-full transition-all duration-300 ease-in-out"
              style={{ width: `${(current / total) * 100}%` }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerProgressBar;