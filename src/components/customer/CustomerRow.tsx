import React from 'react';
import { Building2, CheckCircle, AlertCircle, Shield, Phone, Mail, Eye, Edit, Trash2 } from 'lucide-react';
import { Customer } from '../../lib/types';

interface CustomerRowProps {
  customer: Customer;
  style: React.CSSProperties;
  getStatusColor: (status: Customer['status']) => string;
  getStatusText: (status: Customer['status']) => string;
  onAuthCheck: (customer: Customer, platform: 'airwork' | 'engage') => void;
  onView: (customer: Customer) => void;
  onEdit: (customer: Customer) => void;
  onDelete: (customer: Customer) => void;
  isAuthLoading: boolean;
}

const CustomerRow: React.FC<CustomerRowProps> = ({
  customer,
  style,
  getStatusColor,
  getStatusText,
  onAuthCheck,
  onView,
  onEdit,
  onDelete,
  isAuthLoading
}) => {
  // 認証状態のアイコンとテキスト
  const getAuthStatusIcon = (status: 'pending' | 'authenticated' | 'failed') => {
    switch (status) {
      case 'authenticated':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'failed':
      case 'pending':
      default:
        return <AlertCircle className="h-5 w-5 text-red-500" />;
    }
  };

  const getAuthStatusText = (status: 'pending' | 'authenticated' | 'failed') => {
    switch (status) {
      case 'authenticated':
        return '認証済み';
      case 'failed':
        return '認証失敗';
      case 'pending':
      default:
        return '未認証';
    }
  };

  return (
    <li key={customer.id} style={style} className="px-4 py-4 sm:px-6 hover:bg-gray-50 transition-colors duration-150">
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
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="flex items-center">
              <span className="text-sm text-gray-500 mr-1">AirWork:</span>
              <div className="flex items-center">
                <div className="tooltip-wrapper relative">
                  {getAuthStatusIcon(customer.airwork_auth_status)}
                  <div className="tooltip -mt-8 -ml-16">
                    {getAuthStatusText(customer.airwork_auth_status)}
                  </div>
                </div>
              </div>
              {customer.airwork_auth_status !== 'authenticated' && (
                <button
                  onClick={() => onAuthCheck(customer, 'airwork')}
                  disabled={isAuthLoading}
                  className="ml-2 inline-flex items-center px-2 py-1 text-xs font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isAuthLoading ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-2 h-3 w-3 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      確認中
                    </span>
                  ) : (
                    <>
                      <Shield className="h-3 w-3 mr-1" />
                      認証チェック
                    </>
                  )}
                </button>
              )}
            </div>

            <div className="flex items-center ml-4">
              <span className="text-sm text-gray-500 mr-1">Engage:</span>
              <div className="flex items-center">
                <div className="tooltip-wrapper relative">
                  {getAuthStatusIcon(customer.engage_auth_status)}
                  <div className="tooltip -mt-8 -ml-16">
                    {getAuthStatusText(customer.engage_auth_status)}
                  </div>
                </div>
              </div>
              {customer.engage_auth_status !== 'authenticated' && (
                <button
                  onClick={() => onAuthCheck(customer, 'engage')}
                  disabled={isAuthLoading}
                  className="ml-2 inline-flex items-center px-2 py-1 text-xs font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isAuthLoading ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-2 h-3 w-3 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      確認中
                    </span>
                  ) : (
                    <>
                      <Shield className="h-3 w-3 mr-1" />
                      認証チェック
                    </>
                  )}
                </button>
              )}
            </div>
          </div>

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
            <div className="group relative">
              <button
                onClick={() => onView(customer)}
                className="p-2 text-gray-400 hover:text-gray-500 focus:outline-none transition-colors duration-200"
                aria-label="詳細を表示"
              >
                <Eye className="h-5 w-5" />
              </button>
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none">
                顧客詳細を表示
              </div>
            </div>
            <div className="group relative">
              <button
                onClick={() => onEdit(customer)}
                className="p-2 text-gray-400 hover:text-gray-500 focus:outline-none transition-colors duration-200"
                aria-label="顧客情報を編集"
              >
                <Edit className="h-5 w-5" />
              </button>
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none">
                顧客情報を編集
              </div>
            </div>
            <div className="group relative">
              <button
                onClick={() => onDelete(customer)}
                className="p-2 text-gray-400 hover:text-red-500 focus:outline-none transition-colors duration-200"
                aria-label="顧客を削除"
              >
                <Trash2 className="h-5 w-5" />
              </button>
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none">
                顧客を削除
              </div>
            </div>
          </div>
        </div>
      </div>
    </li>
  );
};

export default CustomerRow;