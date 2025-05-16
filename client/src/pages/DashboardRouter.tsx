import { useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";

/**
 * Componente DashboardRouter
 * 
 * Este componente serve como um roteador intermediário que direciona o usuário
 * para o dashboard apropriado com base em seu tipo de perfil/papel (role).
 * 
 * Fluxo:
 * 1. Usuário faz login ou conclui o onboarding
 * 2. É redirecionado para este componente
 * 3. Este componente verifica o papel do usuário e redireciona para o dashboard correto
 */
export default function DashboardRouter() {
  const [, navigate] = useLocation();
  const { user, isLoading, isAuthenticated } = useAuth();

  useEffect(() => {
    // Se não estiver autenticado, redirecionar para a página de login
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Acesso não autorizado",
        description: "Você precisa fazer login para acessar esta página",
        variant: "destructive"
      });
      navigate("/auth");
      return;
    }

    // Se estiver carregando, aguardar
    if (isLoading) {
      return;
    }

    // Se estiver autenticado e tiver os dados do usuário
    if (user) {
      // Verificar se o usuário já completou o onboarding (tem um papel definido)
      if (!user.role || user.role === "") {
        // Se não tiver concluído o onboarding, redirecionar para ele
        navigate("/onboarding");
        return;
      }

      // Redirecionar com base no papel/perfil do usuário
      switch (user.role) {
        case "nomad":
          navigate("/nomad-dashboard");
          break;
        case "business":
          navigate("/business-dashboard");
          break;
        default:
          // Para "tourist" e outros perfis
          navigate("/dashboard");
      }
    }
  }, [user, isLoading, isAuthenticated, navigate]);

  // Enquanto carrega, mostrar um indicador de carregamento
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-white to-[#88C2BF]/10">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-12 w-12 text-[#19B4B0] animate-spin" />
        <h2 className="text-xl font-medium text-[#434342]">Direcionando para seu dashboard...</h2>
        <p className="text-sm text-[#434342]/70">
          Estamos preparando seu ambiente personalizado.
        </p>
      </div>
    </div>
  );
}