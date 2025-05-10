import React from 'react';
import AuthStatusBadge from './AuthStatusBadge';
import AuthCheckButton from './AuthCheckButton';
import { Customer } from '../../lib/types';

interface CustomerAuthSectionProps {
  customer: Customer;
  platform: 'airwork' | 'engage';
  onAuthCheck: (customer: Customer, platform: 'airwork' | 'engage') => void;
  isLoading: boolean;
}

const CustomerAuthSection: React.FC<CustomerAuthSectionProps> = ({
  customer,
  platform,
  onAuthCheck,
  isLoading
}) => {
  const status = platform === 'airwork' 
    ? customer.airwork_auth_status 
    : customer.engage_auth_status;
  
  const platformName = platform === 'airwork' ? 'AirWork' : 'Engage';

  return (
    <div className="flex items-center">
      <span className="text-sm text-gray-500 mr-1">{platformName}:</span>
      <div className="flex items-center">
        <AuthStatusBadge status={status} platform={platform} />
      </div>
      {status !== 'authenticated' && (
        <AuthCheckButton 
          onClick={() => onAuthCheck(customer, platform)} 
          isLoading={isLoading} 
        />
      )}
    </div>
  );
};

export default CustomerAuthSection;