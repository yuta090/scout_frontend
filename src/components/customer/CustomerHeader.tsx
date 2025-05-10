import React from 'react';
import { Building2 } from 'lucide-react';
import { Customer } from '../../lib/types';

interface CustomerHeaderProps {
  customer: Customer;
  getStatusColor: (status: Customer['status']) => string;
  getStatusText: (status: Customer['status']) => string;
}

const CustomerHeader: React.FC<CustomerHeaderProps> = ({
  customer,
  getStatusColor,
  getStatusText
}) => {
  return (
    <div className="flex items-center">
      <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
        <Building2 className="h-6 w-6 text-indigo-600" />
      </div>
      <div className="ml-4">
        <h3 className="text-lg font-medium text-gray-900">
          {customer.company_name}
        </h3>
        <div className="mt-1 flex items-center text-sm text-gray-500">
          {customer.contact_name && (
            <span className="mr-4">担当: {customer.contact_name}</span>
          )}
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(customer.status)}`}>
            {getStatusText(customer.status)}
          </span>
          {/* スカウト件数表示を削除 */}
        </div>
      </div>
    </div>
  );
};

export default CustomerHeader;