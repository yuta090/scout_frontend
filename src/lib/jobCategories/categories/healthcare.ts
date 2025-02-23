import { JobCategory } from '../types';

export const HEALTHCARE_CATEGORIES: JobCategory = {
  id: 'healthcare',
  name: '医療/福祉専門職',
  subcategories: [
    {
      id: 'medical_institution',
      name: '医療機関',
      jobs: [
        { id: 'hospital_director', name: '病院長', value: '263c6' },
        { id: 'administrative_director', name: '事務長', value: 'aded2' },
        { id: 'doctor', name: '医師', value: '277e05' },
        { id: 'nurse', name: '看護師', value: 'dea9a' },
        { id: 'assistant_nurse', name: '准看護師', value: '6645a' },
        { id: 'midwife', name: '助産師', value: '15d2f' },
        { id: 'public_health_nurse', name: '保健師', value: '39da4' },
        { id: 'veterinarian', name: '獣医師', value: '1cf99' },
        { id: 'veterinary_nurse', name: '動物看護師', value: 'ae859' },
        { id: 'nursing_assistant', name: '看護助手', value: 'dc637' },
        { id: 'clinical_engineer', name: '臨床工学技士', value: 'b59ce' },
        { id: 'dentist', name: '歯科医師', value: '4bbac' },
        { id: 'dental_hygienist', name: '歯科衛生士', value: 'a1bf4' },
        { id: 'dental_technician', name: '歯科技工士', value: '892' },
        { id: 'dental_assistant', name: '歯科助手', value: 'dce98' },
        { id: 'clinical_psychologist', name: '臨床心理士', value: '7a24c' },
        { id: 'industrial_physician', name: '産業医/産業カウンセラー', value: '9cf50' },
        { id: 'physical_therapist', name: '理学療法士', value: 'ad987' },
        { id: 'occupational_therapist', name: '作業療法士', value: '3e472' },
        { id: 'acupuncturist', name: '鍼灸師', value: '431e06' },
        { id: 'orthoptist', name: '視能訓練士', value: '46704' },
        { id: 'speech_therapist', name: '言語聴覚士', value: '0fa1e' },
        { id: 'nutritionist', name: '栄養士', value: '61fe1' },
        { id: 'registered_dietitian', name: '管理栄養士', value: '1f073' },
        { id: 'hospital_cook', name: '病院内調理師', value: '3519a' },
        { id: 'clinical_laboratory_technician', name: '臨床検査技師', value: '2d009' },
        { id: 'radiological_technologist', name: '診療放射線技師', value: '871eb' },
        { id: 'medical_information_manager', name: '診療情報管理士', value: '2a6bf' },
        { id: 'medical_office', name: '医療事務', value: '329a8' },
        { id: 'medical_secretary', name: '医療秘書', value: '198f3' },
        { id: 'medical_institution_other', name: 'その他', value: '192ee' }
      ]
    },
    {
      id: 'pharmacy',
      name: '薬局/ドラッグストア',
      jobs: [
        { id: 'pharmacist', name: '薬剤師', value: '10c66' },
        { id: 'pharmacy_manager', name: '管理薬剤師', value: 'afe78' },
        { id: 'registered_seller', name: '登録販売者', value: 'db02f' },
        { id: 'dispensing_assistant', name: '調剤補助員', value: '450e92' },
        { id: 'dispensing_clerk', name: '調剤事務員', value: 'ed6ec' },
        { id: 'pharmacy_other', name: 'その他', value: 'dc49d' }
      ]
    },
    {
      id: 'welfare',
      name: '福祉/介護',
      jobs: [
        { id: 'welfare_manager', name: '福祉/介護事業責任者/施設長', value: '505d7' },
        { id: 'service_provider', name: 'サービス提供責任者', value: 'a9fd7' },
        { id: 'care_manager', name: 'ケアマネージャー', value: '62677' },
        { id: 'care_worker', name: '介護福祉士', value: '17aa9' },
        { id: 'case_worker', name: 'ケースワーカー', value: '43130' },
        { id: 'care_staff', name: 'ケアワーカー', value: '73479' },
        { id: 'home_helper', name: 'ホームヘルパー', value: 'b8448' },
        { id: 'rehab_counselor', name: 'リハビリカウンセラー', value: 'fc96f' },
        { id: 'counselor', name: 'カウンセラー/セラピスト', value: '0c46c' },
        { id: 'life_support', name: '生活相談員/生活支援員', value: '4638' },
        { id: 'transfer_driver', name: '送迎ドライバー', value: 'b5010' },
        { id: 'welfare_office', name: '福祉/介護事務', value: 'eeee1' },
        { id: 'welfare_other', name: 'その他', value: '99ec2' }
      ]
    },
    {
      id: 'child_welfare',
      name: '児童福祉',
      jobs: [
        { id: 'child_counselor', name: '児童相談員', value: '4ec96' },
        { id: 'after_school_staff', name: '学童保育指導員', value: '0d39d' },
        { id: 'child_welfare_other', name: 'その他', value: '29a86' }
      ]
    },
    {
      id: 'healthcare_other',
      name: 'その他',
      jobs: [
        { id: 'healthcare_other', name: 'その他', value: 'd1bf1' }
      ]
    }
  ]
};