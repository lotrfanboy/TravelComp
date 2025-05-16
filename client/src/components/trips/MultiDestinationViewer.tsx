import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardFooter 
} from '@/components/ui/card';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger 
} from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { 
  Calendar, 
  MapPin, 
  Clock, 
  DollarSign, 
  ArrowRight, 
  Plane, 
  Train, 
  Bus, 
  Car,
  CalendarIcon,
  Share2,
  Download,
  Edit
} from 'lucide-react';
import { formatDate, getDaysUntil, formatCurrency } from '@/lib/utils';

interface Destination {
  id: string;
  name: string;
  city: string;
  country: string;
  arrivalDate: Date | string;
  departureDate: Date | string;
  transportType?: 'plane' | 'train' | 'bus' | 'car' | '';
  transportCost?: number;
  transportCurrency?: string;
  attractions?: string[];
}

interface MultiDestinationViewerProps {
  destinations: Destination[];
  tripName: string;
  totalBudget?: number;
  currency?: string;
  isLoading?: boolean;
  userRole?: 'tourist' | 'nomad' | 'business';
  onEdit?: () => void;
}

export function MultiDestinationViewer({ 
  destinations, 
  tripName, 
  totalBudget,
  currency = 'USD',
  isLoading = false,
  userRole = 'tourist',
  onEdit
}: MultiDestinationViewerProps) {
  const { t } = useTranslation();
  const [selectedDestinationIndex, setSelectedDestinationIndex] = useState<number | null>(null);
  
  // Calcular a duração total da viagem
  const totalDays = destinations.length > 0 
    ? Math.ceil(
        (new Date(destinations[destinations.length-1].departureDate).getTime() - 
         new Date(destinations[0].arrivalDate).getTime()) / 
        (1000 * 60 * 60 * 24)
      ) 
    : 0;
  
  function getTransportIcon(type?: string) {
    switch(type) {
      case 'plane': return <Plane className="h-5 w-5" />;
      case 'train': return <Train className="h-5 w-5" />;
      case 'bus': return <Bus className="h-5 w-5" />;
      case 'car': return <Car className="h-5 w-5" />;
      default: return <ArrowRight className="h-5 w-5" />;
    }
  }
  
  const getTotalTransportCost = () => {
    return destinations.reduce((total, destination) => {
      return total + (destination.transportCost || 0);
    }, 0);
  };
  
  function getColorByUserRole() {
    switch(userRole) {
      case 'tourist': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'nomad': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'business': return 'bg-purple-50 text-purple-700 border-purple-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  }
  
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-8 w-2/3" />
          <Skeleton className="h-4 w-1/2" />
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <Skeleton className="h-48 w-full" />
            <div className="space-y-2">
              <Skeleton className="h-6 w-1/3" />
              <Skeleton className="h-24 w-full" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="w-full overflow-hidden">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-2xl font-bold">{tripName}</CardTitle>
            <CardDescription>
              {t('tripBuilder.totalDuration', 'Duração Total')}: {totalDays} {t('tripBuilder.days', 'dias')} | 
              {' '}{destinations.length} {t('tripBuilder.destinations', 'destinos')}
            </CardDescription>
          </div>
          <div className="flex gap-2">
            {onEdit && (
              <Button variant="outline" size="sm" onClick={onEdit}>
                <Edit className="h-4 w-4 mr-1" />
                {t('common.edit', 'Editar')}
              </Button>
            )}
            <Button variant="outline" size="sm">
              <Share2 className="h-4 w-4 mr-1" />
              {t('common.share', 'Compartilhar')}
            </Button>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-1" />
              {t('common.export', 'Exportar')}
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        {/* Timeline da viagem */}
        <div className="relative mb-8">
          <div className="absolute left-0 top-5 bottom-8 w-[2px] bg-gray-200 ml-4"></div>
          
          <div className="space-y-8">
            {destinations.map((destination, index) => (
              <div key={destination.id} className="relative pl-12">
                {/* Indicador da timeline */}
                <div className="absolute left-0 top-0 w-10 h-10 rounded-full bg-white border-2 border-primary flex items-center justify-center">
                  <span className="font-medium text-primary">{index + 1}</span>
                </div>
                
                {/* Transporte */}
                {index > 0 && (
                  <div className="absolute -top-4 left-0 w-10 flex items-center justify-center">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="p-1 rounded-full bg-gray-100">
                            {getTransportIcon(destination.transportType)}
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>
                            {destination.transportType === 'plane' && t('tripBuilder.plane', 'Avião')}
                            {destination.transportType === 'train' && t('tripBuilder.train', 'Trem')}
                            {destination.transportType === 'bus' && t('tripBuilder.bus', 'Ônibus')}
                            {destination.transportType === 'car' && t('tripBuilder.car', 'Carro')}
                          </p>
                          {destination.transportCost && (
                            <p className="text-xs">
                              {formatCurrency(destination.transportCost, destination.transportCurrency || currency)}
                            </p>
                          )}
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                )}
                
                {/* Card do destino */}
                <Card 
                  className={`border ${
                    selectedDestinationIndex === index ? 'border-primary' : ''
                  }`}
                  onClick={() => setSelectedDestinationIndex(
                    selectedDestinationIndex === index ? null : index
                  )}
                >
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>{destination.city}, {destination.country}</CardTitle>
                        <CardDescription>
                          {formatDate(destination.arrivalDate)} - {formatDate(destination.departureDate)}
                        </CardDescription>
                      </div>
                      
                      <Badge variant="outline" className={getColorByUserRole()}>
                        {Math.ceil(
                          (new Date(destination.departureDate).getTime() - 
                           new Date(destination.arrivalDate).getTime()) / 
                          (1000 * 60 * 60 * 24)
                        )} {t('tripBuilder.nights', 'noites')}
                      </Badge>
                    </div>
                  </CardHeader>
                  
                  {selectedDestinationIndex === index && (
                    <CardContent>
                      <div className="space-y-4 mt-2">
                        {destination.attractions && destination.attractions.length > 0 && (
                          <div>
                            <h4 className="font-medium mb-2">
                              {t('tripBuilder.attractions', 'Atrações')}
                            </h4>
                            <div className="flex flex-wrap gap-2">
                              {destination.attractions.map((attraction, i) => (
                                <Badge key={i} variant="secondary">
                                  {attraction}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">
                              {t('tripBuilder.arrivalDate', 'Chegada')}: {formatDate(destination.arrivalDate)}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">
                              {t('tripBuilder.departureDate', 'Partida')}: {formatDate(destination.departureDate)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  )}
                </Card>
              </div>
            ))}
          </div>
        </div>
        
        {/* Resumo financeiro */}
        {totalBudget && (
          <Card className="border-dashed mt-6">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">
                {t('tripBuilder.budgetSummary', 'Resumo Financeiro')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">
                    {t('tripBuilder.totalBudget', 'Orçamento Total')}
                  </p>
                  <p className="text-2xl font-bold">
                    {formatCurrency(totalBudget, currency)}
                  </p>
                </div>
                
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">
                    {t('tripBuilder.transportationCosts', 'Custos de Transporte')}
                  </p>
                  <p className="text-2xl font-bold">
                    {formatCurrency(getTotalTransportCost(), currency)}
                  </p>
                </div>
                
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">
                    {t('tripBuilder.remaining', 'Restante (hospedagem e atrações)')}
                  </p>
                  <p className="text-2xl font-bold">
                    {formatCurrency(totalBudget - getTotalTransportCost(), currency)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </CardContent>
      
      <CardFooter className="bg-gray-50 border-t">
        <div className="flex justify-between items-center w-full">
          <div className="flex items-center gap-2">
            <CalendarIcon className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              {t('tripBuilder.firstDeparture', 'Primeira partida')}: {destinations.length > 0 ? formatDate(destinations[0].arrivalDate) : '-'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              {destinations.length} {t('tripBuilder.destinations', 'destinos')}
            </span>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}