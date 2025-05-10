import React from 'react';
import { Download } from 'lucide-react';

interface ScoutHistoryHeaderProps {
  handleExport: () => void;
}

const ScoutHistoryHeader: React.FC<ScoutHistoryHeaderProps> = ({ handleExport }) => {
  return (
    <div className="flex justify-between items-center">
      <h1 className="text-2xl font-bold text-gray-900">スカウト送信管理</h1>
      
      <button
        onClick={handleExport}
        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
      >
        <Download className="h-4 w-4 mr-2" />
        Excelダウンロード
      </button>
    </div>
  );
};

export default ScoutHistoryHeader;