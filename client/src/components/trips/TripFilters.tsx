import React, { useState } from 'react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  Slider 
} from '@/components/ui/slider';
import { 
  DateRangePicker
} from '@/components/ui/date-range-picker';
import { DateRange } from 'react-day-picker';
import {
  Label
} from '@/components/ui/label';
import {
  Button
} from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Calendar,
  MapPin,
  Briefcase,
  Globe,
  FolderPlus,
  Wallet,
  Filter,
  X
} from 'lucide-react';

// Interface para os filtros
export interface TripFilters {
  tripType: string | null;
  continent: string | null;
  dateRange: DateRange | null;
  budgetRange: number[] | null;
  isMultiDestination: boolean | null;
}

interface TripFiltersProps {
  onFilterChange: (filters: TripFilters) => void;
  className?: string;
}

export const continents = [
  'Todos',
  'Europa',
  'América do Norte',
  'América do Sul',
  'Ásia',
  'África',
  'Oceania'
];

export const tripTypes = [
  'Todos',
  'tourist',
  'nomad',
  'business'
];

export const tripTypeLabels: Record<string, string> = {
  'Todos': 'Todos',
  'tourist': 'Turismo',
  'nomad': 'Nômade Digital',
  'business': 'Negócios'
};

const TripFilters: React.FC<TripFiltersProps> = ({ onFilterChange, className }) => {
  // Estados dos filtros
  const [filters, setFilters] = useState<TripFilters>({
    tripType: null,
    continent: null,
    dateRange: null,
    budgetRange: null,
    isMultiDestination: null
  });
  
  // Estado para mostrar/esconder filtros em telas menores
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  
  // Handler para mudanças nos filtros
  const handleFilterChange = (key: keyof TripFilters, value: any) => {
    const newFilters = {
      ...filters,
      [key]: value
    };
    
    setFilters(newFilters);
    onFilterChange(newFilters);
  };
  
  // Resetar todos os filtros
  const resetFilters = () => {
    const resetValues: TripFilters = {
      tripType: null,
      continent: null,
      dateRange: null,
      budgetRange: null,
      isMultiDestination: null
    };
    
    setFilters(resetValues);
    onFilterChange(resetValues);
  };
  
  return (
    <>
      {/* Botão de filtros para mobile */}
      <div className="lg:hidden mb-4 flex justify-between items-center">
        <Button 
          variant="outline" 
          onClick={() => setShowMobileFilters(!showMobileFilters)}
          className="flex items-center gap-2"
        >
          <Filter className="h-4 w-4" />
          Filtros
        </Button>
        
        {Object.values(filters).some(v => v !== null) && (
          <Button 
            variant="ghost" 
            size="sm"
            onClick={resetFilters}
            className="text-sm text-muted-foreground"
          >
            Limpar filtros
          </Button>
        )}
      </div>
      
      <Card className={`${className} ${showMobileFilters ? 'block' : 'hidden lg:block'}`}>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-medium flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Filter className="h-5 w-5" /> 
              Filtrar Viagens
            </span>
            <Button variant="ghost" size="sm" onClick={resetFilters} className="h-7 px-3 text-xs">
              Limpar Filtros
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          {/* Filtro de tipo de viagem */}
          <div>
            <Label className="text-sm font-medium mb-1.5 block">Tipo de Viagem</Label>
            <Select 
              value={filters.tripType || 'Todos'} 
              onValueChange={(value) => handleFilterChange('tripType', value === 'Todos' ? null : value)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Todos os tipos" />
              </SelectTrigger>
              <SelectContent>
                {tripTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {tripTypeLabels[type]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {/* Filtro de Continente */}
          <div>
            <Label className="text-sm font-medium mb-1.5 block">Continente</Label>
            <Select 
              value={filters.continent || 'Todos'} 
              onValueChange={(value) => handleFilterChange('continent', value === 'Todos' ? null : value)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Todos os continentes" />
              </SelectTrigger>
              <SelectContent>
                {continents.map((continent) => (
                  <SelectItem key={continent} value={continent}>
                    {continent}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {/* Filtro de Destino Único/Múltiplo */}
          <div>
            <Label className="text-sm font-medium mb-1.5 block">Destinos</Label>
            <Select 
              value={filters.isMultiDestination === null ? 'Todos' : filters.isMultiDestination ? 'multi' : 'single'} 
              onValueChange={(value) => {
                let isMulti = null;
                if (value === 'multi') isMulti = true;
                if (value === 'single') isMulti = false;
                handleFilterChange('isMultiDestination', isMulti);
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Tipo de destino" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Todos">Todos</SelectItem>
                <SelectItem value="single">Destino Único</SelectItem>
                <SelectItem value="multi">Multi-Destino</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {/* Filtro de Período */}
          <div>
            <Label className="text-sm font-medium mb-1.5 block">Período da Viagem</Label>
            <div className="w-full">
              <DateRangePicker
                value={filters.dateRange || undefined}
                onChange={(range) => handleFilterChange('dateRange', range)}
                className="w-full"
                align="start"
              />
            </div>
          </div>
          
          {/* Filtro de Orçamento */}
          <div>
            <div className="flex justify-between mb-1.5">
              <Label className="text-sm font-medium">Faixa de Orçamento</Label>
              {filters.budgetRange && (
                <div className="text-sm text-muted-foreground">
                  R${filters.budgetRange[0]} - R${filters.budgetRange[1]}
                </div>
              )}
            </div>
            
            <Slider
              defaultValue={[0, 10000]}
              min={0}
              max={10000}
              step={500}
              value={filters.budgetRange || [0, 10000]}
              onValueChange={(values) => handleFilterChange('budgetRange', values)}
              className="my-5"
            />
            
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>R$ 0</span>
              <span>R$ 10.000+</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
};

export default TripFilters;