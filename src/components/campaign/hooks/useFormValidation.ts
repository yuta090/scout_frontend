import { useCallback, useState } from 'react';
import { Customer } from '../../../lib/supabase';
import { JobType, DeliveryDays } from '../types';
import { supabase } from '../../../lib/supabase';

export interface ValidationErrors {
  customer?: string[];
  basicInfo?: {
    title: string[];
    platform: string[];
  };
  jobTypes?: {
    [key: string]: {
      name: string[];
      locations: string[];
      quantity: string[];
    };
  };
  deliverySchedule?: {
    period: string[];
    days: string[];
  };
  total?: string[];
}

interface UseFormValidationProps {
  selectedCustomer: Customer | null;
  title: string;
  selectedPlatform: 'airwork' | 'engage' | null;
  jobTypes: JobType[];
  startDate: string;
  endDate: string;
  deliveryDays: DeliveryDays;
}

export const useFormValidation = ({
  selectedCustomer,
  selectedPlatform,
  jobTypes,
  startDate,
  endDate,
  deliveryDays
}: UseFormValidationProps) => {
  const [errors, setErrors] = useState<ValidationErrors>({});

  const clearErrors = useCallback(() => {
    setErrors({});
  }, []);

  const validateTotalQuantity = useCallback(() => {
    const totalErrors: string[] = [];
    const totalQuantity = jobTypes.reduce((sum, job) => sum + job.quantity, 0);

    if (totalQuantity === 0) {
      totalErrors.push('スカウト送信数を設定してください');
    }

    return totalErrors;
  }, [jobTypes]);

  const validateDuplication = useCallback(async () => {
    if (!selectedCustomer || !startDate || !endDate) return [];

    const duplicateErrors: string[] = [];

    try {
      const { data: existingCampaigns } = await supabase
        .from('campaigns')
        .select('title, options')
        .eq('customer_id', selectedCustomer.id)
        .in('status', ['draft', 'pending', 'approved', 'in_progress']);

      if (existingCampaigns) {
        const newStartDate = new Date(startDate);
        const newEndDate = new Date(endDate);

        const overlappingCampaigns = existingCampaigns.filter(campaign => {
          const campaignStartDate = new Date(campaign.options?.schedule?.start_date);
          const campaignEndDate = new Date(campaign.options?.schedule?.end_date);

          return (
            newStartDate <= campaignEndDate &&
            newEndDate >= campaignStartDate
          );
        });

        if (overlappingCampaigns.length > 0) {
          const campaignDetails = overlappingCampaigns.map(campaign => {
            const startDate = new Date(campaign.options.schedule.start_date)
              .toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric' });
            const endDate = new Date(campaign.options.schedule.end_date)
              .toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric' });
            return `「${campaign.title}」(${startDate} 〜 ${endDate})`;
          });
          
          duplicateErrors.push(
            `この期間に重複するスカウト依頼があります:\n${campaignDetails.join('\n')}`
          );
        }
      }

      const jobTypeNames = jobTypes.map(jt => jt.name.toLowerCase().trim());
      const uniqueNames = new Set(jobTypeNames);
      if (uniqueNames.size !== jobTypeNames.length) {
        duplicateErrors.push('同一スカウト依頼内で同じ名前の職種が存在します');
      }

    } catch (err) {
      console.error('Duplication check error:', err);
      duplicateErrors.push('重複チェックの実行中にエラーが発生しました');
    }

    return duplicateErrors;
  }, [selectedCustomer, jobTypes, startDate, endDate]);

  const validateForm = useCallback(async () => {
    const newErrors: ValidationErrors = {};

    if (!selectedCustomer) {
      newErrors.customer = ['顧客を選択してください'];
    }

    if (!selectedPlatform) {
      if (!newErrors.basicInfo) {
        newErrors.basicInfo = { title: [], platform: [] };
      }
      newErrors.basicInfo.platform = ['プラットフォームを選択してください'];
    }

    const jobTypeErrors: ValidationErrors['jobTypes'] = {};
    jobTypes.forEach(jobType => {
      const errors = {
        name: [] as string[],
        locations: [] as string[],
        quantity: [] as string[]
      };

      if (!jobType.name.trim()) {
        errors.name.push('職種名を入力してください');
      }
      if (jobType.locations.length === 0) {
        errors.locations.push('勤務地を選択してください');
      }
      if (jobType.quantity <= 0) {
        errors.quantity.push('送信数は1以上を指定してください');
      }

      if (errors.name.length > 0 || errors.locations.length > 0 || errors.quantity.length > 0) {
        jobTypeErrors[jobType.id] = errors;
      }
    });

    if (Object.keys(jobTypeErrors).length > 0) {
      newErrors.jobTypes = jobTypeErrors;
    }

    if (!startDate || !endDate) {
      newErrors.deliverySchedule = {
        period: ['送信期間を設定してください'],
        days: []
      };
    }

    const totalErrors = validateTotalQuantity();
    if (totalErrors.length > 0) {
      newErrors.total = totalErrors;
    }

    const duplicateErrors = await validateDuplication();
    if (duplicateErrors.length > 0) {
      if (!newErrors.total) {
        newErrors.total = [];
      }
      newErrors.total.push(...duplicateErrors);
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [
    selectedCustomer,
    selectedPlatform,
    jobTypes,
    startDate,
    endDate,
    validateTotalQuantity,
    validateDuplication
  ]);

  return {
    errors,
    validateForm,
    clearErrors,
    setErrors
  };
};