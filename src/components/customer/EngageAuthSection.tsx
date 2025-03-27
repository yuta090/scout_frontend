import React from 'react';
import { Shield } from 'lucide-react';
import AuthStatusDisplay from './AuthStatusDisplay';

interface EngageAuthSectionProps {
  engageAuthStatus: 'pending' | 'authenticated' | 'failed';
  onAuthCheck: () => void;
  isChecking: boolean;
  isLoading: boolean;
}

const EngageAuthSection: React.FC<EngageAuthSectionProps> = ({
  engageAuthStatus,
  onAuthCheck,
  isChecking,
  isLoading
}) => {
  return (
    <div className="space-y-2 border-t border-gray-200 pt-4">
      <label className="block text-lg font-medium text-gray-700">
        Engage認証情報
      </label>
      
      <div className="flex items-center justify-between mt-2">
        <AuthStatusDisplay status={engageAuthStatus} platform="engage" />
        
        <button
          type="button"
          onClick={onAuthCheck}
          disabled={isChecking || isLoading}
          className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isChecking ? (
            <span className="flex items-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              認証確認中...
            </span>
          ) : (
            <>
              <Shield className="h-4 w-4 mr-1" />
              認証チェック
            </>
          )}
        </button>
      </div>
      
      <p className="text-xs text-gray-500 mt-1">
        Engageの認証はブラウザ連携で行われます。
      </p>
    </div>
  );
};

export default EngageAuthSection;