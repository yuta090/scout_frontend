import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { supabase } from '../../lib/supabase';
import { 
  Settings, Save, RefreshCw, Database, 
  Server, Shield, Key, AlertCircle, CheckCircle, Plus,
  User
} from 'lucide-react';
import CreateAdminUser from './CreateAdminUser';
import AdminLayout from './AdminLayout';

const AdminSettings: React.FC = () => {
  const queryClient = useQueryClient();
  const [settings, setSettings] = useState({
    systemName: 'HRaim',
    maxCampaignsPerAgency: 100,
    maxCustomersPerAgency: 50,
    defaultDailyScoutLimit: 500,
    maintenanceMode: false,
    maintenanceMessage: 'システムメンテナンス中です。しばらくお待ちください。',
    apiKeys: {
      airworkApiKey: '',
      engageApiKey: ''
    }
  });
  const [isLoading, setIsLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCreateAdmin, setShowCreateAdmin] = useState(false);

  // 設定データの取得
  const { data: settingsData, isLoading: isSettingsLoading } = useQuery(
    'adminSettings',
    async () => {
      const { data, error } = await supabase
        .from('system_settings')
        .select('*')
        .single();

      if (error) {
        // 設定テーブルがない場合は作成する
        if (error.code === 'PGRST116') {
          return null;
        }
        throw error;
      }
      return data;
    },
    {
      refetchOnWindowFocus: false,
      onSuccess: (data) => {
        if (data) {
          setSettings({
            ...settings,
            ...data.settings
          });
        }
      }
    }
  );

  // 管理者ユーザー一覧の取得
  const { data: adminUsers = [], refetch: refetchAdminUsers } = useQuery(
    'adminUsers',
    async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'admin')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    {
      refetchOnWindowFocus: false
    }
  );

  // 設定保存のミューテーション
  const saveSettingsMutation = useMutation(
    async (newSettings: any) => {
      const { data, error } = await supabase
        .from('system_settings')
        .upsert({ id: 1, settings: newSettings })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    {
      onSuccess: () => {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
        queryClient.invalidateQueries('adminSettings');
      },
      onError: (error: any) => {
        setError(error.message || '設定の保存に失敗しました');
      }
    }
  );

  // 設定の保存
  const handleSaveSettings = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      await saveSettingsMutation.mutateAsync(settings);
    } catch (err) {
      console.error('Settings save error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // 管理者ユーザー作成成功時の処理
  const handleAdminCreated = () => {
    setShowCreateAdmin(false);
    refetchAdminUsers();
  };

  // システム情報の取得
  const { data: systemInfo } = useQuery(
    'adminSystemInfo',
    async () => {
      // 実際のシステム情報取得APIがある場合はそれを使用
      // ここではダミーデータを返す
      return {
        version: '1.0.0',
        databaseSize: '256 MB',
        totalUsers: 125,
        totalCampaigns: 450,
        uptime: '15 days, 7 hours',
        lastBackup: new Date().toISOString()
      };
    },
    {
      refetchOnWindowFocus: false
    }
  );

  // 日付フォーマット
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">システム設定</h1>
          
          <button
            onClick={handleSaveSettings}
            disabled={isLoading}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                保存中...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                設定を保存
              </>
            )}
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md flex items-start">
            <AlertCircle className="h-5 w-5 mr-2 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {saveSuccess && (
          <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-md flex items-center">
            <CheckCircle className="h-5 w-5 mr-2" />
            <span>設定が正常に保存されました</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 基本設定 */}
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center mb-4">
              <Settings className="h-5 w-5 text-indigo-500 mr-2" />
              <h2 className="text-lg font-medium text-gray-900">基本設定</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="systemName" className="block text-sm font-medium text-gray-700 mb-1">
                  システム名
                </label>
                <input
                  type="text"
                  id="systemName"
                  value={settings.systemName}
                  onChange={(e) => setSettings({ ...settings, systemName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              
              <div>
                <label htmlFor="maxCampaignsPerAgency" className="block text-sm font-medium text-gray-700 mb-1">
                  代理店あたりの最大キャンペーン数
                </label>
                <input
                  type="number"
                  id="maxCampaignsPerAgency"
                  value={settings.maxCampaignsPerAgency}
                  onChange={(e) => setSettings({ ...settings, maxCampaignsPerAgency: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              
              <div>
                <label htmlFor="maxCustomersPerAgency" className="block text-sm font-medium text-gray-700 mb-1">
                  代理店あたりの最大顧客数
                </label>
                <input
                  type="number"
                  id="maxCustomersPerAgency"
                  value={settings.maxCustomersPerAgency}
                  onChange={(e) => setSettings({ ...settings, maxCustomersPerAgency: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              
              <div>
                <label htmlFor="defaultDailyScoutLimit" className="block text-sm font-medium text-gray-700 mb-1">
                  デフォルトの1日あたりスカウト上限
                </label>
                <input
                  type="number"
                  id="defaultDailyScoutLimit"
                  value={settings.defaultDailyScoutLimit}
                  onChange={(e) => setSettings({ ...settings, defaultDailyScoutLimit: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* メンテナンス設定 */}
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center mb-4">
              <Server className="h-5 w-5 text-indigo-500 mr-2" />
              <h2 className="text-lg font-medium text-gray-900">メンテナンス設定</h2>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="maintenanceMode"
                  checked={settings.maintenanceMode}
                  onChange={(e) => setSettings({ ...settings, maintenanceMode: e.target.checked })}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label htmlFor="maintenanceMode" className="ml-2 block text-sm text-gray-900">
                  メンテナンスモードを有効にする
                </label>
              </div>
              
              <div>
                <label htmlFor="maintenanceMessage" className="block text-sm font-medium text-gray-700 mb-1">
                  メンテナンスメッセージ
                </label>
                <textarea
                  id="maintenanceMessage"
                  value={settings.maintenanceMessage}
                  onChange={(e) => setSettings({ ...settings, maintenanceMessage: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* API設定 */}
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center mb-4">
              <Key className="h-5 w-5 text-indigo-500 mr-2" />
              <h2 className="text-lg font-medium text-gray-900">API設定</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="airworkApiKey" className="block text-sm font-medium text-gray-700 mb-1">
                  AirWork API キー
                </label>
                <input
                  type="password"
                  id="airworkApiKey"
                  value={settings.apiKeys.airworkApiKey}
                  onChange={(e) => setSettings({ 
                    ...settings, 
                    apiKeys: { ...settings.apiKeys, airworkApiKey: e.target.value } 
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              
              <div>
                <label htmlFor="engageApiKey" className="block text-sm font-medium text-gray-700 mb-1">
                  Engage API キー
                </label>
                <input
                  type="password"
                  id="engageApiKey"
                  value={settings.apiKeys.engageApiKey}
                  onChange={(e) => setSettings({ 
                    ...settings, 
                    apiKeys: { ...settings.apiKeys, engageApiKey: e.target.value } 
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* 管理者ユーザー */}
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <Shield className="h-5 w-5 text-indigo-500 mr-2" />
                <h2 className="text-lg font-medium text-gray-900">管理者ユーザー</h2>
              </div>
              <button
                onClick={() => setShowCreateAdmin(true)}
                className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <Plus className="h-4 w-4 mr-1" />
                管理者追加
              </button>
            </div>
            
            {adminUsers.length > 0 ? (
              <div className="overflow-hidden border border-gray-200 rounded-md">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        名前
                      </th>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        メールアドレス
                      </th>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        登録日
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {adminUsers.map((admin) => (
                      <tr key={admin.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center">
                              <User className="h-4 w-4 text-indigo-600" />
                            </div>
                            <div className="ml-3">
                              <div className="text-sm font-medium text-gray-900">
                                {admin.contact_name || admin.company_name || '名前なし'}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                          {admin.email}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(admin.created_at)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-4 text-gray-500">
                管理者ユーザーが登録されていません
              </div>
            )}
          </div>

          {/* システム情報 */}
          <div className="bg-white shadow rounded-lg p-6 md:col-span-2">
            <div className="flex items-center mb-4">
              <Database className="h-5 w-5 text-indigo-500 mr-2" />
              <h2 className="text-lg font-medium text-gray-900">システム情報</h2>
            </div>
            
            {isSettingsLoading ? (
              <div className="animate-pulse space-y-3">
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-4 bg-gray-200 rounded w-3/5"></div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">バージョン:</span>
                    <span className="text-sm font-medium">{systemInfo?.version}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">データベースサイズ:</span>
                    <span className="text-sm font-medium">{systemInfo?.databaseSize}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">総ユーザー数:</span>
                    <span className="text-sm font-medium">{systemInfo?.totalUsers}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">総キャンペーン数:</span>
                    <span className="text-sm font-medium">{systemInfo?.totalCampaigns}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">稼働時間:</span>
                    <span className="text-sm font-medium">{systemInfo?.uptime}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">最終バックアップ:</span>
                    <span className="text-sm font-medium">{systemInfo?.lastBackup ? formatDate(systemInfo.lastBackup) : '未実行'}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 管理者ユーザー作成モーダル */}
        {showCreateAdmin && (
          <CreateAdminUser
            onClose={() => setShowCreateAdmin(false)}
            onSuccess={handleAdminCreated}
          />
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminSettings;