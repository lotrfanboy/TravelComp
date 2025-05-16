import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DateRangePicker } from '../components/ui/date-range-picker';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { apiRequest } from '@/lib/queryClient';
import { Loader2, Search, Calendar, MapPin, Hotel, Palmtree, Briefcase } from 'lucide-react';
import BookingCard from '@/components/booking/BookingCard';

interface SearchParams {
  type: 'hotels' | 'attractions' | 'workspaces';
  city: string;
  country: string;
  checkIn?: Date;
  checkOut?: Date;
  date?: Date;
  adults?: number;
  rooms?: number;
  capacity?: number;
}

export default function BookingPage() {
  const [activeTab, setActiveTab] = useState<'hotels' | 'attractions' | 'workspaces'>('hotels');
  const [searchParams, setSearchParams] = useState<SearchParams>({
    type: 'hotels',
    city: '',
    country: '',
  });
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [selectedTripId, setSelectedTripId] = useState<number | null>(null);
  const [trips, setTrips] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { isAuthenticated, user } = useAuth();
  const { toast } = useToast();
  const [_, navigate] = useLocation();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/auth');
      return;
    }

    // Load user's trips
    const fetchTrips = async () => {
      try {
        const response = await apiRequest('/api/trips');
        if (response.ok) {
          const data = await response.json();
          setTrips(data);
          if (data.length > 0) {
            setSelectedTripId(data[0].id);
          }
        }
      } catch (error) {
        console.error('Error fetching trips:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTrips();
  }, [isAuthenticated, navigate]);

  const handleTabChange = (value: string) => {
    setActiveTab(value as 'hotels' | 'attractions' | 'workspaces');
    setSearchParams(prev => ({
      ...prev,
      type: value as 'hotels' | 'attractions' | 'workspaces',
    }));
    setSearchResults([]);
    setHasSearched(false);
  };

  const handleSearch = async () => {
    if (!searchParams.city || !searchParams.country) {
      toast({
        title: "Missing Information",
        description: "Please enter a city and country",
        variant: "destructive",
      });
      return;
    }

    if ((activeTab === 'hotels' || activeTab === 'workspaces') && (!searchParams.checkIn || !searchParams.checkOut)) {
      toast({
        title: "Missing Dates",
        description: "Please select check-in and check-out dates",
        variant: "destructive",
      });
      return;
    }

    if (activeTab === 'attractions' && !searchParams.date) {
      toast({
        title: "Missing Date",
        description: "Please select a date for your attraction visit",
        variant: "destructive",
      });
      return;
    }

    setIsSearching(true);
    setSearchResults([]);

    try {
      let endpoint = '';
      let queryParams = '';

      if (activeTab === 'hotels') {
        endpoint = '/api/booking/hotels';
        queryParams = `?city=${encodeURIComponent(searchParams.city)}&country=${encodeURIComponent(searchParams.country)}&checkIn=${searchParams.checkIn?.toISOString().split('T')[0]}&checkOut=${searchParams.checkOut?.toISOString().split('T')[0]}&adults=${searchParams.adults || 2}&rooms=${searchParams.rooms || 1}`;
      } else if (activeTab === 'attractions') {
        endpoint = '/api/booking/attractions';
        queryParams = `?city=${encodeURIComponent(searchParams.city)}&country=${encodeURIComponent(searchParams.country)}&date=${searchParams.date?.toISOString().split('T')[0]}`;
      } else if (activeTab === 'workspaces') {
        endpoint = '/api/booking/workspaces';
        queryParams = `?city=${encodeURIComponent(searchParams.city)}&country=${encodeURIComponent(searchParams.country)}&startDate=${searchParams.checkIn?.toISOString().split('T')[0]}&endDate=${searchParams.checkOut?.toISOString().split('T')[0]}&capacity=${searchParams.capacity || 1}`;
      }

      const response = await apiRequest(`${endpoint}${queryParams}`, { method: 'GET' });

      if (response.ok) {
        const data = await response.json();
        setSearchResults(data);
      } else {
        const errorData = await response.json();
        toast({
          title: "Search Failed",
          description: errorData.message || "Failed to fetch results",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error searching:', error);
      toast({
        title: "Search Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
      setHasSearched(true);
    }
  };

  const handleDateRangeChange = (range: { from?: Date; to?: Date }) => {
    setSearchParams(prev => ({
      ...prev,
      checkIn: range.from,
      checkOut: range.to,
    }));
  };

  const handleSingleDateChange = (date?: Date) => {
    setSearchParams(prev => ({
      ...prev,
      date,
    }));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[70vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading your trips...</span>
      </div>
    );
  }

  if (trips.length === 0) {
    return (
      <div className="container max-w-6xl py-12">
        <div className="text-center py-12">
          <h1 className="text-3xl font-bold mb-4">Book Travel Services</h1>
          <p className="text-lg text-muted-foreground mb-8">
            You need to create a trip before you can book accommodations, attractions, or workspaces.
          </p>
          <Button onClick={() => navigate('/trip-creator')} size="lg">
            Create Your First Trip
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-6xl py-8">
      <h1 className="text-3xl font-bold mb-2">Book Travel Services</h1>
      <p className="text-lg text-muted-foreground mb-8">
        Find and book accommodations, attractions, and workspaces for your trips
      </p>

      {/* Trip Selection */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Select Trip</h2>
        <Select
          value={selectedTripId?.toString() || ''}
          onValueChange={(value) => setSelectedTripId(parseInt(value))}
        >
          <SelectTrigger className="w-full md:w-80">
            <SelectValue placeholder="Select a trip" />
          </SelectTrigger>
          <SelectContent>
            {trips.map((trip) => (
              <SelectItem key={trip.id} value={trip.id.toString()}>
                {trip.name} ({new Date(trip.startDate).toLocaleDateString()} - {new Date(trip.endDate).toLocaleDateString()})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="bg-white rounded-xl shadow-md p-6 mb-8">
        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="hotels" className="flex items-center gap-2">
              <Hotel className="h-4 w-4" />
              <span>Hotels</span>
            </TabsTrigger>
            <TabsTrigger value="attractions" className="flex items-center gap-2">
              <Palmtree className="h-4 w-4" />
              <span>Attractions</span>
            </TabsTrigger>
            <TabsTrigger value="workspaces" className="flex items-center gap-2">
              <Briefcase className="h-4 w-4" />
              <span>Workspaces</span>
            </TabsTrigger>
          </TabsList>

          <div className="mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium mb-1">City</label>
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 text-muted-foreground absolute ml-3" />
                  <Input
                    type="text"
                    placeholder="Enter city"
                    className="pl-10"
                    value={searchParams.city}
                    onChange={(e) => setSearchParams(prev => ({ ...prev, city: e.target.value }))}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Country</label>
                <Input
                  type="text"
                  placeholder="Enter country"
                  value={searchParams.country}
                  onChange={(e) => setSearchParams(prev => ({ ...prev, country: e.target.value }))}
                />
              </div>
            </div>

            <TabsContent value="hotels" className="mt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Check-in / Check-out</label>
                  <DateRangePicker
                    onChange={handleDateRangeChange}
                    value={{
                      from: searchParams.checkIn,
                      to: searchParams.checkOut,
                    }}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Adults</label>
                    <Select
                      value={(searchParams.adults || 2).toString()}
                      onValueChange={(value) => setSearchParams(prev => ({ ...prev, adults: parseInt(value) }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Adults" />
                      </SelectTrigger>
                      <SelectContent>
                        {[1, 2, 3, 4, 5, 6].map((num) => (
                          <SelectItem key={num} value={num.toString()}>
                            {num} {num === 1 ? 'Adult' : 'Adults'}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Rooms</label>
                    <Select
                      value={(searchParams.rooms || 1).toString()}
                      onValueChange={(value) => setSearchParams(prev => ({ ...prev, rooms: parseInt(value) }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Rooms" />
                      </SelectTrigger>
                      <SelectContent>
                        {[1, 2, 3, 4, 5].map((num) => (
                          <SelectItem key={num} value={num.toString()}>
                            {num} {num === 1 ? 'Room' : 'Rooms'}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="attractions" className="mt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Date</label>
                  <div className="relative">
                    <Calendar className="h-4 w-4 text-muted-foreground absolute top-3 left-3" />
                    <Input
                      type="date"
                      className="pl-10"
                      value={searchParams.date ? searchParams.date.toISOString().split('T')[0] : ''}
                      onChange={(e) => handleSingleDateChange(e.target.value ? new Date(e.target.value) : undefined)}
                    />
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="workspaces" className="mt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Check-in / Check-out</label>
                  <DateRangePicker
                    onChange={handleDateRangeChange}
                    value={{
                      from: searchParams.checkIn,
                      to: searchParams.checkOut,
                    }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Capacity</label>
                  <Select
                    value={(searchParams.capacity || 1).toString()}
                    onValueChange={(value) => setSearchParams(prev => ({ ...prev, capacity: parseInt(value) }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Capacity" />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5, 10, 15, 20].map((num) => (
                        <SelectItem key={num} value={num.toString()}>
                          {num} {num === 1 ? 'Person' : 'People'}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </TabsContent>

            <Button
              onClick={handleSearch}
              disabled={isSearching}
              className="w-full mt-2"
              size="lg"
            >
              {isSearching ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Searching...
                </>
              ) : (
                <>
                  <Search className="mr-2 h-4 w-4" />
                  Search
                </>
              )}
            </Button>
          </div>
        </Tabs>
      </div>

      {/* Search Results */}
      {hasSearched && (
        <div>
          <h2 className="text-2xl font-semibold mb-6">
            {isSearching ? 'Searching...' : 
              searchResults.length > 0 
                ? `${searchResults.length} Results Found` 
                : 'No Results Found'}
          </h2>

          {isSearching ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : searchResults.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {searchResults.map((result) => (
                <BookingCard 
                  key={result.id} 
                  option={{
                    ...result,
                    type: activeTab === 'hotels' ? 'accommodation' : activeTab === 'attractions' ? 'attraction' : 'workspace'
                  }} 
                  tripId={selectedTripId || 0}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <p className="text-lg text-gray-600">No results found for your search criteria</p>
              <p className="text-muted-foreground mt-2">Try adjusting your search parameters</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}