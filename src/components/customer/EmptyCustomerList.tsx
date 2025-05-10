import React from 'react';
import { FileText } from 'lucide-react';

interface EmptyCustomerListProps {
  searchTerm: string;
}

const EmptyCustomerList: React.FC<EmptyCustomerListProps> = ({ searchTerm }) => {
  return (
    <div className="px-4 py-8 text-center text-gray-500">
      <FileText className="mx-auto h-12 w-12 text-gray-400" />
      {searchTerm ? (
        <>
          <p className="mt-2">検索条件に一致する顧客が見つかりません</p>
          <p className="mt-1 text-sm">検索条件を変更してお試しください</p>
        </>
      ) : (
        <>
          <p className="mt-2">登録済みの顧客がいません</p>
          <p className="mt-1 text-sm">「新規顧客登録」から顧客を追加してください</p>
        </>
      )}
    </div>
  );
};

export default EmptyCustomerList;