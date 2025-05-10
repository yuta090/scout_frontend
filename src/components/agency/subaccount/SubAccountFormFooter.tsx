import React from 'react';

interface SubAccountFormFooterProps {
  onCancel: () => void;
  isLoading: boolean;
  isEditing: boolean;
}

const SubAccountFormFooter: React.FC<SubAccountFormFooterProps> = ({
  onCancel,
  isLoading,
  isEditing
}) => {
  return (
    <div className="flex justify-end gap-4 pt-4 border-t border-gray-200">
      <button
        type="button"
        onClick={onCancel}
        disabled={isLoading}
        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
      >
        キャンセル
      </button>
      <button
        type="submit"
        disabled={isLoading}
        className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? '処理中...' : (isEditing ? '更新' : '登録')}
      </button>
    </div>
  );
};

export default SubAccountFormFooter;