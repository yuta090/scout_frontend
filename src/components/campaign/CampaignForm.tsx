import React, { useState, useEffect } from 'react';
import {
  X,
  Shield,
  CheckCircle,
  AlertCircle,
  Eye,
  FileText,
  Download,
  Plus,
} from 'lucide-react';
import {
  supabase,
  type Customer,
  type Campaign,
  checkAirworkAuth,
  checkEngageAuth,
} from '../../lib/supabase';
import CustomerSelector from './sections/CustomerSelector';
import BasicInfoSection from './sections/BasicInfoSection';
import JobTypeSection from './sections/JobTypeSection';
import DeliveryPeriodSection from './sections/DeliveryPeriodSection';
import DeliveryScheduleSection from './sections/DeliveryScheduleSection';
import FloatingErrorSummary from './components/FloatingErrorSummary';
import CampaignPreview from './CampaignPreview';
import { DeliveryDays } from './types';
import { useFormValidation } from './hooks/useFormValidation';
import {
  calculateTotalPrice,
  calculateDeliveryDaysInPeriod,
  getDeliveryDates,
  calculateTotalQuantity,
  DAILY_LIMIT,
} from './utils';
import Modal from '../ui/Modal';

interface CampaignFormProps {
  customerId?: string;
  campaign?: Campaign;
  onClose: () => void;
  onSave?: () => void;
}

const getInitialSearchCriteria = () => ({
  keywords: [],
  jobExperience: [],
  desiredJobs: [],
  experience: { min: 0, max: 0 },
  education: [],
  graduationYear: { min: '', max: '' },
  workExperience: { min: '', max: '' },
  skills: [],
  experiences: [],
  certifications: [],
  englishLevel: '1',
  companyCount: '6',
  managementCount: '1',
  employmentStatus: null,
  companies: [],
  recentOnly: false,
  exclude: false,
  otherLanguages: [],
  includeAllLanguages: false,
  freeWordOr: '',
  freeWordAnd: '',
  freeWordExclude: '',
});

const CampaignForm: React.FC<CampaignFormProps> = ({
  customerId,
  campaign,
  onClose,
  onSave,
}) => {
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null
  );
  const [selectedPlatform, setSelectedPlatform] = useState<
    'airwork' | 'engage' | null
  >(null);
  const [jobTypes, setJobTypes] = useState([
    {
      id: `job-${Date.now()}`,
      name: '',
      age_range: [0, 0],
      locations: [],
      quantity: 100,
      search_criteria: getInitialSearchCriteria(),
    },
  ]);
  const [activeJobTypeId, setActiveJobTypeId] = useState(jobTypes[0].id);
  const [additionalQuantity, setAdditionalQuantity] = useState(0);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [originalEndDate, setOriginalEndDate] = useState(''); // 元の終了日を保存
  const [deliveryDays, setDeliveryDays] = useState<DeliveryDays>({
    monday: { checked: true, start: '9' },
    tuesday: { checked: true, start: '9' },
    wednesday: { checked: true, start: '9' },
    thursday: { checked: true, start: '9' },
    friday: { checked: true, start: '9' },
    saturday: { checked: false, start: '9' },
    sunday: { checked: false, start: '9' },
  });
  const [formData, setFormData] = useState({
    title: '',
    description: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState<{
    platform: 'airwork' | 'engage';
  } | null>(null);

  useEffect(() => {
    if (campaign) {
      setFormData({
        title: campaign.title,
        description: campaign.description || '',
      });

      if (campaign.job_details?.platform) {
        setSelectedPlatform(campaign.job_details.platform);
      }

      if (campaign.job_details?.job_type) {
        const jobTypeData = Array.isArray(campaign.job_details.job_type)
          ? campaign.job_details.job_type
          : [campaign.job_details.job_type];

        const formattedJobTypes = jobTypeData.map((job, index) => {
          // 年齢範囲を取得
          let ageRange = [0, 0];
          
          // ターゲット条件から年齢範囲を取得
          if (campaign.target_criteria && campaign.target_criteria.age_range) {
            if (Array.isArray(campaign.target_criteria.age_range) && campaign.target_criteria.age_range.length >= 2) {
              ageRange = [
                Number(campaign.target_criteria.age_range[0]) || 0,
                Number(campaign.target_criteria.age_range[1]) || 0
              ];
            }
          }
          
          return {
            id: `job-${Date.now()}-${index}`,
            name: job.name || '',
            locations: job.locations || [],
            quantity: campaign.job_details.quantity?.[index] || 100,
            age_range: ageRange,
            search_criteria: campaign.search_criteria || getInitialSearchCriteria(),
          };
        });

        setJobTypes(formattedJobTypes);
        setActiveJobTypeId(formattedJobTypes[0].id);
      }

      if (campaign.options?.schedule) {
        setStartDate(campaign.options.schedule.start_date || '');
        setEndDate(campaign.options.schedule.end_date || '');
        setOriginalEndDate(campaign.options.schedule.end_date || ''); // 元の終了日を保存
        if (campaign.options.schedule.delivery_days) {
          setDeliveryDays(campaign.options.schedule.delivery_days);
        }
      }
    }
  }, [campaign]);

  // 終了日が変更されたときに追加送信数を自動計算
  useEffect(() => {
    if (campaign && startDate && endDate && originalEndDate && endDate !== originalEndDate) {
      // 新しい期間の配信日数を計算
      const newDeliveryDaysCount = calculateDeliveryDaysInPeriod(startDate, endDate, deliveryDays);
      // 元の期間の配信日数を計算
      const originalDeliveryDaysCount = calculateDeliveryDaysInPeriod(startDate, originalEndDate, deliveryDays);
      
      // 日数が増えた場合、追加日数分の送信数を追加
      if (newDeliveryDaysCount > originalDeliveryDaysCount) {
        const additionalDays = newDeliveryDaysCount - originalDeliveryDaysCount;
        const additionalSendCount = additionalDays * DAILY_LIMIT;
        
        // 追加送信数を更新（既存の追加送信数に加算）
        setAdditionalQuantity(prev => prev + additionalSendCount);
      }
    }
  }, [campaign, startDate, endDate, originalEndDate, deliveryDays]);

  useEffect(() => {
    if (customerId) {
      const fetchCustomer = async () => {
        const { data: customer, error } = await supabase
          .from('customers')
          .select('*')
          .eq('id', customerId)
          .single();

        if (!error && customer) {
          setSelectedCustomer(customer);
        }
      };
      fetchCustomer();
    }
  }, [customerId]);

  const { errors, validateForm, clearErrors, setErrors } = useFormValidation({
    selectedCustomer,
    title: formData.title,
    selectedPlatform,
    jobTypes,
    startDate,
    endDate,
    deliveryDays,
  });

  const validateAirworkCredentials = (
    username?: string,
    password?: string
  ): string | null => {
    if (!username || !password) {
      return 'ユーザー名とパスワードを入力してください';
    }

    if (username.length < 4) {
      return 'ユーザー名は4文字以上で入力してください';
    }

    if (password.length < 8) {
      return 'パスワードは8文字以上で入力してください';
    }

    return null;
  };

  const handleAuthCheck = async (platform: 'airwork' | 'engage') => {
    if (!selectedCustomer) return;

    setCheckingAuth({ platform });
    setErrors({});

    try {
      if (platform === 'airwork') {
        const validationError = validateAirworkCredentials(
          selectedCustomer.airwork_login?.username,
          selectedCustomer.airwork_login?.password
        );

        if (validationError) {
          setErrors((prev) => ({
            ...prev,
            auth: [validationError],
          }));
          setCheckingAuth(null);
          return;
        }
      }

      const result =
        platform === 'airwork'
          ? await checkAirworkAuth(
              selectedCustomer.airwork_login?.username,
              selectedCustomer.airwork_login?.password
            )
          : await checkEngageAuth(selectedCustomer.id);

      const { error: updateError } = await supabase
        .from('customers')
        .update({
          [`${platform}_auth_status`]: result.success
            ? 'authenticated'
            : 'failed',
        })
        .eq('id', selectedCustomer.id);

      if (updateError) throw updateError;

      setSelectedCustomer((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          [platform === 'airwork'
            ? 'airwork_auth_status'
            : 'engage_auth_status']: result.success
            ? 'authenticated'
            : 'failed',
        };
      });

      if (!result.success) {
        setErrors((prev) => ({
          ...prev,
          auth: [
            result.message ||
              `${
                platform === 'airwork' ? 'AirWork' : 'Engage'
              }の認証に失敗しました`,
          ],
        }));
      }
    } catch (error) {
      console.error(`Error checking ${platform} authentication:`, error);
      setErrors((prev) => ({
        ...prev,
        auth: [
          `${
            platform === 'airwork' ? 'AirWork' : 'Engage'
          }の認証中にエラーが発生しました`,
        ],
      }));

      try {
        await supabase
          .from('customers')
          .update({
            [`${platform}_auth_status`]: 'failed',
          })
          .eq('id', selectedCustomer.id);

        setSelectedCustomer((prev) => {
          if (!prev) return null;
          return {
            ...prev,
            [platform === 'airwork'
              ? 'airwork_auth_status'
              : 'engage_auth_status']: 'failed',
          };
        });
      } catch (updateError) {
        console.error('Error updating auth status:', updateError);
      }
    } finally {
      setCheckingAuth(null);
    }
  };

  const isAuthValid = () => {
    if (!selectedCustomer || !selectedPlatform) return false;
    if (selectedPlatform === 'airwork') {
      return selectedCustomer.airwork_auth_status === 'authenticated';
    } else {
      return selectedCustomer.engage_auth_status === 'authenticated';
    }
  };

  const handlePreview = async () => {
    if (!isAuthValid()) {
      setErrors({
        auth: [
          `${
            selectedPlatform === 'airwork' ? 'AirWork' : 'Engage'
          }の認証が必要です`,
        ],
      });
      return;
    }

    const isValid = await validateForm();
    if (!isValid) return;

    const totalQuantity = jobTypes.reduce((sum, job) => sum + job.quantity, 0);
    const totalAmount = calculateTotalPrice(deliveryDays, additionalQuantity);

    const previewData = {
      customer: selectedCustomer,
      title: formData.title,
      description: formData.description,
      platform: selectedPlatform,
      jobTypes,
      schedule: {
        startDate,
        endDate,
        deliveryDays,
      },
      quantity: totalQuantity,
      totalAmount,
    };

    setShowPreview(true);
  };

  const handleSubmit = async (isDraft = false) => {
    if (isLoading) return;

    if (!isDraft) {
      const isValid = await validateForm();
      if (!isValid) return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error('認証エラー');

      const deliveryDaysCount = calculateDeliveryDaysInPeriod(
        startDate,
        endDate,
        deliveryDays
      );

      const deliveryDates = getDeliveryDates(startDate, endDate, deliveryDays);

      const dailyQuantity = jobTypes.reduce(
        (sum, job) => sum + job.quantity,
        0
      );

      const totalQuantity = dailyQuantity * deliveryDaysCount;
      
      const campaignData = {
        customer_id: selectedCustomer?.id,
        agency_id: user.id,
        title: formData.title || '無題のスカウト依頼',
        description: formData.description || '',
        target_criteria: {
          skills: jobTypes[0].search_criteria.skills,
          age_range: jobTypes[0].age_range,
          education: jobTypes[0].search_criteria.education,
          experience_years: jobTypes[0].search_criteria.experience.max,
        },
        job_details: {
          platform: selectedPlatform,
          job_type: jobTypes.map((jt) => ({
            name: jt.name,
            locations: jt.locations,
            age_range: jt.age_range,
          })),
          quantity: jobTypes.map((jt) => jt.quantity),
        },
        quantity: totalQuantity,
        status: isDraft ? 'draft' : 'approved',
        options: {
          schedule: {
            start_date: startDate,
            end_date: endDate,
            delivery_days: deliveryDays,
            daily_limit: 500,
          },
          message_template: '',
        },
        total_amount: calculateTotalPrice(deliveryDays, additionalQuantity),
        search_criteria: jobTypes[0].search_criteria,
      };

      if (campaign) {
        // 既存のキャンペーンを更新
        const { error: updateError } = await supabase
          .from('campaigns')
          .update(campaignData)
          .eq('id', campaign.id);

        if (updateError) throw updateError;

        // 既存のスケジュールを削除
        const { error: deleteError } = await supabase
          .from('campaign_schedules')
          .delete()
          .eq('campaign_id', campaign.id);

        if (deleteError) {
          console.error('Error deleting existing schedules:', deleteError);
        }

        // 新しいスケジュールを作成
        deliveryDates.forEach(async (date) => {
          jobTypes.forEach(async (jt) => {
            const scheduleData = {
              campaign_id: campaign.id,
              date: date.date,
              time: date.time,
              sent: false,
              job_title: jt.name,
              quantity: jt.quantity,
              location: jt.locations,
              current_scout: 1,
            };

            const { error: scheduleError } = await supabase
              .from('campaign_schedules')
              .insert([scheduleData]);

            if (scheduleError) {
              console.error('Error inserting schedule:', scheduleError);
            }
          });
        });

        setSuccessMessage('スカウト依頼を更新しました');
      } else {
        // 新規キャンペーンを作成
        const { data: createdData, error: saveError } = await supabase
          .from('campaigns')
          .insert([campaignData])
          .select('id');

        if (saveError) throw saveError;

        if (createdData && createdData.length > 0) {
          const campaignId = createdData[0].id;
          
          deliveryDates.forEach(async (date) => {
            jobTypes.forEach(async (jt) => {
              const scheduleData = {
                campaign_id: campaignId,
                date: date.date,
                time: date.time,
                sent: false,
                job_title: jt.name,
                quantity: jt.quantity,
                location: jt.locations,
                current_scout: 1,
              };

              const { error: scheduleError } = await supabase
                .from('campaign_schedules')
                .insert([scheduleData]);

              if (scheduleError) {
                console.error('Error inserting schedule:', scheduleError);
              } else {
                console.log('Inserted schedule:', scheduleData);
              }
            });
          });
        }

        setSuccessMessage(
          isDraft
            ? 'スカウト依頼を下書き保存しました'
            : 'スカウト依頼を作成しました'
        );
      }

      if (onSave) {
        onSave();
      }

      setTimeout(() => {
        onClose();
      }, 3000);
    } catch (err) {
      console.error('Error saving campaign:', err);
      setErrors({
        total: ['スカウト依頼の保存に失敗しました'],
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportJSON = () => {
    const campaignData = {
      title: formData.title,
      description: formData.description,
      platform: selectedPlatform,
      jobTypes,
      schedule: {
        startDate,
        endDate,
        deliveryDays,
      },
      quantity: jobTypes.reduce((sum, job) => sum + job.quantity, 0),
      totalAmount: calculateTotalPrice(deliveryDays, additionalQuantity),
    };

    const blob = new Blob([JSON.stringify(campaignData, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `scout-request-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title={campaign ? 'スカウト依頼の編集' : '新規スカウト依頼作成'}
      maxWidth="max-w-3xl"
    >
      <div className="px-6 py-4 space-y-6">
        {successMessage ? (
          <div className="flex items-center justify-center p-4 bg-green-50 border border-green-200 rounded-md">
            <CheckCircle className="h-5 w-5 text-green-400 mr-2" />
            <span className="text-green-800">{successMessage}</span>
          </div>
        ) : (
          <>
            <CustomerSelector
              selectedCustomer={selectedCustomer}
              onSelectCustomer={setSelectedCustomer}
            />

            <BasicInfoSection
              title={formData.title}
              description={formData.description}
              selectedPlatform={selectedPlatform}
              onTitleChange={(title) => setFormData({ ...formData, title })}
              onDescriptionChange={(description) =>
                setFormData({ ...formData, description })
              }
              onPlatformSelect={setSelectedPlatform}
            />

            {selectedCustomer && selectedPlatform && !isAuthValid() && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 space-y-4">
                <div className="flex items-center">
                  <AlertCircle className="h-5 w-5 text-yellow-400 mr-2" />
                  <h3 className="text-sm font-medium text-yellow-800">
                    {selectedPlatform === 'airwork' ? 'AirWork' : 'Engage'}
                    の認証が必要です
                  </h3>
                </div>

                {selectedPlatform === 'airwork' && (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          ユーザー名
                        </label>
                        <input
                          type="text"
                          value={
                            selectedCustomer.airwork_login?.username || ''
                          }
                          onChange={(e) =>
                            setSelectedCustomer({
                              ...selectedCustomer,
                              airwork_login: {
                                ...selectedCustomer.airwork_login,
                                username: e.target.value,
                              },
                            })
                          }
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                          placeholder="4文字以上で入力"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          パスワード
                        </label>
                        <input
                          type="password"
                          value={
                            selectedCustomer.airwork_login?.password || ''
                          }
                          onChange={(e) =>
                            setSelectedCustomer({
                              ...selectedCustomer,
                              airwork_login: {
                                ...selectedCustomer.airwork_login,
                                password: e.target.value,
                              },
                            })
                          }
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                          placeholder="8文字以上で入力"
                        />
                      </div>
                    </div>
                  </div>
                )}

                <button
                  onClick={() => handleAuthCheck(selectedPlatform)}
                  disabled={checkingAuth !== null}
                  className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                >
                  {checkingAuth ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      認証確認中...
                    </>
                  ) : (
                    <>
                      <Shield className="h-4 w-4 mr-2" />
                      認証する
                    </>
                  )}
                </button>
              </div>
            )}

            {selectedPlatform && (
              <>
                <JobTypeSection
                  jobTypes={jobTypes}
                  activeJobTypeId={activeJobTypeId}
                  customerId={selectedCustomer?.id}
                  onAddJobType={(newJobType) => {
                    setJobTypes([...jobTypes, newJobType]);
                    setActiveJobTypeId(newJobType.id);
                  }}
                  onRemoveJobType={(id) => {
                    setJobTypes(jobTypes.filter((jt) => jt.id !== id));
                    if (activeJobTypeId === id) {
                      setActiveJobTypeId(jobTypes[0].id);
                    }
                  }}
                  onUpdateJobType={(id, updates) => {
                    setJobTypes(
                      jobTypes.map((jt) =>
                        jt.id === id ? { ...jt, ...updates } : jt
                      )
                    );
                  }}
                  onActiveJobTypeChange={setActiveJobTypeId}
                />

                <DeliveryPeriodSection
                  startDate={startDate}
                  endDate={endDate}
                  deliveryDays={deliveryDays}
                  additionalQuantity={additionalQuantity}
                  onStartDateChange={setStartDate}
                  onEndDateChange={setEndDate}
                  isEditing={!!campaign} // 編集モードかどうかを渡す
                  onAdditionalQuantityChange={setAdditionalQuantity} // 追加送信数を変更するコールバックを渡す
                />

                <DeliveryScheduleSection
                  deliveryDays={deliveryDays}
                  additionalQuantity={additionalQuantity}
                  startDate={startDate}
                  endDate={endDate}
                  onDeliveryDaysChange={setDeliveryDays}
                  onAdditionalQuantityChange={setAdditionalQuantity}
                />
              </>
            )}

            <div className="flex justify-end space-x-4 pt-4 border-t">
              <button
                onClick={handleExportJSON}
                disabled={isLoading}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Download className="h-4 w-4 mr-2" />
                JSONエクスポート
              </button>
              <button
                onClick={() => handleSubmit(true)}
                disabled={isLoading || !selectedCustomer}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FileText className="h-4 w-4 mr-2" />
                下書き保存
              </button>
              <button
                onClick={handlePreview}
                disabled={isLoading || !selectedCustomer || !isAuthValid()}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Eye className="h-4 w-4 mr-2" />
                内容を確認
              </button>
            </div>
          </>
        )}
      </div>

      <FloatingErrorSummary errors={errors} />

      {showPreview && (
        <CampaignPreview
          data={{
            customer: selectedCustomer,
            title: formData.title,
            description: formData.description,
            platform: selectedPlatform,
            jobTypes,
            schedule: {
              startDate,
              endDate,
              deliveryDays,
            },
            quantity: jobTypes.reduce((sum, job) => sum + job.quantity, 0),
            totalAmount: calculateTotalPrice(deliveryDays, additionalQuantity),
          }}
          onBack={() => setShowPreview(false)}
          onConfirm={() => handleSubmit(false)}
          isSubmitting={isLoading}
          isEditing={!!campaign} // 既存のキャンペーンを編集する場合はtrue
        />
      )}
    </Modal>
  );
};

export default CampaignForm;