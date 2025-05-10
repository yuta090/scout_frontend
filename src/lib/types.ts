import { DeliveryDayKey, DeliveryDays } from './campaign/types';

// User management types
export interface UserMetadata {
  role: 'agency' | 'client' | 'admin' | 'referral_agent';
  company_name?: string;
  contact_name?: string;
  phone?: string;
  agency_type?: 'contractor' | 'referral';
}

export interface Profile {
  id: string;
  role: 'agency' | 'client' | 'admin' | 'referral_agent';
  email: string;
  company_name: string;
  contact_name?: string;
  phone?: string;
  agency_type?: 'contractor' | 'referral';
  created_at: string;
  updated_at: string;
}

export interface SubAccount {
  id: string;
  agency_id: string;
  email: string;
  role: 'admin' | 'staff' | 'accounting' | 'readonly';
  permissions: {
    customers: { view: boolean; create: boolean; edit: boolean; delete: boolean };
    campaigns: { view: boolean; create: boolean; edit: boolean; delete: boolean };
    reports: { view: boolean };
    billing: { view: boolean };
  };
  status: 'active' | 'inactive' | 'pending';
  created_at: string;
  updated_at: string;
}

export interface CampaignLog {
  id: string;
  campaign_id: string;
  details: string;
  created_at: string;
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
  employer_id?: string; // 32文字の英数字雇用者識別子
  _count?: {
    campaigns: number;
    scouts: number;
  };
}

export interface SearchCriteria {
  keywords: string[];
  jobExperience: string[];
  desiredJobs: string[];
  experience: {
    min: number;
    max: number;
  };
  education: string[];
  graduationYear: {
    min: string;
    max: string;
  };
  workExperience: {
    min: string;
    max: string;
  };
  skills: string[];
  experiences: string[];
  certifications: string[];
  englishLevel: string;
  companyCount: string;
  managementCount: string;
  employmentStatus: string | null;
  companies: string[];
  recentOnly: boolean;
  exclude: boolean;
  otherLanguages: string[];
  includeAllLanguages: boolean;
  freeWordOr: string;
  freeWordAnd: string;
  freeWordExclude: string;
}

export interface JobType {
  id: string;
  name: string;
  locations: string[];
  quantity: number;
  age_range?: [number | '', number | ''];
  search_criteria: SearchCriteria;
}

export interface Campaign {
  id: string;
  customer_id: string;
  agency_id: string;
  title: string;
  description: string;
  job_details: {
    platform: 'airwork' | 'engage';
    job_type: Array<{
      name: string;
      locations: string[];
      age_range?: [number | '', number | ''];
    }>;
    quantity: number[];
  };
  target_criteria: {
    age_range: string[];
    experience_years: number;
    skills: string[];
    education: string[];
  };
  search_criteria: SearchCriteria;
  quantity: number;
  status: 'draft' | 'requested' | 'approved' | 'in_progress' | 'completed' | 'cancelled';
  options: {
    schedule: {
      start_date: string;
      end_date: string;
      delivery_days: {
        [key: string]: {
          checked: boolean;
          start: string;
        };
      };
      daily_limit: number;
    };
    message_template: string;
  };
  automation_settings: {
    browser_type: string;
    retry_count: number;
    delay_between_scouts: number;
    working_hours: {
      start: string;
      end: string;
    };
    error_handling: {
      max_errors: number;
      pause_on_error: boolean;
    };
  };
  total_amount: number;
  created_at: string;
  updated_at: string;
  customers?: {
    company_name: string;
  };
  _count?: {
    scouts: number;
  };
}

export interface Activity {
  id: string;
  user_id: string;
  action: string;
  details: {
    message: string;
    role?: 'agency' | 'client' | 'admin' | 'referral_agent' | null;
    company_name?: string;
    [key: string]: any;
  };
  created_at: string;
  profiles?: {
    id: string;
    role: 'agency' | 'client' | 'admin' | 'referral_agent' | string;
    company_name?: string;
  } | null;
}

// 請求書ステータス
export type InvoiceStatus = 'pending' | 'paid' | 'overdue' | 'cancelled';

// 支払い方法
export type PaymentMethod = 'bank_transfer' | 'credit_card' | 'other';

// 請求書インターフェース
export interface Invoice {
  id: string;
  invoice_number: string;
  agency_id: string;
  customer_id: string;
  campaign_id?: string;
  amount: number;
  tax_rate: number;
  tax_amount: number;
  total_amount: number;
  issue_date: string;
  due_date: string;
  payment_date?: string;
  payment_method?: PaymentMethod;
  status: InvoiceStatus;
  notes?: string;
  created_at: string;
  updated_at: string;
  
  // 関連データ
  customer?: Customer;
  campaign?: Campaign;
  agency?: Profile;
}

// 請求書項目
export interface InvoiceItem {
  id: string;
  invoice_id: string;
  description: string;
  quantity: number;
  unit_price: number;
  amount: number;
  created_at: string;
  updated_at: string;
}