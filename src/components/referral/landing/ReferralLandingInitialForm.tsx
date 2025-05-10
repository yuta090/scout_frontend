import React from 'react';
import { Building2, User } from 'lucide-react';

interface ReferralSettings {
  id: number;
  title: string;
  description: string;
  hero_images: string[];
  document_urls: string[];
  form_title: string;
  form_description: string;
  default_agency_id: string | null;
}

interface ReferralLandingInitialFormProps {
  initialFormData: {
    company_name: string;
    contact_name: string;
  };
  setInitialFormData: React.Dispatch<React.SetStateAction<{
    company_name: string;
    contact_name: string;
  }>>;
  formErrors: Record<string, string>;
  settings: ReferralSettings;
  onSubmit: (e: React.FormEvent) => void;
}

const ReferralLandingInitialForm: React.FC<ReferralLandingInitialFormProps> = ({
  initialFormData,
  setInitialFormData,
  formErrors,
  settings,
  onSubmit
}) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-8">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            {settings.title}
          </h1>
          <p className="mt-2 text-gray-600">
            続けるには以下の情報を入力してください
          </p>
        </div>
        
        <form onSubmit={onSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="initial_company_name" className="block text-sm font-medium text-gray-700 mb-1">
                会社名 <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Building2 className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="initial_company_name"
                  type="text"
                  value={initialFormData.company_name}
                  onChange={(e) => setInitialFormData({ ...initialFormData, company_name: e.target.value })}
                  className={`w-full pl-10 pr-4 py-2 border ${formErrors.company_name ? 'border-red-300' : 'border-gray-300'} rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500`}
                  placeholder="株式会社〇〇"
                />
              </div>
              {formErrors.company_name && (
                <p className="mt-1 text-sm text-red-600">{formErrors.company_name}</p>
              )}
            </div>

            <div>
              <label htmlFor="initial_contact_name" className="block text-sm font-medium text-gray-700 mb-1">
                お名前 <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="initial_contact_name"
                  type="text"
                  value={initialFormData.contact_name}
                  onChange={(e) => setInitialFormData({ ...initialFormData, contact_name: e.target.value })}
                  className={`w-full pl-10 pr-4 py-2 border ${formErrors.contact_name ? 'border-red-300' : 'border-gray-300'} rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500`}
                  placeholder="山田 太郎"
                />
              </div>
              {formErrors.contact_name && (
                <p className="mt-1 text-sm text-red-600">{formErrors.contact_name}</p>
              )}
            </div>
            
            <button
              type="submit"
              className="w-full mt-4 bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors"
            >
              続ける
            </button>
          </div>
        </form>
        
        <div className="mt-6 text-center text-sm text-gray-500">
          <p>
            ご入力いただいた情報は紹介プログラムの目的にのみ使用されます
          </p>
        </div>
      </div>
    </div>
  );
};

export default ReferralLandingInitialForm;