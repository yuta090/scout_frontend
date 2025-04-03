import { JobCategory } from '../types';

export const PUBLIC_SERVICE_CATEGORIES: JobCategory = {
  id: 'public_service',
  name: '公務員/団体職員/農林水産',
  subcategories: [
    {
      id: 'ministry_staff',
      name: '省庁職員',
      jobs: [
        { id: 'technical_staff', name: '技術総合職', value: '9492d' },
        { id: 'non_technical_staff', name: '非技術総合職', value: 'c2731' },
        { id: 'general_staff', name: '一般職', value: '2ace6' },
        { id: 'prosecutor', name: '検察官', value: '82eb9' },
        { id: 'correctional_psychologist', name: '矯正心理専門職', value: 'f60c2' },
        { id: 'correctional_instructor', name: '法務教官', value: '0cf78' },
        { id: 'probation_officer', name: '保護観察官', value: '18a30' },
        { id: 'tax_officer', name: '国税専門官', value: '1e0fc' },
        { id: 'finance_officer', name: '財務専門官', value: 'ab7c8' },
        { id: 'labor_inspector', name: '労働基準監督官', value: 'd33af' },
        { id: 'food_inspector', name: '食品衛生監視員', value: '5a722' },
        { id: 'finance_staff', name: '財務職員', value: 'c40e3' },
        { id: 'coast_guard', name: '海上保安官', value: 'f798b' },
        { id: 'air_traffic_controller', name: '航空管制官/航空管制運航情報官', value: '37154' },
        { id: 'self_defense', name: '自衛官', value: '4e7d5' },
        { id: 'imperial_guard', name: '皇宮護衛官', value: '0f628' },
        { id: 'prison_officer', name: '刑務官', value: 'ea70b' },
        { id: 'immigration_officer', name: '入国警備官', value: '7569c' },
        { id: 'ministry_other', name: 'その他', value: '7621c' }
      ]
    },
    {
      id: 'local_government',
      name: '地方自治体職員',
      jobs: [
        { id: 'local_government', name: '地方自治体職員', value: 'cecaf' }
      ]
    },
    {
      id: 'diet',
      name: '国会',
      jobs: [
        { id: 'diet_member', name: '国会議員', value: '2d6a8' },
        { id: 'diet_secretary', name: '議員秘書', value: '754c2' },
        { id: 'diet_staff', name: '国会職員', value: '545d5' },
        { id: 'diet_other', name: 'その他', value: 'b7136' }
      ]
    },
    {
      id: 'local_assembly',
      name: '地方議会議員',
      jobs: [
        { id: 'local_assembly', name: '地方議会議員', value: '7e37e' }
      ]
    },
    {
      id: 'court',
      name: '裁判所',
      jobs: [
        { id: 'judge', name: '裁判官', value: 'db83c' },
        { id: 'court_clerk', name: '裁判所事務官', value: 'a9f57' },
        { id: 'court_secretary', name: '裁判所書記官', value: '3254b' },
        { id: 'family_court_investigator', name: '家庭裁判所調査官', value: 'efe7c' },
        { id: 'prosecution_clerk', name: '検察事務官', value: 'bf481' },
        { id: 'court_other', name: 'その他', value: '29a25' }
      ]
    },
    {
      id: 'police',
      name: '警察',
      jobs: [
        { id: 'community_police', name: '地域警察', value: '5137' },
        { id: 'traffic_police', name: '交通警察', value: '253f2' },
        { id: 'police_other', name: 'その他', value: '73e3c' }
      ]
    },
    {
      id: 'firefighter',
      name: '消防士',
      jobs: [
        { id: 'firefighter', name: '消防士', value: '8b127' }
      ]
    },
    {
      id: 'public_facility',
      name: '公共施設職員',
      jobs: [
        { id: 'public_facility', name: '公共施設職員', value: 'f7642' }
      ]
    },
    {
      id: 'organization_staff',
      name: '団体職員',
      jobs: [
        { id: 'organization_staff', name: '団体職員', value: '6e53d' }
      ]
    },
    {
      id: 'npo_ngo',
      name: 'NPO/NGO職員',
      jobs: [
        { id: 'npo_ngo', name: 'NPO/NGO職員', value: 'ad628' }
      ]
    },
    {
      id: 'agriculture',
      name: '農林水産鉱業職種',
      jobs: [
        { id: 'farmer', name: '農家/農作業スタッフ', value: 'cf004' },
        { id: 'forestry', name: '森林作業員', value: '80266' },
        { id: 'livestock', name: '飼育管理スタッフ', value: '37cf6' },
        { id: 'water_treatment', name: '排水等処理施設管理', value: '9aed5' },
        { id: 'fishing', name: '漁船漁業', value: '7e4bd' },
        { id: 'aquaculture', name: '養殖漁業', value: '9d2d1' },
        { id: 'resource_exploration', name: '資源探査', value: 'b2371' },
        { id: 'mining_management', name: '採鉱管理', value: '5cefd' },
        { id: 'underground_worker', name: '坑内作業員', value: '04b04' },
        { id: 'ore_dressing', name: '選鉱', value: '92575' },
        { id: 'agriculture_other', name: 'その他', value: '80707' }
      ]
    },
    {
      id: 'public_service_other',
      name: 'その他',
      jobs: [
        { id: 'public_service_other', name: 'その他', value: '2181e' }
      ]
    }
  ]
};