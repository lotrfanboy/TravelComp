/**
 * Componente de exemplo para demonstrar o uso do cliente Supabase
 * 
 * Este componente mostra como fazer consultas ao Supabase diretamente do frontend,
 * utilizando React Query para cache e gestão de estado.
 */
import { useQuery } from "@tanstack/react-query";
import { supabase, useSupabaseQuery } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export default function SupabaseExample() {
  const { toast } = useToast();
  const [initialized, setInitialized] = useState(false);
  
  // Exemplo de consulta usando o hook personalizado
  const tripsQueryConfig = useSupabaseQuery('trips', ['trips'], {
    orderBy: { column: 'created_at', ascending: false },
    limit: 5
  });
  
  // Usar React Query para executar a consulta
  const { data: trips, isLoading, error, refetch } = useQuery(tripsQueryConfig);
  
  // Função para verificar a configuração do Supabase
  const checkSupabaseConfig = async () => {
    try {
      // Tentar conectar ao Supabase
      const { data, error } = await supabase.from('trips').select('count').limit(1);
      
      if (error) {
        toast({
          title: "Erro ao conectar com Supabase",
          description: error.message,
          variant: "destructive"
        });
        return;
      }
      
      // Conexão bem-sucedida
      setInitialized(true);
      toast({
        title: "Conexão com Supabase estabelecida",
        description: "A conexão com o banco de dados Supabase foi estabelecida com sucesso.",
        variant: "default"
      });
      
      // Recarregar dados
      refetch();
    } catch (error: any) {
      toast({
        title: "Erro ao verificar Supabase",
        description: error.message || "Ocorreu um erro ao verificar a configuração do Supabase.",
        variant: "destructive"
      });
    }
  };

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>Exemplo de Integração com Supabase</CardTitle>
        <CardDescription>
          Demonstração de consulta ao banco de dados Supabase diretamente do frontend
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="flex justify-between items-center">
          <Button 
            onClick={checkSupabaseConfig}
            variant="outline"
          >
            Verificar Configuração
          </Button>
          
          <div className="text-sm">
            Status: {initialized ? (
              <span className="text-green-500 font-medium">Conectado</span>
            ) : (
              <span className="text-amber-500 font-medium">Não inicializado</span>
            )}
          </div>
        </div>
        
        <div className="border rounded-md p-4">
          <h3 className="text-lg font-medium mb-2">Últimas 5 viagens (via Supabase)</h3>
          
          {isLoading && (
            <div className="py-4 text-center text-muted-foreground">
              Carregando dados...
            </div>
          )}
          
          {error && (
            <div className="py-4 text-center text-destructive">
              Erro ao carregar dados: {(error as Error).message}
            </div>
          )}
          
          {!isLoading && !error && trips?.length === 0 && (
            <div className="py-4 text-center text-muted-foreground">
              Nenhuma viagem encontrada
            </div>
          )}
          
          {!isLoading && !error && trips?.length > 0 && (
            <ul className="space-y-2">
              {trips.map((trip: any) => (
                <li key={trip.id} className="border-b pb-2">
                  <div className="font-medium">{trip.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {trip.destination}, {trip.country} • {trip.start_date && new Date(trip.start_date).toLocaleDateString()}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
        
        <div className="text-xs text-muted-foreground mt-4">
          <p>
            <strong>Nota:</strong> Para usar este componente, você precisa configurar as variáveis de ambiente 
            VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no arquivo .env
          </p>
        </div>
      </CardContent>
    </Card>
  );
}