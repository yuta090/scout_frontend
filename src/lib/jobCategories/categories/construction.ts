import { JobCategory } from '../types';

export const CONSTRUCTION_CATEGORIES: JobCategory = {
  id: 'construction',
  name: '建築/土木/プラント専門職',
  subcategories: [
    {
      id: 'architecture_design',
      name: '建築設計/デザイン',
      jobs: [
        { id: 'design_architect', name: '意匠設計', value: 'b0829' },
        { id: 'structure_architect', name: '構造設計', value: '697e09' },
        { id: 'interior_design', name: '内装設計/インテリア', value: '93744' },
        { id: 'electrical_design', name: '電気設備設計', value: '14122' },
        { id: 'hvac_design', name: '空調設備設計', value: '5d7c9' },
        { id: 'architecture_design_other', name: 'その他', value: '7f49f' }
      ]
    },
    {
      id: 'civil_design',
      name: '土木設計',
      jobs: [
        { id: 'civil_consultant', name: '建設コンサルタント', value: '3f163' },
        { id: 'civil_structure', name: '構造設計', value: '7f6ec' },
        { id: 'civil_electrical', name: '電気設備設計', value: '519ca' },
        { id: 'civil_hvac', name: '空調設備設計', value: '7c4cc' },
        { id: 'civil_design_other', name: 'その他', value: '4818b' }
      ]
    },
    {
      id: 'plant_design',
      name: 'プラント設計/デザイン',
      jobs: [
        { id: 'plant_design', name: '意匠設計', value: '7e447' },
        { id: 'plant_structure', name: '構造設計', value: '2b359' },
        { id: 'plant_process', name: 'プロセス設計', value: '6ba98' },
        { id: 'plant_mechanical', name: '機械設備設計', value: '20f6c' },
        { id: 'plant_electrical', name: '電気設備設計', value: '712e10' },
        { id: 'plant_system', name: 'システム設備設計', value: 'd3ea8' },
        { id: 'plant_piping', name: '配管設計', value: 'af1b3' },
        { id: 'plant_design_other', name: 'その他', value: 'cc125' }
      ]
    },
    {
      id: 'construction_management',
      name: '施工管理/現場責任者',
      jobs: [
        { id: 'building_management', name: '建築施工管理', value: '56aed' },
        { id: 'civil_management', name: '土木施工管理', value: '78765' },
        { id: 'plant_management', name: 'プラント施工管理', value: '5d330' },
        { id: 'plumbing_management', name: '管工事施工管理', value: '9576b' },
        { id: 'electrical_management', name: '電気施工管理', value: '947d2' },
        { id: 'hvac_management', name: '空調設備施工管理', value: '0f9dc' },
        { id: 'construction_management_other', name: 'その他', value: 'd0b87' }
      ]
    },
    {
      id: 'cad',
      name: '製図/CADオペレーター',
      jobs: [
        { id: 'architecture_cad', name: '建築', value: 'de7d6' },
        { id: 'civil_cad', name: '土木', value: 'eb101' },
        { id: 'plant_cad', name: 'プラント', value: '99742' }
      ]
    },
    {
      id: 'bim_cim',
      name: 'BIM/CIMエンジニア',
      jobs: [
        { id: 'architecture_bim', name: '建築', value: 'e1240' },
        { id: 'civil_bim', name: '土木', value: '08aac' },
        { id: 'plant_bim', name: 'プラント', value: 'cf245' }
      ]
    },
    {
      id: 'cm',
      name: 'CM/コンストラクションマネジメント',
      jobs: [
        { id: 'cm', name: 'CM/コンストラクションマネジメント', value: '1c1f3' }
      ]
    },
    {
      id: 'craftsman',
      name: '職人/現場作業員',
      jobs: [
        { id: 'craftsman', name: '職人/現場作業員', value: '750ad' }
      ]
    },
    {
      id: 'design_supervision',
      name: '設計/施工監理',
      jobs: [
        { id: 'design_supervision', name: '設計/施工監理', value: 'e8108' }
      ]
    },
    {
      id: 'safety_management',
      name: '安全管理/環境保全',
      jobs: [
        { id: 'safety_management', name: '安全管理/環境保全', value: '1a512' }
      ]
    },
    {
      id: 'maintenance',
      name: '設備メンテナンス',
      jobs: [
        { id: 'architecture_maintenance', name: '建築', value: '4198' },
        { id: 'civil_maintenance', name: '土木', value: '7d41e' },
        { id: 'plant_maintenance', name: 'プラント', value: 'd3267' }
      ]
    },
    {
      id: 'survey',
      name: '測量/地質調査',
      jobs: [
        { id: 'architecture_survey', name: '建築', value: '697b6' },
        { id: 'civil_survey', name: '土木', value: '0ef92' },
        { id: 'plant_survey', name: 'プラント', value: '98982' }
      ]
    },
    {
      id: 'quantity_survey',
      name: '積算',
      jobs: [
        { id: 'architecture_qs', name: '建築', value: '23659' },
        { id: 'civil_qs', name: '土木', value: 'c7c0c' },
        { id: 'plant_qs', name: 'プラント', value: 'bfba3' }
      ]
    },
    {
      id: 'technical_development',
      name: '技術開発/工法開発',
      jobs: [
        { id: 'architecture_development', name: '建築', value: 'b6450' },
        { id: 'civil_development', name: '土木', value: '4bbef' },
        { id: 'plant_development', name: 'プラント', value: '7cb0a' }
      ]
    },
    {
      id: 'product_development',
      name: '建築製品開発/製造',
      jobs: [
        { id: 'research_development', name: '研究開発', value: 'd8937' },
        { id: 'product_development', name: '製品開発', value: '64810' },
        { id: 'production_technology', name: '生産技術', value: '574ec' },
        { id: 'manufacturing', name: '製造オペレーター/ラインマネージャー', value: 'ad296' },
        { id: 'quality_assurance', name: '品質保証', value: '3856e' },
        { id: 'quality_control', name: '品質管理', value: '0c3fe' },
        { id: 'product_development_other', name: 'その他', value: '831c5' }
      ]
    },
    {
      id: 'after_service',
      name: 'アフターサービス/フィールドエンジニア',
      jobs: [
        { id: 'architecture_service', name: '建築', value: '314c3' },
        { id: 'civil_service', name: '土木', value: '6eccf' },
        { id: 'plant_service', name: 'プラント', value: '01a5e' }
      ]
    },
    {
      id: 'construction_other',
      name: 'その他',
      jobs: [
        { id: 'construction_other', name: 'その他', value: '8ddb4' }
      ]
    }
  ]
};