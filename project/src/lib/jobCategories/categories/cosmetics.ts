import { JobCategory } from '../types';

export const COSMETICS_CATEGORIES: JobCategory = {
  id: 'cosmetics',
  name: '化粧品/トイレタリー/日用品/アパレル専門職',
  subcategories: [
    {
      id: 'cosmetics',
      name: '化粧品',
      jobs: [
        { id: 'cosmetics_rd', name: '研究開発', value: '201d9' },
        { id: 'cosmetics_product', name: '製品開発', value: '08e4e' },
        { id: 'cosmetics_analysis', name: '製品分析/解析', value: 'a9379' },
        { id: 'cosmetics_evaluation', name: '製品評価/実験/テスト', value: 'b17cf' },
        { id: 'cosmetics_writer', name: '製品開発テクニカルライター', value: 'c8882' },
        { id: 'cosmetics_technology', name: '生産技術', value: 'b692e' },
        { id: 'cosmetics_improvement', name: '工程改善/IE', value: '6617' },
        { id: 'cosmetics_manufacturing', name: '製造オペレーター/ラインマネージャー', value: 'f2099' },
        { id: 'cosmetics_qa', name: '品質保証', value: '7f4bf' },
        { id: 'cosmetics_qc', name: '品質管理', value: 'aead4' },
        { id: 'cosmetics_sales', name: '技術営業/プリセールス', value: '470d4' },
        { id: 'cosmetics_support', name: 'テクニカルサポート', value: 'aca51' },
        { id: 'cosmetics_other', name: 'その他', value: '97ae6' }
      ]
    },
    {
      id: 'toiletries',
      name: 'トイレタリー',
      jobs: [
        { id: 'toiletries_rd', name: '研究開発', value: 'f1bb9' },
        { id: 'toiletries_product', name: '製品開発', value: 'e33f0' },
        { id: 'toiletries_analysis', name: '製品分析/解析', value: 'a36dd' },
        { id: 'toiletries_evaluation', name: '製品評価/実験/テスト', value: '4b946' },
        { id: 'toiletries_writer', name: '製品開発テクニカルライター', value: '05d13' },
        { id: 'toiletries_technology', name: '生産技術', value: 'd7246' },
        { id: 'toiletries_improvement', name: '工程改善/IE', value: '5a97d' },
        { id: 'toiletries_manufacturing', name: '製造オペレーター/ラインマネージャー', value: '34287' },
        { id: 'toiletries_qa', name: '品質保証', value: 'a563e' },
        { id: 'toiletries_qc', name: '品質管理', value: 'b2528' },
        { id: 'toiletries_sales', name: '技術営業/プリセールス', value: 'd7508' },
        { id: 'toiletries_support', name: 'テクニカルサポート', value: 'eb7ed' },
        { id: 'toiletries_other', name: 'その他', value: '553b5' }
      ]
    },
    {
      id: 'daily_goods',
      name: '日用品/雑貨/インテリア',
      jobs: [
        { id: 'daily_goods_rd', name: '研究開発', value: '77267' },
        { id: 'daily_goods_product', name: '製品開発', value: '709a6' },
        { id: 'daily_goods_analysis', name: '製品分析/解析', value: '9ae50' },
        { id: 'daily_goods_evaluation', name: '製品評価/実験/テスト', value: '32d63' },
        { id: 'daily_goods_writer', name: '製品開発テクニカルライター', value: '817dc' },
        { id: 'daily_goods_technology', name: '生産技術', value: 'dac4e' },
        { id: 'daily_goods_improvement', name: '工程改善/IE', value: '88b21' },
        { id: 'daily_goods_manufacturing', name: '製造オペレーター/ラインマネージャー', value: 'c33b9' },
        { id: 'daily_goods_qa', name: '品質保証', value: '6a2d1' },
        { id: 'daily_goods_qc', name: '品質管理', value: '0f13c' },
        { id: 'daily_goods_sales', name: '技術営業/プリセールス', value: '470d4' },
        { id: 'daily_goods_support', name: 'テクニカルサポート', value: '8b6ee' },
        { id: 'daily_goods_other', name: 'その他', value: '7dd3a' }
      ]
    },
    {
      id: 'apparel',
      name: 'アパレル/繊維製品',
      jobs: [
        { id: 'apparel_rd', name: '研究開発', value: '7c0c2' },
        { id: 'apparel_product', name: '製品開発', value: '7c998' },
        { id: 'apparel_analysis', name: '製品分析/解析', value: '14c7d' },
        { id: 'apparel_evaluation', name: '製品評価/実験/テスト', value: 'd708d' },
        { id: 'apparel_writer', name: '製品開発テクニカルライター', value: '21772' },
        { id: 'apparel_technology', name: '生産技術', value: '2bae3' },
        { id: 'apparel_improvement', name: '工程改善/IE', value: '7b374' },
        { id: 'apparel_manufacturing', name: '製造オペレーター/ラインマネージャー', value: '577cc' },
        { id: 'apparel_qa', name: '品質保証', value: 'fab56' },
        { id: 'apparel_qc', name: '品質管理', value: '2a25d' },
        { id: 'apparel_support', name: 'テクニカルサポート', value: '92d9a' },
        { id: 'apparel_other', name: 'その他', value: 'b0c43' }
      ]
    }
  ]
};