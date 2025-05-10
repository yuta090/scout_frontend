import React from 'react';
import { CheckCircle, AlertCircle } from 'lucide-react';

interface AuthStatusBadgeProps {
  status: 'pending' | 'authenticated' | 'failed';
  platform: 'airwork' | 'engage';
}

const AuthStatusBadge: React.FC<AuthStatusBadgeProps> = ({ status, platform }) => {
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

  return (
    <div className="tooltip-wrapper relative">
      {status === 'authenticated' ? (
        <CheckCircle className="h-5 w-5 text-green-500" />
      ) : (
        <AlertCircle className="h-5 w-5 text-red-500" />
      )}
      <div className="tooltip -mt-8 -ml-16">
        {getAuthStatusText(status)}
      </div>
    </div>
  );
};

export default AuthStatusBadge;