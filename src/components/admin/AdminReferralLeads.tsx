import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { supabase } from '../../lib/supabase';
import { 
  Building2, User, Mail, Phone, Calendar, 
  MessageSquare, CheckCircle, XCircle, Clock, Filter, Search
} from 'lucide-react';
import AdminLayout from './AdminLayout';

interface ReferralLead {
  id: string;
  referrer_id: string;
  company_name: string;
  contact_name: string;
  email: string;
  phone: string | null;
  message: string | null;
  status: 'pending' | 'contacted' | 'converted' | 'rejected';
  created_at: string;
  updated_at: string;
  profiles?: {
    company_name: string;
    contact_name: string | null;
    email: string;
  };
}

interface Agency {
  id: string;
  company_name: string;
  email: string;
}

const AdminReferralLeads: React.FC = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [defaultAgencyId, setDefaultAgencyId] = useState<string | null>(null);
  const [agencies, setAgencies] = useState<Agency[]>([]);
  const [isLoadingAgencies, setIsLoadingAgencies] = useState(false);

  // 代理店一覧の取得
  const fetchAgencies = async () => {
    setIsLoadingAgencies(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, company_name, email')
        .eq('role', 'agency')
        .order('company_name', { ascending: true });

      if (error) throw error;
      setAgencies(data || []);
    } catch (err) {
      console.error('Error fetching agencies:', err);
    } finally {
      setIsLoadingAgencies(false);
    }
  };

  // デフォルト代理店の取得
  const fetchDefaultAgency = async () => {
    try {
      const { data, error } = await supabase
        .from('referral_settings')
        .select('default_agency_id')
        .limit(1)
        .single();

      if (error) {
        if (error.code !== 'PGRST116') {
          console.error('Error fetching default agency:', error);
        }
        return;
      }

      setDefaultAgencyId(data.default_agency_id);
    } catch (err) {
      console.error('Error fetching default agency:', err);
    }
  };

  useEffect(() => {
    fetchAgencies();
    fetchDefaultAgency();
  }, []);

  // 紹介リードの取得
  const { data: leads = [], isLoading } = useQuery(
    ['adminReferralLeads', searchTerm, statusFilter],
    async () => {
      let query = supabase
        .from('referral_leads')
        .select(`
          *,
          profiles:referrer_id (
            company_name,
            contact_name,
            email
          )
        `)
        .order('created_at', { ascending: false });

      if (searchTerm) {
        query = query.or(`company_name.ilike.%${searchTerm}%,contact_name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`);
      }

      if (statusFilter) {
        query = query.eq('status', statusFilter);
      }

      const { data, error } = await query;
      
      if (error) throw error;
      return data as ReferralLead[];
    },
    {
      keepPreviousData: true,
      refetchOnWindowFocus: false,
      staleTime: 60000 // 1分間はデータを新鮮と見なす
    }
  );

  // ステータス更新のミューテーション
  const updateStatusMutation = useMutation(
    async ({ id, status, agencyId }: { id: string; status: string; agencyId?: string }) => {
      // ステータスが converted の場合、デフォルト代理店を設定
      const updateData: any = { status };
      
      const { data, error } = await supabase
        .from('referral_leads')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      // ステータスが converted の場合、アクティビティログを記録
      if (status === 'converted') {
        // 代理店IDを取得（指定されたものか、デフォルト）
        const assignedAgencyId = agencyId || defaultAgencyId;
        
        if (assignedAgencyId) {
          // アクティビティログを記録
          await supabase
            .from('activities')
            .insert([{
              user_id: assignedAgencyId,
              action: 'referral_lead_assigned',
              details: {
                message: `紹介リード「${data.company_name}」が代理店に割り当てられました`,
                lead_id: data.id,
                company_name: data.company_name,
                referrer_id: data.referrer_id
              }
            }]);
        }
      }
      
      return data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['adminReferralLeads']);
      }
    }
  );

  // ステータスの更新
  const handleStatusChange = (id: string, status: string) => {
    // ステータスが converted の場合、代理店を選択するモーダルを表示
    if (status === 'converted') {
      // デフォルト代理店があれば、それを使用
      updateStatusMutation.mutate({ id, status, agencyId: defaultAgencyId });
    } else {
      updateStatusMutation.mutate({ id, status });
    }
  };

  // ステータスバッジの取得
  const getStatusBadge = (status: ReferralLead['status']) => {
    switch (status) {
      case 'pending':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            <Clock className="h-3 w-3 mr-1" />
            申込中
          </span>
        );
      case 'contacted':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <CheckCircle className="h-3 w-3 mr-1" />
            連絡済み
          </span>
        );
      case 'converted':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircle className="h-3 w-3 mr-1" />
            成約
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <XCircle className="h-3 w-3 mr-1" />
            不成立
          </span>
        );
    }
  };

  // 日付フォーマット
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">紹介リード管理</h1>
        </div>

        <div className="flex flex-wrap gap-4 items-center">
          <div className="relative flex-grow max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="企業名、担当者名で検索..."
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
          
          <div className="flex items-center">
            <Filter className="h-5 w-5 text-gray-400 mr-2" />
            <select
              value={statusFilter || ''}
              onChange={(e) => setStatusFilter(e.target.value || null)}
              className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            >
              <option value="">すべてのステータス</option>
              <option value="pending">申込中</option>
              <option value="contacted">連絡済み</option>
              <option value="converted">成約</option>
              <option value="rejected">不成立</option>
            </select>
          </div>
        </div>

        <div className="bg-white shadow overflow-hidden rounded-lg">
          {isLoading ? (
            <div className="p-4">
              <div className="animate-pulse space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex items-center space-x-4">
                    <div className="rounded-full bg-gray-200 h-10 w-10"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : leads.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      企業情報
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      紹介元代理店
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      申込日
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ステータス
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      操作
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {leads.map((lead: ReferralLead) => (
                    <tr key={lead.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                            <Building2 className="h-6 w-6 text-indigo-600" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{lead.company_name}</div>
                            <div className="text-sm text-gray-500">{lead.contact_name}</div>
                            <div className="text-sm text-gray-500">{lead.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{lead.profiles?.company_name || '不明'}</div>
                        <div className="text-sm text-gray-500">{lead.profiles?.contact_name || ''}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(lead.created_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(lead.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end items-center space-x-2">
                          {lead.status === 'converted' && (
                            <div className="text-xs text-green-600 mr-2">
                              {defaultAgencyId ? (
                                <span>デフォルト代理店に割り当て済み</span>
                              ) : (
                                <span>代理店未割り当て</span>
                              )}
                            </div>
                          )}
                          <select
                            value={lead.status}
                            onChange={(e) => handleStatusChange(lead.id, e.target.value)}
                            className="rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                          >
                            <option value="pending">申込中</option>
                            <option value="contacted">連絡済み</option>
                            <option value="converted">成約</option>
                            <option value="rejected">不成立</option>
                          </select>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-8 text-center">
              <Building2 className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">紹介リードがありません</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm || statusFilter ? '検索条件に一致するリードが見つかりませんでした' : '紹介リードがまだ登録されていません'}
              </p>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminReferralLeads;