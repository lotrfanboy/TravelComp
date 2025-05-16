/**
 * Serviço de localização e mapeamento
 * Centralizando lógica relacionada a mapas, geocodificação e lugares
 */

// Interface para coordenadas geográficas
export interface GeoCoordinates {
  lat: number;
  lng: number;
}

// Interface para resultado da busca de lugares
export interface PlaceResult {
  id: string;
  name: string;
  address: string;
  coordinates: GeoCoordinates;
  types?: string[];
  rating?: number;
  photos?: string[];
}

/**
 * Geocodifica um endereço ou localização para obter coordenadas
 * @param address Endereço ou nome do local
 * @returns Promessa com coordenadas
 */
export const geocodeAddress = async (address: string): Promise<GeoCoordinates | null> => {
  try {
    // Implementação simples usando API de Geocodificação
    // Aqui poderiamos usar uma API real como Google Geocoding ou OpenStreetMap
    
    // Dados simulados para fins de demonstração
    // Em produção, isso seria substituído por chamadas a APIs reais
    if (address.toLowerCase().includes('salvador')) {
      return { lat: -12.9711, lng: -38.5108 };
    }
    if (address.toLowerCase().includes('rio de janeiro')) {
      return { lat: -22.9068, lng: -43.1729 };
    }
    if (address.toLowerCase().includes('são paulo')) {
      return { lat: -23.5505, lng: -46.6333 };
    }
    if (address.toLowerCase().includes('recife')) {
      return { lat: -8.0476, lng: -34.8770 };
    }
    if (address.toLowerCase().includes('fortaleza')) {
      return { lat: -3.7319, lng: -38.5267 };
    }
    if (address.toLowerCase().includes('brasília')) {
      return { lat: -15.7801, lng: -47.9292 };
    }
    
    // Retornar nulo se o local não for encontrado
    console.warn(`Geocodificação não encontrou resultado para: ${address}`);
    return null;
  } catch (error) {
    console.error('Erro ao geocodificar endereço:', error);
    return null;
  }
};

/**
 * Busca lugares próximos a um ponto
 * @param coordinates Coordenadas centrais
 * @param type Tipo de local (hotel, restaurante, etc)
 * @param radius Raio de busca em metros
 * @returns Promessa com resultados de lugares
 */
export const searchNearbyPlaces = async (
  coordinates: GeoCoordinates,
  type: string,
  radius: number = 1000
): Promise<PlaceResult[]> => {
  try {
    // Implementação para buscar lugares próximos
    // Em produção, isso seria substituído por chamadas a APIs reais como Google Places
    console.log(`Buscando ${type} em um raio de ${radius}m de [${coordinates.lat}, ${coordinates.lng}]`);
    
    // Resposta simulada
    return [];
  } catch (error) {
    console.error('Erro ao buscar lugares próximos:', error);
    return [];
  }
};

/**
 * Calcula a distância entre dois pontos em km
 * @param point1 Primeiro ponto
 * @param point2 Segundo ponto
 * @returns Distância em quilômetros
 */
export const calculateDistance = (point1: GeoCoordinates, point2: GeoCoordinates): number => {
  // Implementação da fórmula de Haversine para cálculo de distância geográfica
  const R = 6371; // Raio da Terra em km
  const dLat = toRad(point2.lat - point1.lat);
  const dLng = toRad(point2.lng - point1.lng);
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(point1.lat)) * Math.cos(toRad(point2.lat)) * 
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  
  return distance;
};

/**
 * Converte graus para radianos
 * @param degrees Valor em graus
 * @returns Valor em radianos
 */
function toRad(degrees: number): number {
  return degrees * Math.PI / 180;
}

/**
 * Gera URL para imagem de mapa estático
 * @param center Coordenadas centrais
 * @param zoom Nível de zoom
 * @param width Largura da imagem
 * @param height Altura da imagem
 * @param markers Array de marcadores no mapa
 * @returns URL da imagem do mapa
 */
export const getStaticMapUrl = (
  center: GeoCoordinates,
  zoom: number = 13,
  width: number = 600,
  height: number = 300,
  markers: GeoCoordinates[] = []
): string => {
  // Em produção, isso seria substituído pela API do Google Maps ou similar
  // Por enquanto, retornamos uma imagem genérica de mapa
  return `https://maps.googleapis.com/maps/api/staticmap?center=${center.lat},${center.lng}&zoom=${zoom}&size=${width}x${height}&markers=${markers.map(m => `${m.lat},${m.lng}`).join('|')}`;
};