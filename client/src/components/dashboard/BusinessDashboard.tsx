import React from 'react';
import { useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { Trip, Organization } from '@shared/schema';
import { formatDate, formatDateRange, getDaysUntil } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import TripCard from '@/components/trips/TripCard';
import { CalendarIcon, Map, Briefcase, Users, Landmark, CheckCheck, FilePieChart, Receipt } from 'lucide-react';

const BusinessDashboard: React.FC = () => {
  const [_, navigate] = useLocation();
  
  // Fetch upcoming trips
  const { data: trips, isLoading: tripsLoading } = useQuery<Trip[]>({
    queryKey: ['/api/trips'],
  });

  // Fetch organization data
  const { data: organization, isLoading: orgLoading } = useQuery<Organization>({
    queryKey: ['/api/organizations/current'],
    enabled: false, // Disabled until we implement this endpoint
  });

  // Get upcoming trips sorted by start date
  const upcomingTrips = React.useMemo(() => {
    if (!trips) return [];
    const now = new Date();
    return trips
      .filter(trip => new Date(trip.startDate) > now)
      .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
      .slice(0, 2);
  }, [trips]);

  // Next trip for the hero section
  const nextTrip = upcomingTrips[0];
  
  // Mock team members for demo purposes
  const teamMembers = [
    { id: 1, name: 'Alex Chen', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=32&h=32&q=80', role: 'Director', trips: 5 },
    { id: 2, name: 'Samantha Liu', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=32&h=32&q=80', role: 'Sales Manager', trips: 3 },
    { id: 3, name: 'Michael Scott', avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=32&h=32&q=80', role: 'Regional Manager', trips: 7 },
    { id: 4, name: 'David Wallace', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=32&h=32&q=80', role: 'CEO', trips: 2 },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <Card className="bg-white rounded-lg shadow-sm overflow-hidden">
        {/* Banner Background */}
        <div className="h-48 bg-cover bg-center" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1497366216548-37526070297c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1920&h=480&q=80')" }}>
          <div className="h-full w-full bg-gradient-to-r from-indigo-500 to-transparent bg-opacity-80 px-6 flex items-center">
            <div className="max-w-2xl">
              {tripsLoading ? (
                <>
                  <Skeleton className="h-8 w-60 bg-white/30 mb-2" />
                  <Skeleton className="h-6 w-96 bg-white/30 mb-2" />
                  <Skeleton className="h-6 w-80 bg-white/30 mb-4" />
                  <Skeleton className="h-10 w-40 bg-white/50" />
                </>
              ) : nextTrip ? (
                <>
                  <h2 className="text-white text-3xl font-bold mb-2">Bem-vindo de volta!</h2>
                  <p className="text-white text-lg opacity-90">
                    Sua próxima viagem de negócios para {nextTrip.destination} começa em {getDaysUntil(nextTrip.startDate)} dias. 
                    {nextTrip.organizationId && "Membros da equipe aguardam sua aprovação."}
                  </p>
                  <Button
                    className="mt-4 px-4 py-2 bg-white text-indigo-500 hover:bg-gray-50"
                    onClick={() => navigate(`/trips/${nextTrip.id}`)}
                  >
                    Continuar Planejamento
                  </Button>
                </>
              ) : (
                <>
                  <h2 className="text-white text-3xl font-bold mb-2">Bem-vindo ao seu Dashboard Empresarial!</h2>
                  <p className="text-white text-lg opacity-90">Gerencie as viagens da sua empresa, acompanhe despesas e coordene viagens em equipe.</p>
                  <Button
                    className="mt-4 px-4 py-2 bg-white text-indigo-500 hover:bg-gray-50"
                    onClick={() => navigate('/trip-creator')}
                  >
                    Criar Sua Primeira Viagem
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </Card>
      
      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <Card className="border border-gray-100">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100 mr-4">
                <Briefcase className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Current Business Trips</p>
                {tripsLoading ? (
                  <Skeleton className="h-6 w-32 mt-1" />
                ) : (
                  <p className="text-2xl font-semibold text-gray-900">
                    {trips && trips.filter(t => 
                      new Date(t.startDate) <= new Date() && 
                      new Date(t.endDate) >= new Date() &&
                      t.tripType === 'business'
                    ).length || 0}
                  </p>
                )}
              </div>
            </div>
            <div className="mt-4">
              <a href="/trip-creator" className="text-sm font-medium text-primary-600 hover:text-primary-700">Criar nova viagem →</a>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border border-gray-100">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-indigo-100 mr-4">
                <Users className="h-5 w-5 text-indigo-500" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Team Members</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {teamMembers.length}
                </p>
              </div>
            </div>
            <div className="mt-4 flex items-center">
              <span className="flex-shrink-0 h-2 w-2 rounded-full bg-indigo-500 mr-1.5"></span>
              <p className="text-sm text-gray-500">
                {teamMembers.filter(m => m.trips > 0).length} actively traveling
              </p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border border-gray-100">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-purple-100 mr-4">
                <Receipt className="h-5 w-5 text-purple-500" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Travel Budget</p>
                <p className="text-2xl font-semibold text-gray-900">$8,750 <span className="text-sm font-normal text-gray-500">available</span></p>
              </div>
            </div>
            <div className="mt-2">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-purple-500 h-2 rounded-full" style={{ width: '35%' }}></div>
              </div>
            </div>
            <div className="mt-1 flex justify-between">
              <p className="text-xs text-gray-500">$25,000 total</p>
              <p className="text-xs text-gray-500">35% spent</p>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Upcoming Trip Section */}
      <Card className="border border-gray-100">
        <div className="px-6 py-5 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Upcoming Business Trips</h3>
        </div>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {tripsLoading ? (
              <>
                <Skeleton className="h-40 w-full rounded-lg" />
                <Skeleton className="h-40 w-full rounded-lg" />
              </>
            ) : upcomingTrips.length > 0 ? (
              upcomingTrips.map(trip => (
                <TripCard 
                  key={trip.id} 
                  trip={trip} 
                  roleColor="business"
                  extraInfo={[
                    { icon: <Landmark className="h-4 w-4" />, text: 'Conference venue confirmed', status: 'complete' },
                    { icon: <Users className="h-4 w-4" />, text: '3 team members joining', status: 'complete' },
                    { icon: <CheckCheck className="h-4 w-4" />, text: 'Itinerary approval pending', status: 'pending' }
                  ]} 
                />
              ))
            ) : (
              <div className="col-span-2 text-center py-8">
                <p className="text-gray-500">No upcoming business trips found.</p>
                <Button 
                  className="mt-4 bg-indigo-500 hover:bg-indigo-600 text-white" 
                  onClick={() => navigate('/trip-creator')}
                >
                  Criar Viagem de Negócios
                </Button>
              </div>
            )}
          </div>
          
          {upcomingTrips.length > 0 && (
            <div className="mt-4 text-center">
              <a href="/trips" className="inline-flex items-center text-sm font-medium text-indigo-500 hover:text-indigo-700">
                View all trips
                <svg xmlns="http://www.w3.org/2000/svg" className="ml-1 h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
              </a>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Team Travel Overview */}
      <Card className="border border-gray-100">
        <div className="px-6 py-5 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-lg font-medium text-gray-900">Team Travel Overview</h3>
          <Button variant="outline" size="sm" className="text-indigo-500">Manage Team</Button>
        </div>
        <CardContent className="p-6">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Team Member</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Next Trip</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {teamMembers.map((member) => (
                  <tr key={member.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <img className="h-10 w-10 rounded-full" src={member.avatar} alt="" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{member.name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{member.role}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {member.id % 2 === 0 ? 'London, UK (May 15-20)' : 'New York, USA (Jun 3-10)'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${member.id % 3 === 0 
                          ? 'bg-yellow-100 text-yellow-800' 
                          : member.id % 2 === 0 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {member.id % 3 === 0 
                          ? 'Pending Approval' 
                          : member.id % 2 === 0 
                            ? 'Confirmed' 
                            : 'Planning'
                        }
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <Button size="sm" variant="ghost" className="text-indigo-500 hover:text-indigo-700">
                        View Details
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
      
      {/* Business Travel Analytics */}
      <Card className="border border-gray-100">
        <div className="px-6 py-5 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-lg font-medium text-gray-900">Business Travel Analytics</h3>
          <Button variant="outline" size="sm" className="flex items-center text-indigo-500">
            <FilePieChart className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Travel Spend by Category */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-4">Travel Spend by Category</h4>
              <div className="h-64 flex items-center justify-center">
                <div className="w-full max-w-md">
                  <div className="relative pt-1">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full bg-indigo-200 text-indigo-600">
                          Flights
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-semibold inline-block text-indigo-600">
                          45%
                        </span>
                      </div>
                    </div>
                    <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-indigo-200">
                      <div style={{ width: "45%" }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-indigo-500"></div>
                    </div>
                  </div>
                  
                  <div className="relative pt-1">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full bg-blue-200 text-blue-600">
                          Accommodations
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-semibold inline-block text-blue-600">
                          30%
                        </span>
                      </div>
                    </div>
                    <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-blue-200">
                      <div style={{ width: "30%" }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-500"></div>
                    </div>
                  </div>
                  
                  <div className="relative pt-1">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full bg-purple-200 text-purple-600">
                          Meals
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-semibold inline-block text-purple-600">
                          15%
                        </span>
                      </div>
                    </div>
                    <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-purple-200">
                      <div style={{ width: "15%" }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-purple-500"></div>
                    </div>
                  </div>
                  
                  <div className="relative pt-1">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full bg-green-200 text-green-600">
                          Ground Transport
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-semibold inline-block text-green-600">
                          10%
                        </span>
                      </div>
                    </div>
                    <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-green-200">
                      <div style={{ width: "10%" }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-green-500"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Top Business Destinations */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-4">Top Business Destinations</h4>
              <div className="space-y-4">
                <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                  <div className="flex-shrink-0 h-10 w-10 rounded-full bg-cover bg-center" style={{ backgroundImage: `url('https://images.unsplash.com/photo-1526129318478-62dda35a7a14?auto=format&fit=crop&w=48&h=48&q=80')` }}></div>
                  <div className="ml-3 flex-grow">
                    <div className="flex justify-between">
                      <h5 className="text-sm font-medium text-gray-900">London, UK</h5>
                      <span className="text-sm text-gray-500">42%</span>
                    </div>
                    <div className="mt-1 w-full bg-gray-200 rounded-full h-1.5">
                      <div className="bg-indigo-500 h-1.5 rounded-full" style={{ width: '42%' }}></div>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                  <div className="flex-shrink-0 h-10 w-10 rounded-full bg-cover bg-center" style={{ backgroundImage: `url('https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&w=48&h=48&q=80')` }}></div>
                  <div className="ml-3 flex-grow">
                    <div className="flex justify-between">
                      <h5 className="text-sm font-medium text-gray-900">New York, USA</h5>
                      <span className="text-sm text-gray-500">28%</span>
                    </div>
                    <div className="mt-1 w-full bg-gray-200 rounded-full h-1.5">
                      <div className="bg-indigo-500 h-1.5 rounded-full" style={{ width: '28%' }}></div>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                  <div className="flex-shrink-0 h-10 w-10 rounded-full bg-cover bg-center" style={{ backgroundImage: `url('https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?auto=format&fit=crop&w=48&h=48&q=80')` }}></div>
                  <div className="ml-3 flex-grow">
                    <div className="flex justify-between">
                      <h5 className="text-sm font-medium text-gray-900">Singapore</h5>
                      <span className="text-sm text-gray-500">18%</span>
                    </div>
                    <div className="mt-1 w-full bg-gray-200 rounded-full h-1.5">
                      <div className="bg-indigo-500 h-1.5 rounded-full" style={{ width: '18%' }}></div>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                  <div className="flex-shrink-0 h-10 w-10 rounded-full bg-cover bg-center" style={{ backgroundImage: `url('https://images.unsplash.com/photo-1552334105-fb8b98258c8b?auto=format&fit=crop&w=48&h=48&q=80')` }}></div>
                  <div className="ml-3 flex-grow">
                    <div className="flex justify-between">
                      <h5 className="text-sm font-medium text-gray-900">Tokyo, Japan</h5>
                      <span className="text-sm text-gray-500">12%</span>
                    </div>
                    <div className="mt-1 w-full bg-gray-200 rounded-full h-1.5">
                      <div className="bg-indigo-500 h-1.5 rounded-full" style={{ width: '12%' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BusinessDashboard;
