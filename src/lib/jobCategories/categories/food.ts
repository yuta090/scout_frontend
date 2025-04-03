import { JobCategory } from '../types';

export const FOOD_CATEGORIES: JobCategory = {
  id: 'food',
  name: '飲食',
  subcategories: [
    {
      id: 'hall_staff',
      name: 'ホール/フロアスタッフ',
      jobs: [
        { id: 'hall_staff', name: 'ホール/フロアスタッフ', value: '705f8' }
      ]
    },
    {
      id: 'kitchen_staff',
      name: '調理スタッフ',
      jobs: [
        { id: 'kitchen_staff', name: '調理スタッフ', value: '8d473' }
      ]
    },
    {
      id: 'restaurant_manager',
      name: '店長/支配人',
      jobs: [
        { id: 'restaurant_manager', name: '店長/支配人', value: '47028' }
      ]
    },
    {
      id: 'restaurant_area',
      name: 'エリアマネージャー',
      jobs: [
        { id: 'restaurant_area', name: 'エリアマネージャー', value: '985d6' }
      ]
    },
    {
      id: 'chef',
      name: 'シェフ/料理人',
      jobs: [
        { id: 'japanese_chef', name: '和食', value: '6b4c4' },
        { id: 'italian_chef', name: 'イタリアン', value: '6a577' },
        { id: 'french_chef', name: 'フレンチ', value: '156ae' },
        { id: 'chinese_chef', name: '中華', value: '6f2da' },
        { id: 'ethnic_chef', name: 'エスニック料理', value: 'bdb19' },
        { id: 'creative_chef', name: '創作料理', value: 'fa2e7' },
        { id: 'chef_other', name: 'その他', value: 'f2a73' }
      ]
    },
    {
      id: 'pastry_chef',
      name: 'パティシエ/菓子職人',
      jobs: [
        { id: 'pastry_chef', name: 'パティシエ/菓子職人', value: 'b3e56' }
      ]
    },
    {
      id: 'sommelier',
      name: 'ソムリエ/バーテンダー',
      jobs: [
        { id: 'sommelier', name: 'ソムリエ/バーテンダー', value: 'fa259' }
      ]
    },
    {
      id: 'barista',
      name: 'バリスタ',
      jobs: [
        { id: 'barista', name: 'バリスタ', value: 'd9b5c' }
      ]
    },
    {
      id: 'baker',
      name: 'パン職人',
      jobs: [
        { id: 'baker', name: 'パン職人', value: '553a7' }
      ]
    },
    {
      id: 'cook',
      name: '調理師',
      jobs: [
        { id: 'cook', name: '調理師', value: '32453' }
      ]
    },
    {
      id: 'food_other',
      name: 'その他',
      jobs: [
        { id: 'food_other', name: 'その他', value: '17ee6' }
      ]
    }
  ]
};