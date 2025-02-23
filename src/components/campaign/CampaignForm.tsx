import React, { useState, useEffect } from 'react';
import { X, CheckCircle, Eye } from 'lucide-react';
import { supabase, type Customer, type Campaign } from '../../lib/supabase';
import CustomerSelector from './sections/CustomerSelector';
import BasicInfoSection from './sections/BasicInfoSection';
import JobTypeSection from './sections/JobTypeSection';
import DeliveryPeriodSection from './sections/DeliveryPeriodSection';
import DeliveryScheduleSection from './sections/DeliveryScheduleSection';
import FloatingErrorSummary from './components/FloatingErrorSummary';
import CampaignPreview from './CampaignPreview';
import { JobType, DeliveryDays } from './types';
import { useFormValidation } from './hooks/useFormValidation';
import { calculateTotalPrice } from './utils';

interface CampaignFormProps {
  customerId?: string;
  campaign?: Campaign;
  onClose: () => void;
  onSave?: () => void;
}

const CampaignForm: React.FC<CampaignFormProps> = ({ customerId, campaign, onClose, onSave }) => {
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [selectedPlatform, setSelectedPlatform] = useState<'airwork' | 'engage' | null>(null);
  const [jobTypes, setJobTypes] = useState<JobType[]>([{
    id: `job-${Date.now()}`,
    name: '',
    locations: [],
    quantity: 100
  }]);
  const [activeJobTypeId, setActiveJobTypeId] = useState<string>(jobTypes[0].id);
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);

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

  const handlePreview = async () => {
    const isValid = await validateForm();
    if (!isValid) return;
    setShowPreview(true);
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;

    setIsSubmitting(true);
    clearErrors();

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('認証エラー');

      const campaignData = {
        customer_id: selectedCustomer?.id,
        agency_id: user.id,
        title: formData.title,
        description: formData.description || '',
        job_details: {
          platform: selectedPlatform,
          job_type: jobTypes.map(jt => ({
            name: jt.name,
            locations: jt.locations
          })),
          quantity: jobTypes.map(jt => jt.quantity)
        },
        quantity: jobTypes.reduce((sum, job) => sum + job.quantity, 0),
        status: 'draft',
        options: {
          schedule: {
            start_date: startDate,
            end_date: endDate,
            delivery_days: deliveryDays,
            daily_limit: 500
          },
          message_template: ''
        },
        total_amount: calculateTotalPrice(deliveryDays, additionalQuantity)
      };

      const { error: saveError } = await supabase
        .from('campaigns')
        .insert([campaignData]);

      if (saveError) throw saveError;

      setSuccessMessage('スカウト依頼を作成しました');
      
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
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-[100]">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto animate-slideDown">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">
            新規スカウト依頼作成
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 focus:outline-none"
            disabled={isSubmitting}
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

              {selectedPlatform && (
                <>
                  <JobTypeSection
                    jobTypes={jobTypes}
                    activeJobTypeId={activeJobTypeId}
                    customerId={selectedCustomer?.id}
                    onAddJobType={() => {
                      const newJobType = {
                        id: `job-${Date.now()}`,
                        name: '',
                        locations: [],
                        quantity: 100
                      };
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
                  onClick={handlePreview}
                  disabled={isSubmitting || !selectedCustomer}
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
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
    </div>
  );
};

export default CampaignForm;