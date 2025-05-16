import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { UserRole } from '@shared/schema';
import NomadDashboard from '@/components/dashboard/NomadDashboard';
import TouristDashboard from '@/components/dashboard/TouristDashboard';
import BusinessDashboard from '@/components/dashboard/BusinessDashboard';
import { Skeleton } from '@/components/ui/skeleton';

const Dashboard: React.FC = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-48 w-full rounded-lg" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <Skeleton className="h-32 w-full rounded-lg" />
          <Skeleton className="h-32 w-full rounded-lg" />
          <Skeleton className="h-32 w-full rounded-lg" />
        </div>
        <Skeleton className="h-64 w-full rounded-lg" />
        <Skeleton className="h-96 w-full rounded-lg" />
      </div>
    );
  }

  // Render the appropriate dashboard based on user role
  switch (user?.role) {
    case UserRole.NOMAD:
      return <NomadDashboard />;
    case UserRole.BUSINESS:
      return <BusinessDashboard />;
    case UserRole.TOURIST:
    default:
      return <TouristDashboard />;
  }
};

export default Dashboard;
