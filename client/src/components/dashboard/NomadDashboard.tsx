import React from 'react';
import { useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { Trip, Workspace, VisaInformation } from '@shared/schema';
import { formatDate, formatDateRange, getDaysUntil } from '@/lib/utils';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import TripCard from '@/components/trips/TripCard';
import WorkspaceCard from '@/components/trips/WorkspaceCard';
import VisaCard from '@/components/trips/VisaCard';
import CommunityCard from '@/components/community/CommunityCard';
import { CalendarIcon, Map, Wifi, Home, Plane } from 'lucide-react';

const NomadDashboard: React.FC = () => {
  const [_, navigate] = useLocation();
  const { t } = useTranslation();
  
  // Fetch upcoming trips
  const { data: trips, isLoading: tripsLoading } = useQuery<Trip[]>({
    queryKey: ['/api/trips'],
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
  
  // Fetch workspaces for the upcoming trip destination
  const { data: workspaces, isLoading: workspacesLoading } = useQuery<Workspace[]>({
    queryKey: ['/api/workspaces', nextTrip?.destination, nextTrip?.country],
    enabled: !!nextTrip,
    queryFn: () => 
      fetch(`/api/workspaces?city=${nextTrip?.destination}&country=${nextTrip?.country}`)
        .then(res => res.json()),
  });

  // Fetch visa information for the upcoming trip
  const { data: visaInfo, isLoading: visaLoading } = useQuery<VisaInformation>({
    queryKey: ['/api/visa-information', nextTrip?.country],
    enabled: !!nextTrip,
    queryFn: () => 
      fetch(`/api/visa-information?country=${nextTrip?.country}`)
        .then(res => res.json()),
  });

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <Card className="bg-white rounded-lg shadow-sm overflow-hidden">
        {/* Banner Background */}
        <div className="h-48 bg-cover bg-center" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1506953823976-52e1fdc0149a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1920&h=480&q=80')" }}>
          <div className="h-full w-full bg-gradient-to-r from-emerald-500 to-transparent bg-opacity-80 px-6 flex items-center">
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
                  <h2 className="text-white text-3xl font-bold mb-2">Welcome back!</h2>
                  <p className="text-white text-lg opacity-90">
                    Your next trip to {nextTrip.destination} starts in {getDaysUntil(nextTrip.startDate)} days. 
                    Let's finish planning your workspaces and accommodations.
                  </p>
                  <Button
                    className="mt-4 px-4 py-2 bg-white text-emerald-500 hover:bg-gray-50"
                    onClick={() => navigate(`/trips/${nextTrip.id}`)}
                  >
                    Continue Planning
                  </Button>
                </>
              ) : (
                <>
                  <h2 className="text-white text-3xl font-bold mb-2">Welcome to your Digital Nomad Dashboard!</h2>
                  <p className="text-white text-lg opacity-90">Plan your next remote work adventure with workspace recommendations and visa information.</p>
                  <Button
                    className="mt-4 px-4 py-2 bg-white text-emerald-500 hover:bg-gray-50"
                    onClick={() => navigate('/trip-creator')}
                  >
                    {t('dashboard.createTrip', 'Criar Viagem')}
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
                <Plane className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Current Trip</p>
                {tripsLoading ? (
                  <Skeleton className="h-6 w-32 mt-1" />
                ) : (
                  <p className="text-2xl font-semibold text-gray-900">
                    {trips && trips.some(t => new Date(t.startDate) <= new Date() && new Date(t.endDate) >= new Date())
                      ? "Active"
                      : "None Active"}
                  </p>
                )}
              </div>
            </div>
            <div className="mt-4">
              <a href="/trip-creator" className="text-sm font-medium text-primary-600 hover:text-primary-700">{t('dashboard.createNewTrip', 'Criar nova viagem')} →</a>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border border-gray-100">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100 mr-4">
                <Map className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Countries Visited</p>
                {tripsLoading ? (
                  <Skeleton className="h-6 w-16 mt-1" />
                ) : (
                  <p className="text-2xl font-semibold text-gray-900">
                    {trips 
                      ? new Set(trips.map(trip => trip.country)).size 
                      : 0}
                  </p>
                )}
              </div>
            </div>
            <div className="mt-4 flex items-center">
              <span className="flex-shrink-0 h-2 w-2 rounded-full bg-green-500 mr-1.5"></span>
              <p className="text-sm text-gray-500">
                {tripsLoading ? (
                  <Skeleton className="h-4 w-40" />
                ) : (
                  `${new Set(trips?.filter(t => new Date(t.startDate).getFullYear() === new Date().getFullYear()).map(t => t.country)).size || 0} new this year`
                )}
              </p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border border-gray-100">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-purple-100 mr-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-purple-500"><path d="M2 22h20"/><path d="M17 22V6c0-1.1-.9-2-2-2H9a2 2 0 0 0-2 2v16"/><path d="M12 12h5"/><path d="M12 16h5"/><path d="M7 22V6"/><path d="M7 10h.01"/><path d="M7 14h.01"/><path d="M7 18h.01"/></svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Travel Budget</p>
                <p className="text-2xl font-semibold text-gray-900">$2,450 <span className="text-sm font-normal text-gray-500">available</span></p>
              </div>
            </div>
            <div className="mt-2">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-purple-500 h-2 rounded-full" style={{ width: '65%' }}></div>
              </div>
            </div>
            <div className="mt-1 flex justify-between">
              <p className="text-xs text-gray-500">$4,500 total</p>
              <p className="text-xs text-gray-500">65% remaining</p>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Upcoming Trip Section */}
      <Card className="border border-gray-100">
        <div className="px-6 py-5 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Upcoming Trips</h3>
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
                  roleColor="nomad"
                  extraInfo={[
                    { icon: <Wifi className="h-4 w-4" />, text: t('dashboard.workspacesIdentified', '3 espaços de trabalho identificados'), status: 'complete' },
                    { icon: <Home className="h-4 w-4" />, text: t('dashboard.accommodationConfirmed', 'Acomodação confirmada'), status: 'complete' },
                    { icon: <Wifi className="h-4 w-4" />, text: t('dashboard.wifiResearchPending', 'Pesquisa de WiFi pendente'), status: 'pending' }
                  ]} 
                />
              ))
            ) : (
              <div className="col-span-2 text-center py-8">
                <p className="text-gray-500">{t('dashboard.noTrips', 'Você não tem viagens planejadas')}</p>
                <Button 
                  className="mt-4 bg-emerald-500 hover:bg-emerald-600 text-white" 
                  onClick={() => navigate('/trip-creator')}
                >
                  {t('dashboard.createTrip', 'Criar Viagem')}
                </Button>
              </div>
            )}
          </div>
          
          {upcomingTrips.length > 0 && (
            <div className="mt-4 text-center">
              <a href="/trips" className="inline-flex items-center text-sm font-medium text-emerald-500 hover:text-emerald-700">
                {t('dashboard.viewAll', 'Ver Todas')}
                <svg xmlns="http://www.w3.org/2000/svg" className="ml-1 h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
              </a>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Workspace Recommendations */}
      {nextTrip && (
        <Card className="border border-gray-100">
          <div className="px-6 py-5 border-b border-gray-200 flex justify-between items-center">
            <h3 className="text-lg font-medium text-gray-900">{t('dashboard.recommendedWorkspaces', 'Espaços de Trabalho Recomendados para')} {nextTrip.destination}</h3>
            <a href="/workspaces" className="text-sm font-medium text-emerald-500 hover:text-emerald-700">{t('dashboard.viewAll', 'Ver Todos')}</a>
          </div>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {workspacesLoading ? (
                <>
                  <Skeleton className="h-64 w-full rounded-lg" />
                  <Skeleton className="h-64 w-full rounded-lg" />
                  <Skeleton className="h-64 w-full rounded-lg" />
                </>
              ) : workspaces && workspaces.length > 0 ? (
                workspaces.slice(0, 3).map(workspace => (
                  <WorkspaceCard key={workspace.id} workspace={workspace} />
                ))
              ) : (
                <div className="col-span-3 text-center py-8">
                  <p className="text-gray-500">No workspace recommendations available for this destination yet.</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Visa Information */}
      {nextTrip && (
        <Card className="border border-gray-100">
          <div className="px-6 py-5 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Visa Information for Upcoming Trips</h3>
          </div>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {visaLoading ? (
                <>
                  <Skeleton className="h-64 w-full rounded-lg" />
                  <Skeleton className="h-64 w-full rounded-lg" />
                </>
              ) : visaInfo ? (
                <VisaCard visaInfo={visaInfo} />
              ) : (
                <div className="col-span-2 text-center py-8">
                  <p className="text-gray-500">No visa information available for {nextTrip.country}.</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Community Section */}
      <Card className="border border-gray-100">
        <div className="px-6 py-5 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-lg font-medium text-gray-900">Nomad Community</h3>
          <a href="/community" className="text-sm font-medium text-emerald-500 hover:text-emerald-700">See All</a>
        </div>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <CommunityCard 
              type="event"
              title="Bali Digital Nomad Meetup"
              date="Feb 18, 2023 • 18:00"
              location="Dojo Bali, Canggu"
              attendees={38}
              imageUrl="https://images.unsplash.com/photo-1543269865-cbf427effbad?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=300&h=300&q=80"
            />
            
            <CommunityCard 
              type="forum"
              title="Best cafés with reliable WiFi in Canggu?"
              author={{
                name: "Emma Wilson",
                imageUrl: "https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=48&h=48&q=80",
                postedTime: "2 days ago"
              }}
              content="I'm heading to Bali next week and looking for recommendations on cafés that have reliable WiFi for working. Any suggestions from the community?"
              replies={24}
              likes={42}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NomadDashboard;
