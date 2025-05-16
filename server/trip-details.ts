import { Request, Response } from 'express';
import { storage } from './storage';

// Endpoint para obter detalhes da viagem, incluindo opções de voo, hotel e pontos de interesse
export async function getTripDetails(req: Request, res: Response) {
  try {
    const tripId = parseInt(req.params.id);
    if (isNaN(tripId)) {
      return res.status(400).json({ message: 'ID de viagem inválido' });
    }
    
    const trip = await storage.getTrip(tripId);
    if (!trip) {
      return res.status(404).json({ message: 'Viagem não encontrada' });
    }

    // Verificar se o usuário atual é o dono da viagem
    if (req.user && trip.userId !== (req.user as any).claims?.sub) {
      return res.status(403).json({ message: 'Acesso não autorizado a esta viagem' });
    }
    
    // Se a viagem já tem uma simulação salva, usamos ela
    if (trip.simulationResult) {
      // Converter simulationResult para objeto se for string
      const simulationData = typeof trip.simulationResult === 'string' 
        ? JSON.parse(trip.simulationResult) 
        : trip.simulationResult;
      
      // Marcar as opções que foram selecionadas pelo usuário
      if (simulationData.flightOptions && simulationData.flightOptions.length > 0) {
        simulationData.flightOptions = simulationData.flightOptions.map((flight: any) => ({
          ...flight,
          selected: flight.id === trip.selectedFlightId
        }));
      }
      
      if (simulationData.hotelOptions && simulationData.hotelOptions.length > 0) {
        simulationData.hotelOptions = simulationData.hotelOptions.map((hotel: any) => ({
          ...hotel,
          selected: hotel.id === trip.selectedHotelId
        }));
      }
      
      return res.json({
        trip,
        ...simulationData
      });
    }
    
    // Caso contrário, geramos opções usando o simulador
    // Aqui usamos dados simulados para demonstração
    const flightOptions = generateFlightOptions(
      typeof trip.startDate === 'string' ? new Date(trip.startDate) : trip.startDate,
      typeof trip.endDate === 'string' ? new Date(trip.endDate) : trip.endDate
    );
    
    const hotelOptions = generateHotelOptions(
      trip.destination, 
      trip.country, 
      typeof trip.startDate === 'string' ? new Date(trip.startDate) : trip.startDate,
      typeof trip.endDate === 'string' ? new Date(trip.endDate) : trip.endDate
    );
    
    const pointsOfInterest = generatePointsOfInterest(trip.destination, trip.country);
    
    const response = {
      trip,
      flightOptions,
      hotelOptions,
      pointsOfInterest
    };
    
    return res.json(response);
  } catch (error) {
    console.error('Erro ao obter detalhes da viagem:', error);
    return res.status(500).json({ message: 'Erro ao processar a solicitação' });
  }
}

// Endpoint para confirmar e salvar as opções selecionadas para a viagem
export async function confirmTripSelections(req: Request, res: Response) {
  try {
    const tripId = parseInt(req.params.id);
    if (isNaN(tripId)) {
      return res.status(400).json({ message: 'ID de viagem inválido' });
    }
    
    const { selectedFlightId, selectedHotelId } = req.body;
    if (!selectedFlightId || !selectedHotelId) {
      return res.status(400).json({ message: 'Seleções incompletas' });
    }
    
    const trip = await storage.getTrip(tripId);
    if (!trip) {
      return res.status(404).json({ message: 'Viagem não encontrada' });
    }
    
    // Verificar se o usuário atual é o dono da viagem
    if (req.user && trip.userId !== (req.user as any).claims?.sub) {
      return res.status(403).json({ message: 'Acesso não autorizado a esta viagem' });
    }
    
    // Atualizar a viagem com as seleções
    const updateData = {
      selectedFlightId,
      selectedHotelId,
      status: 'confirmed'
    };
    
    const updatedTrip = await storage.updateTrip(tripId, updateData);
    
    if (!updatedTrip) {
      return res.status(500).json({ message: 'Erro ao atualizar a viagem' });
    }
    
    // Carregar os dados atualizados da viagem com as seleções
    const newTripData = await storage.getTrip(tripId);
    
    if (!newTripData) {
      return res.status(500).json({ message: 'Erro ao carregar viagem atualizada' });
    }
    
    // Extrair os dados da simulação para incluir nas opções selecionadas
    let simulationData = null;
    if (newTripData.simulationResult) {
      simulationData = typeof newTripData.simulationResult === 'string'
        ? JSON.parse(newTripData.simulationResult)
        : newTripData.simulationResult;
    }
    
    // Encontrar o voo e hotel selecionados para mostrar na resposta
    const selectedFlight = simulationData?.flightOptions?.find((f: any) => f.id === selectedFlightId) || null;
    const selectedHotel = simulationData?.hotelOptions?.find((h: any) => h.id === selectedHotelId) || null;
    
    return res.json({
      ...newTripData,
      selections: {
        flight: selectedFlight,
        hotel: selectedHotel
      }
    });
  } catch (error) {
    console.error('Erro ao confirmar seleções da viagem:', error);
    return res.status(500).json({ message: 'Erro ao processar a solicitação' });
  }
}

// Funções auxiliares para gerar dados simulados
function generateFlightOptions(startDate: Date, endDate: Date) {
  const airlines = [
    { name: 'LATAM', code: 'LA' },
    { name: 'GOL', code: 'G3' },
    { name: 'Azul', code: 'AD' },
    { name: 'TAP Portugal', code: 'TP' },
    { name: 'Emirates', code: 'EK' }
  ];
  
  // Converter datas para objetos Date se forem strings
  const departureDate = typeof startDate === 'string' ? new Date(startDate) : startDate;
  const returnDate = typeof endDate === 'string' ? new Date(endDate) : endDate;
  
  // Criar horas de partida aleatórias para o dia da partida
  const createRandomTime = (baseDate: Date) => {
    const date = new Date(baseDate);
    date.setHours(Math.floor(Math.random() * 24));
    date.setMinutes(Math.floor(Math.random() * 12) * 5); // Minutos em intervalos de 5
    return date;
  };
  
  // Adicionar horas aleatórias para duração do voo
  const addFlightDuration = (departureTime: Date) => {
    const arrivalTime = new Date(departureTime);
    // Duração de 2 a 8 horas
    const durationInMinutes = 120 + Math.floor(Math.random() * 360);
    arrivalTime.setMinutes(arrivalTime.getMinutes() + durationInMinutes);
    return {
      arrivalTime,
      duration: `${Math.floor(durationInMinutes / 60)}h ${durationInMinutes % 60}min`
    };
  };
  
  return Array.from({ length: 3 }, (_, i) => {
    const airline = airlines[Math.floor(Math.random() * airlines.length)];
    const departureTime = createRandomTime(departureDate);
    const { arrivalTime, duration } = addFlightDuration(departureTime);
    const price = 500 + Math.floor(Math.random() * 1500); // Preço entre 500 e 2000
    const stops = Math.floor(Math.random() * 2); // 0 ou 1 paradas
    
    return {
      id: `flight-${i + 1}`,
      airline: airline.name,
      departureTime: departureTime.toISOString(),
      arrivalTime: arrivalTime.toISOString(),
      price: price,
      currency: 'R$',
      duration: duration,
      stops: stops,
      flightNumber: `${airline.code}${1000 + Math.floor(Math.random() * 9000)}`
    };
  });
}

function generateHotelOptions(city: string, country: string, checkIn: Date, checkOut: Date) {
  const hotelNames = [
    'Grand Hotel',
    'Plaza Resort',
    'Ocean View',
    'Central Suites',
    'Skyline Hotel'
  ];
  
  const amenities = [
    'Wi-Fi grátis',
    'Café da manhã',
    'Piscina',
    'Academia',
    'Estacionamento',
    'Ar condicionado',
    'TV a cabo',
    'Restaurante',
    'Bar',
    'Serviço de quarto'
  ];
  
  // Calcular número de noites
  const checkInDate = typeof checkIn === 'string' ? new Date(checkIn) : checkIn;
  const checkOutDate = typeof checkOut === 'string' ? new Date(checkOut) : checkOut;
  const nights = Math.round((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24));
  
  return Array.from({ length: 3 }, (_, i) => {
    const name = hotelNames[Math.floor(Math.random() * hotelNames.length)];
    const rating = (3 + Math.random() * 2).toFixed(1); // Rating entre 3 e 5
    const pricePerNight = 200 + Math.floor(Math.random() * 800); // Preço por noite entre 200 e 1000
    const randomAmenities = amenities
      .sort(() => 0.5 - Math.random())
      .slice(0, 3 + Math.floor(Math.random() * 4)); // 3 a 6 amenidades
    
    return {
      id: `hotel-${i + 1}`,
      name: `${name} ${city}`,
      rating: parseFloat(rating),
      pricePerNight: pricePerNight,
      totalPrice: pricePerNight * nights,
      currency: 'R$',
      amenities: randomAmenities,
      address: `Av. Principal, ${1000 + Math.floor(Math.random() * 9000)}, ${city}, ${country}`,
      imageUrl: `https://source.unsplash.com/random/300x200/?hotel,${i}`
    };
  });
}

function generatePointsOfInterest(city: string, country: string) {
  const poiCategories = [
    'Museu',
    'Parque',
    'Monumento',
    'Praia',
    'Shopping',
    'Restaurante',
    'Mercado',
    'Teatro'
  ];
  
  const poiNames = [
    ['Museu Nacional', 'Museu de Arte Moderna', 'Galeria de História'],
    ['Parque Central', 'Jardim Botânico', 'Reserva Natural'],
    ['Monumento à Independência', 'Estátua da Liberdade', 'Arco do Triunfo'],
    ['Praia Dourada', 'Baia Azul', 'Costa do Sol'],
    ['Shopping Plaza', 'Centro Comercial', 'Galeria de Lojas'],
    ['Restaurante Panorâmico', 'Sabores Locais', 'Cozinha Internacional'],
    ['Mercado Municipal', 'Feira de Artesanato', 'Mercado Tradicional'],
    ['Teatro Municipal', 'Casa de Ópera', 'Centro Cultural']
  ];
  
  return Array.from({ length: 5 }, (_, i) => {
    const categoryIndex = Math.floor(Math.random() * poiCategories.length);
    const category = poiCategories[categoryIndex];
    const name = poiNames[categoryIndex][Math.floor(Math.random() * poiNames[categoryIndex].length)];
    const rating = (3.5 + Math.random() * 1.5).toFixed(1); // Rating entre 3.5 e 5
    const price = category === 'Restaurante' || category === 'Museu' || category === 'Teatro' 
      ? 20 + Math.floor(Math.random() * 180) 
      : null; // Alguns lugares têm preço, outros são gratuitos
    
    // Gerar coordenadas aleatórias próximas
    const baseLat = -23.5505; // Base: São Paulo
    const baseLng = -46.6333;
    const lat = baseLat + (Math.random() - 0.5) * 0.1; // Variação de +/- 0.05
    const lng = baseLng + (Math.random() - 0.5) * 0.1;
    
    return {
      id: `poi-${i + 1}`,
      name: `${name} de ${city}`,
      category: category,
      rating: parseFloat(rating),
      price: price,
      currency: price ? 'R$' : null,
      imageUrl: `https://source.unsplash.com/random/300x200/?${category.toLowerCase()},${i}`,
      description: `Um dos mais famosos pontos de ${category.toLowerCase()} em ${city}, ${country}.`,
      coordinates: {
        lat: lat,
        lng: lng
      }
    };
  });
}