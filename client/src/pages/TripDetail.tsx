import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocation, useParams, useRoute } from 'wouter';
import { Trip } from '@shared/schema';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { formatCurrency, formatDateRange } from '@/lib/utils';
import { ArrowLeft, CalendarIcon, MapPin, Edit, Trash2, Share2, Plane, Hotel, Globe } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { TripPriceSummary } from '@/components/trips/TripPriceSummary';

export default function TripDetail() {
  const { id } = useParams<{ id: string }>();
  const [_, navigate] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();

  // Buscar detalhes da viagem
  const { data: trip, isLoading, error } = useQuery<Trip>({
    queryKey: [`/api/trips/${id}`],
    queryFn: async () => {
      const response = await fetch(`/api/trips/${id}`);
      if (!response.ok) {
        throw new Error('Falha ao carregar detalhes da viagem');
      }
      return response.json();
    }
  });

  // Função para lidar com o botão de edição
  const handleEdit = () => {
    navigate(`/trips/${id}/edit`);
  };

  // Função para voltar à lista de viagens
  const handleBack = () => {
    navigate('/trips');
  };

  // Estilo de fundo baseado no tipo de viagem
  const getBgStyle = (tripType: string) => {
    switch (tripType) {
      case 'tourist':
        return 'bg-gradient-to-r from-yellow-500/90 to-amber-600/90';
      case 'nomad':
        return 'bg-gradient-to-r from-emerald-500/90 to-teal-600/90';
      case 'business':
        return 'bg-gradient-to-r from-indigo-500/90 to-blue-600/90';
      default:
        return 'bg-gradient-to-r from-blue-500/90 to-purple-600/90';
    }
  };

  // Função para obter imagem do destino
  const getDestinationImage = (destination: string) => {
    // Poderíamos integrar com uma API de imagens real
    if (destination.toLowerCase().includes('bali')) {
      return 'https://images.unsplash.com/photo-1604999333679-b86d54738315?auto=format&fit=crop&w=2000&h=600&q=80';
    } else if (destination.toLowerCase().includes('lisbon') || destination.toLowerCase().includes('portugal')) {
      return 'https://images.unsplash.com/photo-1558102822-da570eb113ed?auto=format&fit=crop&w=2000&h=600&q=80';
    } else if (destination.toLowerCase().includes('york') || destination.toLowerCase().includes('new york')) {
      return 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&w=2000&h=600&q=80';
    } else if (destination.toLowerCase().includes('angeles') || destination.toLowerCase().includes('los angeles')) {
      return 'https://images.unsplash.com/photo-1534190760961-74e8c1c5c3da?auto=format&fit=crop&w=2000&h=600&q=80';
    } else {
      return 'https://images.unsplash.com/photo-1596292378525-d1bd4707d406?auto=format&fit=crop&w=2000&h=600&q=80';
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={handleBack}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <Skeleton className="h-8 w-48" />
        </div>
        <Card>
          <Skeleton className="h-56 w-full" />
          <CardContent className="pt-6">
            <Skeleton className="h-8 w-full mb-4" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !trip) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold">Viagem não encontrada</h2>
          <p className="text-gray-500">Não foi possível encontrar os detalhes desta viagem.</p>
          <Button onClick={handleBack}>Voltar para minhas viagens</Button>
        </div>
      </div>
    );
  }

  // Verifica se o usuário é o proprietário da viagem
  const isOwner = user?.id === trip.userId;

  return (
    <div className="space-y-6">
      {/* Botão voltar e título */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={handleBack} className="h-8 w-8">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">{trip.name || `Viagem para ${trip.destination}`}</h1>
        </div>
        {isOwner && (
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleEdit}>
              <Edit className="h-4 w-4 mr-2" />
              Editar
            </Button>
          </div>
        )}
      </div>

      {/* Banner da viagem */}
      <div className="relative h-48 md:h-64 lg:h-80 rounded-xl overflow-hidden mb-6">
        <div 
          className="absolute inset-0 bg-cover bg-center" 
          style={{ backgroundImage: `url('${getDestinationImage(trip.destination)}')` }}
        />
        <div className={`absolute inset-0 ${getBgStyle(trip.tripType || 'tourist')} bg-opacity-50`}></div>
        <div className="absolute inset-0 p-6 md:p-8 flex flex-col justify-end text-white">
          <div className="flex items-start md:items-center flex-col md:flex-row md:justify-between">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold mb-2">{trip.destination}, {trip.country}</h2>
              <div className="flex items-center">
                <CalendarIcon className="h-4 w-4 mr-2" />
                <span>{formatDateRange(trip.startDate, trip.endDate)}</span>
              </div>
            </div>
            <div className="mt-4 md:mt-0">
              <span className="inline-block px-3 py-1 bg-white/20 rounded-full text-sm">
                {trip.tripType === 'tourist' ? 'Turismo' : 
                 trip.tripType === 'nomad' ? 'Nômade Digital' : 
                 trip.tripType === 'business' ? 'Negócios' : 'Viagem'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Detalhes da viagem */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Informações básicas */}
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Informações Básicas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start">
              <MapPin className="h-5 w-5 mr-3 text-gray-500 mt-0.5" />
              <div>
                <p className="font-medium">Destino</p>
                <p className="text-gray-600">{trip.destination}, {trip.country}</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <CalendarIcon className="h-5 w-5 mr-3 text-gray-500 mt-0.5" />
              <div>
                <p className="font-medium">Datas</p>
                <p className="text-gray-600">{formatDateRange(trip.startDate, trip.endDate)}</p>
              </div>
            </div>
            
            {trip.budget && (
              <div className="flex items-start">
                <div className="h-5 w-5 mr-3 text-gray-500 mt-0.5 flex items-center justify-center">
                  <span className="font-medium">$</span>
                </div>
                <div>
                  <p className="font-medium">Orçamento</p>
                  <p className="text-gray-600">{formatCurrency(Number(trip.budget), trip.currency || 'BRL')}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Resumo de custos */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Resumo de Custos</CardTitle>
            <CardDescription>Estimativa de gastos para sua viagem</CardDescription>
          </CardHeader>
          <CardContent>
            {trip.budget ? (
              <TripPriceSummary 
                destination={trip.destination}
                country={trip.country}
                startDate={trip.startDate}
                endDate={trip.endDate}
                budget={Number(trip.budget)}
                currency={trip.currency || 'BRL'}
              />
            ) : (
              <div className="text-center py-6">
                <p className="text-gray-500">Sem informações de orçamento disponíveis</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Ações */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Ações</CardTitle>
          <CardDescription>O que você gostaria de fazer com esta viagem?</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button 
              variant="outline" 
              className="h-auto py-4 flex flex-col items-center justify-center gap-2"
              onClick={handleEdit}
            >
              <Edit className="h-6 w-6" />
              <span>Editar Viagem</span>
            </Button>
            
            <Button 
              variant="outline" 
              className="h-auto py-4 flex flex-col items-center justify-center gap-2"
              onClick={() => navigate('/booking?tripId=' + id)}
            >
              <Hotel className="h-6 w-6" />
              <span>Reservar Hospedagem</span>
            </Button>
            
            <Button 
              variant="outline" 
              className="h-auto py-4 flex flex-col items-center justify-center gap-2"
              onClick={() => navigate('/booking?tripId=' + id + '&type=flight')}
            >
              <Plane className="h-6 w-6" />
              <span>Reservar Voo</span>
            </Button>
            
            <Button 
              variant="outline" 
              className="h-auto py-4 flex flex-col items-center justify-center gap-2"
              onClick={() => navigate('/planner?tripId=' + id)}
            >
              <Globe className="h-6 w-6" />
              <span>Planejar Itinerário</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}