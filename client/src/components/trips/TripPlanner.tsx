import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { DestinationAutocomplete } from './DestinationAutocomplete';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  CalendarIcon, 
  PlaneLanding, 
  PlaneTakeoff, 
  Calculator, 
  MapPin, 
  DollarSign,
  Hotel,
  Palmtree,
  Utensils,
  Camera,
  Sparkles 
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { TripPriceSummary } from './TripPriceSummary';

// Categorias de pontos de interesse
const interestCategories = [
  { id: 'culture', label: 'Cultura', icon: <Camera className="h-4 w-4 mr-2" /> },
  { id: 'nature', label: 'Natureza', icon: <Palmtree className="h-4 w-4 mr-2" /> },
  { id: 'nightlife', label: 'Vida Noturna', icon: <Sparkles className="h-4 w-4 mr-2" /> },
  { id: 'food', label: 'Gastronomia', icon: <Utensils className="h-4 w-4 mr-2" /> },
  { id: 'adventure', label: 'Aventura', icon: <MapPin className="h-4 w-4 mr-2" /> },
];

// Interface para o formulário de viagem
interface TripFormData {
  origin: string;
  originCountry: string;
  destination: string;
  destinationCountry: string;
  departureDate: Date | null;
  returnDate: Date | null;
  budget: number;
  interests: string[];
}

// Interface para a resposta da API de simulação de custos
interface CostSimulation {
  flightOptions: any[];
  hotelOptions: any[];
  totalEstimate: number;
  currency: string;
  attractions: any[];
}

export function TripPlanner() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const today = new Date();

  // Estado do formulário
  const [formData, setFormData] = useState<TripFormData>({
    origin: '',
    originCountry: '',
    destination: '',
    destinationCountry: '',
    departureDate: new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000), // 7 dias a partir de hoje
    returnDate: new Date(today.getTime() + 14 * 24 * 60 * 60 * 1000), // 14 dias a partir de hoje
    budget: 5000,
    interests: [],
  });

  // Outros estados
  const [loading, setLoading] = useState(false);
  const [costSimulation, setCostSimulation] = useState<CostSimulation | null>(null);
  const [isDateError, setIsDateError] = useState(false);

  // Sugestões dinâmicas baseadas nos dados de entrada
  const [suggestions, setSuggestions] = useState<string[]>([]);

  // Função para atualizar o estado do formulário
  const updateFormData = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Validar datas
  useEffect(() => {
    if (formData.departureDate && formData.returnDate) {
      if (formData.returnDate < formData.departureDate) {
        setIsDateError(true);
      } else {
        setIsDateError(false);
      }
    }
  }, [formData.departureDate, formData.returnDate]);

  // Gerar sugestões baseadas nos dados de entrada
  useEffect(() => {
    if (formData.destination && formData.departureDate) {
      // Em uma aplicação real, essas sugestões viriam de uma API
      const mockSuggestions = [
        `Melhor época para visitar ${formData.destination} é entre Junho e Agosto`,
        `Procure por passagens aéreas com pelo menos 2 meses de antecedência`,
        `${formData.destination} tem festivais importantes no período escolhido`
      ];
      setSuggestions(mockSuggestions);
    }
  }, [formData.destination, formData.departureDate]);

  // Alternar interesse selecionado
  const toggleInterest = (id: string) => {
    setFormData(prev => {
      if (prev.interests.includes(id)) {
        return { ...prev, interests: prev.interests.filter(i => i !== id) };
      } else {
        return { ...prev, interests: [...prev.interests, id] };
      }
    });
  };

  // Chamada para a API
  const calculateTrip = async () => {
    // Validar dados do formulário
    if (!formData.origin || !formData.destination || !formData.departureDate || !formData.returnDate) {
      toast({
        title: 'Erro de validação',
        description: 'Por favor, preencha todos os campos obrigatórios',
        variant: 'destructive',
      });
      return;
    }

    if (isDateError) {
      toast({
        title: 'Erro de data',
        description: 'A data de retorno deve ser posterior à data de partida',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
      // Formatar datas para o formato ISO para a API
      const requestData = {
        origin: formData.origin,
        originCountry: formData.originCountry,
        destination: formData.destination, 
        destinationCountry: formData.destinationCountry,
        departureDate: formData.departureDate?.toISOString(),
        returnDate: formData.returnDate?.toISOString(),
        budget: formData.budget,
        interests: formData.interests
      };
      
      // Chamada real para a API
      const response = await fetch('/api/trip/cost-simulation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });
      
      if (!response.ok) {
        throw new Error(`Erro na API: ${response.status}`);
      }
      
      const data = await response.json();
      setCostSimulation(data);
      setLoading(false);
      
      // Feedback positivo
      toast({
        title: 'Simulação concluída',
        description: 'Os custos estimados da sua viagem foram calculados com sucesso.',
        variant: 'default',
      });
    } catch (error) {
      console.error('Erro ao calcular custos da viagem:', error);
      toast({
        title: 'Erro ao calcular custos',
        description: 'Ocorreu um erro ao calcular os custos da viagem. Tente novamente.',
        variant: 'destructive',
      });
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Formulário principal */}
        <div className="md:col-span-2">
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-2xl">{t('tripPlanner.title', 'Planejador de Viagem')}</CardTitle>
              <CardDescription>
                {t('tripPlanner.description', 'Escolha seu destino, datas e veja o melhor roteiro personalizado')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Origem e Destino */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <PlaneTakeoff className="h-4 w-4 text-primary" />
                    <Label htmlFor="origin">{t('tripPlanner.origin', 'Origem')}</Label>
                  </div>
                  <DestinationAutocomplete 
                    value={formData.origin && formData.originCountry ? { city: formData.origin, country: formData.originCountry } : null}
                    onChange={(value) => {
                      updateFormData('origin', value.city);
                      updateFormData('originCountry', value.country);
                    }}
                    placeholder={t('tripPlanner.selectOrigin', 'Selecione sua cidade de origem')}
                  />
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <PlaneLanding className="h-4 w-4 text-primary" />
                    <Label htmlFor="destination">{t('tripPlanner.destination', 'Destino')}</Label>
                  </div>
                  <DestinationAutocomplete 
                    value={formData.destination && formData.destinationCountry ? { city: formData.destination, country: formData.destinationCountry } : null}
                    onChange={(value) => {
                      updateFormData('destination', value.city);
                      updateFormData('destinationCountry', value.country);
                    }}
                    placeholder={t('tripPlanner.selectDestination', 'Para onde você quer ir?')}
                  />
                </div>
              </div>
              
              {/* Datas */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="departureDate">{t('tripPlanner.departureDate', 'Data de Ida')}</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={`w-full justify-start text-left font-normal ${isDateError ? 'border-red-500' : ''}`}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.departureDate ? (
                          format(formData.departureDate, 'PPP', { locale: ptBR })
                        ) : (
                          <span>{t('tripPlanner.selectDate', 'Selecione uma data')}</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={formData.departureDate || undefined}
                        onSelect={(date) => updateFormData('departureDate', date)}
                        disabled={(date) => date < today}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="returnDate">{t('tripPlanner.returnDate', 'Data de Volta')}</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={`w-full justify-start text-left font-normal ${isDateError ? 'border-red-500' : ''}`}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.returnDate ? (
                          format(formData.returnDate, 'PPP', { locale: ptBR })
                        ) : (
                          <span>{t('tripPlanner.selectDate', 'Selecione uma data')}</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={formData.returnDate || undefined}
                        onSelect={(date) => updateFormData('returnDate', date)}
                        disabled={(date) => date < (formData.departureDate || today)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  {isDateError && (
                    <p className="text-sm text-red-500 mt-1">
                      {t('tripPlanner.dateError', 'A data de retorno deve ser posterior à data de partida')}
                    </p>
                  )}
                </div>
              </div>
              
              {/* Orçamento */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <DollarSign className="h-4 w-4 text-primary" />
                    <Label htmlFor="budget">{t('tripPlanner.budget', 'Orçamento')}</Label>
                  </div>
                  <span className="font-medium text-primary">
                    {formatCurrency(formData.budget, 'BRL')}
                  </span>
                </div>
                
                <Slider
                  id="budget"
                  min={1000}
                  max={20000}
                  step={500}
                  value={[formData.budget]}
                  onValueChange={(value) => updateFormData('budget', value[0])}
                  className="mt-2"
                />
                
                <div className="flex justify-between text-xs text-gray-500">
                  <span>{formatCurrency(1000, 'BRL')}</span>
                  <span>{formatCurrency(20000, 'BRL')}</span>
                </div>
              </div>
              
              {/* Categorias de Interesse */}
              <div className="space-y-4">
                <Label>{t('tripPlanner.interests', 'O que você gostaria de conhecer?')}</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                  {interestCategories.map((category) => (
                    <div 
                      key={category.id}
                      className={`
                        flex items-center p-3 border rounded-md cursor-pointer transition-colors
                        ${formData.interests.includes(category.id) 
                          ? 'bg-primary text-primary-foreground border-primary' 
                          : 'bg-card hover:bg-accent'
                        }
                      `}
                      onClick={() => toggleInterest(category.id)}
                    >
                      {category.icon}
                      <span>{category.label}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Atrações */}
              {formData.interests.length > 0 && costSimulation && (
                <div className="space-y-4">
                  <Label>{t('tripPlanner.topAttractions', 'Principais Atrações')}</Label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {costSimulation.attractions
                      .filter(attraction => formData.interests.includes(attraction.category))
                      .slice(0, 3)
                      .map(attraction => (
                        <div key={attraction.id} className="overflow-hidden rounded-lg shadow-md group">
                          <div className="h-36 overflow-hidden relative">
                            <img 
                              src={attraction.imageUrl} 
                              alt={attraction.name}
                              className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-300"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                            <div className="absolute bottom-2 left-2 text-white font-medium">
                              {attraction.name}
                            </div>
                            <div className="absolute top-2 right-2 bg-yellow-400 text-xs font-bold px-2 py-1 rounded-full">
                              ★ {attraction.rating}
                            </div>
                          </div>
                        </div>
                      ))
                    }
                  </div>
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button className="w-full py-6 text-lg" onClick={calculateTrip} disabled={loading}>
                {loading ? (
                  <span className="flex items-center">
                    <span className="animate-spin h-5 w-5 mr-3 border-2 border-b-transparent rounded-full"></span>
                    {t('tripPlanner.calculating', 'Calculando...')}
                  </span>
                ) : (
                  <span className="flex items-center">
                    <Calculator className="h-5 w-5 mr-2" />
                    {t('tripPlanner.calculate', 'Calcular Viagem')}
                  </span>
                )}
              </Button>
            </CardFooter>
          </Card>
        </div>
        
        {/* Painel lateral */}
        <div>
          {/* Sugestões */}
          {suggestions.length > 0 && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>{t('tripPlanner.suggestions', 'Dicas Inteligentes')}</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {suggestions.map((suggestion, index) => (
                    <li key={index} className="flex items-start">
                      <div className="flex-shrink-0 h-5 w-5 rounded-full bg-primary/20 text-primary flex items-center justify-center mr-2 mt-0.5">
                        <span className="text-xs font-bold">{index + 1}</span>
                      </div>
                      <span className="text-sm">{suggestion}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
          
          {/* Resumo de custos */}
          {costSimulation && (
            <TripPriceSummary
              destination={formData.destination}
              country={formData.destinationCountry}
              startDate={formData.departureDate ? format(formData.departureDate, 'PPP', { locale: ptBR }) : ''}
              endDate={formData.returnDate ? format(formData.returnDate, 'PPP', { locale: ptBR }) : ''}
              priceItems={[
                // Voos
                ...costSimulation.flightOptions.slice(0, 1).map(flight => ({
                  id: flight.id,
                  name: `Voo de ida e volta - ${flight.airline}`,
                  price: flight.price,
                  currency: flight.currency,
                  type: 'flight' as const
                })),
                // Hotéis
                ...costSimulation.hotelOptions.slice(0, 1).map(hotel => ({
                  id: hotel.id,
                  name: `${hotel.name} (${formData.returnDate && formData.departureDate ? Math.ceil((formData.returnDate.getTime() - formData.departureDate.getTime()) / (1000 * 60 * 60 * 24)) : 0} noites)`,
                  price: hotel.totalPrice,
                  currency: hotel.currency,
                  type: 'accommodation' as const
                }))
              ]}
            />
          )}
        </div>
      </div>
    </div>
  );
}