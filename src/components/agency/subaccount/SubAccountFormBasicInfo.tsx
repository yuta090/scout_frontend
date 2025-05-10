import React from 'react';
import { Mail, Shield, User, Phone } from 'lucide-react';
import { SubAccountFormData } from '../../../lib/supabase/subaccount';

interface SubAccountFormBasicInfoProps {
  formData: SubAccountFormData;
  setFormData: React.Dispatch<React.SetStateAction<SubAccountFormData>>;
  isLoading: boolean;
}

const SubAccountFormBasicInfo: React.FC<SubAccountFormBasicInfoProps> = ({ 
  formData, 
  setFormData, 
  isLoading 
}) => {
  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
          メールアドレス <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Mail className="h-5 w-5 text-gray-400" />
          </div>
          <input
            id="email"
            type="email"
            required
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="example@company.com"
            disabled={isLoading}
          />
        </div>
      </div>

      <div>
        <label htmlFor="contact_name" className="block text-sm font-medium text-gray-700 mb-1">
          担当者名 <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <User className="h-5 w-5 text-gray-400" />
          </div>
          <input
            id="contact_name"
            type="text"
            required
            value={formData.contact_name}
            onChange={(e) => setFormData({ ...formData, contact_name: e.target.value })}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="山田 太郎"
            disabled={isLoading}
          />
        </div>
      </div>

      <div>
        <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
          電話番号
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Phone className="h-5 w-5 text-gray-400" />
          </div>
          <input
            id="phone"
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="03-1234-5678"
            disabled={isLoading}
          />
        </div>
      </div>

      <div>
        <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
          権限 <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Shield className="h-5 w-5 text-gray-400" />
          </div>
          <select
            id="role"
            required
            value={formData.role}
            onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            disabled={isLoading}
          >
            <option value="admin">管理者（全ての権限）</option>
            <option value="staff">スタッフ（一部制限あり）</option>
            <option value="accounting">経理（閲覧と売上管理）</option>
            <option value="readonly">閲覧のみ</option>
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
          ステータス <span className="text-red-500">*</span>
        </label>
        <select
          id="status"
          required
          value={formData.status}
          onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          disabled={isLoading}
        >
          <option value="active">有効</option>
          <option value="inactive">無効</option>
          <option value="pending">保留中</option>
        </select>
      </div>
    </div>
  );
};

export default SubAccountFormBasicInfo;