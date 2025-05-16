import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useRoute } from 'wouter';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';
import { 
  CalendarIcon, 
  Bed, 
  Plane, 
  CreditCard, 
  ChevronLeft, 
  Search, 
  Star, 
  Wifi, 
  Coffee, 
  Utensils, 
  ParkingSquare, 
  Waves,
  Clock, 
  Globe, 
  MapPin
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { PaymentSection } from '@/components/trips/PaymentSection';

// Tipos de dados
interface AccommodationResponse {
  id: number;
  name: string;
  address: string;
  city: string;
  country: string;
  type: string;
  pricePerNight: number;
  currency: string;
  amenities: string[];
  rating: number;
  imageUrl: string;
  website: string;
  availability: boolean;
}

interface FlightResponse {
  id: string;
  airline: string;
  flightNumber: string;
  departureAirport: string;
  departureCity: string;
  departureCountry: string;
  arrivalAirport: string;
  arrivalCity: string;
  arrivalCountry: string;
  departureTime: string;
  arrivalTime: string;
  price: number;
  currency: string;
  duration: number; // em minutos
  stops: number;
  availability: boolean;
}

interface SearchParams {
  tripId: number;
  destinationId: number;
  city: string;
  country: string;
  checkIn: string;
  checkOut: string;
  adults: number;
  children: number;
  rooms: number;
  price?: {
    min?: number;
    max?: number;
  };
  amenities?: string[];
  transportType: string;
}

export default function TripBooking() {
  const [, params] = useRoute('/trip-booking/:tripId/:destinationId');
  const tripId = params?.tripId ? parseInt(params.tripId) : 0;
  const destinationId = params?.destinationId ? parseInt(params.destinationId) : 0;
  
  const { t } = useTranslation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Estados
  const [activeTab, setActiveTab] = useState<'accommodation' | 'flight'>('accommodation');
  const [searchParams, setSearchParams] = useState<SearchParams>({
    tripId: tripId,
    destinationId: destinationId,
    city: '',
    country: '',
    checkIn: '',
    checkOut: '',
    adults: 1,
    children: 0,
    rooms: 1,
    transportType: 'plane'
  });
  const [selectedAccommodation, setSelectedAccommodation] = useState<AccommodationResponse | null>(null);
  const [selectedFlight, setSelectedFlight] = useState<FlightResponse | null>(null);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [filterAmenities, setFilterAmenities] = useState<{[key: string]: boolean}>({
    wifi: false,
    breakfast: false,
    parking: false,
    pool: false,
    restaurant: false,
  });
  const [priceRange, setPriceRange] = useState<{min: number, max: number}>({
    min: 0,
    max: 5000
  });
  
  // Queries
  const { data: tripData, isLoading: isTripLoading } = useQuery({
    queryKey: [`/api/trips/${tripId}`],
    enabled: !!tripId,
  });
  
  const { data: destination, isLoading: isDestinationLoading } = useQuery({
    queryKey: [`/api/destinations/${destinationId}`],
    enabled: !!destinationId,
  });
  
  // Pré-carregar dados do destino nas opções de busca
  useEffect(() => {
    if (destination) {
      setSearchParams(prev => ({
        ...prev,
        city: destination.city,
        country: destination.country,
        checkIn: destination.arrivalDate,
        checkOut: destination.departureDate,
        transportType: destination.transportTypeToNext || 'plane'
      }));
    }
  }, [destination]);
  
  // Query para buscar acomodações
  const { 
    data: accommodations, 
    isLoading: isAccommodationsLoading, 
    refetch: refetchAccommodations 
  } = useQuery({
    queryKey: ['/api/accommodations/search', searchParams.city, searchParams.country, searchParams.checkIn, searchParams.checkOut],
    enabled: false,
  });
  
  // Query para buscar voos
  const { 
    data: flights, 
    isLoading: isFlightsLoading, 
    refetch: refetchFlights 
  } = useQuery({
    queryKey: ['/api/flights/search', searchParams.city, searchParams.country, searchParams.checkIn, searchParams.transportType],
    enabled: false,
  });
  
  // Mutação para adicionar acomodação à viagem
  const addAccommodationMutation = useMutation({
    mutationFn: async (data: { 
      tripId: number, 
      destinationId: number, 
      accommodationId: number, 
      checkIn: string, 
      checkOut: string 
    }) => {
      const response = await fetch('/api/trip-accommodations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error('Falha ao adicionar acomodação');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/trips/${tripId}`] });
      queryClient.invalidateQueries({ queryKey: [`/api/destinations/${destinationId}`] });
      
      toast({
        title: t('booking.accommodationAdded', 'Acomodação adicionada'),
        description: t('booking.accommodationAddedDesc', 'A acomodação foi adicionada ao seu roteiro com sucesso.'),
      });
      
      // Abrir modal de pagamento
      setIsPaymentOpen(true);
    },
    onError: () => {
      toast({
        title: t('booking.error', 'Erro'),
        description: t('booking.errorAddingAccommodation', 'Ocorreu um erro ao adicionar a acomodação. Tente novamente.'),
        variant: 'destructive',
      });
    },
  });
  
  // Mutação para adicionar voo à viagem
  const addFlightMutation = useMutation({
    mutationFn: async (data: { 
      tripId: number, 
      destinationId: number, 
      flightId: string,
      departureTime: string,
      arrivalTime: string,
      price: number,
      currency: string,
    }) => {
      const response = await fetch('/api/trip-flights', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error('Falha ao adicionar voo');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/trips/${tripId}`] });
      queryClient.invalidateQueries({ queryKey: [`/api/destinations/${destinationId}`] });
      
      toast({
        title: t('booking.flightAdded', 'Voo adicionado'),
        description: t('booking.flightAddedDesc', 'O voo foi adicionado ao seu roteiro com sucesso.'),
      });
      
      // Abrir modal de pagamento
      setIsPaymentOpen(true);
    },
    onError: () => {
      toast({
        title: t('booking.error', 'Erro'),
        description: t('booking.errorAddingFlight', 'Ocorreu um erro ao adicionar o voo. Tente novamente.'),
        variant: 'destructive',
      });
    },
  });
  
  // Funções de pesquisa
  const handleSearchAccommodations = () => {
    // Preparar parâmetros com filtros
    const searchParamsWithFilters = {
      ...searchParams,
      amenities: Object.entries(filterAmenities)
        .filter(([_, isSelected]) => isSelected)
        .map(([amenity]) => amenity),
      price: {
        min: priceRange.min,
        max: priceRange.max
      }
    };
    
    // Atualizar search params com filtros
    setSearchParams(searchParamsWithFilters);
    
    // Limpar seleção anterior
    setSelectedAccommodation(null);
    
    // Executar busca
    refetchAccommodations();
  };
  
  const handleSearchFlights = () => {
    // Limpar seleção anterior
    setSelectedFlight(null);
    
    // Executar busca
    refetchFlights();
  };
  
  // Manipuladores de seleção
  const handleSelectAccommodation = (accommodation: AccommodationResponse) => {
    setSelectedAccommodation(accommodation);
  };
  
  const handleSelectFlight = (flight: FlightResponse) => {
    setSelectedFlight(flight);
  };
  
  // Manipulador de reserva
  const handleBookAccommodation = () => {
    if (!selectedAccommodation) return;
    
    addAccommodationMutation.mutate({
      tripId,
      destinationId,
      accommodationId: selectedAccommodation.id,
      checkIn: searchParams.checkIn,
      checkOut: searchParams.checkOut,
    });
  };
  
  const handleBookFlight = () => {
    if (!selectedFlight) return;
    
    addFlightMutation.mutate({
      tripId,
      destinationId,
      flightId: selectedFlight.id,
      departureTime: selectedFlight.departureTime,
      arrivalTime: selectedFlight.arrivalTime,
      price: selectedFlight.price,
      currency: selectedFlight.currency,
    });
  };
  
  // Manipulador de filtros de amenidades
  const handleAmenityFilterChange = (amenity: string, checked: boolean) => {
    setFilterAmenities(prev => ({
      ...prev,
      [amenity]: checked
    }));
  };
  
  // Verificar se há dados carregando
  if (isTripLoading || isDestinationLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }
  
  // Se não conseguir encontrar a viagem ou o destino
  if (!tripData || !destination) {
    return (
      <div className="container mx-auto py-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold">{t('common.notFound', 'Não Encontrado')}</h1>
          <p className="mt-2">
            {t('booking.tripOrDestinationNotFound', 'A viagem ou o destino não foram encontrados.')}
          </p>
          <Button className="mt-4" onClick={() => window.history.back()}>
            {t('common.goBack', 'Voltar')}
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <Button 
            variant="ghost" 
            className="mb-2" 
            onClick={() => window.history.back()}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            {t('common.back', 'Voltar')}
          </Button>
          <h1 className="text-3xl font-bold">{t('booking.addBookings', 'Adicionar Reservas')}</h1>
          <p className="text-muted-foreground">
            {t('booking.addBookingsTo', 'Adicionar reservas ao destino:')} {destination.name}, {destination.city}, {destination.country}
          </p>
        </div>
      </div>
      
      <Tabs 
        defaultValue="accommodation" 
        value={activeTab} 
        onValueChange={(value) => setActiveTab(value as 'accommodation' | 'flight')}
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="accommodation" className="flex items-center gap-2">
            <Bed className="h-4 w-4" />
            {t('booking.accommodation', 'Acomodação')}
          </TabsTrigger>
          <TabsTrigger value="flight" className="flex items-center gap-2">
            <Plane className="h-4 w-4" />
            {t('booking.transport', 'Transporte')}
          </TabsTrigger>
        </TabsList>
        
        {/* Conteúdo da aba de acomodações */}
        <TabsContent value="accommodation" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t('booking.searchAccommodation', 'Buscar Acomodação')}</CardTitle>
              <CardDescription>
                {t('booking.searchAccommodationDesc', 'Encontre a acomodação ideal para a sua estadia')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="destination">{t('booking.destination', 'Destino')}</Label>
                  <div className="flex mt-1">
                    <Input 
                      id="city"
                      value={searchParams.city}
                      onChange={(e) => setSearchParams({...searchParams, city: e.target.value})}
                      placeholder={t('booking.city', 'Cidade')}
                      className="rounded-r-none"
                    />
                    <Input 
                      id="country"
                      value={searchParams.country}
                      onChange={(e) => setSearchParams({...searchParams, country: e.target.value})}
                      placeholder={t('booking.country', 'País')}
                      className="rounded-l-none border-l-0"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label htmlFor="checkIn">{t('booking.checkIn', 'Check-in')}</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start text-left font-normal mt-1"
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {searchParams.checkIn ? (
                            format(new Date(searchParams.checkIn), 'PP', { locale: pt })
                          ) : (
                            <span>{t('booking.selectDate', 'Selecionar data')}</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={searchParams.checkIn ? new Date(searchParams.checkIn) : undefined}
                          onSelect={(date) => 
                            setSearchParams({
                              ...searchParams, 
                              checkIn: date ? date.toISOString() : ''
                            })
                          }
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  
                  <div>
                    <Label htmlFor="checkOut">{t('booking.checkOut', 'Check-out')}</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start text-left font-normal mt-1"
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {searchParams.checkOut ? (
                            format(new Date(searchParams.checkOut), 'PP', { locale: pt })
                          ) : (
                            <span>{t('booking.selectDate', 'Selecionar data')}</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={searchParams.checkOut ? new Date(searchParams.checkOut) : undefined}
                          onSelect={(date) => 
                            setSearchParams({
                              ...searchParams, 
                              checkOut: date ? date.toISOString() : ''
                            })
                          }
                          disabled={(date) => 
                            searchParams.checkIn 
                              ? date < new Date(searchParams.checkIn) 
                              : false
                          }
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <Label htmlFor="adults">{t('booking.adults', 'Adultos')}</Label>
                    <Input 
                      id="adults"
                      type="number"
                      min={1}
                      value={searchParams.adults}
                      onChange={(e) => setSearchParams({...searchParams, adults: parseInt(e.target.value) || 1})}
                      className="mt-1"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="children">{t('booking.children', 'Crianças')}</Label>
                    <Input 
                      id="children"
                      type="number"
                      min={0}
                      value={searchParams.children}
                      onChange={(e) => setSearchParams({...searchParams, children: parseInt(e.target.value) || 0})}
                      className="mt-1"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="rooms">{t('booking.rooms', 'Quartos')}</Label>
                    <Input 
                      id="rooms"
                      type="number"
                      min={1}
                      value={searchParams.rooms}
                      onChange={(e) => setSearchParams({...searchParams, rooms: parseInt(e.target.value) || 1})}
                      className="mt-1"
                    />
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col md:flex-row gap-4 mt-4">
                <div className="w-full md:w-1/3 space-y-4 bg-gray-50 p-4 rounded-lg">
                  <div>
                    <h3 className="font-medium mb-2">{t('booking.priceRange', 'Faixa de Preço')}</h3>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label htmlFor="minPrice">{t('booking.minPrice', 'Mínimo')}</Label>
                        <Input 
                          id="minPrice"
                          type="number"
                          min={0}
                          value={priceRange.min}
                          onChange={(e) => setPriceRange({...priceRange, min: parseInt(e.target.value) || 0})}
                          className="mt-1"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="maxPrice">{t('booking.maxPrice', 'Máximo')}</Label>
                        <Input 
                          id="maxPrice"
                          type="number"
                          min={0}
                          value={priceRange.max}
                          onChange={(e) => setPriceRange({...priceRange, max: parseInt(e.target.value) || 0})}
                          className="mt-1"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <h3 className="font-medium mb-2">{t('booking.amenities', 'Comodidades')}</h3>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="wifi" 
                          checked={filterAmenities.wifi}
                          onCheckedChange={(checked) => 
                            handleAmenityFilterChange('wifi', checked === true)
                          }
                        />
                        <Label htmlFor="wifi" className="flex items-center">
                          <Wifi className="h-4 w-4 mr-2" />
                          {t('booking.wifi', 'Wi-Fi')}
                        </Label>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="breakfast" 
                          checked={filterAmenities.breakfast}
                          onCheckedChange={(checked) => 
                            handleAmenityFilterChange('breakfast', checked === true)
                          }
                        />
                        <Label htmlFor="breakfast" className="flex items-center">
                          <Coffee className="h-4 w-4 mr-2" />
                          {t('booking.breakfast', 'Café da manhã')}
                        </Label>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="parking" 
                          checked={filterAmenities.parking}
                          onCheckedChange={(checked) => 
                            handleAmenityFilterChange('parking', checked === true)
                          }
                        />
                        <Label htmlFor="parking" className="flex items-center">
                          <ParkingSquare className="h-4 w-4 mr-2" />
                          {t('booking.parking', 'Estacionamento')}
                        </Label>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="pool" 
                          checked={filterAmenities.pool}
                          onCheckedChange={(checked) => 
                            handleAmenityFilterChange('pool', checked === true)
                          }
                        />
                        <Label htmlFor="pool" className="flex items-center">
                          <Waves className="h-4 w-4 mr-2" />
                          {t('booking.pool', 'Piscina')}
                        </Label>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="restaurant" 
                          checked={filterAmenities.restaurant}
                          onCheckedChange={(checked) => 
                            handleAmenityFilterChange('restaurant', checked === true)
                          }
                        />
                        <Label htmlFor="restaurant" className="flex items-center">
                          <Utensils className="h-4 w-4 mr-2" />
                          {t('booking.restaurant', 'Restaurante')}
                        </Label>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="w-full md:w-2/3">
                  <Button 
                    onClick={handleSearchAccommodations} 
                    className="w-full mb-4"
                    disabled={!searchParams.city || !searchParams.country || !searchParams.checkIn || !searchParams.checkOut}
                  >
                    <Search className="h-4 w-4 mr-2" />
                    {t('booking.search', 'Buscar')}
                  </Button>
                  
                  {isAccommodationsLoading ? (
                    <div className="flex justify-center p-8">
                      <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
                    </div>
                  ) : accommodations ? (
                    <div className="space-y-4">
                      {accommodations.length === 0 ? (
                        <div className="text-center p-8 bg-gray-50 rounded-lg">
                          <p>{t('booking.noAccommodationsFound', 'Nenhuma acomodação encontrada para os critérios de busca.')}</p>
                        </div>
                      ) : (
                        accommodations.map((accommodation: AccommodationResponse) => (
                          <Card 
                            key={accommodation.id}
                            className={`overflow-hidden cursor-pointer transition-all ${
                              selectedAccommodation?.id === accommodation.id 
                                ? 'border-primary ring-1 ring-primary' 
                                : 'hover:border-gray-300'
                            }`}
                            onClick={() => handleSelectAccommodation(accommodation)}
                          >
                            <div className="flex flex-col md:flex-row">
                              <div className="md:w-1/3 h-48 overflow-hidden">
                                <img 
                                  src={accommodation.imageUrl || 'https://placehold.co/600x400?text=Hotel'} 
                                  alt={accommodation.name}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              
                              <div className="md:w-2/3 p-4">
                                <div className="flex justify-between">
                                  <div>
                                    <h3 className="font-bold text-lg">{accommodation.name}</h3>
                                    <p className="text-sm text-muted-foreground flex items-center">
                                      <MapPin className="h-3 w-3 mr-1" />
                                      {accommodation.address}, {accommodation.city}, {accommodation.country}
                                    </p>
                                  </div>
                                  
                                  <div className="flex items-center">
                                    <div className="flex items-center bg-primary/10 text-primary font-medium px-2 py-1 rounded">
                                      <Star className="h-4 w-4 mr-1 fill-primary" />
                                      {accommodation.rating}
                                    </div>
                                  </div>
                                </div>
                                
                                <div className="mt-2 flex flex-wrap gap-1">
                                  {accommodation.type && (
                                    <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                                      {accommodation.type}
                                    </span>
                                  )}
                                  
                                  {accommodation.amenities?.map((amenity, index) => (
                                    <span key={index} className="text-xs bg-gray-100 px-2 py-1 rounded">
                                      {amenity}
                                    </span>
                                  ))}
                                </div>
                                
                                <div className="mt-4 flex justify-between items-end">
                                  <div>
                                    <span className="block text-sm text-muted-foreground">
                                      {t('booking.pricePerNight', 'Preço por noite')}
                                    </span>
                                    <span className="text-xl font-bold">
                                      {new Intl.NumberFormat('pt-BR', { 
                                        style: 'currency', 
                                        currency: accommodation.currency 
                                      }).format(accommodation.pricePerNight)}
                                    </span>
                                  </div>
                                  
                                  {accommodation.availability ? (
                                    <span className="text-sm text-green-600 font-medium">
                                      {t('booking.available', 'Disponível')}
                                    </span>
                                  ) : (
                                    <span className="text-sm text-red-600 font-medium">
                                      {t('booking.unavailable', 'Indisponível')}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </Card>
                        ))
                      )}
                    </div>
                  ) : (
                    <div className="text-center p-8 bg-gray-50 rounded-lg">
                      <p>{t('booking.searchToSeeResults', 'Faça uma busca para ver resultados.')}</p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button 
                onClick={handleBookAccommodation}
                disabled={!selectedAccommodation || (selectedAccommodation && !selectedAccommodation.availability)}
              >
                <CreditCard className="h-4 w-4 mr-2" />
                {t('booking.bookNow', 'Reservar Agora')}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        {/* Conteúdo da aba de voos */}
        <TabsContent value="flight" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t('booking.searchTransport', 'Buscar Transporte')}</CardTitle>
              <CardDescription>
                {t('booking.searchTransportDesc', 'Encontre o transporte ideal para seu próximo destino')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2 grid grid-cols-2 gap-4">
                  <div>
                    <Label>{t('booking.from', 'De')}</Label>
                    <Input 
                      value={destination?.city || ''}
                      className="mt-1"
                      disabled
                    />
                  </div>
                  
                  <div>
                    <Label>{t('booking.to', 'Para')}</Label>
                    <Input 
                      placeholder={t('booking.destinationCity', 'Cidade de destino')}
                      className="mt-1"
                      value={searchParams.city}
                      onChange={(e) => setSearchParams({...searchParams, city: e.target.value})}
                    />
                  </div>
                  
                  <div>
                    <Label>{t('booking.departureDate', 'Data de partida')}</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start text-left font-normal mt-1"
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {searchParams.checkOut ? (
                            format(new Date(searchParams.checkOut), 'PP', { locale: pt })
                          ) : (
                            <span>{t('booking.selectDate', 'Selecionar data')}</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={searchParams.checkOut ? new Date(searchParams.checkOut) : undefined}
                          onSelect={(date) => 
                            setSearchParams({
                              ...searchParams, 
                              checkOut: date ? date.toISOString() : ''
                            })
                          }
                          disabled={(date) => date < new Date()}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  
                  <div>
                    <Label>{t('booking.transportType', 'Tipo de transporte')}</Label>
                    <select
                      className="w-full h-10 px-3 py-2 mt-1 border rounded-md"
                      value={searchParams.transportType}
                      onChange={(e) => setSearchParams({...searchParams, transportType: e.target.value})}
                    >
                      <option value="plane">{t('booking.plane', 'Avião')}</option>
                      <option value="train">{t('booking.train', 'Trem')}</option>
                      <option value="bus">{t('booking.bus', 'Ônibus')}</option>
                      <option value="car">{t('booking.car', 'Carro')}</option>
                    </select>
                  </div>
                </div>
                
                <div>
                  <Button
                    onClick={handleSearchFlights}
                    className="w-full h-full min-h-[100px]"
                    disabled={!searchParams.city || !searchParams.checkOut}
                  >
                    <Search className="h-5 w-5 mr-2" />
                    {t('booking.searchTransport', 'Buscar Transporte')}
                  </Button>
                </div>
              </div>
              
              <div className="mt-6">
                {isFlightsLoading ? (
                  <div className="flex justify-center p-8">
                    <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
                  </div>
                ) : flights ? (
                  <div className="space-y-4">
                    {flights.length === 0 ? (
                      <div className="text-center p-8 bg-gray-50 rounded-lg">
                        <p>{t('booking.noTransportFound', 'Nenhum transporte encontrado para os critérios de busca.')}</p>
                      </div>
                    ) : (
                      flights.map((flight: FlightResponse) => (
                        <Card 
                          key={flight.id}
                          className={`overflow-hidden cursor-pointer transition-all ${
                            selectedFlight?.id === flight.id 
                              ? 'border-primary ring-1 ring-primary' 
                              : 'hover:border-gray-300'
                          }`}
                          onClick={() => handleSelectFlight(flight)}
                        >
                          <div className="p-4">
                            <div className="flex flex-col md:flex-row justify-between">
                              <div className="md:w-1/4">
                                <p className="font-semibold">{flight.airline}</p>
                                <p className="text-sm text-muted-foreground">{flight.flightNumber}</p>
                                
                                <div className="mt-2 flex items-center text-sm">
                                  <Clock className="h-4 w-4 mr-1 text-muted-foreground" />
                                  <span>
                                    {Math.floor(flight.duration / 60)}h {flight.duration % 60}min
                                  </span>
                                </div>
                                
                                <div className="mt-1 flex items-center text-sm">
                                  <Globe className="h-4 w-4 mr-1 text-muted-foreground" />
                                  <span>
                                    {flight.stops === 0 
                                      ? t('booking.nonstop', 'Direto') 
                                      : flight.stops === 1 
                                        ? t('booking.oneStop', '1 parada')
                                        : t('booking.multipleStops', '{count} paradas', { count: flight.stops })}
                                  </span>
                                </div>
                              </div>
                              
                              <div className="md:w-2/4 flex justify-around items-center mt-4 md:mt-0">
                                <div className="text-center">
                                  <p className="text-xl font-bold">
                                    {new Date(flight.departureTime).toLocaleTimeString('pt-BR', { 
                                      hour: '2-digit', 
                                      minute: '2-digit' 
                                    })}
                                  </p>
                                  <p className="text-sm">{flight.departureAirport}</p>
                                  <p className="text-xs text-muted-foreground">{flight.departureCity}</p>
                                </div>
                                
                                <div className="flex flex-col items-center">
                                  <div className="w-20 md:w-32 h-[1px] bg-gray-300 my-2"></div>
                                  <Plane className="h-4 w-4 text-muted-foreground" />
                                </div>
                                
                                <div className="text-center">
                                  <p className="text-xl font-bold">
                                    {new Date(flight.arrivalTime).toLocaleTimeString('pt-BR', { 
                                      hour: '2-digit', 
                                      minute: '2-digit' 
                                    })}
                                  </p>
                                  <p className="text-sm">{flight.arrivalAirport}</p>
                                  <p className="text-xs text-muted-foreground">{flight.arrivalCity}</p>
                                </div>
                              </div>
                              
                              <div className="md:w-1/4 mt-4 md:mt-0 flex flex-col items-end justify-between">
                                <div className="text-right">
                                  <p className="text-2xl font-bold">
                                    {new Intl.NumberFormat('pt-BR', { 
                                      style: 'currency', 
                                      currency: flight.currency 
                                    }).format(flight.price)}
                                  </p>
                                  <p className="text-sm text-muted-foreground">
                                    {t('booking.perPerson', 'por pessoa')}
                                  </p>
                                </div>
                                
                                <div className="mt-2">
                                  {flight.availability ? (
                                    <span className="text-sm text-green-600 font-medium">
                                      {t('booking.available', 'Disponível')}
                                    </span>
                                  ) : (
                                    <span className="text-sm text-red-600 font-medium">
                                      {t('booking.unavailable', 'Indisponível')}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </Card>
                      ))
                    )}
                  </div>
                ) : (
                  <div className="text-center p-8 bg-gray-50 rounded-lg">
                    <p>{t('booking.searchToSeeResults', 'Faça uma busca para ver resultados.')}</p>
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button 
                onClick={handleBookFlight}
                disabled={!selectedFlight || (selectedFlight && !selectedFlight.availability)}
              >
                <CreditCard className="h-4 w-4 mr-2" />
                {t('booking.bookNow', 'Reservar Agora')}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Seção de pagamento */}
      {isPaymentOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <PaymentSection 
              tripId={tripId}
              totalAmount={
                activeTab === 'accommodation' && selectedAccommodation
                  ? selectedAccommodation.pricePerNight * 
                    Math.ceil(
                      (new Date(searchParams.checkOut).getTime() - new Date(searchParams.checkIn).getTime()) / 
                      (1000 * 60 * 60 * 24)
                    )
                  : activeTab === 'flight' && selectedFlight
                    ? selectedFlight.price
                    : 0
              }
              currency={
                activeTab === 'accommodation' && selectedAccommodation
                  ? selectedAccommodation.currency
                  : activeTab === 'flight' && selectedFlight
                    ? selectedFlight.currency
                    : 'BRL'
              }
              onPaymentComplete={() => setIsPaymentOpen(false)}
              onCancel={() => setIsPaymentOpen(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}