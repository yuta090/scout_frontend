import { JobCategory } from '../types';

export const RETAIL_CATEGORIES: JobCategory = {
  id: 'retail',
  name: '小売販売/流通',
  subcategories: [
    {
      id: 'sales_staff',
      name: '販売/フロアスタッフ',
      jobs: [
        { id: 'convenience_store_staff', name: 'コンビニ', value: 'ae322' },
        { id: 'electronics_staff', name: '家電', value: '5fe82' },
        { id: 'mobile_shop_staff', name: '携帯ショップ', value: 'e67ec' },
        { id: 'pharmacy_staff', name: '薬局/ドラッグストア', value: '967f7' },
        { id: 'cosmetics_staff', name: '化粧品', value: '34958' },
        { id: 'supermarket_staff', name: 'スーパー/ホームセンター', value: '3ccf4' },
        { id: 'apparel_staff', name: 'アパレル/アクセサリー/インテリア', value: 'd8b51' },
        { id: 'sales_staff_other', name: 'その他', value: '28ac8' }
      ]
    },
    {
      id: 'store_manager',
      name: '店長/支配人',
      jobs: [
        { id: 'convenience_store_manager', name: 'コンビニ', value: '538a7' },
        { id: 'electronics_manager', name: '家電', value: '82af5' },
        { id: 'mobile_shop_manager', name: '携帯ショップ', value: '55372' },
        { id: 'pharmacy_manager', name: '薬局/ドラッグストア', value: '19bdc' },
        { id: 'cosmetics_manager', name: '化粧品', value: '80b5c' },
        { id: 'supermarket_manager', name: 'スーパー/ホームセンター', value: 'ae8b2' },
        { id: 'apparel_manager', name: 'アパレル/アクセサリー/インテリア', value: 'ae014' },
        { id: 'store_manager_other', name: 'その他', value: 'a37aa' }
      ]
    },
    {
      id: 'area_manager',
      name: 'エリアマネージャー',
      jobs: [
        { id: 'convenience_store_area', name: 'コンビニ', value: '17f24' },
        { id: 'electronics_area', name: '家電', value: '572d9' },
        { id: 'mobile_shop_area', name: '携帯ショップ', value: '60811' },
        { id: 'pharmacy_area', name: '薬局/ドラッグストア', value: 'd5e31' },
        { id: 'cosmetics_area', name: '化粧品', value: 'dba11' },
        { id: 'supermarket_area', name: 'スーパー/ホームセンター', value: '800e269' },
        { id: 'apparel_area', name: 'アパレル/アクセサリー/インテリア', value: 'dee12' },
        { id: 'area_manager_other', name: 'その他', value: '3af34' }
      ]
    },
    {
      id: 'merchandising',
      name: '仕入/流通',
      jobs: [
        { id: 'md', name: 'MD', value: 'a0947' },
        { id: 'buyer', name: '仕入/バイヤー', value: 'd0ccc' },
        { id: 'appraiser', name: '買取査定', value: 'be1f3' },
        { id: 'merchandising_other', name: 'その他', value: '63496' }
      ]
    },
    {
      id: 'store_development',
      name: '店舗/FC開発',
      jobs: [
        { id: 'store_development', name: '店舗開発', value: '32ef2' },
        { id: 'fc_development', name: 'FC加盟店開発', value: '347dd' },
        { id: 'fc_planning', name: 'FC開発企画/支援', value: '22306' },
        { id: 'store_development_other', name: 'その他', value: 'f7dab' }
      ]
    },
    {
      id: 'store_management',
      name: '店舗管理/運営/支援',
      jobs: [
        { id: 'supervisor', name: 'スーパーバイザー/ラウンダー', value: 'cfd51' },
        { id: 'vmd', name: '店舗/ディスプレーデザイナー/VMD', value: 'bc12b' },
        { id: 'trainer', name: 'スタッフトレーナー', value: '50ab5' },
        { id: 'loss_prevention', name: '万引き防止スタッフ', value: 'c6d63' },
        { id: 'store_management_other', name: 'その他', value: '9bea5' }
      ]
    },
    {
      id: 'retail_other',
      name: 'その他',
      jobs: [
        { id: 'retail_other', name: 'その他', value: 'bc3b1' }
      ]
    }
  ]
};