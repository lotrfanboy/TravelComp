import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogHeader, DialogFooter } from '@/components/ui/dialog';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { format } from 'date-fns';
import { MapPin, Calendar as CalendarIcon, Star, Wifi, Coffee, Users, DollarSign, Clock } from 'lucide-react';
import { cn, formatCurrency } from '@/lib/utils';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import PaymentOptions from './PaymentOptions';

interface BookingOption {
  id: number;
  name: string;
  city: string;
  country: string;
  imageUrl?: string;
  description?: string;
  price?: number;
  pricePerNight?: number;
  pricePerDay?: number;
  pricePerPerson?: number;
  currency?: string;
  rating?: number;
  amenities?: string[];
  type: 'accommodation' | 'attraction' | 'workspace';
  externalBookingUrl?: string;
  externalBookingPartner?: string;
}

interface BookingCardProps {
  option: BookingOption;
  tripId: number;
}

export default function BookingCard({ option, tripId }: BookingCardProps) {
  const [showBookingDialog, setShowBookingDialog] = useState(false);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [dateFrom, setDateFrom] = useState<Date | undefined>(undefined);
  const [dateTo, setDateTo] = useState<Date | undefined>(undefined);
  const [isCheckingAvailability, setIsCheckingAvailability] = useState(false);
  const [bookingDetails, setBookingDetails] = useState<any>(null);
  const [bookingConfirmed, setBookingConfirmed] = useState(false);
  const { toast } = useToast();

  // Extract price from different possible properties
  const getPrice = () => {
    return option.price || option.pricePerNight || option.pricePerDay || option.pricePerPerson || 0;
  };

  const getCurrency = () => {
    return option.currency || 'USD';
  };

  const getPriceDisplay = () => {
    const price = getPrice();
    const currency = getCurrency();
    
    if (option.type === 'accommodation') {
      return `${formatCurrency(price, currency)} per night`;
    } else if (option.type === 'workspace') {
      return `${formatCurrency(price, currency)} per day`;
    } else {
      return formatCurrency(price, currency);
    }
  };

  const getAmenityIcon = (amenity: string) => {
    const lowerAmenity = amenity.toLowerCase();
    if (lowerAmenity.includes('wifi')) return <Wifi className="h-4 w-4" />;
    if (lowerAmenity.includes('coffee')) return <Coffee className="h-4 w-4" />;
    if (lowerAmenity.includes('meeting') || lowerAmenity.includes('conference')) return <Users className="h-4 w-4" />;
    if (lowerAmenity.includes('24')) return <Clock className="h-4 w-4" />;
    return null;
  };

  const handleBookNow = () => {
    // For accommodations and workspaces, open date picker
    if (option.type === 'accommodation' || option.type === 'workspace') {
      setShowBookingDialog(true);
    } else {
      // For attractions, directly check availability for today
      const today = new Date();
      handleCheckAvailability(today);
    }
  };

  const handleCheckAvailability = async (date?: Date) => {
    setIsCheckingAvailability(true);
    
    try {
      // Prepare dates based on booking type
      const startDate = date || dateFrom;
      const endDate = option.type === 'attraction' ? startDate : dateTo;
      
      if (!startDate || (option.type !== 'attraction' && !endDate)) {
        toast({
          title: "Missing Dates",
          description: "Please select both check-in and check-out dates",
          variant: "destructive"
        });
        setIsCheckingAvailability(false);
        return;
      }

      // Format dates for API request
      const formattedStartDate = format(startDate, 'yyyy-MM-dd');
      const formattedEndDate = endDate ? format(endDate, 'yyyy-MM-dd') : formattedStartDate;

      // First check availability
      const availabilityResponse = await apiRequest(
        `/api/booking/check-availability?type=${option.type === 'accommodation' ? 'hotel' : option.type}&id=${option.id}&startDate=${formattedStartDate}&endDate=${formattedEndDate}`,
        { method: 'GET' }
      );

      const availabilityData = await availabilityResponse.json();
      
      if (!availabilityData.available) {
        toast({
          title: "Not Available",
          description: `This ${option.type} is not available for the selected dates`,
          variant: "destructive"
        });
        setIsCheckingAvailability(false);
        return;
      }

      // Get booking options (pricing, etc.)
      const bookingResponse = await apiRequest(
        `/api/booking/options?type=${option.type}&id=${option.id}&startDate=${formattedStartDate}&endDate=${formattedEndDate}`,
        { method: 'GET' }
      );

      const bookingData = await bookingResponse.json();
      
      // Prepare booking details for payment
      const details = {
        tripId: tripId,
        type: option.type,
        itemId: option.id,
        itemName: option.name,
        startDate: formattedStartDate,
        endDate: formattedEndDate,
        amount: bookingData.pricing.totalPrice,
        currency: bookingData.pricing.currency,
        description: `Booking for ${option.name} in ${option.city}, ${option.country}`
      };
      
      setBookingDetails(details);
      setShowBookingDialog(false);
      setShowPaymentDialog(true);
    } catch (error) {
      console.error('Error checking availability:', error);
      toast({
        title: "Error",
        description: "Failed to check availability",
        variant: "destructive"
      });
    } finally {
      setIsCheckingAvailability(false);
    }
  };

  const handleExternalBooking = () => {
    if (option.externalBookingUrl) {
      window.open(option.externalBookingUrl, '_blank');
    }
  };

  const handlePaymentSuccess = (paymentData: any) => {
    const paymentId = typeof paymentData === 'string' 
      ? paymentData 
      : paymentData.id;
    const provider = paymentData.provider || 'stripe';
    
    toast({
      title: "Booking Confirmed!",
      description: `Your booking for ${option.name} has been confirmed via ${provider}`,
    });
    
    setBookingConfirmed(true);
    setShowPaymentDialog(false);
  };

  return (
    <>
      <Card className="overflow-hidden hover:shadow-lg transition-shadow">
        {option.imageUrl && (
          <div className="aspect-video w-full overflow-hidden">
            <img
              src={option.imageUrl}
              alt={option.name}
              className="h-full w-full object-cover transition-transform hover:scale-105"
            />
          </div>
        )}
        <CardHeader className="pb-3">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-xl">{option.name}</CardTitle>
              <CardDescription className="flex items-center mt-1">
                <MapPin className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
                {option.city}, {option.country}
              </CardDescription>
            </div>
            {option.rating && (
              <Badge variant="secondary" className="flex items-center">
                <Star className="h-3.5 w-3.5 mr-1 fill-yellow-400 text-yellow-400" />
                {option.rating}
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="pb-4">
          {option.description && (
            <p className="text-muted-foreground text-sm mb-4 line-clamp-3">
              {option.description}
            </p>
          )}
          
          {option.amenities && option.amenities.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {option.amenities.slice(0, 4).map((amenity, index) => (
                <Badge key={index} variant="outline" className="flex items-center gap-1">
                  {getAmenityIcon(amenity)}
                  <span className="text-xs">{amenity}</span>
                </Badge>
              ))}
            </div>
          )}
          
          <div className="mt-4 flex items-center text-lg font-semibold">
            <DollarSign className="h-5 w-5 text-primary" />
            {getPriceDisplay()}
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button 
            variant="outline"
            size="sm"
            onClick={handleBookNow}
          >
            Book Now
          </Button>
          
          {option.externalBookingPartner && (
            <Button 
              variant="secondary" 
              size="sm"
              onClick={handleExternalBooking}
              className="flex items-center gap-2"
            >
              Book on {option.externalBookingPartner}
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
            </Button>
          )}
        </CardFooter>
      </Card>

      {/* Date selection dialog */}
      <Dialog open={showBookingDialog} onOpenChange={setShowBookingDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Book {option.name}</DialogTitle>
            <DialogDescription>
              Select your check-in and check-out dates
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col space-y-2">
                <label className="text-sm font-medium">Check-in</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !dateFrom && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateFrom ? format(dateFrom, 'PPP') : 'Select date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={dateFrom}
                      onSelect={setDateFrom}
                      initialFocus
                      disabled={(date) => date < new Date()}
                    />
                  </PopoverContent>
                </Popover>
              </div>
              
              <div className="flex flex-col space-y-2">
                <label className="text-sm font-medium">Check-out</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !dateTo && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateTo ? format(dateTo, 'PPP') : 'Select date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={dateTo}
                      onSelect={setDateTo}
                      initialFocus
                      disabled={(date) => !dateFrom || date <= dateFrom}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowBookingDialog(false)}>Cancel</Button>
            <Button 
              onClick={() => handleCheckAvailability()} 
              disabled={!dateFrom || !dateTo || isCheckingAvailability}
            >
              {isCheckingAvailability ? "Checking..." : "Check Availability"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Payment dialog */}
      <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Complete your booking</DialogTitle>
            <DialogDescription>
              Choose your preferred payment method
            </DialogDescription>
          </DialogHeader>
          {bookingDetails && (
            <PaymentOptions 
              bookingDetails={bookingDetails}
              onSuccess={handlePaymentSuccess}
              onCancel={() => setShowPaymentDialog(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}