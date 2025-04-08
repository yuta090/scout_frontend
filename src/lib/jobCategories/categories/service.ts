import { JobCategory } from '../types';

export const SERVICE_CATEGORIES: JobCategory = {
  id: 'service',
  name: 'サービス/接客',
  subcategories: [
    {
      id: 'security',
      name: '警備',
      jobs: [
        { id: 'security_staff', name: '警備スタッフ/守衛', value: 'dcacb' },
        { id: 'security_transport', name: '警備輸送', value: '44f3e' },
        { id: 'security_management', name: '警備管理/運営', value: '2232d' },
        { id: 'security_other', name: 'その他', value: 'c9fdb' }
      ]
    },
    {
      id: 'cleaning',
      name: '清掃/家事代行',
      jobs: [
        { id: 'cleaning_staff', name: '清掃スタッフ', value: 'b1855' },
        { id: 'house_cleaning', name: 'ハウスクリーニングスタッフ', value: '15648' },
        { id: 'housekeeping', name: '家事代行スタッフ/家政婦', value: 'f98c7' },
        { id: 'babysitter', name: 'ベビーシッター', value: '3047f' },
        { id: 'cleaning_management', name: '清掃管理/運営', value: 'b99b2' },
        { id: 'housekeeping_management', name: '家事代行管理/運営', value: 'cdc61' },
        { id: 'cleaning_other', name: 'その他', value: '287ed' }
      ]
    },
    {
      id: 'amusement',
      name: 'アミューズメント',
      jobs: [
        { id: 'amusement_staff', name: '販売/フロアスタッフ', value: 'b8363' },
        { id: 'amusement_manager', name: '店長/支配人', value: 'a6d82' },
        { id: 'amusement_area', name: 'エリアマネージャー', value: '72e52' },
        { id: 'amusement_other', name: 'その他', value: '3bbb4' }
      ]
    },
    {
      id: 'event',
      name: 'イベント',
      jobs: [
        { id: 'event_planning', name: 'イベント企画', value: 'f05c5' },
        { id: 'event_staff', name: 'イベント運営スタッフ', value: 'e1b77' },
        { id: 'event_management', name: 'イベント管理', value: '55563' },
        { id: 'event_other', name: 'その他', value: '5f445' }
      ]
    },
    {
      id: 'travel',
      name: '旅行',
      jobs: [
        { id: 'tour_conductor', name: '添乗員/ガイド/ツアコン', value: '40ff3' },
        { id: 'travel_coordinator', name: '旅行手配員', value: 'ca7bf' },
        { id: 'travel_sales', name: '旅行カウンターセールス', value: 'e57a1' },
        { id: 'visa_support', name: 'ビザ取得支援/代行', value: 'fb03c' },
        { id: 'travel_other', name: 'その他', value: 'eaa87' }
      ]
    },
    {
      id: 'hotel',
      name: '宿泊/ホテル',
      jobs: [
        { id: 'doorstaff', name: 'ドアスタッフ', value: 'add9b' },
        { id: 'bellstaff', name: 'ベル係', value: '17252' },
        { id: 'front_desk', name: 'フロント', value: 'c2dc1' },
        { id: 'concierge', name: 'コンシェルジュ', value: '6a457' },
        { id: 'housekeeping_hotel', name: 'ハウスキーピング', value: '415ce' },
        { id: 'room_attendant', name: 'ルームアテンダント', value: 'cac84' },
        { id: 'waiter', name: 'ウェイター', value: 'f2dff' },
        { id: 'banquet_staff', name: '宴会スタッフ', value: '25cf2' },
        { id: 'cloak', name: 'クローク', value: '2add6' },
        { id: 'hotel_manager', name: '責任者', value: '5b8e3' },
        { id: 'hotel_other', name: 'その他', value: '86c2c' }
      ]
    },
    {
      id: 'beauty',
      name: '美容/リラクゼーション',
      jobs: [
        { id: 'barber', name: '理容師', value: 'd0f79' },
        { id: 'beautician', name: '美容師', value: '345cb' },
        { id: 'nail_artist', name: 'ネイリスト', value: 'e8e4a' },
        { id: 'eye_designer', name: 'アイデザイナー', value: 'c65bc' },
        { id: 'esthetician', name: 'エステティシャン', value: '8886f' },
        { id: 'seitai', name: '整体師', value: '66065' },
        { id: 'judo_therapist', name: '柔道整復師', value: 'a3d0d' },
        { id: 'massage_therapist', name: 'あん摩マッサージ指圧師', value: 'bae30' },
        { id: 'chiropractor', name: 'カイロプラクター', value: '3724a' },
        { id: 'reflexologist', name: 'リフレクソロジスト', value: 'd0240' },
        { id: 'therapist', name: 'セラピスト', value: '72ff5' },
        { id: 'foot_care', name: 'フットケア', value: '83af8' },
        { id: 'hair_removal', name: '脱毛スタッフ', value: 'b093b' },
        { id: 'beauty_consultant', name: '美容コンサルタント', value: '67f48' },
        { id: 'beauty_advisor', name: '美容部員', value: '4d351' },
        { id: 'beauty_reception', name: '美容受付/事務', value: '6bf36' },
        { id: 'beauty_other', name: 'その他', value: 'a7780' }
      ]
    },
    {
      id: 'bridal_funeral',
      name: '冠婚葬祭',
      jobs: [
        { id: 'wedding_planner', name: 'ウエディングプランナー', value: 'd503a' },
        { id: 'dress_coordinator', name: 'ドレスコーディネーター', value: '19bf3' },
        { id: 'bridal_staff', name: 'ブライダルスタッフ', value: '52ed0' },
        { id: 'matchmaking_staff', name: '結婚相談所スタッフ', value: 'd36c8' },
        { id: 'funeral_director', name: '葬祭ディレクター/プランナー', value: '4d3da' },
        { id: 'funeral_staff', name: '葬祭スタッフ', value: 'd4a85' },
        { id: 'bridal_funeral_other', name: 'その他', value: '18b90' }
      ]
    },
    {
      id: 'property_management',
      name: 'マンション管理/コンシェルジュ/寮管理',
      jobs: [
        { id: 'building_manager', name: 'マンション/ビル管理人', value: '2083b' },
        { id: 'concierge_property', name: 'コンシェルジュ', value: 'd5388' },
        { id: 'dormitory_manager', name: '寮管理人', value: '5c557' }
      ]
    },
    {
      id: 'fitness',
      name: 'フィットネス',
      jobs: [
        { id: 'fitness_trainer', name: 'トレーナー/インストラクター', value: '6ebfb' },
        { id: 'fitness_staff', name: 'フロアスタッフ', value: 'a7f63' },
        { id: 'fitness_manager', name: '施設管理者', value: 'd3606' },
        { id: 'fitness_other', name: 'その他', value: 'a613c' }
      ]
    },
    {
      id: 'gas_station',
      name: 'ガソリンスタンド',
      jobs: [
        { id: 'gas_station_staff', name: 'スタッフ', value: '28de2' },
        { id: 'gas_station_manager', name: '店長', value: '99a8e' },
        { id: 'gas_station_area', name: 'エリアマネージャー', value: '3b546' }
      ]
    },
    {
      id: 'pet_care',
      name: 'トリマー/飼育員/ブリーダー',
      jobs: [
        { id: 'trimmer', name: 'トリマー', value: '4b3aa' },
        { id: 'animal_keeper', name: '飼育員', value: 'f58bf' },
        { id: 'breeder', name: 'ブリーダー', value: 'bcab5' }
      ]
    },
    {
      id: 'delivery',
      name: 'デリバリー',
      jobs: [
        { id: 'delivery', name: 'デリバリー', value: '8507b' }
      ]
    },
    {
      id: 'newspaper',
      name: '新聞配達/集金',
      jobs: [
        { id: 'newspaper', name: '新聞配達/集金', value: 'bd9cc' }
      ]
    },
    {
      id: 'other_service',
      name: 'その他サービス業',
      jobs: [
        { id: 'other_service_staff', name: '接客/フロアスタッフ', value: '89eaa' },
        { id: 'other_service_manager', name: '店長/支配人', value: 'fcd0e' },
        { id: 'other_service_area', name: 'エリアマネージャー', value: '17390' },
        { id: 'other_service_other', name: 'その他', value: 'eaa8c' }
      ]
    }
  ]
};