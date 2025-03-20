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
          <div className="min-h-screen bg-gradient-to-br">
            <div className="bubble"></div>
            <div className="bubble"></div>
            <div className="bubble"></div>
            <div className="bubble"></div>
            <div className="bubble"></div>
            <div className="light-effect"></div>
            <div className="light-effect"></div>
            <div className="light-effect"></div>
            <div className="container mx-auto px-4 py-16">
              <div className="text-center mb-12 relative z-10">
                <h1 className="text-4xl font-bold text-white drop-shadow-lg">
                  スカウトの力で世界を加速する
                </h1>
              </div>
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