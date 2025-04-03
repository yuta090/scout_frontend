import { JobCategory } from '../types';

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
        { id: 'ma_consultant', name: 'M&Aアドバイザリー', value: '490e35' },
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
        { id: 'security_consultant', name: 'セキュリティコンサルタント', value: '549e03' },
        { id: 'network_consultant', name: 'ネットワークコンサルタント', value: 'd903b' },
        { id: 'embedded_consultant', name: '組込/制御開発コンサルタント', value: '6e7c2' },
        { id: 'it_consultant_other', name: 'その他', value: 'fea0f' }
      ]
    },
    {
      id: 'hr_consultant',
      name: '人事コンサルタント/コーチング',
      jobs: [
        { id: 'org_consultant', name: '組織系コンサルタント', value: 'defe3' },
        { id: 'labor_consultant', name: '労務系コンサルタント', value: '86771' },
        { id: 'training_consultant', name: '企業研修/コーチング', value: '10b9c' },
        { id: 'hr_consultant_other', name: 'その他', value: '349b7' }
      ]
    },
    {
      id: 'scm_consultant',
      name: '生産/物流/品質管理コンサルタント',
      jobs: [
        { id: 'scm_logistics_consultant', name: '生産/物流コンサルタント', value: '08fb7' },
        { id: 'quality_consultant', name: '品質管理コンサルタント', value: 'a5af4' },
        { id: 'scm_consultant_other', name: 'その他', value: '97b6f' }
      ]
    },
    {
      id: 'construction_consultant',
      name: '建設/不動産コンサルタント',
      jobs: [
        { id: 'construction_consultant', name: '建設コンサルタント', value: '1cea9' },
        { id: 'real_estate_consultant', name: '不動産コンサルタント', value: 'e563c' }
      ]
    },
    {
      id: 'iso_consultant',
      name: 'ISOコンサルタント/ISO審査員',
      jobs: [
        { id: 'iso_consultant', name: 'ISOコンサルタント/ISO審査員', value: '5b1ca' }
      ]
    },
    {
      id: 'development_consultant',
      name: '国際開発/開発援助コンサルタント',
      jobs: [
        { id: 'development_consultant', name: '国際開発/開発援助コンサルタント', value: '62113' }
      ]
    },
    {
      id: 'auditor',
      name: '監査人/監査補助',
      jobs: [
        { id: 'accounting_auditor', name: '会計監査', value: '7935a' },
        { id: 'accounting_trainee', name: '会計監査トレーニー', value: '38b0d' },
        { id: 'accounting_assistant', name: '会計監査アシスタント', value: '3d8e4' },
        { id: 'system_auditor', name: 'システム監査', value: '18ca4' },
        { id: 'audit_assistant', name: '監査アシスタント', value: '4100a' },
        { id: 'auditor_other', name: 'その他', value: '8b0cd' }
      ]
    },
    {
      id: 'accountant',
      name: '会計士',
      jobs: [
        { id: 'accountant', name: '会計士', value: 'ad7d0' }
      ]
    },
    {
      id: 'tax_accountant',
      name: '税理士',
      jobs: [
        { id: 'tax_accountant', name: '税理士', value: 'c9241' }
      ]
    },
    {
      id: 'lawyer',
      name: '弁護士',
      jobs: [
        { id: 'lawyer', name: '弁護士', value: '12ba8' }
      ]
    },
    {
      id: 'paralegal',
      name: 'パラリーガル',
      jobs: [
        { id: 'paralegal', name: 'パラリーガル', value: '70156' }
      ]
    },
    {
      id: 'patent_attorney',
      name: '弁理士/特許技術者',
      jobs: [
        { id: 'patent_attorney', name: '弁理士/特許技術者', value: 'f4ff6' }
      ]
    },
    {
      id: 'judicial_scrivener',
      name: '司法書士',
      jobs: [
        { id: 'judicial_scrivener', name: '司法書士', value: '4ba3d' }
      ]
    },
    {
      id: 'land_surveyor',
      name: '土地家屋調査士',
      jobs: [
        { id: 'land_surveyor', name: '土地家屋調査士', value: 'c9c1b' }
      ]
    },
    {
      id: 'administrative_scrivener',
      name: '行政書士',
      jobs: [
        { id: 'administrative_scrivener', name: '行政書士', value: '60d9b' },
        { id: 'administrative_assistant', name: '行政書士補助', value: '23d13' }
      ]
    },
    {
      id: 'social_insurance_consultant',
      name: '社会保険労務士',
      jobs: [
        { id: 'social_insurance_consultant', name: '社会保険労務士', value: 'bc29e' },
        { id: 'social_insurance_assistant', name: '社会保険労務士補助', value: '32914' }
      ]
    },
    {
      id: 'customs_broker',
      name: '通関士',
      jobs: [
        { id: 'customs_broker', name: '通関士', value: 'be5ff' }
      ]
    },
    {
      id: 'sme_consultant',
      name: '中小企業診断士',
      jobs: [
        { id: 'sme_consultant', name: '中小企業診断士', value: '216a5' }
      ]
    },
    {
      id: 'research',
      name: 'リサーチ/分析',
      jobs: [
        { id: 'market_research', name: '市場調査', value: 'b90a6' },
        { id: 'marketing_researcher', name: 'マーケティングリサーチャー', value: 'c1b1b' },
        { id: 'economist', name: 'エコノミスト', value: '67c5e' },
        { id: 'strategist', name: 'ストラテジスト', value: '2227' },
        { id: 'analyst', name: 'アナリスト', value: '84148' },
        { id: 'data_scientist', name: 'データサイエンティスト', value: 'bc13c' },
        { id: 'data_mining', name: 'データマイニング', value: 'cf84d' },
        { id: 'environmental_research', name: '環境調査/環境分析', value: '8f485' },
        { id: 'research_panel', name: 'リサーチパネル管理/運用', value: '48c2c' },
        { id: 'research_other', name: 'その他', value: '538de' }
      ]
    },
    {
      id: 'topic_expert',
      name: 'トピックエキスパート',
      jobs: [
        { id: 'industry_expert', name: '特定業界', value: '945c1' },
        { id: 'solution_expert', name: '特定商材/ソリューション領域', value: '758d8' },
        { id: 'function_expert', name: '特定機能部門', value: 'ac322' },
        { id: 'expert_other', name: 'その他', value: '64091' }
      ]
    },
    {
      id: 'consultant_other',
      name: 'その他',
      jobs: [
        { id: 'consultant_other', name: 'その他', value: 'c686b' }
      ]
    }
  ]
};