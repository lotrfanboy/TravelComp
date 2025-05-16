import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle,
  CardFooter
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { DestinationAutocomplete } from '@/components/trips/DestinationAutocomplete';
import {
  CalendarIcon, 
  CheckCircle, 
  Users,
  DollarSign,
  Plane,
  Globe,
  Tag,
  Image,
  ChevronLeft,
  ChevronRight,
  Loader2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

type CostSimulationResponse = {
  flightOptions: any[];
  hotelOptions: any[];
  attractions: any[];
  totalEstimate: number;
  currency: string;
};

interface SingleDestinationWizardProps {
  onComplete: (tripData: any) => void;
  initialData?: any;
  isEditMode?: boolean;
}

const SingleDestinationWizard: React.FC<SingleDestinationWizardProps> = ({
  onComplete,
  initialData = {},
  isEditMode = false
}) => {
  const { t } = useTranslation();
  const { toast } = useToast();
  
  // Estados
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [simulationResult, setSimulationResult] = useState<CostSimulationResponse | null>(null);
  
  // Definição de interesses disponíveis
  const availableInterests = [
    { id: 'culture', label: 'Cultura', icon: '🏛️' },
    { id: 'nature', label: 'Natureza', icon: '🌳' },
    { id: 'nightlife', label: 'Vida Noturna', icon: '🌃' },
    { id: 'food', label: 'Gastronomia', icon: '🍽️' },
    { id: 'adventure', label: 'Aventura', icon: '🧗' },
    { id: 'wellness', label: 'Bem-estar', icon: '💆' },
    { id: 'shopping', label: 'Compras', icon: '🛍️' },
    { id: 'events', label: 'Eventos', icon: '🎭' }
  ];
  
  // Moedas disponíveis
  const availableCurrencies = [
    { code: 'BRL', symbol: 'R$', name: 'Real Brasileiro' },
    { code: 'USD', symbol: '$', name: 'Dólar Americano' },
    { code: 'EUR', symbol: '€', name: 'Euro' },
    { code: 'GBP', symbol: '£', name: 'Libra Esterlina' }
  ];
  
  // Dados do formulário
  const [formData, setFormData] = useState({
    name: initialData.name || '',
    origin: initialData.origin || null,
    destination: initialData.destination || null,
    startDate: initialData.startDate || '',
    endDate: initialData.endDate || '',
    travelers: initialData.travelers || 1,
    budgetScale: initialData.budgetScale || 'Medium', // 'Cheap', 'Medium', 'Expensive'
    budgetValue: initialData.budgetValue || 2000,
    currency: initialData.currency || 'BRL',
    interests: initialData.interests || [],
    isPublic: initialData.isPublic || false,
    coverImage: initialData.coverImage || null,
    tripType: initialData.tripType || 'tourist',
  });
  
  // Validação de etapas
  const validateStep = (currentStep: number) => {
    switch(currentStep) {
      case 1:
        return formData.name && 
               formData.destination && 
               formData.startDate && 
               formData.endDate &&
               formData.travelers > 0;
      case 2:
        return formData.budgetValue > 0 && formData.currency;
      case 3:
        return formData.interests.length > 0;
      case 4:
        return true; // Todas as opções são opcionais nesta etapa
      default:
        return true;
    }
  };
  
  // Avançar para próxima etapa
  const nextStep = () => {
    if (validateStep(step)) {
      setStep(step + 1);
      window.scrollTo(0, 0);
    } else {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha todos os campos obrigatórios para continuar.",
        variant: "destructive"
      });
    }
  };
  
  // Voltar para etapa anterior
  const prevStep = () => {
    setStep(Math.max(1, step - 1));
    window.scrollTo(0, 0);
  };
  
  // Manipuladores de entrada de dados
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'number') {
      setFormData({
        ...formData,
        [name]: parseInt(value) || 0
      });
    } else if (type === 'checkbox') {
      setFormData({
        ...formData,
        [name]: (e.target as HTMLInputElement).checked
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };
  
  // Toggle para interesses
  const toggleInterest = (interestId: string) => {
    if (formData.interests.includes(interestId)) {
      setFormData({
        ...formData,
        interests: formData.interests.filter(id => id !== interestId)
      });
    } else {
      setFormData({
        ...formData,
        interests: [...formData.interests, interestId]
      });
    }
  };
  
  // Simulação de custo de viagem
  const calculateTripCost = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/trip/cost-simulation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          origin: formData.origin || 'São Paulo',
          originCountry: 'Brasil',
          destination: typeof formData.destination === 'object' ? formData.destination.city : formData.destination || 'São Paulo',
          destinationCountry: typeof formData.destination === 'object' ? formData.destination.country : 'Brasil',
          departureDate: formData.startDate,
          returnDate: formData.endDate,
          budget: formData.budgetValue || 0,
          interests: formData.interests
        }),
      });
      
      if (!response.ok) {
        throw new Error('Erro ao calcular estimativa de viagem');
      }
      
      const result = await response.json();
      console.log("Resultado da simulação:", result);
      setSimulationResult(result);
      
      // Não avançamos para etapa 5, vamos diretamente enviar os dados
      // para criar a viagem e redirecionar para a página de detalhes
      
      // Atualizar o valor do orçamento com base na simulação para salvar
      let updatedFormData = {...formData};
      if (result && result.totalEstimate) {
        const newBudgetValue = Math.ceil(result.totalEstimate * 1.1); // 10% acima da estimativa
        updatedFormData = {
          ...updatedFormData,
          budgetValue: newBudgetValue
        };
      }
      
      // Enviar os dados para criar a viagem e redirecionar para a página de detalhes
      onComplete({
        ...updatedFormData,
        simulationResult: result
      });
    } catch (error) {
      console.error('Erro na simulação:', error);
      toast({
        title: "Erro na simulação",
        description: "Não foi possível calcular a estimativa da viagem. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Renderização das etapas
  const renderStep = () => {
    switch(step) {
      case 1:
        return renderBasicInfo();
      case 2:
        return renderBudgetCurrency();
      case 3:
        return renderInterests();
      case 4:
        return renderExtras();
      case 5:
        return renderReview();
      default:
        return renderBasicInfo();
    }
  };
  
  // Etapa 1: Informações Básicas
  const renderBasicInfo = () => {
    return (
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="name">Nome da Viagem *</Label>
          <Input
            id="name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            placeholder="Ex: Férias em Paris"
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="origin">Origem</Label>
          <DestinationAutocomplete
            value={formData.origin}
            onChange={(value) => setFormData({ ...formData, origin: value })}
            placeholder="Cidade, País de origem"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="destination">Destino *</Label>
          <DestinationAutocomplete
            value={formData.destination}
            onChange={(value) => setFormData({ ...formData, destination: value })}
            placeholder="Cidade, País de destino"
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="startDate">Data de Ida *</Label>
            <div className="flex items-center">
              <CalendarIcon className="mr-2 h-4 w-4 opacity-50" />
              <Input
                id="startDate"
                name="startDate"
                type="date"
                value={formData.startDate}
                onChange={handleInputChange}
                min={new Date().toISOString().split('T')[0]}
                required
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="endDate">Data de Volta *</Label>
            <div className="flex items-center">
              <CalendarIcon className="mr-2 h-4 w-4 opacity-50" />
              <Input
                id="endDate"
                name="endDate"
                type="date"
                value={formData.endDate}
                onChange={handleInputChange}
                min={formData.startDate || new Date().toISOString().split('T')[0]}
                required
              />
              {formData.endDate && formData.startDate && new Date(formData.endDate) < new Date(formData.startDate) && (
                <span className="text-red-500 text-xs ml-2">A data de volta deve ser depois da ida</span>
              )}
            </div>
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="travelers">Número de Viajantes *</Label>
          <div className="flex items-center">
            <Users className="mr-2 h-4 w-4 opacity-50" />
            <Input
              id="travelers"
              name="travelers"
              type="number"
              min={1}
              max={20}
              value={formData.travelers}
              onChange={handleInputChange}
              required
            />
          </div>
        </div>
      </CardContent>
    );
  };
  
  // Etapa 2: Orçamento e Moeda
  const renderBudgetCurrency = () => {
    const getBudgetLabel = () => {
      const { budgetScale } = formData;
      return budgetScale === 'Cheap' ? 'Econômico' :
             budgetScale === 'Medium' ? 'Intermediário' : 'Premium';
    };
    
    const getSliderValue = () => {
      const { budgetScale } = formData;
      return budgetScale === 'Cheap' ? 25 :
             budgetScale === 'Medium' ? 50 : 75;
    };
    
    const setBudgetFromSlider = (value: number) => {
      let scale = 'Medium';
      if (value <= 33) {
        scale = 'Cheap';
      } else if (value <= 66) {
        scale = 'Medium';
      } else {
        scale = 'Expensive';
      }
      
      setFormData({
        ...formData,
        budgetScale: scale
      });
    };
    
    const currencySymbol = availableCurrencies.find(c => c.code === formData.currency)?.symbol || 'R$';
    
    return (
      <CardContent className="space-y-8">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Nível de Orçamento</Label>
            <Badge variant="outline" className="text-lg font-medium">{getBudgetLabel()}</Badge>
          </div>
          
          <div className="py-4">
            <Slider
              value={[getSliderValue()]}
              min={0}
              max={100}
              step={1}
              onValueChange={(values) => setBudgetFromSlider(values[0])}
              className="py-2"
            />
            <div className="flex justify-between mt-2 text-sm text-gray-500">
              <span>Econômico</span>
              <span>Intermediário</span>
              <span>Premium</span>
            </div>
          </div>
        </div>
        
        <Separator />
        
        <div className="space-y-4">
          <Label>Valor de Orçamento Aproximado</Label>
          <div className="flex items-center space-x-4">
            <DollarSign className="h-5 w-5 text-gray-400" />
            <Input
              id="budgetValue"
              name="budgetValue"
              type="number"
              min={1}
              value={formData.budgetValue}
              onChange={handleInputChange}
              className="flex-1"
            />
            <select
              value={formData.currency}
              onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
              className="h-10 rounded-md border border-input px-3 py-2 bg-background text-sm"
            >
              {availableCurrencies.map((currency) => (
                <option key={currency.code} value={currency.code}>
                  {currency.code} ({currency.symbol})
                </option>
              ))}
            </select>
          </div>
          <p className="text-sm text-gray-500">
            Este valor é aproximado e será usado para recomendar opções compatíveis com seu orçamento
          </p>
        </div>
      </CardContent>
    );
  };
  
  // Etapa 3: Interesses e Tags
  const renderInterests = () => {
    return (
      <CardContent className="space-y-6">
        <div>
          <Label className="text-base mb-4 block">Selecione seus interesses para esta viagem *</Label>
          <p className="text-sm text-gray-500 mb-4">
            Estes interesses nos ajudarão a personalizar recomendações para sua viagem
          </p>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mt-4">
            {availableInterests.map((interest) => (
              <div
                key={interest.id}
                onClick={() => toggleInterest(interest.id)}
                className={`
                  flex items-center px-4 py-3 rounded-lg border cursor-pointer transition-colors
                  ${formData.interests.includes(interest.id)
                    ? 'bg-primary/10 border-primary'
                    : 'bg-background hover:bg-muted/50 border-border'
                  }
                `}
              >
                <span className="text-xl mr-2">{interest.icon}</span>
                <span className="text-sm font-medium flex-1">{interest.label}</span>
                {formData.interests.includes(interest.id) && (
                  <CheckCircle className="h-4 w-4 text-primary" />
                )}
              </div>
            ))}
          </div>
        </div>
        
        <div className="mt-2">
          <p className="text-sm text-gray-500">
            {formData.interests.length === 0 ? (
              'Selecione pelo menos um interesse'
            ) : (
              `${formData.interests.length} interesse(s) selecionado(s)`
            )}
          </p>
        </div>
      </CardContent>
    );
  };
  
  // Etapa 4: Extras
  const renderExtras = () => {
    return (
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="isPublic">Viagem Pública</Label>
            <p className="text-sm text-gray-500">
              Permitir que outros usuários vejam esta viagem
            </p>
          </div>
          <Switch
            id="isPublic"
            name="isPublic"
            checked={formData.isPublic}
            onCheckedChange={(checked) => setFormData({ ...formData, isPublic: checked })}
          />
        </div>
        
        <Separator />
        
        <div className="space-y-2">
          <Label htmlFor="coverImage">Imagem de Capa (opcional)</Label>
          <div className="mt-2">
            <div className="flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg h-32 bg-gray-50">
              <div className="text-center">
                <Image className="mx-auto h-8 w-8 text-gray-400" />
                <div className="mt-1 text-sm text-gray-500">
                  {formData.coverImage ? (
                    <span>Imagem selecionada</span>
                  ) : (
                    <span>Upload de imagem</span>
                  )}
                </div>
                <div className="mt-2">
                  <label
                    htmlFor="file-upload"
                    className="rounded-md bg-white px-3 py-1 text-sm font-medium text-primary shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                  >
                    Escolher arquivo
                  </label>
                  <input
                    id="file-upload"
                    name="file-upload"
                    type="file"
                    className="sr-only"
                    // Implementação futura do upload de imagem
                  />
                </div>
              </div>
            </div>
          </div>
          <p className="text-xs text-gray-500">
            Selecione uma imagem para personalizar sua viagem (funcionará em uma atualização futura)
          </p>
        </div>
      </CardContent>
    );
  };
  
  // Etapa 5: Revisão e Cálculo
  const renderReview = () => {
    // Calcular duração da viagem
    const startDate = formData.startDate ? new Date(formData.startDate) : null;
    const endDate = formData.endDate ? new Date(formData.endDate) : null;
    const duration = startDate && endDate
      ? Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
      : 0;
    
    const formatDate = (dateString: string) => {
      if (!dateString) return '';
      const date = new Date(dateString);
      return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
    };
    
    // Interesses selecionados
    const selectedInterests = formData.interests.map(id => {
      const interest = availableInterests.find(i => i.id === id);
      return interest ? interest.label : '';
    }).join(', ');
    
    return (
      <CardContent className="space-y-6">
        <h3 className="text-lg font-medium">Resumo da Viagem</h3>
        
        <div className="rounded-lg border p-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="text-sm font-medium text-gray-500">Nome da Viagem</h4>
              <p className="text-base">{formData.name}</p>
            </div>
            
            <div>
              <h4 className="text-sm font-medium text-gray-500">Destino</h4>
              <p className="text-base">
                {formData.destination ? `${formData.destination.city}, ${formData.destination.country}` : '-'}
              </p>
            </div>
            
            <div>
              <h4 className="text-sm font-medium text-gray-500">Período</h4>
              <p className="text-base">
                {formatDate(formData.startDate)} a {formatDate(formData.endDate)}
                {duration > 0 && ` (${duration} dias)`}
              </p>
            </div>
            
            <div>
              <h4 className="text-sm font-medium text-gray-500">Viajantes</h4>
              <p className="text-base">{formData.travelers} pessoa(s)</p>
            </div>
            
            <div>
              <h4 className="text-sm font-medium text-gray-500">Nível de Orçamento</h4>
              <p className="text-base">
                {formData.budgetScale === 'Cheap' ? 'Econômico' :
                 formData.budgetScale === 'Medium' ? 'Intermediário' : 'Premium'}
              </p>
            </div>
            
            <div>
              <h4 className="text-sm font-medium text-gray-500">Orçamento Aproximado</h4>
              <p className="text-base">
                {availableCurrencies.find(c => c.code === formData.currency)?.symbol} 
                {formData.budgetValue.toLocaleString()}
              </p>
            </div>
          </div>
          
          <div>
            <h4 className="text-sm font-medium text-gray-500">Interesses</h4>
            <p className="text-base">{selectedInterests || '-'}</p>
          </div>
          
          <div>
            <h4 className="text-sm font-medium text-gray-500">Configurações</h4>
            <p className="text-base">
              Viagem {formData.isPublic ? 'pública' : 'privada'}
            </p>
          </div>
        </div>
        
        {simulationResult ? (
          <div className="rounded-lg border p-4 space-y-4 bg-primary/5">
            <h3 className="text-lg font-medium">Estimativa de Custos</h3>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span>Voos</span>
                <span className="font-medium">
                  {simulationResult.flightOptions.length > 0 
                    ? `a partir de ${simulationResult.currency} ${simulationResult.flightOptions[0].price.toLocaleString()}`
                    : 'Não disponível'
                  }
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span>Hospedagem</span>
                <span className="font-medium">
                  {simulationResult.hotelOptions.length > 0 
                    ? `a partir de ${simulationResult.currency} ${simulationResult.hotelOptions[0].pricePerNight.toLocaleString()} por noite`
                    : 'Não disponível'
                  }
                </span>
              </div>
              
              <Separator />
              
              <div className="flex justify-between items-center">
                <span className="font-medium">Estimativa Total</span>
                <span className="text-lg font-bold">
                  {simulationResult.currency} {simulationResult.totalEstimate.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        ) : null}
      </CardContent>
    );
  };
  
  // Renderização dos botões de navegação
  const renderNavButtons = () => {
    return (
      <CardFooter className="flex justify-between pt-6">
        {step > 1 && (
          <Button
            variant="outline"
            onClick={prevStep}
            className="flex items-center"
          >
            <ChevronLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>
        )}
        
        {step < 5 && (
          <Button
            onClick={nextStep}
            className="ml-auto flex items-center"
            disabled={!validateStep(step)}
          >
            Próximo
            <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        )}
        
        {step === 5 && (
          <Button
            onClick={calculateTripCost}
            className="ml-auto flex items-center bg-[#19B4B0] hover:bg-[#0ea19d] text-white"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Calculando e Criando Viagem...
              </>
            ) : (
              <>
                Calcular Viagem
              </>
            )}
          </Button>
        )}
      </CardFooter>
    );
  };
  
  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-center mb-2">
          <CardTitle>
            {isEditMode ? 'Editar Viagem' : 'Nova Viagem'}
          </CardTitle>
          <Badge variant="outline" className="font-normal">
            Etapa {step} de 5
          </Badge>
        </div>
        <CardDescription>
          {step === 1 && 'Forneça as informações básicas da sua viagem'}
          {step === 2 && 'Configure seu orçamento e moeda preferida'}
          {step === 3 && 'Selecione seus interesses para esta viagem'}
          {step === 4 && 'Defina opções adicionais para sua viagem'}
          {step === 5 && 'Revise os detalhes e calcule o custo estimado'}
        </CardDescription>
        
        {/* Indicador de progresso */}
        <div className="w-full mt-4 h-1.5 bg-gray-200 rounded-full overflow-hidden">
          <div 
            className="h-full bg-primary transition-all duration-300 ease-in-out"
            style={{ width: `${(step / 5) * 100}%` }}
          />
        </div>
      </CardHeader>
      
      {renderStep()}
      {renderNavButtons()}
    </Card>
  );
};

export default SingleDestinationWizard;