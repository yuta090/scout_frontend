import { JobCategory } from '../types';

export const EDUCATION_CATEGORIES: JobCategory = {
  id: 'education',
  name: '教育/保育専門職',
  subcategories: [
    {
      id: 'school_principal',
      name: '学校長/理事長',
      jobs: [
        { id: 'elementary_principal', name: '小学校', value: '9d37c' },
        { id: 'junior_high_principal', name: '中学校', value: 'a81d7' },
        { id: 'high_school_principal', name: '高校', value: '8f92d' },
        { id: 'university_principal', name: '大学', value: '38aab' },
        { id: 'vocational_principal', name: '専門学校', value: '0625c' },
        { id: 'special_needs_principal', name: '養護学校', value: '0ef22' },
        { id: 'principal_other', name: 'その他', value: '5903d' }
      ]
    },
    {
      id: 'teacher',
      name: '教員',
      jobs: [
        { id: 'elementary_teacher', name: '小学校', value: '35223' },
        { id: 'junior_high_teacher', name: '中学校', value: '819b2' },
        { id: 'high_school_teacher', name: '高校', value: 'bcb26' },
        { id: 'university_teacher', name: '大学', value: '2cb5f' },
        { id: 'vocational_teacher', name: '専門学校', value: '4e338' },
        { id: 'special_needs_teacher', name: '養護学校', value: '33654' },
        { id: 'teacher_other', name: 'その他', value: '54aaa' }
      ]
    },
    {
      id: 'career_guidance',
      name: '進路指導/進路カウンセラー',
      jobs: [
        { id: 'junior_high_counselor', name: '中学', value: '182dd' },
        { id: 'high_school_counselor', name: '高校', value: 'c0168' },
        { id: 'university_counselor', name: '大学', value: 'cd2ae' },
        { id: 'vocational_counselor', name: '専門学校', value: '8f248' },
        { id: 'special_needs_counselor', name: '養護学校', value: 'b22db' },
        { id: 'career_guidance_other', name: 'その他', value: 'a6443' }
      ]
    },
    {
      id: 'psychological_counselor',
      name: '心理カウンセラー',
      jobs: [
        { id: 'psychological_counselor', name: '心理カウンセラー', value: '21a08' }
      ]
    },
    {
      id: 'school_manager',
      name: 'スクール長/マネジャー',
      jobs: [
        { id: 'school_manager', name: 'スクール長/マネジャー', value: '3266d' }
      ]
    },
    {
      id: 'instructor',
      name: '講師/トレーナー',
      jobs: [
        { id: 'cram_school_teacher', name: '学習塾講師', value: '3cb25' },
        { id: 'it_instructor', name: 'パソコン/IT/OA', value: '1f1a6' },
        { id: 'programming_instructor', name: 'プログラミング/コーディング', value: '4e17b' },
        { id: 'english_instructor', name: '英語', value: 'd842f' },
        { id: 'japanese_instructor', name: '日本語', value: '30720' },
        { id: 'accounting_instructor', name: '会計/簿記', value: '1ad30' },
        { id: 'hr_instructor', name: '人事', value: 'fdef9' },
        { id: 'driving_instructor', name: '自動車教習', value: 'b9f89' },
        { id: 'music_instructor', name: '音楽/楽器', value: '1aa37' },
        { id: 'sports_instructor', name: 'スポーツ', value: 'de7fe' },
        { id: 'dance_instructor', name: 'ダンス', value: 'd9f54' },
        { id: 'martial_arts_instructor', name: '武術/武道', value: '5b82e' },
        { id: 'art_instructor', name: 'アート/デザイン', value: '62444' },
        { id: 'instructor_other', name: 'その他', value: 'c6aea' }
      ]
    },
    {
      id: 'private_tutor',
      name: '家庭教師',
      jobs: [
        { id: 'private_tutor', name: '家庭教師', value: 'c7bc7' }
      ]
    },
    {
      id: 'educational_content',
      name: '教材コンテンツ開発',
      jobs: [
        { id: 'educational_content', name: '教材コンテンツ開発', value: 'b0fa3' }
      ]
    },
    {
      id: 'tutor_counseling',
      name: 'チューター/学習カウンセリング/進路相談',
      jobs: [
        { id: 'tutor_counseling', name: 'チューター/学習カウンセリング/進路相談', value: 'd437b' }
      ]
    },
    {
      id: 'childcare',
      name: '保育',
      jobs: [
        { id: 'childcare_worker', name: '保育士', value: '42110' },
        { id: 'kindergarten_teacher', name: '幼稚園教諭', value: '6fdd1' },
        { id: 'childcare_other', name: 'その他', value: 'c2edb' }
      ]
    },
    {
      id: 'school_admin',
      name: '学校事務/大学事務/教務事務',
      jobs: [
        { id: 'school_admin', name: '学校事務/大学事務/教務事務', value: '3d4d9' }
      ]
    },
    {
      id: 'curator_librarian',
      name: '学芸員/図書館司書',
      jobs: [
        { id: 'curator_librarian', name: '学芸員/図書館司書', value: 'ea55d' }
      ]
    },
    {
      id: 'school_cook',
      name: '学校給食調理士',
      jobs: [
        { id: 'school_cook', name: '学校給食調理士', value: '4e9a0' }
      ]
    },
    {
      id: 'education_other',
      name: 'その他',
      jobs: [
        { id: 'education_other', name: 'その他', value: '66ea3' }
      ]
    }
  ]
};