export interface SearchCriteria {
  keywords: string[];
  jobExperience: string[];
  desiredJobs: string[]; // 追加
  experience: {
    min: number;
    max: number;
  };
  education: string[];
  graduationYear: {
    min: string;
    max: string;
  };
  workExperience: {
    min: string;
    max: string;
  };
  skills: string[];
  experiences: string[];
  certifications: string[];
  englishLevel: string;
  companyCount: string;
  managementCount: string;
  employmentStatus: string | null;
  companies: string[];
  recentOnly: boolean;
  exclude: boolean;
  otherLanguages: string[];
  includeAllLanguages: boolean;
  freeWordOr: string;
  freeWordAnd: string;
}

// 他のexportは変更なし
export type DeliveryDay = {
  checked: boolean;
  start: string;
};

export type DeliveryDays = {
  [key in keyof typeof DAY_NAMES]: DeliveryDay;
};

export const DAY_NAMES = {
  monday: '月曜日',
  tuesday: '火曜日',
  wednesday: '水曜日',
  thursday: '木曜日',
  friday: '金曜日',
  saturday: '土曜日',
  sunday: '日曜日'
} as const;

export const PREFECTURES = [
  '北海道', '青森県', '岩手県', '宮城県', '秋田県', '山形県', '福島県',
  '茨城県', '栃木県', '群馬県', '埼玉県', '千葉県', '東京都', '神奈川県',
  '新潟県', '富山県', '石川県', '福井県', '山梨県', '長野県', '岐阜県',
  '静岡県', '愛知県', '三重県', '滋賀県', '京都府', '大阪府', '兵庫県',
  '奈良県', '和歌山県', '鳥取県', '島根県', '岡山県', '広島県', '山口県',
  '徳島県', '香川県', '愛媛県', '高知県', '福岡県', '佐賀県', '長崎県',
  '熊本県', '大分県', '宮崎県', '鹿児島県', '沖縄県'
];