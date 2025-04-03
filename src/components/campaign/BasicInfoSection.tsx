import React from 'react';
import { Building2 } from 'lucide-react';

interface BasicInfoSectionProps {
  title: string;
  description: string;
  selectedPlatform: 'airwork' | 'engage' | null;
  onTitleChange: (title: string) => void;
  onDescriptionChange: (description: string) => void;
  onPlatformSelect: (platform: 'airwork' | 'engage') => void;
}

const BasicInfoSection: React.FC<BasicInfoSectionProps> = ({
  title,
  description,
  selectedPlatform,
  onTitleChange,
  onDescriptionChange,
  onPlatformSelect
}) => {
  return (
    <div className="space-y-6">
      {/* Hidden title and description fields */}
      <div className="hidden">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
            タイトル <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => onTitleChange(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="スカウト案件のタイトルを入力"
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            説明
          </label>
          <input
            type="text"
            id="description"
            value={description}
            onChange={(e) => onDescriptionChange(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="スカウト案件の説明を入力"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          プラットフォーム <span className="text-red-500">*</span>
        </label>
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => onPlatformSelect('airwork')}
            className={`p-4 border rounded-lg flex items-center justify-center space-x-2 ${
              selectedPlatform === 'airwork'
                ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                : 'border-gray-300 hover:bg-gray-50'
            }`}
          >
            <Building2 className="h-5 w-5" />
            <span>Airワーク</span>
          </button>
          <button
            onClick={() => onPlatformSelect('engage')}
            className={`p-4 border rounded-lg flex items-center justify-center space-x-2 ${
              selectedPlatform === 'engage'
                ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                : 'border-gray-300 hover:bg-gray-50'
            }`}
          >
            <Building2 className="h-5 w-5" />
            <span>Engage</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default BasicInfoSection;