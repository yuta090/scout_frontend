import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Save, AlertCircle, CheckCircle } from 'lucide-react';

interface SystemSettingsProps {}

interface SystemSettingsData {
  id: number;
  settings: {
    maintenance_mode: boolean;
    maintenance_message: string;
    max_campaigns_per_customer: number;
    max_daily_scouts: number;
    default_price: number;
    weekend_price_multiplier: number;
    night_price_multiplier: number;
    allowed_platforms: string[];
    email_notifications: {
      admin_emails: string[];
      notify_on_campaign_create: boolean;
      notify_on_auth_failure: boolean;
      notify_on_error: boolean;
    };
  };
  created_at: string;
  updated_at: string;
}

const SystemSettings: React.FC<SystemSettingsProps> = () => {
  const [settings, setSettings] = useState<SystemSettingsData['settings'] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('system_settings')
          .select('*')
          .order('id', { ascending: false })
          .limit(1)
          .single();

        if (error) throw error;
        setSettings(data?.settings || getDefaultSettings());
      } catch (err) {
        console.error('Error fetching settings:', err);
        setError('設定の取得に失敗しました');
        setSettings(getDefaultSettings());
      } finally {
        setIsLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const getDefaultSettings = (): SystemSettingsData['settings'] => {
    return {
      maintenance_mode: false,
      maintenance_message: 'システムメンテナンス中です。しばらくお待ちください。',
      max_campaigns_per_customer: 10,
      max_daily_scouts: 500,
      default_price: 50000,
      weekend_price_multiplier: 1.5,
      night_price_multiplier: 1.3,
      allowed_platforms: ['airwork', 'engage'],
      email_notifications: {
        admin_emails: ['admin@example.com'],
        notify_on_campaign_create: true,
        notify_on_auth_failure: true,
        notify_on_error: true
      }
    };
  };

  const handleSave = async () => {
    if (!settings) return;

    try {
      setIsSaving(true);
      setError(null);
      setSuccessMessage(null);

      // 既存の設定を確認
      const { data: existingSettings, error: fetchError } = await supabase
        .from('system_settings')
        .select('id')
        .limit(1);

      if (fetchError) throw fetchError;

      let saveError;
      if (existingSettings && existingSettings.length > 0) {
        // 既存の設定を更新
        const { error } = await supabase
          .from('system_settings')
          .update({ settings })
          .eq('id', existingSettings[0].id);
        saveError = error;
      } else {
        // 新しい設定を作成
        const { error } = await supabase
          .from('system_settings')
          .insert([{ id: 1, settings }]);
        saveError = error;
      }

      if (saveError) throw saveError;

      setSuccessMessage('設定を保存しました');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      console.error('Error saving settings:', err);
      setError('設定の保存に失敗しました');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="h-10 bg-gray-200 rounded"></div>
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="h-10 bg-gray-200 rounded"></div>
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="h-10 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <div className="text-center py-8">
          <AlertCircle className="mx-auto h-12 w-12 text-red-500" />
          <h3 className="mt-2 text-lg font-medium text-gray-900">設定の読み込みに失敗しました</h3>
          <p className="mt-1 text-sm text-gray-500">再読み込みしてお試しください</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <div className="px-4 py-5 sm:px-6">
        <h2 className="text-lg font-medium text-gray-900">システム設定</h2>
        <p className="mt-1 text-sm text-gray-500">
          システム全体の設定を管理します
        </p>
      </div>

      <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md flex items-start">
            <AlertCircle className="h-5 w-5 text-red-400 mt-0.5 mr-2" />
            <span className="text-sm text-red-700">{error}</span>
          </div>
        )}

        {successMessage && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-md flex items-start">
            <CheckCircle className="h-5 w-5 text-green-400 mt-0.5 mr-2" />
            <span className="text-sm text-green-700">{successMessage}</span>
          </div>
        )}

        <div className="space-y-6">
          {/* メンテナンスモード設定 */}
          <div>
            <h3 className="text-base font-medium text-gray-900 mb-4">メンテナンス設定</h3>
            <div className="space-y-4">
              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    id="maintenance_mode"
                    type="checkbox"
                    checked={settings.maintenance_mode}
                    onChange={(e) => setSettings({
                      ...settings,
                      maintenance_mode: e.target.checked
                    })}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label htmlFor="maintenance_mode" className="font-medium text-gray-700">メンテナンスモード</label>
                  <p className="text-gray-500">有効にすると、管理者以外のユーザーはシステムにアクセスできなくなります</p>
                </div>
              </div>

              <div>
                <label htmlFor="maintenance_message" className="block text-sm font-medium text-gray-700">
                  メンテナンスメッセージ
                </label>
                <textarea
                  id="maintenance_message"
                  rows={3}
                  value={settings.maintenance_message}
                  onChange={(e) => setSettings({
                    ...settings,
                    maintenance_message: e.target.value
                  })}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
            </div>
          </div>

          {/* 制限設定 */}
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-base font-medium text-gray-900 mb-4">制限設定</h3>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label htmlFor="max_campaigns" className="block text-sm font-medium text-gray-700">
                  顧客あたりの最大キャンペーン数
                </label>
                <input
                  type="number"
                  id="max_campaigns"
                  min="1"
                  value={settings.max_campaigns_per_customer}
                  onChange={(e) => setSettings({
                    ...settings,
                    max_campaigns_per_customer: parseInt(e.target.value) || 1
                  })}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>

              <div>
                <label htmlFor="max_daily_scouts" className="block text-sm font-medium text-gray-700">
                  1日あたりの最大スカウト数
                </label>
                <input
                  type="number"
                  id="max_daily_scouts"
                  min="1"
                  value={settings.max_daily_scouts}
                  onChange={(e) => setSettings({
                    ...settings,
                    max_daily_scouts: parseInt(e.target.value) || 1
                  })}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
            </div>
          </div>

          {/* 料金設定 */}
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-base font-medium text-gray-900 mb-4">料金設定</h3>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
              <div>
                <label htmlFor="default_price" className="block text-sm font-medium text-gray-700">
                  基本料金（円）
                </label>
                <input
                  type="number"
                  id="default_price"
                  min="0"
                  value={settings.default_price}
                  onChange={(e) => setSettings({
                    ...settings,
                    default_price: parseInt(e.target.value) || 0
                  })}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>

              <div>
                <label htmlFor="weekend_multiplier" className="block text-sm font-medium text-gray-700">
                  休日料金倍率
                </label>
                <input
                  type="number"
                  id="weekend_multiplier"
                  min="1"
                  step="0.1"
                  value={settings.weekend_price_multiplier}
                  onChange={(e) => setSettings({
                    ...settings,
                    weekend_price_multiplier: parseFloat(e.target.value) || 1
                  })}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>

              <div>
                <label htmlFor="night_multiplier" className="block text-sm font-medium text-gray-700">
                  夜間料金倍率
                </label>
                <input
                  type="number"
                  id="night_multiplier"
                  min="1"
                  step="0.1"
                  value={settings.night_price_multiplier}
                  onChange={(e) => setSettings({
                    ...settings,
                    night_price_multiplier: parseFloat(e.target.value) || 1
                  })}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
            </div>
          </div>

          {/* プラットフォーム設定 */}
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-base font-medium text-gray-900 mb-4">プラットフォーム設定</h3>
            <div className="space-y-4">
              <div>
                <span className="text-sm font-medium text-gray-700">利用可能なプラットフォーム</span>
                <div className="mt-2 space-x-4">
                  <label className="inline-flex items-center">
                    <input
                      type="checkbox"
                      checked={settings.allowed_platforms.includes('airwork')}
                      onChange={(e) => {
                        const newPlatforms = e.target.checked
                          ? [...settings.allowed_platforms, 'airwork']
                          : settings.allowed_platforms.filter(p => p !== 'airwork');
                        setSettings({
                          ...settings,
                          allowed_platforms: newPlatforms
                        });
                      }}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">Airワーク</span>
                  </label>
                  <label className="inline-flex items-center">
                    <input
                      type="checkbox"
                      checked={settings.allowed_platforms.includes('engage')}
                      onChange={(e) => {
                        const newPlatforms = e.target.checked
                          ? [...settings.allowed_platforms, 'engage']
                          : settings.allowed_platforms.filter(p => p !== 'engage');
                        setSettings({
                          ...settings,
                          allowed_platforms: newPlatforms
                        });
                      }}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">Engage</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* メール通知設定 */}
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-base font-medium text-gray-900 mb-4">メール通知設定</h3>
            <div className="space-y-4">
              <div>
                <label htmlFor="admin_emails" className="block text-sm font-medium text-gray-700">
                  管理者メールアドレス（カンマ区切り）
                </label>
                <input
                  type="text"
                  id="admin_emails"
                  value={settings.email_notifications.admin_emails.join(', ')}
                  onChange={(e) => {
                    const emails = e.target.value.split(',').map(email => email.trim()).filter(Boolean);
                    setSettings({
                      ...settings,
                      email_notifications: {
                        ...settings.email_notifications,
                        admin_emails: emails
                      }
                    });
                  }}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-start">
                  <div className="flex items-center h-5">
                    <input
                      id="notify_campaign"
                      type="checkbox"
                      checked={settings.email_notifications.notify_on_campaign_create}
                      onChange={(e) => setSettings({
                        ...settings,
                        email_notifications: {
                          ...settings.email_notifications,
                          notify_on_campaign_create: e.target.checked
                        }
                      })}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                  </div>
                  <div className="ml-3 text-sm">
                    <label htmlFor="notify_campaign" className="font-medium text-gray-700">キャンペーン作成時に通知</label>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="flex items-center h-5">
                    <input
                      id="notify_auth"
                      type="checkbox"
                      checked={settings.email_notifications.notify_on_auth_failure}
                      onChange={(e) => setSettings({
                        ...settings,
                        email_notifications: {
                          ...settings.email_notifications,
                          notify_on_auth_failure: e.target.checked
                        }
                      })}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                  </div>
                  <div className="ml-3 text-sm">
                    <label htmlFor="notify_auth" className="font-medium text-gray-700">認証失敗時に通知</label>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="flex items-center h-5">
                    <input
                      id="notify_error"
                      type="checkbox"
                      checked={settings.email_notifications.notify_on_error}
                      onChange={(e) => setSettings({
                        ...settings,
                        email_notifications: {
                          ...settings.email_notifications,
                          notify_on_error: e.target.checked
                        }
                      })}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                  </div>
                  <div className="ml-3 text-sm">
                    <label htmlFor="notify_error" className="font-medium text-gray-700">エラー発生時に通知</label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 py-3 bg-gray-50 text-right sm:px-6">
        <button
          type="button"
          onClick={handleSave}
          disabled={isSaving}
          className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
        >
          {isSaving ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              保存中...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              保存
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default SystemSettings;