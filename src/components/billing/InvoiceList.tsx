import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, Plus, CreditCard, CheckCircle, AlertCircle, 
  Clock, Filter, Download, FileText, AlertTriangle, Calendar 
} from 'lucide-react';
import { getInvoices, getInvoiceStats } from '../../lib/supabase/invoice';
import type { Invoice } from '../../lib/types';
import InvoiceForm from './InvoiceForm';
import InvoiceDetail from './InvoiceDetail';
import Modal from '../ui/Modal';
import Link from 'next/link';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';

interface InvoiceWithCustomer extends Invoice {
  customer: {
    id: string;
    company_name: string;
    contact_name: string | null;
  };
}

interface InvoiceListProps {
  agencyId: string;
  customerId?: string;
  limit?: number;
}

const InvoiceList: React.FC<InvoiceListProps> = ({ agencyId, customerId, limit = 10 }) => {
  const navigate = useNavigate();
  const [invoices, setInvoices] = useState<InvoiceWithCustomer[]>([]);
  const [stats, setStats] = useState<{
    total_invoices: number;
    total_amount: number;
    pending_amount: number;
    paid_amount: number;
    overdue_amount: number;
    pending_count: number;
    paid_count: number;
    overdue_count: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showNewInvoiceForm, setShowNewInvoiceForm] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [showInvoiceDetail, setShowInvoiceDetail] = useState(false);

  const itemsPerPage = 10;

  const fetchInvoices = async () => {
    setLoading(true);
    try {
      const result = await getInvoices(agencyId, customerId, statusFilter, currentPage, itemsPerPage);
      setInvoices(result.invoices as InvoiceWithCustomer[]);
      setTotalCount(result.count);
      
      // 統計情報の取得
      if (!customerId) {
        const statsData = await getInvoiceStats(agencyId);
        setStats(statsData);
      }
      
      setError(null);
    } catch (err) {
      console.error('請求書一覧の取得に失敗しました:', err);
      setError('請求書一覧の取得に失敗しました。');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, [agencyId, customerId, statusFilter, currentPage]);

  // フィルタリングと検索
  const filteredInvoices = invoices.filter(invoice => {
    const searchLower = searchTerm.toLowerCase();
    return (
      invoice.invoice_number.toLowerCase().includes(searchLower) ||
      invoice.customer.company_name.toLowerCase().includes(searchLower) ||
      (invoice.campaign?.title && invoice.campaign.title.toLowerCase().includes(searchLower))
    );
  });

  // ステータスに応じた色を取得
  const getStatusColor = (status: Invoice['status']) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'overdue':
        return 'bg-red-100 text-red-800';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // ステータスに応じたアイコンを取得
  const getStatusIcon = (status: Invoice['status']) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-600" />;
      case 'paid':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'overdue':
        return <AlertCircle className="h-5 w-5 text-red-600" />;
      case 'cancelled':
        return <FileText className="h-5 w-5 text-gray-600" />;
      default:
        return <FileText className="h-5 w-5 text-gray-600" />;
    }
  };

  // ステータステキスト取得
  const getStatusText = (status: Invoice['status']) => {
    switch (status) {
      case 'pending':
        return '未払い';
      case 'paid':
        return '支払済';
      case 'overdue':
        return '支払期限超過';
      case 'cancelled':
        return 'キャンセル';
      default:
        return status;
    }
  };

  // 請求書詳細を表示
  const handleViewInvoice = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setShowInvoiceDetail(true);
  };

  // 請求書作成フォームを表示
  const handleNewInvoice = () => {
    setShowNewInvoiceForm(true);
  };

  // 請求書保存後の処理
  const handleInvoiceSaved = () => {
    setShowNewInvoiceForm(false);
    setSelectedInvoice(null);
    fetchInvoices();
  };

  const totalPages = Math.ceil(totalCount / itemsPerPage);

  // 日付フォーマット
  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    try {
      return format(new Date(dateString), 'yyyy年MM月dd日', { locale: ja });
    } catch {
      return dateString;
    }
  };

  // ステータスアイコンと色を取得
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return { icon: <CheckCircle className="h-4 w-4" />, color: 'text-green-600 bg-green-100', text: '支払済み' };
      case 'overdue':
        return { icon: <AlertTriangle className="h-4 w-4" />, color: 'text-red-600 bg-red-100', text: '支払期限超過' };
      case 'pending':
      default:
        return { icon: <Calendar className="h-4 w-4" />, color: 'text-amber-600 bg-amber-100', text: '支払待ち' };
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">請求書管理</h2>

        <Link href="/billing/invoices/new" className="bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded-md flex items-center">
          <Plus className="h-5 w-5 mr-1" />
          新規請求書作成
        </Link>
      </div>

      {/* 統計情報 */}
      {stats && !customerId && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white border rounded-lg p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-500">未払い請求</h3>
              <Clock className="h-5 w-5 text-yellow-500" />
            </div>
            <div className="mt-2">
              <p className="text-2xl font-bold text-gray-900">
                {stats.pending_amount.toLocaleString()}円
              </p>
              <p className="text-sm text-gray-600">{stats.pending_count}件</p>
            </div>
          </div>
          
          <div className="bg-white border rounded-lg p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-500">支払済請求</h3>
              <CheckCircle className="h-5 w-5 text-green-500" />
            </div>
            <div className="mt-2">
              <p className="text-2xl font-bold text-gray-900">
                {stats.paid_amount.toLocaleString()}円
              </p>
              <p className="text-sm text-gray-600">{stats.paid_count}件</p>
            </div>
          </div>
          
          <div className="bg-white border rounded-lg p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-500">支払期限超過</h3>
              <AlertCircle className="h-5 w-5 text-red-500" />
            </div>
            <div className="mt-2">
              <p className="text-2xl font-bold text-gray-900">
                {stats.overdue_amount.toLocaleString()}円
              </p>
              <p className="text-sm text-gray-600">{stats.overdue_count}件</p>
            </div>
          </div>
          
          <div className="bg-white border rounded-lg p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-500">合計請求額</h3>
              <CreditCard className="h-5 w-5 text-indigo-500" />
            </div>
            <div className="mt-2">
              <p className="text-2xl font-bold text-gray-900">
                {stats.total_amount.toLocaleString()}円
              </p>
              <p className="text-sm text-gray-600">{stats.total_invoices}件</p>
            </div>
          </div>
        </div>
      )}

      {/* 検索とフィルタリング */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="請求書番号、顧客名、キャンペーン名で検索..."
            className="w-full border rounded-md py-2 px-4 pl-10 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
        </div>
        <div className="flex items-center">
          <Filter className="h-5 w-5 text-gray-400 mr-2" />
          <select
            className="border rounded-md py-2 px-4 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">全てのステータス</option>
            <option value="pending">未払い</option>
            <option value="paid">支払済</option>
            <option value="overdue">支払期限超過</option>
            <option value="cancelled">キャンセル</option>
          </select>
        </div>
      </div>

      {/* 請求書一覧 */}
      {loading ? (
        <div className="text-center py-10">
          <p className="text-gray-500">読み込み中...</p>
        </div>
      ) : error ? (
        <div className="text-center py-10">
          <p className="text-red-500">{error}</p>
        </div>
      ) : invoices.length === 0 ? (
        <div className="text-center py-10 border rounded-lg">
          <FileText className="h-10 w-10 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">請求書がありません</p>
          <button
            onClick={handleNewInvoice}
            className="mt-4 text-indigo-600 hover:text-indigo-800 text-sm font-medium"
          >
            新規請求書を作成
          </button>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border-collapse">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  請求書番号
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  顧客
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  発行日
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  支払期限
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  金額
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ステータス
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredInvoices.map((invoice) => {
                const statusBadge = getStatusBadge(invoice.status);
                return (
                  <tr 
                    key={invoice.id}
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => handleViewInvoice(invoice)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {invoice.invoice_number}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {invoice.customer.company_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(invoice.issue_date)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(invoice.due_date)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {invoice.amount.toLocaleString()}円
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusBadge.color}`}>
                        {statusBadge.icon}
                        <span className="ml-1">{statusBadge.text}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewInvoice(invoice);
                        }}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        詳細
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* ページネーション */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center mt-6">
          <div className="text-sm text-gray-500">
            全 {totalCount} 件中 {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, totalCount)} 件を表示
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className={`px-3 py-1 rounded border ${
                currentPage === 1
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              前へ
            </button>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage >= totalPages}
              className={`px-3 py-1 rounded border ${
                currentPage >= totalPages
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              次へ
            </button>
          </div>
        </div>
      )}

      {/* 新規請求書モーダル */}
      {showNewInvoiceForm && (
        <Modal
          title="新規請求書作成"
          onClose={() => setShowNewInvoiceForm(false)}
        >
          <InvoiceForm 
            agencyId={agencyId}
            customerId={customerId}
            onSave={handleInvoiceSaved}
            onCancel={() => setShowNewInvoiceForm(false)}
          />
        </Modal>
      )}

      {/* 請求書詳細モーダル */}
      {showInvoiceDetail && selectedInvoice && (
        <Modal
          title="請求書詳細"
          onClose={() => setShowInvoiceDetail(false)}
        >
          <InvoiceDetail
            invoiceId={selectedInvoice.id}
            onClose={() => setShowInvoiceDetail(false)}
            onStatusChange={fetchInvoices}
          />
        </Modal>
      )}
    </div>
  );
};

export default InvoiceList; 