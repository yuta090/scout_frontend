import React, { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import CustomerList from './CustomerList';
import CustomerForm from './CustomerForm';
import ExcelUpload from './ExcelUpload';
import { supabase, type Customer, getCustomers, createCustomer, updateCustomer, logActivity, checkAirworkAuth, checkEngageAuth } from '../lib/supabase';
import CustomerListSkeleton from './customer/CustomerListSkeleton';
import CustomerListHeader from './customer/CustomerListHeader';
import CustomerProgressBar from './customer/CustomerProgressBar';

const CustomerManagement: React.FC = () => {
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | undefined>();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isExcelUploadOpen, setIsExcelUploadOpen] = useState(false);
  const [displayCustomers, setDisplayCustomers] = useState<Customer[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const queryClient = useQueryClient();

  // 認証情報の取得
  const { data: userData, isLoading: isUserLoading } = useQuery('user', async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');
    return user;
  }, {
    retry: false,
    staleTime: Infinity // ユーザー情報は変わらないのでキャッシュを永続化
  });

  // 顧客データの取得
  const { data: customers = [], isLoading: isCustomersLoading, error } = useQuery(
    ['customers', userData?.id],
    () => getCustomers(userData!.id),
    {
      enabled: !!userData?.id, // ユーザーIDがある場合のみ実行
      staleTime: 30000, // 30秒間はデータを新鮮と見なす
      cacheTime: 1000 * 60 * 60, // 1時間キャッシュを保持
      onSuccess: (data) => {
        setDisplayCustomers(data);
      },
      keepPreviousData: true, // 新しいデータが取得されるまで前のデータを保持
      refetchOnMount: true // コンポーネントがマウントされたときに再取得
    }
  );

  // 検索結果のフィルタリング
  React.useEffect(() => {
    if (customers.length > 0) {
      const searchLower = searchTerm.toLowerCase();
      const filtered = customers.filter(customer =>
        customer.company_name.toLowerCase().includes(searchLower) ||
        (customer.contact_name?.toLowerCase() || '').includes(searchLower) ||
        (customer.email?.toLowerCase() || '').includes(searchLower)
      );
      setDisplayCustomers(filtered);
    }
  }, [searchTerm, customers]);

  // キャッシュからデータを取得して表示
  React.useEffect(() => {
    // ユーザーIDがある場合、既存のキャッシュデータを確認
    if (userData?.id) {
      const cachedData = queryClient.getQueryData<Customer[]>(['customers', userData.id]);
      if (cachedData && cachedData.length > 0) {
        setDisplayCustomers(cachedData);
      }
    }
  }, [userData?.id, queryClient]);

  // 全体のローディング状態
  const isLoading = isUserLoading || (isCustomersLoading && displayCustomers.length === 0);

  // 顧客作成のミューテーション
  const createCustomerMutation = useMutation(
    async (data: Omit<Customer, 'id' | 'created_at' | 'updated_at'>) => {
      if (!userData) throw new Error('認証エラー');
      const newCustomer = await createCustomer({
        ...data,
        agency_id: userData.id
      });
      await logActivity(userData.id, 'customer_created', {
        message: `${newCustomer.company_name}を登録しました`,
        customer_id: newCustomer.id
      });
      return newCustomer;
    },
    {
      onSuccess: (newCustomer) => {
        queryClient.invalidateQueries(['customers', userData?.id]);
        // 即時UIを更新するためにキャッシュを直接更新
        setDisplayCustomers(prev => [...prev, newCustomer]);
        setIsFormOpen(false);
        setSelectedCustomer(undefined);
      }
    }
  );

  // 顧客更新のミューテーション
  const updateCustomerMutation = useMutation(
    async ({ id, data }: { id: string; data: Partial<Customer> }) => {
      if (!userData) throw new Error('認証エラー');
      const updatedCustomer = await updateCustomer(id, data);
      await logActivity(userData.id, 'customer_updated', {
        message: `${updatedCustomer.company_name}の情報を更新しました`,
        customer_id: updatedCustomer.id
      });
      return updatedCustomer;
    },
    {
      onSuccess: (updatedCustomer) => {
        queryClient.invalidateQueries(['customers', userData?.id]);
        // 即時UIを更新するためにキャッシュを直接更新
        setDisplayCustomers(prev => 
          prev.map(c => c.id === updatedCustomer.id ? updatedCustomer : c)
        );
        setIsFormOpen(false);
        setSelectedCustomer(undefined);
      }
    }
  );

  // 顧客削除のミューテーション
  const deleteCustomerMutation = useMutation(
    async (customer: Customer) => {
      if (!userData) throw new Error('認証エラー');
      const { error } = await supabase
        .from('customers')
        .delete()
        .eq('id', customer.id);
      
      if (error) throw error;
      
      await logActivity(userData.id, 'customer_deleted', {
        message: `${customer.company_name}を削除しました`,
        customer_id: customer.id
      });
      
      return customer.id;
    },
    {
      onSuccess: (deletedId) => {
        queryClient.invalidateQueries(['customers', userData?.id]);
        // 即時UIを更新するためにキャッシュを直接更新
        setDisplayCustomers(prev => prev.filter(c => c.id !== deletedId));
      }
    }
  );

  // 一括アップロードのミューテーション
  const bulkUploadMutation = useMutation(
    async (customersData: Omit<Customer, 'id' | 'created_at' | 'updated_at'>[]) => {
      if (!userData) throw new Error('認証エラー');
      
      const newCustomers = await Promise.all(
        customersData.map(data => 
          createCustomer({
            ...data,
            agency_id: userData.id
          })
        )
      );
      
      await logActivity(userData.id, 'customers_bulk_created', {
        message: `${newCustomers.length}件の顧客情報を一括登録しました`,
        count: newCustomers.length
      });
      
      return newCustomers;
    },
    {
      onSuccess: (newCustomers) => {
        queryClient.invalidateQueries(['customers', userData?.id]);
        // 即時UIを更新するためにキャッシュを直接更新
        setDisplayCustomers(prev => [...prev, ...newCustomers]);
        setIsExcelUploadOpen(false);
      }
    }
  );

  const handleAdd = () => {
    setSelectedCustomer(undefined);
    setIsFormOpen(true);
  };

  const handleEdit = (customer: Customer) => {
    setSelectedCustomer(customer);
    setIsFormOpen(true);
  };

  const handleDelete = async (customer: Customer) => {
    if (!window.confirm(`${customer.company_name}を削除してもよろしいですか？`)) {
      return;
    }
    deleteCustomerMutation.mutate(customer);
  };

  const handleSubmit = async (data: Omit<Customer, 'id' | 'created_at' | 'updated_at'>) => {
    if (selectedCustomer) {
      updateCustomerMutation.mutate({ id: selectedCustomer.id, data });
    } else {
      createCustomerMutation.mutate(data);
    }
  };

  const handleBulkUpload = async (customersData: Omit<Customer, 'id' | 'created_at' | 'updated_at'>[]) => {
    bulkUploadMutation.mutate(customersData);
  };

  const [checkingAllAuth, setCheckingAllAuth] = useState(false);
  const [checkProgress, setCheckProgress] = useState<{
    current: number;
    total: number;
    message: string;
  }>({ current: 0, total: 0, message: '' });

  // 全認証チェック処理
  const handleCheckAllAuth = useCallback(async () => {
    if (!userData || !customers.length) return;
    
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

        // 認証チェック処理
        const result = platform === 'airwork'
          ? await checkAirworkAuth(customer.airwork_login?.username, customer.airwork_login?.password)
          : await checkEngageAuth(customer.id);

        const { error } = await supabase
          .from('customers')
          .update({
            [`${platform}_auth_status`]: result.success ? 'authenticated' : 'failed'
          })
          .eq('id', customer.id);

        if (error) throw error;

        // 即時UIを更新
        setDisplayCustomers(prev => prev.map(c => {
          if (c.id === customer.id) {
            return {
              ...c,
              [platform === 'airwork' ? 'airwork_auth_status' : 'engage_auth_status']: 
                result.success ? 'authenticated' : 'failed'
            };
          }
          return c;
        }));

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

    } catch (error) {
      console.error('Error checking auth:', error);
    } finally {
      setCheckingAllAuth(false);
    }
  }, [customers, userData]);

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
          顧客情報の取得に失敗しました
        </div>
      )}

      <div className="bg-white shadow rounded-lg">
        {/* ヘッダー部分は常に表示 */}
        <CustomerListHeader 
          onCheckAllAuth={handleCheckAllAuth}
          onBulkUpload={() => setIsExcelUploadOpen(true)}
          onAdd={handleAdd}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          isCheckingAllAuth={checkingAllAuth}
          customersCount={displayCustomers.length}
        />

        {/* 顧客リスト部分 */}
        <div className="border-t border-gray-200">
          {isLoading ? (
            <CustomerListSkeleton />
          ) : (
            <CustomerList
              customers={displayCustomers}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onAdd={handleAdd}
              onBulkUpload={() => setIsExcelUploadOpen(true)}
              isLoading={false}
              checkingAllAuth={checkingAllAuth}
              checkProgress={checkProgress}
            />
          )}
        </div>
      </div>

      {/* モーダル */}
      {isFormOpen && (
        <CustomerForm
          customer={selectedCustomer}
          onSubmit={handleSubmit}
          onCancel={() => {
            setIsFormOpen(false);
            setSelectedCustomer(undefined);
          }}
          isOpen={isFormOpen}
        />
      )}

      {isExcelUploadOpen && (
        <ExcelUpload
          onUpload={handleBulkUpload}
          onClose={() => setIsExcelUploadOpen(false)}
          isOpen={isExcelUploadOpen}
        />
      )}

      {/* 進捗バー */}
      {checkProgress.total > 0 && (
        <CustomerProgressBar
          current={checkProgress.current}
          total={checkProgress.total}
          message={checkProgress.message}
        />
      )}
    </div>
  );
};

export default CustomerManagement;