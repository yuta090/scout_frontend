import { JobCategory } from '../types';

export const PLANNING_CATEGORIES: JobCategory = {
  id: 'planning',
  name: '企画/マーケティング/カスタマーサクセス/サポート',
  subcategories: [
    {
      id: 'business_planning',
      name: '経営/事業企画',
      jobs: [
        { id: 'management_planning', name: '経営企画', value: '83a64' },
        { id: 'business_planning', name: '事業企画', value: '0b41a' },
        { id: 'operations_planning', name: '業務企画', value: '725c7' },
        { id: 'new_business', name: '新規事業企画/開発', value: 'c241b' },
        { id: 'alliance', name: 'アライアンス企画/推進', value: '63f98' },
        { id: 'overseas_business', name: '海外事業企画/開発', value: '3066b' },
        { id: 'system_planning', name: 'システム企画', value: '72a1a' },
        { id: 'license_business', name: 'ライセンスビジネス企画/推進', value: 'fef9e' },
        { id: 'research_analysis', name: 'リサーチ/データ分析', value: '601f0' },
        { id: 'business_planning_other', name: 'その他', value: '7b869' }
      ]
    },
    {
      id: 'sales_planning',
      name: '営業推進/企画',
      jobs: [
        { id: 'sales_planning', name: '営業企画', value: '9caaa' },
        { id: 'sales_promotion', name: '営業推進', value: '353c5' }
      ]
    },
    {
      id: 'product_planning',
      name: '商品企画',
      jobs: [
        { id: 'product_planning', name: '商品企画', value: '5bed3' }
      ]
    },
    {
      id: 'marketing_strategy',
      name: 'マーケティング戦略企画',
      jobs: [
        { id: 'marketing_strategy', name: 'マーケティング戦略企画', value: 'f8431' }
      ]
    },
    {
      id: 'mass_marketing',
      name: 'マスマーケティング',
      jobs: [
        { id: 'mass_marketing', name: 'マスマーケティング', value: 'ae754' }
      ]
    },
    {
      id: 'digital_marketing',
      name: 'Web/デジタルマーケティング',
      jobs: [
        { id: 'ad_operation', name: '広告運用', value: '48cf1' },
        { id: 'crm_ma', name: 'CRM/MA', value: 'a48d5' },
        { id: 'digital_marketing_other', name: 'その他', value: 'e6872' }
      ]
    },
    {
      id: 'web_operation',
      name: 'Web/ECサイト運営',
      jobs: [
        { id: 'web_operation', name: 'Webサイト運営', value: '39429' },
        { id: 'ec_operation', name: 'ECサイト運営', value: '31629' },
        { id: 'web_operation_other', name: 'その他', value: 'f137d' }
      ]
    },
    {
      id: 'technical_marketing',
      name: 'テクニカルマーケティング',
      jobs: [
        { id: 'technical_marketing', name: 'テクニカルマーケティング', value: '38653' }
      ]
    },
    {
      id: 'branding',
      name: 'ブランディング',
      jobs: [
        { id: 'corporate_branding', name: 'コーポレートブランディング', value: 'e813d' },
        { id: 'product_branding', name: 'プロダクトブランディング', value: '149cc' },
        { id: 'branding_other', name: 'その他', value: 'beb7f' }
      ]
    },
    {
      id: 'customer_success',
      name: 'カスタマーサクセス',
      jobs: [
        { id: 'csm', name: 'カスタマーサクセスマネージャー', value: '8acd3' },
        { id: 'renewal', name: 'リニューアルマネジメント', value: 'eb19a' },
        { id: 'customer_success_other', name: 'その他', value: 'c3ee8' }
      ]
    },
    {
      id: 'customer_support',
      name: 'カスタマーサポート/コールセンター',
      jobs: [
        { id: 'outbound', name: 'アウトバウンドコールスタッフ', value: '5bde1' },
        { id: 'inbound', name: 'インバウンドコールスタッフ', value: '68be2' },
        { id: 'chat_support', name: 'チャット対応スタッフ', value: '1a90d' },
        { id: 'support_management', name: '管理/運営', value: '0fd64' },
        { id: 'faq_management', name: 'FAQ管理', value: 'f0637' },
        { id: 'customer_support_other', name: 'その他', value: '25626' }
      ]
    },
    {
      id: 'planning_other',
      name: 'その他',
      jobs: [
        { id: 'planning_other', name: 'その他', value: '5f7f1' }
      ]
    }
  ]
};