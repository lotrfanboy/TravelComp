import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useStripe, useElements, PaymentElement } from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';

interface CheckoutFormProps {
  amount: number;
  currency: string;
  onSuccess?: () => void;
}

export function CheckoutForm({ amount, currency, onSuccess }: CheckoutFormProps) {
  const { t } = useTranslation();
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!stripe || !elements) {
      // O Stripe.js ainda não foi carregado
      return;
    }
    
    setIsProcessing(true);
    setErrorMessage(null);
    
    try {
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: window.location.origin + '/payment-success',
          receipt_email: localStorage.getItem('userEmail') || undefined,
        },
        redirect: 'if_required'
      });
      
      if (error) {
        // Exibir erro para o usuário
        setErrorMessage(error.message || t('payment.genericError', 'Ocorreu um erro no processamento do pagamento'));
        toast({
          title: t('payment.paymentFailed', 'Falha no pagamento'),
          description: error.message,
          variant: 'destructive',
        });
      } else {
        // Pagamento bem-sucedido
        toast({
          title: t('payment.paymentSuccessful', 'Pagamento realizado com sucesso'),
          description: t('payment.paymentConfirmed', 'Seu pagamento foi confirmado.'),
        });
        
        if (onSuccess) {
          onSuccess();
        }
      }
    } catch (err: any) {
      setErrorMessage(err.message || t('payment.genericError', 'Ocorreu um erro no processamento do pagamento'));
    } finally {
      setIsProcessing(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {errorMessage && (
        <Alert variant="destructive">
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      )}
      
      <PaymentElement />
      
      <div className="space-y-2">
        <p className="text-sm text-muted-foreground">
          {t('payment.totalPayment', 'Valor total')}:
          <span className="font-semibold pl-1">
            {new Intl.NumberFormat('pt-BR', { 
              style: 'currency', 
              currency: currency.toUpperCase() 
            }).format(amount)}
          </span>
        </p>
        
        <Button 
          type="submit"
          disabled={!stripe || isProcessing}
          className="w-full"
        >
          {isProcessing 
            ? t('payment.processing', 'Processando...') 
            : t('payment.payNow', 'Pagar Agora')}
        </Button>
      </div>
    </form>
  );
}