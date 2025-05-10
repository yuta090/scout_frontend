import React, { useState, useEffect } from 'react';
import { X, Image, Calendar, Globe, Users, CheckCircle, AlertCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import Modal from '../ui/Modal';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

interface Announcement {
  id: string;
  title: string;
  content: string;
  image_url: string | null;
  published: boolean;
  public_access: boolean;
  all_roles_access: boolean;
  allowed_roles: string[];
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

interface AdminAnnouncementFormProps {
  announcement?: Announcement | null;
  onClose: () => void;
  onSuccess: () => void;
}

const AdminAnnouncementForm: React.FC<AdminAnnouncementFormProps> = ({ 
  announcement, 
  onClose, 
  onSuccess 
}) => {
  const [formData, setFormData] = useState<Omit<Announcement, 'id' | 'created_at' | 'updated_at'>>({
    title: '',
    content: '',
    image_url: null,
    published: false,
    public_access: false,
    all_roles_access: true,
    allowed_roles: ['agency', 'client', 'admin', 'referral_agent'],
    published_at: null
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // 編集時のデータ読み込み
  useEffect(() => {
    if (announcement) {
      setFormData({
        title: announcement.title,
        content: announcement.content,
        image_url: announcement.image_url,
        published: announcement.published,
        public_access: announcement.public_access,
        all_roles_access: announcement.all_roles_access,
        allowed_roles: announcement.allowed_roles || ['agency', 'client', 'admin', 'referral_agent'],
        published_at: announcement.published_at
      });
      
      if (announcement.image_url) {
        setImagePreview(announcement.image_url);
      }
    }
  }, [announcement]);

  // 画像アップロード処理
  const handleImageUpload = async (file: File): Promise<string> => {
    setIsUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;
      
      const { error: uploadError } = await supabase.storage
        .from('announcements')
        .upload(filePath, file);
      
      if (uploadError) throw uploadError;
      
      const { data } = supabase.storage
        .from('announcements')
        .getPublicUrl(filePath);
      
      return data.publicUrl;
    } catch (error) {
      console.error('画像アップロードエラー:', error);
      throw new Error('画像のアップロードに失敗しました');
    } finally {
      setIsUploading(false);
    }
  };

  // 画像選択ハンドラー
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // 画像ファイルのみ許可
    if (!file.type.startsWith('image/')) {
      setError('画像ファイルのみアップロードできます');
      return;
    }
    
    // 5MB以下のファイルのみ許可
    if (file.size > 5 * 1024 * 1024) {
      setError('ファイルサイズは5MB以下にしてください');
      return;
    }
    
    setImageFile(file);
    
    // プレビュー表示
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // フォーム送信処理
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;

    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      // 画像アップロード処理
      let imageUrl = formData.image_url;
      if (imageFile) {
        imageUrl = await handleImageUpload(imageFile);
      }
      
      // 公開日時の設定
      let publishedAt = formData.published_at;
      if (formData.published && !publishedAt) {
        publishedAt = new Date().toISOString();
      }
      
      const announcementData = {
        ...formData,
        image_url: imageUrl,
        published_at: publishedAt
      };
      
      if (announcement) {
        // 既存のお知らせを更新
        const { error: updateError } = await supabase
          .from('announcements')
          .update(announcementData)
          .eq('id', announcement.id);
          
        if (updateError) throw updateError;
        setSuccessMessage('お知らせを更新しました');
      } else {
        // 新規お知らせを作成
        const { error: insertError } = await supabase
          .from('announcements')
          .insert([announcementData]);
          
        if (insertError) throw insertError;
        setSuccessMessage('お知らせを作成しました');
      }
      
      // 成功時の処理
      setTimeout(() => {
        onSuccess();
      }, 1500);
    } catch (err) {
      console.error('Form submission error:', err);
      setError(err instanceof Error ? err.message : '保存に失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  // 役割オプション
  const roleOptions = [
    { value: 'agency', label: '代理店' },
    { value: 'client', label: 'クライアント' },
    { value: 'admin', label: '管理者' },
    { value: 'referral_agent', label: '取次代理店' }
  ];

  // 役割の選択状態を切り替える
  const toggleRole = (role: string) => {
    if (formData.allowed_roles.includes(role)) {
      setFormData({
        ...formData,
        allowed_roles: formData.allowed_roles.filter(r => r !== role)
      });
    } else {
      setFormData({
        ...formData,
        allowed_roles: [...formData.allowed_roles, role]
      });
    }
  };

  // リッチテキストエディタのモジュール設定
  const modules = {
    toolbar: [
      [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'color': [] }, { 'background': [] }],
      ['link', 'image'],
      ['clean']
    ],
  };

  // ロール名を日本語に変換する関数
  const getRoleDisplayName = (role: string): string => {
    const roleMap: Record<string, string> = {
      'agency': '代理店',
      'client': 'クライアント',
      'admin': '管理者',
      'referral_agent': '取次代理店'
    };
    return roleMap[role] || role;
  };

  // 選択されているロールを日本語で表示
  const getSelectedRolesDisplay = (): string => {
    if (formData.all_roles_access) return '全ロール';
    if (formData.allowed_roles.length === 0) return 'なし';
    
    return formData.allowed_roles
      .map(role => getRoleDisplayName(role))
      .join('、');
  };

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title={announcement ? 'お知らせの編集' : '新規お知らせ作成'}
      maxWidth="max-w-4xl"
    >
      <form onSubmit={handleSubmit} className="px-6 py-4 space-y-6">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-md flex items-center">
            <AlertCircle className="h-5 w-5 mr-2" />
            {error}
          </div>
        )}

        {successMessage && (
          <div className="p-3 bg-green-50 border border-green-200 text-green-600 rounded-md flex items-center">
            <CheckCircle className="h-5 w-5 mr-2" />
            {successMessage}
          </div>
        )}

        <div className="space-y-4">
          {/* タイトル */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
              タイトル <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="title"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="お知らせのタイトルを入力"
            />
          </div>

          {/* 画像アップロード */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              メイン画像
            </label>
            <div className="mt-1 flex items-center">
              <div className="flex-shrink-0">
                {imagePreview ? (
                  <div className="relative h-32 w-32 rounded-md overflow-hidden">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="h-full w-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setImagePreview(null);
                        setImageFile(null);
                        setFormData({ ...formData, image_url: null });
                      }}
                      className="absolute top-0 right-0 p-1 bg-red-500 text-white rounded-bl-md"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <div className="h-32 w-32 border-2 border-gray-300 border-dashed rounded-md flex items-center justify-center">
                    <Image className="h-8 w-8 text-gray-400" />
                  </div>
                )}
              </div>
              <div className="ml-5">
                <div className="relative">
                  <input
                    type="file"
                    id="image"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="sr-only"
                  />
                  <label
                    htmlFor="image"
                    className="cursor-pointer py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    画像を選択
                  </label>
                </div>
                <p className="mt-2 text-xs text-gray-500">
                  PNG, JPG, GIF 最大 5MB
                </p>
              </div>
              {isUploading && (
                <div className="ml-3">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-indigo-600"></div>
                </div>
              )}
            </div>
          </div>

          {/* 本文 */}
          <div>
            <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
              本文 <span className="text-red-500">*</span>
            </label>
            <div className="mt-1">
              <ReactQuill
                theme="snow"
                value={formData.content}
                onChange={(content) => setFormData({ ...formData, content })}
                modules={modules}
                className="h-64"
              />
            </div>
          </div>

          {/* 公開設定 */}
          <div className="border-t border-gray-200 pt-6 mt-10">
            <h3 className="text-lg font-medium text-gray-900 mb-4">公開設定</h3>
            
            <div className="space-y-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="published"
                  checked={formData.published}
                  onChange={(e) => setFormData({ ...formData, published: e.target.checked })}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label htmlFor="published" className="ml-2 block text-sm text-gray-900">
                  公開する
                </label>
              </div>
              
              {formData.published && (
                <div>
                  <label htmlFor="published_at" className="block text-sm font-medium text-gray-700 mb-1">
                    公開日時
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Calendar className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="datetime-local"
                      id="published_at"
                      value={formData.published_at ? new Date(formData.published_at).toISOString().slice(0, 16) : ''}
                      onChange={(e) => setFormData({ ...formData, published_at: e.target.value ? new Date(e.target.value).toISOString() : null })}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    空欄の場合は保存時の日時が設定されます
                  </p>
                </div>
              )}
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="public_access"
                  checked={formData.public_access}
                  onChange={(e) => setFormData({ ...formData, public_access: e.target.checked })}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label htmlFor="public_access" className="ml-2 flex items-center text-sm text-gray-900">
                  <Globe className="h-4 w-4 mr-1 text-gray-500" />
                  非ログインユーザーにも公開する
                </label>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="all_roles_access"
                  checked={formData.all_roles_access}
                  onChange={(e) => setFormData({ ...formData, all_roles_access: e.target.checked })}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label htmlFor="all_roles_access" className="ml-2 flex items-center text-sm text-gray-900">
                  <Users className="h-4 w-4 mr-1 text-gray-500" />
                  すべてのロールに公開する
                </label>
              </div>
              
              {!formData.all_roles_access && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    公開するロールを選択
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {roleOptions.map((role) => (
                      <div key={role.value} className="flex items-center">
                        <input
                          type="checkbox"
                          id={`role-${role.value}`}
                          checked={formData.allowed_roles.includes(role.value)}
                          onChange={() => toggleRole(role.value)}
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                        />
                        <label htmlFor={`role-${role.value}`} className="ml-2 text-sm text-gray-700">
                          {role.label}
                        </label>
                      </div>
                    ))}
                  </div>
                  <div className="mt-2 p-2 bg-gray-50 rounded-md">
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">現在の公開先: </span>
                      {getSelectedRolesDisplay()}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-4 pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            キャンセル
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? '保存中...' : (announcement ? '更新' : '作成')}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default AdminAnnouncementForm;