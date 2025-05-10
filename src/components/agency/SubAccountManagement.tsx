import React, { useState } from 'react';
import SubAccountList from './SubAccountList';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/Tabs';
import SubAccountPermissionsGuide from './SubAccountPermissionsGuide';
import DashboardLayout from '../DashboardLayout';
import { Plus } from 'lucide-react';

const SubAccountManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState('subaccounts');

  return (
    <DashboardLayout userType="agency">
      <div className="space-y-6">
        <div className="bg-white shadow rounded-lg p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">サブアカウント管理</h1>
            <p className="text-gray-600">
              代理店アカウントに紐づくサブアカウントを管理します。
              <br />各サブアカウントに適切な権限を設定することで、チームメンバーごとに必要な機能へのアクセスを制御できます。
            </p>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-6">
              <TabsTrigger value="subaccounts">サブアカウント一覧</TabsTrigger>
              <TabsTrigger value="permissions">権限について</TabsTrigger>
            </TabsList>
            
            <TabsContent value="subaccounts">
              <SubAccountList />
            </TabsContent>
            
            <TabsContent value="permissions">
              <SubAccountPermissionsGuide />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default SubAccountManagement;