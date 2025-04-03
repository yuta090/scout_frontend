import { JobCategory } from '../types';

export const FINANCE_CATEGORIES: JobCategory = {
  id: 'finance',
  name: '金融専門職',
  subcategories: [
    {
      id: 'product_development',
      name: '商品開発',
      jobs: [
        { id: 'structurer', name: 'ストラクチャラー', value: '73558' },
        { id: 'quants', name: 'クオンツ', value: '3f5f7' },
        { id: 'actuary', name: 'アクチュアリー', value: 'c786a' },
        { id: 'product_development_other', name: 'その他', value: '77b1c' }
      ]
    },
    {
      id: 'trading',
      name: '運用',
      jobs: [
        { id: 'dealer', name: 'ディーラー', value: '14dfd' },
        { id: 'trader', name: 'トレーダー', value: '7a0fb' },
        { id: 'fund_manager', name: 'ファンドマネジャー', value: 'da144' },
        { id: 'trading_quants', name: 'クオンツ', value: '2b732' },
        { id: 'trust', name: '信託', value: '852d3' },
        { id: 'trading_other', name: 'その他', value: 'd1717' }
      ]
    },
    {
      id: 'asset_management',
      name: '資産運用',
      jobs: [
        { id: 'asset_management', name: 'アセットマネジメント', value: '37b9b' },
        { id: 'private_banker', name: 'プライベートバンカー', value: '4a24c' },
        { id: 'asset_management_other', name: 'その他', value: '77b1c' }
      ]
    },
    {
      id: 'risk_management',
      name: 'リスク管理',
      jobs: [
        { id: 'risk_management_other', name: 'その他', value: '0b98e' }
      ]
    },
    {
      id: 'screening',
      name: '審査/回収',
      jobs: [
        { id: 'corporate_loan', name: '融資/契約審査法人担当', value: '75114' },
        { id: 'individual_loan', name: '融資/契約審査個人担当', value: 'dae29' },
        { id: 'corporate_payment', name: '支払審査法人担当', value: 'f12b6' },
        { id: 'individual_payment', name: '支払審査個人担当', value: 'e2511' },
        { id: 'corporate_collection', name: '債権回収法人担当', value: '93c10' },
        { id: 'individual_collection', name: '債権回収個人担当', value: '02a93' },
        { id: 'screening_other', name: 'その他', value: '85926' }
      ]
    },
    {
      id: 'investment_banking',
      name: 'インベストバンキング',
      jobs: [
        { id: 'structured_finance', name: 'ストラクチャードファイナンス', value: 'fea08' },
        { id: 'project_finance', name: 'プロジェクトファイナンス', value: 'c3d2e' },
        { id: 'corporate_finance', name: 'コーポレートファイナンス', value: '4ff6b' },
        { id: 'ipo', name: '公開/引受', value: '3b69f' },
        { id: 'ma', name: 'M&A', value: 'ba9f1' },
        { id: 'pe_vc', name: 'PE/VC業務', value: '66765' },
        { id: 'investment_banking_other', name: 'その他', value: '128db' }
      ]
    },
    {
      id: 'back_office',
      name: 'バックオフィス',
      jobs: [
        { id: 'settlement', name: '決済', value: 'f3d0b' },
        { id: 'accounting', name: '計理', value: '64b39' },
        { id: 'custody', name: 'カストディ', value: '84ba8' },
        { id: 'contract', name: '約定', value: '31a84' },
        { id: 'delivery', name: '受渡', value: '11991' },
        { id: 'forex', name: '為替', value: 'ad336' },
        { id: 'back_office_other', name: 'その他', value: '487ac' }
      ]
    },
    {
      id: 'internal_audit',
      name: '内部監査',
      jobs: [
        { id: 'model_audit', name: 'モデル監査', value: 'd8a8e' },
        { id: 'credit_audit', name: '与信監査', value: 'c6083' },
        { id: 'system_audit', name: 'システム監査', value: 'da1db' },
        { id: 'financial_crime', name: '金融犯罪関連監査', value: 'dbdb8' },
        { id: 'internal_audit_other', name: 'その他', value: '5041b' }
      ]
    },
    {
      id: 'insurance_office',
      name: '保険事務',
      jobs: [
        { id: 'life_insurance', name: '生保事務', value: 'bdd7d' },
        { id: 'non_life_insurance', name: '損保事務', value: '1b5b2' },
        { id: 'damage_investigation', name: '損害調査', value: '36f03' },
        { id: 'adjuster', name: 'アジャスター', value: 'c0960' },
        { id: 'insurance_office_other', name: 'その他', value: 'befbc' }
      ]
    },
    {
      id: 'financial_planner',
      name: 'FP/ファイナンシャルアドバイザー',
      jobs: [
        { id: 'financial_planner', name: 'FP/ファイナンシャルアドバイザー', value: '94513' }
      ]
    },
    {
      id: 'rating',
      name: '格付',
      jobs: [
        { id: 'rating', name: '格付', value: '956be' }
      ]
    },
    {
      id: 'finance_other',
      name: 'その他',
      jobs: [
        { id: 'finance_other', name: 'その他', value: '57410' }
      ]
    }
  ]
};