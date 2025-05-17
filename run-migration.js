/**
 * Script executável para migração do banco de dados
 * Para rodar: node run-migration.js
 */

console.log('Iniciando script de migração do banco de dados Supabase...');

// Executar o script de migração TypeScript com tsx
const { spawn } = require('child_process');
const dotenv = require('dotenv');

// Carregar variáveis de ambiente
dotenv.config();

// Verificar se a URL do banco de dados está definida
if (!process.env.DATABASE_URL) {
  console.error('\x1b[31m%s\x1b[0m', 'ERRO: DATABASE_URL não está definida no arquivo .env');
  console.log('\x1b[33m%s\x1b[0m', 'Por favor, configure a URL de conexão do Supabase no arquivo .env:');
  console.log('DATABASE_URL=postgres://[usuario]:[senha]@[host]:[porta]/[banco]');
  process.exit(1);
}

// Executar o comando
const migration = spawn('tsx', ['scripts/migrate-db.ts'], {
  stdio: 'inherit',
  shell: true
});

migration.on('error', (error) => {
  console.error('\x1b[31m%s\x1b[0m', 'Erro ao executar o script de migração:', error.message);
  process.exit(1);
});

migration.on('close', (code) => {
  if (code === 0) {
    console.log('\x1b[32m%s\x1b[0m', 'Migração concluída com sucesso!');
  } else {
    console.error('\x1b[31m%s\x1b[0m', `Migração falhou com código de saída ${code}`);
  }
});