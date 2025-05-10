// 紹介者のダミーデータを作成するスクリプト
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Supabaseクライアントの初期化
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('環境変数が設定されていません。.envファイルを確認してください。');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ランダムな会社名を生成する関数
const generateCompanyName = () => {
  const prefixes = ['株式会社', '有限会社', '合同会社', '一般社団法人'];
  const names = [
    'テクノソリューション', 'デジタルイノベーション', 'フューチャーシステム', 
    'グローバルネットワーク', 'クリエイティブデザイン', 'スマートビジネス',
    'ユニバーサルコミュニケーション', 'プログレッシブテクノロジー', 'ネクストジェネレーション',
    'オプティマルサービス', 'インテリジェントシステム', 'エボリューションテクノロジー',
    'ビジョンエンタープライズ', 'イノベーティブソリューション', 'アドバンスドテクノロジー'
  ];
  
  const randomPrefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  const randomName = names[Math.floor(Math.random() * names.length)];
  
  return `ダミー:${randomPrefix}${randomName}`;
};

// ランダムな担当者名を生成する関数
const generateContactName = () => {
  const lastNames = ['佐藤', '鈴木', '高橋', '田中', '伊藤', '渡辺', '山本', '中村', '小林', '加藤'];
  const firstNames = ['太郎', '次郎', '三郎', '四郎', '五郎', '一郎', '健太', '大輔', '直樹', '誠'];
  
  const randomLastName = lastNames[Math.floor(Math.random() * lastNames.length)];
  const randomFirstName = firstNames[Math.floor(Math.random() * firstNames.length)];
  
  return `${randomLastName} ${randomFirstName}`;
};

// ランダムなメールアドレスを生成する関数
const generateEmail = (companyName, contactName) => {
  const domains = ['example.com', 'test.co.jp', 'dummy.jp', 'sample.net', 'demo.co.jp'];
  const randomDomain = domains[Math.floor(Math.random() * domains.length)];
  
  // 会社名から英数字のみを抽出
  const companySlug = companyName
    .replace(/ダミー:|株式会社|有限会社|合同会社|一般社団法人/g, '')
    .replace(/[^\w\s]/g, '')
    .trim()
    .toLowerCase();
  
  // 担当者名からローマ字表記を生成（簡易的）
  const contactSlug = contactName
    .replace(/\s+/g, '.')
    .toLowerCase();
  
  return `${contactSlug}@${companySlug}.${randomDomain}`;
};

// ランダムな電話番号を生成する関数
const generatePhone = () => {
  const areas = ['03', '06', '052', '011', '092', '045', '048', '076', '082'];
  const randomArea = areas[Math.floor(Math.random() * areas.length)];
  
  const middle = Math.floor(1000 + Math.random() * 9000);
  const last = Math.floor(1000 + Math.random() * 9000);
  
  return `${randomArea}-${middle}-${last}`;
};

// ランダムなメッセージを生成する関数
const generateMessage = () => {
  const messages = [
    '御社のサービスに興味があります。詳細を教えてください。',
    '紹介で知りました。資料を送っていただけますか？',
    'サービス内容について詳しく知りたいです。',
    '料金体系について教えてください。',
    '導入事例があれば教えていただきたいです。',
    '無料トライアルはありますか？',
    '他社との違いを教えてください。',
    '担当者と直接話をしたいです。',
    '見積もりをお願いします。',
    ''
  ];
  
  return messages[Math.floor(Math.random() * messages.length)];
};

// ダミーデータを作成して登録する関数
const createDummyReferrals = async (count, referrerId) => {
  console.log(`${count}件のダミーデータを作成します...`);
  
  const dummyLeads = [];
  
  for (let i = 0; i < count; i++) {
    const companyName = generateCompanyName();
    const contactName = generateContactName();
    const email = generateEmail(companyName, contactName);
    const phone = generatePhone();
    const message = generateMessage();
    
    // ランダムなステータスを設定
    const statuses = ['pending', 'contacted', 'converted', 'rejected'];
    const weights = [0.4, 0.3, 0.2, 0.1]; // 確率の重み
    
    let statusIndex = 0;
    const random = Math.random();
    let sum = 0;
    
    for (let j = 0; j < weights.length; j++) {
      sum += weights[j];
      if (random < sum) {
        statusIndex = j;
        break;
      }
    }
    
    const status = statuses[statusIndex];
    
    // 作成日時をランダムに設定（過去30日以内）
    const createdAt = new Date();
    createdAt.setDate(createdAt.getDate() - Math.floor(Math.random() * 30));
    
    dummyLeads.push({
      referrer_id: referrerId,
      company_name: companyName,
      contact_name: contactName,
      email: email,
      phone: phone,
      message: message,
      status: status,
      created_at: createdAt.toISOString()
    });
  }
  
  // Supabaseにデータを登録
  const { data, error } = await supabase
    .from('referral_leads')
    .insert(dummyLeads);
  
  if (error) {
    console.error('データの登録に失敗しました:', error);
    return false;
  }
  
  console.log(`${count}件のダミーデータを登録しました`);
  return true;
};

// メイン処理
const main = async () => {
  // コマンドライン引数から紹介者IDと件数を取得
  const args = process.argv.slice(2);
  const referrerId = args[0] || '6fec1c02-7727-4b4f-afb5-686b6f1c08de';
  const count = parseInt(args[1]) || 10;
  
  console.log(`紹介者ID: ${referrerId}`);
  console.log(`作成件数: ${count}`);
  
  // 紹介者が存在するか確認
  const { data: referrer, error: referrerError } = await supabase
    .from('profiles')
    .select('id, role')
    .eq('id', referrerId)
    .single();
  
  if (referrerError) {
    console.error('紹介者の情報取得に失敗しました:', referrerError);
    process.exit(1);
  }
  
  if (!referrer) {
    console.error('指定された紹介者IDは存在しません');
    process.exit(1);
  }
  
  console.log(`紹介者の役割: ${referrer.role}`);
  
  // ダミーデータを作成
  const result = await createDummyReferrals(count, referrerId);
  
  if (result) {
    console.log('処理が完了しました');
  } else {
    console.error('処理中にエラーが発生しました');
    process.exit(1);
  }
  
  process.exit(0);
};

// スクリプトの実行
main().catch(error => {
  console.error('予期せぬエラーが発生しました:', error);
  process.exit(1);
});