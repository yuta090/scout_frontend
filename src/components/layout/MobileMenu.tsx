import React from 'react';
import { Link } from 'react-router-dom';
import { Settings, LogOut, Users } from 'lucide-react';

interface MobileMenuProps {
  isOpen: boolean;
  userType?: 'agency' | 'client' | 'admin' | 'referral_agent';
  onProfileClick: () => void;
  onLogout: () => void;
  onClose: () => void;
}

const MobileMenu: React.FC<MobileMenuProps> = ({ 
  isOpen, 
  userType = 'agency',
  onProfileClick, 
  onLogout,
  onClose
}) => {
  if (!isOpen) return null;

  return (
    <div className="md:hidden">
      <div className="pt-2 pb-3 space-y-1">
        {userType === 'agency' && (
          <Link
            to="/agency/subaccounts"
            className="w-full flex items-center px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-900 hover:bg-gray-50"
            onClick={onClose}
          >
            <Users className="h-4 w-4 mr-2" />
            サブアカウント管理
          </Link>
        )}
        <button
          onClick={() => {
            onProfileClick();
            onClose();
          }}
          className="w-full flex items-center px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-900 hover:bg-gray-50"
          type="button"
        >
          <Settings className="h-4 w-4 mr-2" />
          プロフィール設定
        </button>
        <button
          onClick={onLogout}
          className="w-full flex items-center px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-900 hover:bg-gray-50"
          type="button"
        >
          <LogOut className="h-4 w-4 mr-2" />
          ログアウト
        </button>
      </div>
    </div>
  );
};

export default MobileMenu;