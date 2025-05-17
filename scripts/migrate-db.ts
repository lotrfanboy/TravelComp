/**
 * Script para migração do banco de dados usando Drizzle
 */
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { db, pool } from '../server/db';
import { config } from '../server/config';
import * as dotenv from 'dotenv';

// Carrega as variáveis de ambiente
dotenv.config();

console.log('Iniciando migração do banco de dados...');
console.log(`Ambiente: ${config.server.environment}`);

// Função de migração
async function runMigration() {
  try {
    console.log('Conectando ao banco de dados...');
    
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL não está definido. Verifique suas variáveis de ambiente.');
    }

    console.log('Executando migrações...');
    // Este comando executa todas as migrações pendentes
    await migrate(db, { migrationsFolder: 'drizzle/migrations' });
    
    console.log('Migrações concluídas com sucesso!');
  } catch (error) {
    console.error('Erro durante a migração do banco de dados:', error);
    process.exit(1);
  } finally {
    // Fechar a conexão com o banco de dados
    await pool.end();
    console.log('Conexão com o banco de dados encerrada.');
  }
}

// Executa a migração
runMigration().then(() => {
  console.log('Processo de migração finalizado.');
  process.exit(0);
});