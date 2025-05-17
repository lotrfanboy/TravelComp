import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import * as schema from "@shared/schema";
import dotenv from 'dotenv';
import ws from 'ws';

// Configurar o websocket necessário para o Supabase Serverless
neonConfig.webSocketConstructor = ws;

// Carregar variáveis de ambiente do arquivo .env
dotenv.config();

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL não configurado. Consulte o README-SUPABASE.md para instruções sobre como configurar o banco de dados.",
  );
}

// Configurar a conexão com o Supabase (PostgreSQL)
export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // Supabase precisa de SSL em produção
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Inicializar o Drizzle com o pool de conexões PostgreSQL
export const db = drizzle(pool, { schema });

// Verificar a conexão ao iniciar
pool.connect()
  .then(() => {
    console.log('Conexão com o Supabase estabelecida com sucesso!');
  })
  .catch((err) => {
    console.error('Erro ao conectar com o Supabase:', err.message);
    console.log('Verifique seu DATABASE_URL no arquivo .env.');
  });
