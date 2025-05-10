import React from 'react';
import { Eye, Edit, Trash2 } from 'lucide-react';
import { Customer } from '../../lib/types';

interface CustomerActionsProps {
  customer: Customer;
  onView: (customer: Customer) => void;
  onEdit: (customer: Customer) => void;
  onDelete: (customer: Customer) => void;
}

const CustomerActions: React.FC<CustomerActionsProps> = ({
  customer,
  onView,
  onEdit,
  onDelete
}) => {
  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => onView(customer)}
        className="p-2 text-gray-400 hover:text-gray-500 focus:outline-none"
      >
        <span className="sr-only">詳細</span>
        <Eye className="h-5 w-5" />
      </button>
      <button
        onClick={() => onEdit(customer)}
        className="p-2 text-gray-400 hover:text-gray-500 focus:outline-none"
      >
        <span className="sr-only">編集</span>
        <Edit className="h-5 w-5" />
      </button>
      <button
        onClick={() => onDelete(customer)}
        className="p-2 text-gray-400 hover:text-red-500 focus:outline-none"
      >
        <span className="sr-only">削除</span>
        <Trash2 className="h-5 w-5" />
      </button>
    </div>
  );
};

export default CustomerActions;