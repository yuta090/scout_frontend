import React from 'react';
import { Shield, CheckCircle, AlertCircle, Clock, Loader } from 'lucide-react';

interface AirworkAuthSectionProps {
  airworkLogin: {
    username?: string;
    password?: string;
  };
  airworkAuthStatus: 'pending' | 'authenticated' | 'failed';
  onAirworkLoginChange: (airworkLogin: { username?: string; password?: string }) => void;
  onAuthCheck: () => void;
  isChecking: boolean;
  isLoading: boolean;
  authError?: string;
}

const AirworkAuthSection: React.FC<AirworkAuthSectionProps> = ({
  airworkLogin,
  airworkAuthStatus,
  onAirworkLoginChange,
  onAuthCheck,
  isChecking,
  isLoading,
  authError
}) => {
  const getStatusDisplay = () => {
    switch (airworkAuthStatus) {
      case 'authenticated':
        return (
          <div className="flex items-center text-green-600">
            <CheckCircle className="h-5 w-5 mr-2" />
            <span className="font-medium">認証済み</span>
          </div>
        );
      case 'failed':
        return (
          <div className="flex items-center text-red-600">
            <AlertCircle className="h-5 w-5 mr-2" />
            <span className="font-medium">認証失敗</span>
          </div>
        );
      default:
        return (
          <div className="flex items-center text-yellow-600">
            <Clock className="h-5 w-5 mr-2" />
            <span className="font-medium">未認証</span>
          </div>
        );
    }
  };

  const isCredentialsValid = () => {
    return !!(airworkLogin?.username?.trim() && airworkLogin?.password?.trim());
  };

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onAirworkLoginChange({
      ...airworkLogin,
      username: e.target.value
    });
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onAirworkLoginChange({
      ...airworkLogin,
      password: e.target.value
    });
  };

  return (
    <div className="space-y-4 border-t border-gray-200 pt-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">
          Airワーク認証情報
        </h3>
        {getStatusDisplay()}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="airwork_username" className="block text-sm font-medium text-gray-700 mb-1">
            ユーザー名
          </label>
          <input
            type="text"
            id="airwork_username"
            placeholder="ユーザー名を入力"
            value={airworkLogin?.username || ''}
            onChange={handleUsernameChange}
            className={`w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
              airworkAuthStatus === 'failed' ? 'border-red-300' : 'border-gray-300'
            }`}
            disabled={isChecking || isLoading}
          />
        </div>
        <div>
          <label htmlFor="airwork_password" className="block text-sm font-medium text-gray-700 mb-1">
            パスワード
          </label>
          <input
            type="password"
            id="airwork_password"
            placeholder="パスワードを入力"
            value={airworkLogin?.password || ''}
            onChange={handlePasswordChange}
            className={`w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
              airworkAuthStatus === 'failed' ? 'border-red-300' : 'border-gray-300'
            }`}
            disabled={isChecking || isLoading}
          />
        </div>
      </div>

      {!isCredentialsValid() && (
        <p className="text-sm text-amber-600">
          認証を行うにはユーザー名とパスワードを入力してください
        </p>
      )}

      {authError && (
        <div className="bg-red-50 border border-red-200 rounded-md p-3">
          <div className="flex">
            <AlertCircle className="h-5 w-5 text-red-400" />
            <p className="ml-2 text-sm text-red-600">{authError}</p>
          </div>
        </div>
      )}

      <div className="flex justify-end">
        <button
          type="button"
          onClick={onAuthCheck}
          disabled={isChecking || isLoading || !isCredentialsValid()}
          className={`
            inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md
            ${isChecking || isLoading || !isCredentialsValid()
              ? 'bg-gray-300 cursor-not-allowed'
              : 'text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
            }
          `}
        >
          {isChecking ? (
            <>
              <Loader className="animate-spin h-4 w-4 mr-2" />
              認証確認中...
            </>
          ) : (
            <>
              <Shield className="h-4 w-4 mr-2" />
              認証チェック
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default AirworkAuthSection;