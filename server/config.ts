import dotenv from 'dotenv';

// Carrega as variáveis de ambiente do arquivo .env
dotenv.config();

// Configuração do servidor e banco de dados
export const config = {
  // Configuração do servidor
  server: {
    port: process.env.PORT || 5000,
    environment: process.env.NODE_ENV || 'development',
  },
  
  // Configuração do banco de dados
  database: {
    url: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production',
  },
  
  // Configuração do Supabase
  supabase: {
    url: process.env.SUPABASE_URL,
    key: process.env.SUPABASE_KEY,
  },
  
  // Configuração de autenticação
  auth: {
    sessionSecret: process.env.SESSION_SECRET || 'default_secret_key_change_in_production',
    googleClientId: process.env.GOOGLE_CLIENT_ID,
    googleClientSecret: process.env.GOOGLE_CLIENT_SECRET,
  },
  
  // Configuração de pagamentos
  payments: {
    stripe: {
      secretKey: process.env.STRIPE_SECRET_KEY,
      publicKey: process.env.VITE_STRIPE_PUBLIC_KEY,
    },
    paypal: {
      clientId: process.env.PAYPAL_CLIENT_ID,
      clientSecret: process.env.PAYPAL_CLIENT_SECRET,
    }
  }
};