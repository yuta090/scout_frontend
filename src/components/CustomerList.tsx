import React, { useState } from 'react';
import { FixedSizeList as List } from 'react-window';
import type { Customer } from '../lib/supabase';
import CustomerDetail from './CustomerDetail';
import { checkAirworkAuth, checkEngageAuth, supabase } from '../lib/supabase';
import EmptyCustomerList from './customer/EmptyCustomerList';
import CustomerRow from './customer/CustomerRow';

interface CustomerListProps {
  customers: Customer[];
  onEdit: (customer: Customer) => void;
  onDelete: (customer: Customer) => void;
  onAdd: () => void;
  onBulkUpload: () => void;
  isLoading: boolean;
  checkingAllAuth: boolean;
  checkProgress: {
    current: number;
    total: number;
    message: string;
  };
}

const CustomerList: React.FC<CustomerListProps> = ({ 
  customers, 
  onEdit, 
  onDelete, 
  isLoading,
  checkingAllAuth,
  checkProgress
}) => {
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [checkingAuth, setCheckingAuth] = useState<{customer: Customer, platform: 'airwork' | 'engage'} | null>(null);

  // ステータス関連の関数
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

  // 認証チェック処理
  const handleAuthCheck = async (customer: Customer, platform: 'airwork' | 'engage') => {
    setCheckingAuth({customer, platform});
    
    try {
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
    } catch (error) {
      console.error(`Error checking ${platform} authentication:`, error);
    } finally {
      setCheckingAuth(null);
    }
  };

  // 仮想化リストのレンダリング関数
  const renderCustomerRow = ({ index, style }: { index: number; style: React.CSSProperties }) => {
    const customer = customers[index];
    const isAuthLoading = checkingAuth?.customer.id === customer.id;
    
    return (
      <CustomerRow
        key={customer.id}
        customer={customer}
        style={style}
        getStatusColor={getStatusColor}
        getStatusText={getStatusText}
        onAuthCheck={handleAuthCheck}
        onView={setSelectedCustomer}
        onEdit={onEdit}
        onDelete={onDelete}
        isAuthLoading={isAuthLoading}
      />
    );
  };

  return (
    <>
      {customers.length > 0 ? (
        <div style={{ height: 600 }} className="list-none" data-virtualized="true">
          <List
            height={600}
            width="100%"
            itemCount={customers.length}
            itemSize={100}
            overscanCount={5}
            className="list-none"
          >
            {renderCustomerRow}
          </List>
        </div>
      ) : (
        <EmptyCustomerList searchTerm="" />
      )}

      {selectedCustomer && (
        <CustomerDetail
          customer={selectedCustomer}
          onClose={() => setSelectedCustomer(null)}
          onEdit={() => {
            onEdit(selectedCustomer);
            setSelectedCustomer(null);
          }}
        />
      )}
    </>
  );
};

export default CustomerList;