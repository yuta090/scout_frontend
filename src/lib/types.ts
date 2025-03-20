// User management types
export interface UserMetadata {
  role: 'agency' | 'client';
  company_name?: string;
  contact_name?: string;
  phone?: string;
}

export interface Profile {
  id: string;
  role: 'agency' | 'client';
  email: string;
  company_name: string;
  contact_name?: string;
  phone?: string;
  created_at: string;
  updated_at: string;
}

export interface Customer {
  id: string;
  agency_id: string;
  company_name: string;
  contact_name: string | null;
  email: string | null;
  phone: string | null;
  airwork_login: {
    username?: string;
    password?: string;
  };
  engage_login: {
    username?: string;
    password?: string;
  };
  airwork_auth_status: 'pending' | 'authenticated' | 'failed';
  engage_auth_status: 'pending' | 'authenticated' | 'failed';
  status: 'active' | 'inactive' | 'pending';
  created_at: string;
  updated_at: string;
  _count?: {
    campaigns: number;
    scouts: number;
  };
}

// ... (残りの型定義は変更なし)