import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { 
  ChevronLeft, 
  Globe, 
  Calendar, 
  Users, 
  Wallet,
  Sparkles, 
  Plane, 
  Bus,
  Train,
  Car,
  Map,
  CreditCard
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { MultiDestinationBuilder } from '@/components/trips/MultiDestinationBuilder';
import { MultiDestinationViewer } from '@/components/trips/MultiDestinationViewer';
import { useAuth } from '@/hooks/useAuth';

// Tipos
interface Destination {
  id: string;
  name: string;
  city: string;
  country: string;
  arrivalDate: Date;
  departureDate: Date;
  transportType?: 'plane' | 'train' | 'bus' | 'car' | '';
}

interface ItineraryFormData {
  name: string;
  description?: string;
  startDate: Date;
  endDate: Date;
  budget?: number;
  currency: string;
  destinations: Destination[];
  isMultiDestination: boolean;
  isPublic: boolean;
}

// Templates pré-definidos para viagens
const TRIP_TEMPLATES = [
  {
    id: 'short-weekend',
    name: 'Fim de Semana',
    description: 'Viagem curta de 2-3 dias para uma única cidade',
    icon: <Calendar className="h-5 w-5" />,
  },
  {
    id: 'europe-capitals',
    name: 'Capitais Europeias',
    description: 'Roteiro por 3-4 principais capitais europeias',
    icon: <Globe className="h-5 w-5" />,
  },
  {
    id: 'south-america',
    name: 'América do Sul',
    description: 'Circuito pelos países da América do Sul',
    icon: <Map className="h-5 w-5" />,
  },
  {
    id: 'nomad-hopping',
    name: 'Rota Nômade',
    description: 'Estadia prolongada em cidades com boas condições para trabalho remoto',
    icon: <Plane className="h-5 w-5" />,
  },
  {
    id: 'business-multi',
    name: 'Multi-Escritórios',
    description: 'Viagem corporativa com reuniões em diferentes escritórios da empresa',
    icon: <Users className="h-5 w-5" />,
  },
  {
    id: 'custom',
    name: 'Personalizado',
    description: 'Crie seu roteiro do zero',
    icon: <Sparkles className="h-5 w-5" />,
  },
];

export default function ItineraryBuilder() {
  const { t } = useTranslation();
  const [_, navigate] = useLocation();
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  // Estados
  const [step, setStep] = useState<'template' | 'build' | 'review'>('template');
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [formData, setFormData] = useState<ItineraryFormData>({
    name: '',
    startDate: new Date(),
    endDate: new Date(new Date().setDate(new Date().getDate() + 7)),
    currency: 'BRL',
    destinations: [],
    isMultiDestination: true,
    isPublic: false,
  });
  
  // Mutação para criar viagem
  const createTripMutation = useMutation({
    mutationFn: async (data: ItineraryFormData) => {
      // Transformar os dados para enviar ao servidor
      const serverData = {
        name: data.name,
        description: data.description || '',
        startDate: data.startDate.toISOString(),
        endDate: data.endDate.toISOString(),
        isMultiDestination: data.isMultiDestination,
        budget: data.budget || 0,
        currency: data.currency,
        isPublic: data.isPublic,
        // Se for multi-destino, usamos o primeiro destino como principal
        destination: data.destinations.length > 0 ? data.destinations[0].city : '',
        country: data.destinations.length > 0 ? data.destinations[0].country : '',
        tripType: user?.role || 'tourist',
        itineraryTemplate: selectedTemplate || 'custom',
        // Os destinos serão criados em uma segunda etapa
      };
      
      const response = await fetch('/api/trips', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(serverData),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create trip');
      }
      
      const trip = await response.json();
      
      // Agora criamos os destinos
      if (data.isMultiDestination && data.destinations.length > 0) {
        await Promise.all(data.destinations.map(async (dest, index) => {
          await fetch('/api/destinations', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              tripId: trip.id,
              name: dest.name,
              city: dest.city,
              country: dest.country,
              orderIndex: index,
              arrivalDate: dest.arrivalDate,
              departureDate: dest.departureDate,
              transportTypeToNext: dest.transportType || null,
            }),
          });
        }));
      }
      
      return trip;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/trips'] });
      toast({
        title: t('tripBuilder.tripCreated', 'Roteiro criado com sucesso!'),
        description: t('tripBuilder.tripCreatedDesc', 'Seu roteiro multi-destino foi criado e está pronto para ser personalizado.'),
      });
      navigate(`/trips/${data.id}`);
    },
    onError: (error) => {
      toast({
        title: t('tripBuilder.errorCreating', 'Erro ao criar roteiro'),
        description: t('tripBuilder.tryAgain', 'Por favor, tente novamente.'),
        variant: 'destructive',
      });
    },
  });
  
  // Função para selecionar o template e avançar
  const handleSelectTemplate = (templateId: string) => {
    setSelectedTemplate(templateId);
    
    // Opcionalmente, pré-configurar dados com base no template
    if (templateId === 'europe-capitals') {
      const today = new Date();
      const startDate = new Date(today);
      startDate.setDate(today.getDate() + 30); // Viagem no próximo mês
      
      const endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + 14); // Duas semanas de viagem
      
      // Criar destinos padrão para capitais europeias
      const destinations = [
        {
          id: `dest-${Date.now()}-1`,
          name: 'Paris',
          city: 'Paris',
          country: 'França',
          arrivalDate: new Date(startDate),
          departureDate: new Date(new Date(startDate).setDate(startDate.getDate() + 3)),
          transportType: 'plane' as const,
        },
        {
          id: `dest-${Date.now()}-2`,
          name: 'Berlim',
          city: 'Berlim',
          country: 'Alemanha',
          arrivalDate: new Date(new Date(startDate).setDate(startDate.getDate() + 4)),
          departureDate: new Date(new Date(startDate).setDate(startDate.getDate() + 7)),
          transportType: 'train' as const,
        },
        {
          id: `dest-${Date.now()}-3`,
          name: 'Roma',
          city: 'Roma',
          country: 'Itália',
          arrivalDate: new Date(new Date(startDate).setDate(startDate.getDate() + 8)),
          departureDate: new Date(new Date(startDate).setDate(startDate.getDate() + 11)),
          transportType: 'plane' as const,
        },
        {
          id: `dest-${Date.now()}-4`,
          name: 'Barcelona',
          city: 'Barcelona',
          country: 'Espanha',
          arrivalDate: new Date(new Date(startDate).setDate(startDate.getDate() + 12)),
          departureDate: new Date(endDate),
          transportType: 'train' as const,
        },
      ];
      
      setFormData({
        ...formData,
        name: t('tripBuilder.europeanCapitals', 'Roteiro Capitais Europeias'),
        startDate,
        endDate,
        destinations,
        isMultiDestination: true,
        budget: 8000,
      });
    } else if (templateId === 'south-america') {
      const today = new Date();
      const startDate = new Date(today);
      startDate.setDate(today.getDate() + 45); // Viagem em um mês e meio
      
      const endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + 21); // Três semanas

      // Criar destinos padrão para América do Sul
      const destinations = [
        {
          id: `dest-${Date.now()}-1`,
          name: 'Rio de Janeiro',
          city: 'Rio de Janeiro',
          country: 'Brasil',
          arrivalDate: new Date(startDate),
          departureDate: new Date(new Date(startDate).setDate(startDate.getDate() + 4)),
          transportType: 'plane' as const,
        },
        {
          id: `dest-${Date.now()}-2`,
          name: 'Buenos Aires',
          city: 'Buenos Aires',
          country: 'Argentina',
          arrivalDate: new Date(new Date(startDate).setDate(startDate.getDate() + 5)),
          departureDate: new Date(new Date(startDate).setDate(startDate.getDate() + 10)),
          transportType: 'plane' as const,
        },
        {
          id: `dest-${Date.now()}-3`,
          name: 'Santiago',
          city: 'Santiago',
          country: 'Chile',
          arrivalDate: new Date(new Date(startDate).setDate(startDate.getDate() + 11)),
          departureDate: new Date(new Date(startDate).setDate(startDate.getDate() + 15)),
          transportType: 'bus' as const,
        },
        {
          id: `dest-${Date.now()}-4`,
          name: 'Lima',
          city: 'Lima',
          country: 'Peru',
          arrivalDate: new Date(new Date(startDate).setDate(startDate.getDate() + 16)),
          departureDate: new Date(endDate),
          transportType: 'plane' as const,
        },
      ];

      setFormData({
        ...formData,
        name: t('tripBuilder.southAmericaCircuit', 'Circuito América do Sul'),
        startDate,
        endDate,
        destinations,
        isMultiDestination: true,
        budget: 6500,
      });
    } else if (templateId === 'nomad-hopping') {
      const today = new Date();
      const startDate = new Date(today);
      startDate.setDate(today.getDate() + 30);
      
      const endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + 90); // 3 meses

      // Criar destinos padrão para nômades
      const destinations = [
        {
          id: `dest-${Date.now()}-1`,
          name: 'Lisboa',
          city: 'Lisboa',
          country: 'Portugal',
          arrivalDate: new Date(startDate),
          departureDate: new Date(new Date(startDate).setDate(startDate.getDate() + 28)),
          transportType: 'plane' as const,
        },
        {
          id: `dest-${Date.now()}-2`,
          name: 'Bali',
          city: 'Bali',
          country: 'Indonésia',
          arrivalDate: new Date(new Date(startDate).setDate(startDate.getDate() + 30)),
          departureDate: new Date(new Date(startDate).setDate(startDate.getDate() + 59)),
          transportType: 'plane' as const,
        },
        {
          id: `dest-${Date.now()}-3`,
          name: 'Cidade do México',
          city: 'Cidade do México',
          country: 'México',
          arrivalDate: new Date(new Date(startDate).setDate(startDate.getDate() + 61)),
          departureDate: new Date(endDate),
          transportType: 'plane' as const,
        },
      ];

      setFormData({
        ...formData,
        name: t('tripBuilder.digitalNomadRoute', 'Rota Nômade Digital'),
        startDate,
        endDate,
        destinations,
        isMultiDestination: true,
        budget: 15000,
      });
    } else if (templateId === 'business-multi') {
      const today = new Date();
      const startDate = new Date(today);
      startDate.setDate(today.getDate() + 14);
      
      const endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + 10);

      // Criar destinos padrão para viagem de negócios
      const destinations = [
        {
          id: `dest-${Date.now()}-1`,
          name: 'São Paulo',
          city: 'São Paulo',
          country: 'Brasil',
          arrivalDate: new Date(startDate),
          departureDate: new Date(new Date(startDate).setDate(startDate.getDate() + 2)),
          transportType: 'plane' as const,
        },
        {
          id: `dest-${Date.now()}-2`,
          name: 'Nova York',
          city: 'Nova York',
          country: 'Estados Unidos',
          arrivalDate: new Date(new Date(startDate).setDate(startDate.getDate() + 3)),
          departureDate: new Date(new Date(startDate).setDate(startDate.getDate() + 5)),
          transportType: 'plane' as const,
        },
        {
          id: `dest-${Date.now()}-3`,
          name: 'Londres',
          city: 'Londres',
          country: 'Reino Unido',
          arrivalDate: new Date(new Date(startDate).setDate(startDate.getDate() + 6)),
          departureDate: new Date(endDate),
          transportType: 'plane' as const,
        },
      ];

      setFormData({
        ...formData,
        name: t('tripBuilder.businessTour', 'Circuito Corporativo'),
        startDate,
        endDate,
        destinations,
        isMultiDestination: true,
        budget: 12000,
      });
    } else if (templateId === 'short-weekend') {
      const today = new Date();
      const friday = new Date(today);
      // Definir para a próxima sexta-feira
      friday.setDate(today.getDate() + ((7 + 5 - today.getDay()) % 7));
      
      const sunday = new Date(friday);
      sunday.setDate(friday.getDate() + 2);

      const destinations = [
        {
          id: `dest-${Date.now()}-1`,
          name: 'Fim de Semana em Paraty',
          city: 'Paraty',
          country: 'Brasil',
          arrivalDate: friday,
          departureDate: sunday,
          transportType: 'car' as const,
        },
      ];

      setFormData({
        ...formData,
        name: t('tripBuilder.weekendGetaway', 'Escapada de Fim de Semana'),
        startDate: friday,
        endDate: sunday,
        destinations,
        isMultiDestination: false,
        budget: 1500,
      });
    } else {
      // Template personalizado, apenas criar um destino vazio
      const destinations = [
        {
          id: `dest-${Date.now()}-1`,
          name: '',
          city: '',
          country: '',
          arrivalDate: new Date(),
          departureDate: new Date(new Date().setDate(new Date().getDate() + 5)),
          transportType: '' as const,
        },
      ];

      setFormData({
        ...formData,
        destinations,
      });
    }
    
    setStep('build');
  };
  
  // Função para lidar com a atualização dos destinos
  const handleDestinationsUpdate = (updatedDestinations: Destination[]) => {
    // Atualizar datas de início e fim baseadas nos destinos
    const startDate = updatedDestinations.length > 0 
      ? new Date(Math.min(...updatedDestinations.map(d => new Date(d.arrivalDate).getTime())))
      : formData.startDate;
      
    const endDate = updatedDestinations.length > 0
      ? new Date(Math.max(...updatedDestinations.map(d => new Date(d.departureDate).getTime())))
      : formData.endDate;
    
    setFormData({
      ...formData,
      destinations: updatedDestinations,
      startDate,
      endDate,
      isMultiDestination: updatedDestinations.length > 1,
    });
    
    setStep('review');
  };
  
  // Função para finalizar a criação da viagem
  const handleCreateTrip = () => {
    // Aplicar quaisquer últimos ajustes nos dados se necessário
    createTripMutation.mutate(formData);
  };
  
  // Renderização condicional baseada na etapa atual
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">{t('tripBuilder.createMultiDestination', 'Criar Roteiro Multi-Destino')}</h1>
          <p className="text-muted-foreground">
            {t('tripBuilder.planMultiDestDesc', 'Planeje sua jornada com múltiplos destinos, transportes e acomodações')}
          </p>
        </div>
        
        <Button variant="outline" onClick={() => navigate('/trips')}>
          <ChevronLeft className="h-4 w-4 mr-2" />
          {t('common.back', 'Voltar')}
        </Button>
      </div>
      
      {/* Indicador de progresso */}
      <div className="flex justify-center">
        <div className="flex items-center space-x-2">
          <div 
            className={`h-10 w-10 rounded-full flex items-center justify-center ${
              step === 'template' || step === 'build' || step === 'review' 
                ? 'bg-primary text-white' 
                : 'bg-muted text-muted-foreground'
            }`}
          >
            1
          </div>
          <div className={`h-1 w-10 ${step === 'build' || step === 'review' ? 'bg-primary' : 'bg-muted'}`} />
          <div 
            className={`h-10 w-10 rounded-full flex items-center justify-center ${
              step === 'build' || step === 'review' 
                ? 'bg-primary text-white' 
                : 'bg-muted text-muted-foreground'
            }`}
          >
            2
          </div>
          <div className={`h-1 w-10 ${step === 'review' ? 'bg-primary' : 'bg-muted'}`} />
          <div 
            className={`h-10 w-10 rounded-full flex items-center justify-center ${
              step === 'review' 
                ? 'bg-primary text-white' 
                : 'bg-muted text-muted-foreground'
            }`}
          >
            3
          </div>
        </div>
      </div>
      
      {/* Etapa 1: Seleção de template */}
      {step === 'template' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t('tripBuilder.selectTemplate', 'Selecione um Modelo')}</CardTitle>
              <CardDescription>
                {t('tripBuilder.templateDesc', 'Comece a partir de um modelo ou crie seu roteiro personalizado do zero')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {TRIP_TEMPLATES.map((template) => (
                  <Card 
                    key={template.id}
                    className={`cursor-pointer transition-all ${
                      selectedTemplate === template.id 
                        ? 'border-primary bg-primary/5' 
                        : 'hover:border-primary/50'
                    }`}
                    onClick={() => setSelectedTemplate(
                      selectedTemplate === template.id ? null : template.id
                    )}
                  >
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-center">
                        <div className="p-2 rounded-full bg-primary/10 text-primary">
                          {template.icon}
                        </div>
                        
                        {selectedTemplate === template.id && (
                          <div className="h-4 w-4 rounded-full bg-primary" />
                        )}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <h3 className="font-medium text-lg">{template.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {template.description}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button 
                onClick={() => handleSelectTemplate(selectedTemplate || 'custom')}
                disabled={!selectedTemplate}
              >
                {t('common.continue', 'Continuar')}
              </Button>
            </CardFooter>
          </Card>
        </div>
      )}
      
      {/* Etapa 2: Construção do itinerário */}
      {step === 'build' && (
        <MultiDestinationBuilder
          initialDestinations={formData.destinations}
          onSave={handleDestinationsUpdate}
        />
      )}
      
      {/* Etapa 3: Revisão e finalização */}
      {step === 'review' && (
        <div className="space-y-6">
          <MultiDestinationViewer
            destinations={formData.destinations}
            tripName={formData.name || t('tripBuilder.newTrip', 'Nova Viagem')}
            totalBudget={formData.budget}
            currency={formData.currency}
            userRole={user?.role as any || 'tourist'}
            onEdit={() => setStep('build')}
          />
          
          <Card>
            <CardHeader>
              <CardTitle>{t('tripBuilder.finalize', 'Finalizar Criação')}</CardTitle>
              <CardDescription>
                {t('tripBuilder.reviewBeforeCreating', 'Revise os detalhes antes de criar seu roteiro')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium">{t('tripBuilder.tripName', 'Nome da Viagem')}</h3>
                    <input
                      type="text"
                      className="w-full mt-1 px-3 py-2 border rounded-md"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      placeholder={t('tripBuilder.enterTripName', 'Digite o nome da sua viagem')}
                    />
                  </div>
                  
                  <div>
                    <h3 className="font-medium">{t('tripBuilder.budget', 'Orçamento')}</h3>
                    <div className="flex gap-2 mt-1">
                      <input
                        type="number"
                        className="w-full px-3 py-2 border rounded-md"
                        value={formData.budget || ''}
                        onChange={(e) => setFormData({...formData, budget: parseFloat(e.target.value)})}
                        placeholder={t('tripBuilder.enterBudget', 'Digite o orçamento total')}
                      />
                      <select
                        className="w-24 px-3 py-2 border rounded-md"
                        value={formData.currency}
                        onChange={(e) => setFormData({...formData, currency: e.target.value})}
                      >
                        <option value="BRL">BRL</option>
                        <option value="USD">USD</option>
                        <option value="EUR">EUR</option>
                      </select>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium">{t('tripBuilder.privacy', 'Privacidade')}</h3>
                    <div className="flex items-center gap-2 mt-2">
                      <input
                        type="checkbox"
                        id="isPublic"
                        checked={formData.isPublic}
                        onChange={(e) => setFormData({...formData, isPublic: e.target.checked})}
                      />
                      <label htmlFor="isPublic">
                        {t('tripBuilder.makePublic', 'Tornar este roteiro público para a comunidade')}
                      </label>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-medium">{t('tripBuilder.paymentOptions', 'Opções de Pagamento')}</h3>
                    <div className="flex gap-4 mt-2">
                      <button className="flex items-center gap-2 px-4 py-2 border rounded-md hover:bg-gray-50">
                        <img src="https://cdn.worldvectorlogo.com/logos/paypal-2.svg" alt="PayPal" className="h-6" />
                        {t('payment.payWithPaypal', 'Pagar com PayPal')}
                      </button>
                      
                      <button className="flex items-center gap-2 px-4 py-2 border rounded-md hover:bg-gray-50">
                        <CreditCard className="h-5 w-5" />
                        {t('payment.payWithCard', 'Pagar com Cartão')}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={() => setStep('build')}>
                {t('common.back', 'Voltar')}
              </Button>
              
              <Button 
                onClick={handleCreateTrip}
                disabled={!formData.name || formData.destinations.length === 0 || createTripMutation.isPending}
              >
                {createTripMutation.isPending 
                  ? t('common.creating', 'Criando...') 
                  : t('tripBuilder.createTrip', 'Criar Roteiro')}
              </Button>
            </CardFooter>
          </Card>
        </div>
      )}
    </div>
  );
}