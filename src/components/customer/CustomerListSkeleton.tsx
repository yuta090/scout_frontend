import React from 'react';

const CustomerListSkeleton: React.FC = () => {
  return (
    <div className="animate-pulse p-8 space-y-8">
      {Array(5).fill(0).map((_, index) => (
        <div key={index} className="flex items-center space-x-4">
          <div className="h-10 w-10 rounded-full bg-gray-200"></div>
          <div className="flex-1">
            <div className="h-5 bg-gray-200 rounded w-3/4 mb-3"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
          <div className="flex space-x-4">
            <div className="flex space-x-2">
              <div className="h-8 w-24 bg-gray-200 rounded"></div>
              <div className="h-8 w-24 bg-gray-200 rounded"></div>
            </div>
            <div className="flex space-x-2">
              <div className="h-8 w-8 rounded-full bg-gray-200"></div>
              <div className="h-8 w-8 rounded-full bg-gray-200"></div>
              <div className="h-8 w-8 rounded-full bg-gray-200"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default CustomerListSkeleton;