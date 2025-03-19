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
  details: any;
  created_at: string;
}