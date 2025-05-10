import React, { useState, useEffect } from 'react';
import { useQuery } from 'react-query';
import { supabase } from '../../lib/supabase';
import { 
  Building2, User, Mail, Phone, Calendar, 
  MessageSquare, CheckCircle, XCircle, Clock, Search
} from 'lucide-react';
import { isValidUUID } from '../../lib/utils';

interface ReferralLeadsListProps {
  referrerId: string;
}

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
}

const ReferralLeadsList: React.FC<ReferralLeadsListProps> = ({ referrerId }) => {
  const [searchTerm, setSearchTerm] = useState('');

  // 紹介リードの取得
  const { data: leads = [], isLoading, refetch } = useQuery(
    ['referralLeads', referrerId],
    async () => {
      // UUIDの検証
      if (!referrerId || !isValidUUID(referrerId)) {
        console.warn('無効な紹介者ID:', referrerId);
        return [];
      }

      console.log('紹介リードを取得中: 紹介者ID =', referrerId);
      const { data, error } = await supabase
        .from('referral_leads')
        .select('*')
        .eq('referrer_id', referrerId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('紹介リード取得エラー:', error);
        throw error;
      }
      
      console.log('取得した紹介リード:', data?.length || 0, data);
      return data as ReferralLead[];
    },
    {
      refetchOnWindowFocus: false,
      staleTime: 60000, // 1分間はデータを新鮮と見なす
      retry: 3,
      enabled: !!referrerId && isValidUUID(referrerId), // referrerIdが有効なUUIDの場合のみクエリを実行
      onError: (error) => {
        console.error('紹介リードクエリエラー:', error);
      }
    }
  );

  // 初回マウント時に強制的に再取得（有効なUUIDの場合のみ）
  useEffect(() => {
    if (referrerId && isValidUUID(referrerId)) {
      refetch();
    }
  }, [refetch, referrerId]);

  // 検索フィルタリング
  const filteredLeads = leads.filter(lead => 
    lead.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lead.contact_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lead.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

  // 無効なUUIDの場合のエラー表示
  if (!referrerId || !isValidUUID(referrerId)) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <div className="text-center">
          <Building2 className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">データを取得できません</h3>
          <p className="mt-1 text-sm text-gray-500">
            無効な紹介者IDが指定されています
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">紹介企業一覧</h3>
        <p className="mt-1 text-sm text-gray-500">
          紹介リンクから申し込みのあった企業一覧です
        </p>
      </div>

      <div className="px-4 py-3 border-b border-gray-200">
        <div className="relative">
          <input
            type="text"
            placeholder="企業名、担当者名で検索..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
        </div>
      </div>

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
      ) : filteredLeads.length > 0 ? (
        <ul className="divide-y divide-gray-200">
          {filteredLeads.map((lead) => (
            <li key={lead.id} className="px-4 py-4 sm:px-6 hover:bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <Building2 className="h-10 w-10 text-gray-400" />
                    </div>
                    <div className="ml-4">
                      <h4 className="text-lg font-medium text-gray-900">{lead.company_name}</h4>
                      <div className="mt-1 flex items-center">
                        <User className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-500">{lead.contact_name}</span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div className="flex items-center">
                      <Mail className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-500">{lead.email}</span>
                    </div>
                    {lead.phone && (
                      <div className="flex items-center">
                        <Phone className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-500">{lead.phone}</span>
                      </div>
                    )}
                  </div>
                  {lead.message && (
                    <div className="mt-2 flex items-start">
                      <MessageSquare className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400 mt-1" />
                      <span className="text-sm text-gray-500">{lead.message}</span>
                    </div>
                  )}
                </div>
                <div className="ml-5 flex flex-col items-end">
                  {getStatusBadge(lead.status)}
                  <div className="mt-2 flex items-center text-sm text-gray-500">
                    <Calendar className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                    <span>{formatDate(lead.created_at)}</span>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <div className="p-8 text-center">
          <Building2 className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">紹介企業がありません</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm ? '検索条件に一致する企業が見つかりませんでした' : '紹介リンクを共有して企業を紹介しましょう'}
          </p>
        </div>
      )}
    </div>
  );
};

export default ReferralLeadsList;