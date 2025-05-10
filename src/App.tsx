import React from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AgencyDashboard from './components/AgencyDashboard';
import ClientDashboard from './components/ClientDashboard';
import LoginPortal from './components/LoginPortal';
import { Building2, Users } from 'lucide-react';
import AdminDashboard from './components/admin/AdminDashboard';
import AdminLogin from './components/admin/AdminLogin';
import AdminProtectedRoute from './components/admin/AdminProtectedRoute';
import AdminRedirect from './components/admin/AdminRedirect';
import AdminAgencyList from './components/admin/AdminAgencyList';
import AdminClientList from './components/admin/AdminClientList';
import AdminCampaignList from './components/admin/AdminCampaignList';
import AdminScoutHistory from './components/admin/AdminScoutHistory';
import AdminSettings from './components/admin/AdminSettings';
import AdminReferralLeads from './components/admin/AdminReferralLeads';
import AdminReferralSettings from './components/admin/AdminReferralSettings';
import AdminAnnouncementList from './components/admin/AdminAnnouncementList';
import ReferralDashboard from './components/referral/ReferralDashboard';
import ReferralProtectedRoute from './components/referral/ReferralProtectedRoute';
import ReferralLandingPage from './components/referral/ReferralLandingPage';
import EntryRedirect from './components/EntryRedirect';
import ResetPassword from './components/ResetPassword';
import AnnouncementsList from './components/AnnouncementsList';
import AnnouncementDetail from './components/AnnouncementDetail';
import SubAccountManagement from './components/agency/SubAccountManagement';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Routes>
          {/* ホーム */}
          <Route path="/" element={
            <div className="min-h-screen bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center p-4">
              <div className="bubble"></div>
              <div className="bubble"></div>
              <div className="bubble"></div>
              <div className="bubble"></div>
              <div className="bubble"></div>
              <div className="light-effect"></div>
              <div className="light-effect"></div>
              <div className="light-effect"></div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl w-full">
                <LoginPortal
                  type="agency"
                  title="代理店ポータル"
                  description="代理店様専用のポータルサイトです"
                  icon={Building2}
                />
                <LoginPortal
                  type="client"
                  title="クライアントポータル"
                  description="クライアント様専用のポータルサイトです"
                  icon={Users}
                />
              </div>
            </div>
          } />

          {/* 代理店ダッシュボード */}
          <Route path="/agency/dashboard" element={<AgencyDashboard />} />
          <Route path="/agency/subaccounts" element={<SubAccountManagement />} />

          {/* クライアントダッシュボード */}
          <Route path="/client/dashboard" element={<ClientDashboard />} />

          {/* 取次代理店ダッシュボード */}
          <Route path="/referral-dashboard" element={
            <ReferralProtectedRoute>
              <ReferralDashboard />
            </ReferralProtectedRoute>
          } />
          <Route path="/referral/:referrerId" element={<ReferralLandingPage />} />
          <Route path="/entry" element={<EntryRedirect />} />

          {/* パスワードリセット */}
          <Route path="/reset-password" element={<ResetPassword />} />

          {/* お知らせ */}
          <Route path="/announcements" element={<AnnouncementsList />} />
          <Route path="/announcements/:id" element={<AnnouncementDetail />} />

          {/* 管理者ポータル */}
          <Route path="/admin" element={<AdminRedirect />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={
            <AdminProtectedRoute>
              <AdminDashboard />
            </AdminProtectedRoute>
          } />
          <Route path="/admin/announcements" element={
            <AdminProtectedRoute>
              <AdminAnnouncementList />
            </AdminProtectedRoute>
          } />
          <Route path="/admin/agencies" element={
            <AdminProtectedRoute>
              <AdminAgencyList />
            </AdminProtectedRoute>
          } />
          <Route path="/admin/clients" element={
            <AdminProtectedRoute>
              <AdminClientList />
            </AdminProtectedRoute>
          } />
          <Route path="/admin/campaigns" element={
            <AdminProtectedRoute>
              <AdminCampaignList />
            </AdminProtectedRoute>
          } />
          <Route path="/admin/scout-history" element={
            <AdminProtectedRoute>
              <AdminScoutHistory />
            </AdminProtectedRoute>
          } />
          <Route path="/admin/referral-leads" element={
            <AdminProtectedRoute>
              <AdminReferralLeads />
            </AdminProtectedRoute>
          } />
          <Route path="/admin/referral-settings" element={
            <AdminProtectedRoute>
              <AdminReferralSettings />
            </AdminProtectedRoute>
          } />
          <Route path="/admin/settings" element={
            <AdminProtectedRoute>
              <AdminSettings />
            </AdminProtectedRoute>
          } />

          {/* 存在しないパスへのリダイレクト */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </QueryClientProvider>
  );
}

export default App;