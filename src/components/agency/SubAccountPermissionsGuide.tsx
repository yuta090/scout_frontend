import React from 'react';
import { Shield, Key, Lock, Eye, FileText, Users, CreditCard, CheckCircle, AlertCircle } from 'lucide-react';

const SubAccountPermissionsGuide: React.FC = () => {
  return (
    <div className="space-y-8">
      <section>
        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
          <Shield className="h-6 w-6 text-indigo-500 mr-2" />
          権限レベルについて
        </h2>
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-200 bg-gray-50">
            <h3 className="text-lg font-medium text-gray-900">権限レベルの概要</h3>
            <p className="mt-1 text-sm text-gray-500">
              サブアカウントには4つの権限レベルがあり、それぞれ異なる操作が許可されています。
            </p>
          </div>
          <div className="px-6 py-5 divide-y divide-gray-200">
            <div className="py-4">
              <div className="flex items-center mb-2">
                <Shield className="h-5 w-5 text-indigo-600 mr-2" />
                <h4 className="text-base font-medium text-gray-900">管理者（admin）</h4>
              </div>
              <p className="text-sm text-gray-600 ml-7">
                すべての機能にアクセス可能。顧客管理、キャンペーン管理、レポート閲覧、請求情報閲覧など、
                代理店アカウントと同等の権限を持ちます。
              </p>
              <div className="mt-2 ml-7 flex flex-wrap gap-2">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  すべての機能
                </span>
              </div>
            </div>

            <div className="py-4">
              <div className="flex items-center mb-2">
                <Key className="h-5 w-5 text-blue-600 mr-2" />
                <h4 className="text-base font-medium text-gray-900">スタッフ（staff）</h4>
              </div>
              <p className="text-sm text-gray-600 ml-7">
                カスタマイズ可能な権限を持ちます。顧客管理、キャンペーン管理、レポート閲覧などの権限を
                個別に設定できます。デフォルトでは閲覧のみの権限が付与されます。
              </p>
              <div className="mt-2 ml-7 flex flex-wrap gap-2">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  カスタマイズ可能
                </span>
              </div>
            </div>

            <div className="py-4">
              <div className="flex items-center mb-2">
                <CreditCard className="h-5 w-5 text-purple-600 mr-2" />
                <h4 className="text-base font-medium text-gray-900">経理（accounting）</h4>
              </div>
              <p className="text-sm text-gray-600 ml-7">
                請求情報と売上レポートの閲覧権限を持ちます。顧客情報やキャンペーン情報も閲覧できますが、
                作成や編集はできません。
              </p>
              <div className="mt-2 ml-7 flex flex-wrap gap-2">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  請求情報閲覧
                </span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  レポート閲覧
                </span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  顧客情報閲覧
                </span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  キャンペーン閲覧
                </span>
              </div>
            </div>

            <div className="py-4">
              <div className="flex items-center mb-2">
                <Eye className="h-5 w-5 text-gray-600 mr-2" />
                <h4 className="text-base font-medium text-gray-900">閲覧のみ（readonly）</h4>
              </div>
              <p className="text-sm text-gray-600 ml-7">
                データの閲覧のみ可能で、作成や編集はできません。顧客情報、キャンペーン情報、
                レポートの閲覧が可能です。請求情報は閲覧できません。
              </p>
              <div className="mt-2 ml-7 flex flex-wrap gap-2">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  顧客情報閲覧
                </span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  キャンペーン閲覧
                </span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  レポート閲覧
                </span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  請求情報閲覧不可
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
          <Key className="h-6 w-6 text-indigo-500 mr-2" />
          詳細権限設定
        </h2>
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-200 bg-gray-50">
            <h3 className="text-lg font-medium text-gray-900">権限カテゴリ</h3>
            <p className="mt-1 text-sm text-gray-500">
              スタッフ権限では、以下の各カテゴリごとに詳細な権限を設定できます。
            </p>
          </div>
          <div className="px-6 py-5 divide-y divide-gray-200">
            <div className="py-4">
              <div className="flex items-center mb-2">
                <Users className="h-5 w-5 text-blue-600 mr-2" />
                <h4 className="text-base font-medium text-gray-900">顧客管理</h4>
              </div>
              <div className="ml-7 space-y-2">
                <div className="flex items-start">
                  <div className="flex-shrink-0 mt-0.5">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  </div>
                  <div className="ml-2">
                    <p className="text-sm font-medium text-gray-900">閲覧</p>
                    <p className="text-xs text-gray-500">顧客情報の閲覧権限</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="flex-shrink-0 mt-0.5">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  </div>
                  <div className="ml-2">
                    <p className="text-sm font-medium text-gray-900">作成</p>
                    <p className="text-xs text-gray-500">新規顧客の登録権限</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="flex-shrink-0 mt-0.5">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  </div>
                  <div className="ml-2">
                    <p className="text-sm font-medium text-gray-900">編集</p>
                    <p className="text-xs text-gray-500">顧客情報の更新権限</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="flex-shrink-0 mt-0.5">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  </div>
                  <div className="ml-2">
                    <p className="text-sm font-medium text-gray-900">削除</p>
                    <p className="text-xs text-gray-500">顧客の削除権限</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="py-4">
              <div className="flex items-center mb-2">
                <FileText className="h-5 w-5 text-indigo-600 mr-2" />
                <h4 className="text-base font-medium text-gray-900">キャンペーン管理</h4>
              </div>
              <div className="ml-7 space-y-2">
                <div className="flex items-start">
                  <div className="flex-shrink-0 mt-0.5">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  </div>
                  <div className="ml-2">
                    <p className="text-sm font-medium text-gray-900">閲覧</p>
                    <p className="text-xs text-gray-500">キャンペーン情報の閲覧権限</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="flex-shrink-0 mt-0.5">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  </div>
                  <div className="ml-2">
                    <p className="text-sm font-medium text-gray-900">作成</p>
                    <p className="text-xs text-gray-500">新規キャンペーンの作成権限</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="flex-shrink-0 mt-0.5">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  </div>
                  <div className="ml-2">
                    <p className="text-sm font-medium text-gray-900">編集</p>
                    <p className="text-xs text-gray-500">キャンペーン情報の更新権限</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="flex-shrink-0 mt-0.5">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  </div>
                  <div className="ml-2">
                    <p className="text-sm font-medium text-gray-900">削除</p>
                    <p className="text-xs text-gray-500">キャンペーンの削除権限</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="py-4">
              <div className="flex items-center mb-2">
                <FileText className="h-5 w-5 text-green-600 mr-2" />
                <h4 className="text-base font-medium text-gray-900">レポート</h4>
              </div>
              <div className="ml-7 space-y-2">
                <div className="flex items-start">
                  <div className="flex-shrink-0 mt-0.5">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  </div>
                  <div className="ml-2">
                    <p className="text-sm font-medium text-gray-900">閲覧</p>
                    <p className="text-xs text-gray-500">スカウト送信履歴やキャンペーン結果の閲覧権限</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="py-4">
              <div className="flex items-center mb-2">
                <CreditCard className="h-5 w-5 text-purple-600 mr-2" />
                <h4 className="text-base font-medium text-gray-900">請求情報</h4>
              </div>
              <div className="ml-7 space-y-2">
                <div className="flex items-start">
                  <div className="flex-shrink-0 mt-0.5">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  </div>
                  <div className="ml-2">
                    <p className="text-sm font-medium text-gray-900">閲覧</p>
                    <p className="text-xs text-gray-500">請求情報や売上情報の閲覧権限</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="flex-shrink-0 mt-0.5">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  </div>
                  <div className="ml-2">
                    <p className="text-sm font-medium text-gray-900">全顧客の請求情報閲覧</p>
                    <p className="text-xs text-gray-500">全ての顧客の請求情報を閲覧できる権限</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
          <Lock className="h-6 w-6 text-indigo-500 mr-2" />
          セキュリティとベストプラクティス
        </h2>
        <div className="bg-white shadow rounded-lg p-6">
          <div className="space-y-4">
            <div className="flex items-start">
              <div className="flex-shrink-0 mt-1">
                <CheckCircle className="h-5 w-5 text-green-500" />
              </div>
              <div className="ml-3">
                <h4 className="text-base font-medium text-gray-900">最小権限の原則</h4>
                <p className="mt-1 text-sm text-gray-600">
                  各サブアカウントには、業務に必要な最小限の権限のみを付与してください。
                  これにより、誤操作や不正アクセスのリスクを最小限に抑えることができます。
                </p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="flex-shrink-0 mt-1">
                <CheckCircle className="h-5 w-5 text-green-500" />
              </div>
              <div className="ml-3">
                <h4 className="text-base font-medium text-gray-900">定期的な権限の見直し</h4>
                <p className="mt-1 text-sm text-gray-600">
                  サブアカウントの権限は定期的に見直し、不要になった権限は削除してください。
                  特に、役割が変更されたスタッフの権限は速やかに更新することが重要です。
                </p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="flex-shrink-0 mt-1">
                <CheckCircle className="h-5 w-5 text-green-500" />
              </div>
              <div className="ml-3">
                <h4 className="text-base font-medium text-gray-900">アクセスログの確認</h4>
                <p className="mt-1 text-sm text-gray-600">
                  定期的にアクティビティログを確認し、不審な操作がないか監視してください。
                  異常を発見した場合は、該当するサブアカウントの権限を一時的に停止することをお勧めします。
                </p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="flex-shrink-0 mt-1">
                <CheckCircle className="h-5 w-5 text-green-500" />
              </div>
              <div className="ml-3">
                <h4 className="text-base font-medium text-gray-900">退職時の対応</h4>
                <p className="mt-1 text-sm text-gray-600">
                  スタッフが退職する際は、速やかにサブアカウントを無効化してください。
                  これにより、退職後のデータアクセスを防止できます。
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default SubAccountPermissionsGuide;