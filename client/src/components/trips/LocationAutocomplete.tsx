import { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Check, ChevronsUpDown, Loader2, MapPin, Flag } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";

interface Country {
  name: string;
  code: string;
  flag?: string;
}

interface City {
  name: string;
  country: string;
  countryCode: string;
}

interface LocationAutocompleteProps {
  onSelect: (location: { city: string; country: string; countryCode: string }) => void;
  placeholder?: string;
  defaultValue?: { city: string; country: string; countryCode?: string };
  compact?: boolean;
}

export default function LocationAutocomplete({ 
  onSelect, 
  placeholder = "Search for a city", 
  defaultValue, 
  compact = false 
}: LocationAutocompleteProps) {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLocation, setSelectedLocation] = useState<{ city: string; country: string; countryCode?: string } | null>(
    defaultValue || null
  );
  const [countries, setCountries] = useState<Country[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<'country' | 'city'>('country');
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch countries
  useEffect(() => {
    const fetchCountries = async () => {
      try {
        // In a production app, you would use the actual REST Countries API
        // For this demo, we'll simulate it with some sample data
        const sampleCountries: Country[] = [
          { name: 'United States', code: 'US', flag: '🇺🇸' },
          { name: 'France', code: 'FR', flag: '🇫🇷' },
          { name: 'Japan', code: 'JP', flag: '🇯🇵' },
          { name: 'Brazil', code: 'BR', flag: '🇧🇷' },
          { name: 'Australia', code: 'AU', flag: '🇦🇺' },
          { name: 'Germany', code: 'DE', flag: '🇩🇪' },
          { name: 'Canada', code: 'CA', flag: '🇨🇦' },
          { name: 'United Kingdom', code: 'GB', flag: '🇬🇧' },
          { name: 'Mexico', code: 'MX', flag: '🇲🇽' },
          { name: 'Spain', code: 'ES', flag: '🇪🇸' },
          { name: 'Italy', code: 'IT', flag: '🇮🇹' },
          { name: 'China', code: 'CN', flag: '🇨🇳' },
        ];
        
        setCountries(sampleCountries);
      } catch (error) {
        console.error('Error fetching countries:', error);
        toast({
          title: "Error fetching countries",
          description: "Could not load the list of countries. Please try again.",
          variant: "destructive"
        });
      }
    };

    fetchCountries();
  }, []);

  // Fetch cities when a country is selected and the search term changes
  useEffect(() => {
    if (!selectedCountry || !searchTerm) {
      setCities([]);
      return;
    }

    // Clear previous timer to avoid multiple calls
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        // In a production app, you would use the GeoDB Cities API
        // For this demo, we'll simulate it with some sample data
        const sampleCities: { [key: string]: City[] } = {
          'US': [
            { name: 'New York', country: 'United States', countryCode: 'US' },
            { name: 'Los Angeles', country: 'United States', countryCode: 'US' },
            { name: 'Chicago', country: 'United States', countryCode: 'US' },
            { name: 'San Francisco', country: 'United States', countryCode: 'US' },
          ],
          'FR': [
            { name: 'Paris', country: 'France', countryCode: 'FR' },
            { name: 'Lyon', country: 'France', countryCode: 'FR' },
            { name: 'Nice', country: 'France', countryCode: 'FR' },
            { name: 'Marseille', country: 'France', countryCode: 'FR' },
          ],
          'JP': [
            { name: 'Tokyo', country: 'Japan', countryCode: 'JP' },
            { name: 'Osaka', country: 'Japan', countryCode: 'JP' },
            { name: 'Kyoto', country: 'Japan', countryCode: 'JP' },
            { name: 'Sapporo', country: 'Japan', countryCode: 'JP' },
          ],
          'BR': [
            { name: 'Rio de Janeiro', country: 'Brazil', countryCode: 'BR' },
            { name: 'São Paulo', country: 'Brazil', countryCode: 'BR' },
            { name: 'Brasília', country: 'Brazil', countryCode: 'BR' },
            { name: 'Salvador', country: 'Brazil', countryCode: 'BR' },
          ],
          'AU': [
            { name: 'Sydney', country: 'Australia', countryCode: 'AU' },
            { name: 'Melbourne', country: 'Australia', countryCode: 'AU' },
            { name: 'Brisbane', country: 'Australia', countryCode: 'AU' },
            { name: 'Perth', country: 'Australia', countryCode: 'AU' },
          ],
          'DE': [
            { name: 'Berlin', country: 'Germany', countryCode: 'DE' },
            { name: 'Munich', country: 'Germany', countryCode: 'DE' },
            { name: 'Hamburg', country: 'Germany', countryCode: 'DE' },
            { name: 'Frankfurt', country: 'Germany', countryCode: 'DE' },
          ],
          'CA': [
            { name: 'Toronto', country: 'Canada', countryCode: 'CA' },
            { name: 'Vancouver', country: 'Canada', countryCode: 'CA' },
            { name: 'Montreal', country: 'Canada', countryCode: 'CA' },
            { name: 'Calgary', country: 'Canada', countryCode: 'CA' },
          ],
          'GB': [
            { name: 'London', country: 'United Kingdom', countryCode: 'GB' },
            { name: 'Manchester', country: 'United Kingdom', countryCode: 'GB' },
            { name: 'Edinburgh', country: 'United Kingdom', countryCode: 'GB' },
            { name: 'Birmingham', country: 'United Kingdom', countryCode: 'GB' },
          ],
          'MX': [
            { name: 'Mexico City', country: 'Mexico', countryCode: 'MX' },
            { name: 'Cancún', country: 'Mexico', countryCode: 'MX' },
            { name: 'Guadalajara', country: 'Mexico', countryCode: 'MX' },
            { name: 'Monterrey', country: 'Mexico', countryCode: 'MX' },
          ],
          'ES': [
            { name: 'Madrid', country: 'Spain', countryCode: 'ES' },
            { name: 'Barcelona', country: 'Spain', countryCode: 'ES' },
            { name: 'Valencia', country: 'Spain', countryCode: 'ES' },
            { name: 'Seville', country: 'Spain', countryCode: 'ES' },
          ],
          'IT': [
            { name: 'Rome', country: 'Italy', countryCode: 'IT' },
            { name: 'Milan', country: 'Italy', countryCode: 'IT' },
            { name: 'Florence', country: 'Italy', countryCode: 'IT' },
            { name: 'Venice', country: 'Italy', countryCode: 'IT' },
          ],
          'CN': [
            { name: 'Beijing', country: 'China', countryCode: 'CN' },
            { name: 'Shanghai', country: 'China', countryCode: 'CN' },
            { name: 'Guangzhou', country: 'China', countryCode: 'CN' },
            { name: 'Hong Kong', country: 'China', countryCode: 'CN' },
          ],
        };
        
        const countryCities = sampleCities[selectedCountry.code] || [];
        const filteredCities = searchTerm.length > 0 
          ? countryCities.filter(city => 
              city.name.toLowerCase().includes(searchTerm.toLowerCase())
            )
          : countryCities;
        
        setCities(filteredCities);
      } catch (error) {
        console.error('Error fetching cities:', error);
        toast({
          title: "Error fetching cities",
          description: "Could not load cities for the selected country. Please try again.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    }, 300); // 300ms debounce

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [selectedCountry, searchTerm]);

  const handleLocationSelect = (location: City) => {
    setSelectedLocation({
      city: location.name,
      country: location.country,
      countryCode: location.countryCode
    });
    setOpen(false);
    onSelect({
      city: location.name,
      country: location.country,
      countryCode: location.countryCode
    });
  };

  const handleCountrySelect = (country: Country) => {
    setSelectedCountry(country);
    setMode('city');
    setSearchTerm('');
  };

  const handleBackToCountries = () => {
    setMode('country');
    setSearchTerm('');
  };

  const filteredCountries = searchTerm.length > 0
    ? countries.filter(country =>
        country.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : countries;

  const displayValue = selectedLocation
    ? `${selectedLocation.city}, ${selectedLocation.country}`
    : '';

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "w-full justify-between",
            !selectedLocation && "text-muted-foreground"
          )}
        >
          {selectedLocation ? (
            <div className="flex items-center">
              <MapPin className="mr-2 h-4 w-4 shrink-0" />
              <span className={compact ? "truncate max-w-[180px]" : ""}>
                {displayValue}
              </span>
            </div>
          ) : (
            <span>{placeholder}</span>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <Command>
          <CommandInput 
            placeholder={mode === 'country' ? "Search countries..." : "Search cities..."}
            value={searchTerm}
            onValueChange={setSearchTerm}
          />
          <CommandList>
            {loading && (
              <div className="flex items-center justify-center py-6">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            )}
            
            {!loading && mode === 'country' && (
              <>
                <CommandEmpty>No countries found.</CommandEmpty>
                <CommandGroup heading="Countries">
                  {filteredCountries.map((country) => (
                    <CommandItem
                      key={country.code}
                      value={country.name}
                      onSelect={() => handleCountrySelect(country)}
                      className="flex items-center"
                    >
                      <div className="flex items-center">
                        <span className="mr-2">{country.flag}</span>
                        {country.name}
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </>
            )}
            
            {!loading && mode === 'city' && (
              <>
                <CommandGroup>
                  <CommandItem
                    onSelect={handleBackToCountries}
                    className="flex items-center text-muted-foreground"
                  >
                    <Flag className="mr-2 h-4 w-4" />
                    <span>Back to countries</span>
                  </CommandItem>
                </CommandGroup>
                
                <CommandEmpty>No cities found. Try another search term.</CommandEmpty>
                
                <CommandGroup heading={`Cities in ${selectedCountry?.name}`}>
                  {cities.map((city) => (
                    <CommandItem
                      key={`${city.name}-${city.countryCode}`}
                      value={city.name}
                      onSelect={() => handleLocationSelect(city)}
                    >
                      <MapPin className="mr-2 h-4 w-4" />
                      <span>{city.name}</span>
                      
                      {selectedLocation?.city === city.name && (
                        <Check className="ml-auto h-4 w-4" />
                      )}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

// Integration notes:
// In a production application, you would replace the sample data with actual API calls:
// 
// 1. For countries, use the REST Countries API:
//    const response = await fetch('https://restcountries.com/v3.1/all?fields=name,cca2,flags');
//    const data = await response.json();
//    const formattedCountries = data.map(country => ({
//      name: country.name.common,
//      code: country.cca2,
//      flag: country.flags.emoji
//    }));
//
// 2. For cities, use the GeoDB Cities API via RapidAPI:
//    const options = {
//      method: 'GET',
//      headers: {
//        'X-RapidAPI-Key': 'YOUR_RAPIDAPI_KEY',
//        'X-RapidAPI-Host': 'wft-geo-db.p.rapidapi.com'
//      }
//    };
//    const response = await fetch(
//      `https://wft-geo-db.p.rapidapi.com/v1/geo/cities?countryIds=${countryCode}&namePrefix=${searchTerm}&limit=10`, 
//      options
//    );
//    const data = await response.json();
//    const formattedCities = data.data.map(city => ({
//      name: city.name,
//      country: city.country,
//      countryCode: city.countryCode
//    }));