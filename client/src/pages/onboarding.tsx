import SimpleOnboardingFlow from "@/components/auth/SimpleOnboardingFlow";
import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "wouter";
import { useEffect } from "react";

export default function Onboarding() {
  const { user, isLoading } = useAuth();
  const [, navigate] = useLocation();

  useEffect(() => {
    // Se não estiver carregando e não tiver usuário, redireciona para o login
    if (!isLoading && !user) {
      navigate("/auth");
    }
  }, [user, isLoading, navigate]);

  // Exibe o fluxo de onboarding apenas se tiver um usuário autenticado
  return <SimpleOnboardingFlow />;
}