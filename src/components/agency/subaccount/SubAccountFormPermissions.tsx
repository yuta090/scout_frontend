import React from 'react';
import { SubAccountFormData } from '../../../lib/supabase/subaccount';

interface SubAccountFormPermissionsProps {
  formData: SubAccountFormData;
  setFormData: React.Dispatch<React.SetStateAction<SubAccountFormData>>;
}

const SubAccountFormPermissions: React.FC<SubAccountFormPermissionsProps> = ({
  formData,
  setFormData
}) => {
  // スイッチコンポーネント
  const Switch = ({ checked, onChange, disabled = false }: { checked: boolean; onChange: (checked: boolean) => void; disabled?: boolean }) => (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => !disabled && onChange(!checked)}
      className={`
        relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2
        ${checked ? 'bg-indigo-600' : 'bg-gray-200'}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
      `}
    >
      <span
        className={`
          inline-block h-4 w-4 transform rounded-full bg-white transition-transform
          ${checked ? 'translate-x-6' : 'translate-x-1'}
        `}
      />
    </button>
  );

  return (
    <div className="space-y-6 border-t border-gray-200 pt-4">
      <h3 className="text-lg font-medium text-gray-900 bg-gray-50 p-2 rounded-md">詳細権限設定</h3>
      
      <div className="space-y-2">
        <h4 className="text-base font-medium text-gray-700 bg-gray-100 p-1.5 rounded">顧客管理</h4>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center justify-between">
            <label className="text-sm text-gray-700">閲覧</label>
            <Switch
              checked={formData.permissions.customers.view}
              onChange={(checked) => setFormData({
                ...formData,
                permissions: {
                  ...formData.permissions,
                  customers: {
                    ...formData.permissions.customers,
                    view: checked
                  }
                }
              })}
            />
          </div>
          <div className="flex items-center justify-between">
            <label className="text-sm text-gray-700">作成</label>
            <Switch
              checked={formData.permissions.customers.create}
              onChange={(checked) => setFormData({
                ...formData,
                permissions: {
                  ...formData.permissions,
                  customers: {
                    ...formData.permissions.customers,
                    create: checked
                  }
                }
              })}
            />
          </div>
          <div className="flex items-center justify-between">
            <label className="text-sm text-gray-700">編集</label>
            <Switch
              checked={formData.permissions.customers.edit}
              onChange={(checked) => setFormData({
                ...formData,
                permissions: {
                  ...formData.permissions,
                  customers: {
                    ...formData.permissions.customers,
                    edit: checked
                  }
                }
              })}
            />
          </div>
          <div className="flex items-center justify-between">
            <label className="text-sm text-gray-700">削除</label>
            <Switch
              checked={formData.permissions.customers.delete}
              onChange={(checked) => setFormData({
                ...formData,
                permissions: {
                  ...formData.permissions,
                  customers: {
                    ...formData.permissions.customers,
                    delete: checked
                  }
                }
              })}
            />
          </div>
        </div>
      </div>
      
      <div className="space-y-2">
        <h4 className="text-base font-medium text-gray-700 bg-gray-100 p-1.5 rounded">キャンペーン管理</h4>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center justify-between">
            <label className="text-sm text-gray-700">閲覧</label>
            <Switch
              checked={formData.permissions.campaigns.view}
              onChange={(checked) => setFormData({
                ...formData,
                permissions: {
                  ...formData.permissions,
                  campaigns: {
                    ...formData.permissions.campaigns,
                    view: checked
                  }
                }
              })}
            />
          </div>
          <div className="flex items-center justify-between">
            <label className="text-sm text-gray-700">作成</label>
            <Switch
              checked={formData.permissions.campaigns.create}
              onChange={(checked) => setFormData({
                ...formData,
                permissions: {
                  ...formData.permissions,
                  campaigns: {
                    ...formData.permissions.campaigns,
                    create: checked
                  }
                }
              })}
            />
          </div>
          <div className="flex items-center justify-between">
            <label className="text-sm text-gray-700">編集</label>
            <Switch
              checked={formData.permissions.campaigns.edit}
              onChange={(checked) => setFormData({
                ...formData,
                permissions: {
                  ...formData.permissions,
                  campaigns: {
                    ...formData.permissions.campaigns,
                    edit: checked
                  }
                }
              })}
            />
          </div>
          <div className="flex items-center justify-between">
            <label className="text-sm text-gray-700">削除</label>
            <Switch
              checked={formData.permissions.campaigns.delete}
              onChange={(checked) => setFormData({
                ...formData,
                permissions: {
                  ...formData.permissions,
                  campaigns: {
                    ...formData.permissions.campaigns,
                    delete: checked
                  }
                }
              })}
            />
          </div>
        </div>
      </div>
      
      <div className="space-y-2">
        <h4 className="text-base font-medium text-gray-700 bg-gray-100 p-1.5 rounded">全キャンペーン閲覧</h4>
        <div className="flex items-center justify-between">
          <label className="text-sm text-gray-700">他のスタッフのキャンペーンも閲覧可能</label>
          <Switch
            checked={formData.permissions.view_all_campaigns}
            onChange={(checked) => setFormData({
              ...formData,
              permissions: {
                ...formData.permissions,
                view_all_campaigns: checked
              }
            })}
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <h4 className="text-base font-medium text-gray-700 bg-gray-100 p-1.5 rounded">レポート</h4>
        <div className="flex items-center justify-between">
          <label className="text-sm text-gray-700">閲覧</label>
          <Switch
            checked={formData.permissions.reports.view}
            onChange={(checked) => setFormData({
              ...formData,
              permissions: {
                ...formData.permissions,
                reports: {
                  view: checked
                }
              }
            })}
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <h4 className="text-base font-medium text-gray-700 bg-gray-100 p-1.5 rounded">請求情報</h4>
        <div className="flex items-center justify-between">
          <label className="text-sm text-gray-700">閲覧</label>
          <Switch
            checked={formData.permissions.billing.view}
            onChange={(checked) => setFormData({
              ...formData,
              permissions: {
                ...formData.permissions,
                billing: {
                  ...formData.permissions.billing,
                  view: checked
                }
              }
            })}
          />
        </div>
        <div className="flex items-center justify-between mt-2">
          <label className="text-sm text-gray-700">全ての顧客の請求情報を閲覧</label>
          <Switch
            checked={formData.permissions.billing.view_all_customers}
            onChange={(checked) => setFormData({
              ...formData,
              permissions: {
                ...formData.permissions,
                billing: {
                  ...formData.permissions.billing,
                  view_all_customers: checked
                }
              }
            })}
            disabled={!formData.permissions.billing.view}
          />
        </div>
        {!formData.permissions.billing.view && (
          <p className="text-xs text-amber-600 mt-1">
            請求情報の閲覧権限がないため、全顧客の請求情報閲覧権限は無効化されています
          </p>
        )}
      </div>
    </div>
  );
};

export default SubAccountFormPermissions;