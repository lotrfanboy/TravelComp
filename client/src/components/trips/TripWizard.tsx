import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { format } from 'date-fns';
import { UserRole, TripType, tripValidationSchema } from '@shared/schema';
import { useAuth } from '@/hooks/useAuth';
import { apiRequest } from '@/lib/queryClient';
import { queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from "@/components/ui/badge";
import { cn } from '@/lib/utils';
import { CalendarIcon, ChevronRight, Plus, Search } from 'lucide-react';

// Basic validation schema for trip creation
const tripSchema = z.object({
  name: z.string().min(3, { message: 'Trip name must be at least 3 characters' }),
  destination: z.string().min(2, { message: 'Destination is required' }),
  country: z.string().min(2, { message: 'Country is required' }),
  startDate: z.date({
    required_error: 'Start date is required',
  }),
  endDate: z.date({
    required_error: 'End date is required',
  }),
  tripType: z.enum(['leisure', 'work', 'business', 'mixed']),
  budget: z.coerce.number().optional(),
  currency: z.string().default('USD'),
  notes: z.string().optional(),
});

// Ensure end date is after start date
const validationSchema = tripSchema.refine(
  (data) => data.endDate >= data.startDate,
  {
    message: "End date must be after start date",
    path: ["endDate"],
  }
);

type TripFormValues = z.infer<typeof validationSchema>;

interface TripWizardProps {
  isOpen: boolean;
  onClose: () => void;
}

const TripWizard: React.FC<TripWizardProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [_, navigate] = useLocation();
  const [step, setStep] = useState(1);
  const [interests, setInterests] = useState<string[]>([]);
  
  const form = useForm<TripFormValues>({
    resolver: zodResolver(validationSchema),
    defaultValues: {
      name: '',
      destination: '',
      country: '',
      startDate: new Date(),
      endDate: new Date(new Date().setDate(new Date().getDate() + 7)),
      tripType: user?.role === UserRole.BUSINESS ? TripType.BUSINESS : TripType.LEISURE,
      currency: 'USD',
      notes: '',
    },
  });

  const createTrip = useMutation({
    mutationFn: async (data: TripFormValues) => {
      const response = await apiRequest('/api/trips', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...data,
          isPublic: false,
          // User ID will be taken from the authenticated session on the server
        })
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Success!',
        description: 'Your trip has been created.',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/trips'] });
      onClose();
      navigate('/trips');
    },
    onError: (error) => {
      console.error('Error creating trip:', error);
      toast({
        title: 'Error',
        description: 'Failed to create trip. Please try again.',
        variant: 'destructive',
      });
    },
  });

  const onSubmit: SubmitHandler<TripFormValues> = (data) => {
    // For the final step, submit the form
    if (step === 4) {
      createTrip.mutate(data);
    } else {
      // Otherwise, move to the next step
      setStep(step + 1);
    }
  };

  const handlePrevious = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const toggleInterest = (interest: string) => {
    setInterests(prev => 
      prev.includes(interest) 
        ? prev.filter(i => i !== interest) 
        : [...prev, interest]
    );
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return renderBasicInfo();
      case 2:
        return user?.role === UserRole.NOMAD 
          ? renderWorkspaces() 
          : user?.role === UserRole.BUSINESS 
            ? renderTeamMembers()
            : renderInterests();
      case 3:
        return renderAccommodation();
      case 4:
        return renderBudget();
      default:
        return renderBasicInfo();
    }
  };

  const renderBasicInfo = () => (
    <>
      <FormField
        control={form.control}
        name="name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Trip Name</FormLabel>
            <FormControl>
              <Input placeholder="e.g. Bali Digital Nomad Adventure" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField
          control={form.control}
          name="startDate"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Start Date</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full pl-3 text-left font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      {field.value ? (
                        format(field.value, "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    disabled={(date) =>
                      date < new Date(new Date().setHours(0, 0, 0, 0))
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="endDate"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>End Date</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full pl-3 text-left font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      {field.value ? (
                        format(field.value, "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    disabled={(date) => {
                      const startDate = form.getValues("startDate");
                      return date < startDate || date < new Date(new Date().setHours(0, 0, 0, 0));
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={form.control}
        name="destination"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Destination</FormLabel>
            <div className="flex rounded-md shadow-sm">
              <FormControl>
                <Input placeholder="Enter city" {...field} className="rounded-r-none" />
              </FormControl>
              <Button 
                type="button" 
                variant="secondary" 
                className="rounded-l-none"
              >
                <Search className="h-4 w-4 mr-2" />
                Search
              </Button>
            </div>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="country"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Country</FormLabel>
            <FormControl>
              <Input placeholder="Enter country" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="tripType"
        render={({ field }) => (
          <FormItem className="space-y-3">
            <FormLabel>Trip Purpose</FormLabel>
            <FormControl>
              <RadioGroup
                onValueChange={field.onChange}
                defaultValue={field.value}
                className="flex flex-col space-y-1"
              >
                <div className="grid grid-cols-2 gap-4">
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="leisure" />
                    </FormControl>
                    <FormLabel className="font-normal">
                      Leisure
                    </FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="work" />
                    </FormControl>
                    <FormLabel className="font-normal">
                      Remote Work
                    </FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="business" />
                    </FormControl>
                    <FormLabel className="font-normal">
                      Business
                    </FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="mixed" />
                    </FormControl>
                    <FormLabel className="font-normal">
                      Mixed
                    </FormLabel>
                  </FormItem>
                </div>
              </RadioGroup>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );

  const renderInterests = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">What are your interests for this trip?</h3>
        <p className="text-sm text-gray-500 mb-4">
          Select the activities and experiences you're interested in. This helps us suggest appropriate attractions.
        </p>
        
        <div className="flex flex-wrap gap-3 mt-4">
          {['Culture', 'Nature', 'Nightlife', 'Relaxation', 'Adventure', 'Gastronomy', 'Shopping', 'Art', 'History', 'Photography', 'Wildlife', 'Beach'].map((interest) => (
            <Badge 
              key={interest}
              variant={interests.includes(interest) ? "default" : "outline"}
              className="px-4 py-2 cursor-pointer"
              onClick={() => toggleInterest(interest)}
            >
              {interest}
            </Badge>
          ))}
        </div>
      </div>
      
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Preferences</h3>
        
        <div className="space-y-4">
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">Preferred accommodation types:</p>
            <div className="flex flex-wrap gap-3">
              {['Hotel', 'Hostel', 'Apartment', 'Resort', 'Villa'].map((type) => (
                <Badge 
                  key={type}
                  variant="outline"
                  className="px-3 py-1 cursor-pointer"
                >
                  {type}
                </Badge>
              ))}
            </div>
          </div>
          
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">Dining preferences:</p>
            <div className="flex flex-wrap gap-3">
              {['Local Cuisine', 'Fine Dining', 'Street Food', 'Vegetarian', 'Vegan'].map((pref) => (
                <Badge 
                  key={pref}
                  variant="outline"
                  className="px-3 py-1 cursor-pointer"
                >
                  {pref}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderWorkspaces = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Workspace Requirements</h3>
        <p className="text-sm text-gray-500 mb-4">
          Help us find the best workspaces for your digital nomad lifestyle.
        </p>
        
        <div className="space-y-4">
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">Internet Needs:</p>
            <div className="flex flex-wrap gap-3">
              {['High-Speed Required', 'Video Calls', 'VPN Friendly', 'Backup Connection'].map((need) => (
                <Badge 
                  key={need}
                  variant="outline"
                  className="px-3 py-1 cursor-pointer"
                >
                  {need}
                </Badge>
              ))}
            </div>
          </div>
          
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">Workspace Type:</p>
            <div className="flex flex-wrap gap-3">
              {['Coworking Space', 'Café', 'Hotel Working Area', 'Library', 'Outdoor Friendly'].map((type) => (
                <Badge 
                  key={type}
                  variant="outline"
                  className="px-3 py-1 cursor-pointer"
                >
                  {type}
                </Badge>
              ))}
            </div>
          </div>
          
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">Preferred Amenities:</p>
            <div className="flex flex-wrap gap-3">
              {['Coffee Included', 'Standing Desk', 'Ergonomic Chair', 'Meeting Rooms', '24/7 Access', 'Printing'].map((amenity) => (
                <Badge 
                  key={amenity}
                  variant="outline"
                  className="px-3 py-1 cursor-pointer"
                >
                  {amenity}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Work Schedule</h3>
        <p className="text-sm text-gray-500 mb-4">
          Let us know about your work patterns during this trip.
        </p>
        
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">Working Days:</p>
              <div className="flex flex-wrap gap-2">
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
                  <Badge 
                    key={day}
                    variant="outline"
                    className="px-3 py-1 cursor-pointer w-12 text-center"
                  >
                    {day}
                  </Badge>
                ))}
              </div>
            </div>
            
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">Working Hours:</p>
              <div className="flex items-center gap-2">
                <Select>
                  <SelectTrigger className="w-24">
                    <SelectValue placeholder="Start" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 24 }).map((_, i) => (
                      <SelectItem key={i} value={`${i}`}>
                        {i < 10 ? `0${i}:00` : `${i}:00`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <span>to</span>
                <Select>
                  <SelectTrigger className="w-24">
                    <SelectValue placeholder="End" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 24 }).map((_, i) => (
                      <SelectItem key={i} value={`${i}`}>
                        {i < 10 ? `0${i}:00` : `${i}:00`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderTeamMembers = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Team Members</h3>
        <p className="text-sm text-gray-500 mb-4">
          Add team members who will be joining this business trip.
        </p>
        
        <div className="space-y-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-500">
                  AC
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">Alex Chen (You)</p>
                  <p className="text-xs text-gray-500">Director</p>
                </div>
              </div>
              <Badge variant="outline" className="bg-indigo-50">Trip Owner</Badge>
            </div>
          </div>
          
          <div className="border border-dashed border-gray-300 rounded-lg p-4 hover:bg-gray-50 cursor-pointer">
            <div className="flex items-center justify-center text-gray-500">
              <Plus className="h-5 w-5 mr-2" />
              <span>Add Team Member</span>
            </div>
          </div>
        </div>
      </div>
      
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Business Requirements</h3>
        
        <div className="space-y-4">
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">Meeting Facilities Needed:</p>
            <div className="flex flex-wrap gap-3">
              {['Conference Room', 'Presentation Equipment', 'Video Conferencing', 'Private Office'].map((facility) => (
                <Badge 
                  key={facility}
                  variant="outline"
                  className="px-3 py-1 cursor-pointer"
                >
                  {facility}
                </Badge>
              ))}
            </div>
          </div>
          
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">Transportation Requirements:</p>
            <div className="flex flex-wrap gap-3">
              {['Airport Transfer', 'Car Rental', 'Chauffeur Service', 'Public Transport'].map((transport) => (
                <Badge 
                  key={transport}
                  variant="outline"
                  className="px-3 py-1 cursor-pointer"
                >
                  {transport}
                </Badge>
              ))}
            </div>
          </div>
          
          <FormField
            name="notes"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Additional Business Requirements</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Add any special requirements for this business trip..." 
                    className="resize-none" 
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>
    </div>
  );

  const renderAccommodation = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Accommodation Preferences</h3>
        <p className="text-sm text-gray-500 mb-4">
          Tell us what you're looking for in your accommodations.
        </p>
        
        <div className="space-y-4">
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">Accommodation Type:</p>
            <div className="flex flex-wrap gap-3">
              {['Hotel', 'Hostel', 'Apartment', 'Resort', 'Villa', 'Guesthouse', 'Airbnb'].map((type) => (
                <Badge 
                  key={type}
                  variant="outline"
                  className="px-3 py-1 cursor-pointer"
                >
                  {type}
                </Badge>
              ))}
            </div>
          </div>
          
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">Room Type:</p>
            <div className="flex flex-wrap gap-3">
              {['Single', 'Double', 'Twin', 'Suite', 'Family Room', 'Dormitory'].map((type) => (
                <Badge 
                  key={type}
                  variant="outline"
                  className="px-3 py-1 cursor-pointer"
                >
                  {type}
                </Badge>
              ))}
            </div>
          </div>
          
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">Must-Have Amenities:</p>
            <div className="flex flex-wrap gap-3">
              {['Free WiFi', 'Breakfast Included', 'Air Conditioning', 'Pool', 'Kitchen', 'Gym', 'Workspace'].map((amenity) => (
                <Badge 
                  key={amenity}
                  variant="outline"
                  className="px-3 py-1 cursor-pointer"
                >
                  {amenity}
                </Badge>
              ))}
            </div>
          </div>
          
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">Location Preference:</p>
            <div className="flex flex-wrap gap-3">
              {['City Center', 'Near Beach', 'Quiet Area', 'Business District', 'Tourist Area', 'Near Public Transport'].map((location) => (
                <Badge 
                  key={location}
                  variant="outline"
                  className="px-3 py-1 cursor-pointer"
                >
                  {location}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Booking Preferences</h3>
        
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">Price Range per Night:</p>
              <div className="flex items-center gap-2">
                <Select>
                  <SelectTrigger className="w-24">
                    <SelectValue placeholder="Min" />
                  </SelectTrigger>
                  <SelectContent>
                    {[50, 100, 150, 200, 250, 300, 350, 400, 450, 500].map((price) => (
                      <SelectItem key={price} value={`${price}`}>
                        ${price}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <span>to</span>
                <Select>
                  <SelectTrigger className="w-24">
                    <SelectValue placeholder="Max" />
                  </SelectTrigger>
                  <SelectContent>
                    {[100, 150, 200, 250, 300, 350, 400, 450, 500, 600, 700, 800, 900, 1000].map((price) => (
                      <SelectItem key={price} value={`${price}`}>
                        ${price}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select defaultValue="USD">
                  <SelectTrigger className="w-24">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">USD</SelectItem>
                    <SelectItem value="EUR">EUR</SelectItem>
                    <SelectItem value="GBP">GBP</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">Booking Platform Preference:</p>
              <div className="flex flex-wrap gap-2">
                {['Booking.com', 'Airbnb', 'Expedia', 'Hotels.com', 'Direct'].map((platform) => (
                  <Badge 
                    key={platform}
                    variant="outline"
                    className="px-3 py-1 cursor-pointer"
                  >
                    {platform}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderBudget = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Budget Planning</h3>
        <p className="text-sm text-gray-500 mb-4">
          Set your budget for this trip to help track expenses.
        </p>
        
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="budget"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Total Budget</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="0" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="currency"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Currency</FormLabel>
                  <Select
                    defaultValue={field.value}
                    onValueChange={field.onChange}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select currency" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="USD">USD - US Dollar</SelectItem>
                      <SelectItem value="EUR">EUR - Euro</SelectItem>
                      <SelectItem value="GBP">GBP - British Pound</SelectItem>
                      <SelectItem value="JPY">JPY - Japanese Yen</SelectItem>
                      <SelectItem value="AUD">AUD - Australian Dollar</SelectItem>
                      <SelectItem value="CAD">CAD - Canadian Dollar</SelectItem>
                      <SelectItem value="CHF">CHF - Swiss Franc</SelectItem>
                      <SelectItem value="CNY">CNY - Chinese Yuan</SelectItem>
                      <SelectItem value="SGD">SGD - Singapore Dollar</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">Budget Breakdown (Optional):</p>
            <div className="space-y-3">
              <div className="flex items-center">
                <p className="text-sm text-gray-600 w-40">Accommodation:</p>
                <Input type="number" placeholder="0" className="w-28" />
                <span className="ml-2 text-sm text-gray-500">
                  {form.watch('currency') || 'USD'}
                </span>
              </div>
              <div className="flex items-center">
                <p className="text-sm text-gray-600 w-40">Transportation:</p>
                <Input type="number" placeholder="0" className="w-28" />
                <span className="ml-2 text-sm text-gray-500">
                  {form.watch('currency') || 'USD'}
                </span>
              </div>
              <div className="flex items-center">
                <p className="text-sm text-gray-600 w-40">Food & Dining:</p>
                <Input type="number" placeholder="0" className="w-28" />
                <span className="ml-2 text-sm text-gray-500">
                  {form.watch('currency') || 'USD'}
                </span>
              </div>
              <div className="flex items-center">
                <p className="text-sm text-gray-600 w-40">Activities:</p>
                <Input type="number" placeholder="0" className="w-28" />
                <span className="ml-2 text-sm text-gray-500">
                  {form.watch('currency') || 'USD'}
                </span>
              </div>
              <div className="flex items-center">
                <p className="text-sm text-gray-600 w-40">Miscellaneous:</p>
                <Input type="number" placeholder="0" className="w-28" />
                <span className="ml-2 text-sm text-gray-500">
                  {form.watch('currency') || 'USD'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <FormField
        control={form.control}
        name="notes"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Trip Notes</FormLabel>
            <FormControl>
              <Textarea 
                placeholder="Add any notes or special requirements for your trip..." 
                className="resize-none" 
                {...field}
              />
            </FormControl>
            <FormDescription>
              These notes will be visible to you and anyone you share your trip with.
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="text-sm font-medium text-gray-900 mb-2">Trip Summary</h4>
        <ul className="space-y-2 text-sm text-gray-600">
          <li className="flex justify-between">
            <span>Destination:</span>
            <span className="font-medium">{form.watch('destination')}, {form.watch('country')}</span>
          </li>
          <li className="flex justify-between">
            <span>Dates:</span>
            <span className="font-medium">
              {form.watch('startDate') ? format(form.watch('startDate'), 'MMM d, yyyy') : ''} - 
              {form.watch('endDate') ? format(form.watch('endDate'), 'MMM d, yyyy') : ''}
            </span>
          </li>
          <li className="flex justify-between">
            <span>Trip Type:</span>
            <span className="font-medium capitalize">{form.watch('tripType')}</span>
          </li>
          <li className="flex justify-between">
            <span>Budget:</span>
            <span className="font-medium">
              {form.watch('budget') ? `${form.watch('currency')} ${form.watch('budget')}` : 'Not specified'}
            </span>
          </li>
        </ul>
      </div>
    </div>
  );

  const getButtonColor = () => {
    if (user?.role === UserRole.TOURIST) {
      return 'bg-yellow-500 hover:bg-yellow-600';
    } else if (user?.role === UserRole.NOMAD) {
      return 'bg-emerald-500 hover:bg-emerald-600';
    } else if (user?.role === UserRole.BUSINESS) {
      return 'bg-indigo-500 hover:bg-indigo-600';
    }
    return 'bg-primary-500 hover:bg-primary-600';
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-auto">
        <DialogHeader>
          <DialogTitle>Create New Trip</DialogTitle>
          <DialogDescription>
            Fill in the details to plan your perfect trip.
          </DialogDescription>
        </DialogHeader>
        
        {/* Progress Steps */}
        <div className="mt-4">
          <div className="flex items-center">
            <div className="flex items-center relative">
              <div className={`rounded-full h-8 w-8 flex items-center justify-center text-white text-sm ${step >= 1 ? getButtonColor() : 'bg-gray-300'}`}>1</div>
              <div className="absolute top-0 -ml-4 text-xs w-16 text-center mt-10">Basic Info</div>
            </div>
            <div className="flex-grow border-t border-gray-300 mx-2"></div>
            <div className="flex items-center relative">
              <div className={`rounded-full h-8 w-8 flex items-center justify-center text-white text-sm ${step >= 2 ? getButtonColor() : 'bg-gray-300'}`}>2</div>
              <div className="absolute top-0 -ml-4 text-xs w-16 text-center mt-10">
                {user?.role === UserRole.NOMAD 
                  ? 'Workspaces' 
                  : user?.role === UserRole.BUSINESS 
                    ? 'Team' 
                    : 'Interests'}
              </div>
            </div>
            <div className="flex-grow border-t border-gray-300 mx-2"></div>
            <div className="flex items-center relative">
              <div className={`rounded-full h-8 w-8 flex items-center justify-center text-white text-sm ${step >= 3 ? getButtonColor() : 'bg-gray-300'}`}>3</div>
              <div className="absolute top-0 -ml-4 text-xs w-16 text-center mt-10">Accommodation</div>
            </div>
            <div className="flex-grow border-t border-gray-300 mx-2"></div>
            <div className="flex items-center relative">
              <div className={`rounded-full h-8 w-8 flex items-center justify-center text-white text-sm ${step >= 4 ? getButtonColor() : 'bg-gray-300'}`}>4</div>
              <div className="absolute top-0 -ml-6 text-xs w-20 text-center mt-10">Budget & Summary</div>
            </div>
          </div>
        </div>
        
        {/* Form */}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {renderStep()}
          </form>
        </Form>
        
        <DialogFooter className="flex justify-between">
          {step === 1 ? (
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
          ) : (
            <Button variant="outline" onClick={handlePrevious}>
              Previous
            </Button>
          )}
          
          <Button 
            type="submit"
            onClick={form.handleSubmit(onSubmit)}
            className={`${getButtonColor()} text-white`}
            disabled={createTrip.isPending}
          >
            {step < 4 ? (
              <>
                Next Step
                <ChevronRight className="ml-2 h-4 w-4" />
              </>
            ) : (
              createTrip.isPending ? 'Creating...' : 'Create Trip'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TripWizard;
