import { JobCategory } from '../types';

export const MEDIA_ENTERTAINMENT_CATEGORIES: JobCategory = {
  id: 'media_entertainment',
  name: '出版/メディア/芸能/エンタメ専門職',
  subcategories: [
    {
      id: 'publishing',
      name: '出版/印刷/著述業',
      jobs: [
        { id: 'writer', name: '作家', value: '87fff' },
        { id: 'manga_artist', name: '漫画家', value: '700e87' },
        { id: 'editor', name: '編集/エディター', value: 'cf6bc' },
        { id: 'proofreader', name: '校正/校閲', value: '448d0' },
        { id: 'plate_making', name: '版下/写植/製版', value: 'dd7a1' },
        { id: 'print_operator', name: '印刷オペレーター', value: '90594' },
        { id: 'bookbinding', name: '製本', value: 'd2da2' },
        { id: 'dtp_operator', name: 'DTPオペレーター', value: 'b64e0' },
        { id: 'dtp_designer', name: 'DTPデザイナー', value: 'c122c' },
        { id: 'retoucher', name: 'レタッチャー', value: 'ff834' },
        { id: 'journalist', name: '記者/ライター/ジャーナリスト', value: '69bfb' },
        { id: 'technical_writer', name: 'テクニカルライター', value: '60529' },
        { id: 'camera', name: 'カメラ', value: '82b6e' },
        { id: 'lighting', name: '照明', value: '5278c' },
        { id: 'stylist', name: 'スタイリスト', value: 'd6053' },
        { id: 'hair_makeup', name: 'ヘアメイク', value: '250e06' },
        { id: 'makeup_artist', name: 'メイクアップアーティスト', value: '49156' },
        { id: 'publishing_other', name: 'その他', value: '46241' }
      ]
    },
    {
      id: 'tv_movie_anime',
      name: 'テレビ/映画/アニメ',
      jobs: [
        { id: 'producer', name: 'プロデューサー', value: '86d20' },
        { id: 'director', name: 'ディレクター', value: 'bf9d0' },
        { id: 'ad', name: 'AD', value: 'cc5dc' },
        { id: 'movie_director', name: '監督', value: '506d1' },
        { id: 'staging', name: '演出', value: '01e9b' },
        { id: 'broadcast_writer', name: '放送作家', value: '4894c' },
        { id: 'scriptwriter', name: '脚本家', value: 'acfb6' },
        { id: 'scenario_writer', name: 'シナリオライター', value: '8916d' },
        { id: 'video_production', name: '映像制作', value: '08a1d' },
        { id: 'special_effects', name: '特殊効果/特撮', value: '94708' },
        { id: 'sound', name: '音響', value: '4eea4' },
        { id: 'sound_creator', name: 'サウンドクリエーター', value: '65234' },
        { id: 'editor', name: '編集', value: '200e164' },
        { id: 'retoucher', name: 'レタッチャー', value: '83188' },
        { id: 'camera', name: 'カメラ', value: 'a0f50' },
        { id: 'lighting', name: '照明', value: '4133a' },
        { id: 'animator', name: 'アニメーター', value: '216b1' },
        { id: 'stylist', name: 'スタイリスト', value: '7364' },
        { id: 'hair_makeup', name: 'ヘアメイク', value: 'b8709' },
        { id: 'makeup_artist', name: 'メイクアップアーティスト', value: '5f77e' },
        { id: 'broadcast_operator', name: '放送システム運用オペレーター', value: 'd6197' },
        { id: 'projectionist', name: '映写技師', value: '214ea' },
        { id: 'tv_movie_anime_other', name: 'その他', value: 'c1a8e' }
      ]
    },
    {
      id: 'entertainment',
      name: '芸能',
      jobs: [
        { id: 'announcer', name: 'アナウンサー', value: '43421' },
        { id: 'reporter', name: 'リポーター', value: '41ba9' },
        { id: 'actor', name: '俳優/役者', value: 'e0906' },
        { id: 'model', name: 'モデル', value: '74f9f' },
        { id: 'voice_actor', name: '声優/ナレーター', value: '59772' },
        { id: 'talent_manager', name: '芸能マネージャー', value: '899a9' },
        { id: 'entertainment_other', name: 'その他', value: '01d0b' }
      ]
    },
    {
      id: 'dancer',
      name: 'ダンサー',
      jobs: [
        { id: 'dancer', name: 'ダンサー', value: 'd1a18' }
      ]
    },
    {
      id: 'show_cast',
      name: 'ショーキャスト',
      jobs: [
        { id: 'show_cast', name: 'ショーキャスト', value: '001fc' }
      ]
    },
    {
      id: 'choreographer',
      name: '振付師',
      jobs: [
        { id: 'choreographer', name: '振付師', value: '9fb53' }
      ]
    },
    {
      id: 'casting_director',
      name: 'キャスティングディレクター',
      jobs: [
        { id: 'casting_director', name: 'キャスティングディレクター', value: 'dcc69' }
      ]
    },
    {
      id: 'musician',
      name: 'ミュージシャン',
      jobs: [
        { id: 'musician', name: 'ミュージシャン', value: '21571' }
      ]
    },
    {
      id: 'media_entertainment_other',
      name: 'その他',
      jobs: [
        { id: 'media_entertainment_other', name: 'その他', value: '19c46' }
      ]
    }
  ]
};