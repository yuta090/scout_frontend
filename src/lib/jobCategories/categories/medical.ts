import { JobCategory } from '../types';

export const MEDICAL_CATEGORIES: JobCategory = {
  id: 'medical',
  name: '医薬品専門職',
  subcategories: [
    {
      id: 'research',
      name: '研究',
      jobs: [
        { id: 'drug_discovery', name: '創薬研究', value: '5f71b' },
        { id: 'preclinical', name: '前臨床研究', value: 'd9498' },
        { id: 'research_other', name: 'その他', value: '9ee64' }
      ]
    },
    {
      id: 'clinical_development',
      name: '臨床開発',
      jobs: [
        { id: 'clinical_pm', name: '臨床開発企画/プロジェクトマネージャー', value: 'f7aac' },
        { id: 'cra', name: 'CRA', value: '55828' },
        { id: 'clinical_qc', name: 'QC', value: '1da62' },
        { id: 'data_management', name: 'データマネジメント', value: '2240b' },
        { id: 'biostatistics', name: '生物統計解析', value: '31d1f' },
        { id: 'audit_qa', name: '監査/QA', value: 'f357b' },
        { id: 'medical_writer', name: 'メディカルライター', value: '70c8a' },
        { id: 'crc', name: 'CRC', value: '77c46' },
        { id: 'sma', name: 'SMA', value: '16703' },
        { id: 'clinical_research', name: '臨床研究', value: '32674' },
        { id: 'medical_doctor', name: 'メディカルドクター', value: '41232' },
        { id: 'clinical_development_other', name: 'その他', value: 'd09d7' }
      ]
    },
    {
      id: 'pharmacovigilance',
      name: 'ファーマコビジランス/PMS',
      jobs: [
        { id: 'pms', name: 'PMS/製造販売後調査', value: '218e06' },
        { id: 'pv', name: 'PV/安全性情報担当', value: '8e2af' }
      ]
    },
    {
      id: 'cmc',
      name: 'CMC/製造',
      jobs: [
        { id: 'formulation', name: '製剤技術研究', value: '65a0e' },
        { id: 'manufacturing', name: '製造オペレーター/ラインマネージャー', value: '36166' },
        { id: 'production_technology', name: '生産技術', value: 'f2b96' },
        { id: 'process_improvement', name: '工程改善/IE', value: '2c0a4' },
        { id: 'quality_assurance', name: '品質保証', value: '3618e' },
        { id: 'quality_control', name: '品質管理', value: 'e32ea' },
        { id: 'cmc_regulatory', name: 'CMC薬事', value: '28808' },
        { id: 'cmc_other', name: 'その他', value: '1e716' }
      ]
    },
    {
      id: 'regulatory',
      name: '薬事/薬価戦略',
      jobs: [
        { id: 'regulatory_affairs', name: '薬事/法規対応', value: 'f8e80' },
        { id: 'market_access', name: 'マーケットアクセス/薬価戦略', value: 'c4ee2' },
        { id: 'regulatory_other', name: 'その他', value: '1def0' }
      ]
    },
    {
      id: 'medical_affairs',
      name: '学術/メディカルアフェアーズ',
      jobs: [
        { id: 'academic', name: '学術', value: '6bc54' },
        { id: 'di_research', name: 'DI/リサーチ', value: 'c73f5' },
        { id: 'msl', name: 'メディカルサイエンスリエゾン', value: '0ddfe' },
        { id: 'medical_affairs', name: 'メディカルアフェアーズ', value: '6c681' },
        { id: 'medical_affairs_other', name: 'その他', value: '354f4' }
      ]
    },
    {
      id: 'licensing',
      name: 'ライセンシング',
      jobs: [
        { id: 'licensing', name: 'ライセンシング', value: 'adcbc' }
      ]
    },
    {
      id: 'medical_other',
      name: 'その他',
      jobs: [
        { id: 'medical_other', name: 'その他', value: '1153c' }
      ]
    }
  ]
};