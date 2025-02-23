import { JobCategory } from '../types';

export const MEDICAL_DEVICE_CATEGORIES: JobCategory = {
  id: 'medical_device',
  name: '医療機器/理化学機器専門職',
  subcategories: [
    {
      id: 'product_rd',
      name: '製品研究開発',
      jobs: [
        { id: 'medical_device_rd', name: '医療機器研究開発', value: '87b42' },
        { id: 'scientific_rd', name: '理化学機器研究開発', value: 'be40c' },
        { id: 'medical_device_product', name: '医療機器製品/商品開発', value: 'efc9e' },
        { id: 'scientific_product', name: '理化学機器製品/商品開発', value: '950eb' }
      ]
    },
    {
      id: 'clinical_development',
      name: '臨床開発',
      jobs: [
        { id: 'clinical_pm', name: '臨床開発企画/プロジェクトマネージャー', value: 'f9a76' },
        { id: 'cra', name: 'CRA', value: 'c50e8' },
        { id: 'clinical_qc', name: 'QC', value: 'e5c7b' },
        { id: 'data_management', name: 'データマネジメント', value: '19acf' },
        { id: 'biostatistics', name: '生物統計解析', value: 'e8ea3' },
        { id: 'audit_qc', name: '監査/QC', value: 'e9ab3' },
        { id: 'medical_writer', name: 'メディカルライター', value: 'd6a6d' },
        { id: 'crc', name: 'CRC', value: 'e045d' },
        { id: 'sma', name: 'SMA', value: 'c2e1b' },
        { id: 'clinical_research', name: '臨床研究', value: '6b2e5' },
        { id: 'medical_doctor', name: 'メディカルドクター', value: '02abb' },
        { id: 'clinical_development_other', name: 'その他', value: '12d73' }
      ]
    },
    {
      id: 'pharmacovigilance',
      name: 'ファーマコビジランス/PMS',
      jobs: [
        { id: 'pms', name: 'PMS/製造販売後調査', value: '1f844' },
        { id: 'pv', name: 'PV/安全性情報担当', value: '3bc53' }
      ]
    },
    {
      id: 'scientific_production',
      name: '理化学機器生産/製造/品質',
      jobs: [
        { id: 'scientific_manufacturing', name: '製造オペレーター/ラインマネージャー', value: '835ab' },
        { id: 'scientific_technology', name: '生産技術', value: '2c0d2' },
        { id: 'scientific_improvement', name: '工程改善/IE', value: 'c24b9' },
        { id: 'scientific_qa', name: '理化学機器品質保証', value: '7cfdd' },
        { id: 'scientific_qc', name: '理化学機器品質管理', value: 'bb9a3' },
        { id: 'scientific_production_other', name: 'その他', value: '866a5' }
      ]
    },
    {
      id: 'medical_device_cmc',
      name: '医療機器CMC/製造',
      jobs: [
        { id: 'medical_device_manufacturing', name: '製造オペレーター/ラインマネージャー', value: 'd443b' },
        { id: 'medical_device_technology', name: '生産技術', value: '969c5' },
        { id: 'medical_device_improvement', name: '工程改善/IE', value: '77c1d' },
        { id: 'medical_device_qa', name: '医療機器品質保証', value: '77df4' },
        { id: 'medical_device_qc', name: '医療機器品質管理', value: '4526a' },
        { id: 'medical_device_cmc', name: 'CMC薬事', value: 'ed41d' },
        { id: 'medical_device_cmc_other', name: 'その他', value: '6e339' }
      ]
    },
    {
      id: 'technical_sales',
      name: '技術営業',
      jobs: [
        { id: 'medical_device_sales', name: '医療機器技術営業/プリセールス', value: '7c119' },
        { id: 'scientific_sales', name: '理化学機器技術営業/プリセールス', value: '0c432' }
      ]
    },
    {
      id: 'field_support',
      name: 'フィールド/サービス/サポートエンジニア',
      jobs: [
        { id: 'medical_device_service', name: '医療機器フィールド/サービスエンジニア', value: 'ab071' },
        { id: 'medical_device_specialist', name: '医療機器クリニカルスペシャリスト', value: '7761b' },
        { id: 'scientific_service', name: '理化学機器フィールド/サービスエンジニア', value: 'f3b48' },
        { id: 'field_support_other', name: 'その他', value: '86856' }
      ]
    },
    {
      id: 'regulatory',
      name: '薬事/法規対応',
      jobs: [
        { id: 'regulatory_affairs', name: '薬事/法規対応', value: 'a19a5' }
      ]
    },
    {
      id: 'medical_affairs',
      name: '学術/メディカルアフェアーズ',
      jobs: [
        { id: 'academic', name: '学術', value: 'c0b28' },
        { id: 'di_research', name: 'DI/リサーチ', value: 'a6886' },
        { id: 'msl', name: 'メディカルサイエンスリエゾン', value: '6ac04' },
        { id: 'medical_affairs', name: 'メディカルアフェアーズ', value: '0a473' },
        { id: 'medical_affairs_other', name: 'その他', value: '8ca2e' }
      ]
    },
    {
      id: 'licensing',
      name: 'ライセンシング',
      jobs: [
        { id: 'licensing', name: 'ライセンシング', value: '876fb' }
      ]
    },
    {
      id: 'medical_device_other',
      name: 'その他',
      jobs: [
        { id: 'medical_device_other', name: 'その他', value: 'a9c64' }
      ]
    }
  ]
};