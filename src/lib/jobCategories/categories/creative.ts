import { JobCategory } from '../types';

export const CREATIVE_CATEGORIES: JobCategory = {
  id: 'creative',
  name: 'クリエイティブ/デザイン職',
  subcategories: [
    {
      id: 'web_service',
      name: 'Webサービス/制作',
      jobs: [
        { id: 'web_producer', name: 'プロデューサー', value: '6f2e0' },
        { id: 'web_planner', name: 'プランナー', value: '56eae' },
        { id: 'web_director', name: 'ディレクター', value: 'ed300' },
        { id: 'web_production', name: '制作進行管理', value: 'cec89' },
        { id: 'web_art_director', name: 'アートディレクター', value: '74a25' },
        { id: 'web_designer', name: 'Webデザイナー', value: '8ee6f' },
        { id: 'ui_ux_designer', name: 'UI/UXデザイナー', value: '1fc1c' },
        { id: 'ui_ux_researcher', name: 'UI/UXリサーチャー', value: 'a6d5f' },
        { id: 'web_service_other', name: 'その他', value: '2c2fd' }
      ]
    },
    {
      id: 'advertising',
      name: '広告/グラフィック',
      jobs: [
        { id: 'ad_producer', name: '広告プロデューサー', value: 'a4dbf' },
        { id: 'ad_planner', name: '広告プランナー', value: '47713' },
        { id: 'ad_director', name: '広告ディレクター', value: '01cf0' },
        { id: 'ad_production', name: '広告制作進行管理', value: '3c54b' },
        { id: 'creative_director', name: 'クリエイティブディレクター', value: '3c07c' },
        { id: 'ad_art_director', name: 'アートディレクター', value: '0602e' },
        { id: 'graphic_designer', name: 'グラフィックデザイナー', value: '5b8dc' },
        { id: 'illustrator', name: 'イラストレーター', value: '6ef73' },
        { id: 'cg_animator', name: 'CGアニメーター', value: '04ac0' },
        { id: 'sound_creator', name: 'サウンドクリエーター', value: '3bb9c' },
        { id: 'copywriter', name: 'コピーライター', value: 'c2920' },
        { id: 'advertising_other', name: 'その他', value: '5ea03' }
      ]
    },
    {
      id: 'game',
      name: 'ゲーム',
      jobs: [
        { id: 'game_producer', name: 'ゲームプロデューサー', value: '38603' },
        { id: 'game_planner', name: 'ゲームプランナー', value: '54011' },
        { id: 'game_director', name: 'ゲームディレクター', value: '72fac' },
        { id: 'game_production', name: 'ゲーム制作進行管理', value: '14725' },
        { id: 'scenario_writer', name: 'シナリオライター', value: '3d824' },
        { id: 'game_art_director', name: 'ゲームアートディレクター', value: '8af7b' },
        { id: 'game_graphic', name: 'ゲームグラフィックデザイナー', value: 'ec42f' },
        { id: 'game_illustrator', name: 'ゲームイラストレーター', value: '859bc' },
        { id: 'game_ui', name: 'ゲームUIデザイナー', value: '7090d' },
        { id: 'background_designer', name: '背景デザイナー', value: '9befb' },
        { id: 'character_designer', name: 'キャラクターデザイナー', value: '8115a' },
        { id: 'effect_designer', name: 'エフェクトデザイナー', value: 'e6e31' },
        { id: 'cg_designer', name: 'CGデザイナー', value: 'bdee1' },
        { id: 'motion_designer', name: 'モーションデザイナー', value: '73ef3' },
        { id: 'game_sound', name: 'ゲームサウンドクリエーター', value: 'bf2c7' },
        { id: 'game_programmer', name: 'ゲームプログラマー', value: 'e84df' },
        { id: 'debugger', name: 'デバッガー', value: '9d233' },
        { id: 'game_other', name: 'その他', value: 'a3955' }
      ]
    },
    {
      id: 'fashion',
      name: 'アパレル/ファッション',
      jobs: [
        { id: 'fashion_designer', name: 'ファッションデザイナー', value: '140e13' },
        { id: 'textile_designer', name: 'テキスタイルデザイナー', value: 'd8c72' },
        { id: 'accessory_designer', name: '服飾雑貨デザイナー', value: '86b3b' },
        { id: 'jewelry_designer', name: 'アクセサリー/ジュエリーデザイナー', value: 'e194e' },
        { id: 'pattern_maker', name: 'パタンナー', value: '1f99f' },
        { id: 'sewing_staff', name: '縫製/ソーイングスタッフ', value: '2dd42' },
        { id: 'reformer', name: 'リフォーマー', value: '973' },
        { id: 'tailor', name: 'テーラー', value: 'aa9d8' },
        { id: 'stylist', name: 'スタイリスト', value: '90f35' },
        { id: 'color_coordinator', name: 'カラーコーディネーター', value: 'aa95c' },
        { id: 'fashion_other', name: 'その他', value: '397c3' }
      ]
    },
    {
      id: 'product_design',
      name: '工業/プロダクト/インテリア',
      jobs: [
        { id: 'product_designer', name: 'プロダクトデザイナー', value: '9c710' },
        { id: 'color_designer', name: 'カラーデザイナー', value: '463fe' },
        { id: 'package_designer', name: 'パッケージデザイナー', value: '333fb' },
        { id: 'modeler', name: 'モデラー', value: 'dc1f7' },
        { id: 'interior_coordinator', name: 'インテリアコーディネーター', value: '4302a' },
        { id: 'interior_designer', name: 'インテリアデザイナー', value: '1daba' },
        { id: 'ui_designer', name: 'UIデザイナー', value: 'ccc6f' },
        { id: 'cmf', name: 'CMF', value: '6ed95' },
        { id: 'product_design_other', name: 'その他', value: '87abb' }
      ]
    },
    {
      id: 'writer_editor',
      name: 'ライター/編集',
      jobs: [
        { id: 'writer_editor', name: 'ライター/編集', value: '24132' }
      ]
    },
    {
      id: 'photographer',
      name: 'フォトグラファー',
      jobs: [
        { id: 'photographer', name: 'フォトグラファー', value: '87be4' }
      ]
    },
    {
      id: 'retoucher',
      name: 'レタッチャー',
      jobs: [
        { id: 'retoucher', name: 'レタッチャー', value: 'f7b8a' }
      ]
    },
    {
      id: 'markup',
      name: 'マークアップ/コーダー',
      jobs: [
        { id: 'markup', name: 'マークアップ/コーダー', value: 'dc254' }
      ]
    },
    {
      id: 'florist',
      name: 'フローリスト/フラワーデザイナー',
      jobs: [
        { id: 'florist', name: 'フローリスト/フラワーデザイナー', value: '73a2d' }
      ]
    },
    {
      id: 'craftsman',
      name: 'ものづくり/職人',
      jobs: [
        { id: 'craftsman', name: 'ものづくり/職人', value: '0bd9b' }
      ]
    },
    {
      id: 'creative_other',
      name: 'その他',
      jobs: [
        { id: 'creative_other', name: 'その他', value: '1b460' }
      ]
    }
  ]
};