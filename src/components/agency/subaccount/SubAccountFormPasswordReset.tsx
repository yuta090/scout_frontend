import React from 'react';

interface SubAccountFormPasswordResetProps {
  email: string;
  onResetPassword: () => void;
  sendingResetLink: boolean;
  resetLinkSent: boolean;
}

const SubAccountFormPasswordReset: React.FC<SubAccountFormPasswordResetProps> = ({
  email,
  onResetPassword,
  sendingResetLink,
  resetLinkSent
}) => {
  return (
    <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
      <h4 className="text-sm font-medium text-blue-800 mb-2">パスワードリセット</h4>
      <p className="text-xs text-blue-700 mb-3">
        サブアカウントのパスワードをリセットするには、登録されたメールアドレスにリセットリンクを送信します。
      </p>
      <button
        type="button"
        onClick={onResetPassword}
        disabled={sendingResetLink || resetLinkSent}
        className="w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {sendingResetLink ? '送信中...' : resetLinkSent ? 'リンクを送信しました' : 'パスワードリセットリンクを送信'}
      </button>
    </div>
  );
};

export default SubAccountFormPasswordReset;