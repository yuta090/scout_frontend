import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { supabase } from '../../lib/supabase';
import { 
  Save, RefreshCw, Link, Image, FileText, 
  AlertCircle, CheckCircle, Edit, Eye, ExternalLink, Plus, Trash2, Building2
} from 'lucide-react';
import AdminLayout from './AdminLayout';

interface ReferralSettings {
  id: number;
  title: string;
  description: string;
  hero_images: string[];
  document_urls: string[];
  form_title: string;
  form_description: string;
  default_agency_id: string | null;
  created_at: string;
  updated_at: string;
}

interface Agency {
  id: string;
  company_name: string;
  email: string;
}

const AdminReferralSettings: React.FC = () => {
  const queryClient = useQueryClient();
  const [settings, setSettings] = useState<ReferralSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // 代理店一覧の取得
  const { data: agencies = [], isLoading: isAgenciesLoading } = useQuery(
    'adminAgencyList',
    async () => {
      console.log('代理店一覧を取得中...');
      
      try {
        // 管理者用の関数を使用して代理店一覧を取得
        const { data, error } = await supabase
          .rpc('get_admin_agency_list');
        
        if (error) {
          console.error('代理店一覧取得エラー (RPC):', error);
          throw error;
        }
        
        console.log(`RPC経由で取得した代理店: ${data?.length || 0}件`, data);
        return data || [];
      } catch (rpcError) {
        console.error('RPC呼び出しエラー:', rpcError);
        
        // フォールバック: 直接クエリを実行
        try {
          console.log('フォールバック: 直接クエリで代理店一覧を取得中...');
          const { data, error } = await supabase
            .from('profiles')
            .select('id, company_name, email')
            .eq('role', 'agency')
            .order('company_name', { ascending: true });
            
          if (error) {
            console.error('代理店一覧取得エラー (直接クエリ):', error);
            throw error;
          }
          
          console.log(`直接クエリで取得した代理店: ${data?.length || 0}件`, data);
          return data || [];
        } catch (directQueryError) {
          console.error('直接クエリでも失敗:', directQueryError);
          throw directQueryError;
        }
      }
    },
    {
      refetchOnWindowFocus: false,
      staleTime: 60000, // 1分間はデータを新鮮と見なす
      retry: 3,
      retryDelay: 1000
    }
  );

  // 紹介設定の取得
  const { data: settingsData, isLoading: isSettingsLoading, refetch } = useQuery(
    'referralSettings',
    async () => {
      console.log('紹介設定を取得中...');
      const { data, error } = await supabase
        .from('referral_settings')
        .select('*')
        .limit(1)
        .single();

      if (error) {
        // 設定テーブルがない場合は作成する
        if (error.code === 'PGRST116') {
          console.log('紹介設定が見つかりません。デフォルト値を使用します。');
          return null;
        }
        console.error('紹介設定取得エラー:', error);
        throw error;
      }
      
      console.log('紹介設定取得成功:', data);
      return data;
    },
    {
      refetchOnWindowFocus: false,
      onSuccess: (data) => {
        if (data) {
          // 既存のデータを新しい形式に変換
          const heroImages = data.hero_image_url 
            ? [data.hero_image_url] 
            : [];
          
          const documentUrls = data.document_url 
            ? [data.document_url] 
            : [];
            
          // hero_imagesとdocument_urlsが配列の場合はそのまま使用
          const formattedData = {
            ...data,
            hero_images: data.hero_images || heroImages,
            document_urls: data.document_urls || documentUrls
          };
          
          setSettings(formattedData);
        } else {
          // デフォルト値を設定
          setSettings({
            id: 1,
            title: 'スカウトサービス代理店紹介プログラム',
            description: 'スカウトサービスの代理店紹介プログラムにご参加いただくと、紹介料として成約金額の10%をお支払いいたします。',
            hero_images: ['https://images.unsplash.com/photo-1521791136064-7986c2920216?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1950&q=80'],
            document_urls: [],
            form_title: 'お申し込みフォーム',
            form_description: 'お申し込み情報をご入力ください。担当者より折り返しご連絡いたします。',
            default_agency_id: null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });
        }
        
        setIsLoading(false);
      }
    }
  );

  // 設定保存のミューテーション
  const saveSettingsMutation = useMutation(
    async (newSettings: Partial<ReferralSettings>) => {
      console.log('紹介設定を保存中...', newSettings);
      const { data, error } = await supabase
        .from('referral_settings')
        .upsert({ 
          id: 1, 
          ...newSettings,
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        console.error('紹介設定保存エラー:', error);
        throw error;
      }
      
      console.log('紹介設定保存成功:', data);
      return data;
    },
    {
      onSuccess: () => {
        setSuccessMessage('設定を保存しました');
        setTimeout(() => setSuccessMessage(null), 3000);
        queryClient.invalidateQueries('referralSettings');
        refetch();
      },
      onError: (error: any) => {
        setError(error.message || '設定の保存に失敗しました');
      }
    }
  );

  // 設定の保存
  const handleSaveSettings = async () => {
    if (!settings) return;
    
    setIsSaving(true);
    setError(null);
    
    try {
      await saveSettingsMutation.mutateAsync(settings);
    } catch (err) {
      console.error('Settings save error:', err);
    } finally {
      setIsSaving(false);
    }
  };

  // プレビューURLの生成
  useEffect(() => {
    // 取次代理店のIDを取得（ここではダミーのUUIDを使用）
    const dummyAgentId = '00000000-0000-0000-0000-000000000000';
    const baseUrl = window.location.origin;
    setPreviewUrl(`${baseUrl}/entry?ref=${dummyAgentId}`);
  }, []);

  // プレビューを開く
  const openPreview = () => {
    window.open(previewUrl, '_blank');
  };

  // 画像URLを追加
  const addHeroImage = () => {
    if (!settings) return;
    setSettings({
      ...settings,
      hero_images: [...settings.hero_images, '']
    });
  };

  // 画像URLを削除
  const removeHeroImage = (index: number) => {
    if (!settings) return;
    const newImages = [...settings.hero_images];
    newImages.splice(index, 1);
    setSettings({
      ...settings,
      hero_images: newImages
    });
  };

  // 画像URLを更新
  const updateHeroImage = (index: number, url: string) => {
    if (!settings) return;
    const newImages = [...settings.hero_images];
    newImages[index] = url;
    setSettings({
      ...settings,
      hero_images: newImages
    });
  };

  // ドキュメントURLを追加
  const addDocumentUrl = () => {
    if (!settings) return;
    setSettings({
      ...settings,
      document_urls: [...settings.document_urls, '']
    });
  };

  // ドキュメントURLを削除
  const removeDocumentUrl = (index: number) => {
    if (!settings) return;
    const newUrls = [...settings.document_urls];
    newUrls.splice(index, 1);
    setSettings({
      ...settings,
      document_urls: newUrls
    });
  };

  // ドキュメントURLを更新
  const updateDocumentUrl = (index: number, url: string) => {
    if (!settings) return;
    const newUrls = [...settings.document_urls];
    newUrls[index] = url;
    setSettings({
      ...settings,
      document_urls: newUrls
    });
  };

  // デフォルト代理店の変更
  const handleDefaultAgencyChange = (agencyId: string) => {
    if (!settings) return;
    setSettings({
      ...settings,
      default_agency_id: agencyId === '' ? null : agencyId
    });
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">紹介リンク設定</h1>
          
          <div className="flex items-center space-x-4">
            <button
              onClick={openPreview}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <Eye className="h-4 w-4 mr-2" />
              プレビュー
            </button>
            
            <button
              onClick={handleSaveSettings}
              disabled={isSaving || isSettingsLoading}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {isSaving ? (
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
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md flex items-start">
            <AlertCircle className="h-5 w-5 mr-2 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {successMessage && (
          <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-md flex items-center">
            <CheckCircle className="h-5 w-5 mr-2" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* 紹介リンクセクション */}
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h2 className="text-xl font-bold mb-2 flex items-center">
                <Link className="h-5 w-5 mr-2" />
                紹介リンクプレビュー
              </h2>
              <p className="text-indigo-100 mb-4">
                このリンクを共有して企業を紹介すると、成約時に報酬が発生します。
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
              <div className="relative flex-grow">
                <input
                  type="text"
                  value={previewUrl}
                  readOnly
                  className="w-full px-4 py-2 pr-10 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50"
                />
              </div>
              <div className="flex gap-2">
                <a
                  href={previewUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-indigo-700 text-white rounded-lg font-medium hover:bg-indigo-800 transition-colors flex items-center"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  開く
                </a>
              </div>
            </div>
          </div>
        </div>

        {isSettingsLoading ? (
          <div className="animate-pulse space-y-6">
            <div className="h-10 bg-gray-200 rounded w-1/4"></div>
            <div className="h-40 bg-gray-200 rounded"></div>
            <div className="h-10 bg-gray-200 rounded w-1/2"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
          </div>
        ) : settings ? (
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="p-6 space-y-6">
              {/* デフォルト代理店設定 */}
              <div>
                <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <Building2 className="h-5 w-5 text-gray-400 mr-2" />
                  デフォルト代理店設定
                </h2>
                
                <div className="space-y-4">
                  <div>
                    <label htmlFor="default_agency_id" className="block text-sm font-medium text-gray-700 mb-1">
                      デフォルト代理店
                    </label>
                    <div className="relative">
                      <select
                        id="default_agency_id"
                        value={settings.default_agency_id || ''}
                        onChange={(e) => handleDefaultAgencyChange(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      >
                        <option value="">代理店を選択してください</option>
                        {isAgenciesLoading ? (
                          <option disabled>読み込み中...</option>
                        ) : agencies && agencies.length > 0 ? (
                          agencies.map(agency => (
                            <option key={agency.id} value={agency.id}>
                              {agency.company_name} ({agency.email})
                            </option>
                          ))
                        ) : (
                          <option disabled>代理店が見つかりません</option>
                        )}
                      </select>
                    </div>
                    <p className="mt-1 text-xs text-gray-500">
                      紹介リードが成約した際に自動的に紐づける代理店を選択します。
                    </p>
                  </div>
                </div>
              </div>

              {/* ヘッダー設定 */}
              <div className="border-t border-gray-200 pt-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <Edit className="h-5 w-5 text-gray-400 mr-2" />
                  ヘッダー設定
                </h2>
                
                <div className="space-y-4">
                  <div>
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                      タイトル
                    </label>
                    <input
                      type="text"
                      id="title"
                      value={settings.title}
                      onChange={(e) => setSettings({ ...settings, title: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                      説明文
                    </label>
                    <textarea
                      id="description"
                      value={settings.description}
                      onChange={(e) => setSettings({ ...settings, description: e.target.value })}
                      rows={4}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      改行は表示時に反映されます。
                    </p>
                  </div>
                  
                  {/* ヒーロー画像URL（複数） */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="block text-sm font-medium text-gray-700">
                        ヒーロー画像URL（最大3枚）
                      </label>
                      {settings.hero_images.length < 3 && (
                        <button
                          type="button"
                          onClick={addHeroImage}
                          className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                          <Plus className="h-3 w-3 mr-1" />
                          追加
                        </button>
                      )}
                    </div>
                    
                    {settings.hero_images.map((url, index) => (
                      <div key={`hero-${index}`} className="mb-2 flex space-x-2">
                        <div className="flex-grow">
                          <div className="flex space-x-2">
                            <div className="flex-grow">
                              <input
                                type="text"
                                value={url}
                                onChange={(e) => updateHeroImage(index, e.target.value)}
                                placeholder="https://example.com/image.jpg"
                                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                              />
                            </div>
                            <div className="flex space-x-1">
                              {url && (
                                <a
                                  href={url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                >
                                  <Eye className="h-4 w-4" />
                                </a>
                              )}
                              <button
                                onClick={() => removeHeroImage(index)}
                                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                    <p className="mt-1 text-xs text-gray-500">
                      推奨サイズ: 1920x1080px。Unsplashなどの無料画像サイトのURLを使用できます。
                    </p>
                  </div>
                  
                  {/* ドキュメントURL（複数） */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="block text-sm font-medium text-gray-700">
                        ダウンロード資料URL（最大3つ）
                      </label>
                      {settings.document_urls.length < 3 && (
                        <button
                          type="button"
                          onClick={addDocumentUrl}
                          className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                          <Plus className="h-3 w-3 mr-1" />
                          追加
                        </button>
                      )}
                    </div>
                    
                    {settings.document_urls.map((url, index) => (
                      <div key={`doc-${index}`} className="mb-2 flex space-x-2">
                        <div className="flex-grow">
                          <div className="flex space-x-2">
                            <div className="flex-grow">
                              <input
                                type="text"
                                value={url}
                                onChange={(e) => updateDocumentUrl(index, e.target.value)}
                                placeholder="https://example.com/document.pdf"
                                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                              />
                            </div>
                            <div className="flex space-x-1">
                              {url && (
                                <a
                                  href={url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                >
                                  <Eye className="h-4 w-4" />
                                </a>
                              )}
                              <button
                                onClick={() => removeDocumentUrl(index)}
                                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                    <p className="mt-1 text-xs text-gray-500">
                      PDFなどのダウンロード資料のURL。空白の場合はダウンロードボタンが表示されません。
                    </p>
                  </div>
                </div>
              </div>

              {/* フォーム設定 */}
              <div className="border-t border-gray-200 pt-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <FileText className="h-5 w-5 text-gray-400 mr-2" />
                  フォーム設定
                </h2>
                
                <div className="space-y-4">
                  <div>
                    <label htmlFor="form_title" className="block text-sm font-medium text-gray-700 mb-1">
                      フォームタイトル
                    </label>
                    <input
                      type="text"
                      id="form_title"
                      value={settings.form_title}
                      onChange={(e) => setSettings({ ...settings, form_title: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="form_description" className="block text-sm font-medium text-gray-700 mb-1">
                      フォーム説明文
                    </label>
                    <textarea
                      id="form_description"
                      value={settings.form_description}
                      onChange={(e) => setSettings({ ...settings, form_description: e.target.value })}
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </AdminLayout>
  );
};

export default AdminReferralSettings;