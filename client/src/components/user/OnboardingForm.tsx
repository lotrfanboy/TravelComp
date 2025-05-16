import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { useMutation } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import { apiRequest } from '@/lib/queryClient';
import { useAuth } from '@/hooks/useAuth';
import { UserRole } from '@shared/schema';
import { useToast } from '@/hooks/use-toast';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, Laptop, Briefcase } from 'lucide-react';

interface RoleOption {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
}

const OnboardingForm: React.FC = () => {
  const [_, navigate] = useLocation();
  const { toast } = useToast();
  const { refetch } = useAuth();
  const [selectedRole, setSelectedRole] = useState<string | null>(null);

  const roleOptions: RoleOption[] = [
    {
      id: UserRole.TOURIST,
      title: 'Tourist',
      description: 'I want to explore new places, discover attractions, and plan vacation trips.',
      icon: <MapPin className="h-8 w-8 text-yellow-500" />,
    },
    {
      id: UserRole.NOMAD,
      title: 'Digital Nomad',
      description: 'I need to find workspaces, check visa requirements, and plan extended stays while working remotely.',
      icon: <Laptop className="h-8 w-8 text-emerald-500" />,
    },
    {
      id: UserRole.BUSINESS,
      title: 'Business Traveler',
      description: 'I need to coordinate team trips, track business expenses, and ensure policy compliance.',
      icon: <Briefcase className="h-8 w-8 text-indigo-500" />,
    },
  ];

  const setRole = useMutation({
    mutationFn: async (role: string) => {
      const response = await apiRequest('POST', '/api/users/set-role', { role });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Profile Updated',
        description: 'Your user role has been set successfully.',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
      refetch();
      navigate('/dashboard');
    },
    onError: (error) => {
      console.error('Error setting user role:', error);
      toast({
        title: 'Error',
        description: 'Failed to update your profile. Please try again.',
        variant: 'destructive',
      });
    },
  });

  const handleContinue = () => {
    if (selectedRole) {
      setRole.mutate(selectedRole);
    } else {
      toast({
        title: 'Selection Required',
        description: 'Please select a user role to continue.',
        variant: 'destructive',
      });
    }
  };

  const getRoleBorder = (roleId: string) => {
    if (selectedRole !== roleId) return 'border-gray-200';
    
    switch (roleId) {
      case UserRole.TOURIST:
        return 'border-yellow-500';
      case UserRole.NOMAD:
        return 'border-emerald-500';
      case UserRole.BUSINESS:
        return 'border-indigo-500';
      default:
        return 'border-blue-500';
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Card className="w-full">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Welcome to Voyagewise!</CardTitle>
          <CardDescription className="text-lg">
            Tell us about your travel style so we can customize your experience.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {roleOptions.map((option) => (
                <div
                  key={option.id}
                  className={`border-2 rounded-lg p-6 cursor-pointer transition-all hover:shadow-md ${getRoleBorder(option.id)}`}
                  onClick={() => setSelectedRole(option.id)}
                >
                  <div className="flex flex-col items-center text-center">
                    <div className="mb-4 p-4 rounded-full bg-gray-50">
                      {option.icon}
                    </div>
                    <h3 className="text-lg font-semibold mb-2">{option.title}</h3>
                    <p className="text-sm text-gray-600">{option.description}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-blue-50 rounded-lg p-4 text-sm text-blue-800">
              <p className="font-medium">You can change your role later in the Settings page.</p>
              <p>Different roles get different features and recommendations tailored to their needs.</p>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button 
            onClick={handleContinue}
            disabled={!selectedRole || setRole.isPending}
            className={`px-8 ${
              selectedRole === UserRole.TOURIST
                ? 'bg-yellow-500 hover:bg-yellow-600'
                : selectedRole === UserRole.NOMAD
                  ? 'bg-emerald-500 hover:bg-emerald-600'
                  : selectedRole === UserRole.BUSINESS
                    ? 'bg-indigo-500 hover:bg-indigo-600'
                    : 'bg-blue-500 hover:bg-blue-600'
            }`}
          >
            {setRole.isPending ? 'Setting up...' : 'Continue to Dashboard'}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default OnboardingForm;
