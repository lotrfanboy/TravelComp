/**
 * Cliente Supabase para uso no frontend
 * 
 * Este cliente permite acesso direto ao banco de dados Supabase do lado do cliente
 * Útil para operações em tempo real e queries simples
 */
import { createClient } from '@supabase/supabase-js';

// Verificar se as variáveis de ambiente estão configuradas
// Nota: Não mostra erro no desenvolvimento inicial, apenas informativo
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Definir tipos simplificados para o Supabase
export type Database = {
  public: {
    Tables: {
      users: { Row: any },
      trips: { Row: any },
      workspaces: { Row: any },
      accommodations: { Row: any },
      attractions: { Row: any },
      destinations: { Row: any },
      notifications: { Row: any }
    }
  }
}

// Inicializar cliente mesmo sem as credenciais para evitar erros de compilação
let supabaseClient: any;

try {
  /**
   * Cliente do Supabase para o frontend
   * 
   * Permite acesso direto ao banco de dados Supabase para consultas e operações.
   * Use com cautela, respeitando as políticas de segurança do banco de dados.
   */
  supabaseClient = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
      autoRefreshToken: true,
      persistSession: true
    }
  });
  
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.warn('AVISO: Variáveis de ambiente do Supabase não configuradas.');
    console.warn('Para usar o Supabase, adicione as variáveis VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY ao arquivo .env');
  } else {
    console.log('Cliente Supabase inicializado com sucesso!');
  }
} catch (error) {
  console.error('Erro ao inicializar cliente Supabase:', error);
  // Criar um cliente vazio para evitar erros de compilação
  supabaseClient = createClient('', '');
}

// Exportar o cliente
export const supabase = supabaseClient;

/**
 * Hook para obter dados do Supabase de forma otimizada
 * 
 * @example
 * // No seu componente React:
 * const tripsQuery = useSupabaseQuery('trips', ['trips', userId], {
 *   filters: [{ column: 'user_id', operator: 'eq', value: userId }],
 *   orderBy: { column: 'created_at', ascending: false },
 *   limit: 10
 * });
 * 
 * // Então use com React Query:
 * const { data, isLoading } = useQuery(tripsQuery);
 * 
 * @param tableName Nome da tabela no Supabase
 * @param queryKey Chave para armazenamento em cache (React Query)
 * @param options Opções adicionais de consulta
 * @returns Configuração para useQuery do React Query
 */
export const useSupabaseQuery = (tableName: string, queryKey: string[], options?: {
  filters?: Array<{ column: string, operator: string, value: any }>,
  orderBy?: { column: string, ascending: boolean },
  limit?: number
}) => {
  const fetchData = async () => {
    let query = supabase.from(tableName).select('*');
    
    // Aplicar filtros, ordenação e paginação, se fornecidos
    if (options?.filters) {
      options.filters.forEach((filter) => {
        // @ts-ignore - Tipagem flexível para permitir diferentes operadores
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