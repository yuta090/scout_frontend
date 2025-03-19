import { useState, useCallback } from 'react';
import { Customer } from '../../../lib/supabase';
import { JobType, DeliveryDays } from '../types';

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
  title,
  selectedPlatform,
  jobTypes,
  startDate,
  endDate,
  deliveryDays
}: UseFormValidationProps) => {
  const [errors, setErrors] = useState<ValidationErrors>({});

  const validateForm = useCallback(async () => {
    const newErrors: ValidationErrors = {};

    // 顧客のバリデーション
    if (!selectedCustomer) {
      newErrors.customer = ['顧客を選択してください'];
    }

    // 基本情報のバリデーション
    if (!selectedPlatform) {
      if (!newErrors.basicInfo) {
        newErrors.basicInfo = { title: [], platform: [] };
      }
      newErrors.basicInfo.platform = ['プラットフォームを選択してください'];
    }

    // 職種情報のバリデーション
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

    // 配信スケジュールのバリデーション
    if (!startDate || !endDate) {
      newErrors.deliverySchedule = {
        period: ['送信期間を設定してください'],
        days: []
      };
    }

    // 配信曜日のバリデーション
    const hasDeliveryDay = Object.values(deliveryDays).some(day => day.checked);
    if (!hasDeliveryDay) {
      if (!newErrors.deliverySchedule) {
        newErrors.deliverySchedule = { period: [], days: [] };
      }
      newErrors.deliverySchedule.days = ['配信曜日を1日以上選択してください'];
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [selectedCustomer, title, selectedPlatform, jobTypes, startDate, endDate, deliveryDays]);

  return {
    errors,
    validateForm,
    setErrors
  };
};