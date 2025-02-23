import { JobCategory } from '../types';

export const SCM_CATEGORIES: JobCategory = {
  id: 'scm',
  name: 'SCM/生産管理/購買/物流',
  subcategories: [
    {
      id: 'production_planning',
      name: '生産企画',
      jobs: [
        { id: 'demand_forecast', name: '需要予測', value: '75146' },
        { id: 'production_planning', name: '生産計画策定', value: 'e085a' },
        { id: 'production_management', name: '生産管理', value: 'e7323' },
        { id: 'production_planning_other', name: 'その他', value: '75f90' }
      ]
    },
    {
      id: 'procurement',
      name: '購買/調達',
      jobs: [
        { id: 'procurement_planning', name: '購買企画', value: 'd2bcf' },
        { id: 'raw_materials', name: '原材料購買', value: '46289' },
        { id: 'parts', name: '部品購買', value: '2fef6' },
        { id: 'indirect', name: 'サービス/間接材購買', value: '98c97' },
        { id: 'equipment', name: '設備購買', value: 'd9477' },
        { id: 'real_estate', name: '土地/建屋購買', value: '98b73' },
        { id: 'supplier_development', name: '新規サプライヤー開拓', value: '8947e' },
        { id: 'procurement_other', name: 'その他', value: 'bbd8f' }
      ]
    },
    {
      id: 'logistics',
      name: '物流',
      jobs: [
        { id: 'logistics_planning', name: '物流企画/管理', value: 'f4788' },
        { id: 'warehouse', name: '倉庫管理', value: '16422' },
        { id: 'delivery', name: '輸配送', value: '403cb' },
        { id: 'logistics_other', name: 'その他', value: '394e08' }
      ]
    },
    {
      id: 'trade',
      name: '貿易',
      jobs: [
        { id: 'trade', name: '貿易', value: '7c60d' }
      ]
    },
    {
      id: 'scm_other',
      name: 'その他',
      jobs: [
        { id: 'scm_other', name: 'その他', value: '34b6b' }
      ]
    }
  ]
};