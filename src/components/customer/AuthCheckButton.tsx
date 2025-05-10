import React from 'react';
import { Shield } from 'lucide-react';

interface AuthCheckButtonProps {
  onClick: () => void;
  isLoading: boolean;
}

const AuthCheckButton: React.FC<AuthCheckButtonProps> = ({ onClick, isLoading }) => {
  return (
    <button
      onClick={onClick}
      disabled={isLoading}
      className="ml-2 inline-flex items-center px-2 py-1 text-xs font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {isLoading ? (
        <span className="flex items-center">
          <svg className="animate-spin -ml-1 mr-2 h-3 w-3 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          確認中
        </span>
      ) : (
        <>
          <Shield className="h-3 w-3 mr-1" />
          認証チェック
        </>
      )}
    </button>
  );
};

export default AuthCheckButton;