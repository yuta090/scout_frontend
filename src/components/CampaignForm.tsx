import React, { useState, useEffect } from 'react';
import { X, CheckCircle, Eye, FileText } from 'lucide-react';
import { supabase, type Customer, type Campaign } from '../lib/supabase';
import CustomerSelector from './campaign/sections/CustomerSelector';
import BasicInfoSection from './campaign/sections/BasicInfoSection';
import JobTypeSection from './campaign/sections/JobTypeSection';
import DeliveryPeriodSection from './campaign/sections/DeliveryPeriodSection';
import DeliveryScheduleSection from './campaign/sections/DeliveryScheduleSection';
import FloatingErrorSummary from './campaign/components/FloatingErrorSummary';
import CampaignPreview from './campaign/CampaignPreview';
import { JobType, DeliveryDays } from './campaign/types';
import { useFormValidation } from './campaign/hooks/useFormValidation';
import { calculateTotalPrice } from './campaign/utils';

interface CampaignFormProps {
  customerId?: string;
  campaign?: Campaign;
  onClose: () => void;
  onSave?: () => void;
}

const CampaignForm: React.FC<CampaignFormProps> = ({ customerId, campaign, onClose, onSave }) => {
  // 既存のコードは変更なし...
};

export default CampaignForm;