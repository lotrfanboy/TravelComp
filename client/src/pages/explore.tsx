import { useState } from "react";
import { Search, MapPin, Globe, Compass, Filter, Star } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/hooks/useAuth";
import { useIsMobile } from "@/hooks/use-mobile";

interface Destination {
  id: number;
  name: string;
  country: string;
  description: string;
  rating: number;
  imageUrl: string;
  type: 'city' | 'attraction' | 'natural';
  tags: string[];
  priceLevel: 1 | 2 | 3;
}

interface TravelStory {
  id: number;
  title: string;
  author: {
    name: string;
    role: string;
    imageUrl: string;
  };
  location: string;
  imageUrl: string;
  excerpt: string;
  likes: number;
  comments: number;
  date: string;
}

export default function Explore() {
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilters, setActiveFilters] = useState<string[]>([]);

  // Sample data for destinations
  const destinations: Destination[] = [
    {
      id: 1,
      name: "Kyoto",
      country: "Japan",
      description: "Historic temples, traditional gardens, and geisha districts in Japan's former capital.",
      rating: 4.8,
      imageUrl: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1000&q=80",
      type: 'city',
      tags: ['Culture', 'History', 'Food'],
      priceLevel: 2
    },
    {
      id: 2,
      name: "Santorini",
      country: "Greece",
      description: "Stunning white-washed buildings, blue domes, and breathtaking views of the Aegean Sea.",
      rating: 4.7,
      imageUrl: "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1000&q=80",
      type: 'city',
      tags: ['Beach', 'Romantic', 'Views'],
      priceLevel: 3
    },
    {
      id: 3,
      name: "Banff National Park",
      country: "Canada",
      description: "Spectacular mountains, crystal-clear lakes, and abundant wildlife in the Canadian Rockies.",
      rating: 4.9,
      imageUrl: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1000&q=80",
      type: 'natural',
      tags: ['Nature', 'Adventure', 'Hiking'],
      priceLevel: 2
    },
    {
      id: 4,
      name: "Chichen Itza",
      country: "Mexico",
      description: "Ancient Mayan ruins featuring the iconic El Castillo pyramid and other archaeological wonders.",
      rating: 4.6,
      imageUrl: "https://images.unsplash.com/photo-1518638150340-f706e86654de?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1000&q=80",
      type: 'attraction',
      tags: ['History', 'Architecture', 'Culture'],
      priceLevel: 1
    },
    {
      id: 5,
      name: "Barcelona",
      country: "Spain",
      description: "Vibrant city known for Gaudi's architecture, Mediterranean beaches, and lively culture.",
      rating: 4.7,
      imageUrl: "https://images.unsplash.com/photo-1583422409516-2895a77efded?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1000&q=80",
      type: 'city',
      tags: ['Architecture', 'Food', 'Nightlife'],
      priceLevel: 2
    },
    {
      id: 6,
      name: "Great Barrier Reef",
      country: "Australia",
      description: "World's largest coral reef system offering incredible marine life and diving opportunities.",
      rating: 4.8,
      imageUrl: "https://images.unsplash.com/photo-1559741043-8f638d6b7700?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1000&q=80",
      type: 'natural',
      tags: ['Nature', 'Diving', 'Marine Life'],
      priceLevel: 3
    },
  ];

  // Sample data for travel stories
  const travelStories: TravelStory[] = [
    {
      id: 1,
      title: "Working Remotely from Bali: A Digital Nomad's Guide",
      author: {
        name: "Emma Chen",
        role: "nomad",
        imageUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=48&h=48&q=80",
      },
      location: "Bali, Indonesia",
      imageUrl: "https://images.unsplash.com/photo-1504274066651-8d31a536b11a?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1000&q=80",
      excerpt: "I spent 3 months working from various cafés and co-working spaces across Bali. Here's everything you need to know about internet reliability, accommodation, and finding the perfect work-life balance.",
      likes: 245,
      comments: 48,
      date: "2 weeks ago"
    },
    {
      id: 2,
      title: "10 Hidden Gems in Tokyo Most Tourists Miss",
      author: {
        name: "James Wilson",
        role: "tourist",
        imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=48&h=48&q=80",
      },
      location: "Tokyo, Japan",
      imageUrl: "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1000&q=80",
      excerpt: "Beyond the typical tourist attractions, Tokyo offers incredible hidden spots that showcase the city's unique charm. From secret gardens to underground izakayas, here's where the locals go.",
      likes: 189,
      comments: 32,
      date: "1 month ago"
    },
    {
      id: 3,
      title: "Optimizing Business Travel: How We Cut Costs by 30%",
      author: {
        name: "Sarah Johnson",
        role: "business",
        imageUrl: "https://images.unsplash.com/photo-1619895862022-09114b41f16f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=48&h=48&q=80",
      },
      location: "Various Cities",
      imageUrl: "https://images.unsplash.com/photo-1520333789090-1afc82db536a?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1000&q=80",
      excerpt: "Our company implemented a new approach to business travel planning that saved us 30% on costs while improving employee satisfaction. Here's our framework and lessons learned.",
      likes: 312,
      comments: 67,
      date: "3 weeks ago"
    },
  ];

  const filters = [
    "Beach", "Mountains", "Urban", "Nature", "Food", "Culture", 
    "Adventure", "Relaxation", "Budget", "Luxury", "Family-friendly"
  ];

  const toggleFilter = (filter: string) => {
    if (activeFilters.includes(filter)) {
      setActiveFilters(activeFilters.filter(f => f !== filter));
    } else {
      setActiveFilters([...activeFilters, filter]);
    }
  };

  const renderPriceLevel = (level: number) => {
    return (
      <div className="flex items-center">
        {[1, 2, 3].map(i => (
          <span key={i} className={`text-lg ${i <= level ? 'text-green-500' : 'text-gray-300'}`}>$</span>
        ))}
      </div>
    );
  };

  const filteredDestinations = destinations.filter(destination => {
    // Filter by search query
    if (searchQuery && !destination.name.toLowerCase().includes(searchQuery.toLowerCase()) && 
        !destination.country.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    
    // Filter by active filters
    if (activeFilters.length > 0) {
      const hasMatchingTag = destination.tags.some(tag => activeFilters.includes(tag));
      if (!hasMatchingTag) return false;
    }
    
    return true;
  });

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'tourist':
        return 'bg-emerald-100 text-emerald-800';
      case 'nomad':
        return 'bg-blue-100 text-blue-800';
      case 'business':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">Explore Destinations</h1>
      
      <div className="relative mb-8">
        <div className="flex">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <Input 
              placeholder="Search for destinations, countries, or experiences..." 
              className="pl-10 pr-4 w-full" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button variant="outline" className="ml-2">
            <Filter size={18} className="mr-2" />
            {!isMobile && "Filters"}
          </Button>
        </div>
        
        <div className="flex flex-wrap gap-2 mt-4">
          {filters.map((filter) => (
            <Badge 
              key={filter}
              variant={activeFilters.includes(filter) ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => toggleFilter(filter)}
            >
              {filter}
            </Badge>
          ))}
        </div>
      </div>
      
      <Tabs defaultValue="destinations">
        <TabsList className="mb-6">
          <TabsTrigger value="destinations" className="flex items-center gap-2">
            <MapPin size={16} />
            <span>Popular Destinations</span>
          </TabsTrigger>
          <TabsTrigger value="stories" className="flex items-center gap-2">
            <Compass size={16} />
            <span>Travel Stories</span>
          </TabsTrigger>
          <TabsTrigger value="recommendations" className="flex items-center gap-2">
            <Globe size={16} />
            <span>Recommendations</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="destinations">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDestinations.map((destination) => (
              <Card key={destination.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="relative h-48">
                  <img 
                    src={destination.imageUrl} 
                    alt={destination.name} 
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                    <div className="flex justify-between items-end">
                      <div>
                        <h3 className="text-white font-bold text-lg">{destination.name}</h3>
                        <div className="flex items-center text-white/80 text-sm">
                          <MapPin size={14} className="mr-1" />
                          {destination.country}
                        </div>
                      </div>
                      <div className="flex items-center bg-white/90 text-sm font-medium rounded px-2 py-1">
                        <Star size={14} className="mr-1 text-amber-500 fill-amber-500" />
                        {destination.rating}
                      </div>
                    </div>
                  </div>
                </div>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex gap-2">
                      {destination.tags.map(tag => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    {renderPriceLevel(destination.priceLevel)}
                  </div>
                  <p className="text-sm text-gray-600 mb-4">{destination.description}</p>
                  <div className="flex justify-between">
                    <Button variant="outline" size="sm">Save</Button>
                    <Button size="sm">Plan Trip</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          {filteredDestinations.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-4">No destinations found matching your search criteria.</p>
              <Button variant="outline" onClick={() => {
                setSearchQuery("");
                setActiveFilters([]);
              }}>Clear Filters</Button>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="stories">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {travelStories.map((story) => (
              <Card key={story.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="relative h-64">
                  <img 
                    src={story.imageUrl} 
                    alt={story.title} 
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                </div>
                <CardContent className="p-6">
                  <div className="flex items-center mb-3">
                    <img 
                      src={story.author.imageUrl} 
                      alt={story.author.name} 
                      className="w-10 h-10 rounded-full mr-3 object-cover"
                    />
                    <div>
                      <p className="font-medium">{story.author.name}</p>
                      <div className="flex items-center">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${getRoleColor(story.author.role)}`}>
                          {story.author.role === 'nomad' ? 'Digital Nomad' : 
                           story.author.role === 'tourist' ? 'Tourist' : 'Business Traveler'}
                        </span>
                        <span className="text-xs text-gray-500 ml-2">{story.date}</span>
                      </div>
                    </div>
                  </div>
                  
                  <h3 className="font-bold text-xl mb-2">{story.title}</h3>
                  <div className="flex items-center text-sm text-gray-600 mb-3">
                    <MapPin size={14} className="mr-1" />
                    {story.location}
                  </div>
                  
                  <p className="text-gray-600 mb-4">{story.excerpt}</p>
                  
                  <Separator className="my-4" />
                  
                  <div className="flex justify-between items-center">
                    <div className="flex space-x-4 text-sm text-gray-500">
                      <div className="flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                        {story.likes}
                      </div>
                      <div className="flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                        {story.comments}
                      </div>
                    </div>
                    <Button variant="link" className="p-0 h-auto">Read More</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="recommendations">
          {user ? (
            <div className="space-y-6">
              <div className="bg-muted rounded-lg p-6">
                <h2 className="text-lg font-medium mb-4">Personalized Recommendations</h2>
                <p className="text-sm text-muted-foreground mb-6">
                  Based on your previous trips and preferences, we think you'll love these destinations.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {destinations.slice(0, 3).map((destination) => (
                    <Card key={destination.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                      <div className="relative h-40">
                        <img 
                          src={destination.imageUrl} 
                          alt={destination.name} 
                          className="absolute inset-0 w-full h-full object-cover"
                        />
                      </div>
                      <CardContent className="p-4">
                        <h3 className="font-bold">{destination.name}, {destination.country}</h3>
                        <div className="flex items-center text-sm my-1">
                          <Star size={14} className="mr-1 text-amber-500 fill-amber-500" />
                          {destination.rating}
                        </div>
                        <div className="flex mt-2">
                          <Button size="sm" className="w-full">View Details</Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
              
              <div>
                <h2 className="text-lg font-medium mb-4">Trending Destinations</h2>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {destinations.slice(3, 7).map((destination) => (
                    <Card key={destination.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                      <div className="relative h-32">
                        <img 
                          src={destination.imageUrl} 
                          alt={destination.name} 
                          className="absolute inset-0 w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/30">
                          <div className="absolute bottom-0 left-0 right-0 p-3">
                            <h3 className="text-white font-medium text-sm">{destination.name}</h3>
                            <p className="text-white/80 text-xs">{destination.country}</p>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <h3 className="text-lg font-medium mb-2">Sign in to see personalized recommendations</h3>
              <p className="text-gray-500 mb-6">Create an account or log in to get travel suggestions based on your interests.</p>
              <Button>Sign In</Button>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}