import { JobCategory } from '../types';

export const IT_CATEGORIES: JobCategory = {
  id: 'it',
  name: 'IT',
  subcategories: [
    {
      id: 'system_engineer',
      name: 'システムエンジニア',
      jobs: [
        { id: 'mainframe_se', name: '汎用機SE', value: '69462' },
        { id: 'web_se', name: 'web/オープンSE', value: 'e6f7f' },
        { id: 'embedded_se', name: '組み込み制御SE', value: 'eedbc' }
      ]
    },
    {
      id: 'programmer',
      name: 'プログラマー',
      jobs: [
        { id: 'mainframe_programmer', name: '汎用機プログラマー', value: 'ee3aa' },
        { id: 'web_programmer', name: 'web/オープンプログラマー', value: '4826f' },
        { id: 'embedded_programmer', name: '組み込み制御プログラマー', value: 'efaee' }
      ]
    },
    {
      id: 'project_management',
      name: 'プロジェクト管理',
      jobs: [
        { id: 'mainframe_pm', name: '汎用機プロジェクトマネージャー', value: '67638' },
        { id: 'web_pm', name: 'web/オープンプロジェクトマネージャー', value: 'b1838' },
        { id: 'embedded_pm', name: '組み込み制御プロジェクトマネージャー', value: 'a3f43' },
        { id: 'mainframe_pl', name: '汎用機プロジェクトリーダー', value: '23cbd' },
        { id: 'web_pl', name: 'web/オープンプロジェクトリーダー', value: '2d2dc' },
        { id: 'embedded_pl', name: '組み込み制御プロジェクトリーダー', value: '023a7' },
        { id: 'director', name: 'ディレクター', value: 'd3bd6' },
        { id: 'pmo', name: 'PMO', value: '731b7' }
      ]
    },
    {
      id: 'product_manager',
      name: 'プロダクトマネージャー',
      jobs: [
        { id: 'product_manager', name: 'プロダクトマネージャー', value: '491f2' }
      ]
    },
    {
      id: 'frontend_engineer',
      name: 'フロントエンドエンジニア',
      jobs: [
        { id: 'frontend_engineer', name: 'フロントエンドエンジニア', value: '3350' }
      ]
    },
    {
      id: 'server_side_engineer',
      name: 'サーバーサイドエンジニア',
      jobs: [
        { id: 'server_side_engineer', name: 'サーバーサイドエンジニア', value: 'ada93' }
      ]
    },
    {
      id: 'database_engineer',
      name: 'データベースエンジニア',
      jobs: [
        { id: 'database_engineer', name: 'データベースエンジニア', value: '20034' }
      ]
    },
    {
      id: 'network_engineer',
      name: 'ネットワークエンジニア',
      jobs: [
        { id: 'network_engineer', name: 'ネットワークエンジニア', value: '10dcd' }
      ]
    },
    {
      id: 'security_engineer',
      name: 'セキュリティエンジニア',
      jobs: [
        { id: 'security_engineer', name: 'セキュリティエンジニア', value: '70aa2' }
      ]
    },
    {
      id: 'data_engineer',
      name: 'データエンジニア',
      jobs: [
        { id: 'data_engineer', name: 'データエンジニア', value: 'c9655' }
      ]
    },
    {
      id: 'devops_engineer',
      name: 'DevOpsエンジニア',
      jobs: [
        { id: 'devops_engineer', name: 'DevOpsエンジニア', value: '86bd7' }
      ]
    },
    {
      id: 'architect',
      name: 'アーキテクト',
      jobs: [
        { id: 'architect', name: 'アーキテクト', value: '352f4' }
      ]
    },
    {
      id: 'sre',
      name: 'SRE（Site Reliability Engineer）',
      jobs: [
        { id: 'sre', name: 'SRE（Site Reliability Engineer）', value: '7b390' }
      ]
    },
    {
      id: 'qa_test',
      name: 'QA/テストエンジニア',
      jobs: [
        { id: 'qa_test', name: 'QA/テストエンジニア', value: '6f693' }
      ]
    },
    {
      id: 'maintenance',
      name: '保守/運用/サポートエンジニア',
      jobs: [
        { id: 'maintenance', name: '保守/運用/サポートエンジニア', value: 'a7d62' }
      ]
    },
    {
      id: 'package_development',
      name: 'パッケージ開発',
      jobs: [
        { id: 'package_development', name: 'パッケージ開発', value: 'fc53f' }
      ]
    },
    {
      id: 'internal_se',
      name: '社内システムエンジニア',
      jobs: [
        { id: 'internal_se', name: '社内システムエンジニア', value: '93924' }
      ]
    },
    {
      id: 'sales_engineer',
      name: 'セールスエンジニア/プリセールス',
      jobs: [
        { id: 'sales_engineer', name: 'セールスエンジニア/プリセールス', value: '4e6a1' }
      ]
    },
    {
      id: 'data_scientist',
      name: 'データサイエンティスト/データアナリスト',
      jobs: [
        { id: 'data_scientist', name: 'データサイエンティスト', value: '0d809' },
        { id: 'data_analyst', name: 'データアナリスト', value: 'bf0fc' },
        { id: 'voice_scientist', name: '領域特化データサイエンティスト(音声)', value: '50d61' },
        { id: 'cv_scientist', name: '領域特化データサイエンティスト(Computer Vision)', value: '0654e' },
        { id: 'nlp_scientist', name: '領域特化データサイエンティスト(自然言語処理)', value: '0f827' },
        { id: 'security_scientist', name: '領域特化データサイエンティスト(不正検出/安全性分析)', value: 'bdce6' },
        { id: 'search_scientist', name: '領域特化データサイエンティスト(検索エンジン)', value: '882c5' },
        { id: 'recommendation_scientist', name: '領域特化データサイエンティスト(推薦エンジン)', value: '683ac' },
        { id: 'rl_scientist', name: '領域特化データサイエンティスト(強化学習)', value: '6d69a' },
        { id: 'data_scientist_other', name: 'その他', value: 'dff25' }
      ]
    },
    {
      id: 'research',
      name: '研究開発',
      jobs: [
        { id: 'research', name: '研究開発', value: '66d84' }
      ]
    },
    {
      id: 'engineering_manager',
      name: 'エンジニアリングマネージャー/VP',
      jobs: [
        { id: 'engineering_manager', name: 'エンジニアリングマネージャー/VP', value: '8ee56' }
      ]
    },
    {
      id: 'it_other',
      name: 'その他',
      jobs: [
        { id: 'it_other', name: 'その他', value: '2fa7b' }
      ]
    }
  ]
};