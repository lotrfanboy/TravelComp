/**
 * Script para verificar a configuração do Supabase e testar a conexão
 */
import dotenv from 'dotenv';
import { pool } from '../server/db';

// Carregar variáveis de ambiente
dotenv.config();

async function verifySupabaseSetup() {
  console.log('\n🚀 VERIFICANDO CONFIGURAÇÃO DO SUPABASE');
  console.log('=====================================================');
  
  // Verificar se a variável de ambiente DATABASE_URL está definida
  if (!process.env.DATABASE_URL) {
    console.error('\n❌ DATABASE_URL não está definido no arquivo .env');
    console.log('\nPara configurar o Supabase:');
    console.log('1. Crie um projeto no Supabase: https://app.supabase.io/');
    console.log('2. Acesse as configurações do banco de dados (Settings > Database)');
    console.log('3. Copie a URI de conexão da seção "Connection Pooling"');
    console.log('4. Substitua a senha no DATABASE_URL e adicione ao arquivo .env');
    console.log('\nFormato do DATABASE_URL:');
    console.log('DATABASE_URL=postgres://postgres:[SENHA]@db.[PROJETO-ID].supabase.co:5432/postgres');
    return false;
  }
  
  // Verificar formato da URL do banco de dados para Supabase
  const dbUrl = process.env.DATABASE_URL;
  
  if (!dbUrl.includes('supabase.co')) {
    console.log('\n⚠️ O DATABASE_URL não parece ser do Supabase.');
    console.log('O formato esperado é: postgres://postgres:[SENHA]@db.[PROJETO-ID].supabase.co:5432/postgres');
    console.log('\nSe você está usando outro provedor PostgreSQL, esta mensagem pode ser ignorada.');
  }
  
  // Testar a conexão com o banco de dados
  try {
    console.log('\n🔍 Testando conexão com o banco de dados...');
    
    const client = await pool.connect();
    const result = await client.query('SELECT NOW() as time');
    const dbTime = result.rows[0].time;
    
    console.log(`\n✅ Conexão bem-sucedida!\n`);
    console.log(`🕒 Hora do servidor: ${dbTime}`);
    
    // Obter informações do servidor
    const dbInfo = await client.query('SELECT version(), current_database() as db_name');
    console.log(`\n📊 Informações do servidor:`);
    console.log(`📁 Banco de dados: ${dbInfo.rows[0].db_name}`);
    console.log(`🛢️ Versão: ${dbInfo.rows[0].version.split(',')[0]}`);
    
    // Verificar tabelas existentes
    const tablesQuery = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);
    
    console.log(`\n📋 Tabelas existentes (${tablesQuery.rowCount}):`);
    
    if (tablesQuery.rowCount === 0) {
      console.log('   Nenhuma tabela encontrada. Execute o script de migração:');
      console.log('   $ npm run db:migrate');
    } else {
      tablesQuery.rows.forEach((row, index) => {
        console.log(`   ${index + 1}. ${row.table_name}`);
      });
    }
    
    client.release();
    return true;
  } catch (error: any) {
    console.error('\n❌ Erro ao conectar com o banco de dados:');
    console.error(`   ${error.message}`);
    
    if (error.message.includes('no pg_hba.conf entry')) {
      console.log('\n💡 Este erro geralmente indica um problema com as regras de acesso do Supabase.');
      console.log('Verifique se você habilitou o acesso externo nas configurações do Supabase.');
    }
    
    if (error.message.includes('password authentication failed')) {
      console.log('\n💡 A senha no DATABASE_URL parece estar incorreta.');
      console.log('Verifique a senha do seu projeto Supabase e atualize a URL no arquivo .env');
    }
    
    if (error.message.includes('getaddrinfo')) {
      console.log('\n💡 Não foi possível resolver o endereço do servidor.');
      console.log('Verifique se o ID do projeto Supabase está correto no DATABASE_URL.');
    }
    
    console.log('\n📝 Formato correto da URL do Supabase:');
    console.log('DATABASE_URL=postgres://postgres:[SENHA]@db.[PROJETO-ID].supabase.co:5432/postgres');
    
    return false;
  } finally {
    await pool.end();
  }
}

// Executar verificação
verifySupabaseSetup().then((success) => {
  if (success) {
    console.log('\n✨ Configuração do Supabase está correta e pronta para uso!');
    console.log('\nPróximos passos:');
    console.log('1. Execute a migração para criar as tabelas: npm run db:migrate');
    console.log('2. Popule o banco com dados de exemplo: npm run db:seed');
    process.exit(0);
  } else {
    console.log('\n⚠️ Corrija os problemas de configuração e tente novamente.');
    process.exit(1);
  }
});