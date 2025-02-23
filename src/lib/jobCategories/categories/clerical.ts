import { JobCategory } from '../types';

export const CLERICAL_CATEGORIES: JobCategory = {
  id: 'clerical',
  name: '事務/受付/秘書/翻訳',
  subcategories: [
    {
      id: 'office',
      name: '事務',
      jobs: [
        { id: 'general_office', name: '一般事務', value: '4e64b' },
        { id: 'sales_office', name: '営業事務', value: '41b68' },
        { id: 'logistics_office', name: '購買/物流事務', value: '5a276' },
        { id: 'international_office', name: '貿易事務/国際事務/英文事務', value: '85c7f' },
        { id: 'hr_office', name: '人事事務', value: '1d7c0' },
        { id: 'general_affairs_office', name: '総務事務', value: '6b745' },
        { id: 'accounting_office', name: '経理/財務事務', value: '757e03' },
        { id: 'legal_office', name: '法務事務', value: 'a3130' },
        { id: 'patent_office', name: '特許事務', value: '27c27' },
        { id: 'factory_office', name: '工場現場事務', value: '75623' },
        { id: 'office_other', name: 'その他', value: '59a15' }
      ]
    },
    {
      id: 'reception',
      name: '受付',
      jobs: [
        { id: 'reception', name: '受付', value: 'a271f' }
      ]
    },
    {
      id: 'secretary',
      name: '秘書',
      jobs: [
        { id: 'secretary', name: '秘書', value: '776f1' }
      ]
    },
    {
      id: 'interpreter',
      name: '通訳',
      jobs: [
        { id: 'interpreter', name: '通訳', value: 'ea1d8' }
      ]
    },
    {
      id: 'translator',
      name: '翻訳',
      jobs: [
        { id: 'translator', name: '翻訳', value: '0ec19' }
      ]
    }
  ]
};