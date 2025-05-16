import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { useForm, SubmitHandler, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { format } from 'date-fns';
import { UserRole, TripType, tripValidationSchema } from '@shared/schema';
import { useAuth } from '@/hooks/useAuth';
import { apiRequest } from '@/lib/queryClient';
import { queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import LocationAutocomplete from './LocationAutocomplete';
import DraggableItinerary, { DestinationItem } from './DraggableItinerary';

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
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from '@/lib/utils';
import { CalendarIcon, ChevronRight, Plus, Search, MapPin, CreditCard, Heart, List, Plane, Loader2 } from 'lucide-react';

// Enhanced validation schema for trip creation with multi-destinations
const tripSchema = z.object({
  name: z.string().min(3, { message: 'Trip name must be at least 3 characters' }),
  mainDestination: z.string().min(2, { message: 'Main destination is required' }),
  country: z.string().min(2, { message: 'Country is required' }),
  countryCode: z.string().optional(),
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
  interests: z.array(z.string()),
  destinations: z.array(
    z.object({
      id: z.string(),
      city: z.string(),
      country: z.string(),
      countryCode: z.string().optional(),
      arrivalDate: z.date(),
      departureDate: z.date(),
    })
  ),
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

// Predefined interest options for travelers to choose from
const interestOptions = [
  { label: 'Cultural', value: 'cultural', icon: '🏛️' },
  { label: 'Nature', value: 'nature', icon: '🌲' },
  { label: 'Adventure', value: 'adventure', icon: '🧗‍♂️' },
  { label: 'Food & Drink', value: 'food', icon: '🍽️' },
  { label: 'Relaxation', value: 'relaxation', icon: '🏖️' },
  { label: 'Shopping', value: 'shopping', icon: '🛍️' },
  { label: 'Nightlife', value: 'nightlife', icon: '🌃' },
  { label: 'History', value: 'history', icon: '📜' },
  { label: 'Art', value: 'art', icon: '🎨' },
  { label: 'Architecture', value: 'architecture', icon: '🏗️' },
  { label: 'Photography', value: 'photography', icon: '📸' },
  { label: 'Local Experiences', value: 'local', icon: '👨‍👩‍👧‍👦' },
  { label: 'Remote Work', value: 'work', icon: '💻' },
];

const TripWizardV2: React.FC<TripWizardProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [_, navigate] = useLocation();
  const [step, setStep] = useState(1);
  const totalSteps = 4;
  
  const form = useForm<TripFormValues>({
    resolver: zodResolver(validationSchema),
    defaultValues: {
      name: '',
      mainDestination: '',
      country: '',
      countryCode: '',
      startDate: new Date(),
      endDate: new Date(new Date().setDate(new Date().getDate() + 7)),
      tripType: user?.role === UserRole.BUSINESS ? TripType.BUSINESS : TripType.LEISURE,
      currency: 'USD',
      notes: '',
      interests: [],
      destinations: [],
    },
  });

  // Watch for changes to start/end date to propagate to destinations
  const startDate = useWatch({ name: 'startDate', control: form.control });
  const endDate = useWatch({ name: 'endDate', control: form.control });
  
  // Create trip mutation
  const createTripMutation = useMutation({
    mutationFn: async (data: TripFormValues) => {
      const formattedData = {
        ...data,
        startDate: format(data.startDate, 'yyyy-MM-dd'),
        endDate: format(data.endDate, 'yyyy-MM-dd'),
        destinations: data.destinations.map(dest => ({
          ...dest,
          arrivalDate: format(dest.arrivalDate, 'yyyy-MM-dd'),
          departureDate: format(dest.departureDate, 'yyyy-MM-dd')
        }))
      };
      
      return await apiRequest('/api/trips', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formattedData)
      });
    },
    onSuccess: (data) => {
      toast({
        title: "Trip created!",
        description: "Your trip has been created successfully.",
      });
      // Invalidate both trips and dashboard queries to refresh all relevant data
      queryClient.invalidateQueries({ queryKey: ['/api/trips'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard'] });
      onClose();
      // Redirect to trips page for a consistent flow
      navigate('/trips');
    },
    onError: (error) => {
      toast({
        title: "Error creating trip",
        description: "There was a problem creating your trip. Please try again.",
        variant: "destructive",
      });
      console.error('Error creating trip:', error);
    },
  });

  const onSubmit: SubmitHandler<TripFormValues> = (data) => {
    createTripMutation.mutate(data);
  };

  const handleNextStep = () => {
    const currentStepValid = validateCurrentStep();
    if (!currentStepValid) return;
    
    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      form.handleSubmit(onSubmit)();
    }
  };

  const handlePreviousStep = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const validateCurrentStep = (): boolean => {
    let isValid = true;
    
    if (step === 1) {
      form.trigger(['name', 'startDate', 'endDate', 'mainDestination', 'country']);
      
      const nameError = form.formState.errors.name;
      const startDateError = form.formState.errors.startDate;
      const endDateError = form.formState.errors.endDate;
      const mainDestinationError = form.formState.errors.mainDestination;
      const countryError = form.formState.errors.country;
      
      if (nameError || startDateError || endDateError || mainDestinationError || countryError) {
        isValid = false;
      }
    }
    
    if (step === 2) {
      // Destinations validation is handled by the DraggableItinerary component
      const destinations = form.getValues('destinations');
      
      if (destinations.length === 0) {
        toast({
          title: "Destinations required",
          description: "Please add at least one destination to your trip.",
          variant: "destructive",
        });
        isValid = false;
      }
    }
    
    // Step 3 (Interests) has no required fields
    
    return isValid;
  };

  const handleLocationSelect = (location: { city: string; country: string; countryCode?: string }) => {
    form.setValue('mainDestination', location.city);
    form.setValue('country', location.country);
    form.setValue('countryCode', location.countryCode || '');
    
    // If no destinations yet, add this as the first destination
    const destinations = form.getValues('destinations');
    if (destinations.length === 0) {
      const newDestination: DestinationItem = {
        id: `dest-${Date.now()}`,
        city: location.city,
        country: location.country,
        countryCode: location.countryCode,
        arrivalDate: form.getValues('startDate'),
        departureDate: form.getValues('endDate'),
      };
      
      form.setValue('destinations', [newDestination]);
    }
  };

  const handleDestinationsChange = (destinations: DestinationItem[]) => {
    form.setValue('destinations', destinations);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {step === 1 && "Create a New Trip"}
            {step === 2 && "Add Trip Destinations"}
            {step === 3 && "Interests & Preferences"}
            {step === 4 && "Review & Create Trip"}
          </DialogTitle>
          <DialogDescription>
            {step === 1 && "Enter the basic details of your trip"}
            {step === 2 && "Plan your itinerary by adding destinations"}
            {step === 3 && "Select your travel interests to personalize your trip"}
            {step === 4 && "Review all details before creating your trip"}
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex items-center justify-between mb-4">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div key={i} className="flex items-center">
              <div
                className={cn(
                  "flex items-center justify-center rounded-full w-8 h-8 text-xs font-semibold",
                  step > i + 1
                    ? "bg-primary text-primary-foreground"
                    : step === i + 1
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                )}
              >
                {i + 1}
              </div>
              {i < totalSteps - 1 && (
                <div
                  className={cn(
                    "h-[2px] flex-1",
                    step > i + 1 ? "bg-primary" : "bg-muted"
                  )}
                />
              )}
            </div>
          ))}
        </div>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Step 1: Basic Trip Information */}
            {step === 1 && (
              <>
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Trip Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Summer Vacation 2025" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-2 gap-4">
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
                                  "pl-3 text-left font-normal",
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
                                date < new Date()
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
                                  "pl-3 text-left font-normal",
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
                                date < new Date() || date < form.getValues("startDate")
                              }
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormItem>
                  <FormLabel>Main Destination</FormLabel>
                  <LocationAutocomplete 
                    onSelect={handleLocationSelect}
                    placeholder="Search for a city"
                    defaultValue={
                      form.getValues('mainDestination') && form.getValues('country')
                        ? {
                            city: form.getValues('mainDestination'),
                            country: form.getValues('country'),
                            countryCode: form.getValues('countryCode'),
                          }
                        : undefined
                    }
                  />
                  {form.formState.errors.mainDestination || form.formState.errors.country ? (
                    <FormMessage>Please select a destination</FormMessage>
                  ) : null}
                </FormItem>
                
                <FormField
                  control={form.control}
                  name="tripType"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel>Trip Type</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex flex-col space-y-1"
                        >
                          <FormItem className="flex items-center space-x-3 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="leisure" />
                            </FormControl>
                            <FormLabel className="font-normal">
                              Leisure (vacation, tourism)
                            </FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-3 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="work" />
                            </FormControl>
                            <FormLabel className="font-normal">
                              Work (remote work, digital nomad)
                            </FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-3 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="business" />
                            </FormControl>
                            <FormLabel className="font-normal">
                              Business (meetings, conferences)
                            </FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-3 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="mixed" />
                            </FormControl>
                            <FormLabel className="font-normal">
                              Mixed (combining multiple purposes)
                            </FormLabel>
                          </FormItem>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}
            
            {/* Step 2: Destinations */}
            {step === 2 && (
              <div className="space-y-6">
                <DraggableItinerary
                  destinations={form.getValues('destinations')}
                  onChange={handleDestinationsChange}
                  tripStartDate={form.getValues('startDate')}
                  tripEndDate={form.getValues('endDate')}
                />
              </div>
            )}
            
            {/* Step 3: Interests */}
            {step === 3 && (
              <div className="space-y-6">
                <FormField
                  control={form.control}
                  name="interests"
                  render={() => (
                    <FormItem>
                      <div className="mb-4">
                        <FormLabel className="text-base">Travel Interests</FormLabel>
                        <FormDescription>
                          Select interests that reflect your preferences for this trip
                        </FormDescription>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {interestOptions.map((interest) => (
                          <FormField
                            key={interest.value}
                            control={form.control}
                            name="interests"
                            render={({ field }) => {
                              return (
                                <FormItem
                                  key={interest.value}
                                  className="flex flex-row items-start space-x-3 space-y-0"
                                >
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value?.includes(interest.value)}
                                      onCheckedChange={(checked) => {
                                        return checked
                                          ? field.onChange([...field.value, interest.value])
                                          : field.onChange(
                                              field.value?.filter(
                                                (value) => value !== interest.value
                                              )
                                            )
                                      }}
                                    />
                                  </FormControl>
                                  <FormLabel className="font-normal">
                                    <span className="mr-2">{interest.icon}</span>
                                    {interest.label}
                                  </FormLabel>
                                </FormItem>
                              )
                            }}
                          />
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <Separator className="my-6" />
                
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="budget"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Budget (optional)</FormLabel>
                        <div className="flex">
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="2000" 
                              {...field} 
                              value={field.value === undefined ? '' : field.value}
                              onChange={(e) => {
                                const value = e.target.value === '' ? undefined : Number(e.target.value);
                                field.onChange(value);
                              }}
                            />
                          </FormControl>
                          <FormField
                            control={form.control}
                            name="currency"
                            render={({ field }) => (
                              <Select
                                defaultValue={field.value}
                                onValueChange={field.onChange}
                              >
                                <FormControl>
                                  <SelectTrigger className="w-[90px] ml-2">
                                    <SelectValue placeholder="Currency" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="USD">USD</SelectItem>
                                  <SelectItem value="EUR">EUR</SelectItem>
                                  <SelectItem value="GBP">GBP</SelectItem>
                                  <SelectItem value="JPY">JPY</SelectItem>
                                  <SelectItem value="CAD">CAD</SelectItem>
                                  <SelectItem value="AUD">AUD</SelectItem>
                                </SelectContent>
                              </Select>
                            )}
                          />
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notes (optional)</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Add any notes about your trip here..." 
                          className="resize-none" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}
            
            {/* Step 4: Review */}
            {step === 4 && (
              <div className="space-y-6">
                <div className="bg-muted rounded-lg p-4">
                  <h3 className="font-medium text-lg mb-4">Trip Summary</h3>
                  
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <div className="font-medium">Trip Name:</div>
                      <div>{form.getValues('name')}</div>
                    </div>
                    
                    <Separator />
                    
                    <div className="flex justify-between">
                      <div className="font-medium">Dates:</div>
                      <div>
                        {format(form.getValues('startDate'), 'MMM d, yyyy')} - {format(form.getValues('endDate'), 'MMM d, yyyy')}
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div className="flex justify-between">
                      <div className="font-medium">Main Destination:</div>
                      <div>{form.getValues('mainDestination')}, {form.getValues('country')}</div>
                    </div>
                    
                    <Separator />
                    
                    <div className="flex justify-between">
                      <div className="font-medium">Trip Type:</div>
                      <div className="capitalize">{form.getValues('tripType')}</div>
                    </div>
                    
                    {form.getValues('budget') && (
                      <>
                        <Separator />
                        <div className="flex justify-between">
                          <div className="font-medium">Budget:</div>
                          <div>{form.getValues('budget')} {form.getValues('currency')}</div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
                
                <div>
                  <h3 className="font-medium text-lg mb-2">Destinations</h3>
                  <div className="space-y-2">
                    {form.getValues('destinations').map((dest, index) => (
                      <div key={dest.id} className="flex items-center border rounded-md p-3">
                        <div className="flex-1">
                          <div className="font-medium flex items-center">
                            <MapPin className="h-4 w-4 mr-1" />
                            {dest.city}, {dest.country}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {format(dest.arrivalDate, 'MMM d')} - {format(dest.departureDate, 'MMM d, yyyy')}
                          </div>
                        </div>
                        <Badge variant="outline">
                          {Math.ceil((dest.departureDate.getTime() - dest.arrivalDate.getTime()) / (1000 * 60 * 60 * 24))} days
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
                
                {form.getValues('interests').length > 0 && (
                  <div>
                    <h3 className="font-medium text-lg mb-2">Interests</h3>
                    <div className="flex flex-wrap gap-2">
                      {form.getValues('interests').map(interest => {
                        const interestItem = interestOptions.find(i => i.value === interest);
                        return (
                          <Badge key={interest} variant="secondary">
                            {interestItem ? `${interestItem.icon} ${interestItem.label}` : interest}
                          </Badge>
                        );
                      })}
                    </div>
                  </div>
                )}
                
                {form.getValues('notes') && (
                  <div>
                    <h3 className="font-medium text-lg mb-2">Notes</h3>
                    <div className="text-sm p-3 border rounded-md">
                      {form.getValues('notes')}
                    </div>
                  </div>
                )}
              </div>
            )}
          </form>
        </Form>
        
        <DialogFooter className="flex justify-between">
          {step > 1 ? (
            <Button
              type="button"
              variant="outline"
              onClick={handlePreviousStep}
              disabled={createTripMutation.isPending}
            >
              Back
            </Button>
          ) : (
            <div></div> // Empty space holder to maintain layout
          )}
          
          <Button
            type="button"
            onClick={handleNextStep}
            disabled={createTripMutation.isPending}
          >
            {createTripMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : step < totalSteps ? (
              "Next"
            ) : (
              "Create Trip"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TripWizardV2;