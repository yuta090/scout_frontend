import React, { useState, useEffect } from 'react';
import { X, Shield, CheckCircle, AlertCircle, Eye, FileText, Download, Plus } from 'lucide-react';
import { supabase, type Customer, type Campaign, checkAirworkAuth, checkEngageAuth } from '../../lib/supabase';
import CustomerSelector from './sections/CustomerSelector';
import BasicInfoSection from './sections/BasicInfoSection';
import JobTypeSection from './sections/JobTypeSection';
import DeliveryPeriodSection from './sections/DeliveryPeriodSection';
import DeliveryScheduleSection from './sections/DeliveryScheduleSection';
import FloatingErrorSummary from './components/FloatingErrorSummary';
import CampaignPreview from './CampaignPreview';
import { DeliveryDays } from './types';
import { useFormValidation } from './hooks/useFormValidation';
import { calculateTotalPrice, calculateDeliveryDaysInPeriod } from './utils';

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
  freeWordExclude: ''
});

const CampaignForm: React.FC<CampaignFormProps> = ({ customerId, campaign, onClose, onSave }) => {
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [selectedPlatform, setSelectedPlatform] = useState<'airwork' | 'engage' | null>(null);
  const [jobTypes, setJobTypes] = useState([{
    id: `job-${Date.now()}`,
    name: '',
    locations: [],
    quantity: 100,
    search_criteria: getInitialSearchCriteria()
  }]);
  const [activeJobTypeId, setActiveJobTypeId] = useState(jobTypes[0].id);
  const [additionalQuantity, setAdditionalQuantity] = useState(0);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [deliveryDays, setDeliveryDays] = useState<DeliveryDays>({
    monday: { checked: true, start: '9' },
    tuesday: { checked: true, start: '9' },
    wednesday: { checked: true, start: '9' },
    thursday: { checked: true, start: '9' },
    friday: { checked: true, start: '9' },
    saturday: { checked: false, start: '9' },
    sunday: { checked: false, start: '9' }
  });
  const [formData, setFormData] = useState({
    title: '',
    description: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState<{platform: 'airwork' | 'engage'} | null>(null);

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
    deliveryDays
  });

  const handleAuthCheck = async (platform: 'airwork' | 'engage') => {
    if (!selectedCustomer) return;
    
    setCheckingAuth({ platform });
    
    try {
      const result = platform === 'airwork' 
        ? await checkAirworkAuth(selectedCustomer.id)
        : await checkEngageAuth(selectedCustomer.id);

      setSelectedCustomer(prev => {
        if (!prev) return null;
        return {
          ...prev,
          [platform === 'airwork' ? 'airwork_auth_status' : 'engage_auth_status']: 
            result.success ? 'authenticated' : 'failed'
        };
      });

      if (!result.success) {
        setErrors(prev => ({
          ...prev,
          auth: [`${platform === 'airwork' ? 'AirWork' : 'Engage'}の認証に失敗しました`]
        }));
      }
    } catch (error) {
      console.error(`Error checking ${platform} authentication:`, error);
      setErrors(prev => ({
        ...prev,
        auth: [`${platform === 'airwork' ? 'AirWork' : 'Engage'}の認証中にエラーが発生しました`]
      }));
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
        auth: [`${selectedPlatform === 'airwork' ? 'AirWork' : 'Engage'}の認証が必要です`]
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
        deliveryDays
      },
      quantity: totalQuantity,
      totalAmount
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
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('認証エラー');

      const deliveryDaysCount = calculateDeliveryDaysInPeriod(startDate, endDate, deliveryDays);
      
      const dailyQuantity = jobTypes.reduce((sum, job) => sum + job.quantity, 0);
      
      const totalQuantity = dailyQuantity * deliveryDaysCount;

      const campaignData = {
        customer_id: selectedCustomer?.id,
        agency_id: user.id,
        title: formData.title || '無題のスカウト依頼',
        description: formData.description || '',
        job_details: {
          platform: selectedPlatform,
          job_type: jobTypes.map(jt => ({
            name: jt.name,
            locations: jt.locations
          })),
          quantity: jobTypes.map(jt => jt.quantity)
        },
        quantity: totalQuantity,
        status: isDraft ? 'draft' : 'requested',
        options: {
          schedule: {
            start_date: startDate,
            end_date: endDate,
            delivery_days: deliveryDays,
            daily_limit: 500
          },
          message_template: ''
        },
        total_amount: calculateTotalPrice(deliveryDays, additionalQuantity),
        search_criteria: jobTypes[0].search_criteria
      };

      const { error: saveError } = await supabase
        .from('campaigns')
        .insert([campaignData]);

      if (saveError) throw saveError;

      setSuccessMessage(isDraft ? 'スカウト依頼を下書き保存しました' : 'スカウト依頼を作成しました');
      
      if (onSave) {
        onSave();
      }

      setTimeout(() => {
        onClose();
      }, 3000);

    } catch (err) {
      console.error('Error saving campaign:', err);
      setErrors({
        total: ['スカウト依頼の保存に失敗しました']
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
        deliveryDays
      },
      quantity: jobTypes.reduce((sum, job) => sum + job.quantity, 0),
      totalAmount: calculateTotalPrice(deliveryDays, additionalQuantity)
    };

    const blob = new Blob([JSON.stringify(campaignData, null, 2)], { type: 'application/json' });
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
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-[100]">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto animate-slideDown">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">
            新規スカウト依頼作成
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 focus:outline-none"
            disabled={isLoading}
          >
            <X className="h-6 w-6" />
          </button>
        </div>

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
                onDescriptionChange={(description) => setFormData({ ...formData, description })}
                onPlatformSelect={setSelectedPlatform}
              />

              {selectedCustomer && selectedPlatform && !isAuthValid() && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 space-y-4">
                  <div className="flex items-center">
                    <AlertCircle className="h-5 w-5 text-yellow-400 mr-2" />
                    <h3 className="text-sm font-medium text-yellow-800">
                      {selectedPlatform === 'airwork' ? 'AirWork' : 'Engage'}の認証が必要です
                    </h3>
                  </div>

                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          ユーザー名
                        </label>
                        <input
                          type="text"
                          value={selectedCustomer[selectedPlatform === 'airwork' ? 'airwork_login' : 'engage_login']?.username || ''}
                          onChange={(e) => setSelectedCustomer({
                            ...selectedCustomer,
                            [selectedPlatform === 'airwork' ? 'airwork_login' : 'engage_login']: {
                              ...selectedCustomer[selectedPlatform === 'airwork' ? 'airwork_login' : 'engage_login'],
                              username: e.target.value
                            }
                          })}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          パスワード
                        </label>
                        <input
                          type="password"
                          value={selectedCustomer[selectedPlatform === 'airwork' ? 'airwork_login' : 'engage_login']?.password || ''}
                          onChange={(e) => setSelectedCustomer({
                            ...selectedCustomer,
                            [selectedPlatform === 'airwork' ? 'airwork_login' : 'engage_login']: {
                              ...selectedCustomer[selectedPlatform === 'airwork' ? 'airwork_login' : 'engage_login'],
                              password: e.target.value
                            }
                          })}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        />
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleAuthCheck(selectedPlatform)}
                    disabled={checkingAuth !== null}
                    className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                  >
                    {checkingAuth ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
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
                      setJobTypes(jobTypes.filter(jt => jt.id !== id));
                      if (activeJobTypeId === id) {
                        setActiveJobTypeId(jobTypes[0].id);
                      }
                    }}
                    onUpdateJobType={(id, updates) => {
                      setJobTypes(jobTypes.map(jt =>
                        jt.id === id ? { ...jt, ...updates } : jt
                      ));
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
      </div>

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
              deliveryDays
            },
            quantity: jobTypes.reduce((sum, job) => sum + job.quantity, 0),
            totalAmount: calculateTotalPrice(deliveryDays, additionalQuantity)
          }}
          onBack={() => setShowPreview(false)}
          onConfirm={() => handleSubmit(false)}
          isSubmitting={isLoading}
        />
      )}
    </div>
  );
};

export default CampaignForm;