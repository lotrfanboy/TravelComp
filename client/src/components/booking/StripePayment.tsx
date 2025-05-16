import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useLocation } from 'wouter';
import { 
  Elements,
  PaymentElement,
  useStripe, 
  useElements 
} from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';

// Initialize Stripe with the publishable key
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

interface CheckoutFormProps {
  clientSecret: string;
  bookingDetails: {
    tripId: number;
    type: 'accommodation' | 'attraction' | 'workspace';
    itemId: number;
    itemName: string;
    startDate?: string;
    endDate?: string;
    amount: number;
    currency: string;
    description: string;
  };
  onSuccess: (paymentIntentId: string) => void;
}

const CheckoutForm = ({ clientSecret, bookingDetails, onSuccess }: CheckoutFormProps) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { toast } = useToast();
  const [_, navigate] = useLocation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);

    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: window.location.origin + '/booking/confirmation',
        },
        redirect: 'if_required'
      });

      if (error) {
        setErrorMessage(error.message || 'An error occurred during payment');
        toast({
          title: 'Payment Failed',
          description: error.message || 'An error occurred during payment',
          variant: 'destructive'
        });
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        // Payment successful
        toast({
          title: 'Payment Successful',
          description: 'Your booking has been confirmed!',
          variant: 'default'
        });
        
        // Call onSuccess with the payment intent id
        onSuccess(paymentIntent.id);
      }
    } catch (error) {
      console.error('Payment error:', error);
      setErrorMessage('An unexpected error occurred');
      toast({
        title: 'Payment Error',
        description: 'An unexpected error occurred',
        variant: 'destructive'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement />
      
      {errorMessage && (
        <div className="text-destructive text-sm">{errorMessage}</div>
      )}
      
      <div className="mt-6">
        <Button 
          type="submit" 
          disabled={!stripe || isProcessing} 
          className="w-full"
          size="lg"
        >
          {isProcessing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            `Pay ${bookingDetails.amount} ${bookingDetails.currency}`
          )}
        </Button>
      </div>
    </form>
  );
};

interface StripePaymentProps {
  bookingDetails: {
    tripId: number;
    type: 'accommodation' | 'attraction' | 'workspace';
    itemId: number;
    itemName: string;
    startDate?: string;
    endDate?: string;
    amount: number;
    currency: string;
    description: string;
  };
  onSuccess: (paymentIntentId: string) => void;
}

export default function StripePayment({ bookingDetails, onSuccess }: StripePaymentProps) {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [paymentIntentId, setPaymentIntentId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const createPaymentIntent = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const requestData = {
          tripId: bookingDetails.tripId,
          amount: bookingDetails.amount,
          currency: bookingDetails.currency.toLowerCase(),
          description: bookingDetails.description,
          startDate: bookingDetails.startDate,
          endDate: bookingDetails.endDate,
        };

        // Add the appropriate ID based on the type
        if (bookingDetails.type === 'accommodation') {
          Object.assign(requestData, { accommodationId: bookingDetails.itemId });
        } else if (bookingDetails.type === 'attraction') {
          Object.assign(requestData, { attractionId: bookingDetails.itemId });
        } else if (bookingDetails.type === 'workspace') {
          Object.assign(requestData, { workspaceId: bookingDetails.itemId });
        }

        const response = await apiRequest('/api/booking/payment', {
          method: 'POST',
          body: JSON.stringify(requestData),
          headers: {
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const data = await response.json();
          setClientSecret(data.clientSecret);
          setPaymentIntentId(data.paymentIntentId);
        } else {
          const errorData = await response.json();
          setError(errorData.message || 'Failed to create payment');
          toast({
            title: 'Payment Setup Failed',
            description: errorData.message || 'Failed to create payment',
            variant: 'destructive'
          });
        }
      } catch (err) {
        console.error('Error creating payment intent:', err);
        setError('An unexpected error occurred');
        toast({
          title: 'Payment Setup Error',
          description: 'Failed to initialize payment',
          variant: 'destructive'
        });
      } finally {
        setIsLoading(false);
      }
    };

    createPaymentIntent();
  }, [bookingDetails, toast]);

  const handlePaymentSuccess = async (paymentIntentId: string) => {
    try {
      // Confirm the booking with the backend
      const response = await apiRequest(`/api/booking/confirm/${paymentIntentId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        onSuccess(paymentIntentId);
      } else {
        const errorData = await response.json();
        toast({
          title: 'Booking Confirmation Failed',
          description: errorData.message || 'Failed to confirm booking',
          variant: 'destructive'
        });
      }
    } catch (err) {
      console.error('Error confirming booking:', err);
      toast({
        title: 'Booking Error',
        description: 'Failed to complete booking process',
        variant: 'destructive'
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Setting up payment...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="text-destructive mb-4">Unable to process payment</div>
        <p className="text-muted-foreground mb-6">{error}</p>
        <Button variant="outline" onClick={() => window.history.back()}>
          Go Back
        </Button>
      </div>
    );
  }

  if (!clientSecret) {
    return (
      <div className="text-center py-8">
        <div className="text-destructive mb-6">Payment setup error</div>
        <Button variant="outline" onClick={() => window.history.back()}>
          Go Back
        </Button>
      </div>
    );
  }

  const options = {
    clientSecret,
    appearance: {
      theme: 'stripe' as const,
    },
  };

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6">Complete Your Booking</h2>
      
      <div className="mb-6 p-4 bg-gray-50 rounded-md">
        <h3 className="font-medium mb-2">{bookingDetails.itemName}</h3>
        <div className="text-sm text-gray-600 space-y-1">
          {bookingDetails.startDate && (
            <p>
              {bookingDetails.type === 'attraction' 
                ? `Date: ${new Date(bookingDetails.startDate).toLocaleDateString()}`
                : `Check-in: ${new Date(bookingDetails.startDate).toLocaleDateString()}`
              }
            </p>
          )}
          {bookingDetails.endDate && (
            <p>Check-out: {new Date(bookingDetails.endDate).toLocaleDateString()}</p>
          )}
          <p className="font-medium">
            Total: {bookingDetails.amount} {bookingDetails.currency}
          </p>
        </div>
      </div>
      
      <Elements stripe={stripePromise} options={options}>
        <CheckoutForm 
          clientSecret={clientSecret}
          bookingDetails={bookingDetails}
          onSuccess={handlePaymentSuccess}
        />
      </Elements>
    </div>
  );
}