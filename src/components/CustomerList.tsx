import React, { useState } from 'react';
import { Building2, Phone, Mail, Edit, Trash2, Plus, Search, Upload, Eye, FileText } from 'lucide-react';
import type { Customer } from '../lib/supabase';
import CustomerDetail from './CustomerDetail';

interface CustomerListProps {
  customers: Customer[];
  onEdit: (customer: Customer) => void;
  onDelete: (customer: Customer) => void;
  onAdd: () => void;
  onBulkUpload: () => void;
}

const CustomerList: React.FC<CustomerListProps> = ({ customers, onEdit, onDelete, onAdd, onBulkUpload }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  const filteredCustomers = customers.filter(customer =>
    customer.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.contact_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: Customer['status']) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: Customer['status']) => {
    switch (status) {
      case 'active':
        return '有効';
      case 'inactive':
        return '無効';
      case 'pending':
        return '保留中';
    }
  };

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-4 py-5 sm:px-6 flex flex-wrap gap-4 justify-between items-center">
        <div>
          <h2 className="text-lg font-medium text-gray-900">顧客一覧</h2>
          <p className="mt-1 text-sm text-gray-500">
            登録済みの顧客情報を管理します
          </p>
        </div>
        <div className="flex gap-4">
          <div className="relative">
            <input
              type="text"
              placeholder="顧客を検索..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          </div>
          <button
            onClick={onBulkUpload}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <Upload className="h-5 w-5 mr-2" />
            一括登録
          </button>
          <button
            onClick={onAdd}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <Plus className="h-5 w-5 mr-2" />
            新規顧客登録
          </button>
        </div>
      </div>
      <div className="border-t border-gray-200">
        <ul className="divide-y divide-gray-200">
          {filteredCustomers.map((customer) => (
            <li key={customer.id} className="px-4 py-4 sm:px-6 hover:bg-gray-50 transition-colors duration-150">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
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
                        {customer._count && (
                          <span className="ml-4 inline-flex items-center text-gray-500">
                            <FileText className="h-4 w-4 mr-1" />
                            スカウト: {customer._count.scouts}件
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  {customer.phone && (
                    <div className="flex items-center text-gray-500">
                      <Phone className="h-5 w-5 mr-1" />
                      <span>{customer.phone}</span>
                    </div>
                  )}
                  {customer.email && (
                    <div className="flex items-center text-gray-500">
                      <Mail className="h-5 w-5 mr-1" />
                      <span>{customer.email}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 ml-4">
                    <button
                      onClick={() => setSelectedCustomer(customer)}
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
                </div>
              </div>
            </li>
          ))}
          {filteredCustomers.length === 0 && (
            <li className="px-4 py-8 text-center text-gray-500">
              {searchTerm ? (
                <>
                  <p>検索条件に一致する顧客が見つかりません</p>
                  <p className="mt-1 text-sm">検索条件を変更してお試しください</p>
                </>
              ) : (
                <>
                  <p>登録済みの顧客がいません</p>
                  <p className="mt-1 text-sm">「新規顧客登録」から顧客を追加してください</p>
                </>
              )}
            </li>
          )}
        </ul>
      </div>

      {selectedCustomer && (
        <CustomerDetail
          customer={selectedCustomer}
          onClose={() => setSelectedCustomer(null)}
          onEdit={() => {
            onEdit(selectedCustomer);
            setSelectedCustomer(null);
          }}
        />
      )}
    </div>
  );
};

export default CustomerList;