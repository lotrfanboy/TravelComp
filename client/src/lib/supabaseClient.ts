/**
 * Cliente Supabase para uso no frontend
 * 
 * Este cliente permite acesso direto ao banco de dados Supabase do lado do cliente
 * Útil para operações em tempo real e queries simples
 */
import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/supabase';

// Verificar se as variáveis de ambiente estão configuradas
if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
  console.warn('AVISO: Variáveis de ambiente do Supabase não configuradas. O cliente Supabase frontend não funcionará.');
  console.warn('Configure as variáveis VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no arquivo .env');
}

// Variáveis de ambiente do Supabase para uso no frontend
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

/**
 * Cliente do Supabase para o frontend
 * 
 * Permite acesso direto ao banco de dados Supabase para consultas e operações.
 * Use com cautela, respeitando as políticas de segurança do banco de dados.
 * 
 * @example
 * import { supabase } from '@/lib/supabaseClient';
 * 
 * // Consultar viagens do usuário atual
 * const { data, error } = await supabase
 *   .from('trips')
 *   .select('*')
 *   .eq('user_id', userId);
 */
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

/**
 * Hook para obter dados do Supabase de forma otimizada
 * 
 * @param tableName Nome da tabela no Supabase
 * @param queryKey Chave para armazenamento em cache (React Query)
 * @param options Opções adicionais de consulta
 * @returns Função para buscar dados com React Query
 */
export const useSupabaseQuery = (tableName: string, queryKey: string[], options?: any) => {
  const fetchData = async () => {
    let query = supabase.from(tableName).select('*');
    
    // Aplicar filtros, ordenação e paginação, se fornecidos
    if (options?.filters) {
      options.filters.forEach((filter: any) => {
        query = query.filter(filter.column, filter.operator, filter.value);
      });
    }
    
    if (options?.orderBy) {
      query = query.order(options.orderBy.column, { ascending: options.orderBy.ascending });
    }
    
    if (options?.limit) {
      query = query.limit(options.limit);
    }
    
    const { data, error } = await query;
    
    if (error) {
      throw new Error(`Erro ao buscar dados no Supabase: ${error.message}`);
    }
    
    return data;
  };
  
  return { queryKey, queryFn: fetchData };
};