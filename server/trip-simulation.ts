import { Request, Response } from 'express';
import crypto from 'crypto';

// Função para gerar um UUID usando crypto, para não depender do módulo utils
function generateUUID(): string {
  return crypto.randomUUID();
}

// Tipos para a simulação
interface TripCostSimulationData {
  origin: string;
  originCountry: string;
  destination: string;
  destinationCountry: string;
  departureDate: string;
  returnDate: string;
  budget: number;
  interests: string[];
}

interface FlightOption {
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

interface HotelOption {
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

interface Attraction {
  id: string;
  name: string;
  category: string;
  rating: number;
  price?: number;
  currency?: string;
  imageUrl: string;
  description?: string;
}

interface CostSimulation {
  flightOptions: FlightOption[];
  hotelOptions: HotelOption[];
  attractions: Attraction[];
  totalEstimate: number;
  currency: string;
}

// Gera opções de voos com base na origem e destino
function generateFlightOptions(
  origin: string,
  destination: string,
  departureDate: Date,
  returnDate: Date
): FlightOption[] {
  const airlines = ['LATAM', 'Azul', 'GOL', 'Avianca', 'TAP', 'Emirates'];
  const flightOptions: FlightOption[] = [];
  
  // Calcula a distância para estimar o preço (simplificado)
  const basePrice = Math.floor(Math.random() * 1000) + 1000;
  
  // Gera algumas opções de voos
  for (let i = 0; i < 3; i++) {
    const airline = airlines[Math.floor(Math.random() * airlines.length)];
    const departureHour = 6 + Math.floor(Math.random() * 12); // Entre 6h e 18h
    const flightDuration = 1 + Math.floor(Math.random() * 5); // Entre 1h e 6h
    
    const departureTime = `${departureHour.toString().padStart(2, '0')}:${(Math.floor(Math.random() * 4) * 15).toString().padStart(2, '0')}`;
    const arrivalHour = (departureHour + flightDuration) % 24;
    const arrivalTime = `${arrivalHour.toString().padStart(2, '0')}:${(Math.floor(Math.random() * 4) * 15).toString().padStart(2, '0')}`;
    
    const priceVariation = (Math.random() * 0.3) - 0.1; // -10% a +20%
    const price = Math.round(basePrice * (1 + priceVariation));
    
    flightOptions.push({
      id: `f${i + 1}-${generateUUID().substring(0, 8)}`,
      airline,
      departureTime,
      arrivalTime,
      price,
      currency: 'BRL',
      duration: `${flightDuration}h ${Math.floor(Math.random() * 60)}m`,
      stops: Math.floor(Math.random() * 2),
      flightNumber: `${airline.substring(0, 2)}${100 + Math.floor(Math.random() * 900)}`
    });
  }
  
  // Ordena por preço
  return flightOptions.sort((a, b) => a.price - b.price);
}

// Gera opções de hotéis com base no destino
function generateHotelOptions(
  destination: string,
  checkIn: Date,
  checkOut: Date
): HotelOption[] {
  const hotelNames = [
    'Hotel Central',
    'Grand Plaza',
    'Comfort Inn',
    'Marina Bay',
    'Royal Palace',
    'Ocean View'
  ];
  
  const amenitiesList = [
    'WiFi', 
    'Café da manhã', 
    'Piscina', 
    'Academia', 
    'Restaurante', 
    'Bar', 
    'Spa',
    'Estacionamento',
    'Ar condicionado'
  ];
  
  const hotelOptions: HotelOption[] = [];
  const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
  
  // Gera algumas opções de hotéis
  for (let i = 0; i < 4; i++) {
    const name = hotelNames[Math.floor(Math.random() * hotelNames.length)];
    const rating = 3 + Math.random() * 2; // Entre 3 e 5 estrelas
    const pricePerNight = Math.floor(Math.random() * 300) + 200; // Entre 200 e 500
    
    // Seleciona algumas amenidades aleatórias
    const hotelAmenities = [];
    const numAmenities = 3 + Math.floor(Math.random() * 4); // Entre 3 e 6 amenidades
    
    for (let j = 0; j < numAmenities; j++) {
      const amenity = amenitiesList[Math.floor(Math.random() * amenitiesList.length)];
      if (!hotelAmenities.includes(amenity)) {
        hotelAmenities.push(amenity);
      }
    }
    
    const totalPrice = pricePerNight * nights;
    
    hotelOptions.push({
      id: `h${i + 1}-${generateUUID().substring(0, 8)}`,
      name: `${name} ${destination}`,
      rating,
      pricePerNight,
      totalPrice,
      currency: 'BRL',
      amenities: hotelAmenities,
      address: `Av. Principal, ${Math.floor(Math.random() * 1000)}, ${destination}`,
      imageUrl: `https://source.unsplash.com/random/300x200/?hotel,${i}`
    });
  }
  
  // Ordena por preço
  return hotelOptions.sort((a, b) => a.pricePerNight - b.pricePerNight);
}

// Gera atrações com base nos interesses e destino
function generateAttractions(
  destination: string,
  interests: string[]
): Attraction[] {
  const attractionsByCategory: Record<string, Attraction[]> = {
    culture: [
      {
        id: generateUUID(),
        name: `Museu Nacional de ${destination}`,
        category: 'culture',
        rating: 4.5 + (Math.random() * 0.5),
        price: 25 + Math.floor(Math.random() * 15),
        currency: 'BRL',
        imageUrl: 'https://source.unsplash.com/random/300x200/?museum'
      },
      {
        id: generateUUID(),
        name: `Teatro Municipal`,
        category: 'culture',
        rating: 4.3 + (Math.random() * 0.5),
        price: 40 + Math.floor(Math.random() * 20),
        currency: 'BRL',
        imageUrl: 'https://source.unsplash.com/random/300x200/?theater'
      }
    ],
    nature: [
      {
        id: generateUUID(),
        name: `Parque Natural`,
        category: 'nature',
        rating: 4.6 + (Math.random() * 0.4),
        price: 10 + Math.floor(Math.random() * 10),
        currency: 'BRL',
        imageUrl: 'https://source.unsplash.com/random/300x200/?park,nature'
      },
      {
        id: generateUUID(),
        name: `Jardim Botânico`,
        category: 'nature',
        rating: 4.4 + (Math.random() * 0.4),
        price: 15 + Math.floor(Math.random() * 10),
        currency: 'BRL',
        imageUrl: 'https://source.unsplash.com/random/300x200/?botanical,garden'
      }
    ],
    nightlife: [
      {
        id: generateUUID(),
        name: `Bar do Pedro`,
        category: 'nightlife',
        rating: 4.2 + (Math.random() * 0.6),
        price: 50 + Math.floor(Math.random() * 30),
        currency: 'BRL',
        imageUrl: 'https://source.unsplash.com/random/300x200/?bar,pub'
      },
      {
        id: generateUUID(),
        name: `Discoteca Noite Estrelada`,
        category: 'nightlife',
        rating: 4.0 + (Math.random() * 0.7),
        price: 80 + Math.floor(Math.random() * 40),
        currency: 'BRL',
        imageUrl: 'https://source.unsplash.com/random/300x200/?nightclub'
      }
    ],
    food: [
      {
        id: generateUUID(),
        name: `Restaurante Típico`,
        category: 'food',
        rating: 4.7 + (Math.random() * 0.3),
        price: 60 + Math.floor(Math.random() * 40),
        currency: 'BRL',
        imageUrl: 'https://source.unsplash.com/random/300x200/?restaurant,food'
      },
      {
        id: generateUUID(),
        name: `Mercado Municipal`,
        category: 'food',
        rating: 4.5 + (Math.random() * 0.3),
        price: 0,
        currency: 'BRL',
        imageUrl: 'https://source.unsplash.com/random/300x200/?market,food'
      }
    ],
    adventure: [
      {
        id: generateUUID(),
        name: `Trilhas Ecológicas`,
        category: 'adventure',
        rating: 4.6 + (Math.random() * 0.4),
        price: 35 + Math.floor(Math.random() * 25),
        currency: 'BRL',
        imageUrl: 'https://source.unsplash.com/random/300x200/?trail,hiking'
      },
      {
        id: generateUUID(),
        name: `Rafting nas Corredeiras`,
        category: 'adventure',
        rating: 4.8 + (Math.random() * 0.2),
        price: 120 + Math.floor(Math.random() * 50),
        currency: 'BRL',
        imageUrl: 'https://source.unsplash.com/random/300x200/?rafting'
      }
    ]
  };
  
  let selectedAttractions: Attraction[] = [];
  
  // Se não houver interesses específicos, incluir algumas atrações de cada categoria
  if (!interests || interests.length === 0) {
    Object.values(attractionsByCategory).forEach(categoryAttractions => {
      selectedAttractions.push(categoryAttractions[0]);
    });
  } else {
    // Adiciona atrações baseadas nos interesses selecionados
    interests.forEach(interest => {
      if (attractionsByCategory[interest]) {
        selectedAttractions = [...selectedAttractions, ...attractionsByCategory[interest]];
      }
    });
    
    // Se ainda tiver poucos resultados, adiciona mais algumas atrações populares
    if (selectedAttractions.length < 3) {
      Object.values(attractionsByCategory).forEach(categoryAttractions => {
        if (!selectedAttractions.some(att => att.id === categoryAttractions[0].id)) {
          selectedAttractions.push(categoryAttractions[0]);
        }
      });
    }
  }
  
  // Limita a 6 atrações no máximo
  return selectedAttractions.slice(0, 6);
}

// Calcula o orçamento total da viagem
function calculateTotalEstimate(
  flights: FlightOption[],
  hotels: HotelOption[],
  attractions: Attraction[],
  nights: number
): number {
  // Pega o voo mais barato
  const cheapestFlight = flights.length > 0 ? flights[0] : { price: 0 };
  
  // Pega o hotel mais barato
  const cheapestHotel = hotels.length > 0 ? hotels[0] : { totalPrice: 0 };
  
  // Soma os preços das atrações (considerando que cada uma é visitada uma vez)
  const attractionsTotal = attractions.reduce((total, attraction) => {
    return total + (attraction.price || 0);
  }, 0);
  
  // Adiciona orçamento para refeições (estimado em 100 por dia)
  const foodBudget = nights * 100 * 3; // 3 refeições por dia
  
  // Adiciona orçamento para transporte local (estimado em 50 por dia)
  const localTransportBudget = nights * 50;
  
  // Adiciona margem de segurança (10%)
  const subtotal = cheapestFlight.price + cheapestHotel.totalPrice + attractionsTotal + foodBudget + localTransportBudget;
  const safetyMargin = subtotal * 0.1;
  
  return Math.round(subtotal + safetyMargin);
}

// Controlador para simulação de custo de viagem
export async function simulateTripCost(req: Request, res: Response) {
  try {
    const {
      origin,
      originCountry,
      destination,
      destinationCountry,
      departureDate,
      returnDate,
      budget,
      interests
    } = req.body as TripCostSimulationData;
    
    // Validação dos dados
    if (!origin || !destination || !departureDate || !returnDate) {
      return res.status(400).json({
        error: 'Dados incompletos. Informe origem, destino e datas.'
      });
    }
    
    // Converte datas para objetos Date
    const departureDateObj = new Date(departureDate);
    const returnDateObj = new Date(returnDate);
    
    // Valida datas
    if (isNaN(departureDateObj.getTime()) || isNaN(returnDateObj.getTime())) {
      return res.status(400).json({
        error: 'Formato de data inválido.'
      });
    }
    
    if (departureDateObj >= returnDateObj) {
      return res.status(400).json({
        error: 'A data de retorno deve ser posterior à data de partida.'
      });
    }
    
    // Gera as opções
    const flightOptions = generateFlightOptions(
      origin,
      destination,
      departureDateObj,
      returnDateObj
    );
    
    const hotelOptions = generateHotelOptions(
      destination,
      departureDateObj,
      returnDateObj
    );
    
    const attractions = generateAttractions(destination, interests || []);
    
    // Calcula número de noites
    const nights = Math.ceil(
      (returnDateObj.getTime() - departureDateObj.getTime()) / (1000 * 60 * 60 * 24)
    );
    
    // Calcula o orçamento total estimado
    const totalEstimate = calculateTotalEstimate(
      flightOptions,
      hotelOptions,
      attractions,
      nights
    );
    
    // Monta a resposta
    const response: CostSimulation = {
      flightOptions,
      hotelOptions,
      attractions,
      totalEstimate,
      currency: 'BRL'
    };
    
    return res.status(200).json(response);
  } catch (error) {
    console.error('Erro ao simular custos de viagem:', error);
    return res.status(500).json({
      error: 'Erro interno ao processar a simulação de custos.'
    });
  }
}