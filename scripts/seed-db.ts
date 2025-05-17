/**
 * Script para gerar dados iniciais no banco de dados
 */
import { db, pool } from '../server/db';
import * as schema from '../shared/schema';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

// Carrega as variáveis de ambiente
dotenv.config();

async function seedDatabase() {
  try {
    console.log('Iniciando geração de dados iniciais...');
    
    // Gerar hash para senha demo
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('senha123', salt);
    
    // Inserir usuário administrador
    console.log('Criando usuário administrador...');
    const [admin] = await db.insert(schema.users).values({
      id: '1',
      email: 'admin@example.com',
      password: hashedPassword,
      firstName: 'Admin',
      lastName: 'User',
      role: schema.UserRole.BUSINESS,
      createdAt: new Date(),
      updatedAt: new Date()
    }).returning();
    
    console.log(`Usuário admin criado com ID: ${admin.id}`);
    
    // Inserir usuário turista
    console.log('Criando usuário turista...');
    const [tourist] = await db.insert(schema.users).values({
      id: '2',
      email: 'turista@example.com',
      password: hashedPassword,
      firstName: 'Turista',
      lastName: 'Exemplo',
      role: schema.UserRole.TOURIST,
      createdAt: new Date(),
      updatedAt: new Date()
    }).returning();
    
    console.log(`Usuário turista criado com ID: ${tourist.id}`);
    
    // Inserir usuário nômade digital
    console.log('Criando usuário nômade digital...');
    const [nomad] = await db.insert(schema.users).values({
      id: '3',
      email: 'nomade@example.com',
      password: hashedPassword,
      firstName: 'Nômade',
      lastName: 'Digital',
      role: schema.UserRole.NOMAD,
      createdAt: new Date(),
      updatedAt: new Date()
    }).returning();
    
    console.log(`Usuário nômade criado com ID: ${nomad.id}`);
    
    // Criar alguns destinos populares
    console.log('Criando atrações...');
    // Inserir uma atração por vez para evitar erros de tipagem
    await db.insert(schema.attractions).values({
      name: 'Cristo Redentor',
      description: 'Estátua icônica do Rio de Janeiro com vista panorâmica da cidade',
      city: 'Rio de Janeiro',
      country: 'Brasil',
      type: 'landmark',
      price: 50,
      currency: 'BRL',
      rating: 4.8,
      imageUrl: 'https://example.com/cristo.jpg',
      website: 'https://cristoredentoroficial.com.br'
    });
    
    await db.insert(schema.attractions).values({
      name: 'Praia de Copacabana',
      description: 'Uma das praias mais famosas do mundo',
      city: 'Rio de Janeiro',
      country: 'Brasil',
      type: 'beach',
      price: 0,
      currency: 'BRL',
      rating: 4.6,
      imageUrl: 'https://example.com/copacabana.jpg',
      website: 'https://visit.rio/copacabana'
    });
    
    await db.insert(schema.attractions).values({
      name: 'Parque Ibirapuera',
      description: 'Maior parque urbano de São Paulo',
      city: 'São Paulo',
      country: 'Brasil',
      type: 'park',
      price: 0,
      currency: 'BRL',
      rating: 4.7,
      imageUrl: 'https://example.com/ibirapuera.jpg',
      website: 'https://parqueibirapuera.org'
    });
    
    console.log('Criando acomodações...');
    // Inserir uma acomodação por vez para evitar erros de tipagem
    await db.insert(schema.accommodations).values({
      name: 'Hotel Copacabana Palace',
      address: 'Av. Atlântica, 1702 - Copacabana',
      city: 'Rio de Janeiro',
      country: 'Brasil',
      type: 'hotel',
      pricePerNight: 1500,
      currency: 'BRL',
      amenities: JSON.stringify(['Wi-Fi', 'Piscina', 'Academia', 'Restaurante']),
      rating: 4.9,
      imageUrl: 'https://example.com/copacabana-palace.jpg',
      website: 'https://belmond.com/copacabana-palace'
    });
    
    await db.insert(schema.accommodations).values({
      name: 'Selina Lapa',
      address: 'R. do Lavradio, 95 - Lapa',
      city: 'Rio de Janeiro',
      country: 'Brasil',
      type: 'hostel',
      pricePerNight: 120,
      currency: 'BRL',
      amenities: JSON.stringify(['Wi-Fi', 'Cozinha compartilhada', 'Bar', 'Coworking']),
      rating: 4.5,
      imageUrl: 'https://example.com/selina-lapa.jpg',
      website: 'https://selina.com/brazil/rio-lapa'
    });
    
    await db.insert(schema.accommodations).values({
      name: 'Apartamento em Pinheiros',
      address: 'R. dos Pinheiros, 1000',
      city: 'São Paulo',
      country: 'Brasil',
      type: 'apartment',
      pricePerNight: 350,
      currency: 'BRL',
      amenities: JSON.stringify(['Wi-Fi', 'Cozinha completa', 'Ar-condicionado', 'TV']),
      rating: 4.7,
      imageUrl: 'https://example.com/apto-pinheiros.jpg',
      website: 'https://airbnb.com/rooms/12345'
    });
    
    console.log('Criando espaços de trabalho...');
    // Inserir um workspace por vez para evitar erros de tipagem
    await db.insert(schema.workspaces).values({
      name: 'WeWork Paulista',
      address: 'Av. Paulista, 1000',
      city: 'São Paulo',
      country: 'Brasil',
      type: 'coworking',
      wifiSpeed: 200,
      price: 50,
      currency: 'BRL',
      amenities: JSON.stringify(['Wi-Fi de alta velocidade', 'Salas de reunião', 'Café grátis', 'Impressora']),
      rating: 4.6,
      imageUrl: 'https://example.com/wework-paulista.jpg',
      website: 'https://wework.com/sao-paulo'
    });
    
    await db.insert(schema.workspaces).values({
      name: 'Selina Medellin',
      address: 'Calle 10 #41-66',
      city: 'Medellín',
      country: 'Colômbia',
      type: 'coworking',
      wifiSpeed: 150,
      price: 30,
      currency: 'USD',
      amenities: JSON.stringify(['Wi-Fi', 'Café', 'Área externa', 'Eventos']),
      rating: 4.8,
      imageUrl: 'https://example.com/selina-medellin.jpg',
      website: 'https://selina.com/colombia/medellin'
    });
    
    // Criar algumas viagens de exemplo
    console.log('Criando viagens de exemplo...');
    
    try {
      // Viagem para o turista
      const touristTripData = {
        name: 'Férias no Rio',
        userId: tourist.id,
        startDate: new Date('2025-07-15'),
        endDate: new Date('2025-07-22'),
        destination: 'Rio de Janeiro',
        country: 'Brasil',
        tripType: schema.TripType.LEISURE,
        budget: '5000', // Convertido para string para compatibilidade
        currency: 'BRL',
        status: 'planned',
        travelers: 2
      };
      
      const queryTourist = `
        INSERT INTO trips (name, user_id, start_date, end_date, destination, country, trip_type, budget, currency, status, travelers)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        RETURNING *
      `;
      
      const touristTripResult = await db.execute(queryTourist, [
        touristTripData.name,
        touristTripData.userId,
        touristTripData.startDate,
        touristTripData.endDate,
        touristTripData.destination,
        touristTripData.country,
        touristTripData.tripType,
        touristTripData.budget,
        touristTripData.currency,
        touristTripData.status,
        touristTripData.travelers
      ]);
      
      const tripTourist = touristTripResult.rows[0];
      console.log(`Viagem para turista criada com ID: ${tripTourist.id}`);
      
      // Viagem para o nômade
      const nomadTripData = {
        name: 'Temporada em São Paulo',
        userId: nomad.id,
        startDate: new Date('2025-08-01'),
        endDate: new Date('2025-09-30'),
        destination: 'São Paulo',
        country: 'Brasil',
        isMultiDestination: false,
        tripType: schema.TripType.WORK,
        budget: '8000', // Convertido para string para compatibilidade
        currency: 'BRL',
        status: 'planning',
        travelers: 1
      };
      
      const queryNomad = `
        INSERT INTO trips (name, user_id, start_date, end_date, destination, country, is_multi_destination, trip_type, budget, currency, status, travelers)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        RETURNING *
      `;
      
      const nomadTripResult = await db.execute(queryNomad, [
        nomadTripData.name,
        nomadTripData.userId,
        nomadTripData.startDate,
        nomadTripData.endDate,
        nomadTripData.destination,
        nomadTripData.country,
        nomadTripData.isMultiDestination,
        nomadTripData.tripType,
        nomadTripData.budget,
        nomadTripData.currency,
        nomadTripData.status,
        nomadTripData.travelers
      ]);
      
      const tripNomad = nomadTripResult.rows[0];
      console.log(`Viagem para nômade criada com ID: ${tripNomad.id}`);
    } catch (error) {
      console.error('Erro ao criar viagens:', error);
    }
    
    console.log('Dados iniciais gerados com sucesso!');
    
  } catch (error) {
    console.error('Erro ao gerar dados iniciais:', error);
  } finally {
    await pool.end();
    console.log('Conexão com o banco de dados encerrada.');
  }
}

// Executar o script
seedDatabase().then(() => {
  console.log('Script finalizado.');
  process.exit(0);
});