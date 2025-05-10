import React from 'react';
import { Phone, Mail } from 'lucide-react';
import { Customer } from '../../lib/types';

interface CustomerContactInfoProps {
  customer: Customer;
}

const CustomerContactInfo: React.FC<CustomerContactInfoProps> = ({ customer }) => {
  return (
    <>
      {customer.phone && (
        <div className="flex items-center text-gray-500">
          <Phone className="h-5 w-5 mr-1" />
          <span>{customer.phone}</span>
        </div>
      )}
      {customer.email && (
        <div className="flex items-center text-gray-500">
          <Mail className="h-5 w-5 mr-1" />
          <span>{customer.email}</span>
        </div>
      )}
    </>
  );
};

export default CustomerContactInfo;