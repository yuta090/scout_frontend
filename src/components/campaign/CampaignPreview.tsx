import React from 'react';
import { ArrowLeft, Send, Building2, Calendar, FileText, Search } from 'lucide-react';
import type { Customer } from '../../lib/supabase';
import { JobType, DeliveryDays, DAY_NAMES } from './types';
import { isNightTimeDelivery, getDayDeliveryPrice, calculateTotalPrice, BASE_PRICE } from './utils';
import { JOB_CATEGORIES } from '../../lib/jobCategories';
import Modal from '../ui/Modal';

interface PreviewData {
  customer: Customer | null;
  title: string;
  description: string;
  platform: 'airwork' | 'engage' | null;
  jobTypes: JobType[];
  schedule: {
    startDate: string;
    endDate: string;
    deliveryDays: DeliveryDays;
  };
  quantity: number;
  totalAmount: number;
}

interface CampaignPreviewProps {
  data: PreviewData;
  onBack: () => void;
  onConfirm: () => void;
  isSubmitting: boolean;
  isEditing?: boolean; // 編集モードかどうかを示すフラグを追加
}

const CampaignPreview: React.FC<CampaignPreviewProps> = ({
  data,
  onBack,
  onConfirm,
  isSubmitting,
  isEditing = false // デフォルトは新規作成モード
}) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getDeliveryDaysText = () => {
    const days = Object.entries(data.schedule.deliveryDays)
      .filter(([_, value]) => value.checked)
      .map(([day, value]) => `${DAY_NAMES[day as keyof typeof DAY_NAMES]} ${value.start}:00`);
    return days.join('、');
  };

  const additionalQuantity = data.quantity - 500;

  const getJobName = (value: string): string => {
    for (const category of JOB_CATEGORIES) {
      for (const subcategory of category.subcategories || []) {
        const job = subcategory.jobs?.find(j => j.value === value);
        if (job) {
          return `${category.name} > ${subcategory.name} > ${job.name}`;
        }
      }
    }
    return value;
  };

  // 検索条件の表示用ヘルパー関数
  const renderSearchCriteria = (jobType: JobType) => {
    const criteria = jobType.search_criteria;
    const sections: { title: string; items: string[] }[] = [];

    // 職種経験
    if (criteria.jobExperience.length > 0) {
      sections.push({
        title: '職種経験',
        items: criteria.jobExperience.map(value => getJobName(value))
      });
    }

    // 希望職種
    if (criteria.desiredJobs.length > 0) {
      sections.push({
        title: '希望職種',
        items: criteria.desiredJobs.map(value => getJobName(value))
      });
    }

    // 学歴
    if (criteria.education.length > 0) {
      sections.push({
        title: '学歴',
        items: criteria.education
      });
    }

    // 経験年数
    if (criteria.experience.min > 0 || criteria.experience.max > 0) {
      sections.push({
        title: '経験年数',
        items: [`${criteria.experience.min}年〜${criteria.experience.max}年`]
      });
    }

    // スキル
    if (criteria.skills.length > 0) {
      sections.push({
        title: 'スキル',
        items: criteria.skills
      });
    }

    // 資格
    if (criteria.certifications.length > 0) {
      sections.push({
        title: '資格',
        items: criteria.certifications
      });
    }

    // 英語レベル
    if (criteria.englishLevel !== '1') {
      sections.push({
        title: '英語レベル',
        items: [criteria.englishLevel]
      });
    }

    // その他言語
    if (criteria.otherLanguages.length > 0) {
      sections.push({
        title: 'その他言語',
        items: criteria.otherLanguages
      });
    }

    // フリーワード
    const freeWords: string[] = [];
    if (criteria.freeWordOr) freeWords.push(`いずれかを含む: ${criteria.freeWordOr}`);
    if (criteria.freeWordAnd) freeWords.push(`すべて含む: ${criteria.freeWordAnd}`);
    if (freeWords.length > 0) {
      sections.push({
        title: 'フリーワード',
        items: freeWords
      });
    }

    return (
      <div className="mt-4 space-y-3">
        {sections.map((section, index) => (
          <div key={index} className="bg-gray-50 p-3 rounded-md">
            <h5 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
              <Search className="h-4 w-4 mr-1 text-gray-400" />
              {section.title}
            </h5>
            <div className="flex flex-wrap gap-2">
              {section.items.map((item, i) => (
                <span
                  key={i}
                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <Modal
      isOpen={true}
      onClose={onBack}
      title="スカウト依頼の確認"
      maxWidth="max-w-4xl"
    >
      <div className="px-6 py-4 space-y-6">
        <p className="text-sm text-gray-500">
          内容を確認して、問題がなければ「{isEditing ? 'スカウト依頼を更新' : 'スカウト依頼を作成'}」をクリックしてください。
        </p>

        {/* 基本情報 */}
        <div className="space-y-4">
          <div className="flex items-center space-x-4">
            <div className="h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center">
              <Building2 className="h-6 w-6 text-indigo-600" />
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900">
                {data.customer?.company_name}
              </h3>
              {data.customer?.contact_name && (
                <p className="text-sm text-gray-500">
                  担当: {data.customer.contact_name}
                </p>
              )}
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4 space-y-3">
            <div>
              <span className="text-sm font-medium text-gray-500">タイトル:</span>
              <p className="mt-1 text-gray-900">{data.title}</p>
            </div>
            {data.description && (
              <div>
                <span className="text-sm font-medium text-gray-500">説明:</span>
                <p className="mt-1 text-gray-900">{data.description}</p>
              </div>
            )}
            <div>
              <span className="text-sm font-medium text-gray-500">プラットフォーム:</span>
              <p className="mt-1 text-gray-900">
                {data.platform === 'airwork' ? 'Airワーク' : 'エンゲージ'}
              </p>
            </div>
          </div>
        </div>

        {/* 職種情報 */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900 flex items-center">
            <FileText className="h-5 w-5 mr-2 text-gray-400" />
            職種情報
          </h3>
          <div className="bg-gray-50 rounded-lg divide-y divide-gray-200">
            {data.jobTypes.map((jobType, index) => (
              <div key={jobType.id} className="p-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-base font-medium text-gray-900">
                    {jobType.name || `職種 ${index + 1}`}
                  </h4>
                  <span className="text-sm text-gray-500">
                    送信数: {jobType.quantity}通
                  </span>
                </div>
                <div className="mt-2">
                  <span className="text-sm text-gray-500">勤務地:</span>
                  <div className="mt-1 flex flex-wrap gap-2">
                    {jobType.locations.map(location => (
                      <span
                        key={location}
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                      >
                        {location}
                      </span>
                    ))}
                  </div>
                </div>
                {/* 検索条件の表示 */}
                {renderSearchCriteria(jobType)}
              </div>
            ))}
          </div>
        </div>

        {/* スケジュール情報 */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900 flex items-center">
            <Calendar className="h-5 w-5 mr-2 text-gray-400" />
            スケジュール
          </h3>
          <div className="bg-gray-50 rounded-lg p-4 space-y-3">
            <div>
              <span className="text-sm font-medium text-gray-500">配信期間:</span>
              <p className="mt-1 text-gray-900">
                {formatDate(data.schedule.startDate)} 〜 {formatDate(data.schedule.endDate)}
              </p>
            </div>
            <div className="pt-4 border-t">
              <span className="text-sm font-medium text-gray-500">オプション</span>
              <div className="mt-2">
                <span className="text-sm font-medium text-gray-500">配信日時:</span>
                <p className="mt-1 text-gray-900">{getDeliveryDaysText()}</p>
              </div>
            </div>
          </div>
        </div>

        {/* 料金情報 */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex justify-between items-center text-lg font-medium">
            <span>基本料金:</span>
            <span>{BASE_PRICE.toLocaleString()}円</span>
          </div>
          <div className="mt-2 space-y-2">
            <div className="flex justify-between items-center text-lg">
              <span>オプション料金:</span>
              <span>+{(data.totalAmount - BASE_PRICE).toLocaleString()}円</span>
            </div>
            <div className="text-sm text-gray-600 pl-4 space-y-1">
              {additionalQuantity > 0 && (
                <div className="flex justify-between">
                  <span>追加送信 ({additionalQuantity.toLocaleString()}通):</span>
                  <span>+{(additionalQuantity * 10).toLocaleString()}円</span>
                </div>
              )}
              {Object.entries(data.schedule.deliveryDays).map(([day, value]) => {
                const price = getDayDeliveryPrice(day as keyof DeliveryDays, data.schedule.deliveryDays);
                if (value.checked && price > 0) {
                  const dayName = DAY_NAMES[day as keyof typeof DAY_NAMES];
                  const isNight = isNightTimeDelivery(value.start);
                  const isWeekend = day === 'saturday' || day === 'sunday';
                  return (
                    <div key={day} className="flex justify-between">
                      <span>
                        {dayName} ({isWeekend ? '休日' : '平日'}{isNight ? '・夜間' : ''} {value.start}:00配信):
                      </span>
                      <span>+{price.toLocaleString()}円</span>
                    </div>
                  );
                }
                return null;
              })}
            </div>
          </div>
          <div className="flex justify-between items-center text-xl font-bold mt-4 pt-4 border-t">
            <span>合計金額:</span>
            <span>{data.totalAmount.toLocaleString()}円</span>
          </div>
          <div className="mt-2 text-sm text-gray-500 text-right">
            (1通あたり {Math.round(data.totalAmount / data.quantity).toLocaleString()}円)
          </div>
        </div>
      </div>

      <div className="px-6 py-4 border-t border-gray-200 flex justify-between">
        <button
          onClick={onBack}
          disabled={isSubmitting}
          className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          内容を修正
        </button>
        <button
          onClick={onConfirm}
          disabled={isSubmitting}
          className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 disabled:opacity-50"
        >
          <Send className="h-4 w-4 mr-2" />
          {isSubmitting ? '処理中...' : isEditing ? 'スカウト依頼を更新' : 'スカウト依頼を作成'}
        </button>
      </div>
    </Modal>
  );
};

export default CampaignPreview;