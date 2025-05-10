import React from 'react';
import { Shield, Search, Upload, Plus } from 'lucide-react';

interface CustomerListHeaderProps {
  onCheckAllAuth: () => void;
  onBulkUpload: () => void;
  onAdd: () => void;
  searchTerm: string;
  onSearchChange: (value: string) => void;
  isCheckingAllAuth: boolean;
  customersCount?: number;
}

const CustomerListHeader: React.FC<CustomerListHeaderProps> = ({
  onCheckAllAuth,
  onBulkUpload,
  onAdd,
  searchTerm,
  onSearchChange,
  isCheckingAllAuth,
  customersCount
}) => {
  return (
    <div className="px-4 py-5 sm:px-6 flex flex-wrap gap-4 justify-between items-center">
      <div>
        <h2 className="text-lg font-medium text-gray-900">顧客一覧</h2>
        <p className="mt-1 text-sm text-gray-500">
          {customersCount !== undefined ? `${customersCount}件の顧客が登録されています` : '登録済みの顧客情報を管理します'}
        </p>
      </div>
      <div className="flex gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={onCheckAllAuth}
            disabled={isCheckingAllAuth}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isCheckingAllAuth ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                認証確認中...
              </span>
            ) : (
              <>
                <Shield className="h-4 w-4 mr-2" />
                全て認証チェック
              </>
            )}
          </button>
          <div className="relative">
            <input
              type="text"
              placeholder="顧客を検索..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          </div>
          <button
            onClick={onBulkUpload}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <Upload className="h-5 w-5 mr-2" />
            一括登録
          </button>
          <button
            onClick={onAdd}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <Plus className="h-5 w-5 mr-2" />
            新規顧客登録
          </button>
        </div>
      </div>
    </div>
  );
};

export default CustomerListHeader;