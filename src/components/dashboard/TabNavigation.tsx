import React from 'react';

interface TabNavigationProps {
  activeTab: 'dashboard' | 'customers';
  onTabChange: (tab: 'dashboard' | 'customers') => void;
}

const TabNavigation: React.FC<TabNavigationProps> = ({ activeTab, onTabChange }) => {
  return (
    <nav className="-mb-px flex space-x-8">
      <button
        onClick={() => onTabChange('dashboard')}
        className={`
          py-4 px-1 border-b-2 font-medium text-sm
          ${activeTab === 'dashboard'
            ? 'border-indigo-500 text-indigo-600'
            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
        `}
      >
        ダッシュボード
      </button>
      <button
        onClick={() => onTabChange('customers')}
        className={`
          py-4 px-1 border-b-2 font-medium text-sm
          ${activeTab === 'customers'
            ? 'border-indigo-500 text-indigo-600'
            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
        `}
      >
        顧客管理
      </button>
    </nav>
  );
};

export default TabNavigation;