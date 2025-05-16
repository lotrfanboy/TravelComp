import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useLocation, useParams, useRoute } from 'wouter';
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
import { Textarea } from '@/components/ui/textarea';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { 
  CalendarIcon, 
  CheckCircle, 
  Globe, 
  Map, 
  Plane, 
  UserCircle, 
  Briefcase, 
  Palmtree,
  Users,
  Building,
  Hotel,
  AlarmClock,
  Wallet
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { MultiDestinationBuilder } from '@/components/trips/MultiDestinationBuilder';
import { DestinationAutocomplete } from '@/components/trips/DestinationAutocomplete';
import { TripPriceSummary } from '@/components/trips/TripPriceSummary';
import SingleDestinationWizard from '@/components/trips/SingleDestinationWizard';
import { formatDate } from '@/lib/utils';

export default function TripCreator() {
  const { t } = useTranslation();
  const [_, navigate] = useLocation();
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  // Verificar se estamos no modo de edição de viagem existente
  const [match, params] = useRoute<{ id: string }>('/trips/:id/edit');
  const isEditMode = match && params?.id;
  const tripId = isEditMode ? parseInt(params.id) : null;
  
  // Estados
  const [activeTab, setActiveTab] = useState('single-destination-wizard');
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    destination: '',
    country: '',
    startDate: '',
    endDate: '',
    tripType: user?.role || 'tourist',
    travelers: 1,
    budget: '',
    currency: 'BRL',
    isPublic: false,
    notes: '',
    isMultiDestination: false,
  });
  
  const [wizardData, setWizardData] = useState<any>(null);
  const [destinations, setDestinations] = useState<any[]>([]);
  const [showPriceSummary, setShowPriceSummary] = useState(false);
  
  // Efeito para carregar dados da viagem no modo de edição
  useEffect(() => {
    if (isEditMode && tripId) {
      setIsLoading(true);
      fetch(`/api/trips/${tripId}`)
        .then(response => {
          if (!response.ok) {
            throw new Error('Falha ao carregar dados da viagem');
          }
          return response.json();
        })
        .then(data => {
          // Preencher o formulário com os dados da viagem
          setFormData({
            name: data.name || '',
            description: data.description || '',
            destination: data.destination || '',
            country: data.country || '',
            startDate: data.startDate || '',
            endDate: data.endDate || '',
            tripType: data.tripType || user?.role || 'tourist',
            travelers: data.travelers || 1,
            budget: data.budget || '',
            currency: data.currency || 'BRL',
            isPublic: data.isPublic || false,
            notes: data.notes || '',
            isMultiDestination: data.isMultiDestination || false,
          });
          
          // Definir a aba ativa com base no tipo de viagem
          if (data.isMultiDestination) {
            setActiveTab('multi-destination');
          }
          
          setIsLoading(false);
        })
        .catch(error => {
          console.error('Erro ao carregar viagem:', error);
          toast({
            title: "Erro",
            description: "Não foi possível carregar os dados da viagem.",
            variant: "destructive"
          });
          setIsLoading(false);
        });
    }
  }, [isEditMode, tripId, user?.role]);

  // Mutação para criar ou atualizar viagem
  const tripMutation = useMutation({
    mutationFn: async (data: any) => {
      // Adicionar userId e outros campos necessários
      const payload = {
        ...data,
        isMultiDestination: activeTab === 'multi-destination',
      };
      
      const method = isEditMode ? 'PUT' : 'POST';
      const url = isEditMode ? `/api/trips/${tripId}` : '/api/trips';
      
      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || (isEditMode ? 'Erro ao atualizar viagem' : 'Erro ao criar viagem'));
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/trips'] });
      
      if (isEditMode) {
        toast({
          title: 'Viagem atualizada com sucesso',
          description: 'As alterações na sua viagem foram salvas',
        });
      } else {
        toast({
          title: t('tripCreator.success', 'Viagem criada com sucesso'),
          description: t('tripCreator.successDesc', 'Sua viagem foi criada e está pronta para ser planejada'),
        });
      }
      
      navigate(`/trips/${data.id}`);
    },
    onError: (error: any) => {
      toast({
        title: isEditMode ? 'Erro ao atualizar viagem' : t('tripCreator.error', 'Erro ao criar viagem'),
        description: error.message || (isEditMode ? 'Ocorreu um erro ao atualizar sua viagem. Tente novamente.' : t('tripCreator.errorDesc', 'Ocorreu um erro ao criar sua viagem. Tente novamente.')),
        variant: 'destructive',
      });
    },
  });
  
  // Função para lidar com a alteração de campos do formulário
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  
  // Função para lidar com checkboxes
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: checked }));
  };
  
  // Função para lidar com selects
  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  
  // Função para lidar com o envio do formulário
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validação simples
    if (!formData.name || !formData.destination || !formData.country || !formData.startDate || !formData.endDate) {
      toast({
        title: t('tripCreator.validationError', 'Erro de validação'),
        description: t('tripCreator.fillAllRequired', 'Por favor, preencha todos os campos obrigatórios'),
        variant: 'destructive',
      });
      return;
    }
    
    // Se for viagem multi-destino, verificar se há destinos
    if (activeTab === 'multi-destination' && destinations.length === 0) {
      toast({
        title: t('tripCreator.validationError', 'Erro de validação'),
        description: t('tripCreator.addDestinations', 'Adicione pelo menos um destino à sua viagem'),
        variant: 'destructive',
      });
      return;
    }
    
    // Criar ou atualizar viagem
    tripMutation.mutate({
      ...formData,
      isMultiDestination: activeTab === 'multi-destination',
      // Se for multi-destino, usar o primeiro destino como principal
      destination: activeTab === 'multi-destination' && destinations.length > 0 
        ? destinations[0].city
        : formData.destination,
      country: activeTab === 'multi-destination' && destinations.length > 0 
        ? destinations[0].country
        : formData.country,
    });
  };
  
  // Manipulador de destinos para multi-destination
  const handleDestinationsUpdate = (updatedDestinations: any[]) => {
    setDestinations(updatedDestinations);
    
    // Atualizar datas de início e fim com base nos destinos
    if (updatedDestinations.length > 0) {
      const startDates = updatedDestinations.map(d => new Date(d.arrivalDate).getTime());
      const endDates = updatedDestinations.map(d => new Date(d.departureDate).getTime());
      
      const earliestStartDate = new Date(Math.min(...startDates));
      const latestEndDate = new Date(Math.max(...endDates));
      
      setFormData(prev => ({
        ...prev,
        startDate: earliestStartDate.toISOString().split('T')[0],
        endDate: latestEndDate.toISOString().split('T')[0],
      }));
    }
  };
  
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">
            {isEditMode 
              ? 'Editar Viagem' 
              : t('tripCreator.title', 'Criar Nova Viagem')
            }
          </h1>
          <p className="text-muted-foreground">
            {isEditMode
              ? 'Atualize os detalhes da sua viagem e salve as alterações'
              : t('tripCreator.subtitle', 'Planeje sua próxima aventura, defina destinos e organize seu roteiro')
            }
          </p>
        </div>
        
        <Button variant="outline" onClick={() => navigate('/trips')}>
          {t('common.cancel', 'Cancelar')}
        </Button>
      </div>
      
      <Tabs defaultValue="single-destination-wizard" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="single-destination-wizard">
            <div className="flex flex-col items-center sm:flex-row sm:items-center">
              <Plane className="h-4 w-4 mr-2" />
              <span>Destino Único (Wizard)</span>
            </div>
          </TabsTrigger>
          <TabsTrigger value="single-destination">
            <div className="flex flex-col items-center sm:flex-row sm:items-center">
              <Globe className="h-4 w-4 mr-2" />
              <span>Destino Único (Formulário)</span>
            </div>
          </TabsTrigger>
          <TabsTrigger value="multi-destination">
            <div className="flex flex-col items-center sm:flex-row sm:items-center">
              <Map className="h-4 w-4 mr-2" />
              <span>Multi-Destino</span>
            </div>
          </TabsTrigger>
        </TabsList>
        
        {/* Nova opção: Wizard de destino único */}
        <TabsContent value="single-destination-wizard">
          <SingleDestinationWizard 
            onComplete={(completedData) => {
              // Converter os dados do wizard para o formato esperado pela API
              const processedData = {
                name: completedData.name,
                description: '',
                destination: completedData.destination?.city || '',
                country: completedData.destination?.country || '',
                startDate: completedData.startDate,
                endDate: completedData.endDate,
                tripType: completedData.tripType || 'tourist',
                travelers: completedData.travelers,
                budget: completedData.budgetValue.toString(),
                currency: completedData.currency,
                isPublic: completedData.isPublic,
                notes: '',
                isMultiDestination: false,
                interests: completedData.interests || [],
                // Adicionar os resultados da simulação para salvar no banco
                simulationResult: completedData.simulationResult,
                // Definir status como criado com o wizard
                status: 'created'
              };
              
              // Executar a mutação de criação da viagem
              tripMutation.mutate(processedData);
            }}
            initialData={isEditMode && formData ? {
              name: formData.name,
              destination: formData.destination && formData.country ? { 
                city: formData.destination, 
                country: formData.country 
              } : null,
              startDate: formData.startDate,
              endDate: formData.endDate,
              tripType: formData.tripType,
              travelers: formData.travelers,
              budgetValue: parseFloat(formData.budget || '0'),
              currency: formData.currency,
              isPublic: formData.isPublic
            } : undefined}
            isEditMode={isEditMode}
          />
        </TabsContent>
        
        {/* Formulário tradicional de destino único */}
        <TabsContent value="single-destination">
          <Card>
            <form onSubmit={handleSubmit}>
              <CardHeader>
                <CardTitle>{t('tripCreator.basicInfo', 'Informações Básicas')}</CardTitle>
                <CardDescription>
                  {t('tripCreator.basicInfoDesc', 'Defina as informações principais da sua viagem')}
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">{t('tripCreator.tripName', 'Nome da Viagem')} *</Label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder={t('tripCreator.tripNamePlaceholder', 'Ex: Férias na Praia')}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="tripType">{t('tripCreator.tripType', 'Tipo de Viagem')} *</Label>
                    <Select 
                      value={formData.tripType} 
                      onValueChange={(value) => handleSelectChange('tripType', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={t('tripCreator.selectTripType', 'Selecione o tipo de viagem')} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="tourist">
                          <div className="flex items-center">
                            <Palmtree className="h-4 w-4 mr-2" />
                            {t('tripCreator.tourist', 'Turismo')}
                          </div>
                        </SelectItem>
                        <SelectItem value="nomad">
                          <div className="flex items-center">
                            <Globe className="h-4 w-4 mr-2" />
                            {t('tripCreator.nomad', 'Nômade Digital')}
                          </div>
                        </SelectItem>
                        <SelectItem value="business">
                          <div className="flex items-center">
                            <Briefcase className="h-4 w-4 mr-2" />
                            {t('tripCreator.business', 'Negócios')}
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="destination">{t('tripCreator.destination', 'Destino')} *</Label>
                  <DestinationAutocomplete
                    value={formData.destination && formData.country ? { city: formData.destination, country: formData.country } : null}
                    onChange={(selectedDestination: { city: string; country: string }) => {
                      setFormData((prev) => ({
                        ...prev,
                        destination: selectedDestination.city,
                        country: selectedDestination.country
                      }));
                    }}
                    placeholder={t('tripCreator.selectDestination', 'Selecione cidade e país')}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="startDate">{t('tripCreator.startDate', 'Data de Início')} *</Label>
                    <div className="flex items-center">
                      <CalendarIcon className="mr-2 h-4 w-4 opacity-50" />
                      <Input
                        id="startDate"
                        name="startDate"
                        type="date"
                        value={formData.startDate}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="endDate">{t('tripCreator.endDate', 'Data de Término')} *</Label>
                    <div className="flex items-center">
                      <CalendarIcon className="mr-2 h-4 w-4 opacity-50" />
                      <Input
                        id="endDate"
                        name="endDate"
                        type="date"
                        value={formData.endDate}
                        onChange={handleInputChange}
                        min={formData.startDate}
                        required
                      />
                    </div>
                  </div>
                </div>
                
                <Separator />
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="travelers">{t('tripCreator.travelers', 'Número de Viajantes')}</Label>
                    <Input
                      id="travelers"
                      name="travelers"
                      type="number"
                      min="1"
                      value={formData.travelers}
                      onChange={handleInputChange}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="budget">{t('tripCreator.budget', 'Orçamento')}</Label>
                    <Input
                      id="budget"
                      name="budget"
                      type="number"
                      min="0"
                      value={formData.budget}
                      onChange={handleInputChange}
                      placeholder="0.00"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="currency">{t('tripCreator.currency', 'Moeda')}</Label>
                    <Select 
                      value={formData.currency} 
                      onValueChange={(value) => handleSelectChange('currency', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="BRL">BRL (R$)</SelectItem>
                        <SelectItem value="USD">USD ($)</SelectItem>
                        <SelectItem value="EUR">EUR (€)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">{t('tripCreator.description', 'Descrição')}</Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder={t('tripCreator.descriptionPlaceholder', 'Adicione detalhes sobre sua viagem...')}
                    rows={4}
                  />
                </div>
                
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="isPublic"
                    name="isPublic"
                    checked={formData.isPublic}
                    onChange={handleCheckboxChange}
                    className="rounded border-gray-300"
                  />
                  <Label htmlFor="isPublic" className="font-normal">
                    {t('tripCreator.makePublic', 'Tornar esta viagem pública para outros usuários')}
                  </Label>
                </div>
              </CardContent>
              
              <CardFooter className="flex justify-between">
                <Button variant="outline" type="button" onClick={() => navigate('/trips')}>
                  {t('common.cancel', 'Cancelar')}
                </Button>
                <Button 
                  type="button" 
                  disabled={tripMutation.isPending || !formData.destination || !formData.country || !formData.startDate || !formData.endDate}
                  onClick={(e) => {
                    e.preventDefault();
                    setShowPriceSummary(true);
                  }}
                  className="mr-2"
                >
                  {t('tripCreator.showPrices', 'Ver custos estimados')}
                </Button>
                <Button type="submit" disabled={tripMutation.isPending}>
                  {tripMutation.isPending ? (
                    <span className="flex items-center">
                      <span className="animate-spin h-4 w-4 mr-2 border-2 border-b-transparent rounded-full"></span>
                      {isEditMode ? 'Atualizando...' : t('common.creating', 'Criando...')}
                    </span>
                  ) : (
                    isEditMode ? 'Salvar Alterações' : t('tripCreator.createTrip', 'Criar Viagem')
                  )}
                </Button>
              </CardFooter>
            </form>
          </Card>
          
          {showPriceSummary && formData.destination && formData.country && formData.startDate && formData.endDate && (
            <div className="mt-6">
              <TripPriceSummary
                destination={formData.destination}
                country={formData.country}
                startDate={formatDate(formData.startDate)}
                endDate={formatDate(formData.endDate)}
                onContinue={() => setShowPriceSummary(false)}
              />
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="multi-destination">
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>{t('tripCreator.multiDestTitle', 'Crie um Roteiro Multi-Destino')}</CardTitle>
              <CardDescription>
                {t('tripCreator.multiDestDesc', 'Adicione múltiplos destinos ao seu roteiro e organize-os na ordem desejada')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="space-y-2">
                  <Label htmlFor="multi-name">{t('tripCreator.tripName', 'Nome da Viagem')} *</Label>
                  <Input
                    id="multi-name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder={t('tripCreator.tripNamePlaceholder', 'Ex: Tour pela Europa')}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="multi-tripType">{t('tripCreator.tripType', 'Tipo de Viagem')} *</Label>
                  <Select 
                    value={formData.tripType} 
                    onValueChange={(value) => handleSelectChange('tripType', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t('tripCreator.selectTripType', 'Selecione o tipo de viagem')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="tourist">
                        <div className="flex items-center">
                          <Palmtree className="h-4 w-4 mr-2" />
                          {t('tripCreator.tourist', 'Turismo')}
                        </div>
                      </SelectItem>
                      <SelectItem value="nomad">
                        <div className="flex items-center">
                          <Globe className="h-4 w-4 mr-2" />
                          {t('tripCreator.nomad', 'Nômade Digital')}
                        </div>
                      </SelectItem>
                      <SelectItem value="business">
                        <div className="flex items-center">
                          <Briefcase className="h-4 w-4 mr-2" />
                          {t('tripCreator.business', 'Negócios')}
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="multi-budget">{t('tripCreator.budget', 'Orçamento')}</Label>
                  <Input
                    id="multi-budget"
                    name="budget"
                    type="number"
                    min="0"
                    value={formData.budget}
                    onChange={handleInputChange}
                    placeholder="0.00"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="multi-currency">{t('tripCreator.currency', 'Moeda')}</Label>
                  <Select 
                    value={formData.currency} 
                    onValueChange={(value) => handleSelectChange('currency', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="BRL">BRL (R$)</SelectItem>
                      <SelectItem value="USD">USD ($)</SelectItem>
                      <SelectItem value="EUR">EUR (€)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="multi-travelers">{t('tripCreator.travelers', 'Número de Viajantes')}</Label>
                  <Input
                    id="multi-travelers"
                    name="travelers"
                    type="number"
                    min="1"
                    value={formData.travelers}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              
              <div className="mt-4">
                <div className="flex items-center space-x-2 mt-4">
                  <input
                    type="checkbox"
                    id="multi-isPublic"
                    name="isPublic"
                    checked={formData.isPublic}
                    onChange={handleCheckboxChange}
                    className="rounded border-gray-300"
                  />
                  <Label htmlFor="multi-isPublic" className="font-normal">
                    {t('tripCreator.makePublic', 'Tornar esta viagem pública para outros usuários')}
                  </Label>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <MultiDestinationBuilder
            initialDestinations={destinations}
            onSave={handleDestinationsUpdate}
          />
          
          <div className="flex justify-end mt-6 space-x-3">
            <Button 
              variant="outline"
              onClick={() => setShowPriceSummary(true)}
              disabled={destinations.length === 0}
            >
              <span className="flex items-center">
                <Wallet className="h-5 w-5 mr-2" />
                {t('tripCreator.showPrices', 'Ver custos estimados')}
              </span>
            </Button>
            
            <Button 
              onClick={handleSubmit} 
              disabled={tripMutation.isPending || destinations.length === 0}
              size="lg"
            >
              {tripMutation.isPending ? (
                <span className="flex items-center">
                  <span className="animate-spin h-4 w-4 mr-2 border-2 border-b-transparent rounded-full"></span>
                  {isEditMode ? 'Atualizando...' : t('common.creating', 'Criando...')}
                </span>
              ) : (
                <span className="flex items-center">
                  <CheckCircle className="h-5 w-5 mr-2" />
                  {isEditMode ? 'Salvar Alterações' : t('tripCreator.startPlanning', 'Começar a Planejar')}
                </span>
              )}
            </Button>
          </div>
          
          {showPriceSummary && destinations.length > 0 && (
            <div className="mt-6">
              <TripPriceSummary
                destination={destinations[0].city}
                country={destinations[0].country}
                startDate={formatDate(destinations[0].arrivalDate)}
                endDate={formatDate(destinations[destinations.length - 1].departureDate)}
                onContinue={() => setShowPriceSummary(false)}
              />
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}