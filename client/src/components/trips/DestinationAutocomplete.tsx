import React, { useState, useEffect, useRef } from 'react';
import { Command, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';

// Interface para o valor da cidade e país
export interface City {
  city: string;
  country: string;
  countryCode?: string;
}

// Props do componente
interface DestinationAutocompleteProps {
  value: City | null;
  onChange: (value: City) => void;
  placeholder?: string;
  className?: string;
}

// Função para obter a bandeira do país usando o código do país
const getFlagEmoji = (countryCode: string) => {
  if (!countryCode) return '🌍';
  const codePoints = countryCode
    .toUpperCase()
    .split('')
    .map(char => 127397 + char.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
};

// Dados fictícios para demonstração
const popularCities: City[] = [
  { city: 'São Paulo', country: 'Brasil', countryCode: 'BR' },
  { city: 'Rio de Janeiro', country: 'Brasil', countryCode: 'BR' },
  { city: 'Salvador', country: 'Brasil', countryCode: 'BR' },
  { city: 'Brasília', country: 'Brasil', countryCode: 'BR' },
  { city: 'Recife', country: 'Brasil', countryCode: 'BR' },
  { city: 'Nova York', country: 'Estados Unidos', countryCode: 'US' },
  { city: 'Los Angeles', country: 'Estados Unidos', countryCode: 'US' },
  { city: 'Miami', country: 'Estados Unidos', countryCode: 'US' },
  { city: 'Lisboa', country: 'Portugal', countryCode: 'PT' },
  { city: 'Londres', country: 'Reino Unido', countryCode: 'GB' },
  { city: 'Paris', country: 'França', countryCode: 'FR' },
  { city: 'Roma', country: 'Itália', countryCode: 'IT' },
  { city: 'Barcelona', country: 'Espanha', countryCode: 'ES' },
  { city: 'Amsterdã', country: 'Holanda', countryCode: 'NL' },
  { city: 'Berlim', country: 'Alemanha', countryCode: 'DE' },
  { city: 'Viena', country: 'Áustria', countryCode: 'AT' },
  { city: 'Praga', country: 'República Tcheca', countryCode: 'CZ' },
  { city: 'Tóquio', country: 'Japão', countryCode: 'JP' },
  { city: 'Cidade do México', country: 'México', countryCode: 'MX' },
  { city: 'Buenos Aires', country: 'Argentina', countryCode: 'AR' },
  { city: 'Santiago', country: 'Chile', countryCode: 'CL' },
  { city: 'Lima', country: 'Peru', countryCode: 'PE' },
  { city: 'Bogotá', country: 'Colômbia', countryCode: 'CO' },
  { city: 'Toronto', country: 'Canadá', countryCode: 'CA' },
  { city: 'Sydney', country: 'Austrália', countryCode: 'AU' },
];

export function DestinationAutocomplete({
  value,
  onChange,
  placeholder = 'Selecione uma cidade',
  className,
}: DestinationAutocompleteProps) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredCities, setFilteredCities] = useState<City[]>(popularCities);
  const inputRef = useRef<HTMLInputElement>(null);

  // Função para buscar cidades com base na consulta (demonstração)
  useEffect(() => {
    // Em uma aplicação real, isso seria uma chamada API
    // async function fetchCities() {
    //   const response = await fetch(`/api/cities?q=${searchQuery}`);
    //   const data = await response.json();
    //   setFilteredCities(data);
    // }
    // fetchCities();

    // Para demonstração, filtraremos os dados fictícios
    if (searchQuery.trim() === '') {
      setFilteredCities(popularCities);
    } else {
      const lowercaseQuery = searchQuery.toLowerCase();
      const filtered = popularCities.filter(
        city =>
          city.city.toLowerCase().includes(lowercaseQuery) ||
          city.country.toLowerCase().includes(lowercaseQuery)
      );
      setFilteredCities(filtered);
    }
  }, [searchQuery]);

  // Função para formatar a exibição da cidade selecionada
  const displayValue = value
    ? `${value.city}, ${value.country}`
    : placeholder;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn('w-full justify-between', className)}
        >
          {displayValue}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <Command className="w-full">
          <CommandInput
            ref={inputRef}
            placeholder="Buscar cidade..."
            value={searchQuery}
            onValueChange={setSearchQuery}
            className="h-10"
          />
          <CommandEmpty>Nenhuma cidade encontrada.</CommandEmpty>
          <CommandList className="max-h-[300px]">
            <CommandGroup heading="Cidades populares">
              {filteredCities.map((city) => (
                <CommandItem
                  key={`${city.city}-${city.country}`}
                  value={`${city.city}-${city.country}`}
                  onSelect={() => {
                    onChange(city);
                    setOpen(false);
                    setSearchQuery('');
                  }}
                  className="flex items-center"
                >
                  <span className="mr-2 text-lg">
                    {getFlagEmoji(city.countryCode || '')}
                  </span>
                  <span>{`${city.city}, ${city.country}`}</span>
                  <Check
                    className={cn(
                      'ml-auto h-4 w-4',
                      value?.city === city.city && value?.country === city.country
                        ? 'opacity-100'
                        : 'opacity-0'
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}