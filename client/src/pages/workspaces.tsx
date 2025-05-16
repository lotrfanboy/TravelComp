import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Workspace, UserRole } from '@shared/schema';
import { useAuth } from '@/hooks/useAuth';
import WorkspaceCard from '@/components/trips/WorkspaceCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, MapPin, Wifi, Coffee, Clock, Filter, Star } from 'lucide-react';

const Workspaces: React.FC = () => {
  const { user } = useAuth();
  const [destination, setDestination] = useState('');
  const [country, setCountry] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  // Only fetch workspaces when search is performed
  const { data: workspaces, isLoading } = useQuery<Workspace[]>({
    queryKey: ['/api/workspaces', destination, country],
    enabled: isSearching && !!destination && !!country,
    queryFn: () => 
      fetch(`/api/workspaces?city=${destination}&country=${country}`)
        .then(res => res.json()),
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (destination && country) {
      setIsSearching(true);
    }
  };

  // Check if user is a digital nomad
  if (user?.role !== UserRole.NOMAD) {
    return (
      <Card className="mt-8">
        <CardContent className="py-8 text-center">
          <h2 className="text-xl font-semibold mb-2">Workspace Search</h2>
          <p className="text-gray-600 mb-4">
            This feature is optimized for Digital Nomad users.
          </p>
          <p className="text-sm text-gray-500">
            You can change your user role in Settings if you need access to workspace features.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Workspace Finder</h1>
          <p className="text-gray-500 mt-1">Find the perfect places to work remotely around the world</p>
        </div>
      </div>

      {/* Search Section */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="destination" className="text-sm font-medium text-gray-700 flex items-center">
                  <MapPin className="h-4 w-4 mr-1" />
                  Destination
                </label>
                <Input
                  id="destination"
                  placeholder="Enter city"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="country" className="text-sm font-medium text-gray-700 flex items-center">
                  <MapPin className="h-4 w-4 mr-1" />
                  Country
                </label>
                <Input
                  id="country"
                  placeholder="Enter country"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="flex flex-wrap gap-4">
              <div className="space-y-2 flex-grow">
                <label className="text-sm font-medium text-gray-700 flex items-center">
                  <Wifi className="h-4 w-4 mr-1" />
                  Wifi Speed
                </label>
                <div className="flex flex-wrap gap-2">
                  <Button type="button" variant="outline" size="sm" className="rounded-full">Any</Button>
                  <Button type="button" variant="outline" size="sm" className="rounded-full">10+ Mbps</Button>
                  <Button type="button" variant="outline" size="sm" className="rounded-full">25+ Mbps</Button>
                  <Button type="button" variant="outline" size="sm" className="rounded-full">50+ Mbps</Button>
                </div>
              </div>
              <div className="space-y-2 flex-grow">
                <label className="text-sm font-medium text-gray-700 flex items-center">
                  <Coffee className="h-4 w-4 mr-1" />
                  Amenities
                </label>
                <div className="flex flex-wrap gap-2">
                  <Button type="button" variant="outline" size="sm" className="rounded-full">Coffee</Button>
                  <Button type="button" variant="outline" size="sm" className="rounded-full">Meeting Rooms</Button>
                  <Button type="button" variant="outline" size="sm" className="rounded-full">Quiet Zones</Button>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 flex items-center">
                  <Clock className="h-4 w-4 mr-1" />
                  Hours
                </label>
                <div className="flex flex-wrap gap-2">
                  <Button type="button" variant="outline" size="sm" className="rounded-full">24/7</Button>
                  <Button type="button" variant="outline" size="sm" className="rounded-full">Weekends</Button>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-4">
              <Button type="button" variant="outline" className="flex items-center">
                <Filter className="h-4 w-4 mr-2" />
                More Filters
              </Button>
              <Button type="submit" className="bg-emerald-500 hover:bg-emerald-600">
                <Search className="h-4 w-4 mr-2" />
                Search Workspaces
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Results Section */}
      {isSearching ? (
        <>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              {isLoading 
                ? "Searching for workspaces..." 
                : `${workspaces?.length || 0} Workspaces found in ${destination}, ${country}`
              }
            </h2>
            {!isLoading && workspaces && workspaces.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">Sort by:</span>
                <select className="text-sm border rounded-md py-1 px-2 focus:outline-none focus:ring-2 focus:ring-emerald-500">
                  <option>Recommended</option>
                  <option>Highest Rated</option>
                  <option>Price: Low to High</option>
                  <option>Price: High to Low</option>
                  <option>Wifi Speed</option>
                </select>
              </div>
            )}
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Skeleton key={i} className="h-72 w-full rounded-lg" />
              ))}
            </div>
          ) : workspaces && workspaces.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {workspaces.map((workspace) => (
                <WorkspaceCard key={workspace.id} workspace={workspace} />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <div className="mx-auto w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                  <Search className="h-6 w-6 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No workspaces found</h3>
                <p className="text-gray-500 max-w-md mx-auto">
                  We couldn't find any workspaces in {destination}, {country}. Try searching for a different location or adjusting your filters.
                </p>
              </CardContent>
            </Card>
          )}
        </>
      ) : (
        <Card>
          <CardContent className="py-16 text-center">
            <div className="mx-auto w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center mb-4">
              <Laptop className="h-8 w-8 text-emerald-500" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Find Your Perfect Workspace</h3>
            <p className="text-gray-500 max-w-md mx-auto mb-6">
              Search for coworking spaces, cafés, and other remote work-friendly locations around the world.
            </p>
            <div className="flex flex-wrap justify-center gap-4 mb-8">
              <Button variant="outline" className="flex items-center gap-2">
                <Wifi className="h-4 w-4" />
                <span>Fast Wifi</span>
              </Button>
              <Button variant="outline" className="flex items-center gap-2">
                <Coffee className="h-4 w-4" />
                <span>Coffee Included</span>
              </Button>
              <Button variant="outline" className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>24/7 Access</span>
              </Button>
              <Button variant="outline" className="flex items-center gap-2">
                <Star className="h-4 w-4" />
                <span>Highly Rated</span>
              </Button>
            </div>
            <p className="text-sm text-gray-400">
              Enter a city and country above to start your search
            </p>
          </CardContent>
        </Card>
      )}
    </>
  );
};

export default Workspaces;
