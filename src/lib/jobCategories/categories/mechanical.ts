import { JobCategory } from '../types';

export const MECHANICAL_CATEGORIES: JobCategory = {
  id: 'mechanical',
  name: '機械/電気/電子製品専門職',
  subcategories: [
    {
      id: 'research_development',
      name: '研究開発',
      jobs: [
        { id: 'automotive_rd', name: '自動車/輸送機器', value: '15a06' },
        { id: 'mechanical_rd', name: '機械', value: '7355a' },
        { id: 'electrical_rd', name: '電気/電子', value: '931be' },
        { id: 'semiconductor_rd', name: '半導体', value: 'ba362' },
        { id: 'embedded_rd', name: '組込/制御', value: '680e99' },
        { id: 'research_development_other', name: 'その他', value: '540e21' }
      ]
    },
    {
      id: 'product_development',
      name: '製品開発',
      jobs: [
        { id: 'mechanical_design', name: '機構設計', value: '37697' },
        { id: 'housing_design', name: '筐体設計', value: 'd4029' },
        { id: 'mold_design', name: '金型設計', value: '329b0' },
        { id: 'optical_design', name: '光学設計', value: 'cf5b4' },
        { id: 'circuit_design', name: '回路設計', value: 'e9279' },
        { id: 'device_design', name: '電気/電子デバイス設計', value: '5ada2' },
        { id: 'process_design', name: '電気/電子プロセス設計', value: '2099a' },
        { id: 'layout_design', name: 'レイアウト設計/配線設計', value: 'd0f78' },
        { id: 'semiconductor_device', name: '半導体デバイス設計', value: '70fee' },
        { id: 'semiconductor_process', name: '半導体プロセス設計', value: 'd643f' },
        { id: 'cae', name: 'CAE解析', value: '6c00f' },
        { id: 'product_ui', name: 'プロダクトデザイナー/UIデザイナー', value: 'c7fe4' },
        { id: 'cad_operator', name: '製図/CADオペレーター', value: '859b4' },
        { id: 'evaluation', name: '評価/実験/テスト', value: '7d27e' },
        { id: 'technical_writer', name: 'テクニカルライター', value: 'a3488' },
        { id: 'product_development_other', name: 'その他', value: '1123' }
      ]
    },
    {
      id: 'production_technology',
      name: '生産技術',
      jobs: [
        { id: 'automotive_production', name: '自動車/輸送機器', value: '76e8f' },
        { id: 'mechanical_production', name: '機械', value: 'e3bca' },
        { id: 'electrical_production', name: '電気/電子', value: '97a49' },
        { id: 'semiconductor_production', name: '半導体', value: 'e07b0' },
        { id: 'production_technology_other', name: 'その他', value: '058d0' }
      ]
    },
    {
      id: 'process_improvement',
      name: '工程改善/IE',
      jobs: [
        { id: 'process_improvement', name: '工程改善/IE', value: 'e24de' }
      ]
    },
    {
      id: 'quality_assurance',
      name: '品質保証',
      jobs: [
        { id: 'automotive_qa', name: '自動車/輸送機器', value: '976de' },
        { id: 'mechanical_qa', name: '機械', value: 'b8766' },
        { id: 'electrical_qa', name: '電気/電子', value: 'da7fb' },
        { id: 'semiconductor_qa', name: '半導体', value: 'd88e3' },
        { id: 'quality_assurance_other', name: 'その他', value: '9f080' }
      ]
    },
    {
      id: 'quality_control',
      name: '品質管理',
      jobs: [
        { id: 'automotive_qc', name: '自動車/輸送機器', value: '0c5c4' },
        { id: 'mechanical_qc', name: '機械', value: '380de' },
        { id: 'electrical_qc', name: '電気/電子', value: 'a0bf2' },
        { id: 'semiconductor_qc', name: '半導体', value: 'd4094' },
        { id: 'quality_control_other', name: 'その他', value: '4ca1c' }
      ]
    },
    {
      id: 'technical_sales',
      name: '技術営業',
      jobs: [
        { id: 'automotive_sales', name: '自動車/輸送機器', value: '0a376' },
        { id: 'mechanical_sales', name: '機械', value: 'b8cca' },
        { id: 'electrical_sales', name: '電気/電子', value: '34520' },
        { id: 'semiconductor_sales', name: '半導体', value: '7c633' },
        { id: 'technical_sales_other', name: 'その他', value: '2ae7c' }
      ]
    },
    {
      id: 'field_support',
      name: 'フィールド/サポートエンジニア',
      jobs: [
        { id: 'automotive_support', name: '自動車/輸送機器', value: 'a7df7' },
        { id: 'mechanical_support', name: '機械', value: '4bc7c' },
        { id: 'electrical_support', name: '電気/電子', value: '851b3' },
        { id: 'semiconductor_support', name: '半導体', value: 'e5dd5' },
        { id: 'field_support_other', name: 'その他', value: 'ddf73' }
      ]
    },
    {
      id: 'maintenance',
      name: '設備保全/メンテナンス',
      jobs: [
        { id: 'maintenance', name: '設備保全/メンテナンス', value: '62939' }
      ]
    },
    {
      id: 'embedded_control',
      name: '組込/制御設計/開発',
      jobs: [
        { id: 'plc', name: 'PLC/ラダー/シーケンス制御', value: 'd0155' },
        { id: 'application', name: 'アプリケーション', value: 'c0e57' },
        { id: 'middleware', name: 'ミドルウェア', value: 'e6273' },
        { id: 'device_driver', name: 'デバイスドライバー/ファームウェア', value: '059b2' },
        { id: 'image_processing', name: '画像処理', value: 'c0697' },
        { id: 'embedded_control_other', name: 'その他', value: '0a800' }
      ]
    },
    {
      id: 'manufacturing',
      name: '製造オペレーター/ラインマネージャー',
      jobs: [
        { id: 'automotive_operator', name: '自動車/輸送機器', value: '3ed24' },
        { id: 'mechanical_operator', name: '機械', value: 'db602' },
        { id: 'electrical_operator', name: '電気/電子', value: '6adfb' },
        { id: 'semiconductor_operator', name: '半導体', value: '2e6ab' },
        { id: 'manufacturing_other', name: 'その他', value: 'ec171' }
      ]
    },
    {
      id: 'mechanical_other',
      name: 'その他',
      jobs: [
        { id: 'mechanical_other', name: 'その他', value: 'dd14d' }
      ]
    }
  ]
};