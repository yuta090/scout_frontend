import { JobCategory } from '../types';

export const EXECUTIVE_CATEGORIES: JobCategory = {
  id: 'executive',
  name: 'エグゼクティブ',
  subcategories: [
    {
      id: 'ceo',
      name: 'CEO/社長/代表取締役/代表理事',
      jobs: [
        { id: 'ceo', name: 'CEO/社長/代表取締役/代表理事', value: '15602' }
      ]
    },
    {
      id: 'representative_member',
      name: '代表社員',
      jobs: [
        { id: 'representative_member', name: '代表社員', value: '24925' }
      ]
    },
    {
      id: 'strategy_officer',
      name: '全社単位戦略/特定テーマ責任者',
      jobs: [
        { id: 'coo', name: '執行責任者/COO/Chief Operation Officer', value: '79041' },
        { id: 'cbo', name: 'ビジネス責任者/CBO/Chief Business Officer', value: 'fd00e' },
        { id: 'cso', name: '戦略責任者/CSO/Chief Strategy Officer', value: '26c23' },
        { id: 'cpo', name: '計画責任者/CPOChief Project Officer', value: 'b3743' },
        { id: 'cdo_data', name: 'データ責任者/CDO/Chief Data Officer', value: '6f16d' },
        { id: 'cdo_digital', name: 'デジタル責任者/CDO/Chief Digital Officer', value: 'f8488' },
        { id: 'strategy_other', name: 'その他', value: 'aef14' }
      ]
    },
    {
      id: 'business_officer',
      name: 'ビジネス機能別責任者',
      jobs: [
        { id: 'cpo_product', name: 'プロダクト責任者/CPO/Chief Product Officer', value: '5b29d' },
        { id: 'cto', name: '技術責任者/CTO/Chief Technology Officer', value: '3290c' },
        { id: 'cio_innovation', name: 'イノベーション責任者/CIO/Chief Innovation Officer', value: 'f4f37' },
        { id: 'cmo_marketing', name: 'マーケティング責任者/CMO/Chief Marketing Officer', value: '95c6c' },
        { id: 'cbo_branding', name: 'ブランディング責任者/CBO/Chief Branding Officer', value: 'd3dcf' },
        { id: 'cco_creative', name: 'クリエイティブ責任者/CCO/Chief Creative Officer', value: '5727f' },
        { id: 'cdo_design', name: 'デザイン責任者/CDO/Chief Design Officer', value: '3ac4b' },
        { id: 'cceo', name: '顧客体験責任者/CCEO/Chief Customer Experience Officer', value: 'd8322' },
        { id: 'scm_officer', name: 'サプライチェーン責任者', value: '67c31' },
        { id: 'clo_logistics', name: '物流責任者/CLO/Chief Logistics Officer', value: 'eb770' },
        { id: 'cqo', name: '品質管理責任者/CQO/Chief Quality Officer', value: 'a2dab' },
        { id: 'cro_revenue', name: '売上責任者/CRO/Chief Revenue Officer', value: '45e3d' },
        { id: 'cso_sales', name: '販売/営業部門責任者/CSO/Chief Sales Officer', value: '2a70f' },
        { id: 'cio_investment', name: '投資責任者/CIO/Chief Investment Officer', value: '1a643' },
        { id: 'cmo_medical', name: '医務責任者/CMO/Chief Medical Officer', value: 'e3dcb' },
        { id: 'business_other', name: 'その他', value: 'f8994' }
      ]
    },
    {
      id: 'corporate_officer',
      name: 'コーポレート機能別責任者',
      jobs: [
        { id: 'chro', name: '人事責任者/CHRO', value: '95a74' },
        { id: 'cao', name: '総務責任者/CAO/Chief Administrative Officer', value: 'dfa44' },
        { id: 'cio_information', name: '情報責任者/CIO/Chief Information Officer', value: '91732' },
        { id: 'cpo_privacy', name: '個人情報保護責任者/CPO/Chief Privacy Officer', value: 'd1f08' },
        { id: 'cso_security', name: '情報セキュリティ責任者/CSO/Chief Security Officer', value: '64a73' },
        { id: 'cco_communication', name: 'コミュニケーション責任者/CCO/Chief Communication Officer', value: 'db9f7' },
        { id: 'cfo', name: '財務責任者/CFO/Chief Financial Officer', value: 'a126e' },
        { id: 'clo_legal', name: '法務責任者/CLO,CJO/Chief Legal Officer, Chief Judicial Officer', value: '0e98e' },
        { id: 'cro_risk', name: 'リスク管理責任者/CRO/Chief Risk Officer', value: 'bec44' },
        { id: 'corporate_other', name: 'その他', value: '912cb' }
      ]
    },
    {
      id: 'business_unit_head',
      name: '事業別責任者',
      jobs: [
        { id: 'business_unit_head', name: '事業別責任者', value: 'd061a' }
      ]
    },
    {
      id: 'regional_head',
      name: '地域別責任者/支社長',
      jobs: [
        { id: 'regional_head', name: '地域別責任者/支社長', value: '26a84' }
      ]
    },
    {
      id: 'executive_other',
      name: 'その他',
      jobs: [
        { id: 'executive_other', name: 'その他', value: '582ba' }
      ]
    }
  ]
};