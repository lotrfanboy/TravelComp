import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import CommunityCard from '@/components/community/CommunityCard';
import { UserRole } from '@shared/schema';
import { Calendar, MessageSquare, Users, Search, Globe, ArrowUpRight } from 'lucide-react';

const Community: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [postTitle, setPostTitle] = useState('');
  const [postContent, setPostContent] = useState('');

  const getRoleColor = () => {
    switch (user?.role) {
      case UserRole.TOURIST:
        return 'bg-yellow-500 hover:bg-yellow-600 focus:ring-yellow-500';
      case UserRole.NOMAD:
        return 'bg-emerald-500 hover:bg-emerald-600 focus:ring-emerald-500';
      case UserRole.BUSINESS:
        return 'bg-indigo-500 hover:bg-indigo-600 focus:ring-indigo-500';
      default:
        return 'bg-primary-500 hover:bg-primary-600 focus:ring-primary-500';
    }
  };

  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!postTitle || !postContent) {
      toast({
        title: 'Incomplete form',
        description: 'Please provide both a title and content for your post.',
        variant: 'destructive',
      });
      return;
    }

    toast({
      title: 'Post created',
      description: 'Your post has been published to the community.',
    });

    // Reset form
    setPostTitle('');
    setPostContent('');
  };

  // Mock community events & posts
  const events = [
    {
      title: 'Bali Digital Nomad Meetup',
      date: 'Feb 18, 2023 • 18:00',
      location: 'Dojo Bali, Canggu',
      attendees: 38,
      imageUrl: 'https://images.unsplash.com/photo-1543269865-cbf427effbad?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=300&h=300&q=80',
    },
    {
      title: 'Barcelona City Walking Tour',
      date: 'Mar 5, 2023 • 10:00',
      location: 'Plaza Catalunya, Barcelona',
      attendees: 12,
      imageUrl: 'https://images.unsplash.com/photo-1558102822-da570eb113ed?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=300&h=300&q=80',
    },
    {
      title: 'Business Networking - London',
      date: 'Apr 12, 2023 • 19:00',
      location: 'The Shard, London',
      attendees: 45,
      imageUrl: 'https://images.unsplash.com/photo-1551818255-e6e10975bc17?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=300&h=300&q=80',
    },
    {
      title: 'Tokyo Street Photography Walk',
      date: 'May 8, 2023 • 15:00',
      location: 'Shibuya Crossing, Tokyo',
      attendees: 15,
      imageUrl: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=300&h=300&q=80',
    },
  ];

  const posts = [
    {
      title: 'Best cafés with reliable WiFi in Canggu?',
      author: {
        name: 'Emma Wilson',
        imageUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=48&h=48&q=80',
        postedTime: '2 days ago',
      },
      content: 'I\'m heading to Bali next week and looking for recommendations on cafés that have reliable WiFi for working. Any suggestions from the community?',
      replies: 24,
      likes: 42,
    },
    {
      title: 'Must-visit hidden gems in Rome?',
      author: {
        name: 'Sarah Johnson',
        imageUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=48&h=48&q=80',
        postedTime: '1 week ago',
      },
      content: 'I\'ll be in Rome for a week next month and would love to discover some lesser-known spots that aren\'t in the typical tourist guides. Any recommendations?',
      replies: 18,
      likes: 36,
    },
    {
      title: 'Business hotel recommendations in Singapore',
      author: {
        name: 'James Chen',
        imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=48&h=48&q=80',
        postedTime: '3 days ago',
      },
      content: 'My team is traveling to Singapore for a business conference next month. Looking for hotel recommendations with good meeting facilities and close to the business district.',
      replies: 12,
      likes: 28,
    },
    {
      title: 'Digital nomad visa experiences in Portugal?',
      author: {
        name: 'Alex Rivera',
        imageUrl: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=48&h=48&q=80',
        postedTime: '5 days ago',
      },
      content: 'Has anyone gone through the process of getting a digital nomad visa for Portugal? I\'m interested in the requirements, timeline, and your overall experience with the application process.',
      replies: 31,
      likes: 56,
    },
  ];

  return (
    <>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Traveler Community</h1>
          <p className="text-gray-500 mt-1">Connect with fellow travelers, share experiences, and attend events</p>
        </div>
        <div className="mt-4 md:mt-0 flex flex-wrap gap-2">
          <Button
            variant="outline"
            className="flex items-center"
            onClick={() => {
              toast({
                title: 'Feature Coming Soon',
                description: 'The global map feature is under development.',
              });
            }}
          >
            <Globe className="h-4 w-4 mr-2" />
            Global Map
          </Button>
          <Button
            className={getRoleColor()}
            onClick={() => {
              toast({
                title: 'Create Event',
                description: 'Event creation feature coming soon!',
              });
            }}
          >
            <Calendar className="h-4 w-4 mr-2" />
            Create Event
          </Button>
        </div>
      </div>

      {/* Search and filters */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search community posts and events..."
              className="pl-10"
            />
          </div>
          <div className="flex gap-4">
            <select className="rounded-md border border-gray-300 px-3 py-2 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
              <option>All Locations</option>
              <option>Europe</option>
              <option>Asia</option>
              <option>North America</option>
              <option>South America</option>
              <option>Africa</option>
              <option>Oceania</option>
            </select>
            <Button variant="outline">
              More Filters
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Community Content */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="all" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="events">
                <Calendar className="h-4 w-4 mr-2" />
                Events
              </TabsTrigger>
              <TabsTrigger value="discussions">
                <MessageSquare className="h-4 w-4 mr-2" />
                Discussions
              </TabsTrigger>
              <TabsTrigger value="questions">
                <Users className="h-4 w-4 mr-2" />
                Questions
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="all" className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                {/* Events */}
                <h2 className="text-lg font-semibold text-gray-900 flex items-center justify-between">
                  <span>Upcoming Events</span>
                  <Button variant="link" className="text-sm">View all</Button>
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {events.slice(0, 2).map((event, idx) => (
                    <CommunityCard 
                      key={idx}
                      type="event"
                      title={event.title}
                      date={event.date}
                      location={event.location}
                      attendees={event.attendees}
                      imageUrl={event.imageUrl}
                    />
                  ))}
                </div>
                
                {/* Discussions */}
                <h2 className="text-lg font-semibold text-gray-900 mt-6 flex items-center justify-between">
                  <span>Popular Discussions</span>
                  <Button variant="link" className="text-sm">View all</Button>
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {posts.slice(0, 4).map((post, idx) => (
                    <CommunityCard 
                      key={idx}
                      type="forum"
                      title={post.title}
                      author={post.author}
                      content={post.content}
                      replies={post.replies}
                      likes={post.likes}
                    />
                  ))}
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="events" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {events.map((event, idx) => (
                  <CommunityCard 
                    key={idx}
                    type="event"
                    title={event.title}
                    date={event.date}
                    location={event.location}
                    attendees={event.attendees}
                    imageUrl={event.imageUrl}
                  />
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="discussions" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {posts.filter((_, idx) => idx % 2 === 0).map((post, idx) => (
                  <CommunityCard 
                    key={idx}
                    type="forum"
                    title={post.title}
                    author={post.author}
                    content={post.content}
                    replies={post.replies}
                    likes={post.likes}
                  />
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="questions" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {posts.filter((_, idx) => idx % 2 === 1).map((post, idx) => (
                  <CommunityCard 
                    key={idx}
                    type="forum"
                    title={post.title}
                    author={post.author}
                    content={post.content}
                    replies={post.replies}
                    likes={post.likes}
                  />
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
        
        {/* Right Column - User Contribution */}
        <div className="space-y-6">
          {/* Create Post Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Create a Post</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreatePost} className="space-y-4">
                <div>
                  <Input
                    placeholder="Title"
                    value={postTitle}
                    onChange={(e) => setPostTitle(e.target.value)}
                  />
                </div>
                <div>
                  <Textarea
                    placeholder="What's on your mind?"
                    className="min-h-[120px]"
                    value={postContent}
                    onChange={(e) => setPostContent(e.target.value)}
                  />
                </div>
                <div className="flex justify-end">
                  <Button type="submit" className={getRoleColor()}>
                    Post to Community
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
          
          {/* Popular Topics Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Popular Topics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <a href="#" className="flex items-center justify-between hover:bg-gray-50 p-2 rounded-md transition-colors">
                <span className="font-medium text-gray-700">Digital Nomad Visas</span>
                <span className="text-xs text-gray-500 flex items-center">
                  <span>523 posts</span>
                  <ArrowUpRight className="h-3 w-3 ml-1" />
                </span>
              </a>
              <a href="#" className="flex items-center justify-between hover:bg-gray-50 p-2 rounded-md transition-colors">
                <span className="font-medium text-gray-700">Coworking Spaces</span>
                <span className="text-xs text-gray-500 flex items-center">
                  <span>341 posts</span>
                  <ArrowUpRight className="h-3 w-3 ml-1" />
                </span>
              </a>
              <a href="#" className="flex items-center justify-between hover:bg-gray-50 p-2 rounded-md transition-colors">
                <span className="font-medium text-gray-700">Budget Travel Tips</span>
                <span className="text-xs text-gray-500 flex items-center">
                  <span>287 posts</span>
                  <ArrowUpRight className="h-3 w-3 ml-1" />
                </span>
              </a>
              <a href="#" className="flex items-center justify-between hover:bg-gray-50 p-2 rounded-md transition-colors">
                <span className="font-medium text-gray-700">Business Travel Hacks</span>
                <span className="text-xs text-gray-500 flex items-center">
                  <span>182 posts</span>
                  <ArrowUpRight className="h-3 w-3 ml-1" />
                </span>
              </a>
              <a href="#" className="flex items-center justify-between hover:bg-gray-50 p-2 rounded-md transition-colors">
                <span className="font-medium text-gray-700">Hidden Gems</span>
                <span className="text-xs text-gray-500 flex items-center">
                  <span>156 posts</span>
                  <ArrowUpRight className="h-3 w-3 ml-1" />
                </span>
              </a>
            </CardContent>
          </Card>
          
          {/* Active Members Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Active Members</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <img
                    src="https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=48&h=48&q=80"
                    alt="Emma Wilson"
                    className="w-8 h-8 rounded-full object-cover"
                  />
                  <div className="ml-3">
                    <p className="text-sm font-medium">Emma Wilson</p>
                    <p className="text-xs text-gray-500">Digital Nomad</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm">Follow</Button>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <img
                    src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=48&h=48&q=80"
                    alt="James Chen"
                    className="w-8 h-8 rounded-full object-cover"
                  />
                  <div className="ml-3">
                    <p className="text-sm font-medium">James Chen</p>
                    <p className="text-xs text-gray-500">Business Traveler</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm">Follow</Button>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <img
                    src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=48&h=48&q=80"
                    alt="Sarah Johnson"
                    className="w-8 h-8 rounded-full object-cover"
                  />
                  <div className="ml-3">
                    <p className="text-sm font-medium">Sarah Johnson</p>
                    <p className="text-xs text-gray-500">Tourist</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm">Follow</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default Community;
