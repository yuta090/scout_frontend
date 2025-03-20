import { JobCategory } from '../types';

export const FOOD_INDUSTRY_CATEGORIES: JobCategory = {
  id: 'food_industry',
  name: '食品/香料/飼料専門職',
  subcategories: [
    {
      id: 'food_beverage',
      name: '食品/飲料/たばこ',
      jobs: [
        { id: 'food_rd', name: '研究開発', value: '5bd8d' },
        { id: 'food_product', name: '製品開発', value: '67ad9' },
        { id: 'food_analysis', name: '製品分析/解析', value: '274ed' },
        { id: 'food_evaluation', name: '製品評価/実験/テスト', value: 'df0c2' },
        { id: 'food_writer', name: '製品開発テクニカルライター', value: 'cc917' },
        { id: 'food_qa', name: '品質保証', value: '37aff' },
        { id: 'food_qc', name: '品質管理', value: 'aead1' },
        { id: 'food_manufacturing', name: '製造オペレーター/ラインマネージャー', value: 'ec037' },
        { id: 'food_technology', name: '生産技術', value: '246e06' },
        { id: 'food_improvement', name: '工程改善/IE', value: '9413e' },
        { id: 'food_sales', name: '技術営業/プリセールス', value: '19fa0' },
        { id: 'food_support', name: 'テクニカルサポート', value: 'b6ef2' },
        { id: 'food_other', name: 'その他', value: '7bec2' }
      ]
    },
    {
      id: 'flavor',
      name: '香料',
      jobs: [
        { id: 'flavor_rd', name: '研究開発', value: 'bc367' },
        { id: 'flavor_product', name: '製品開発', value: '985b2' },
        { id: 'flavor_analysis', name: '製品分析/解析', value: 'e3896' },
        { id: 'flavor_evaluation', name: '製品評価/実験/テスト', value: '6e4b0' },
        { id: 'flavor_writer', name: '製品開発テクニカルライター', value: '98390' },
        { id: 'flavor_qa', name: '品質保証', value: '34302' },
        { id: 'flavor_qc', name: '品質管理', value: '22d62' },
        { id: 'flavor_manufacturing', name: '製造オペレーター/ラインマネージャー', value: '92fcf' },
        { id: 'flavor_technology', name: '生産技術', value: '5d904' },
        { id: 'flavor_improvement', name: '工程改善/IE', value: '7f21f' },
        { id: 'flavor_sales', name: '技術営業/プリセールス', value: 'cf016' },
        { id: 'flavor_support', name: 'テクニカルサポート', value: '622c1' },
        { id: 'flavor_other', name: 'その他', value: '28761' }
      ]
    },
    {
      id: 'feed',
      name: '飼料',
      jobs: [
        { id: 'feed_rd', name: '研究開発', value: '2217a' },
        { id: 'feed_product', name: '製品開発', value: '65025' },
        { id: 'feed_analysis', name: '製品分析/解析', value: '74616' },
        { id: 'feed_evaluation', name: '製品評価/実験/テスト', value: '7daeb' },
        { id: 'feed_writer', name: '製品開発テクニカルライター', value: '999cd' },
        { id: 'feed_qa', name: '品質保証', value: 'e263a' },
        { id: 'feed_qc', name: '品質管理', value: '5d67a' },
        { id: 'feed_manufacturing', name: '製造オペレーター/ラインマネージャー', value: '84b7a' },
        { id: 'feed_technology', name: '生産技術', value: '693a3' },
        { id: 'feed_improvement', name: '工程改善/IE', value: '8ac69' },
        { id: 'feed_sales', name: '技術営業/プリセールス', value: '1f0be' },
        { id: 'feed_support', name: 'テクニカルサポート', value: '6a5d6' },
        { id: 'feed_other', name: 'その他', value: '810c8' }
      ]
    }
  ]
};