import type { Express } from "express";
import { createServer, type Server } from "http";
import crypto from "crypto";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./auth";
import { openai } from "./openai";
import { 
  createPaymentIntent, 
  handleBookingSuccess, 
  getBookingOptions 
} from "./stripe";
import {
  createPaypalOrder,
  capturePaypalOrder,
  loadPaypalDefault
} from "./paypal";
import { 
  searchHotels, 
  searchAttractions, 
  searchWorkspaces, 
  checkAvailability 
} from "./booking-services";
import { simulateTripCost } from "./trip-simulation";
import { 
  tripValidationSchema, 
  workspaceValidationSchema, 
  insertCommentSchema,
  insertNotificationSchema
} from "@shared/schema";
import { z } from "zod";
import { ZodError } from "zod-validation-error";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Debug endpoint - remove in production
  app.get('/api/db-check', async (req, res) => {
    try {
      console.log("Checking database tables...");
      const userCount = await storage.getUserCount();
      console.log(`User count: ${userCount}`);
      res.json({ 
        status: "Database check complete", 
        tables: {
          users: { count: userCount }
        }
      });
    } catch (error) {
      console.error("Database check error:", error);
      res.status(500).json({ message: "Database check failed", error: String(error) });
    }
  });
  
  // Environment variables debug endpoint - remove in production
  app.get('/api/env-check', (req, res) => {
    // List the environment variables we want to check, but never display the actual values
    const envVars = [
      'GOOGLE_CLIENT_ID', 
      'GOOGLE_CLIENT_SECRET',
      'SESSION_SECRET',
      'DATABASE_URL'
    ];
    
    const envStatus: Record<string, string> = {};
    
    envVars.forEach(varName => {
      envStatus[varName] = process.env[varName] ? 'set' : 'not set';
    });
    
    console.log("Environment variable status:", envStatus);
    res.json({ env: envStatus });
  });

  // Auth routes
  // Endpoint para registro de usuário
  app.post('/api/register', async (req, res) => {
    try {
      const { email, password, firstName, lastName } = req.body;
      
      // Verificar se o usuário já existe
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ message: "Email already in use" });
      }
      
      // Criar o usuário sem tipo de perfil definido (será definido durante o onboarding)
      const newUser = await storage.createUser({
        id: crypto.randomUUID(),  // Gerar UUID para o ID
        email,
        password,
        firstName,
        lastName,
        role: '', // Papel vazio para indicar que é necessário onboarding
      });
      
      // Não retornar a senha
      const { password: _, ...userWithoutPassword } = newUser;
      
      // Fazer login automático após o registro
      req.login(userWithoutPassword, (err) => {
        if (err) {
          console.error("Error during auto-login after registration:", err);
          return res.status(201).json({ 
            user: userWithoutPassword,
            message: "Registration successful, but failed to auto-login",
            autoLogin: false
          });
        }
        
        // Retornar o usuário e indicar que o auto-login foi bem-sucedido
        res.status(201).json({ 
          user: userWithoutPassword,
          message: "Registration successful",
          autoLogin: true
        });
      });
    } catch (error) {
      console.error("Error registering user:", error);
      res.status(500).json({ message: "Failed to register user" });
    }
  });
  
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      if (!req.user) {
        console.log("No user in request");
        return res.status(401).json({ message: "Unauthorized - no user in session" });
      }
      
      console.log("User in session:", req.user);
      const userId = req.user.id;
      
      if (!userId) {
        console.log("No user ID in request user object");
        return res.status(401).json({ message: "Unauthorized - no user ID" });
      }
      
      const user = await storage.getUser(userId);
      
      if (!user) {
        console.log(`User with ID ${userId} not found in database`);
        return res.status(404).json({ message: "User not found in database" });
      }
      
      // Don't send the password back
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Onboarding routes
  app.post('/api/users/set-role', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { role } = req.body;
      
      if (!role || !['tourist', 'nomad', 'business'].includes(role)) {
        return res.status(400).json({ message: "Invalid role provided" });
      }
      
      const user = await storage.updateUserRole(userId, role);
      
      if (user) {
        // Don't send password
        const { password, ...userWithoutPassword } = user;
        res.json(userWithoutPassword);
      } else {
        res.status(404).json({ message: "User not found" });
      }
    } catch (error) {
      console.error("Error updating user role:", error);
      res.status(500).json({ message: "Failed to update user role" });
    }
  });
  
  // Rota para salvar preferências de usuário após onboarding
  app.post('/api/user/preferences', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { profileType, preferences, purpose } = req.body;
      
      if (!profileType) {
        return res.status(400).json({ message: "Profile type is required" });
      }
      
      // Primeiro atualizamos o papel do usuário com base no tipo de perfil
      const updatedUser = await storage.updateUserRole(userId, profileType);
      
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // TODO: Quando tivermos um schema para preferences, salvar as preferências detalhadas
      // Por enquanto, apenas retornamos sucesso
      
      // Don't send password
      const { password, ...userWithoutPassword } = updatedUser;
      res.json({
        user: userWithoutPassword,
        message: "User preferences saved successfully"
      });
    } catch (error) {
      console.error("Error saving user preferences:", error);
      res.status(500).json({ message: "Failed to save user preferences" });
    }
  });

  // Trip routes
  app.get('/api/trips', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      
      // Buscar viagens reais do banco de dados
      const tripsFromDB = await storage.getTripsByUser(userId);
      
      // Converter os resultados do banco (snake_case) para o formato da API (camelCase)
      // e adicionar campos que podem estar faltando no banco de dados
      const trips = tripsFromDB.map(trip => {
        return {
          ...trip,
          // Convert is_multi_destination para isMultiDestination na resposta para manter compatibilidade com frontend
          isMultiDestination: trip.is_multi_destination || false,
          // Usar destination como mainDestination se mainDestination não estiver no banco
          mainDestination: trip.mainDestination || trip.destination
        };
      });
      
      res.json(trips);
    } catch (error) {
      console.error("Error fetching trips:", error);
      res.status(500).json({ message: "Failed to fetch trips" });
    }
  });

  app.get('/api/trips/:id', isAuthenticated, async (req: any, res) => {
    try {
      const tripId = parseInt(req.params.id);
      const trip = await storage.getTrip(tripId);
      
      if (!trip) {
        return res.status(404).json({ message: "Trip not found" });
      }
      
      // Check if user has access to this trip (owner or organization member)
      const userId = req.user.id;
      if (trip.userId !== userId) {
        // TODO: Check organization membership
        return res.status(403).json({ message: "Not authorized to view this trip" });
      }
      
      res.json(trip);
    } catch (error) {
      console.error("Error fetching trip:", error);
      res.status(500).json({ message: "Failed to fetch trip" });
    }
  });

  app.post('/api/trips', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const tripData = req.body;
      
      // Validate trip data
      try {
        tripValidationSchema.parse({
          ...tripData,
          userId
        });
      } catch (error) {
        if (error instanceof z.ZodError) {
          return res.status(400).json({ message: "Invalid trip data", errors: error.format() });
        }
        throw error;
      }
      
      // Prepara os dados para persistência no banco de dados
      // Renomeia isMultiDestination para is_multi_destination para corresponder à coluna
      const { isMultiDestination, ...cleanTripData } = tripData;
      
      const trip = await storage.createTrip({
        ...cleanTripData,
        userId,
        is_multi_destination: isMultiDestination || false
      });
      
      // Adicione de volta o campo isMultiDestination na resposta
      res.status(201).json({
        ...trip,
        isMultiDestination: tripData.isMultiDestination || false
      });
    } catch (error) {
      console.error("Error creating trip:", error);
      res.status(500).json({ message: "Failed to create trip" });
    }
  });

  app.put('/api/trips/:id', isAuthenticated, async (req: any, res) => {
    try {
      const tripId = parseInt(req.params.id);
      const userId = req.user.id;
      const tripData = req.body;
      
      // Check if trip exists and user owns it
      const existingTrip = await storage.getTrip(tripId);
      if (!existingTrip) {
        return res.status(404).json({ message: "Trip not found" });
      }
      
      if (existingTrip.userId !== userId) {
        // TODO: Check organization membership/permissions
        return res.status(403).json({ message: "Not authorized to update this trip" });
      }
      
      const updatedTrip = await storage.updateTrip(tripId, tripData);
      res.json(updatedTrip);
    } catch (error) {
      console.error("Error updating trip:", error);
      res.status(500).json({ message: "Failed to update trip" });
    }
  });

  app.delete('/api/trips/:id', isAuthenticated, async (req: any, res) => {
    try {
      const tripId = parseInt(req.params.id);
      const userId = req.user.id;
      
      // Check if trip exists and user owns it
      const existingTrip = await storage.getTrip(tripId);
      if (!existingTrip) {
        return res.status(404).json({ message: "Trip not found" });
      }
      
      if (existingTrip.userId !== userId) {
        // TODO: Check organization membership/permissions
        return res.status(403).json({ message: "Not authorized to delete this trip" });
      }
      
      await storage.deleteTrip(tripId);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting trip:", error);
      res.status(500).json({ message: "Failed to delete trip" });
    }
  });

  // Workspace routes
  app.get('/api/workspaces', isAuthenticated, async (req: any, res) => {
    try {
      const { city, country } = req.query;
      
      if (!city || !country) {
        return res.status(400).json({ message: "City and country are required" });
      }
      
      const workspaces = await storage.searchWorkspaces(city, country);
      res.json(workspaces);
    } catch (error) {
      console.error("Error searching workspaces:", error);
      res.status(500).json({ message: "Failed to search workspaces" });
    }
  });

  app.post('/api/workspaces', isAuthenticated, async (req: any, res) => {
    try {
      const workspaceData = req.body;
      
      // Validate workspace data
      try {
        workspaceValidationSchema.parse(workspaceData);
      } catch (error) {
        if (error instanceof z.ZodError) {
          return res.status(400).json({ message: "Invalid workspace data", errors: error.format() });
        }
        throw error;
      }
      
      const workspace = await storage.createWorkspace(workspaceData);
      res.status(201).json(workspace);
    } catch (error) {
      console.error("Error creating workspace:", error);
      res.status(500).json({ message: "Failed to create workspace" });
    }
  });

  // Accommodation routes
  app.get('/api/accommodations', isAuthenticated, async (req: any, res) => {
    try {
      const { city, country, checkIn, checkOut } = req.query;
      
      if (!city || !country || !checkIn || !checkOut) {
        return res.status(400).json({ message: "City, country, check-in and check-out dates are required" });
      }
      
      const checkInDate = new Date(checkIn);
      const checkOutDate = new Date(checkOut);
      
      const accommodations = await storage.searchAccommodations(city, country, checkInDate, checkOutDate);
      res.json(accommodations);
    } catch (error) {
      console.error("Error searching accommodations:", error);
      res.status(500).json({ message: "Failed to search accommodations" });
    }
  });

  app.get('/api/accommodations/search', isAuthenticated, async (req: any, res) => {
    try {
      const { city, country, checkIn, checkOut, price, amenities } = req.query;
      
      if (!city || !country || !checkIn || !checkOut) {
        return res.status(400).json({ message: "City, country, check-in and check-out dates are required" });
      }
      
      const checkInDate = new Date(checkIn);
      const checkOutDate = new Date(checkOut);
      
      // Usar a API de busca de hotéis para buscar acomodações reais
      const searchParams = {
        city,
        country,
        checkIn,
        checkOut,
        adults: req.query.adults || 1,
        rooms: req.query.rooms || 1,
        price: price ? JSON.parse(price) : undefined,
        amenities: amenities ? JSON.parse(amenities) : undefined
      };
      
      let accommodations = await searchHotels(searchParams);
      
      // Se não houver resultados reais, usar dados simulados para desenvolvimento
      if (!accommodations || accommodations.length === 0) {
        // Dados simulados para testes
        accommodations = [
          {
            id: 1,
            name: "Grand Hotel Centro",
            address: `Rua Principal, 123, ${city}`,
            city,
            country,
            type: "hotel",
            pricePerNight: 250.00,
            currency: "BRL",
            amenities: ["wifi", "breakfast", "pool", "parking", "restaurant"],
            rating: 4.7,
            imageUrl: "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=2940&auto=format&fit=crop",
            availability: true
          },
          {
            id: 2,
            name: "Pousada Encanto",
            address: `Avenida Beira Mar, 450, ${city}`,
            city,
            country,
            type: "pousada",
            pricePerNight: 180.00,
            currency: "BRL",
            amenities: ["wifi", "breakfast", "parking"],
            rating: 4.5,
            imageUrl: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?q=80&w=2940&auto=format&fit=crop",
            availability: true
          },
          {
            id: 3,
            name: "Residencial Executivo",
            address: `Rua das Flores, 78, ${city}`,
            city,
            country,
            type: "apartamento",
            pricePerNight: 320.00,
            currency: "BRL",
            amenities: ["wifi", "pool", "gym", "parking"],
            rating: 4.8,
            imageUrl: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=2940&auto=format&fit=crop",
            availability: true
          },
          {
            id: 4,
            name: "Hostel Backpackers",
            address: `Travessa Central, 45, ${city}`,
            city,
            country,
            type: "hostel",
            pricePerNight: 70.00,
            currency: "BRL",
            amenities: ["wifi", "shared_kitchen"],
            rating: 4.2,
            imageUrl: "https://images.unsplash.com/photo-1562884157-d83e6175623e?q=80&w=2948&auto=format&fit=crop",
            availability: true
          },
          {
            id: 5,
            name: "Resort Paradiso",
            address: `Rodovia Litorânea, Km 5, ${city}`,
            city,
            country,
            type: "resort",
            pricePerNight: 550.00,
            currency: "BRL",
            amenities: ["wifi", "breakfast", "pool", "spa", "restaurant", "beach_access"],
            rating: 4.9,
            imageUrl: "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?q=80&w=2949&auto=format&fit=crop",
            availability: false
          }
        ];
      }
      
      // Filtrar por preço se fornecido
      if (price) {
        const priceRange = JSON.parse(price);
        if (priceRange.min !== undefined) {
          accommodations = accommodations.filter(acc => acc.pricePerNight >= priceRange.min);
        }
        if (priceRange.max !== undefined) {
          accommodations = accommodations.filter(acc => acc.pricePerNight <= priceRange.max);
        }
      }
      
      // Filtrar por amenidades se fornecidas
      if (amenities) {
        const amenitiesList = JSON.parse(amenities);
        if (amenitiesList.length > 0) {
          accommodations = accommodations.filter(acc => 
            amenitiesList.every((amenity: string) => 
              acc.amenities.includes(amenity)
            )
          );
        }
      }
      
      res.json(accommodations);
    } catch (error) {
      console.error("Error searching accommodations:", error);
      res.status(500).json({ message: "Failed to search accommodations" });
    }
  });

  // Destination routes
  app.get('/api/destinations/:id', isAuthenticated, async (req: any, res) => {
    try {
      const destinationId = parseInt(req.params.id);
      
      // Simular obtenção de destino específico
      // Em produção, isso viria do banco de dados
      const destination = {
        id: destinationId,
        name: "São Paulo",
        city: "São Paulo",
        country: "Brasil",
        arrivalDate: new Date().toISOString(),
        departureDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        transportTypeToNext: "plane",
        accommodation: "Grand Hotel Centro",
        localNotes: "Capital financeira do Brasil"
      };
      
      res.json(destination);
    } catch (error) {
      console.error("Error fetching destination:", error);
      res.status(500).json({ message: "Failed to fetch destination" });
    }
  });

  app.post('/api/destinations', isAuthenticated, async (req: any, res) => {
    try {
      const { tripId, name, city, country, orderIndex, arrivalDate, departureDate, transportTypeToNext } = req.body;
      
      if (!tripId || !name || !city || !country || !arrivalDate || !departureDate) {
        return res.status(400).json({ message: "Missing required destination fields" });
      }
      
      // Simular criação de destino
      // Em produção, isso seria salvo no banco de dados
      const destination = {
        id: Math.floor(Math.random() * 1000),
        tripId,
        name,
        city,
        country,
        orderIndex: orderIndex || 0,
        arrivalDate,
        departureDate,
        transportTypeToNext,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      res.status(201).json(destination);
    } catch (error) {
      console.error("Error creating destination:", error);
      res.status(500).json({ message: "Failed to create destination" });
    }
  });

  // Flights and transportation routes
  app.get('/api/flights/search', isAuthenticated, async (req: any, res) => {
    try {
      const { city, country, checkIn, transportType } = req.query;
      
      if (!city || !transportType) {
        return res.status(400).json({ message: "Destination city and transport type are required" });
      }
      
      // Simular resultados de voos/transportes
      // Em produção, isso viria de uma API externa de reservas
      const departureDate = new Date(checkIn || Date.now());
      const departureTime = new Date(departureDate);
      departureTime.setHours(10, 0, 0);
      
      const arrivalTime = new Date(departureDate);
      arrivalTime.setHours(14, 30, 0);
      
      // Diferentes opções baseadas no tipo de transporte
      let results = [];
      let priceMultiplier = 1;
      
      switch(transportType) {
        case 'plane':
          priceMultiplier = 2.5;
          results = [
            {
              id: `flight-${Date.now()}-1`,
              airline: "LATAM Airlines",
              flightNumber: "LA1234",
              departureAirport: "GRU",
              departureCity: "São Paulo",
              departureCountry: "Brasil",
              arrivalAirport: city === "Rio de Janeiro" ? "SDU" : "BSB",
              arrivalCity: city,
              arrivalCountry: country || "Brasil",
              departureTime: departureTime.toISOString(),
              arrivalTime: arrivalTime.toISOString(),
              price: Math.round(550 * priceMultiplier),
              currency: "BRL",
              duration: 120,
              stops: 0,
              availability: true
            },
            {
              id: `flight-${Date.now()}-2`,
              airline: "GOL Linhas Aéreas",
              flightNumber: "G31456",
              departureAirport: "GRU",
              departureCity: "São Paulo",
              departureCountry: "Brasil",
              arrivalAirport: city === "Rio de Janeiro" ? "GIG" : "BSB",
              arrivalCity: city,
              arrivalCountry: country || "Brasil",
              departureTime: new Date(departureTime.getTime() + 3 * 60 * 60 * 1000).toISOString(),
              arrivalTime: new Date(arrivalTime.getTime() + 3 * 60 * 60 * 1000).toISOString(),
              price: Math.round(480 * priceMultiplier),
              currency: "BRL",
              duration: 130,
              stops: 0,
              availability: true
            },
            {
              id: `flight-${Date.now()}-3`,
              airline: "Azul Linhas Aéreas",
              flightNumber: "AD2678",
              departureAirport: "VCP",
              departureCity: "Campinas",
              departureCountry: "Brasil",
              arrivalAirport: city === "Rio de Janeiro" ? "SDU" : "CNF",
              arrivalCity: city,
              arrivalCountry: country || "Brasil",
              departureTime: new Date(departureTime.getTime() + 5 * 60 * 60 * 1000).toISOString(),
              arrivalTime: new Date(arrivalTime.getTime() + 6 * 60 * 60 * 1000).toISOString(),
              price: Math.round(420 * priceMultiplier),
              currency: "BRL",
              duration: 150,
              stops: 1,
              availability: true
            }
          ];
          break;
        case 'train':
          priceMultiplier = 0.7;
          results = [
            {
              id: `train-${Date.now()}-1`,
              airline: "Central Ferroviária",
              flightNumber: "TRM102",
              departureAirport: "Estação Central",
              departureCity: "São Paulo",
              departureCountry: "Brasil",
              arrivalAirport: "Estação Principal",
              arrivalCity: city,
              arrivalCountry: country || "Brasil",
              departureTime: departureTime.toISOString(),
              arrivalTime: new Date(departureTime.getTime() + 4 * 60 * 60 * 1000).toISOString(),
              price: Math.round(220 * priceMultiplier),
              currency: "BRL",
              duration: 240,
              stops: 0,
              availability: true
            },
            {
              id: `train-${Date.now()}-2`,
              airline: "Expresso Nacional",
              flightNumber: "EN205",
              departureAirport: "Estação Central",
              departureCity: "São Paulo",
              departureCountry: "Brasil",
              arrivalAirport: "Estação Principal",
              arrivalCity: city,
              arrivalCountry: country || "Brasil",
              departureTime: new Date(departureTime.getTime() + 3 * 60 * 60 * 1000).toISOString(),
              arrivalTime: new Date(departureTime.getTime() + 7 * 60 * 60 * 1000).toISOString(),
              price: Math.round(180 * priceMultiplier),
              currency: "BRL",
              duration: 240,
              stops: 2,
              availability: true
            }
          ];
          break;
        case 'bus':
          priceMultiplier = 0.5;
          results = [
            {
              id: `bus-${Date.now()}-1`,
              airline: "Viação Cometa",
              flightNumber: "VC1020",
              departureAirport: "Terminal Tietê",
              departureCity: "São Paulo",
              departureCountry: "Brasil",
              arrivalAirport: "Terminal Central",
              arrivalCity: city,
              arrivalCountry: country || "Brasil",
              departureTime: departureTime.toISOString(),
              arrivalTime: new Date(departureTime.getTime() + 6 * 60 * 60 * 1000).toISOString(),
              price: Math.round(150 * priceMultiplier),
              currency: "BRL",
              duration: 360,
              stops: 1,
              availability: true
            },
            {
              id: `bus-${Date.now()}-2`,
              airline: "Itapemirim",
              flightNumber: "IT304",
              departureAirport: "Terminal Tietê",
              departureCity: "São Paulo",
              departureCountry: "Brasil",
              arrivalAirport: "Terminal Central",
              arrivalCity: city,
              arrivalCountry: country || "Brasil",
              departureTime: new Date(departureTime.getTime() + 2 * 60 * 60 * 1000).toISOString(),
              arrivalTime: new Date(departureTime.getTime() + 9 * 60 * 60 * 1000).toISOString(),
              price: Math.round(120 * priceMultiplier),
              currency: "BRL",
              duration: 420,
              stops: 3,
              availability: true
            }
          ];
          break;
        case 'car':
          results = [
            {
              id: `car-${Date.now()}-1`,
              airline: "Localiza",
              flightNumber: "Sedan Econômico",
              departureAirport: "Centro SP",
              departureCity: "São Paulo",
              departureCountry: "Brasil",
              arrivalAirport: "Centro",
              arrivalCity: city,
              arrivalCountry: country || "Brasil",
              departureTime: departureTime.toISOString(),
              arrivalTime: new Date(departureTime.getTime() + 5 * 60 * 60 * 1000).toISOString(),
              price: 280,
              currency: "BRL",
              duration: 300,
              stops: 0,
              availability: true
            },
            {
              id: `car-${Date.now()}-2`,
              airline: "Movida",
              flightNumber: "SUV Compacto",
              departureAirport: "Centro SP",
              departureCity: "São Paulo",
              departureCountry: "Brasil",
              arrivalAirport: "Centro",
              arrivalCity: city,
              arrivalCountry: country || "Brasil",
              departureTime: departureTime.toISOString(),
              arrivalTime: new Date(departureTime.getTime() + 5 * 60 * 60 * 1000).toISOString(),
              price: 350,
              currency: "BRL",
              duration: 300,
              stops: 0,
              availability: true
            }
          ];
          break;
        default:
          results = [];
      }
      
      res.json(results);
    } catch (error) {
      console.error("Error searching flights/transportation:", error);
      res.status(500).json({ message: "Failed to search transportation options" });
    }
  });
  
  // Payment routes
  app.post('/api/create-payment-intent', isAuthenticated, async (req: any, res) => {
    try {
      // Implementando a rota createPaymentIntent do módulo de stripe
      await createPaymentIntent(req, res);
    } catch (error) {
      console.error("Error creating payment intent:", error);
      res.status(500).json({ message: "Failed to create payment intent" });
    }
  });
  
  app.post('/api/payment-success', isAuthenticated, async (req: any, res) => {
    try {
      // Implementando rota para lidar com pagamentos bem-sucedidos
      await handleBookingSuccess(req, res);
    } catch (error) {
      console.error("Error handling payment success:", error);
      res.status(500).json({ message: "Failed to process successful payment" });
    }
  });
  
  app.get('/api/payment-options', isAuthenticated, async (req: any, res) => {
    try {
      // Obter opções de pagamento disponíveis
      await getBookingOptions(req, res);
    } catch (error) {
      console.error("Error getting payment options:", error);
      res.status(500).json({ message: "Failed to get payment options" });
    }
  });
  
  // PayPal routes
  app.get('/api/paypal/setup', async (req, res) => {
    await loadPaypalDefault(req, res);
  });

  app.post('/api/paypal/order', async (req, res) => {
    await createPaypalOrder(req, res);
  });

  app.post('/api/paypal/order/:orderID/capture', async (req, res) => {
    await capturePaypalOrder(req, res);
  });
  
  // Booking routes
  app.post('/api/trip-accommodations', isAuthenticated, async (req: any, res) => {
    try {
      const { tripId, destinationId, accommodationId, checkIn, checkOut } = req.body;
      
      if (!tripId || !accommodationId || !checkIn || !checkOut) {
        return res.status(400).json({ message: "Missing required fields" });
      }
      
      // Simular adição de acomodação à viagem
      // Em produção, isso seria salvo no banco de dados
      const result = {
        tripId,
        destinationId,
        accommodationId,
        checkIn,
        checkOut,
        bookingStatus: "confirmed",
        bookingReference: `BOOK-${Date.now()}`,
        createdAt: new Date().toISOString()
      };
      
      res.status(201).json(result);
    } catch (error) {
      console.error("Error adding accommodation to trip:", error);
      res.status(500).json({ message: "Failed to add accommodation to trip" });
    }
  });
  
  app.post('/api/trip-flights', isAuthenticated, async (req: any, res) => {
    try {
      const { tripId, destinationId, flightId, departureTime, arrivalTime, price, currency } = req.body;
      
      if (!tripId || !destinationId || !flightId) {
        return res.status(400).json({ message: "Missing required fields" });
      }
      
      // Simular adição de voo à viagem
      // Em produção, isso seria salvo no banco de dados
      const result = {
        tripId,
        destinationId,
        flightId,
        departureTime,
        arrivalTime,
        price,
        currency,
        bookingStatus: "confirmed",
        bookingReference: `FLT-${Date.now()}`,
        createdAt: new Date().toISOString()
      };
      
      res.status(201).json(result);
    } catch (error) {
      console.error("Error adding flight to trip:", error);
      res.status(500).json({ message: "Failed to add flight to trip" });
    }
  });

  // Attraction routes
  app.get('/api/attractions', isAuthenticated, async (req: any, res) => {
    try {
      const { city, country } = req.query;
      
      if (!city || !country) {
        return res.status(400).json({ message: "City and country are required" });
      }
      
      const attractions = await storage.searchAttractions(city, country);
      res.json(attractions);
    } catch (error) {
      console.error("Error searching attractions:", error);
      res.status(500).json({ message: "Failed to search attractions" });
    }
  });

  // Notification routes
  app.get('/api/notifications', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const notifications = await storage.getNotificationsByUser(userId);
      res.json(notifications);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      res.status(500).json({ message: "Failed to fetch notifications" });
    }
  });

  app.post('/api/notifications/:id/read', isAuthenticated, async (req: any, res) => {
    try {
      const notificationId = parseInt(req.params.id);
      await storage.markNotificationAsRead(notificationId);
      res.status(204).send();
    } catch (error) {
      console.error("Error marking notification as read:", error);
      res.status(500).json({ message: "Failed to mark notification as read" });
    }
  });

  // Visa information routes
  app.get('/api/visa-information', isAuthenticated, async (req: any, res) => {
    try {
      const { country } = req.query;
      
      if (!country) {
        return res.status(400).json({ message: "Country is required" });
      }
      
      const visaInfo = await storage.getVisaInformation(country);
      
      if (!visaInfo) {
        return res.status(404).json({ message: "Visa information not found for this country" });
      }
      
      res.json(visaInfo);
    } catch (error) {
      console.error("Error fetching visa information:", error);
      res.status(500).json({ message: "Failed to fetch visa information" });
    }
  });

  // Comment routes
  app.get('/api/comments', isAuthenticated, async (req: any, res) => {
    try {
      const { entityType, entityId } = req.query;
      
      if (!entityType || !entityId) {
        return res.status(400).json({ message: "Entity type and ID are required" });
      }
      
      const comments = await storage.getCommentsByEntity(entityType, parseInt(entityId));
      res.json(comments);
    } catch (error) {
      console.error("Error fetching comments:", error);
      res.status(500).json({ message: "Failed to fetch comments" });
    }
  });

  app.post('/api/comments', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const commentData = req.body;
      
      // Validate comment data
      try {
        insertCommentSchema.parse({
          ...commentData,
          userId
        });
      } catch (error) {
        if (error instanceof z.ZodError) {
          return res.status(400).json({ message: "Invalid comment data", errors: error.format() });
        }
        throw error;
      }
      
      const comment = await storage.createComment({
        ...commentData,
        userId
      });
      
      res.status(201).json(comment);
    } catch (error) {
      console.error("Error creating comment:", error);
      res.status(500).json({ message: "Failed to create comment" });
    }
  });

  // AI Trip Generation
  app.post('/api/ai/generate-trip', isAuthenticated, async (req: any, res) => {
    try {
      const { destination, startDate, endDate, interests = [], userRole } = req.body;
      
      if (!destination || !startDate || !endDate || !userRole) {
        return res.status(400).json({ message: "Destination, dates, and user role are required" });
      }
      
      let prompt = `Generate a detailed trip plan to ${destination} from ${startDate} to ${endDate}`;
      
      if (interests && interests.length > 0) {
        prompt += ` focusing on these interests: ${interests.join(", ")}.`;
      }
      
      // Add role-specific instructions
      if (userRole === 'tourist') {
        prompt += ` Include top tourist attractions, recommended restaurants, and cultural experiences.`;
      } else if (userRole === 'nomad') {
        prompt += ` Include coworking spaces, cafes with good wifi, long-term accommodation options, and information about digital nomad communities and visa requirements.`;
      } else if (userRole === 'business') {
        prompt += ` Include business-friendly hotels, meeting venues, transportation options for business travelers, and suggested schedules for a business trip.`;
      }
      
      prompt += ` Format the response as a JSON object with the following structure:
      {
        "tripName": "Suggested name for this trip",
        "destination": "${destination}",
        "dates": { "start": "${startDate}", "end": "${endDate}" },
        "summary": "Brief overview of the trip",
        "itinerary": [
          {
            "day": 1,
            "date": "YYYY-MM-DD",
            "activities": [
              { 
                "time": "Morning/Afternoon/Evening", 
                "activity": "Description", 
                "type": "attraction/workspace/dining/accommodation/transport" 
              }
            ]
          }
        ],
        "accommodations": [
          { "name": "Name", "type": "hotel/hostel/apartment", "description": "Brief description" }
        ],
        "workspaces": [
          { "name": "Name", "type": "coworking/cafe", "description": "Brief description", "wifi": "Fast/Medium/Slow" }
        ],
        "visaInfo": { "type": "Type of visa", "duration": "Allowed stay", "requirements": ["Requirement 1", "Requirement 2"] },
        "budget": { "estimated": 1000, "currency": "USD", "breakdown": { "accommodation": 400, "food": 200, "activities": 200, "transport": 200 } }
      }`;
      
      const response = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [
          { role: "system", content: "You are an expert travel planner and itinerary creator with knowledge of global destinations." },
          { role: "user", content: prompt }
        ],
        response_format: { type: "json_object" }
      });
      
      const content = response.choices[0].message.content || '{}';
      const tripSuggestion = JSON.parse(content);
      res.json(tripSuggestion);
    } catch (error) {
      console.error("Error generating trip with AI:", error);
      res.status(500).json({ message: "Failed to generate trip suggestion" });
    }
  });

  // External Booking Platform Integration Routes
  app.get('/api/booking/hotels', isAuthenticated, async (req: any, res) => {
    try {
      const { city, country, checkIn, checkOut, adults = 2, rooms = 1 } = req.query;
      
      if (!city || !country || !checkIn || !checkOut) {
        return res.status(400).json({ message: "City, country, check-in and check-out dates are required" });
      }
      
      const hotels = await searchHotels({
        city: city as string,
        country: country as string,
        checkIn: checkIn as string,
        checkOut: checkOut as string,
        adults: parseInt(adults as string),
        rooms: parseInt(rooms as string)
      });
      
      res.json(hotels);
    } catch (error) {
      console.error("Error searching hotels:", error);
      res.status(500).json({ message: "Failed to search hotels" });
    }
  });
  
  app.get('/api/booking/attractions', isAuthenticated, async (req: any, res) => {
    try {
      const { city, country, date, category } = req.query;
      
      if (!city || !country) {
        return res.status(400).json({ message: "City and country are required" });
      }
      
      const attractions = await searchAttractions({
        city: city as string,
        country: country as string,
        date: date as string,
        category: category as string
      });
      
      res.json(attractions);
    } catch (error) {
      console.error("Error searching attractions:", error);
      res.status(500).json({ message: "Failed to search attractions" });
    }
  });
  
  app.get('/api/booking/workspaces', isAuthenticated, async (req: any, res) => {
    try {
      const { city, country, startDate, endDate, capacity } = req.query;
      
      if (!city || !country) {
        return res.status(400).json({ message: "City and country are required" });
      }
      
      const workspaces = await searchWorkspaces({
        city: city as string,
        country: country as string,
        startDate: startDate as string,
        endDate: endDate as string,
        capacity: capacity ? parseInt(capacity as string) : undefined
      });
      
      res.json(workspaces);
    } catch (error) {
      console.error("Error searching workspaces:", error);
      res.status(500).json({ message: "Failed to search workspaces" });
    }
  });
  
  app.get('/api/booking/check-availability', isAuthenticated, async (req: any, res) => {
    try {
      const { type, id, startDate, endDate } = req.query;
      
      if (!type || !id) {
        return res.status(400).json({ message: "Type and ID are required" });
      }
      
      if (!['hotel', 'attraction', 'workspace'].includes(type as string)) {
        return res.status(400).json({ message: "Invalid booking type" });
      }
      
      const isAvailable = await checkAvailability(
        type as 'hotel' | 'attraction' | 'workspace',
        parseInt(id as string),
        startDate as string,
        endDate as string
      );
      
      res.json({ available: isAvailable });
    } catch (error) {
      console.error("Error checking availability:", error);
      res.status(500).json({ message: "Failed to check availability" });
    }
  });
  
  app.get('/api/booking/options', isAuthenticated, async (req: any, res) => {
    await getBookingOptions(req, res);
  });
  
  // Payment and Booking Confirmation
  app.post('/api/booking/payment', isAuthenticated, async (req: any, res) => {
    await createPaymentIntent(req, res);
  });
  
  app.post('/api/booking/confirm/:paymentIntentId', isAuthenticated, async (req: any, res) => {
    await handleBookingSuccess(req, res);
  });
  
  // PayPal Integration Routes
  app.get('/api/paypal/setup', isAuthenticated, async (req, res) => {
    await loadPaypalDefault(req, res);
  });

  app.post('/api/paypal/order', isAuthenticated, async (req, res) => {
    await createPaypalOrder(req, res);
  });

  app.post('/api/paypal/order/:orderID/capture', isAuthenticated, async (req, res) => {
    await capturePaypalOrder(req, res);
  });
  
  // Trip cost simulation endpoint
  app.post('/api/trip/cost-simulation', isAuthenticated, async (req: any, res) => {
    try {
      // Utilizamos a função simulateTripCost que implementamos
      // para processar a requisição e gerar resultados dinâmicos
      await simulateTripCost(req, res);
    } catch (error) {
      console.error("Erro ao simular custos de viagem:", error);
      res.status(500).json({ 
        message: "Erro ao processar simulação", 
        error: String(error) 
      });
    }
  });
  
  // Só precisamos do servidor HTTP no final
  const httpServer = createServer(app);
  return httpServer;
}
