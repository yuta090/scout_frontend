import { JobCategory } from '../types';

export const SALES_CATEGORIES: JobCategory = {
  id: 'sales',
  name: '営業',
  subcategories: [
    {
      id: 'construction_sales',
      name: '建築/土木/プラント営業',
      jobs: [
        { id: 'construction_corporate', name: '建築法人営業', value: 'af63e' },
        { id: 'construction_individual', name: '建築個人営業', value: 'e29b3' },
        { id: 'civil_corporate', name: '土木法人営業', value: '9cd17' },
        { id: 'plant_corporate', name: 'プラント法人営業', value: '44468' }
      ]
    },
    {
      id: 'real_estate_sales',
      name: '不動産営業',
      jobs: [
        { id: 'real_estate_corporate', name: '不動産法人営業', value: 'fa76e' },
        { id: 'real_estate_individual', name: '不動産個人営業', value: 'f7341' }
      ]
    },
    {
      id: 'it_sales',
      name: 'IT/通信製品営業',
      jobs: [
        { id: 'it_corporate', name: 'IT/通信製品法人営業', value: '4a469' }
      ]
    },
    {
      id: 'web_game_sales',
      name: 'Webサービス/ゲーム営業',
      jobs: [
        { id: 'web_corporate', name: 'Webサービス法人営業', value: 'c0918' },
        { id: 'game_corporate', name: 'ゲーム法人営業', value: 'f3cb6' }
      ]
    },
    {
      id: 'automotive_sales',
      name: '自動車/輸送機器営業',
      jobs: [
        { id: 'automotive_corporate', name: '自動車/輸送機器法人営業', value: '8ba5b' },
        { id: 'automotive_individual', name: '自動車/輸送機器個人営業', value: '5f637' }
      ]
    },
    {
      id: 'mechanical_sales',
      name: '機械/電気/電子製品営業',
      jobs: [
        { id: 'mechanical_corporate', name: '機械/電気/電子製品法人営業', value: '86052' }
      ]
    },
    {
      id: 'hr_sales',
      name: '人材/アウトソーシング営業',
      jobs: [
        { id: 'hr_corporate', name: '人材/アウトソーシング法人営業', value: 'd70e4' }
      ]
    },
    {
      id: 'financial_sales',
      name: '金融/保険営業',
      jobs: [
        { id: 'bank_corporate', name: '銀行法人営業', value: '95ed4' },
        { id: 'securities_corporate', name: '証券法人営業', value: '18ba7' },
        { id: 'insurance_corporate', name: '保険法人営業', value: 'c497e' },
        { id: 'bank_individual', name: '銀行個人営業', value: '72d29' },
        { id: 'securities_individual', name: '証券個人営業', value: '40ca4' },
        { id: 'insurance_individual', name: '保険個人営業', value: '9f873' },
        { id: 'financial_other', name: 'その他', value: 'e40e1' }
      ]
    },
    {
      id: 'media_sales',
      name: '広告/メディア/イベント営業',
      jobs: [
        { id: 'media_corporate', name: '広告/メディア法人営業', value: '581bc' },
        { id: 'event_corporate', name: 'イベント法人営業', value: '15d4c' }
      ]
    },
    {
      id: 'cosmetics_sales',
      name: '化粧品/トイレタリー営業',
      jobs: [
        { id: 'cosmetics_corporate', name: '化粧品/トイレタリー法人営業', value: '384c6' }
      ]
    },
    {
      id: 'daily_goods_sales',
      name: '日用品/アパレル/インテリア営業',
      jobs: [
        { id: 'daily_goods_corporate', name: '日用品/アパレル/インテリア法人営業', value: '9afc8' }
      ]
    },
    {
      id: 'food_sales',
      name: '食品/飲料/香料営業',
      jobs: [
        { id: 'food_corporate', name: '食品/飲料/香料法人営業', value: '5aed9' }
      ]
    },
    {
      id: 'chemical_sales',
      name: '化学/素材営業',
      jobs: [
        { id: 'chemical_corporate', name: '化学/素材法人営業', value: 'c2452' }
      ]
    },
    {
      id: 'metal_sales',
      name: '鉄鋼/非鉄金属/金属製品営業',
      jobs: [
        { id: 'metal_corporate', name: '鉄鋼/非鉄金属/金属製品法人営業', value: 'b140f' }
      ]
    },
    {
      id: 'mr',
      name: '医薬情報担当者/MR',
      jobs: [
        { id: 'mr', name: '医薬情報担当者/MR', value: 'c376d' }
      ]
    },
    {
      id: 'medical_device_sales',
      name: '医療機器/理化学機器営業',
      jobs: [
        { id: 'medical_device_corporate', name: '医療機器法人営業', value: '33378' },
        { id: 'scientific_corporate', name: '理化学機器法人営業', value: '12b8b' }
      ]
    },
    {
      id: 'leisure_sales',
      name: 'レジャー/トラベル営業',
      jobs: [
        { id: 'leisure_corporate', name: 'レジャー/トラベル法人営業', value: '4fb72' }
      ]
    },
    {
      id: 'other_sales',
      name: 'その他営業',
      jobs: [
        { id: 'other_sales', name: 'その他営業', value: 'e1ff7' }
      ]
    }
  ]
};