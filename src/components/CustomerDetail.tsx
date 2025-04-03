import React, { useState, useCallback } from 'react';
import { Building2, Phone, Mail, Globe, User, Lock, Calendar, Clock, Plus, CheckCircle, AlertCircle } from 'lucide-react';
import type { Customer } from '../lib/supabase';
import CampaignList from './CampaignList';
import CampaignForm from './campaign/CampaignForm';

interface CustomerDetailProps {
  customer: Customer;
  onClose: () => void;
  onEdit: () => void;
}

const CustomerDetail: React.FC<CustomerDetailProps> = ({ customer, onClose, onEdit }) => {
  const [showCampaignForm, setShowCampaignForm] = useState(false);
  const [campaignListKey, setCampaignListKey] = useState(0);

  const handleCampaignSave = useCallback(() => {
    setCampaignListKey(prev => prev + 1);
  }, []);

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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center">
                <Building2 className="h-8 w-8 text-indigo-600" />
              </div>
              <div>
                <h2 className="text-2xl font-semibold text-gray-900">
                  {customer.company_name}
                </h2>
                <div className="mt-1 flex items-center">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(customer.status)}`}>
                    {getStatusText(customer.status)}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={onEdit}
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                編集
              </button>
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                閉じる
              </button>
            </div>
          </div>
        </div>

        <div className="px-6 py-4 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 基本情報 */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">基本情報</h3>
            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              {customer.contact_name && (
                <div className="flex items-center text-gray-700">
                  <User className="h-5 w-5 mr-2 text-gray-400" />
                  <span className="text-sm font-medium">担当者: </span>
                  <span className="ml-2">{customer.contact_name}</span>
                </div>
              )}
              {customer.email && (
                <div className="flex items-center text-gray-700">
                  <Mail className="h-5 w-5 mr-2 text-gray-400" />
                  <span className="text-sm font-medium">メール: </span>
                  <a href={`mailto:${customer.email}`} className="ml-2 text-indigo-600 hover:text-indigo-800">
                    {customer.email}
                  </a>
                </div>
              )}
              {customer.phone && (
                <div className="flex items-center text-gray-700">
                  <Phone className="h-5 w-5 mr-2 text-gray-400" />
                  <span className="text-sm font-medium">電話: </span>
                  <a href={`tel:${customer.phone}`} className="ml-2 text-indigo-600 hover:text-indigo-800">
                    {customer.phone}
                  </a>
                </div>
              )}
              <div className="flex items-center text-gray-700">
                <Calendar className="h-5 w-5 mr-2 text-gray-400" />
                <span className="text-sm font-medium">登録日: </span>
                <span className="ml-2">{formatDate(customer.created_at)}</span>
              </div>
              <div className="flex items-center text-gray-700">
                <Clock className="h-5 w-5 mr-2 text-gray-400" />
                <span className="text-sm font-medium">最終更新: </span>
                <span className="ml-2">{formatDate(customer.updated_at)}</span>
              </div>
            </div>
          </div>

          {/* Airワークログイン情報 */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Airワークログイン情報</h3>
            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              <div className="flex items-center text-gray-700">
                <User className="h-5 w-5 mr-2 text-gray-400" />
                <span className="text-sm font-medium">ユーザー名: </span>
                <span className="ml-2">
                  {customer.airwork_login.username || '未設定'}
                </span>
              </div>
              <div className="flex items-center text-gray-700">
                <Lock className="h-5 w-5 mr-2 text-gray-400" />
                <span className="text-sm font-medium">パスワード: </span>
                <span className="ml-2">
                  {customer.airwork_login.password ? '********' : '未設定'}
                </span>
              </div>
              <div className="flex items-center text-gray-700">
                <span className="text-sm font-medium">認証状態: </span>
                <div className="ml-2 flex items-center">
                  {getAuthStatusIcon(customer.airwork_auth_status)}
                  <span className={`ml-1 px-2 py-0.5 rounded-full text-xs font-medium ${getAuthStatusColor(customer.airwork_auth_status)}`}>
                    {getAuthStatusText(customer.airwork_auth_status)}
                  </span>
                </div>
              </div>
              {customer.airwork_login.username && (
                <div className="mt-4">
                  <a
                    href="https://airwork.jp/login"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-sm text-indigo-600 hover:text-indigo-800"
                  >
                    <Globe className="h-4 w-4 mr-1" />
                    Airワークにログイン
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Engage認証状態 */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Engage認証状態</h3>
            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              <div className="flex items-center text-gray-700">
                <span className="text-sm font-medium">認証状態: </span>
                <div className="ml-2 flex items-center">
                  {getAuthStatusIcon(customer.engage_auth_status)}
                  <span className={`ml-1 px-2 py-0.5 rounded-full text-xs font-medium ${getAuthStatusColor(customer.engage_auth_status)}`}>
                    {getAuthStatusText(customer.engage_auth_status)}
                  </span>
                </div>
              </div>
              <div className="mt-4">
                <a
                  href="https://en-gage.net/login/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-sm text-indigo-600 hover:text-indigo-800"
                >
                  <Globe className="h-4 w-4 mr-1" />
                  Engageにログイン
                </a>
              </div>
            </div>
          </div>

          {/* キャンペーン情報 */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">キャンペーン情報</h3>
              <button
                onClick={() => setShowCampaignForm(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                新規キャンペーン作成
              </button>
            </div>
            <CampaignList 
              key={campaignListKey}
              customerId={customer.id} 
            />
          </div>
        </div>

        {showCampaignForm && (
          <CampaignForm
            customerId={customer.id}
            onClose={() => setShowCampaignForm(false)}
            onSave={handleCampaignSave}
          />
        )}
      </div>
    </div>
  );
};

export default CustomerDetail;