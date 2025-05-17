/**
 * Script para migração do banco de dados usando Drizzle
 */
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import { db, pool } from '../server/db';
import * as schema from '../shared/schema';
import dotenv from 'dotenv';

// Carregar variáveis de ambiente
dotenv.config();

async function runMigration() {
  console.log('Iniciando migração do banco de dados...');
  
  try {
    // Tentar criar as tabelas diretamente do schema (push)
    console.log('Criando tabelas a partir do schema...');
    
    // Tabela de sessões
    try {
      console.log('Criando tabela de sessões...');
      await db.execute(`
        CREATE TABLE IF NOT EXISTS sessions (
          sid VARCHAR PRIMARY KEY,
          sess JSONB NOT NULL,
          expire TIMESTAMP NOT NULL
        )
      `);
      await db.execute(`
        CREATE INDEX IF NOT EXISTS IDX_session_expire ON sessions(expire)
      `);
      console.log('✓ Tabela de sessões criada com sucesso');
    } catch (error) {
      console.error('Erro ao criar tabela de sessões:', error);
    }
    
    // Tabela de usuários
    try {
      console.log('Criando tabela de usuários...');
      await db.execute(`
        CREATE TABLE IF NOT EXISTS users (
          id VARCHAR PRIMARY KEY,
          email VARCHAR UNIQUE,
          password VARCHAR,
          first_name VARCHAR,
          last_name VARCHAR,
          profile_image_url VARCHAR,
          role VARCHAR,
          organization_id INTEGER,
          preferences JSONB,
          created_at TIMESTAMP DEFAULT now(),
          updated_at TIMESTAMP DEFAULT now()
        )
      `);
      console.log('✓ Tabela de usuários criada com sucesso');
    } catch (error) {
      console.error('Erro ao criar tabela de usuários:', error);
    }
    
    // Tabela de organizações
    try {
      console.log('Criando tabela de organizações...');
      await db.execute(`
        CREATE TABLE IF NOT EXISTS organizations (
          id SERIAL PRIMARY KEY,
          name VARCHAR NOT NULL,
          type VARCHAR NOT NULL,
          subscription_status VARCHAR,
          subscription_plan VARCHAR,
          subscription_end_date TIMESTAMP,
          logo_url VARCHAR,
          created_at TIMESTAMP DEFAULT now(),
          updated_at TIMESTAMP DEFAULT now()
        )
      `);
      console.log('✓ Tabela de organizações criada com sucesso');
    } catch (error) {
      console.error('Erro ao criar tabela de organizações:', error);
    }
    
    // Tabela de viagens
    try {
      console.log('Criando tabela de viagens...');
      await db.execute(`
        CREATE TABLE IF NOT EXISTS trips (
          id SERIAL PRIMARY KEY,
          name VARCHAR NOT NULL,
          user_id VARCHAR NOT NULL,
          organization_id INTEGER,
          trip_type VARCHAR NOT NULL,
          start_date TIMESTAMP,
          end_date TIMESTAMP,
          destination VARCHAR NOT NULL,
          country VARCHAR NOT NULL,
          is_multi_destination BOOLEAN DEFAULT false,
          budget VARCHAR,
          currency VARCHAR DEFAULT 'USD',
          status VARCHAR DEFAULT 'planning',
          notes TEXT,
          travelers INTEGER DEFAULT 1,
          created_at TIMESTAMP DEFAULT now(),
          updated_at TIMESTAMP DEFAULT now(),
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )
      `);
      console.log('✓ Tabela de viagens criada com sucesso');
    } catch (error) {
      console.error('Erro ao criar tabela de viagens:', error);
    }
    
    // Tabela de atrações
    try {
      console.log('Criando tabela de atrações...');
      await db.execute(`
        CREATE TABLE IF NOT EXISTS attractions (
          id SERIAL PRIMARY KEY,
          name VARCHAR NOT NULL,
          description TEXT,
          type VARCHAR,
          city VARCHAR NOT NULL,
          country VARCHAR NOT NULL,
          price DECIMAL(10,2),
          currency VARCHAR DEFAULT 'USD',
          rating DECIMAL(3,1),
          image_url VARCHAR,
          website VARCHAR,
          created_at TIMESTAMP DEFAULT now(),
          updated_at TIMESTAMP DEFAULT now()
        )
      `);
      console.log('✓ Tabela de atrações criada com sucesso');
    } catch (error) {
      console.error('Erro ao criar tabela de atrações:', error);
    }
    
    // Tabela de acomodações
    try {
      console.log('Criando tabela de acomodações...');
      await db.execute(`
        CREATE TABLE IF NOT EXISTS accommodations (
          id SERIAL PRIMARY KEY,
          name VARCHAR NOT NULL,
          address VARCHAR,
          type VARCHAR,
          city VARCHAR NOT NULL,
          country VARCHAR NOT NULL,
          price_per_night DECIMAL(10,2),
          currency VARCHAR DEFAULT 'USD',
          amenities JSONB,
          rating DECIMAL(3,1),
          image_url VARCHAR,
          website VARCHAR,
          created_at TIMESTAMP DEFAULT now(),
          updated_at TIMESTAMP DEFAULT now()
        )
      `);
      console.log('✓ Tabela de acomodações criada com sucesso');
    } catch (error) {
      console.error('Erro ao criar tabela de acomodações:', error);
    }
    
    // Tabela de espaços de trabalho
    try {
      console.log('Criando tabela de espaços de trabalho...');
      await db.execute(`
        CREATE TABLE IF NOT EXISTS workspaces (
          id SERIAL PRIMARY KEY,
          name VARCHAR NOT NULL,
          address VARCHAR,
          type VARCHAR,
          city VARCHAR NOT NULL,
          country VARCHAR NOT NULL,
          price DECIMAL(10,2),
          currency VARCHAR DEFAULT 'USD',
          wifi_speed INTEGER,
          amenities JSONB,
          rating DECIMAL(3,1),
          image_url VARCHAR,
          website VARCHAR,
          created_at TIMESTAMP DEFAULT now(),
          updated_at TIMESTAMP DEFAULT now()
        )
      `);
      console.log('✓ Tabela de espaços de trabalho criada com sucesso');
    } catch (error) {
      console.error('Erro ao criar tabela de espaços de trabalho:', error);
    }
    
    // Tabela de notificações
    try {
      console.log('Criando tabela de notificações...');
      await db.execute(`
        CREATE TABLE IF NOT EXISTS notifications (
          id SERIAL PRIMARY KEY,
          user_id VARCHAR NOT NULL,
          title VARCHAR NOT NULL,
          message TEXT NOT NULL,
          type VARCHAR,
          read BOOLEAN DEFAULT false,
          created_at TIMESTAMP DEFAULT now(),
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )
      `);
      console.log('✓ Tabela de notificações criada com sucesso');
    } catch (error) {
      console.error('Erro ao criar tabela de notificações:', error);
    }
    
    // Tabela de informações de vistos
    try {
      console.log('Criando tabela de informações de vistos...');
      await db.execute(`
        CREATE TABLE IF NOT EXISTS visa_information (
          id SERIAL PRIMARY KEY,
          from_country VARCHAR NOT NULL,
          to_country VARCHAR NOT NULL,
          visa_required BOOLEAN NOT NULL,
          visa_type VARCHAR,
          processing_time VARCHAR,
          duration VARCHAR,
          fee DECIMAL(10,2),
          currency VARCHAR DEFAULT 'USD',
          documents JSONB,
          notes TEXT,
          last_updated TIMESTAMP DEFAULT now()
        )
      `);
      console.log('✓ Tabela de informações de vistos criada com sucesso');
    } catch (error) {
      console.error('Erro ao criar tabela de informações de vistos:', error);
    }
    
    // Tabela de comentários
    try {
      console.log('Criando tabela de comentários...');
      await db.execute(`
        CREATE TABLE IF NOT EXISTS comments (
          id SERIAL PRIMARY KEY,
          user_id VARCHAR NOT NULL,
          entity_type VARCHAR NOT NULL,
          entity_id INTEGER NOT NULL,
          content TEXT NOT NULL,
          rating INTEGER,
          created_at TIMESTAMP DEFAULT now(),
          updated_at TIMESTAMP DEFAULT now(),
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )
      `);
      console.log('✓ Tabela de comentários criada com sucesso');
    } catch (error) {
      console.error('Erro ao criar tabela de comentários:', error);
    }
    
    // Tabela de destinos de viagem
    try {
      console.log('Criando tabela de destinos de viagem...');
      await db.execute(`
        CREATE TABLE IF NOT EXISTS trip_destinations (
          id SERIAL PRIMARY KEY,
          trip_id INTEGER NOT NULL,
          destination VARCHAR NOT NULL,
          country VARCHAR NOT NULL,
          arrival_date TIMESTAMP,
          departure_date TIMESTAMP,
          order_number INTEGER,
          created_at TIMESTAMP DEFAULT now(),
          updated_at TIMESTAMP DEFAULT now(),
          FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE CASCADE
        )
      `);
      console.log('✓ Tabela de destinos de viagem criada com sucesso');
    } catch (error) {
      console.error('Erro ao criar tabela de destinos de viagem:', error);
    }
    
    // Tabela de relação viagem-acomodação
    try {
      console.log('Criando tabela de relação viagem-acomodação...');
      await db.execute(`
        CREATE TABLE IF NOT EXISTS trip_accommodations (
          id SERIAL PRIMARY KEY,
          trip_id INTEGER NOT NULL,
          accommodation_id INTEGER NOT NULL,
          check_in TIMESTAMP NOT NULL,
          check_out TIMESTAMP NOT NULL,
          price DECIMAL(10,2),
          currency VARCHAR DEFAULT 'USD',
          booking_reference VARCHAR,
          created_at TIMESTAMP DEFAULT now(),
          updated_at TIMESTAMP DEFAULT now(),
          FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE CASCADE,
          FOREIGN KEY (accommodation_id) REFERENCES accommodations(id) ON DELETE CASCADE
        )
      `);
      console.log('✓ Tabela de relação viagem-acomodação criada com sucesso');
    } catch (error) {
      console.error('Erro ao criar tabela de relação viagem-acomodação:', error);
    }
    
    // Tabela de relação viagem-atração
    try {
      console.log('Criando tabela de relação viagem-atração...');
      await db.execute(`
        CREATE TABLE IF NOT EXISTS trip_attractions (
          id SERIAL PRIMARY KEY,
          trip_id INTEGER NOT NULL,
          attraction_id INTEGER NOT NULL,
          visit_date TIMESTAMP,
          price DECIMAL(10,2),
          currency VARCHAR DEFAULT 'USD',
          notes TEXT,
          created_at TIMESTAMP DEFAULT now(),
          updated_at TIMESTAMP DEFAULT now(),
          FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE CASCADE,
          FOREIGN KEY (attraction_id) REFERENCES attractions(id) ON DELETE CASCADE
        )
      `);
      console.log('✓ Tabela de relação viagem-atração criada com sucesso');
    } catch (error) {
      console.error('Erro ao criar tabela de relação viagem-atração:', error);
    }
    
    // Tabela de relação viagem-workspace
    try {
      console.log('Criando tabela de relação viagem-workspace...');
      await db.execute(`
        CREATE TABLE IF NOT EXISTS trip_workspaces (
          id SERIAL PRIMARY KEY,
          trip_id INTEGER NOT NULL,
          workspace_id INTEGER NOT NULL,
          start_date TIMESTAMP,
          end_date TIMESTAMP,
          price DECIMAL(10,2),
          currency VARCHAR DEFAULT 'USD',
          booking_reference VARCHAR,
          created_at TIMESTAMP DEFAULT now(),
          updated_at TIMESTAMP DEFAULT now(),
          FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE CASCADE,
          FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE
        )
      `);
      console.log('✓ Tabela de relação viagem-workspace criada com sucesso');
    } catch (error) {
      console.error('Erro ao criar tabela de relação viagem-workspace:', error);
    }
    
    console.log('Migração concluída com sucesso!');
    
  } catch (error) {
    console.error('Erro durante a migração:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Executar migração
runMigration();