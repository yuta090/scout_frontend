import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import CustomerList from './CustomerList';
import CustomerForm from './CustomerForm';
import ExcelUpload from './ExcelUpload';
import { supabase, type Customer, getCustomers, createCustomer, updateCustomer, logActivity } from '../lib/supabase';

const CustomerManagement: React.FC = () => {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | undefined>();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isExcelUploadOpen, setIsExcelUploadOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          navigate('/');
          return;
        }

        const customersData = await getCustomers(user.id);
        setCustomers(customersData);
      } catch (err) {
        console.error('Error fetching customers:', err);
        setError('顧客情報の取得に失敗しました');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCustomers();
  }, [navigate]);

  const handleAdd = () => {
    // 修正: 新規顧客登録時に選択中の顧客情報をリセット
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

    try {
      const { error } = await supabase
        .from('customers')
        .delete()
        .eq('id', customer.id);

      if (error) throw error;

      setCustomers(customers.filter(c => c.id !== customer.id));
      
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await logActivity(user.id, 'customer_deleted', {
          message: `${customer.company_name}を削除しました`,
          customer_id: customer.id
        });
      }
    } catch (err) {
      console.error('Error deleting customer:', err);
      alert('顧客の削除に失敗しました');
    }
  };

  const handleSubmit = async (data: Omit<Customer, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('認証エラー');

      let updatedCustomer: Customer;
      
      if (selectedCustomer) {
        // 更新
        updatedCustomer = await updateCustomer(selectedCustomer.id, data);
        setCustomers(customers.map(c => 
          c.id === selectedCustomer.id ? updatedCustomer : c
        ));

        await logActivity(user.id, 'customer_updated', {
          message: `${updatedCustomer.company_name}の情報を更新しました`,
          customer_id: updatedCustomer.id
        });
      } else {
        // 新規作成
        const newCustomer = await createCustomer({
          ...data,
          agency_id: user.id
        });
        setCustomers([...customers, newCustomer]);

        await logActivity(user.id, 'customer_created', {
          message: `${newCustomer.company_name}を登録しました`,
          customer_id: newCustomer.id
        });
      }

      setIsFormOpen(false);
      // フォームを閉じた後に選択中の顧客情報をリセット
      setSelectedCustomer(undefined);
    } catch (err) {
      console.error('Error saving customer:', err);
      throw new Error('顧客情報の保存に失敗しました');
    }
  };

  const handleBulkUpload = async (customersData: Omit<Customer, 'id' | 'created_at' | 'updated_at'>[]) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('認証エラー');

      const newCustomers = await Promise.all(
        customersData.map(data => 
          createCustomer({
            ...data,
            agency_id: user.id
          })
        )
      );

      setCustomers([...customers, ...newCustomers]);

      await logActivity(user.id, 'customers_bulk_created', {
        message: `${newCustomers.length}件の顧客情報を一括登録しました`,
        count: newCustomers.length
      });

      setIsExcelUploadOpen(false);
    } catch (err) {
      console.error('Error bulk uploading customers:', err);
      throw new Error('顧客情報の一括登録に失敗しました');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      <CustomerList
        customers={customers}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onAdd={handleAdd}
        onBulkUpload={() => setIsExcelUploadOpen(true)}
      />

      <CustomerForm
        customer={selectedCustomer}
        onSubmit={handleSubmit}
        onCancel={() => {
          setIsFormOpen(false);
          // フォームをキャンセルした場合も選択中の顧客情報をリセット
          setSelectedCustomer(undefined);
        }}
        isOpen={isFormOpen}
      />

      <ExcelUpload
        onUpload={handleBulkUpload}
        onClose={() => setIsExcelUploadOpen(false)}
        isOpen={isExcelUploadOpen}
      />
    </div>
  );
};

export default CustomerManagement;