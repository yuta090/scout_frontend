import { JobCategory } from '../types';

export const INFRASTRUCTURE_CATEGORIES: JobCategory = {
  id: 'infrastructure',
  name: 'インフラ専門職',
  subcategories: [
    {
      id: 'infrastructure_planning',
      name: 'インフラ計画',
      jobs: [
        { id: 'electrical_planning', name: '電気', value: 'ad86a' },
        { id: 'communication_planning', name: '通信', value: 'eef62' }
      ]
    },
    {
      id: 'infrastructure_design',
      name: '設計',
      jobs: [
        { id: 'power_design', name: '発送受変電設備', value: '79efa' },
        { id: 'wired_design', name: '有線系通信インフラ', value: '035c5' },
        { id: 'wireless_design', name: '無線系通信インフラ', value: 'e20f1' },
        { id: 'infrastructure_design_other', name: 'その他', value: 'e2793' }
      ]
    },
    {
      id: 'installation_maintenance',
      name: '設置/保守',
      jobs: [
        { id: 'power_plant', name: '発電設備', value: '81a64' },
        { id: 'power_distribution', name: '配電工事', value: '158eb' },
        { id: 'power_transmission', name: '送電工事', value: 'fa65f' },
        { id: 'substation', name: '受変電設備工事', value: '324de' },
        { id: 'communication_infrastructure', name: '通信インフラ', value: 'db02k' },
        { id: 'installation_maintenance_other', name: 'その他', value: '5f048' }
      ]
    },
    {
      id: 'infrastructure_other',
      name: 'その他',
      jobs: [
        { id: 'infrastructure_other', name: 'その他', value: 'ccd7f' }
      ]
    }
  ]
};