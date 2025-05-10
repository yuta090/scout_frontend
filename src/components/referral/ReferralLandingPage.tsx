import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { 
  Building2, User, Mail, Phone, MessageSquare, 
  CheckCircle, ArrowRight, Download, FileText, AlertCircle 
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { isValidUUID } from '../../lib/utils';
import ReferralLandingHeader from './landing/ReferralLandingHeader';
import ReferralLandingBenefits from './landing/ReferralLandingBenefits';
import ReferralLandingForm from './landing/ReferralLandingForm';
import ReferralLandingFooter from './landing/ReferralLandingFooter';
import ReferralLandingInitialForm from './landing/ReferralLandingInitialForm';

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

const ReferralLandingPage: React.FC = () => {
  const { referrerId } = useParams<{ referrerId: string }>();
  const [settings, setSettings] = useState<ReferralSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    company_name: '',
    contact_name: '',
    email: '',
    phone: '',
    message: ''
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [referrerValid, setReferrerValid] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showContent, setShowContent] = useState(false);
  const [initialFormData, setInitialFormData] = useState({
    company_name: '',
    contact_name: ''
  });
  const [initialFormSubmitted, setInitialFormSubmitted] = useState(false);

  // 紹介設定を取得
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setIsLoading(true);
        
        // まず、referrerIdが有効かどうかを確認
        if (referrerId) {
          if (!isValidUUID(referrerId)) {
            setError('無効な紹介リンクです。');
            setReferrerValid(false);
            setIsLoading(false);
            return;
          }

          const { data: referrerData, error: referrerError } = await supabase
            .from('profiles')
            .select('id')
            .eq('id', referrerId)
            .maybeSingle();
          
          if (referrerError) {
            console.error('Error checking referrer ID:', referrerError);
            setError('紹介者の確認中にエラーが発生しました。');
            setReferrerValid(false);
            setIsLoading(false);
            return;
          }

          if (!referrerData) {
            setError('無効な紹介リンクです。');
            setReferrerValid(false);
            setIsLoading(false);
            return;
          }
          
          setReferrerValid(true);
        } else {
          setError('紹介IDが指定されていません。');
          setReferrerValid(false);
          setIsLoading(false);
          return;
        }
        
        // 紹介設定を取得
        const { data: settingsData, error: settingsError } = await supabase
          .from('referral_settings')
          .select('*')
          .limit(1)
          .single();
        
        if (settingsError) {
          console.error('Error fetching referral settings:', settingsError);
          setError('設定の取得に失敗しました。');
          setIsLoading(false);
          return;
        }
        
        // 古い形式のデータを新しい形式に変換
        const formattedData = {
          ...settingsData,
          hero_images: settingsData.hero_images || 
            (settingsData.hero_image_url ? [settingsData.hero_image_url] : []),
          document_urls: settingsData.document_urls || 
            (settingsData.document_url ? [settingsData.document_url] : [])
        };
        
        setSettings(formattedData);
        setIsLoading(false);
      } catch (err) {
        console.error('Error in fetchSettings:', err);
        setError('予期せぬエラーが発生しました。');
        setIsLoading(false);
      }
    };
    
    fetchSettings();
  }, [referrerId]);

  // 画像スライダーの自動切り替え
  useEffect(() => {
    if (!settings || !settings.hero_images || settings.hero_images.length <= 1) return;
    
    const interval = setInterval(() => {
      setCurrentImageIndex(prevIndex => 
        prevIndex === settings.hero_images.length - 1 ? 0 : prevIndex + 1
      );
    }, 5000); // 5秒ごとに切り替え
    
    return () => clearInterval(interval);
  }, [settings]);

  // 初期フォーム送信処理
  const handleInitialFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // バリデーション
    const errors: Record<string, string> = {};
    if (!initialFormData.company_name.trim()) errors.company_name = '会社名は必須です';
    if (!initialFormData.contact_name.trim()) errors.contact_name = '担当者名は必須です';
    
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    
    // フォームデータを更新
    setFormData(prev => ({
      ...prev,
      company_name: initialFormData.company_name,
      contact_name: initialFormData.contact_name
    }));
    
    // コンテンツを表示
    setInitialFormSubmitted(true);
    setShowContent(true);
    setFormErrors({});
  };

  // メインフォーム送信処理
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // バリデーション
    const errors: Record<string, string> = {};
    if (!formData.company_name.trim()) errors.company_name = '会社名は必須です';
    if (!formData.contact_name.trim()) errors.contact_name = '担当者名は必須です';
    if (!formData.email.trim()) errors.email = 'メールアドレスは必須です';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = '有効なメールアドレスを入力してください';
    }
    
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    
    setIsSubmitting(true);
    setFormErrors({});
    
    try {
      // 紹介リードを登録
      const { error } = await supabase
        .from('referral_leads')
        .insert([
          {
            referrer_id: referrerId,
            company_name: formData.company_name,
            contact_name: formData.contact_name,
            email: formData.email,
            phone: formData.phone,
            message: formData.message,
            status: 'pending'
          }
        ]);
      
      if (error) throw error;
      
      // 成功時の処理
      setSubmitSuccess(true);
      setFormData({
        company_name: '',
        contact_name: '',
        email: '',
        phone: '',
        message: ''
      });
      
      // 3秒後にメッセージを非表示
      setTimeout(() => {
        setSubmitSuccess(false);
      }, 5000);
      
    } catch (err) {
      console.error('Error submitting form:', err);
      setFormErrors({
        submit: '送信に失敗しました。もう一度お試しください。'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error || !settings || !referrerValid) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-center text-gray-900 mb-2">
            エラーが発生しました
          </h1>
          <p className="text-center text-gray-600">
            {error || 'ページの読み込みに失敗しました。もう一度お試しください。'}
          </p>
          <div className="mt-6 text-center">
            <a href="/" className="text-indigo-600 hover:text-indigo-800">
              ホームに戻る
            </a>
          </div>
        </div>
      </div>
    );
  }

  // 初期フォーム（会社名と担当者名の入力）
  if (!showContent) {
    return (
      <ReferralLandingInitialForm 
        initialFormData={initialFormData}
        setInitialFormData={setInitialFormData}
        formErrors={formErrors}
        settings={settings}
        onSubmit={handleInitialFormSubmit}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダーセクション */}
      <ReferralLandingHeader 
        settings={settings} 
        currentImageIndex={currentImageIndex} 
        setCurrentImageIndex={setCurrentImageIndex} 
      />

      {/* メリットセクション */}
      <ReferralLandingBenefits />

      {/* 申し込みフォーム */}
      <ReferralLandingForm 
        settings={settings}
        formData={formData}
        setFormData={setFormData}
        formErrors={formErrors}
        isSubmitting={isSubmitting}
        submitSuccess={submitSuccess}
        onSubmit={handleSubmit}
      />

      {/* フッター */}
      <ReferralLandingFooter />
    </div>
  );
};

export default ReferralLandingPage;