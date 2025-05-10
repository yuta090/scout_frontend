import React from 'react';
import { FileText, Building2 } from 'lucide-react';

const ReferralLandingBenefits: React.FC = () => {
  return (
    <div className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl font-extrabold text-gray-900 text-center mb-12">
          取次代理店のメリット
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-indigo-50 p-6 rounded-lg">
            <div className="h-12 w-12 bg-indigo-100 text-indigo-600 rounded-md flex items-center justify-center mb-4">
              <FileText className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">安定した収入</h3>
            <p className="text-gray-600">
              紹介した企業が契約すると、契約金額の10%が報酬として支払われます。継続的な収入源となります。
            </p>
          </div>
          <div className="bg-indigo-50 p-6 rounded-lg">
            <div className="h-12 w-12 bg-indigo-100 text-indigo-600 rounded-md flex items-center justify-center mb-4">
              <Building2 className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">初期投資不要</h3>
            <p className="text-gray-600">
              取次代理店は初期投資や在庫を持つ必要がありません。紹介するだけで報酬が得られます。
            </p>
          </div>
          <div className="bg-indigo-50 p-6 rounded-lg">
            <div className="h-12 w-12 bg-indigo-100 text-indigo-600 rounded-md flex items-center justify-center mb-4">
              <FileText className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">充実したサポート</h3>
            <p className="text-gray-600">
              営業資料や提案書など、必要な販促ツールを提供します。専任の担当者がサポートします。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReferralLandingBenefits;