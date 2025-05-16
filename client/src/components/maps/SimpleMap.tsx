import React, { useEffect, useState } from 'react';
import { geocodeAddress, GeoCoordinates } from '@/services/location.service';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

interface SimpleMapProps {
  location: string;
  className?: string;
  width?: string;
  height?: string;
}

/**
 * Componente de mapa simples para exibir um local
 * Pode ser substituído por uma integração real com mapas quando necessário
 */
export function SimpleMap({ location, className, width = '100%', height = '100%' }: SimpleMapProps) {
  const [coordinates, setCoordinates] = useState<GeoCoordinates | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const getCoordinates = async () => {
      if (!location) {
        setError('Local não especificado');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const coords = await geocodeAddress(location);
        
        if (coords) {
          setCoordinates(coords);
          setError(null);
        } else {
          setError(`Não foi possível encontrar coordenadas para "${location}"`);
        }
      } catch (err) {
        setError('Erro ao carregar o mapa');
        console.error('Erro ao obter coordenadas:', err);
      } finally {
        setLoading(false);
      }
    };

    getCoordinates();
  }, [location]);

  if (loading) {
    return (
      <Card className={`flex items-center justify-center bg-muted/20 ${className || ''}`} style={{ width, height }}>
        <CardContent className="p-6 text-center">
          <Loader2 className="h-10 w-10 mx-auto mb-4 animate-spin text-primary" />
          <p className="text-muted-foreground">Carregando mapa...</p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={`flex items-center justify-center bg-muted/20 ${className || ''}`} style={{ width, height }}>
        <CardContent className="p-6 text-center">
          <div className="rounded-full w-10 h-10 mx-auto mb-4 bg-destructive/10 text-destructive flex items-center justify-center">
            <span className="text-lg font-bold">!</span>
          </div>
          <p className="text-muted-foreground">{error}</p>
        </CardContent>
      </Card>
    );
  }

  if (!coordinates) {
    return (
      <Card className={`flex items-center justify-center bg-muted/20 ${className || ''}`} style={{ width, height }}>
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">Coordenadas não disponíveis</p>
        </CardContent>
      </Card>
    );
  }

  // Em um projeto real, aqui renderizaríamos um mapa usando uma biblioteca como Google Maps, Leaflet, etc.
  // Por enquanto, exibimos um marcador de posição com as coordenadas
  return (
    <Card className={`overflow-hidden ${className || ''}`} style={{ width, height }}>
      <CardContent className="p-0 h-full">
        <div className="h-full flex flex-col items-center justify-center bg-accent text-accent-foreground">
          <div className="mb-3 text-lg font-medium">{location}</div>
          <div className="text-sm opacity-70">
            Lat: {coordinates.lat.toFixed(4)}, Lng: {coordinates.lng.toFixed(4)}
          </div>
          <div className="mt-8 h-24 w-24 border-8 border-primary rounded-full flex items-center justify-center">
            <div className="bg-primary w-4 h-4 rounded-full"></div>
          </div>
          <div className="text-center mt-6 text-sm max-w-md mx-auto opacity-90">
            <p>Este é um mapa simplificado mostrando a localização aproximada.</p>
            <p className="mt-2">Será substituído por um mapa interativo na versão final.</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}