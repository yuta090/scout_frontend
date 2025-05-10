import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { supabase } from '../../lib/supabase';
import {
  Search,
  Plus,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  User,
  Mail,
  Shield,
  Calendar,
  Phone,
} from 'lucide-react';
import SubAccountForm from './SubAccountForm';
import { adminApi } from '../../lib/supabase/admin';

interface SubAccount {
  id: string;
  agency_id: string;
  email: string;
  contact_name?: string;
  phone?: string;
  role: 'admin' | 'staff' | 'accounting' | 'readonly';
  permissions: {
    customers: { view: boolean; create: boolean; edit: boolean; delete: boolean };
    campaigns: { view: boolean; create: boolean; edit: boolean; delete: boolean };
    reports: { view: boolean };
    billing: { 
      view: boolean;
      view_all_customers: boolean; 
    };
    view_all_campaigns: boolean;
  };
  status: 'active' | 'inactive' | 'pending';
  created_at: string;
  updated_at: string;
}

interface SubAccountListProps {
  isFormOpenFromParent?: boolean;
  setIsFormOpenFromParent?: (isOpen: boolean) => void;
}

const SubAccountList: React.FC<SubAccountListProps> = ({
  isFormOpenFromParent,
  setIsFormOpenFromParent,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(isFormOpenFromParent ?? false);
  const [selectedSubAccount, setSelectedSubAccount] =
    useState<SubAccount | null>(null);
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  useEffect(() => {
    if (isFormOpenFromParent !== undefined) {
      setIsFormOpen(isFormOpenFromParent);
    }
  }, [isFormOpenFromParent]);

  useEffect(() => {
    setIsFormOpenFromParent?.(isFormOpen);
  }, [isFormOpen, setIsFormOpenFromParent]);

  useEffect(() => {
    setIsAuthLoading(true);
    const checkAuth = async () => {
      try {
        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser();
        if (authError) throw authError;

        if (!user) {
          setError('ログインが必要です');
          setIsAuthenticated(false);
          setIsAuthLoading(false);
          return;
        }

        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();

        if (profileError) throw profileError;

        if (profile.role !== 'agency' && profile.role !== 'admin') {
          setError('このページにアクセスする権限がありません');
          setIsAuthenticated(false);
          setIsAuthLoading(false);
          return;
        }

        setIsAuthenticated(true);
        setError(null);
      } catch (err) {
        console.error('認証チェックエラー:', err);
        setError('認証エラーが発生しました');
        setIsAuthenticated(false);
      } finally {
        setIsAuthLoading(false);
      }
    };
    checkAuth();
  }, []);

  const { data: subAccounts = [], isLoading: isDataLoading } = useQuery(
    ['subAccounts', searchTerm],
    async () => {
      if (isAuthLoading || !isAuthenticated) {
        return [];
      }

      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) throw new Error('認証エラー');

        let query = supabase
          .from('profiles')
          .select(
            'id, email, contact_name, phone, role, permissions, created_at, updated_at, parent_id'
          )
          .eq('parent_id', user.id)
          .order('created_at', { ascending: false });

        const { data, error } = await query;
        if (error) throw error;

        console.log('Fetched profiles data:', data);

        const filteredData = (data || []).filter(
          (account: any) =>
            account.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            account.contact_name
              ?.toLowerCase()
              .includes(searchTerm.toLowerCase()) ||
            account.role?.toLowerCase().includes(searchTerm.toLowerCase())
        );
        console.log('Filtered subAccounts data:', filteredData);

        return filteredData as SubAccount[];
      } catch (err) {
        console.error('Error fetching subaccounts:', err);
        setError('サブアカウントの取得に失敗しました');
        return [];
      }
    },
    {
      keepPreviousData: true,
      refetchOnWindowFocus: false,
      enabled: !isAuthLoading && isAuthenticated,
    }
  );

  const deleteSubAccountMutation = useMutation(
    async (params: { agencyId: string; userId: string }) => {
      console.log('--- handleDeleteSubAccount called ---');
      console.log('SubAccount deletion params:', params);
      console.log('------------------------------------');

      // Supabase Edge Functionを呼び出す
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      
      if (!supabaseUrl || !supabaseAnonKey) {
        throw new Error('Supabase設定が見つかりません');
      }
      
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('認証セッションが見つかりません');
      }
      
      const response = await fetch(`${supabaseUrl}/functions/v1/delete-subaccount`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
          'apikey': supabaseAnonKey
        },
        body: JSON.stringify({
          agency_id: params.agencyId,
          user_id: params.userId
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('サーバーからのエラーレスポンス:', errorData);
        throw new Error(errorData.error || '削除API呼び出しに失敗しました');
      }
      
      const result = await response.json();
      console.log('サーバーからの成功レスポンス:', result);
      
      return params.userId;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['subAccounts']);
        setError(null);
      },
      onError: (error) => {
        console.error('削除ミューテーションエラー:', error);
        let errorMessage = 'サブアカウントの削除に失敗しました';

        if (error instanceof Error) {
          errorMessage = error.message;

          if ((error as any).details) {
            console.error('エラー詳細:', (error as any).details);
            errorMessage += `\n詳細: ${JSON.stringify((error as any).details)}`;
          }
        }

        setError(errorMessage);
      },
    }
  );

  const handleDeleteSubAccount = async (subAccount: SubAccount) => {
    console.log('--- handleDeleteSubAccount called ---');
    console.log('SubAccount object received:', subAccount);
    console.log('Attempting to delete user with ID (should be profiles.id):', subAccount.id);
    console.log('------------------------------------');

    if (
      !window.confirm(
        `${subAccount.email}を削除してもよろしいですか？この操作は元に戻せません。`
      )
    ) {
      return;
    }
    setError(null);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setError('削除操作を行うにはログインが必要です。');
        return;
      }
      const agencyId = user.id;

      queryClient.setQueryData(
        ['subAccounts'],
        (oldData: SubAccount[] = []) => {
          return oldData.filter((account) => account.id !== subAccount.id);
        }
      );

      try {
        await deleteSubAccountMutation.mutateAsync({
          agencyId: agencyId,
          userId: subAccount.id,
        });
      } catch (deleteError) {
        console.error('削除API呼び出しエラー:', deleteError);
        setError('サブアカウントの削除に失敗しました。');
      }
    } catch (error) {
      console.error('handleDeleteSubAccount エラーキャッチ:', error);
    }
  };

  const handleEditSubAccount = (subAccount: SubAccount) => {
    setSelectedSubAccount(subAccount);
    setIsFormOpen(true);
  };

  const handleAddSubAccount = () => {
    setSelectedSubAccount(null);
    setIsFormOpen(true);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getRoleDisplay = (role: string) => {
    const roleMap: Record<string, string> = {
      admin: '管理者',
      staff: 'スタッフ',
      accounting: '経理',
      readonly: '閲覧のみ',
    };
    return roleMap[role] || role;
  };

  const getStatusDisplay = (status: string) => {
    const statusMap: Record<string, string> = {
      active: '有効',
      inactive: '無効',
      pending: '保留中',
    };
    return statusMap[status] || status;
  };

  if (isAuthLoading) {
    return (
      <div className="p-4 text-center text-gray-500">認証情報を確認中...</div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-md">
        <p className="text-red-600">{error || '認証エラー'}</p>
      </div>
    );
  }

  if (isFormOpen) {
    return (
      <SubAccountForm
        subAccount={selectedSubAccount}
        onClose={() => setIsFormOpen(false)}
        onSuccess={() => {
          setIsFormOpen(false);
          queryClient.invalidateQueries(['subAccounts']);
          setError(null);
        }}
      />
    );
  }

  if (isDataLoading) {
    return (
      <div className="p-4 text-center text-gray-500">
        サブアカウント情報を読み込み中...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">サブアカウント管理</h1>

        <button
          onClick={handleAddSubAccount}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <Plus className="h-4 w-4 mr-2" />
          新規サブアカウント登録
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
        <div className="flex items-center">
          <User className="h-5 w-5 text-blue-500 mr-2" />
          <span className="text-blue-700 font-medium">
            現在のサブアカウント数: {subAccounts.length}
          </span>
        </div>
      </div>

      <div className="max-w-md">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="メールアドレスまたは権限で検索..."
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>
      </div>

      <div className="bg-white shadow overflow-hidden rounded-lg">
        {subAccounts.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    メールアドレス
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    担当者
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    権限
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    登録日
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    操作
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {subAccounts.map((subAccount: SubAccount) => {
                  const status = getStatusDisplay(subAccount.status);
                  return (
                    <tr key={subAccount.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                            <Mail className="h-5 w-5 text-indigo-600" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {subAccount.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <User className="h-4 w-4 text-gray-400 mr-1" />
                          <span className="text-sm text-gray-900">
                            {subAccount.contact_name || '未設定'}
                          </span>
                          {subAccount.phone && (
                            <div className="ml-2 flex items-center text-xs text-gray-500">
                              <Phone className="h-3 w-3 mr-1" />
                              <span>{subAccount.phone}</span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Shield className="h-4 w-4 text-gray-400 mr-1" />
                          <span className="text-sm text-gray-900">
                            {getRoleDisplay(subAccount.role)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 text-gray-400 mr-1" />
                          <span>{formatDate(subAccount.created_at)}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleEditSubAccount(subAccount)}
                          className="text-indigo-600 hover:text-indigo-900 mr-4"
                          title="編集"
                        >
                          <Edit className="h-5 w-5" />
                          <span className="sr-only">編集</span>
                        </button>
                        <button
                          onClick={() => handleDeleteSubAccount(subAccount)}
                          className="text-red-600 hover:text-red-900"
                          title="削除"
                          disabled={deleteSubAccountMutation.isLoading}
                        >
                          <Trash2 className="h-5 w-5" />
                          <span className="sr-only">削除</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center">
            <User className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              サブアカウントがありません
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              新しいサブアカウントを登録してください
            </p>
            <div className="mt-6">
              <button
                onClick={handleAddSubAccount}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <Plus className="h-4 w-4 mr-2" />
                新規サブアカウント登録
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SubAccountList;