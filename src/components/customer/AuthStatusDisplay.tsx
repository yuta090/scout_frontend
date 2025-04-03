import React from 'react';
import { CheckCircle, AlertCircle, Clock } from 'lucide-react';

interface AuthStatusDisplayProps {
  status: 'pending' | 'authenticated' | 'failed';
  platform: 'airwork' | 'engage';
}

const AuthStatusDisplay: React.FC<AuthStatusDisplayProps> = ({ status, platform }) => {
  const getAuthStatusIcon = (status: 'pending' | 'authenticated' | 'failed') => {
    switch (status) {
      case 'authenticated':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'failed':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      case 'pending':
      default:
        return <Clock className="h-5 w-5 text-yellow-500" />;
    }
  };

  const getAuthStatusText = (status: 'pending' | 'authenticated' | 'failed') => {
    switch (status) {
      case 'authenticated':
        return '認証済み';
      case 'failed':
        return '認証失敗';
      case 'pending':
      default:
        return '未認証';
    }
  };

  const getAuthStatusColor = (status: 'pending' | 'authenticated' | 'failed') => {
    switch (status) {
      case 'authenticated':
        return 'bg-green-100 text-green-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'pending':
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  return (
    <div className="flex items-center">
      <span className="text-sm font-medium text-gray-700 mr-2">認証状態:</span>
      <div className="flex items-center">
        {getAuthStatusIcon(status)}
        <span className={`ml-1 px-2 py-0.5 rounded-full text-xs font-medium ${getAuthStatusColor(status)}`}>
          {getAuthStatusText(status)}
        </span>
      </div>
    </div>
  );
};

export default AuthStatusDisplay;