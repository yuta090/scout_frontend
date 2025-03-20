import React, { useState, useEffect } from 'react';
import { X, Shield, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import type { Customer } from '../lib/supabase';
import { supabase } from '../lib/supabase';

interface CustomerFormProps {
  customer?: Customer;
  onSubmit: (data: Omit<Customer, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  onCancel: () => void;
  isOpen: boolean;
}

const CustomerForm: React.FC<CustomerFormProps> = ({ customer, onSubmit, onCancel, isOpen }) => {
  const [formData, setFormData] = useState<Omit<Customer, 'id' | 'created_at' | 'updated_at'>>({
    agency_id: '',
    company_name: '',
    contact_name: '',
    email: '',
    phone: '',
    airwork_login: {},
    engage_login: {},
    airwork_auth_status: 'pending',
    engage_auth_status: 'pending',
    status: 'active'
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [checkingAuth, setCheckingAuth] = useState<{platform: 'airwork' | 'engage'} | null>(null);

  useEffect(() => {
    if (isOpen) {
      if (customer) {
        setFormData({
          agency_id: customer.agency_id,
          company_name: customer.company_name,
          contact_name: customer.contact_name || '',
          email: customer.email || '',
          phone: customer.phone || '',
          airwork_login: customer.airwork_login || {},
          engage_login: customer.engage_login || {},
          airwork_auth_status: customer.airwork_auth_status || 'pending',
          engage_auth_status: customer.engage_auth_status || 'pending',
          status: customer.status
        });
      } else {
        setFormData({
          agency_id: '',
          company_name: '',
          contact_name: '',
          email: '',
          phone: '',
          airwork_login: {},
          engage_login: {},
          airwork_auth_status: 'pending',
          engage_auth_status: 'pending',
          status: 'active'
        });
      }
      setError(null);
    }
  }, [customer, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;

    setIsLoading(true);
    setError(null);

    try {
      await onSubmit(formData);
      onCancel();
    } catch (err) {
      console.error('Form submission error:', err);
      setError(err instanceof Error ? err.message : '保存に失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAuthCheck = async (platform: 'airwork' | 'engage') => {
    setCheckingAuth({ platform });
    setError(null);
    
    try {
      // Check if credentials exist
      const credentials = platform === 'airwork' ? formData.airwork_login : formData.engage_login;
      if (!credentials.username || !credentials.password) {
        setFormData(prev => ({
          ...prev,
          [platform === 'airwork' ? 'airwork_auth_status' : 'engage_auth_status']: 'failed'
        }));
        setError('ユーザー名とパスワードを入力してください');
        return;
      }

      // Get the base URL for Netlify Functions
      const baseUrl = import.meta.env.PROD 
        ? window.location.origin
        : 'http://localhost:8888';

      // Call the appropriate auth check function
      const response = await fetch(`${baseUrl}/.netlify/functions/check-${platform}-auth`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: credentials.username,
          password: credentials.password
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const { success, message } = await response.json();
      
      setFormData(prev => ({
        ...prev,
        [platform === 'airwork' ? 'airwork_auth_status' : 'engage_auth_status']: success ? 'authenticated' : 'failed'
      }));

      if (!success) {
        setError(message || '認証に失敗しました');
      }
    } catch (error) {
      console.error(`Error checking ${platform} authentication:`, error);
      setFormData(prev => ({
        ...prev,
        [platform === 'airwork' ? 'airwork_auth_status' : 'engage_auth_status']: 'failed'
      }));
      setError(error instanceof Error ? error.message : '認証チェック中にエラーが発生しました');
    } finally {
      setCheckingAuth(null);
    }
  };

  const getAuthStatusIcon = (status: 'pending' | 'authenticated' | 'failed') => {
    switch (status) {
      case 'authenticated':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'failed':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      case 'pending':
      default:
        return <Clock className="h-5 w-5 text-yellow-500" />;
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

  const getAuthStatusColor = (status: 'pending' | 'authenticated' | 'failed') => {
    switch (status) {
      case 'authenticated':
        return 'bg-green-100 text-green-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'pending':
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">
            {customer ? '顧客情報の編集' : '新規顧客登録'}
          </h2>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-500 focus:outline-none"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-4 space-y-6">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-md">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label htmlFor="company_name" className="block text-sm font-medium text-gray-700 mb-1">
                会社名 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="company_name"
                required
                value={formData.company_name}
                onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <div>
              <label htmlFor="contact_name" className="block text-sm font-medium text-gray-700 mb-1">
                担当者名
              </label>
              <input
                type="text"
                id="contact_name"
                value={formData.contact_name || ''}
                onChange={(e) => setFormData({ ...formData, contact_name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                メールアドレス
              </label>
              <input
                type="email"
                id="email"
                value={formData.email || ''}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                電話番号
              </label>
              <input
                type="tel"
                id="phone"
                value={formData.phone || ''}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                ステータス <span className="text-red-500">*</span>
              </label>
              <select
                id="status"
                required
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as Customer['status'] })}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="active">有効</option>
                <option value="inactive">無効</option>
                <option value="pending">保留中</option>
              </select>
            </div>

            <div className="space-y-2 border-t border-gray-200 pt-4">
              <label className="block text-lg font-medium text-gray-700">
                Airワーク認証情報
              </label>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="airwork_username" className="block text-sm font-medium text-gray-700 mb-1">
                    ユーザー名
                  </label>
                  <input
                    type="text"
                    id="airwork_username"
                    placeholder="ユーザー名"
                    value={formData.airwork_login.username || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      airwork_login: { ...formData.airwork_login, username: e.target.value }
                    })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label htmlFor="airwork_password" className="block text-sm font-medium text-gray-700 mb-1">
                    パスワード
                  </label>
                  <input
                    type="password"
                    id="airwork_password"
                    placeholder="パスワード"
                    value={formData.airwork_login.password || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      airwork_login: { ...formData.airwork_login, password: e.target.value }
                    })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              </div>
              
              <div className="flex items-center justify-between mt-2">
                <div className="flex items-center">
                  <span className="text-sm font-medium text-gray-700 mr-2">認証状態:</span>
                  <div className="flex items-center">
                    {getAuthStatusIcon(formData.airwork_auth_status)}
                    <span className={`ml-1 px-2 py-0.5 rounded-full text-xs font-medium ${getAuthStatusColor(formData.airwork_auth_status)}`}>
                      {getAuthStatusText(formData.airwork_auth_status)}
                    </span>
                  </div>
                </div>
                
                <button
                  type="button"
                  onClick={() => handleAuthCheck('airwork')}
                  disabled={checkingAuth?.platform === 'airwork' || !formData.airwork_login.username || !formData.airwork_login.password}
                  className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {checkingAuth?.platform === 'airwork' ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      認証確認中...
                    </span>
                  ) : (
                    <>
                      <Shield className="h-4 w-4 mr-1" />
                      認証チェック
                    </>
                  )}
                </button>
              </div>
              
              {!formData.airwork_login.username || !formData.airwork_login.password ? (
                <p className="text-xs text-amber-600 mt-1">
                  認証チェックを行うには、ユーザー名とパスワードを入力してください。
                </p>
              ) : null}
            </div>

            <div className="space-y-2 border-t border-gray-200 pt-4">
              <label className="block text-lg font-medium text-gray-700">
                Engage認証情報
              </label>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="engage_username" className="block text-sm font-medium text-gray-700 mb-1">
                    ユーザー名
                  </label>
                  <input
                    type="text"
                    id="engage_username"
                    placeholder="ユーザー名"
                    value={formData.engage_login.username || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      engage_login: { ...formData.engage_login, username: e.target.value }
                    })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label htmlFor="engage_password" className="block text-sm font-medium text-gray-700 mb-1">
                    パスワード
                  </label>
                  <input
                    type="password"
                    id="engage_password"
                    placeholder="パスワード"
                    value={formData.engage_login.password || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      engage_login: { ...formData.engage_login, password: e.target.value }
                    })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              </div>
              
              <div className="flex items-center justify-between mt-2">
                <div className="flex items-center">
                  <span className="text-sm font-medium text-gray-700 mr-2">認証状態:</span>
                  <div className="flex items-center">
                    {getAuthStatusIcon(formData.engage_auth_status)}
                    <span className={`ml-1 px-2 py-0.5 rounded-full text-xs font-medium ${getAuthStatusColor(formData.engage_auth_status)}`}>
                      {getAuthStatusText(formData.engage_auth_status)}
                    </span>
                  </div>
                </div>
                
                <button
                  type="button"
                  onClick={() => handleAuthCheck('engage')}
                  disabled={checkingAuth?.platform === 'engage' || !formData.engage_login.username || !formData.engage_login.password}
                  className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {checkingAuth?.platform === 'engage' ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      認証確認中...
                    </span>
                  ) : (
                    <>
                      <Shield className="h-4 w-4 mr-1" />
                      認証チェック
                    </>
                  )}
                </button>
              </div>
              
              {!formData.engage_login.username || !formData.engage_login.password ? (
                <p className="text-xs text-amber-600 mt-1">
                  認証チェックを行うには、ユーザー名とパスワードを入力してください。
                </p>
              ) : null}
            </div>
          </div>

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
              {isLoading ? '保存中...' : (customer ? '更新' : '登録')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CustomerForm;