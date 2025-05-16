import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useLocation } from 'wouter';
import ModernLandingPage from '@/components/landing/ModernLandingPage';

const HomePage: React.FC = () => {
  const { isAuthenticated, needsOnboarding } = useAuth();
  const [_, navigate] = useLocation();
  
  React.useEffect(() => {
    if (isAuthenticated) {
      if (needsOnboarding) {
        navigate('/onboarding');
      } else {
        navigate('/dashboard');
      }
    }
  }, [isAuthenticated, needsOnboarding, navigate]);

  return <ModernLandingPage />;
};

export default HomePage;
