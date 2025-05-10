import React, { useState, useEffect } from 'react';
import { Copy, Check, Link } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface ReferralCopyLinkButtonProps {
  userId: string;
  className?: string;
}

const ReferralCopyLinkButton: React.FC<ReferralCopyLinkButtonProps> = ({ userId, className = '' }) => {
  const [referralLink, setReferralLink] = useState('');
  const [copied, setCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchReferralLink = async () => {
      try {
        setIsLoading(true);
        
        // 紹介リンクを取得
        const baseUrl = window.location.origin;
        const link = `${baseUrl}/entry?ref=${userId}`;
        setReferralLink(link);
      } catch (error) {
        console.error('Error fetching referral link:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    if (userId) {
      fetchReferralLink();
    }
  }, [userId]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(referralLink).then(
      () => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      },
      (err) => {
        console.error('クリップボードへのコピーに失敗しました:', err);
      }
    );
  };

  if (isLoading) {
    return (
      <button
        disabled
        className={`inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${className}`}
      >
        <div className="animate-spin h-4 w-4 mr-2 border-2 border-gray-500 border-t-transparent rounded-full"></div>
        読み込み中...
      </button>
    );
  }

  return (
    <button
      onClick={copyToClipboard}
      className={`inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${className}`}
    >
      {copied ? (
        <>
          <Check className="h-4 w-4 mr-2 text-green-500" />
          コピー完了
        </>
      ) : (
        <>
          <Copy className="h-4 w-4 mr-2" />
          紹介リンクをコピー
        </>
      )}
    </button>
  );
};

export default ReferralCopyLinkButton;