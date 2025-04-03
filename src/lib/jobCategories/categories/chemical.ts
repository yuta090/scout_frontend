import { JobCategory } from '../types';

export const CHEMICAL_CATEGORIES: JobCategory = {
  id: 'chemical',
  name: '化学/素材専門職',
  subcategories: [
    {
      id: 'chemistry',
      name: '化学',
      jobs: [
        { id: 'low_molecular', name: '低分子化学/低分子素材研究', value: '770e13' },
        { id: 'high_molecular', name: '高分子化学/高分子素材研究', value: 'c27b3' },
        { id: 'inorganic', name: '無機研究', value: '3ea33' },
        { id: 'processing', name: '加工研究', value: '92c69' },
        { id: 'product_development', name: '製品開発', value: '053a2' },
        { id: 'product_analysis', name: '製品分析/解析', value: 'c21c9' },
        { id: 'product_evaluation', name: '製品評価/実験/テスト', value: 'f614a' },
        { id: 'technical_writer', name: '製品開発テクニカルライター', value: '9007f' },
        { id: 'production_technology', name: '生産技術', value: '35268' },
        { id: 'process_improvement', name: '工程改善/IE', value: '5c7c0' },
        { id: 'manufacturing', name: '製造オペレーター/ラインマネージャー', value: '65dfd' },
        { id: 'quality_assurance', name: '品質保証', value: 'afe11' },
        { id: 'quality_control', name: '品質管理', value: '75622' },
        { id: 'technical_sales', name: '技術営業/プリセールス', value: 'd2046' },
        { id: 'technical_support', name: 'テクニカルサポート', value: '1836f' },
        { id: 'chemistry_other', name: 'その他', value: '53ba5' }
      ]
    },
    {
      id: 'metal',
      name: '鉄鋼/非鉄金属/金属製品',
      jobs: [
        { id: 'metal_rd', name: '研究開発', value: '4a558' },
        { id: 'metal_product', name: '製品開発', value: 'acaca' },
        { id: 'metal_analysis', name: '製品分析/解析', value: 'e6be0' },
        { id: 'metal_evaluation', name: '製品評価/実験/テスト', value: '7efac' },
        { id: 'metal_writer', name: '製品開発テクニカルライター', value: '0cad0' },
        { id: 'metal_technology', name: '生産技術', value: 'df7c5' },
        { id: 'metal_improvement', name: '工程改善/IE', value: '1d571' },
        { id: 'metal_manufacturing', name: '製造オペレーター/ラインマネージャー', value: 'c0366' },
        { id: 'metal_qa', name: '品質保証', value: '0646a' },
        { id: 'metal_qc', name: '品質管理', value: 'b7084' },
        { id: 'metal_sales', name: '技術営業/プリセールス', value: 'a8515' },
        { id: 'metal_support', name: 'テクニカルサポート', value: '36ef4' },
        { id: 'metal_other', name: 'その他', value: '62df6' }
      ]
    }
  ]
};