import { JobCategory } from '../types';

export const REAL_ESTATE_CATEGORIES: JobCategory = {
  id: 'real_estate',
  name: '不動産専門職',
  subcategories: [
    {
      id: 'planning_development',
      name: '企画/開発',
      jobs: [
        { id: 'business_planning', name: '事業企画', value: '18d10' },
        { id: 'land_acquisition', name: '用地仕入', value: '59117' },
        { id: 'development_promotion', name: '開発推進', value: '18bb7' },
        { id: 'planning_development_other', name: 'その他', value: 'd5b44' }
      ]
    },
    {
      id: 'appraisal',
      name: '不動産鑑定/デューデリジェンス',
      jobs: [
        { id: 'real_estate_appraiser', name: '不動産鑑定', value: 'b014b' },
        { id: 'due_diligence', name: 'デューデリジェンス', value: 'ade32' }
      ]
    },
    {
      id: 'property_management',
      name: '不動産管理/運用',
      jobs: [
        { id: 'property_manager', name: 'プロパティマネージャー', value: 'ad131' },
        { id: 'facility_manager', name: 'ファシリティマネージャー', value: '83ab2' },
        { id: 'property_management_other', name: 'その他', value: 'b455c' }
      ]
    },
    {
      id: 'facility_management',
      name: '施設管理/保全',
      jobs: [
        { id: 'apartment_manager', name: 'マンション管理員', value: 'aba56' },
        { id: 'building_maintenance', name: 'ビルメンテナンス/管理員', value: '72034' },
        { id: 'facility_management_other', name: 'その他', value: '819e04' }
      ]
    },
    {
      id: 'real_estate_clerical',
      name: '宅建事務',
      jobs: [
        { id: 'real_estate_clerical', name: '宅建事務', value: '5984b' }
      ]
    },
    {
      id: 'real_estate_investment',
      name: '不動産投資',
      jobs: [
        { id: 'sourcing_acquisition', name: 'ソーシング/アクイジション', value: '9a792' },
        { id: 'asset_management', name: 'アセットマネジメント', value: '48457' },
        { id: 'disposition', name: 'ディスポジション/物件売却', value: '94b1d' },
        { id: 'real_estate_investment_other', name: 'その他', value: 'e462e' }
      ]
    },
    {
      id: 'real_estate_other',
      name: 'その他',
      jobs: [
        { id: 'real_estate_other', name: 'その他', value: 'c5c2c' }
      ]
    }
  ]
};