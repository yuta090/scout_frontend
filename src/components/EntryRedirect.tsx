import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';
import { isValidUUID } from '../lib/utils';

const EntryRedirect: React.FC = () => {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const referrerId = searchParams.get('ref');
    
    if (referrerId) {
      // 有効なUUIDかどうかを確認
      if (isValidUUID(referrerId)) {
        // 直接リダイレクト
        window.location.href = `/referral/${referrerId}`;
      } else {
        setError('無効な紹介IDです。');
        setIsLoading(false);
      }
    } else {
      setError('紹介IDが指定されていません。');
      setIsLoading(false);
    }
  }, []);
  
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-center text-gray-900 mb-2">
            エラーが発生しました
          </h1>
          <p className="text-center text-gray-600">
            {error}
          </p>
          <div className="mt-6 text-center">
            <Link to="/" className="text-indigo-600 hover:text-indigo-800">
              ホームに戻る
            </Link>
          </div>
        </div>
      </div>
    );
  }
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }
  
  return null;
};

export default EntryRedirect;