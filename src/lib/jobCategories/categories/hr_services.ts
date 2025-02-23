import { JobCategory } from '../types';

export const HR_SERVICES_CATEGORIES: JobCategory = {
  id: 'hr_services',
  name: '人材サービス専門職',
  subcategories: [
    {
      id: 'career_advisor',
      name: 'キャリアアドバイザー',
      jobs: [
        { id: 'career_advisor', name: 'キャリアアドバイザー', value: '3a0e5' }
      ]
    },
    {
      id: 'recruiting_advisor',
      name: 'リクルーティングアドバイザー',
      jobs: [
        { id: 'recruiting_advisor', name: 'リクルーティングアドバイザー', value: '30298' }
      ]
    },
    {
      id: 'headhunter',
      name: 'ヘッドハンター',
      jobs: [
        { id: 'headhunter', name: 'ヘッドハンター', value: 'bb93b' }
      ]
    },
    {
      id: 'temp_coordinator',
      name: '派遣コーディネーター',
      jobs: [
        { id: 'technical_coordinator', name: '技術系', value: '5bcf3' },
        { id: 'office_coordinator', name: '事務系/非技術系', value: '1fc1f' },
        { id: 'temp_coordinator_other', name: 'その他', value: 'bf583' }
      ]
    },
    {
      id: 'bpo_management',
      name: 'BPO管理/運営',
      jobs: [
        { id: 'bpo_management', name: 'BPO管理/運営', value: 'c6d5e' }
      ]
    },
    {
      id: 'hr_services_other',
      name: 'その他',
      jobs: [
        { id: 'hr_services_other', name: 'その他', value: '6e569' }
      ]
    }
  ]
};