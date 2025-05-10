import React, { useState } from 'react';
import AirworkAuthSection from './AirworkAuthSection';
import EngageAuthSection from './EngageAuthSection';
import { checkAirworkAuth, checkEngageAuth } from '../../lib/supabase/auth';

interface AuthenticationSectionProps {
  airworkLogin: {
    username?: string;
    password?: string;
  };
  airworkAuthStatus: 'pending' | 'authenticated' | 'failed';
  engageAuthStatus: 'pending' | 'authenticated' | 'failed';
  onAirworkLoginChange: (airworkLogin: { username?: string; password?: string }) => void;
  onAuthStatusChange: (platform: 'airwork' | 'engage', status: 'pending' | 'authenticated' | 'failed') => void;
  customerId?: string;
  isLoading: boolean;
  authError?: string | null;
}

const AuthenticationSection: React.FC<AuthenticationSectionProps> = ({
  airworkLogin,
  airworkAuthStatus,
  engageAuthStatus,
  onAirworkLoginChange,
  onAuthStatusChange,
  customerId,
  isLoading,
  authError
}) => {
  const [checkingAuth, setCheckingAuth] = useState<{platform: 'airwork' | 'engage'} | null>(null);
  const [authLogs, setAuthLogs] = useState<Array<{
    timestamp: string;
    message: string;
    data?: any;
    error?: string;
  }>>([]);

  const handleAuthCheck = async (platform: 'airwork' | 'engage') => {
    if (!customerId) {
      setAuthLogs(prev => [...prev, {
        timestamp: new Date().toISOString(),
        message: '認証エラー',
        error: '顧客IDが指定されていません'
      }]);
      return;
    }

    setCheckingAuth({platform});
    
    try {
      if (platform === 'airwork') {
        setAuthLogs(prev => [...prev, {
          timestamp: new Date().toISOString(),
          message: 'Airワーク認証を開始',
          data: { customerId }
        }]);

        const result = await checkAirworkAuth(
          airworkLogin.username,
          airworkLogin.password
        );
        
        onAuthStatusChange(platform, result.success ? 'authenticated' : 'failed');
        
        if (result.logs) {
          setAuthLogs(prev => [...prev, ...result.logs]);
        }

        setAuthLogs(prev => [...prev, {
          timestamp: new Date().toISOString(),
          message: `認証${result.success ? '成功' : '失敗'}: ${result.message}`
        }]);

      } else {
        setAuthLogs(prev => [...prev, {
          timestamp: new Date().toISOString(),
          message: 'Engage認証を開始',
          data: { customerId }
        }]);

        const result = await checkEngageAuth(customerId);
        onAuthStatusChange(platform, result.success ? 'authenticated' : 'failed');

        setAuthLogs(prev => [...prev, {
          timestamp: new Date().toISOString(),
          message: `認証${result.success ? '成功' : '失敗'}: ${result.message}`
        }]);
      }
    } catch (error) {
      console.error(`Error checking ${platform} authentication:`, error);
      onAuthStatusChange(platform, 'failed');
      
      setAuthLogs(prev => [...prev, {
        timestamp: new Date().toISOString(),
        message: '認証エラー',
        error: error instanceof Error ? error.message : '不明なエラー'
      }]);
    } finally {
      setCheckingAuth(null);
    }
  };

  return (
    <div className="space-y-6">
      <AirworkAuthSection 
        airworkLogin={airworkLogin}
        airworkAuthStatus={airworkAuthStatus}
        onAirworkLoginChange={onAirworkLoginChange}
        onAuthCheck={() => handleAuthCheck('airwork')}
        isChecking={checkingAuth?.platform === 'airwork'}
        isLoading={isLoading}
        authError={authError}
      />
      
      <EngageAuthSection 
        engageAuthStatus={engageAuthStatus}
        onAuthCheck={() => handleAuthCheck('engage')}
        isChecking={checkingAuth?.platform === 'engage'}
        isLoading={isLoading}
      />

      <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <h4 className="text-sm font-medium text-gray-700 mb-2">認証プロセスログ</h4>
        <div className="space-y-2 text-sm text-gray-600 max-h-60 overflow-y-auto">
          {authLogs.length === 0 ? (
            <div className="text-gray-500 italic">
              認証プロセスを開始すると、ここにログが表示されます
            </div>
          ) : (
            authLogs.map((log, index) => (
              <div key={index} className="flex items-start">
                <span className="text-gray-400 mr-2 whitespace-nowrap">
                  {new Date(log.timestamp).toLocaleTimeString()}
                </span>
                <div className="flex-1">
                  <span className={log.error ? 'text-red-600' : 'text-gray-700'}>
                    {log.message}
                  </span>
                  {log.data && (
                    <pre className="mt-1 text-xs bg-gray-100 p-2 rounded">
                      {JSON.stringify(log.data, null, 2)}
                    </pre>
                  )}
                  {log.error && (
                    <div className="mt-1 text-xs text-red-500">
                      エラー: {log.error}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthenticationSection;