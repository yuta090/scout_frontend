import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import type { Customer } from '../lib/types';
import AuthenticationSection from './customer/AuthenticationSection';
import Modal from './ui/Modal';

interface CustomerFormProps {
  customer?: Customer;
  initialData?: Partial<Customer>;
  onSubmit: (data: Omit<Customer, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  onCancel: () => void;
  isOpen: boolean;
}

const CustomerForm: React.FC<CustomerFormProps> = ({ 
  customer, 
  initialData = {}, 
  onSubmit, 
  onCancel, 
  isOpen 
}) => {
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
    status: 'active',
    employer_id: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [initialized, setInitialized] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState<{platform: 'airwork' | 'engage'} | null>(null);

  useEffect(() => {
    if (isOpen && !initialized) {
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
          status: customer.status,
          employer_id: customer.employer_id || ''
        });
      } else {
        setFormData({
          agency_id: '',
          company_name: initialData.company_name || '',
          contact_name: initialData.contact_name || '',
          email: initialData.email || '',
          phone: initialData.phone || '',
          airwork_login: {},
          engage_login: {},
          airwork_auth_status: 'pending',
          engage_auth_status: 'pending',
          status: 'active',
          employer_id: initialData.employer_id || ''
        });
      }
      setInitialized(true);
      setError(null);
    }
    
    if (!isOpen && initialized) {
      setInitialized(false);
    }
  }, [customer, initialData, isOpen]);

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

  const handleAuthStatusChange = (platform: 'airwork' | 'engage', status: 'pending' | 'authenticated' | 'failed') => {
    setFormData({
      ...formData,
      [platform === 'airwork' ? 'airwork_auth_status' : 'engage_auth_status']: status
    });
  };

  const handleAirworkLoginChange = (airworkLogin: { username?: string; password?: string }) => {
    setFormData({
      ...formData,
      airwork_login: airworkLogin
    });
  };

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onCancel}
      title={customer ? '顧客情報の編集' : '新規顧客登録'}
      maxWidth="max-w-2xl"
    >
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
            <label htmlFor="employer_id" className="block text-sm font-medium text-gray-700 mb-1">
              雇用者ID
            </label>
            <input
              type="text"
              id="employer_id"
              value={formData.employer_id || ''}
              onChange={(e) => setFormData({ ...formData, employer_id: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="32文字の英数字ID"
              maxLength={32}
            />
            <p className="mt-1 text-xs text-gray-500">
              32文字の英数字で構成される雇用者識別子を入力してください
            </p>
          </div>

          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
              ステータ ス <span className="text-red-500">*</span>
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

          <AuthenticationSection 
            airworkLogin={formData.airwork_login}
            airworkAuthStatus={formData.airwork_auth_status}
            engageAuthStatus={formData.engage_auth_status}
            onAirworkLoginChange={handleAirworkLoginChange}
            onAuthStatusChange={handleAuthStatusChange}
            customerId={customer?.id}
            isLoading={isLoading}
            authError={error}
          />
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
    </Modal>
  );
};

export default CustomerForm;