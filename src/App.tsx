import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Building2, Users } from 'lucide-react';
import LoginPortal from './components/LoginPortal';
import AgencyDashboard from './components/AgencyDashboard';
import ClientDashboard from './components/ClientDashboard';
import ResetPassword from './components/ResetPassword';

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={
          <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
            <div className="container mx-auto px-4 py-16">
              <h1 className="text-4xl font-bold text-center text-gray-800 mb-12">
                スカウト代行システム
              </h1>
              <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                <LoginPortal 
                  type="agency"
                  title="代理店ポータル"
                  description="代理店様専用のログインポータルです"
                  icon={Building2}
                />
                <LoginPortal 
                  type="client"
                  title="クライアントポータル"
                  description="クライアント様専用のログインポータルです"
                  icon={Users}
                />
              </div>
            </div>
          </div>
        } />
        <Route path="/agency/dashboard" element={<AgencyDashboard />} />
        <Route path="/client/dashboard" element={<ClientDashboard />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
};

export default App;