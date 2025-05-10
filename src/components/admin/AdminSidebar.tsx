import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, Users, Building2, FileText, Settings, BarChart2, Link, Bell
} from 'lucide-react';

const AdminSidebar: React.FC = () => {
  const navItems = [
    { path: '/admin/dashboard', icon: LayoutDashboard, label: 'ダッシュボード' },
    { path: '/admin/announcements', icon: Bell, label: 'お知らせ管理' },
    { path: '/admin/agencies', icon: Building2, label: '代理店管理' },
    { path: '/admin/clients', icon: Users, label: 'クライアント管理' },
    { path: '/admin/campaigns', icon: FileText, label: 'キャンペーン管理' },
    { path: '/admin/scout-history', icon: BarChart2, label: 'スカウト送信管理' },
    { path: '/admin/referral-settings', icon: Link, label: '紹介リンク設定' },
    { path: '/admin/settings', icon: Settings, label: 'システム設定' },
  ];

  return (
    <div className="h-full py-6 px-3 bg-white">
      <div className="space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => 
                `flex items-center px-4 py-3 text-sm font-medium rounded-md transition-colors duration-150 ${
                  isActive 
                    ? 'bg-blue-50 text-blue-700' 
                    : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                }`
              }
            >
              <Icon className="h-5 w-5 mr-3" />
              {item.label}
            </NavLink>
          );
        })}
      </div>
    </div>
  );
};

export default AdminSidebar;