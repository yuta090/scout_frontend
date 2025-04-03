// 前のコードは変更なし...

// 新しい型定義を追加
export interface CustomerStats {
  total_customers: number;
  active_customers: number;
  pending_customers: number;
  inactive_customers: number;
  airwork_authenticated: number;
  engage_authenticated: number;
}

export interface CustomerSearchParams {
  search_term?: string;
  status?: 'active' | 'inactive' | 'pending';
  page?: number;
  page_size?: number;
}

// 顧客検索の最適化関数
export const searchCustomers = async (
  agencyId: string,
  params: CustomerSearchParams = {}
) => {
  try {
    const {
      search_term = '',
      status,
      page = 1,
      page_size = 50
    } = params;

    const { data, error } = await executeWithRetry(() =>
      supabase
        .rpc('search_customers', {
          p_agency_id: agencyId,
          p_search_term: search_term || null,
          p_status: status || null,
          p_page: page,
          p_page_size: page_size
        })
    );

    if (error) throw error;

    return data as Customer[];
  } catch (error) {
    console.error('Error searching customers:', error);
    throw error;
  }
};

// 顧客統計情報の取得
export const getCustomerStats = async (agencyId: string): Promise<CustomerStats> => {
  try {
    const { data, error } = await executeWithRetry(() =>
      supabase
        .rpc('get_customer_stats', {
          p_agency_id: agencyId
        })
        .single()
    );

    if (error) throw error;
    return data as CustomerStats;
  } catch (error) {
    console.error('Error fetching customer stats:', error);
    throw error;
  }
};

// 残りのコードは変更なし...