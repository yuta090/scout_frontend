import React, { useState } from 'react';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import { CheckCircle, XCircle, AlertTriangle, Copy, Calendar, FileText, User, Building, CreditCard } from 'lucide-react';
import { updateInvoiceStatus } from '../../lib/supabase/invoice';
import type { Invoice } from '../../lib/types';

interface InvoiceDetailProps {
  invoice: Invoice;
  onClose: () => void;
  onUpdate: () => void;
}

const InvoiceDetail: React.FC<InvoiceDetailProps> = ({ invoice, onClose, onUpdate }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<string>('bank_transfer');
  const [showPaymentForm, setShowPaymentForm] = useState(false);

  // ステータスに基づく色とアイコンを取得
  const getStatusDetails = (status: string) => {
    switch (status) {
      case 'paid':
        return {
          icon: <CheckCircle className="h-5 w-5" />,
          color: 'text-green-600',
          bgColor: 'bg-green-100',
          text: '支払済み'
        };
      case 'overdue':
        return {
          icon: <AlertTriangle className="h-5 w-5" />,
          color: 'text-red-600',
          bgColor: 'bg-red-100',
          text: '支払期限超過'
        };
      case 'pending':
      default:
        return {
          icon: <Calendar className="h-5 w-5" />,
          color: 'text-amber-600',
          bgColor: 'bg-amber-100',
          text: '支払待ち'
        };
    }
  };

  const statusDetails = getStatusDetails(invoice.status);

  // 日付をフォーマット
  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    try {
      return format(new Date(dateString), 'yyyy年MM月dd日', { locale: ja });
    } catch (error) {
      return dateString;
    }
  };

  // 支払い処理
  const handleMarkAsPaid = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await updateInvoiceStatus(invoice.id, 'paid', paymentMethod);
      onUpdate();
    } catch (err) {
      console.error('請求書ステータスの更新に失敗しました:', err);
      setError('請求書ステータスの更新に失敗しました。もう一度お試しください。');
    } finally {
      setLoading(false);
    }
  };

  // 請求書番号をクリップボードにコピー
  const copyInvoiceNumber = () => {
    navigator.clipboard.writeText(invoice.invoice_number);
    // コピー成功のフィードバックを表示してもよい
  };

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="p-6 sm:p-8">
        <div className="flex justify-between items-start mb-6">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center">
            <FileText className="mr-2 h-6 w-6 text-indigo-600" />
            請求書詳細
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md bg-white text-gray-400 hover:text-gray-500"
          >
            <XCircle className="h-6 w-6" />
          </button>
        </div>

        {error && (
          <div className="mb-4 bg-red-50 p-4 rounded-md">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        <div className="border-b border-gray-200 pb-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center">
              <span className="text-lg font-semibold">{invoice.invoice_number}</span>
              <button
                onClick={copyInvoiceNumber}
                className="ml-2 text-gray-400 hover:text-gray-600"
                title="請求書番号をコピー"
              >
                <Copy className="h-4 w-4" />
              </button>
            </div>
            <div className={`flex items-center ${statusDetails.color} px-3 py-1 rounded-full ${statusDetails.bgColor}`}>
              {statusDetails.icon}
              <span className="ml-1 text-sm font-medium">{statusDetails.text}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500 mb-1">発行日</p>
              <p className="font-medium">{formatDate(invoice.issue_date)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">支払期限</p>
              <p className="font-medium">{formatDate(invoice.due_date)}</p>
            </div>
            {invoice.payment_date && (
              <div>
                <p className="text-sm text-gray-500 mb-1">支払日</p>
                <p className="font-medium">{formatDate(invoice.payment_date)}</p>
              </div>
            )}
            {invoice.payment_method && (
              <div>
                <p className="text-sm text-gray-500 mb-1">支払方法</p>
                <p className="font-medium">
                  {invoice.payment_method === 'bank_transfer' ? '銀行振込' : 
                   invoice.payment_method === 'credit_card' ? 'クレジットカード' : 
                   invoice.payment_method === 'cash' ? '現金' : invoice.payment_method}
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="border-b border-gray-200 pb-6 mb-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <User className="mr-2 h-5 w-5 text-indigo-600" />
            顧客情報
          </h3>
          {invoice.customer ? (
            <div>
              <p className="font-medium">{invoice.customer.company_name}</p>
              <p className="text-gray-500">{invoice.customer.contact_name}</p>
              <p className="text-gray-500">{invoice.customer.email}</p>
            </div>
          ) : (
            <p className="text-gray-500">顧客情報がありません</p>
          )}
        </div>

        {invoice.campaign && (
          <div className="border-b border-gray-200 pb-6 mb-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <Building className="mr-2 h-5 w-5 text-indigo-600" />
              関連キャンペーン
            </h3>
            <div>
              <p className="font-medium">{invoice.campaign.title}</p>
              <p className="text-gray-500">{invoice.campaign.description}</p>
              <p className="text-gray-500">ステータス: {invoice.campaign.status}</p>
            </div>
          </div>
        )}

        <div className="border-b border-gray-200 pb-6 mb-6">
          <h3 className="text-lg font-semibold mb-4">請求詳細</h3>
          <div className="bg-gray-50 p-4 rounded-md">
            <div className="flex justify-between items-center">
              <span className="text-gray-700">合計金額</span>
              <span className="text-xl font-bold text-indigo-700">¥{invoice.amount.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {invoice.notes && (
          <div className="border-b border-gray-200 pb-6 mb-6">
            <h3 className="text-lg font-semibold mb-4">備考</h3>
            <p className="text-gray-700 whitespace-pre-line">{invoice.notes}</p>
          </div>
        )}

        {invoice.status === 'pending' && (
          <div className="pt-4">
            {showPaymentForm ? (
              <form onSubmit={handleMarkAsPaid} className="space-y-4">
                <div>
                  <label htmlFor="payment_method" className="block text-sm font-medium text-gray-700 mb-1">
                    支払方法 <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="payment_method"
                    className="w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    required
                    disabled={loading}
                  >
                    <option value="bank_transfer">銀行振込</option>
                    <option value="credit_card">クレジットカード</option>
                    <option value="cash">現金</option>
                    <option value="other">その他</option>
                  </select>
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowPaymentForm(false)}
                    className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    disabled={loading}
                  >
                    キャンセル
                  </button>
                  <button
                    type="submit"
                    className="bg-green-600 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                    disabled={loading}
                  >
                    {loading ? '処理中...' : '支払い完了としてマーク'}
                  </button>
                </div>
              </form>
            ) : (
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setShowPaymentForm(true)}
                  className="flex items-center bg-green-600 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  <CreditCard className="mr-2 h-4 w-4" />
                  支払い完了としてマーク
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default InvoiceDetail; 