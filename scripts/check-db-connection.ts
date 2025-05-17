/**
 * Script para verificar a conexão com o banco de dados Supabase
 */
import { pool } from '../server/db';
import dotenv from 'dotenv';

// Carregar variáveis de ambiente
dotenv.config();

async function checkDatabaseConnection() {
  console.log('Verificando conexão com o banco de dados...');
  
  try {
    // Testar a conexão 
    const client = await pool.connect();
    const result = await client.query('SELECT NOW() as time');
    client.release();
    
    console.log('\x1b[32m%s\x1b[0m', 'Conexão estabelecida com sucesso!');
    console.log('Timestamp do servidor:', result.rows[0].time);
    
    // Obter informações sobre o servidor de banco de dados
    const client2 = await pool.connect();
    const versionResult = await client2.query('SELECT version()');
    const dbNameResult = await client2.query('SELECT current_database() as db_name');
    client2.release();
    
    console.log('\nInformações do servidor:');
    console.log('\x1b[36m%s\x1b[0m', versionResult.rows[0].version);
    console.log('Banco de dados: \x1b[36m%s\x1b[0m', dbNameResult.rows[0].db_name);
    
    return true;
  } catch (error) {
    console.error('\x1b[31m%s\x1b[0m', 'Erro ao conectar com o banco de dados:');
    console.error(error);
    
    // Verificar URL do banco de dados (sem mostrar senha)
    const dbUrl = process.env.DATABASE_URL || '';
    const sanitizedUrl = dbUrl.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@'); // Ocultar credenciais
    
    console.log('\nVerifique se o DATABASE_URL está correto no seu arquivo .env');
    console.log('URL atual (credenciais ocultadas): \x1b[33m%s\x1b[0m', sanitizedUrl);
    
    console.log('\nPara conectar ao Supabase, você precisa usar:');
    console.log('DATABASE_URL=postgres://postgres:[SUPABASE_PASSWORD]@db.[SUPABASE_PROJECT_ID].supabase.co:5432/postgres');
    
    return false;
  } finally {
    await pool.end();
  }
}

// Executar verificação
checkDatabaseConnection().then((success) => {
  if (success) {
    console.log('\n✓ Seu banco de dados Supabase está corretamente configurado!');
    process.exit(0);
  } else {
    console.log('\n✗ Verifique sua configuração de banco de dados e tente novamente.');
    process.exit(1);
  }
});