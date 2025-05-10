import React from 'react';
import ProjectList from '../ProjectList';
import ActivityLog from '../ActivityLog';
import DashboardStats from './DashboardStats';
import { Activity } from '../../lib/types';
import RecentAnnouncement from './RecentAnnouncement';

interface DashboardContentProps {
  stats: {
    totalRevenue: number;
    activeCampaigns: number;
    totalCustomers: number;
  };
  activities: Activity[];
  isStatsLoading: boolean;
  campaignCount: number | null;
  projectListKey: number;
  onNewProject: () => void;
  onCampaignSave: () => void;
}

const DashboardContent: React.FC<DashboardContentProps> = ({
  stats,
  activities,
  isStatsLoading,
  campaignCount,
  projectListKey,
  onNewProject,
  onCampaignSave
}) => {
  return (
    <>
      <DashboardStats stats={stats} isLoading={isStatsLoading} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ProjectList 
            key={projectListKey}
            userType="agency" 
            onNewProject={onNewProject}
            initialCount={campaignCount}
          />
        </div>
        <div>
          <RecentAnnouncement />
          <ActivityLog activities={activities} />
        </div>
      </div>
    </>
  );
};

export default DashboardContent;