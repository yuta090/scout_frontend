export interface ScoutResult {
  id: string;
  campaign_id: string;
  customer_id: string;
  candidate_details: any;
  sent_date: string;
  sent_time: string;
  created_at: string;
  updated_at: string;
  campaign?: {
    title: string;
    job_details?: {
      job_type?: Array<{
        name: string;
      }>;
    };
    customer_id?: string;
  };
  customer?: {
    company_name: string;
  };
}

// グループ化されたスカウト結果の型
export interface GroupedScoutResult {
  customer_id: string;
  customer_name: string;
  sent_time: string;
  sent_date: string;
  job_types: string[];
  total_count: number;
  success_count: number;
  error_count: number;
  items: ScoutResult[];
}