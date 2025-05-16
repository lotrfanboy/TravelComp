import React, { useState } from 'react';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import StripePayment from './StripePayment';
import PayPalButton from './PayPalButton';
import { useToast } from '@/hooks/use-toast';

interface BookingDetails {
  tripId: number;
  type: 'accommodation' | 'attraction' | 'workspace';
  itemId: number;
  itemName: string;
  startDate?: string;
  endDate?: string;
  amount: number;
  currency: string;
  description: string;
}

interface PaymentOptionsProps {
  bookingDetails: BookingDetails;
  onSuccess: (paymentData: any) => void;
  onCancel?: () => void;
}

export default function PaymentOptions({ 
  bookingDetails, 
  onSuccess, 
  onCancel 
}: PaymentOptionsProps) {
  const [paymentMethod, setPaymentMethod] = useState<'stripe' | 'paypal'>('stripe');
  const { toast } = useToast();

  const handlePayPalSuccess = (paymentData: any) => {
    toast({
      title: 'Payment Successful',
      description: 'Your booking has been confirmed via PayPal',
    });
    onSuccess(paymentData);
  };

  const handlePayPalError = (error: any) => {
    toast({
      title: 'Payment Failed',
      description: 'There was an error processing your PayPal payment',
      variant: 'destructive',
    });
  };

  const handleStripeSuccess = (paymentIntentId: string) => {
    toast({
      title: 'Payment Successful',
      description: 'Your booking has been confirmed via Stripe',
    });
    onSuccess({ id: paymentIntentId, provider: 'stripe' });
  };

  return (
    <div className="w-full max-w-md mx-auto my-8">
      <h2 className="text-2xl font-bold mb-6 text-center">Complete Your Booking</h2>
      
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-2">Booking Summary</h3>
          <div className="space-y-2 text-sm">
            <p><span className="font-medium">Item:</span> {bookingDetails.itemName}</p>
            {bookingDetails.startDate && (
              <p><span className="font-medium">Dates:</span> {bookingDetails.startDate} to {bookingDetails.endDate}</p>
            )}
            <p className="text-xl font-bold mt-4">
              Total: {bookingDetails.currency} {bookingDetails.amount.toFixed(2)}
            </p>
          </div>
        </div>
        
        <Tabs defaultValue="stripe" onValueChange={(value) => setPaymentMethod(value as 'stripe' | 'paypal')}>
          <TabsList className="grid grid-cols-2 mb-6">
            <TabsTrigger value="stripe">Pay with Card</TabsTrigger>
            <TabsTrigger value="paypal">Pay with PayPal</TabsTrigger>
          </TabsList>
          
          <TabsContent value="stripe">
            <StripePayment 
              bookingDetails={bookingDetails} 
              onSuccess={handleStripeSuccess} 
            />
          </TabsContent>
          
          <TabsContent value="paypal">
            <PayPalButton 
              amount={bookingDetails.amount.toString()} 
              currency={bookingDetails.currency} 
              intent="CAPTURE"
              onSuccess={handlePayPalSuccess}
              onError={handlePayPalError}
              onCancel={onCancel}
            />
          </TabsContent>
        </Tabs>
        
        {onCancel && (
          <button 
            onClick={onCancel}
            className="w-full mt-4 p-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Cancel
          </button>
        )}
      </div>
    </div>
  );
}