import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Card, 
  CardContent,
  CardDescription, 
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CreditCard, DollarSign, Users } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import PayPalButton from '@/components/PayPalButton';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { CheckoutForm } from '@/components/stripe/CheckoutForm';

// Carregando Stripe ao início
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY as string);

interface PaymentSectionProps {
  tripId: number;
  totalAmount: number;
  currency: string;
  onPaymentComplete: () => void;
  onCancel: () => void;
  isGroupTrip?: boolean;
}

export function PaymentSection({
  tripId,
  totalAmount,
  currency,
  onPaymentComplete,
  onCancel,
  isGroupTrip = false
}: PaymentSectionProps) {
  const { t } = useTranslation();
  const [paymentMethod, setPaymentMethod] = useState<'full' | 'split'>('full');
  const [participants, setParticipants] = useState<{ email: string; amount: number; paid: boolean }[]>([]);
  const [newParticipantEmail, setNewParticipantEmail] = useState('');
  const [clientSecret, setClientSecret] = useState('');

  // Solicitar clientSecret do Stripe ao montar o componente
  React.useEffect(() => {
    if (paymentMethod === 'full') {
      fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: totalAmount,
          currency: currency.toLowerCase(),
          tripId
        }),
      })
        .then((res) => res.json())
        .then((data) => setClientSecret(data.clientSecret));
    }
  }, [paymentMethod, totalAmount, currency, tripId]);

  // Adicionar participante para pagamento dividido
  const addParticipant = () => {
    if (!newParticipantEmail || participants.some(p => p.email === newParticipantEmail)) {
      return;
    }
    
    const participantAmount = totalAmount / (participants.length + 2); // +2 porque inclui o atual usuário e o novo participante
    
    // Recalcular os valores para todos
    const updatedParticipants = participants.map(p => ({
      ...p,
      amount: participantAmount
    }));
    
    // Adicionar novo participante
    setParticipants([
      ...updatedParticipants,
      { email: newParticipantEmail, amount: participantAmount, paid: false }
    ]);
    
    setNewParticipantEmail('');
  };

  // Remover um participante
  const removeParticipant = (email: string) => {
    const newParticipants = participants.filter(p => p.email !== email);
    
    // Recalcular valores se houver participantes restantes
    if (newParticipants.length > 0) {
      const participantAmount = totalAmount / (newParticipants.length + 1); // +1 para o usuário atual
      const updatedParticipants = newParticipants.map(p => ({
        ...p,
        amount: participantAmount
      }));
      setParticipants(updatedParticipants);
    } else {
      setParticipants([]);
    }
  };

  // Enviar convites para pagamento dividido
  const sendInvites = async () => {
    try {
      // Aqui enviaríamos os convites para os participantes através da API
      await fetch('/api/payment-invites', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tripId,
          participants,
          totalAmount,
          currency
        }),
      });
      
      alert(t('payment.invitesSent', 'Convites enviados com sucesso!'));
    } catch (error) {
      console.error('Falha ao enviar convites:', error);
      alert(t('payment.invitesError', 'Erro ao enviar convites. Tente novamente.'));
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{t('payment.paymentOptions', 'Opções de Pagamento')}</CardTitle>
        <CardDescription>
          {t('payment.selectPaymentMethod', 'Selecione como deseja realizar o pagamento para este roteiro')}
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <Tabs defaultValue="payment-method" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="payment-method">
              {t('payment.paymentMethod', 'Método de Pagamento')}
            </TabsTrigger>
            {isGroupTrip && (
              <TabsTrigger value="split-payment">
                {t('payment.splitPayment', 'Pagamento Dividido')}
              </TabsTrigger>
            )}
          </TabsList>
          
          <TabsContent value="payment-method" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div className="space-y-2">
                <div className="font-medium">{t('payment.paymentType', 'Tipo de Pagamento')}</div>
                <div className="flex flex-col gap-3">
                  <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id="payment-full"
                      checked={paymentMethod === 'full'}
                      onChange={() => setPaymentMethod('full')}
                    />
                    <label htmlFor="payment-full">
                      {t('payment.payFull', 'Pagar valor total')}
                    </label>
                  </div>
                  
                  {isGroupTrip && (
                    <div className="flex items-center space-x-2">
                      <input
                        type="radio"
                        id="payment-split"
                        checked={paymentMethod === 'split'}
                        onChange={() => setPaymentMethod('split')}
                      />
                      <label htmlFor="payment-split">
                        {t('payment.paySplit', 'Dividir pagamento com outros participantes')}
                      </label>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="border rounded-lg p-4 bg-gray-50">
                <div className="font-medium mb-2">
                  {t('payment.summary', 'Resumo do Pagamento')}
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>{t('payment.totalAmount', 'Valor Total')}:</span>
                    <span className="font-medium">
                      {new Intl.NumberFormat('pt-BR', { 
                        style: 'currency', 
                        currency 
                      }).format(totalAmount)}
                    </span>
                  </div>
                  
                  {paymentMethod === 'split' && participants.length > 0 && (
                    <>
                      <Separator />
                      <div className="flex justify-between">
                        <span>{t('payment.yourShare', 'Sua Parte')}:</span>
                        <span className="font-medium">
                          {new Intl.NumberFormat('pt-BR', { 
                            style: 'currency', 
                            currency 
                          }).format(totalAmount / (participants.length + 1))}
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
            
            <div className="space-y-4 mt-8">
              <div className="font-medium">
                {t('payment.choosePaymentMethod', 'Escolha o método de pagamento')}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* PayPal */}
                <div className="border rounded-lg p-6 hover:border-primary/50 cursor-pointer">
                  <div className="flex justify-between items-center mb-4">
                    <div className="font-medium">{t('payment.payWithPaypal', 'Pagar com PayPal')}</div>
                    <img src="https://cdn.worldvectorlogo.com/logos/paypal-2.svg" alt="PayPal" className="h-8" />
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">
                    {t('payment.paypalDesc', 'Pagamento seguro através da sua conta PayPal ou cartão de crédito.')}
                  </p>
                  
                  <PayPalButton 
                    amount={paymentMethod === 'split' && participants.length > 0 
                      ? (totalAmount / (participants.length + 1)).toString()
                      : totalAmount.toString()} 
                    currency={currency.toLowerCase()} 
                    intent="capture" 
                  />
                </div>
                
                {/* Stripe/Cartão */}
                <div className="border rounded-lg p-6 hover:border-primary/50">
                  <div className="flex justify-between items-center mb-4">
                    <div className="font-medium">{t('payment.payWithCard', 'Pagar com Cartão')}</div>
                    <CreditCard className="h-6 w-6" />
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">
                    {t('payment.cardDesc', 'Pagamento seguro com cartão de crédito ou débito através do Stripe.')}
                  </p>
                  
                  {clientSecret && (
                    <Elements stripe={stripePromise} options={{ clientSecret }}>
                      <CheckoutForm 
                        amount={paymentMethod === 'split' && participants.length > 0 
                          ? (totalAmount / (participants.length + 1))
                          : totalAmount} 
                        currency={currency} 
                        onSuccess={onPaymentComplete}
                      />
                    </Elements>
                  )}
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="split-payment" className="space-y-6">
            <div className="flex flex-col gap-4">
              <div className="font-medium">{t('payment.addParticipants', 'Adicionar Participantes')}</div>
              <div className="flex gap-2">
                <div className="flex-1">
                  <Input 
                    type="email" 
                    placeholder="email@exemplo.com" 
                    value={newParticipantEmail}
                    onChange={(e) => setNewParticipantEmail(e.target.value)}
                  />
                </div>
                <Button onClick={addParticipant}>{t('common.add', 'Adicionar')}</Button>
              </div>
              
              {participants.length > 0 && (
                <div className="mt-4">
                  <div className="font-medium mb-2">{t('payment.participants', 'Participantes')}</div>
                  <div className="border rounded-lg overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left">{t('payment.email', 'Email')}</th>
                          <th className="px-4 py-3 text-right">{t('payment.amount', 'Valor')}</th>
                          <th className="px-4 py-3 text-center">{t('payment.status', 'Status')}</th>
                          <th className="px-4 py-3 text-center">{t('common.actions', 'Ações')}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {/* Usuário atual (você) */}
                        <tr className="border-t">
                          <td className="px-4 py-3">{t('payment.you', 'Você')}</td>
                          <td className="px-4 py-3 text-right">
                            {new Intl.NumberFormat('pt-BR', { 
                              style: 'currency', 
                              currency 
                            }).format(totalAmount / (participants.length + 1))}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className="inline-block px-2 py-1 rounded-full bg-yellow-100 text-yellow-800 text-xs">
                              {t('payment.pending', 'Pendente')}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <Button variant="outline" size="sm">
                              {t('payment.pay', 'Pagar')}
                            </Button>
                          </td>
                        </tr>
                        
                        {/* Participantes convidados */}
                        {participants.map((participant, index) => (
                          <tr key={index} className="border-t">
                            <td className="px-4 py-3">{participant.email}</td>
                            <td className="px-4 py-3 text-right">
                              {new Intl.NumberFormat('pt-BR', { 
                                style: 'currency', 
                                currency 
                              }).format(participant.amount)}
                            </td>
                            <td className="px-4 py-3 text-center">
                              <span className="inline-block px-2 py-1 rounded-full bg-gray-100 text-gray-800 text-xs">
                                {t('payment.notInvited', 'Não convidado')}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-center">
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => removeParticipant(participant.email)}
                              >
                                {t('common.remove', 'Remover')}
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
              
              {participants.length > 0 && (
                <div className="flex justify-end mt-4">
                  <Button onClick={sendInvites}>
                    {t('payment.sendInvites', 'Enviar Convites de Pagamento')}
                  </Button>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={onCancel}>
          {t('common.cancel', 'Cancelar')}
        </Button>
        
        {paymentMethod === 'full' && (
          <div className="flex items-center gap-2">
            <Checkbox id="savePayment" />
            <Label htmlFor="savePayment">
              {t('payment.savePaymentMethod', 'Salvar método de pagamento')}
            </Label>
          </div>
        )}
      </CardFooter>
    </Card>
  );
}