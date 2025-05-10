import React, { useState, useEffect } from 'react';
import { AlertCircle } from 'lucide-react';
import { createInvoice, generateInvoiceFromCampaign } from '../../lib/supabase/invoice';
import { supabase } from '../../lib/supabase';
import type { Customer, Campaign } from '../../lib/types';

interface InvoiceFormProps {
  agencyId: string;
  customerId?: string;
  onSave: () => void;
  onCancel: () => void;
}

const InvoiceForm: React.FC<InvoiceFormProps> = ({
  agencyId,
  customerId,
  onSave,
  onCancel
}) => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // フォームの状態
  const [formData, setFormData] = useState({
    customer_id: customerId || '',
    campaign_id: '',
    invoice_number: `INV-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}`,
    issue_date: new Date().toISOString().slice(0, 10),
    due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
    amount: 0,
    notes: ''
  });

  // 顧客一覧を取得
  const fetchCustomers = async () => {
    try {
      const { data, error } = await supabase
        .from('customers')
        .select('id, company_name, contact_name')
        .eq('agency_id', agencyId)
        .eq('status', 'active')
        .order('company_name');

      if (error) throw error;
      setCustomers(data || []);
    } catch (err) {
      console.error('顧客一覧の取得に失敗しました:', err);
      setError('顧客一覧の取得に失敗しました。');
    }
  };

  // キャンペーン一覧を取得
  const fetchCampaigns = async (selectedCustomerId: string) => {
    if (!selectedCustomerId) {
      setCampaigns([]);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('campaigns')
        .select('id, title, description, total_amount, status')
        .eq('customer_id', selectedCustomerId)
        .in('status', ['completed', 'in_progress', 'approved'])
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCampaigns(data || []);
    } catch (err) {
      console.error('キャンペーン一覧の取得に失敗しました:', err);
      setError('キャンペーン一覧の取得に失敗しました。');
    }
  };

  // 初期データ取得
  useEffect(() => {
    fetchCustomers();
    if (customerId) {
      fetchCampaigns(customerId);
    }
  }, [agencyId, customerId]);

  // キャンペーンが選択された時に金額を自動設定
  const handleCampaignChange = (campaignId: string) => {
    const selectedCampaign = campaigns.find(c => c.id === campaignId);
    
    if (selectedCampaign) {
      setFormData({
        ...formData,
        campaign_id: campaignId,
        amount: selectedCampaign.total_amount,
        notes: `キャンペーン「${selectedCampaign.title}」の請求書`
      });
    } else {
      setFormData({
        ...formData,
        campaign_id: campaignId,
        amount: 0,
        notes: ''
      });
    }
  };

  // 顧客が変更された時にキャンペーン一覧を更新
  const handleCustomerChange = (customerId: string) => {
    setFormData({
      ...formData,
      customer_id: customerId,
      campaign_id: '',
      amount: 0,
      notes: ''
    });
    fetchCampaigns(customerId);
  };

  // 請求書を保存
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (formData.campaign_id) {
        // キャンペーンIDがある場合はキャンペーンから請求書を生成
        await generateInvoiceFromCampaign(
          formData.campaign_id,
          formData.due_date,
          formData.notes
        );
      } else {
        // 手動入力の場合
        await createInvoice({
          customer_id: formData.customer_id,
          agency_id: agencyId,
          campaign_id: formData.campaign_id || null,
          invoice_number: formData.invoice_number,
          issue_date: formData.issue_date,
          due_date: formData.due_date,
          amount: formData.amount,
          status: 'pending',
          payment_date: null,
          payment_method: null,
          notes: formData.notes
        });
      }

      setSuccess(true);
      setTimeout(() => {
        onSave();
      }, 1500);
    } catch (err) {
      console.error('請求書の保存に失敗しました:', err);
      setError('請求書の保存に失敗しました。');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="text-center py-8">
        <div className="mb-4 flex justify-center">
          <div className="rounded-full bg-green-100 p-3">
            <svg
              className="h-6 w-6 text-green-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
        </div>
        <h3 className="text-lg font-medium text-gray-900">請求書を作成しました</h3>
        <p className="mt-2 text-sm text-gray-500">請求書が正常に作成されました。</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-50 p-4 rounded-md flex items-start">
          <AlertCircle className="h-5 w-5 text-red-400 mr-2 mt-0.5" />
          <span className="text-sm text-red-700">{error}</span>
        </div>
      )}

      <div>
        <label htmlFor="customer_id" className="block text-sm font-medium text-gray-700 mb-1">
          顧客 <span className="text-red-500">*</span>
        </label>
        <select
          id="customer_id"
          className="w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          value={formData.customer_id}
          onChange={(e) => handleCustomerChange(e.target.value)}
          required
          disabled={!!customerId || loading}
        >
          <option value="">顧客を選択してください</option>
          {customers.map((customer) => (
            <option key={customer.id} value={customer.id}>
              {customer.company_name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="campaign_id" className="block text-sm font-medium text-gray-700 mb-1">
          キャンペーン
        </label>
        <select
          id="campaign_id"
          className="w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          value={formData.campaign_id}
          onChange={(e) => handleCampaignChange(e.target.value)}
          disabled={!formData.customer_id || loading}
        >
          <option value="">キャンペーンを選択してください（オプション）</option>
          {campaigns.map((campaign) => (
            <option key={campaign.id} value={campaign.id}>
              {campaign.title} - {campaign.total_amount.toLocaleString()}円
            </option>
          ))}
        </select>
        <p className="mt-1 text-xs text-gray-500">
          キャンペーンを選択すると、金額が自動入力されます
        </p>
      </div>

      <div>
        <label htmlFor="invoice_number" className="block text-sm font-medium text-gray-700 mb-1">
          請求書番号 <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="invoice_number"
          className="w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          value={formData.invoice_number}
          onChange={(e) => setFormData({ ...formData, invoice_number: e.target.value })}
          required
          disabled={loading}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="issue_date" className="block text-sm font-medium text-gray-700 mb-1">
            発行日 <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            id="issue_date"
            className="w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            value={formData.issue_date}
            onChange={(e) => setFormData({ ...formData, issue_date: e.target.value })}
            required
            disabled={loading}
          />
        </div>
        <div>
          <label htmlFor="due_date" className="block text-sm font-medium text-gray-700 mb-1">
            支払期限 <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            id="due_date"
            className="w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            value={formData.due_date}
            onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
            required
            disabled={loading}
          />
        </div>
      </div>

      <div>
        <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
          金額 (円) <span className="text-red-500">*</span>
        </label>
        <input
          type="number"
          id="amount"
          className="w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          value={formData.amount}
          onChange={(e) => setFormData({ ...formData, amount: parseInt(e.target.value) || 0 })}
          min="0"
          required
          disabled={loading || !!formData.campaign_id}
        />
      </div>

      <div>
        <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
          備考
        </label>
        <textarea
          id="notes"
          rows={3}
          className="w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          disabled={loading}
        />
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          disabled={loading}
        >
          キャンセル
        </button>
        <button
          type="submit"
          className="bg-indigo-600 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          disabled={!formData.customer_id || formData.amount <= 0 || loading}
        >
          {loading ? '処理中...' : '保存'}
        </button>
      </div>
    </form>
  );
};

export default InvoiceForm; 