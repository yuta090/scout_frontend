import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Building2, Phone, Mail, Edit, Trash2, Plus, Search, Upload, Eye, FileText, CheckCircle, AlertCircle, Shield } from 'lucide-react';
import type { Customer } from '../lib/supabase';
import CustomerDetail from './CustomerDetail';
import { supabase, checkAirworkAuth, checkEngageAuth } from '../lib/supabase';

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
  const [checkingAuth, setCheckingAuth] = useState<{id: string, platform: 'airwork' | 'engage'} | null>(null);
  const [checkingAllAuth, setCheckingAllAuth] = useState(false);
  const [checkProgress, setCheckProgress] = useState<{
    current: number;
    total: number;
    message: string;
  }>({ current: 0, total: 0, message: '' });

  // 検索結果のメモ化
  const filteredCustomers = useMemo(() => {
    const searchLower = searchTerm.toLowerCase();
    return customers.filter(customer =>
      customer.company_name.toLowerCase().includes(searchLower) ||
      customer.contact_name?.toLowerCase().includes(searchLower) ||
      customer.email?.toLowerCase().includes(searchLower)
    );
  }, [customers, searchTerm]);

  // ステータス関連の関数をメモ化
  const getStatusColor = useCallback((status: Customer['status']) => {
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
  }, []);

  const getStatusText = useCallback((status: Customer['status']) => {
    switch (status) {
      case 'active':
        return '有効';
      case 'inactive':
        return '無効';
      case 'pending':
        return '保留中';
    }
  }, []);

  const getAuthStatusText = useCallback((status: 'pending' | 'authenticated' | 'failed') => {
    switch (status) {
      case 'authenticated':
        return '認証済み';
      case 'failed':
        return '認証失敗';
      case 'pending':
      default:
        return '未認証';
    }
  }, []);

  // 認証チェック処理をメモ化
  const handleAuthCheck = useCallback(async (customer: Customer, platform: 'airwork' | 'engage') => {
    setCheckingAuth({id: customer.id, platform});

    try {
      const result = platform === 'airwork'
        ? await checkAirworkAuth(customer.id)
        : await checkEngageAuth(customer.id);

      const customerIndex = customers.findIndex(c => c.id === customer.id);
      if (customerIndex !== -1) {
        customers[customerIndex] = {
          ...customers[customerIndex],
          [platform === 'airwork' ? 'airwork_auth_status' : 'engage_auth_status']:
            result.success ? 'authenticated' : 'failed'
        };
      }

      if (!result.success) {
        console.warn(`Authentication failed: ${result.message}`);
      }
    } catch (error) {
      console.error(`Error checking ${platform} authentication:`, error);

      const customerIndex = customers.findIndex(c => c.id === customer.id);
      if (customerIndex !== -1) {
        customers[customerIndex] = {
          ...customers[customerIndex],
          [platform === 'airwork' ? 'airwork_auth_status' : 'engage_auth_status']: 'failed'
        };
      }
    } finally {
      setCheckingAuth(null);
    }
  }, [customers]);

  // 全認証チェック処理をメモ化
  const handleCheckAllAuth = useCallback(async () => {
    setCheckingAllAuth(true);

    try {
      const authChecksNeeded = customers.flatMap(customer => {
        const checks = [];
        if (customer.airwork_auth_status !== 'authenticated') {
          checks.push({ customer, platform: 'airwork' as const });
        }
        if (customer.engage_auth_status !== 'authenticated') {
          checks.push({ customer, platform: 'engage' as const });
        }
        return checks;
      });

      setCheckProgress({
        current: 0,
        total: authChecksNeeded.length,
        message: '認証チェックを開始します...'
      });

      for (let i = 0; i < authChecksNeeded.length; i++) {
        const { customer, platform } = authChecksNeeded[i];

        setCheckProgress({
          current: i + 1,
          total: authChecksNeeded.length,
          message: `${customer.company_name}の${platform === 'airwork' ? 'AirWork' : 'Engage'}認証をチェック中...`
        });

        await handleAuthCheck(customer, platform);
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      setCheckProgress({
        current: authChecksNeeded.length,
        total: authChecksNeeded.length,
        message: '全ての認証チェックが完了しました'
      });

      setTimeout(() => {
        setCheckProgress({ current: 0, total: 0, message: '' });
      }, 2000);

    } finally {
      setCheckingAllAuth(false);
    }
  }, [customers, handleAuthCheck]);

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
          <div className="flex items-center gap-4">
            <button
              onClick={handleCheckAllAuth}
              disabled={checkingAllAuth}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {checkingAllAuth ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  認証確認中...
                </span>
              ) : (
                <>
                  <Shield className="h-4 w-4 mr-2" />
                  全て認証チェック
                </>
              )}
            </button>
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
      </div>

      {checkProgress.total > 0 && (
        <div className="fixed inset-x-0 bottom-0 bg-white border-t border-gray-200 shadow-lg p-4 z-50">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700">
                  {checkProgress.message}
                </span>
                <span className="text-sm text-indigo-600 font-medium">
                  {checkProgress.current}/{checkProgress.total}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-indigo-600 h-2 rounded-full transition-all duration-300 ease-in-out"
                  style={{ width: `${(checkProgress.current / checkProgress.total) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      )}

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
                  <div className="flex items-center gap-2">
                    <div className="flex items-center">
                      <span className="text-sm text-gray-500 mr-1">AirWork:</span>
                      <div className="flex items-center">
                        <div className="tooltip-wrapper relative">
                          {customer.airwork_auth_status === 'authenticated' ? (
                            <CheckCircle className="h-5 w-5 text-green-500" />
                          ) : (
                            <AlertCircle className="h-5 w-5 text-red-500" />
                          )}
                          <div className="tooltip -mt-8 -ml-16">
                            {getAuthStatusText(customer.airwork_auth_status)}
                          </div>
                        </div>
                      </div>
                      {customer.airwork_auth_status !== 'authenticated' && (
                        <button
                          onClick={() => handleAuthCheck(customer, 'airwork')}
                          disabled={checkingAuth?.id === customer.id && checkingAuth?.platform === 'airwork'}
                          className="ml-2 inline-flex items-center px-2 py-1 text-xs font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {checkingAuth?.id === customer.id && checkingAuth?.platform === 'airwork' ? (
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
                          {customer.engage_auth_status === 'authenticated' ? (
                            <CheckCircle className="h-5 w-5 text-green-500" />
                          ) : (
                            <AlertCircle className="h-5 w-5 text-red-500" />
                          )}
                          <div className="tooltip -mt-8 -ml-16">
                            {getAuthStatusText(customer.engage_auth_status)}
                          </div>
                        </div>
                      </div>
                      {customer.engage_auth_status !== 'authenticated' && (
                        <button
                          onClick={() => handleAuthCheck(customer, 'engage')}
                          disabled={checkingAuth?.id === customer.id && checkingAuth?.platform === 'engage'}
                          className="ml-2 inline-flex items-center px-2 py-1 text-xs font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {checkingAuth?.id === customer.id && checkingAuth?.platform === 'engage' ? (
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