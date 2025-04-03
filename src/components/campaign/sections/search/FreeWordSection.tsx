import React, { useState } from 'react';
import { HelpCircle } from 'lucide-react';

interface FreeWordSectionProps {
  freeWordOr: string;
  freeWordAnd: string;
  onFreeWordOrChange: (value: string) => void;
  onFreeWordAndChange: (value: string) => void;
}

const FreeWordSection: React.FC<FreeWordSectionProps> = ({
  freeWordOr,
  freeWordAnd,
  onFreeWordOrChange,
  onFreeWordAndChange
}) => {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <label className="text-sm font-medium text-gray-700">
          フリーワード
        </label>
        <div className="relative">
          <button
            type="button"
            className="text-gray-400 hover:text-gray-500"
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
          >
            <HelpCircle className="h-5 w-5" />
          </button>
          {showTooltip && (
            <div className="absolute z-10 w-64 px-4 py-3 text-sm bg-gray-900 text-white rounded-lg shadow-lg -right-2 top-full mt-1">
              複数フリーワード入力できます。単語の間には空白を入れてください。
              <div className="absolute -top-1 right-3 w-2 h-2 bg-gray-900 transform rotate-45"></div>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm text-gray-600 mb-1">
            いずれか含む
          </label>
          <div className="relative">
            <input
              type="text"
              value={freeWordOr}
              onChange={(e) => onFreeWordOrChange(e.target.value)}
              placeholder="単語は空白で区切ってください"
              maxLength={200}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
            <div className="absolute right-3 bottom-2 text-xs text-gray-400">
              {freeWordOr.length}/200
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm text-gray-600 mb-1">
            すべて含む
          </label>
          <div className="relative">
            <input
              type="text"
              value={freeWordAnd}
              onChange={(e) => onFreeWordAndChange(e.target.value)}
              placeholder="単語は空白で区切ってください"
              maxLength={200}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
            <div className="absolute right-3 bottom-2 text-xs text-gray-400">
              {freeWordAnd.length}/200
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FreeWordSection;