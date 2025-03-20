import React, { useState, useEffect } from 'react';
import { Search, Building2, Plus } from 'lucide-react';
import { supabase, type Customer } from '../../lib/supabase';
import CustomerForm from '../CustomerForm';

interface CustomerSelectorProps {
  selectedCustomer: Customer | null;
  onSelectCustomer: (customer: Customer | null) => void;
}

const CustomerSelector: React.FC<CustomerSelectorProps> = ({ selectedCustomer, onSelectCustomer }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<Customer[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [showCustomerForm, setShowCustomerForm] = useState(false);

  useEffect(() => {
    const fetchInitialCustomers = async () => {
      const { data } = await supabase
        .from('customers')
        .select('*')
        .limit(5)
        .order('company_name');

      if (data) {
        setSearchResults(data);
      }
    };
    fetchInitialCustomers();
  }, []);

  useEffect(() => {
    const searchCustomers = async () => {
      if (searchTerm.trim()) {
        setHasSearched(true);
        const { data: customers, error } = await supabase
          .from('customers')
          .select('*')
          .ilike('company_name', `%${searchTerm}%`)
          .limit(5);

        if (!error && customers) {
          setSearchResults(customers);
        }
      } else {
        setHasSearched(false);
        setSearchResults([]);
      }
    };

    const timer = setTimeout(searchCustomers, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const handleCustomerSubmit = async (data: Omit<Customer, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('認証エラー');

      const { data: newCustomer, error } = await supabase
        .from('customers')
        .insert([{ ...data, agency_id: user.id }])
        .select()
        .single();

      if (error) throw error;

      onSelectCustomer(newCustomer);
      setShowCustomerForm(false);
      setSearchTerm('');
      setHasSearched(false);
    } catch (err) {
      console.error('Error creating customer:', err);
      throw new Error('顧客の登録に失敗しました');
    }
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          顧客名 <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="顧客名を入力して検索..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            required
          />
        </div>

        {!selectedCustomer && searchResults.length > 0 && (
          <div className="absolute inset-x-0 z-10 mt-1 bg-white shadow-lg rounded-md border border-gray-200 max-h-60 overflow-y-auto">
            <ul className="py-1">
              {searchResults.map((customer) => (
                <li key={customer.id} className="px-4 py-2 hover:bg-gray-50">
                  <button
                    onClick={() => {
                      onSelectCustomer(customer);
                      setSearchTerm('');
                      setHasSearched(false);
                    }}
                    className="w-full flex items-center text-left"
                  >
                    <Building2 className="h-5 w-5 text-gray-400 flex-shrink-0" />
                    <div className="ml-3 min-w-0 flex-1">
                      <div className="text-sm font-medium text-gray-900 truncate">
                        {customer.company_name}
                      </div>
                      {customer.contact_name && (
                        <div className="text-sm text-gray-500 truncate">
                          {customer.contact_name}
                        </div>
                      )}
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {hasSearched && searchResults.length === 0 && (
          <div className="mt-2 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
            <p className="text-sm text-yellow-800">
              該当する顧客が見つかりません。
            </p>
            <button
              onClick={() => setShowCustomerForm(true)}
              className="mt-2 inline-flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-800"
            >
              <Plus className="h-4 w-4 mr-1" />
              新規顧客を登録する
            </button>
          </div>
        )}
      </div>

      {selectedCustomer && (
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center min-w-0">
            <div className="h-12 w-12 flex-shrink-0 rounded-full bg-indigo-100 flex items-center justify-center">
              <Building2 className="h-6 w-6 text-indigo-600" />
            </div>
            <div className="ml-4 min-w-0 flex-1">
              <h3 className="text-lg font-medium text-gray-900 truncate">
                {selectedCustomer.company_name}
              </h3>
              {selectedCustomer.contact_name && (
                <p className="text-sm text-gray-500 truncate">
                  {selectedCustomer.contact_name}
                </p>
              )}
            </div>
            <button
              onClick={() => {
                onSelectCustomer(null);
                setSearchTerm('');
              }}
              className="ml-4 text-sm text-gray-500 hover:text-gray-700 whitespace-nowrap"
            >
              変更
            </button>
          </div>
        </div>
      )}

      {showCustomerForm && (
        <CustomerForm
          onSubmit={handleCustomerSubmit}
          onCancel={() => setShowCustomerForm(false)}
          isOpen={showCustomerForm}
        />
      )}
    </div>
  );
};

export default CustomerSelector;