import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { 
  Calendar,
  CalendarIcon, 
  Map, 
  Plane,
  Train,
  Bus,
  Car,
  Plus,
  Trash2,
  ArrowDown,
  ArrowUp,
  Flag
} from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { 
  DragDropContext, 
  Droppable, 
  Draggable, 
  DropResult 
} from 'react-beautiful-dnd';
import { formatDate } from '@/lib/utils';

interface Destination {
  id: string;
  name: string;
  city: string;
  country: string;
  arrivalDate: Date;
  departureDate: Date;
  transportType: 'plane' | 'train' | 'bus' | 'car' | '';
}

interface MultiDestinationBuilderProps {
  onSave: (destinations: Destination[]) => void;
  initialDestinations?: Destination[];
  isEditMode?: boolean;
}

export function MultiDestinationBuilder({ 
  onSave, 
  initialDestinations = [], 
  isEditMode = false 
}: MultiDestinationBuilderProps) {
  const { t } = useTranslation();
  const [destinations, setDestinations] = useState<Destination[]>(
    initialDestinations.length > 0 
      ? initialDestinations 
      : [createEmptyDestination()]
  );
  const [selectedDestinationIndex, setSelectedDestinationIndex] = useState(0);
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);

  // Consulta para obter dados de países e cidades (poderá ser implementado depois)
  const { data: countryData } = useQuery({
    queryKey: ['/api/countries'],
    enabled: false // Desabilita a consulta por enquanto
  });

  function createEmptyDestination(): Destination {
    return {
      id: `destination-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: '',
      city: '',
      country: '',
      arrivalDate: new Date(),
      departureDate: new Date(new Date().setDate(new Date().getDate() + 3)),
      transportType: ''
    };
  }

  function addDestination() {
    const lastDestination = destinations[destinations.length - 1];
    const nextArrivalDate = lastDestination 
      ? new Date(lastDestination.departureDate)
      : new Date();
    const nextDepartureDate = new Date(nextArrivalDate);
    nextDepartureDate.setDate(nextArrivalDate.getDate() + 3);

    const newDestination = {
      ...createEmptyDestination(),
      arrivalDate: nextArrivalDate,
      departureDate: nextDepartureDate
    };

    setDestinations([...destinations, newDestination]);
    setSelectedDestinationIndex(destinations.length);
  }

  function removeDestination(index: number) {
    if (destinations.length <= 1) {
      return; // Sempre manter pelo menos um destino
    }

    const newDestinations = [...destinations];
    newDestinations.splice(index, 1);
    setDestinations(newDestinations);

    if (selectedDestinationIndex >= newDestinations.length) {
      setSelectedDestinationIndex(newDestinations.length - 1);
    }
  }

  function handleDestinationChange(index: number, field: keyof Destination, value: string | Date) {
    const newDestinations = [...destinations];
    newDestinations[index] = {
      ...newDestinations[index],
      [field]: value
    };

    // Se mudou a data de partida, atualizar a data de chegada do próximo destino
    if (field === 'departureDate' && index < destinations.length - 1) {
      newDestinations[index + 1] = {
        ...newDestinations[index + 1],
        arrivalDate: value
      };
    }

    setDestinations(newDestinations);
  }

  function handleDragEnd(result: DropResult) {
    if (!result.destination) return;

    const items = [...destinations];
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    // Reajustar as datas para manter a sequência lógica
    for (let i = 1; i < items.length; i++) {
      if (new Date(items[i].arrivalDate) < new Date(items[i-1].departureDate)) {
        items[i].arrivalDate = items[i-1].departureDate;
        
        // Garantir que a data de partida seja depois da chegada
        const departureDate = new Date(items[i].arrivalDate);
        departureDate.setDate(departureDate.getDate() + 3);
        items[i].departureDate = departureDate;
      }
    }

    setDestinations(items);
    setSelectedDestinationIndex(result.destination.index);
  }

  function handleSave() {
    onSave(destinations);
  }

  function renderTransportIcon(type: string) {
    switch(type) {
      case 'plane': return <Plane className="h-5 w-5" />;
      case 'train': return <Train className="h-5 w-5" />;
      case 'bus': return <Bus className="h-5 w-5" />;
      case 'car': return <Car className="h-5 w-5" />;
      default: return <Plane className="h-5 w-5" />;
    }
  }

  return (
    <div className="w-full">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">
            {t('tripBuilder.multiDestination', 'Roteiro Multi-Destino')}
          </CardTitle>
          <CardDescription>
            {t('tripBuilder.createMultiDestinationDesc', 'Crie seu roteiro com múltiplos destinos, defina as datas e meios de transporte entre cada cidade.')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-6">
            {/* Sidebar com lista de destinos */}
            <div className="w-full md:w-1/3">
              <h3 className="font-medium text-lg mb-4">{t('tripBuilder.destinations', 'Destinos')}</h3>
              
              <DragDropContext onDragEnd={handleDragEnd}>
                <Droppable droppableId="destinations">
                  {(provided) => (
                    <div
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      className="space-y-2 mb-4"
                    >
                      {destinations.map((destination, index) => (
                        <Draggable 
                          key={destination.id} 
                          draggableId={destination.id} 
                          index={index}
                        >
                          {(provided) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className={`p-4 border rounded-lg flex items-center justify-between ${
                                selectedDestinationIndex === index 
                                  ? 'bg-primary/10 border-primary' 
                                  : 'bg-white'
                              }`}
                              onClick={() => setSelectedDestinationIndex(index)}
                            >
                              <div className="flex items-center gap-3">
                                <Flag className="h-5 w-5 text-primary" />
                                <div>
                                  <p className="font-medium">
                                    {destination.city || destination.country || t('tripBuilder.newDestination', 'Novo Destino')}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    {formatDate(destination.arrivalDate)} - {formatDate(destination.departureDate)}
                                  </p>
                                </div>
                              </div>
                              
                              {index > 0 && destination.transportType && (
                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                  {renderTransportIcon(destination.transportType)}
                                </div>
                              )}
                              
                              <div>
                                <Button 
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    removeDestination(index);
                                  }}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </DragDropContext>
              
              <Button 
                onClick={addDestination} 
                className="w-full flex items-center justify-center gap-2"
              >
                <Plus className="h-4 w-4" />
                {t('tripBuilder.addDestination', 'Adicionar Destino')}
              </Button>
            </div>
            
            {/* Formulário de detalhes do destino */}
            <div className="w-full md:w-2/3">
              {destinations[selectedDestinationIndex] && (
                <div className="space-y-4">
                  <h3 className="font-medium text-lg">
                    {t('tripBuilder.destinationDetails', 'Detalhes do Destino')}
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="destinationName">
                        {t('tripBuilder.destinationName', 'Nome do Destino')}
                      </Label>
                      <Input
                        id="destinationName"
                        value={destinations[selectedDestinationIndex].name}
                        onChange={(e) => handleDestinationChange(
                          selectedDestinationIndex, 
                          'name', 
                          e.target.value
                        )}
                        placeholder={t('tripBuilder.enterDestinationName', 'Ex: Férias em Paris')}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="country">
                        {t('tripBuilder.country', 'País')}
                      </Label>
                      <Input
                        id="country"
                        value={destinations[selectedDestinationIndex].country}
                        onChange={(e) => handleDestinationChange(
                          selectedDestinationIndex, 
                          'country', 
                          e.target.value
                        )}
                        placeholder={t('tripBuilder.enterCountry', 'Ex: França')}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="city">
                        {t('tripBuilder.city', 'Cidade')}
                      </Label>
                      <Input
                        id="city"
                        value={destinations[selectedDestinationIndex].city}
                        onChange={(e) => handleDestinationChange(
                          selectedDestinationIndex, 
                          'city', 
                          e.target.value
                        )}
                        placeholder={t('tripBuilder.enterCity', 'Ex: Paris')}
                      />
                    </div>
                    
                    {selectedDestinationIndex > 0 && (
                      <div className="space-y-2">
                        <Label htmlFor="transportType">
                          {t('tripBuilder.transportType', 'Meio de Transporte')}
                        </Label>
                        <Select
                          value={destinations[selectedDestinationIndex].transportType}
                          onValueChange={(value) => handleDestinationChange(
                            selectedDestinationIndex, 
                            'transportType', 
                            value
                          )}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder={t('tripBuilder.selectTransport', 'Selecione o transporte')} />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="plane">
                              <div className="flex items-center gap-2">
                                <Plane className="h-4 w-4" />
                                {t('tripBuilder.plane', 'Avião')}
                              </div>
                            </SelectItem>
                            <SelectItem value="train">
                              <div className="flex items-center gap-2">
                                <Train className="h-4 w-4" />
                                {t('tripBuilder.train', 'Trem')}
                              </div>
                            </SelectItem>
                            <SelectItem value="bus">
                              <div className="flex items-center gap-2">
                                <Bus className="h-4 w-4" />
                                {t('tripBuilder.bus', 'Ônibus')}
                              </div>
                            </SelectItem>
                            <SelectItem value="car">
                              <div className="flex items-center gap-2">
                                <Car className="h-4 w-4" />
                                {t('tripBuilder.car', 'Carro')}
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                    
                    <div className="space-y-2">
                      <Label htmlFor="arrivalDate">
                        {t('tripBuilder.arrivalDate', 'Data de Chegada')}
                      </Label>
                      <div className="flex">
                        <Input
                          id="arrivalDate"
                          type="date"
                          value={destinations[selectedDestinationIndex].arrivalDate.toISOString().split('T')[0]}
                          onChange={(e) => handleDestinationChange(
                            selectedDestinationIndex, 
                            'arrivalDate', 
                            new Date(e.target.value)
                          )}
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="departureDate">
                        {t('tripBuilder.departureDate', 'Data de Partida')}
                      </Label>
                      <div className="flex">
                        <Input
                          id="departureDate"
                          type="date"
                          value={destinations[selectedDestinationIndex].departureDate.toISOString().split('T')[0]}
                          onChange={(e) => handleDestinationChange(
                            selectedDestinationIndex, 
                            'departureDate', 
                            new Date(e.target.value)
                          )}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <div className="mt-8 flex justify-end">
            <Button 
              onClick={handleSave}
              className="px-8"
            >
              {isEditMode 
                ? t('common.save', 'Salvar') 
                : t('tripBuilder.createItinerary', 'Criar Roteiro')}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}