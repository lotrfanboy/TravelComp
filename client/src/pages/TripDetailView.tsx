import React, { useState, useEffect } from 'react';
import { useParams, useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { 
  Card, 
  CardContent, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar, 
  Users, 
  ArrowRight, 
  MapPin, 
  Plane, 
  Building, 
  Edit2, 
  Clock, 
  Star, 
  DollarSign,
  Loader2,
  CheckCircle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getCountryImage } from '@/lib/countryImages';

// Tipos para as opções de voos, hotéis e pontos de interesse
interface FlightOption {
  id: string;
  airline: string;
  departureTime: string;
  arrivalTime: string;
  price: number;
  currency: string;
  duration?: string;
  stops?: number;
  flightNumber?: string;
  selected?: boolean;
}

interface HotelOption {
  id: string;
  name: string;
  rating: number;
  pricePerNight: number;
  totalPrice: number;
  currency: string;
  amenities: string[];
  address?: string;
  imageUrl?: string;
  selected?: boolean;
}

interface PointOfInterest {
  id: string;
  name: string;
  category: string;
  rating: number;
  price?: number;
  currency?: string;
  imageUrl: string;
  description?: string;
  coordinates: {
    lat: number;
    lng: number;
  };
}

interface TripDetailData {
  trip: {
    id: number;
    name: string;
    destination: string;
    country: string;
    startDate: string;
    endDate: string;
    travelers: number;
    budget: string;
    currency: string;
    tripType: string;
    isMultiDestination: boolean;
  };
  flightOptions: FlightOption[];
  hotelOptions: HotelOption[];
  pointsOfInterest: PointOfInterest[];
}

const TripDetailView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [_, navigate] = useLocation();
  const { toast } = useToast();
  
  // Estados
  const [selectedFlight, setSelectedFlight] = useState<string | null>(null);
  const [selectedHotel, setSelectedHotel] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [totalCost, setTotalCost] = useState<number>(0);
  const [tripData, setTripData] = useState<TripDetailData | null>(null);
  
  // Consultar dados da viagem
  const { data, isLoading, error } = useQuery<TripDetailData>({
    queryKey: [`/api/trips/${id}/detail`],
    enabled: !!id
  });
  
  // Efeito para atualizar dados quando a consulta retornar
  useEffect(() => {
    if (data) {
      setTripData(data);
      if (data.flightOptions.length > 0) {
        // Selecionar primeiro voo por padrão
        setSelectedFlight(data.flightOptions[0].id);
      }
      if (data.hotelOptions.length > 0) {
        // Selecionar primeiro hotel por padrão
        setSelectedHotel(data.hotelOptions[0].id);
      }
    }
  }, [data]);
  
  // Efeito para calcular custo total baseado nas seleções
  useEffect(() => {
    if (!tripData) return;
    
    let total = 0;
    
    // Adicionar custo do voo selecionado
    if (selectedFlight) {
      const flight = tripData.flightOptions.find(f => f.id === selectedFlight);
      if (flight) {
        total += flight.price;
      }
    }
    
    // Adicionar custo do hotel selecionado
    if (selectedHotel) {
      const hotel = tripData.hotelOptions.find(h => h.id === selectedHotel);
      if (hotel) {
        total += hotel.totalPrice;
      }
    }
    
    setTotalCost(total);
  }, [selectedFlight, selectedHotel, tripData]);
  
  // Função para confirmar e salvar a viagem
  const handleConfirmAndSave = async () => {
    if (!tripData) return;
    
    setLoading(true);
    try {
      // Montar payload com as opções selecionadas
      const payload = {
        tripId: tripData.trip.id,
        selectedFlightId: selectedFlight,
        selectedHotelId: selectedHotel
      };
      
      // Enviar para API
      const response = await fetch(`/api/trips/${tripData.trip.id}/confirm`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      
      if (!response.ok) {
        throw new Error('Falha ao confirmar viagem');
      }
      
      toast({
        title: 'Viagem confirmada',
        description: 'Suas opções foram salvas com sucesso!',
      });
      
      // Navegar para a página de detalhe da viagem
      navigate(`/trips/${tripData.trip.id}`);
    } catch (error) {
      console.error('Erro ao confirmar viagem:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível confirmar sua viagem. Tente novamente.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Componente para exibir uma opção de voo
  const FlightCard = ({ flight, selected, onSelect }: { 
    flight: FlightOption, 
    selected: boolean, 
    onSelect: () => void 
  }) => {
    // Formatação das horas
    const formatTime = (timeString: string) => {
      const date = new Date(timeString);
      return format(date, 'HH:mm');
    };
    
    // Calcular duração do voo (se não fornecida)
    const calculateDuration = () => {
      if (flight.duration) return flight.duration;
      
      try {
        const departure = new Date(flight.departureTime);
        const arrival = new Date(flight.arrivalTime);
        const diffInMinutes = Math.floor((arrival.getTime() - departure.getTime()) / (1000 * 60));
        const hours = Math.floor(diffInMinutes / 60);
        const minutes = diffInMinutes % 60;
        return `${hours}h${minutes > 0 ? ` ${minutes}min` : ''}`;
      } catch (e) {
        return 'N/A';
      }
    };
    
    // Obter código da companhia aérea (2 primeiras letras do número do voo)
    const airlineCode = flight.flightNumber?.substring(0, 2) || 'XX';
    
    return (
      <Card className={`mb-3 cursor-pointer transition-all ${selected ? 'ring-2 ring-primary' : 'hover:bg-slate-50'}`} onClick={onSelect}>
        <CardContent className="p-4">
          <div className="flex justify-between items-center mb-3">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center mr-3">
                {airlineCode}
              </div>
              <div>
                <p className="font-medium">{flight.airline}</p>
                <p className="text-xs text-gray-500">{flight.flightNumber}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-bold text-lg">
                {flight.currency} {flight.price.toLocaleString('pt-BR')}
              </p>
              <p className="text-xs text-gray-500">por pessoa</p>
            </div>
          </div>
          
          <div className="flex justify-between items-center">
            <div className="text-center">
              <p className="text-lg font-semibold">{formatTime(flight.departureTime)}</p>
              <p className="text-xs text-gray-500">Partida</p>
            </div>
            
            <div className="flex-1 mx-3 px-3 flex flex-col items-center">
              <div className="w-full h-0.5 bg-gray-300 relative">
                <div className="absolute -top-1.5 left-1/2 transform -translate-x-1/2 w-3 h-3 bg-gray-300 rounded-full"></div>
              </div>
              <p className="text-xs text-gray-500 mt-1">{calculateDuration()}</p>
              <p className="text-xs text-gray-500">
                {flight.stops === 0 ? 'Direto' : 
                flight.stops === 1 ? '1 parada' : 
                `${flight.stops} paradas`}
              </p>
            </div>
            
            <div className="text-center">
              <p className="text-lg font-semibold">{formatTime(flight.arrivalTime)}</p>
              <p className="text-xs text-gray-500">Chegada</p>
            </div>
          </div>
        </CardContent>
        <CardFooter className="pt-0 px-4 pb-4 justify-end">
          <Button 
            variant={selected ? "default" : "outline"} 
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onSelect();
            }}
          >
            {selected ? (
              <>
                <CheckCircle className="mr-1 h-4 w-4" />
                Selecionado
              </>
            ) : 'Selecionar'}
          </Button>
        </CardFooter>
      </Card>
    );
  };
  
  // Componente para exibir uma opção de hotel
  const HotelCard = ({ hotel, selected, onSelect }: { 
    hotel: HotelOption, 
    selected: boolean, 
    onSelect: () => void 
  }) => {
    return (
      <Card className={`mb-3 cursor-pointer transition-all ${selected ? 'ring-2 ring-primary' : 'hover:bg-slate-50'}`} onClick={onSelect}>
        <div className="flex">
          <div 
            className="w-20 h-full bg-cover bg-center" 
            style={{ 
              backgroundImage: `url(${hotel.imageUrl || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=300&q=80'})`,
              minHeight: '100px'
            }}
          />
          <div className="flex-1">
            <CardContent className="py-3 px-4">
              <div className="flex justify-between">
                <div>
                  <h4 className="font-medium text-md">{hotel.name}</h4>
                  <div className="flex items-center mt-1">
                    {/* Estrelas de acordo com a classificação */}
                    {Array.from({ length: Math.floor(hotel.rating) }).map((_, i) => (
                      <Star key={i} className="h-3 w-3 fill-amber-400 text-amber-400" />
                    ))}
                    {hotel.rating % 1 !== 0 && (
                      <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold">
                    {hotel.currency} {hotel.pricePerNight.toLocaleString('pt-BR')}
                  </p>
                  <p className="text-xs text-gray-500">por noite</p>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-1 mt-2">
                {hotel.amenities.slice(0, 3).map((amenity, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {amenity}
                  </Badge>
                ))}
                {hotel.amenities.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{hotel.amenities.length - 3}
                  </Badge>
                )}
              </div>
            </CardContent>
            <CardFooter className="pt-0 px-4 pb-3 justify-between">
              <p className="text-sm font-medium">
                Total: {hotel.currency} {hotel.totalPrice.toLocaleString('pt-BR')}
              </p>
              <Button 
                variant={selected ? "default" : "outline"} 
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onSelect();
                }}
              >
                {selected ? (
                  <>
                    <CheckCircle className="mr-1 h-4 w-4" />
                    Selecionado
                  </>
                ) : 'Selecionar'}
              </Button>
            </CardFooter>
          </div>
        </div>
      </Card>
    );
  };
  
  // Renderização do componente de mapa
  const renderMap = () => {
    if (!tripData || !tripData.pointsOfInterest.length) {
      return (
        <div className="h-96 bg-gray-100 rounded-lg flex items-center justify-center">
          <p className="text-gray-500">Mapa não disponível</p>
        </div>
      );
    }
    
    return (
      <div className="h-96 bg-gray-100 rounded-lg relative">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <p className="text-lg font-semibold mb-2">Mapa de Pontos de Interesse</p>
            <p className="text-sm text-gray-500">
              Implementação do mapa com {tripData.pointsOfInterest.length} pontos de interesse para {tripData.trip.destination}.
            </p>
            <p className="text-xs text-gray-400 mt-2">
              (Esta visualização será aprimorada com integração com Google Maps ou Leaflet)
            </p>
          </div>
        </div>
      </div>
    );
  };
  
  // Renderização da lista de pontos de interesse
  const renderPointsOfInterest = () => {
    if (!tripData || !tripData.pointsOfInterest.length) {
      return (
        <p className="text-gray-500 text-center py-4">
          Não há pontos de interesse disponíveis para este destino.
        </p>
      );
    }
    
    return (
      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {tripData.pointsOfInterest.map((poi) => (
          <Card key={poi.id} className="overflow-hidden">
            <div 
              className="h-24 bg-cover bg-center" 
              style={{ backgroundImage: `url(${poi.imageUrl})` }}
            />
            <CardContent className="p-3">
              <h4 className="font-medium">{poi.name}</h4>
              <p className="text-xs text-gray-500">{poi.category}</p>
              <div className="flex items-center mt-1">
                {Array.from({ length: Math.floor(poi.rating) }).map((_, i) => (
                  <Star key={i} className="h-3 w-3 fill-amber-400 text-amber-400" />
                ))}
                <span className="text-xs ml-1">({poi.rating})</span>
              </div>
              {poi.price && (
                <p className="text-xs mt-1">
                  {poi.currency || 'R$'} {poi.price.toLocaleString('pt-BR')}
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };
  
  // Mostrar mensagem de carregamento
  if (isLoading || !tripData) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="flex flex-col items-center justify-center h-64">
          <Loader2 className="h-10 w-10 text-primary animate-spin mb-4" />
          <p className="text-lg">Carregando detalhes da viagem...</p>
        </div>
      </div>
    );
  }
  
  // Mostrar mensagem de erro
  if (error) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="flex flex-col items-center justify-center h-64">
          <p className="text-lg text-red-500 mb-4">Erro ao carregar os detalhes da viagem.</p>
          <Button onClick={() => navigate('/trips')}>Voltar para Minhas Viagens</Button>
        </div>
      </div>
    );
  }
  
  // Obter imagem do destino
  const destinationImage = getCountryImage(tripData.trip.country);
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, 'dd/MM', { locale: ptBR });
  };
  
  // Calcular duração da viagem em dias
  const calculateTripDuration = () => {
    const start = new Date(tripData.trip.startDate);
    const end = new Date(tripData.trip.endDate);
    return Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  };
  
  return (
    <div className="container mx-auto py-6 px-4">
      {/* Cabeçalho */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">{tripData.trip.name}</h1>
          <p className="text-gray-500 mt-1">
            {tripData.trip.destination}, {tripData.trip.country} • {calculateTripDuration()} dias
          </p>
        </div>
        <Button 
          variant="outline" 
          className="mt-3 md:mt-0" 
          onClick={() => navigate(`/trips/${tripData.trip.id}/edit`)}
        >
          <Edit2 className="h-4 w-4 mr-2" />
          Editar Viagem
        </Button>
      </div>
      
      {/* Conteúdo Principal - Layout de duas colunas */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Coluna da Esquerda: Resumo Interativo */}
        <div className="lg:col-span-5">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center">
                <Calendar className="h-5 w-5 mr-2 text-gray-500" />
                Resumo da Viagem
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Detalhes Básicos */}
              <div className="flex flex-col">
                <div className="flex items-center mb-2">
                  <Users className="h-4 w-4 mr-2 text-gray-500" />
                  <span className="text-sm">{tripData.trip.travelers} viajante(s)</span>
                </div>
                
                <div className="flex items-start">
                  <div className="pt-1">
                    <MapPin className="h-4 w-4 mr-2 text-gray-500" />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium">
                      {/* Origem → Destino (se origem disponível) */}
                      {tripData.trip.destination}
                    </div>
                    <div className="text-xs text-gray-500">
                      {formatDate(tripData.trip.startDate)} – {formatDate(tripData.trip.endDate)}
                    </div>
                  </div>
                </div>
              </div>
              
              <Separator />
              
              {/* Opções de Voo */}
              <div>
                <h3 className="text-md font-semibold mb-3 flex items-center">
                  <Plane className="h-4 w-4 mr-2" />
                  Opções de Voo
                </h3>
                
                {tripData.flightOptions.length > 0 ? (
                  <div className="space-y-2">
                    {tripData.flightOptions.map((flight) => (
                      <FlightCard
                        key={flight.id}
                        flight={flight}
                        selected={selectedFlight === flight.id}
                        onSelect={() => setSelectedFlight(flight.id)}
                      />
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm py-2">
                    Não há opções de voo disponíveis para este destino.
                  </p>
                )}
              </div>
              
              <Separator />
              
              {/* Opções de Hospedagem */}
              <div>
                <h3 className="text-md font-semibold mb-3 flex items-center">
                  <Building className="h-4 w-4 mr-2" />
                  Opções de Hospedagem
                </h3>
                
                {tripData.hotelOptions.length > 0 ? (
                  <div className="space-y-2">
                    {tripData.hotelOptions.map((hotel) => (
                      <HotelCard
                        key={hotel.id}
                        hotel={hotel}
                        selected={selectedHotel === hotel.id}
                        onSelect={() => setSelectedHotel(hotel.id)}
                      />
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm py-2">
                    Não há opções de hospedagem disponíveis para este destino.
                  </p>
                )}
              </div>
              
              <Separator />
              
              {/* Total e Ações */}
              <div>
                <div className="flex justify-between mb-4">
                  <span className="font-medium">Custo Total Estimado:</span>
                  <span className="font-bold text-lg">
                    {tripData.trip.currency} {totalCost.toLocaleString('pt-BR')}
                  </span>
                </div>
                
                <Button 
                  className="w-full bg-[#19B4B0] hover:bg-[#0ea19d]" 
                  disabled={loading || !selectedFlight || !selectedHotel}
                  onClick={handleConfirmAndSave}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processando...
                    </>
                  ) : (
                    'Confirmar e Salvar'
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Coluna da Direita: Mapa e Pontos de Interesse */}
        <div className="lg:col-span-7">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center">
                <MapPin className="h-5 w-5 mr-2 text-gray-500" />
                Pontos de Interesse em {tripData.trip.destination}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Mapa */}
              {renderMap()}
              
              {/* Lista de Pontos de Interesse */}
              <div className="mt-4">
                <h3 className="text-md font-semibold mb-3">Atrações Sugeridas</h3>
                {renderPointsOfInterest()}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default TripDetailView;