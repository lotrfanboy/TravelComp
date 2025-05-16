import React from 'react';
import { useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { Trip, Attraction } from '@shared/schema';
import { formatDate, formatDateRange, getDaysUntil } from '@/lib/utils';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import TripCard from '@/components/trips/TripCard';
import CommunityCard from '@/components/community/CommunityCard';
import {
  CalendarIcon, Map, Camera, Utensils, Plane, Globe, CreditCard, 
  LucideClock, PlusCircle, User, ArrowRight, HelpCircle, Sparkles,
  Hotel, Waves, Palmtree, Wallet, MapPin, Bell
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Badge } from '@/components/ui/badge';
import { useIsMobile } from '@/hooks/use-mobile';
import { useToast } from '@/hooks/use-toast';

const TouristDashboard: React.FC = () => {
  const [_, navigate] = useLocation();
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const { toast } = useToast();
  const { t } = useTranslation();
  
  // Fetch upcoming trips
  const { data: trips, isLoading: tripsLoading } = useQuery<Trip[]>({
    queryKey: ['/api/trips'],
  });

  // Get recommended places for destinations
  const { data: recommendations, isLoading: recommendationsLoading } = useQuery<any[]>({
    queryKey: ['/api/recommendations'],
  });

  // Get budget information
  const { data: budget, isLoading: budgetLoading } = useQuery<any>({
    queryKey: ['/api/budget/user'],
  });

  // Get community highlights
  const { data: communityHighlights, isLoading: communityLoading } = useQuery<any[]>({
    queryKey: ['/api/community/highlights'],
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

  // Current active trip
  const activeTrip = React.useMemo(() => {
    if (!trips) return null;
    const now = new Date();
    return trips.find(t => new Date(t.startDate) <= now && new Date(t.endDate) >= now);
  }, [trips]);

  // Next trip for the hero section
  const nextTrip = upcomingTrips[0];
  
  // Fetch attractions for the upcoming trip destination
  const { data: attractions, isLoading: attractionsLoading } = useQuery<Attraction[]>({
    queryKey: ['/api/attractions', nextTrip?.destination, nextTrip?.country],
    enabled: !!nextTrip,
    queryFn: () => 
      fetch(`/api/attractions?city=${nextTrip?.destination}&country=${nextTrip?.country}`)
        .then(res => res.json()),
  });

  // Collection of travel themes for smart suggestions
  const travelThemes = [
    { 
      id: 'cultural', 
      title: 'Cultural Escapes', 
      description: 'Explore museums, historical sites, and local traditions',
      icon: <Globe className="h-10 w-10 text-[#19B4B0]" />,
      color: 'bg-[#19B4B0]/10 text-[#19B4B0]',
      borderColor: 'border-[#19B4B0]/20'
    },
    { 
      id: 'beach', 
      title: 'Beach Getaways', 
      description: 'Relax on beautiful beaches and enjoy water activities',
      icon: <Waves className="h-10 w-10 text-[#88C2BF]" />,
      color: 'bg-[#88C2BF]/10 text-[#88C2BF]',
      borderColor: 'border-[#88C2BF]/20'
    },
    { 
      id: 'weekend', 
      title: 'Weekend Trips', 
      description: 'Quick escapes perfect for a refreshing weekend',
      icon: <LucideClock className="h-10 w-10 text-[#82C889]" />,
      color: 'bg-[#82C889]/10 text-[#82C889]',
      borderColor: 'border-[#82C889]/20'
    }
  ];

  const handleNotificationClick = () => {
    toast({
      title: "Notifications",
      description: "You have no new notifications at this time.",
    });
  };

  return (
    <div className="space-y-8">
      {/* Welcome Section with Hero Banner */}
      <Card className="bg-white rounded-2xl shadow-md overflow-hidden border-0">
        <div className="h-72 md:h-80 bg-cover bg-center relative" 
          style={{ 
            backgroundImage: "url('https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2000&h=800&q=80')" 
          }}>
          <div className="absolute inset-0 bg-gradient-to-r from-[#434342]/80 to-transparent"></div>
          <div className="absolute inset-0 flex items-center px-12 md:px-16">
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
                  <h2 className="text-white text-3xl md:text-4xl font-bold mb-6">
                    {t('dashboard.welcome', 'Bem-vindo(a)')} {user?.firstName || t('dashboard.explorer', 'Explorador')}!
                  </h2>
                  <p className="text-white text-lg md:text-xl opacity-90 mb-8">
                    {t('dashboard.nextTripStarts', 'Sua próxima viagem para')} <span className="font-semibold">{nextTrip.destination}</span> {t('dashboard.startsInDays', 'começa em')} {getDaysUntil(nextTrip.startDate)} {t('dashboard.days', 'dias')}.
                  </p>
                  <div className="flex flex-wrap gap-5 mt-10">
                    <Button
                      size="lg"
                      className="px-8 py-4 bg-[#19B4B0] hover:bg-[#19B4B0]/90 text-white rounded-full shadow-lg hover:shadow-xl transition-all"
                      onClick={() => navigate(`/trips/${nextTrip.id}`)}
                    >
                      {t('dashboard.continuePlanning', 'Continuar Planejamento')}
                    </Button>
                    <Button
                      variant="outline"
                      size="lg"
                      className="px-8 py-4 bg-white/10 text-white border-white/30 hover:bg-white/20 rounded-full shadow-lg hover:shadow-xl transition-all"
                      onClick={() => navigate('/explore')}
                    >
                      Explore Destinations
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <h2 className="text-white text-3xl md:text-4xl font-bold mb-6">
                    {t('dashboard.welcome', 'Bem-vindo(a)')}, {user?.firstName || t('dashboard.explorer', 'Explorador')}! {t('dashboard.readyForAdventure', 'Pronto para sua próxima aventura?')}
                  </h2>
                  <p className="text-white text-lg md:text-xl opacity-90 mb-8">
                    {t('dashboard.startPlanning', 'Comece a planejar sua viagem dos sonhos com recomendações personalizadas e experiências locais.')}
                  </p>
                  <div className="flex flex-wrap gap-5 mt-10">
                    <Button
                      size="lg"
                      className="px-8 py-4 bg-[#19B4B0] hover:bg-[#19B4B0]/90 text-white rounded-full shadow-lg hover:shadow-xl transition-all"
                      onClick={() => navigate('/trip-creator')}
                    >
                      <PlusCircle className="mr-2 h-5 w-5" />
                      {t('dashboard.createNewTrip', 'Criar Nova Viagem')}
                    </Button>
                    <Button
                      variant="outline"
                      size="lg"
                      className="px-8 py-4 bg-white/10 text-white border-white/30 hover:bg-white/20 rounded-full shadow-lg hover:shadow-xl transition-all"
                      onClick={() => navigate('/explore')}
                    >
                      Explore Destinations
                    </Button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </Card>
      
      {/* Quick Actions Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 px-2">
        <Button 
          variant="outline" 
          className="h-auto py-8 px-6 rounded-xl border-2 border-[#88C2BF]/40 bg-white hover:bg-[#88C2BF]/10 flex flex-col items-center justify-center text-[#434342] gap-4 shadow-sm hover:shadow-md transition-all"
          onClick={() => navigate('/trip-creator')}
        >
          <div className="h-16 w-16 rounded-full bg-[#88C2BF]/15 flex items-center justify-center shadow-inner">
            <PlusCircle className="h-8 w-8 text-[#88C2BF]" />
          </div>
          <span className="font-medium text-base">{t('dashboard.createTrip', 'Criar Viagem')}</span>
        </Button>
        
        <Button 
          variant="outline" 
          className="h-auto py-8 px-6 rounded-xl border-2 border-[#19B4B0]/40 bg-white hover:bg-[#19B4B0]/10 flex flex-col items-center justify-center text-[#434342] gap-4 shadow-sm hover:shadow-md transition-all"
          onClick={() => navigate('/trips')}
        >
          <div className="h-16 w-16 rounded-full bg-[#19B4B0]/15 flex items-center justify-center shadow-inner">
            <Plane className="h-8 w-8 text-[#19B4B0]" />
          </div>
          <span className="font-medium text-base">{t('dashboard.myTrips', 'Minhas Viagens')}</span>
        </Button>
        
        <Button 
          variant="outline" 
          className="h-auto py-8 px-6 rounded-xl border-2 border-[#82C889]/40 bg-white hover:bg-[#82C889]/10 flex flex-col items-center justify-center text-[#434342] gap-4 shadow-sm hover:shadow-md transition-all"
          onClick={() => navigate('/budget')}
        >
          <div className="h-16 w-16 rounded-full bg-[#82C889]/15 flex items-center justify-center shadow-inner">
            <Wallet className="h-8 w-8 text-[#82C889]" />
          </div>
          <span className="font-medium text-base">{t('dashboard.budget', 'Orçamento')}</span>
        </Button>
        
        <Button 
          variant="outline" 
          className="h-auto py-8 px-6 rounded-xl border-2 border-[#434342]/40 bg-white hover:bg-[#434342]/10 flex flex-col items-center justify-center text-[#434342] gap-4 shadow-sm hover:shadow-md transition-all"
          onClick={handleNotificationClick}
        >
          <div className="h-16 w-16 rounded-full bg-[#434342]/15 flex items-center justify-center shadow-inner">
            <Bell className="h-8 w-8 text-[#434342]" />
          </div>
          <span className="font-medium text-base">{t('dashboard.notifications', 'Notificações')}</span>
        </Button>
      </div>
      
      {/* Trip Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Trip Stats */}
        <div className="md:col-span-1">
          <Card className="rounded-xl border border-[#88C2BF]/20 shadow-sm h-full">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl font-bold text-[#434342]">{t('dashboard.tripOverview', 'Visão Geral da Viagem')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Active Trip */}
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-[#19B4B0]/10">
                  <Plane className="h-5 w-5 text-[#19B4B0]" />
                </div>
                <div>
                  <p className="text-sm font-medium text-[#434342]/70">{t('dashboard.activeTrip', 'Viagem Ativa')}</p>
                  {tripsLoading ? (
                    <Skeleton className="h-6 w-32 mt-1" />
                  ) : activeTrip ? (
                    <p className="text-lg font-semibold text-[#434342]">
                      {activeTrip.destination}, {activeTrip.country}
                    </p>
                  ) : (
                    <p className="text-lg font-semibold text-[#434342]">{t('dashboard.noneActive', 'Nenhuma Ativa')}</p>
                  )}
                </div>
              </div>
              
              {/* Countries Count */}
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-[#82C889]/10">
                  <Globe className="h-5 w-5 text-[#82C889]" />
                </div>
                <div>
                  <p className="text-sm font-medium text-[#434342]/70">{t('dashboard.countriesVisited', 'Países Visitados')}</p>
                  {tripsLoading ? (
                    <Skeleton className="h-6 w-16 mt-1" />
                  ) : (
                    <p className="text-lg font-semibold text-[#434342]">
                      {trips 
                        ? new Set(trips.map(trip => trip.country)).size 
                        : 0}
                    </p>
                  )}
                </div>
              </div>
              
              {/* Budget Overview */}
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-[#88C2BF]/10">
                  <CreditCard className="h-5 w-5 text-[#88C2BF]" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-[#434342]/70">{t('dashboard.budgetStatus', 'Status do Orçamento')}</p>
                  {budgetLoading ? (
                    <div className="mt-1">
                      <Skeleton className="h-6 w-full" />
                    </div>
                  ) : budget ? (
                    <>
                      <p className="text-lg font-semibold text-[#434342]">
                        ${budget.available} <span className="text-sm font-normal text-[#434342]/60">{t('dashboard.available', 'disponível')}</span>
                      </p>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                        <div 
                          className="bg-[#19B4B0] h-2 rounded-full" 
                          style={{ width: `${budget.percentage}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between text-xs text-[#434342]/60 mt-1">
                        <span>${budget.total} {t('dashboard.total', 'total')}</span>
                        <span>{budget.percentage}% {t('dashboard.remaining', 'restante')}</span>
                      </div>
                    </>
                  ) : (
                    <>
                      <p className="text-lg font-semibold text-[#434342]">
                        $2,450 <span className="text-sm font-normal text-[#434342]/60">{t('dashboard.available', 'disponível')}</span>
                      </p>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                        <div className="bg-[#19B4B0] h-2 rounded-full" style={{ width: '65%' }}></div>
                      </div>
                      <div className="flex justify-between text-xs text-[#434342]/60 mt-1">
                        <span>$4,500 {t('dashboard.total', 'total')}</span>
                        <span>65% {t('dashboard.remaining', 'restante')}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                variant="outline" 
                className="w-full text-[#19B4B0] border-[#19B4B0]/30 hover:bg-[#19B4B0]/5"
                onClick={() => navigate('/budget')}
              >
                {t('dashboard.viewBudgetDetails', 'Ver Detalhes do Orçamento')}
              </Button>
            </CardFooter>
          </Card>
        </div>
        
        {/* Upcoming Trips */}
        <div className="md:col-span-2">
          <Card className="rounded-xl border border-[#19B4B0]/20 shadow-sm h-full">
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <CardTitle className="text-xl font-bold text-[#434342]">{t('dashboard.upcomingTrips', 'Próximas Viagens')}</CardTitle>
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-[#19B4B0] hover:text-[#19B4B0]/80 hover:bg-[#19B4B0]/5"
                onClick={() => navigate('/trips')}
              >
                {t('dashboard.viewAll', 'Ver Todos')}
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {tripsLoading ? (
                  <>
                    <Skeleton className="h-32 w-full rounded-lg" />
                    <Skeleton className="h-32 w-full rounded-lg" />
                  </>
                ) : upcomingTrips.length > 0 ? (
                  upcomingTrips.map(trip => (
                    <div key={trip.id} className="p-4 rounded-xl border border-[#19B4B0]/10 hover:border-[#19B4B0]/30 bg-white hover:bg-[#19B4B0]/5 transition duration-200">
                      <div className="flex items-start gap-4">
                        <div className="w-16 h-16 rounded-lg bg-[#19B4B0]/10 flex items-center justify-center flex-shrink-0">
                          <Plane className="h-8 w-8 text-[#19B4B0]" />
                        </div>
                        <div className="flex-1">
                          <div className="flex flex-wrap justify-between items-start gap-2">
                            <h3 className="text-lg font-semibold text-[#434342]">{trip.name || `Trip to ${trip.destination}`}</h3>
                            <Badge className="bg-[#19B4B0]/10 text-[#19B4B0] hover:bg-[#19B4B0]/20 border border-[#19B4B0]/20">
                              {getDaysUntil(trip.startDate)} days away
                            </Badge>
                          </div>
                          <p className="text-[#434342]/70 text-sm mt-1">
                            <MapPin className="h-4 w-4 inline mr-1" />
                            {trip.destination}, {trip.country}
                          </p>
                          <p className="text-[#434342]/70 text-sm mt-1">
                            <CalendarIcon className="h-4 w-4 inline mr-1" />
                            {formatDateRange(trip.startDate, trip.endDate)}
                          </p>
                          <div className="flex flex-wrap gap-2 mt-3">
                            <Button 
                              size="sm" 
                              variant="outline"
                              className="border-[#19B4B0]/30 text-[#19B4B0] hover:bg-[#19B4B0]/5"
                              onClick={() => navigate(`/trips/${trip.id}`)}
                            >
                              View Details
                            </Button>
                            <Button 
                              size="sm"
                              className="bg-[#19B4B0] hover:bg-[#19B4B0]/90 text-white"
                              onClick={() => navigate(`/trips/${trip.id}/edit`)}
                            >
                              Edit Trip
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center">
                    <div className="mx-auto w-16 h-16 rounded-full bg-[#19B4B0]/10 flex items-center justify-center mb-4">
                      <Plane className="h-8 w-8 text-[#19B4B0]" />
                    </div>
                    <h3 className="text-lg font-medium text-[#434342] mb-2">No upcoming trips</h3>
                    <p className="text-[#434342]/70 mb-4">Start planning your next adventure now!</p>
                    <Button 
                      className="bg-[#19B4B0] hover:bg-[#19B4B0]/90 text-white"
                      onClick={() => navigate('/trip-creator')}
                    >
                      <PlusCircle className="mr-2 h-5 w-5" />
                      Create a Trip
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Smart Suggestions */}
      <Card className="rounded-xl border border-[#82C889]/20 shadow-sm">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-[#82C889]" />
            <CardTitle className="text-xl font-bold text-[#434342]">Smart Suggestions</CardTitle>
          </div>
          <CardDescription className="text-[#434342]/70">
            Personalized recommendations based on your preferences
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {recommendationsLoading ? (
              Array(3).fill(0).map((_, index) => (
                <Skeleton key={index} className="h-48 w-full rounded-xl" />
              ))
            ) : (
              travelThemes.map((theme) => (
                <Card 
                  key={theme.id} 
                  className={`rounded-xl border ${theme.borderColor} hover:shadow-md transition-shadow cursor-pointer`}
                  onClick={() => navigate(`/explore?theme=${theme.id}`)}
                >
                  <CardContent className="p-6">
                    <div className="flex flex-col items-center text-center gap-4">
                      <div className={`p-4 rounded-full ${theme.color}`}>
                        {theme.icon}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-[#434342] mb-1">{theme.title}</h3>
                        <p className="text-sm text-[#434342]/70">{theme.description}</p>
                      </div>
                      <Button 
                        variant="ghost" 
                        className="mt-2 text-[#434342] hover:text-[#434342]/80 hover:bg-[#434342]/5"
                      >
                        Explore <ArrowRight className="ml-1 h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </CardContent>
      </Card>
      
      {/* Attractions Section */}
      {nextTrip && (
        <Card className="rounded-xl border border-[#88C2BF]/20 shadow-sm">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-xl font-bold text-[#434342]">
                Recommended for {nextTrip.destination}
              </CardTitle>
              <CardDescription className="text-[#434342]/70">
                Popular attractions to add to your upcoming trip
              </CardDescription>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-[#88C2BF] hover:text-[#88C2BF]/80 hover:bg-[#88C2BF]/5"
              onClick={() => navigate('/explore')}
            >
              View All
            </Button>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {attractionsLoading ? (
                Array(3).fill(0).map((_, index) => (
                  <Skeleton key={index} className="h-64 w-full rounded-xl" />
                ))
              ) : attractions && attractions.length > 0 ? (
                attractions.slice(0, 3).map(attraction => (
                  <Card 
                    key={attraction.id} 
                    className="rounded-xl overflow-hidden border border-[#88C2BF]/20 hover:shadow-md transition-shadow"
                  >
                    <div className="h-40 bg-cover bg-center" style={{ 
                      backgroundImage: `url(${attraction.imageUrl || 'https://images.unsplash.com/photo-1517502884422-41eaead166d4?auto=format&fit=crop&w=600&h=300&q=60'})` 
                    }}></div>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <h4 className="text-lg font-semibold text-[#434342]">{attraction.name}</h4>
                        <div className="flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#19B4B0]" viewBox="0 0 24 24" fill="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
                          <span className="ml-1 text-sm text-[#434342]/70">{attraction.rating || 4.7}</span>
                        </div>
                      </div>
                      <p className="text-sm text-[#434342]/70 mt-1">{attraction.city}, {attraction.country}</p>
                      <div className="flex flex-wrap gap-2 mt-2">
                        <Badge className="bg-[#19B4B0]/10 text-[#19B4B0] hover:bg-[#19B4B0]/20 border border-[#19B4B0]/20">
                          {attraction.type}
                        </Badge>
                        {attraction.price && (
                          <Badge className="bg-[#82C889]/10 text-[#82C889] hover:bg-[#82C889]/20 border border-[#82C889]/20">
                            {Number(attraction.price) === 0 ? 'Free' : `${attraction.currency} ${attraction.price}`}
                          </Badge>
                        )}
                      </div>
                    </CardContent>
                    <CardFooter className="px-4 pt-0 pb-4 flex justify-between">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="border-[#88C2BF]/30 text-[#88C2BF] hover:bg-[#88C2BF]/5"
                      >
                        View Details
                      </Button>
                      <Button 
                        size="sm" 
                        className="bg-[#88C2BF] hover:bg-[#88C2BF]/90 text-white"
                        onClick={() => {
                          toast({
                            title: "Added to Trip",
                            description: `${attraction.name} has been added to your trip to ${nextTrip.destination}.`,
                          });
                        }}
                      >
                        Add to Trip
                      </Button>
                    </CardFooter>
                  </Card>
                ))
              ) : (
                <div className="col-span-3 flex flex-col items-center justify-center py-10 px-4 text-center">
                  <div className="w-16 h-16 rounded-full bg-[#88C2BF]/10 flex items-center justify-center mb-4">
                    <MapPin className="h-8 w-8 text-[#88C2BF]" />
                  </div>
                  <h3 className="text-lg font-medium text-[#434342] mb-2">No attractions found</h3>
                  <p className="text-[#434342]/70 mb-4 max-w-md">
                    We couldn't find any attractions for {nextTrip.destination}. Try exploring other destinations or check back later.
                  </p>
                  <Button 
                    className="bg-[#88C2BF] hover:bg-[#88C2BF]/90 text-white"
                    onClick={() => navigate('/explore')}
                  >
                    Explore All Destinations
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Community Highlights */}
      <Card className="rounded-xl border border-[#19B4B0]/20 shadow-sm mb-8">
        <CardHeader className="pb-2 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-xl font-bold text-[#434342]">
              Traveler Community
            </CardTitle>
            <CardDescription className="text-[#434342]/70">
              Connect with fellow travelers and find inspiration
            </CardDescription>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-[#19B4B0] hover:text-[#19B4B0]/80 hover:bg-[#19B4B0]/5"
            onClick={() => navigate('/community')}
          >
            See All
          </Button>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {communityLoading ? (
              Array(2).fill(0).map((_, index) => (
                <Skeleton key={index} className="h-48 w-full rounded-xl" />
              ))
            ) : (
              <>
                <CommunityCard 
                  type="event"
                  title="City Walking Tour - Barcelona"
                  date="Jun 15, 2025 • 10:00"
                  location="Plaza Catalunya, Barcelona"
                  attendees={12}
                  imageUrl="https://images.unsplash.com/photo-1558102822-da570eb113ed?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=300&h=300&q=80"
                />
                
                <CommunityCard 
                  type="forum"
                  title="Must-visit hidden gems in Rome?"
                  author={{
                    name: "Sarah Johnson",
                    imageUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=48&h=48&q=80",
                    postedTime: "1 week ago"
                  }}
                  content="I'll be in Rome for a week next month and would love to discover some lesser-known spots that aren't in the typical tourist guides. Any recommendations?"
                  replies={18}
                  likes={36}
                />
              </>
            )}
          </div>
        </CardContent>
        <CardFooter>
          <Button 
            variant="outline" 
            className="w-full text-[#19B4B0] border-[#19B4B0]/30 hover:bg-[#19B4B0]/5"
            onClick={() => navigate('/community')}
          >
            <User className="mr-2 h-4 w-4" />
            Join the Community
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default TouristDashboard;
