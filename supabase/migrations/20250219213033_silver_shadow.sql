/*
  # 顧客とキャンペーン管理のためのテーブル作成

  1. 新規テーブル
    - `customers`
      - `id` (uuid, primary key)
      - `agency_id` (uuid, foreign key)
      - `company_name` (text)
      - `contact_name` (text)
      - `email` (text)
      - `phone` (text)
      - `airwork_login` (jsonb)
      - `status` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `campaigns`
      - `id` (uuid, primary key)
      - `customer_id` (uuid, foreign key)
      - `agency_id` (uuid, foreign key)
      - `title` (text)
      - `description` (text)
      - `job_details` (jsonb)
      - `target_criteria` (jsonb)
      - `quantity` (integer)
      - `status` (text)
      - `options` (jsonb)
      - `total_amount` (integer)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `campaign_results`
      - `id` (uuid, primary key)
      - `campaign_id` (uuid, foreign key)
      - `sent_count` (integer)
      - `click_count` (integer)
      - `apply_count` (integer)
      - `error_count` (integer)
      - `details` (jsonb)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. セキュリティ
    - すべてのテーブルでRLSを有効化
    - 代理店のみが顧客情報にアクセス可能
    - キャンペーン情報は関連する代理店のみがアクセス可能
*/

-- 顧客テーブルの作成
CREATE TABLE IF NOT EXISTS customers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  company_name text NOT NULL,
  contact_name text,
  email text,
  phone text,
  airwork_login jsonb DEFAULT '{}'::jsonb,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'pending')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- キャンペーンテーブルの作成
CREATE TABLE IF NOT EXISTS campaigns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid REFERENCES customers(id) ON DELETE CASCADE,
  agency_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  job_details jsonb NOT NULL DEFAULT '{}'::jsonb,
  target_criteria jsonb NOT NULL DEFAULT '{}'::jsonb,
  quantity integer NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'pending', 'approved', 'in_progress', 'completed', 'cancelled')),
  options jsonb DEFAULT '{}'::jsonb,
  total_amount integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- キャンペーン結果テーブルの作成
CREATE TABLE IF NOT EXISTS campaign_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id uuid REFERENCES campaigns(id) ON DELETE CASCADE,
  sent_count integer NOT NULL DEFAULT 0,
  click_count integer NOT NULL DEFAULT 0,
  apply_count integer NOT NULL DEFAULT 0,
  error_count integer NOT NULL DEFAULT 0,
  details jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- RLSの設定
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_results ENABLE ROW LEVEL SECURITY;

-- 顧客テーブルのポリシー（代理店のみ）
CREATE POLICY "Agency can manage their customers"
  ON customers
  FOR ALL
  TO authenticated
  USING (auth.uid() = agency_id)
  WITH CHECK (auth.uid() = agency_id);

-- キャンペーンテーブルのポリシー
CREATE POLICY "Agency can manage their campaigns"
  ON campaigns
  FOR ALL
  TO authenticated
  USING (auth.uid() = agency_id)
  WITH CHECK (auth.uid() = agency_id);

-- キャンペーン結果テーブルのポリシー
CREATE POLICY "Agency can view campaign results"
  ON campaign_results
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM campaigns
      WHERE campaigns.id = campaign_results.campaign_id
      AND campaigns.agency_id = auth.uid()
    )
  );

-- updated_at自動更新トリガーの設定
CREATE TRIGGER update_customers_updated_at
  BEFORE UPDATE ON customers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_campaigns_updated_at
  BEFORE UPDATE ON campaigns
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_campaign_results_updated_at
  BEFORE UPDATE ON campaign_results
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- インデックスの作成
CREATE INDEX IF NOT EXISTS idx_customers_agency_id ON customers(agency_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_agency_id ON campaigns(agency_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_customer_id ON campaigns(customer_id);
CREATE INDEX IF NOT EXISTS idx_campaign_results_campaign_id ON campaign_results(campaign_id);