import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { Trip, UserRole } from '@shared/schema';
import { useAuth } from '@/hooks/useAuth';
import TripCard from '@/components/trips/TripCard';
import TripWizard from '@/components/trips/TripWizard';
import TripFilters, { TripFilters as TripFiltersType } from '@/components/trips/TripFilters';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Plus, ListFilter, Search, Calendar, Filter } from 'lucide-react';
import { getContinent } from '@/lib/countryImages';

const Trips: React.FC = () => {
  const [_, navigate] = useLocation();
  const { user } = useAuth();
  const [showTripWizard, setShowTripWizard] = useState(false);
  const [filterStatus, setFilterStatus] = useState<'all' | 'upcoming' | 'past' | 'active'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [advancedFilters, setAdvancedFilters] = useState<TripFiltersType>({
    tripType: null,
    continent: null,
    dateRange: null,
    budgetRange: null,
    isMultiDestination: null
  });

  // Fetch trips
  const { data: trips, isLoading } = useQuery<Trip[]>({
    queryKey: ['/api/trips'],
  });

  const filteredTrips = React.useMemo(() => {
    if (!trips) return [];
    
    const now = new Date();
    let filtered = [...trips];
    
    // Apply status filter
    if (filterStatus === 'upcoming') {
      filtered = filtered.filter(trip => new Date(trip.startDate) > now);
    } else if (filterStatus === 'past') {
      filtered = filtered.filter(trip => new Date(trip.endDate) < now);
    } else if (filterStatus === 'active') {
      filtered = filtered.filter(trip => 
        new Date(trip.startDate) <= now && new Date(trip.endDate) >= now
      );
    }
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(trip => 
        trip.name.toLowerCase().includes(query) ||
        trip.destination.toLowerCase().includes(query) ||
        trip.country.toLowerCase().includes(query)
      );
    }

    // Apply advanced filters
    if (advancedFilters.tripType) {
      filtered = filtered.filter(trip => trip.tripType === advancedFilters.tripType);
    }
    
    if (advancedFilters.isMultiDestination !== null) {
      filtered = filtered.filter(trip => Boolean(trip.isMultiDestination) === advancedFilters.isMultiDestination);
    }
    
    if (advancedFilters.continent) {
      filtered = filtered.filter(trip => {
        const tripContinent = getContinent(trip.country);
        return tripContinent === advancedFilters.continent;
      });
    }
    
    if (advancedFilters.dateRange && advancedFilters.dateRange.from && advancedFilters.dateRange.to) {
      filtered = filtered.filter(trip => {
        const tripStart = new Date(trip.startDate);
        const tripEnd = new Date(trip.endDate);
        const filterStart = advancedFilters.dateRange?.from as Date;
        const filterEnd = advancedFilters.dateRange?.to as Date;
        
        return (
          (tripStart >= filterStart && tripStart <= filterEnd) ||
          (tripEnd >= filterStart && tripEnd <= filterEnd) ||
          (tripStart <= filterStart && tripEnd >= filterEnd)
        );
      });
    }
    
    if (advancedFilters.budgetRange && advancedFilters.budgetRange.length === 2) {
      const [minBudget, maxBudget] = advancedFilters.budgetRange;
      filtered = filtered.filter(trip => {
        const tripBudget = trip.budget ? parseFloat(String(trip.budget)) : 0;
        return tripBudget >= minBudget && tripBudget <= maxBudget;
      });
    }
    
    // Sort by start date (newest first)
    return filtered.sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());
  }, [trips, filterStatus, searchQuery, advancedFilters]);

  const roleColor = user?.role === UserRole.TOURIST
    ? 'tourist'
    : user?.role === UserRole.NOMAD
      ? 'nomad'
      : 'business';

  // Trip counts for tabs
  const tripCounts = React.useMemo(() => {
    if (!trips) return { all: 0, upcoming: 0, active: 0, past: 0 };
    
    const now = new Date();
    const upcoming = trips.filter(trip => new Date(trip.startDate) > now).length;
    const active = trips.filter(trip => 
      new Date(trip.startDate) <= now && new Date(trip.endDate) >= now
    ).length;
    const past = trips.filter(trip => new Date(trip.endDate) < now).length;
    
    return {
      all: trips.length,
      upcoming,
      active,
      past
    };
  }, [trips]);

  const handleCreateTrip = () => {
    // Navigate to unified trip creation route
    navigate('/trips/new');
  };

  return (
    <>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Trips</h1>
          <p className="text-gray-500 mt-1">Manage all your travel plans in one place</p>
        </div>
        <Button
          className={`mt-4 md:mt-0 ${
            user?.role === UserRole.TOURIST
              ? 'bg-yellow-500 hover:bg-yellow-600'
              : user?.role === UserRole.NOMAD
                ? 'bg-emerald-500 hover:bg-emerald-600'
                : 'bg-indigo-500 hover:bg-indigo-600'
          }`}
          onClick={handleCreateTrip}
        >
          <Plus className="h-4 w-4 mr-2" />
          Create New Trip
        </Button>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search trips by name or destination..."
              className="pl-10 pr-4 py-2 w-full rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-4">
            <Button variant="outline" className="flex items-center">
              <Calendar className="h-4 w-4 mr-2" />
              Date
            </Button>
            <Button variant="outline" className="flex items-center">
              <ListFilter className="h-4 w-4 mr-2" />
              Filters
            </Button>
          </div>
        </div>
      </div>

      <Tabs defaultValue="all" className="space-y-4" onValueChange={(value) => setFilterStatus(value as any)}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">
            All ({tripCounts.all})
          </TabsTrigger>
          <TabsTrigger value="upcoming">
            Upcoming ({tripCounts.upcoming})
          </TabsTrigger>
          <TabsTrigger value="active">
            Active ({tripCounts.active})
          </TabsTrigger>
          <TabsTrigger value="past">
            Past ({tripCounts.past})
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="space-y-4">
          {renderTrips()}
        </TabsContent>
        
        <TabsContent value="upcoming" className="space-y-4">
          {renderTrips()}
        </TabsContent>
        
        <TabsContent value="active" className="space-y-4">
          {renderTrips()}
        </TabsContent>
        
        <TabsContent value="past" className="space-y-4">
          {renderTrips()}
        </TabsContent>
      </Tabs>

      {/* Trip Wizard Modal */}
      <TripWizard isOpen={showTripWizard} onClose={() => setShowTripWizard(false)} />
    </>
  );

  function renderTrips() {
    if (isLoading) {
      return (
        <div className="grid grid-cols-1 gap-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-40 w-full rounded-lg" />
          ))}
        </div>
      );
    }
    
    if (!filteredTrips.length) {
      return (
        <Card className="p-6 text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-2">No trips found</h3>
          {searchQuery ? (
            <p className="text-gray-500 mb-4">Try adjusting your search criteria.</p>
          ) : (
            <p className="text-gray-500 mb-4">
              {filterStatus === 'upcoming' 
                ? "You don't have any upcoming trips." 
                : filterStatus === 'past' 
                  ? "You don't have any past trips."
                  : filterStatus === 'active'
                    ? "You don't have any active trips." 
                    : "You haven't created any trips yet."}
            </p>
          )}
          <Button 
            onClick={handleCreateTrip}
            className={
              user?.role === UserRole.TOURIST
                ? 'bg-yellow-500 hover:bg-yellow-600'
                : user?.role === UserRole.NOMAD
                  ? 'bg-emerald-500 hover:bg-emerald-600'
                  : 'bg-indigo-500 hover:bg-indigo-600'
            }
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Your First Trip
          </Button>
        </Card>
      );
    }
    
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filteredTrips.map((trip) => (
          <TripCard 
            key={trip.id} 
            trip={trip} 
            roleColor={roleColor}
          />
        ))}
      </div>
    );
  }
};

export default Trips;
