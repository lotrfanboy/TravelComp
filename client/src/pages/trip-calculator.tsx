import React, { useEffect, useState } from 'react';
import { useLocation, useParams, useRoute } from 'wouter';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { formatCurrency, formatDate } from '@/utils';
import { useTranslation } from 'react-i18next';
import { useToast } from '@/hooks/use-toast';
import { TripService, invalidateQuery } from '@/services/api.service';
import { Trip, SimulationResults, UpdateTripPayload } from '@/types/trip.types';

export default function TripCalculator() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [match, params] = useRoute<{ id: string }>('/trip-calculator/:id');
  const [_, navigate] = useLocation();
  
  const tripId = match ? parseInt(params.id) : null;
  const [selectedFlight, setSelectedFlight] = useState<string | null>(null);
  const [selectedHotel, setSelectedHotel] = useState<string | null>(null);
  
  // Mutação para atualizar a viagem com as seleções
  const { mutate: updateTripSelections, isPending: isUpdating } = useMutation({
    mutationFn: async (data: UpdateTripPayload) => {
      if (!tripId) throw new Error('ID da viagem não encontrado');
      return TripService.updateTrip(tripId, data);
    },
    onSuccess: () => {
      // Invalidar cache para atualizar os dados
      invalidateQuery([`/api/trips/${tripId}`]);
      toast({
        title: "Seleções confirmadas",
        description: "Suas seleções de voo e hotel foram confirmadas.",
        variant: "default"
      });
      // Redirecionar para detalhes da viagem
      navigate(`/trips/${tripId}`);
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao confirmar seleções",
        description: error.message || "Ocorreu um erro ao salvar suas seleções.",
        variant: "destructive"
      });
    }
  });
  
  // Buscar dados da viagem usando o serviço centralizado
  const { data: trip, isLoading: isLoadingTrip } = useQuery<Trip>({
    queryKey: [`/api/trips/${tripId}`],
    queryFn: async () => {
      if (!tripId) throw new Error('ID da viagem não encontrado');
      return TripService.getTrip(tripId);
    },
    enabled: !!tripId,
  });
  
  // Extrair os resultados da simulação
  const simulationResults: SimulationResults | null = trip?.simulationResult || null;
  
  if (isLoadingTrip) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-lg">Carregando detalhes da viagem...</span>
      </div>
    );
  }
  
  if (!trip) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <h2 className="text-xl font-semibold mb-2">Viagem não encontrada</h2>
        <p className="text-muted-foreground mb-4">
          Não foi possível encontrar os detalhes da viagem solicitada.
        </p>
        <Button onClick={() => navigate('/trips')}>Voltar para Minhas Viagens</Button>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">Calculadora de Viagem: {trip.name}</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Coluna da esquerda - Resumo da viagem */}
        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Resumo da Viagem</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Origem</h3>
                  <p className="text-base">{trip.origin || 'Brasil'}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Destino</h3>
                  <p className="text-base">{trip.destination}, {trip.country}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Data de Ida</h3>
                  <p className="text-base">{formatDate(trip.startDate)}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Data de Volta</h3>
                  <p className="text-base">{formatDate(trip.endDate)}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Viajantes</h3>
                  <p className="text-base">{trip.travelers || 1} pessoa(s)</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Orçamento</h3>
                  <p className="text-base">{formatCurrency(parseFloat(trip.budget), trip.currency)}</p>
                </div>
              </div>
              
              {/* Resultados da simulação - Estimativa Total */}
              {simulationResults && (
                <>
                  <Separator />
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-2">Estimativa Total</h3>
                    <div className="bg-primary/10 p-3 rounded-lg flex justify-between items-center">
                      <span className="font-medium">Custo Total Estimado</span>
                      <span className="text-lg font-bold">
                        {formatCurrency(simulationResults.totalEstimate, simulationResults.currency)}
                      </span>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
          
          {/* Opções de Voo */}
          {simulationResults?.flightOptions && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle>Opções de Voo</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {simulationResults.flightOptions.map((flight) => (
                  <div 
                    key={flight.id}
                    className={`border rounded-lg p-3 cursor-pointer transition-colors ${
                      selectedFlight === flight.id ? 'border-primary bg-primary/5' : 'hover:bg-accent'
                    }`}
                    onClick={() => setSelectedFlight(flight.id)}
                  >
                    <div className="flex justify-between mb-2">
                      <div className="font-medium">{flight.airline}</div>
                      <div>{flight.flightNumber}</div>
                    </div>
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="text-lg font-semibold">{flight.departureTime}</div>
                        <div className="text-sm text-muted-foreground">Partida</div>
                      </div>
                      <div className="flex flex-col items-center">
                        <div className="text-sm">{flight.duration}</div>
                        <div className="text-xs text-muted-foreground">
                          {flight.stops === 0 ? 'Direto' : `${flight.stops} parada(s)`}
                        </div>
                      </div>
                      <div>
                        <div className="text-lg font-semibold">{flight.arrivalTime}</div>
                        <div className="text-sm text-muted-foreground">Chegada</div>
                      </div>
                    </div>
                    <div className="flex justify-between items-center mt-2">
                      <Badge variant={selectedFlight === flight.id ? "default" : "outline"}>
                        {selectedFlight === flight.id ? 'Selecionado' : 'Selecionar'}
                      </Badge>
                      <div className="font-bold">
                        {formatCurrency(flight.price, flight.currency)}
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
          
          {/* Opções de Hospedagem */}
          {simulationResults?.hotelOptions && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle>Opções de Hospedagem</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {simulationResults.hotelOptions.map((hotel) => (
                  <div 
                    key={hotel.id}
                    className={`border rounded-lg p-3 cursor-pointer transition-colors ${
                      selectedHotel === hotel.id ? 'border-primary bg-primary/5' : 'hover:bg-accent'
                    }`}
                    onClick={() => setSelectedHotel(hotel.id)}
                  >
                    <div className="flex gap-3">
                      {hotel.imageUrl && (
                        <div className="flex-shrink-0 w-24 h-20 md:w-28 md:h-24 rounded-md overflow-hidden">
                          <img 
                            src={hotel.imageUrl} 
                            alt={hotel.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <div className="flex-grow">
                        <div className="font-medium">{hotel.name}</div>
                        <div className="text-sm mt-1">
                          {Array.from({ length: Math.round(hotel.rating) }).map((_, i) => (
                            <span key={i} className="text-yellow-500">★</span>
                          ))}
                          <span className="text-muted-foreground ml-1">({hotel.rating.toFixed(1)})</span>
                        </div>
                        <div className="text-sm mt-1 flex flex-wrap gap-1">
                          {hotel.amenities.slice(0, 3).map((amenity, i) => (
                            <span key={i} className="bg-accent px-2 py-0.5 rounded-full text-xs">
                              {amenity}
                            </span>
                          ))}
                          {hotel.amenities.length > 3 && (
                            <span className="bg-accent px-2 py-0.5 rounded-full text-xs">
                              +{hotel.amenities.length - 3}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col items-end justify-between">
                        <div className="font-bold">
                          {formatCurrency(hotel.pricePerNight, hotel.currency)}
                          <span className="text-xs font-normal">/noite</span>
                        </div>
                        <div className="text-sm font-semibold">
                          {formatCurrency(hotel.totalPrice, hotel.currency)}
                          <span className="text-xs font-normal"> total</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-between items-center mt-2">
                      <Badge variant={selectedHotel === hotel.id ? "default" : "outline"}>
                        {selectedHotel === hotel.id ? 'Selecionado' : 'Selecionar'}
                      </Badge>
                      <div className="text-xs text-muted-foreground">
                        {hotel.address}
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
        
        {/* Coluna da direita - Mapa */}
        <div className="bg-accent rounded-lg overflow-hidden" style={{ height: '600px' }}>
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <h3 className="text-lg font-medium mb-2">Mapa de {trip.destination}</h3>
              <p className="text-muted-foreground mb-4">
                O mapa interativo será exibido aqui, mostrando a localização do destino, hotéis e atrações.
              </p>
              <div className="inline-block border border-dashed rounded p-3">
                <p className="text-sm text-muted-foreground">
                  Em implementação - Mapa interativo
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Botões de ação */}
      <div className="flex justify-end gap-3 mt-6">
        <Button variant="outline" onClick={() => navigate('/trips')}>
          Voltar
        </Button>
        <Button 
          onClick={() => {
            // Validação das seleções
            if (!selectedFlight || !selectedHotel) {
              toast({
                title: "Selecione as opções",
                description: "Por favor, selecione um voo e um hotel para continuar.",
                variant: "destructive"
              });
              return;
            }
            
            // Atualizar a viagem com as seleções
            updateTripSelections({
              selectedFlightId: selectedFlight,
              selectedHotelId: selectedHotel
            });
          }}
          disabled={isUpdating}
        >
          {isUpdating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Salvando...
            </>
          ) : (
            'Confirmar Seleções'
          )}
        </Button>
      </div>
    </div>
  );
}