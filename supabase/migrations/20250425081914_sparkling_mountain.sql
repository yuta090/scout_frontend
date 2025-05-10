/*
  # 請求書管理機能の追加

  1. 新規テーブル
    - `invoices`: 請求書情報を管理するテーブル
      - `id` (uuid, primary key)
      - `campaign_id` (uuid, foreign key to campaigns)
      - `customer_id` (uuid, foreign key to customers)
      - `agency_id` (uuid, foreign key to profiles)
      - `invoice_number` (text)
      - `issue_date` (date)
      - `due_date` (date)
      - `amount` (numeric)
      - `status` (text)
      - `payment_date` (date)
      - `payment_method` (text)
      - `notes` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. セキュリティ
    - RLSを有効化
    - 代理店が自社の請求書を管理できるポリシーを追加
    - 管理者が全請求書にアクセスできるポリシーを追加
    - サブアカウントが権限に基づいて請求書にアクセスできるポリシーを追加
*/

-- 請求書テーブルの作成
CREATE TABLE invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id uuid REFERENCES campaigns(id) ON DELETE SET NULL,
  customer_id uuid NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  agency_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  invoice_number text NOT NULL,
  issue_date date NOT NULL,
  due_date date NOT NULL,
  amount numeric NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'overdue', 'cancelled')),
  payment_date date,
  payment_method text,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- インデックスの作成（検索効率向上のため）
CREATE INDEX idx_invoices_customer_id ON invoices(customer_id);
CREATE INDEX idx_invoices_agency_id ON invoices(agency_id);
CREATE INDEX idx_invoices_status ON invoices(status);
CREATE INDEX idx_invoices_due_date ON invoices(due_date);

-- RLSを有効化
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

-- 代理店が自社の請求書を管理できるポリシー
CREATE POLICY "Agencies can manage their invoices"
  ON invoices
  FOR ALL
  TO authenticated
  USING (
    auth.uid() = agency_id
    OR
    EXISTS (
      SELECT 1 FROM customers
      WHERE customers.id = invoices.customer_id
      AND customers.agency_id = auth.uid()
    )
  )
  WITH CHECK (
    auth.uid() = agency_id
    OR
    EXISTS (
      SELECT 1 FROM customers
      WHERE customers.id = invoices.customer_id
      AND customers.agency_id = auth.uid()
    )
  );

-- 管理者が全請求書にアクセスできるポリシー
CREATE POLICY "Admins can access all invoices"
  ON invoices
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- サブアカウントが閲覧権限に基づいて請求書にアクセスできるポリシー
CREATE POLICY "Subaccounts can access invoices based on permissions"
  ON invoices
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles parent
      JOIN profiles subaccount ON subaccount.parent_id = parent.id
      WHERE subaccount.id = auth.uid()
      AND parent.id = invoices.agency_id
      AND (
        (subaccount.permissions->>'billing')::jsonb->>'view' = 'true'
        OR
        (
          (subaccount.permissions->>'billing')::jsonb->>'view_all_customers' = 'true'
          AND EXISTS (
            SELECT 1 FROM customers
            WHERE customers.agency_id = parent.id
          )
        )
      )
    )
  );

-- 自動更新トリガーの設定
CREATE TRIGGER update_invoices_updated_at
BEFORE UPDATE ON invoices
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- コメント追加
COMMENT ON TABLE invoices IS '請求書情報を管理するテーブル';
COMMENT ON COLUMN invoices.invoice_number IS '請求書番号（表示用）';
COMMENT ON COLUMN invoices.status IS '支払い状況: pending(未払い), paid(支払済), overdue(支払期限超過), cancelled(キャンセル)';