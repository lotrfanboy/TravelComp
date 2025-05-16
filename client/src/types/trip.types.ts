/**
 * Tipos relacionados às viagens e simulações
 */

// Tipo para Viagem
export interface Trip {
  id: number;
  name: string;
  userId: string;
  origin: string;
  destination: string;
  country: string;
  startDate: string;
  endDate: string;
  budget: string | null;
  currency: string | null;
  travelers: number;
  status: string | null;
  simulationResult: SimulationResults | null;
  selectedFlightId: string | null;
  selectedHotelId: string | null;
  isMultiDestination: boolean | null;
  createdAt: string | null;
  updatedAt: string | null;
  // Campos opcionais
  interests?: string[];
  tripType?: string;
  isPublic?: boolean | null;
  organizationId?: number | null;
}

// Interface para criação de viagem
export interface CreateTripPayload {
  name: string;
  destination: string;
  country: string;
  startDate: string;
  endDate: string;
  budget?: string | null;
  currency?: string | null;
  travelers?: number;
  interests?: string[];
  tripType?: string;
  isMultiDestination?: boolean;
  origin?: string;
}

// Interface para atualização de viagem
export interface UpdateTripPayload {
  name?: string;
  destination?: string;
  country?: string;
  startDate?: string;
  endDate?: string;
  budget?: string | null;
  currency?: string | null;
  travelers?: number;
  interests?: string[];
  tripType?: string;
  isMultiDestination?: boolean;
  origin?: string;
  selectedFlightId?: string | null;
  selectedHotelId?: string | null;
  status?: string | null;
}

// Interface para opção de voo
export interface FlightOption {
  id: string;
  airline: string;
  departureTime: string;
  arrivalTime: string;
  price: number;
  currency: string;
  duration?: string;
  stops?: number;
  flightNumber?: string;
}

// Interface para opção de hotel
export interface HotelOption {
  id: string;
  name: string;
  rating: number;
  pricePerNight: number;
  totalPrice: number;
  currency: string;
  amenities: string[];
  address?: string;
  imageUrl?: string;
}

// Interface para atração
export interface Attraction {
  id: string;
  name: string;
  category: string;
  rating: number;
  price?: number;
  currency?: string;
  imageUrl: string;
  description?: string;
}

// Interface para resultados de simulação
export interface SimulationResults {
  flightOptions: FlightOption[];
  hotelOptions: HotelOption[];
  attractions: Attraction[];
  totalEstimate: number;
  currency: string;
}

// Interface para dados de solicitação de simulação
export interface SimulationRequestPayload {
  origin: string;
  originCountry: string;
  destination: string;
  destinationCountry: string;
  departureDate: string;
  returnDate: string;
  budget: number;
  interests: string[];
}