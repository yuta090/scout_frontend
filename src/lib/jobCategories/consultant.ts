import { JobCategory } from './types';

export const CONSULTANT_CATEGORIES: JobCategory = {
  id: 'consultant',
  name: 'コンサル/士業/リサーチャー',
  subcategories: [
    {
      id: 'business_consultant',
      name: 'ビジネスコンサルタント',
      jobs: [
        { id: 'strategy_consultant', name: '戦略/経営コンサルタント', value: '50b04' },
        { id: 'sales_consultant', name: '営業コンサルタント', value: '79b17' },
        { id: 'marketing_consultant', name: 'マーケティングコンサルタント', value: '052ce' },
        { id: 'seo_consultant', name: 'SEO/SEMコンサルタント', value: '195a8' },
        { id: 'media_consultant', name: 'メディア/PRコンサルタント', value: '14a14' },
        { id: 'bpr_consultant', name: 'BPRコンサルタント', value: '49b0e' },
        { id: 'ma_consultant', name: 'M&Aアドバイザリー', value: '490e35' }, // 値を修正
        { id: 'ipo_consultant', name: 'IPOアドバイザリー', value: '33a77' },
        { id: 'finance_consultant', name: '財務/会計/税務コンサルタント', value: '63c73' },
        { id: 'legal_consultant', name: '法務コンサルタント', value: '43c6b' },
        { id: 'ip_consultant', name: '知財/特許/商標コンサルタント', value: 'af00f' },
        { id: 'business_consultant_other', name: 'その他', value: '86bb8' }
      ]
    },
    {
      id: 'it_consultant',
      name: 'IT/システムコンサルタント',
      jobs: [
        { id: 'system_consultant', name: 'システムコンサルタント', value: '579cb' },
        { id: 'erp_consultant', name: 'SAP/ERP導入コンサルタント', value: 'f576c' },
        { id: 'package_consultant', name: 'パッケージ導入コンサルタント', value: 'ce46d' },
        { id: 'security_consultant', name: 'セキュリティコンサルタント', value: '549e03' }, // 値を修正
        { id: 'network_consultant', name: 'ネットワークコンサルタント', value: 'd903b' },
        { id: 'embedded_consultant', name: '組込/制御開発コンサルタント', value: '6e7c2' },
        { id: 'it_consultant_other', name: 'その他', value: 'fea0f' }
      ]
    },
    // 残りのサブカテゴリは変更なし
  ]
};