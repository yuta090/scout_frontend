import React, { useState } from 'react';
import { Link, Copy, ExternalLink } from 'lucide-react';

interface ReferralLinkSectionProps {
  referralLink: string;
}

const ReferralLinkSection: React.FC<ReferralLinkSectionProps> = ({ referralLink }) => {
  const [copySuccess, setCopySuccess] = useState(false);

  // 紹介リンクをコピーする関数
  const copyToClipboard = () => {
    navigator.clipboard.writeText(referralLink).then(
      () => {
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
      },
      (err) => {
        console.error('クリップボードへのコピーに失敗しました:', err);
      }
    );
  };

  return (
    <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg shadow-lg p-6 text-white">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold mb-2 flex items-center">
            <Link className="h-5 w-5 mr-2" />
            あなたの紹介リンク
          </h2>
          <p className="text-indigo-100 mb-4">
            このリンクを共有して企業を紹介すると、成約時に報酬が発生します。
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
          <div className="relative flex-grow">
            <input
              type="text"
              value={referralLink}
              readOnly
              className="w-full px-4 py-2 pr-10 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={copyToClipboard}
              className="px-4 py-2 bg-white text-indigo-700 rounded-lg font-medium hover:bg-indigo-100 transition-colors flex items-center"
            >
              <Copy className="h-4 w-4 mr-2" />
              {copySuccess ? 'コピー完了！' : 'コピー'}
            </button>
            <a
              href={referralLink}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-indigo-700 text-white rounded-lg font-medium hover:bg-indigo-800 transition-colors flex items-center"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              開く
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReferralLinkSection;