import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { toast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";

interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  profileImageUrl?: string;
  role: string;
  preferences?: any; // Support for user preferences 
}

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterData extends LoginCredentials {
  firstName?: string;
  lastName?: string;
  profileType?: string; // Tipo de perfil do usuário (tourist, nomad, business)
}

export function useAuth() {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  // Get current user
  const { data: user, isLoading } = useQuery<User | null>({
    queryKey: ["/api/auth/user"],
    retry: false,
  });

  // Login mutation
  const login = useMutation({
    mutationFn: async (credentials: LoginCredentials) => {
      const response = await apiRequest({
        url: "/api/login",
        method: "POST",
        body: JSON.stringify(credentials),
        headers: {
          "Content-Type": "application/json",
        },
      });
      return response.json();
    },
    onSuccess: () => {
      // Invalida a consulta de usuário para obter os dados atualizados
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      
      toast({
        title: t('auth.loginSuccess', 'Login realizado com sucesso'),
        description: t('auth.welcomeBack', 'Bem-vindo de volta!'),
      });
      
      // Redireciona para uma página intermediária que fará o redirecionamento
      // para o dashboard apropriado após carregar os dados do usuário
      window.location.href = "/dashboard-router";
    },
    onError: (error: any) => {
      toast({
        title: t('auth.loginFailed', 'Falha no login'),
        description: error.message || t('auth.checkCredentials', 'Verifique suas credenciais e tente novamente'),
        variant: "destructive",
      });
    },
  });

  // Register mutation
  const register = useMutation({
    mutationFn: async (data: RegisterData) => {
      const response = await apiRequest({
        url: "/api/register",
        method: "POST",
        body: JSON.stringify(data),
        headers: {
          "Content-Type": "application/json",
        },
      });
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      
      // Verificar se o auto-login foi bem-sucedido
      if (data.autoLogin) {
        toast({
          title: t('auth.autoLoginSuccess', 'Login automático realizado'),
          description: t('auth.redirectingToDashboard', 'Você está sendo redirecionado para o painel'),
        });
      } else {
        toast({
          title: t('auth.registrationComplete', 'Registro concluído'),
          description: t('auth.accountCreated', 'Sua conta foi criada com sucesso'),
        });
      }
    },
    onError: (error: any) => {
      toast({
        title: t('auth.registerFailed', 'Falha no registro'),
        description: error.message || t('auth.checkInfo', 'Verifique suas informações e tente novamente'),
        variant: "destructive",
      });
    },
  });

  // Logout mutation
  const logout = useMutation({
    mutationFn: async () => {
      // Antes de fazer logout, já invalidamos a query para evitar que o dashboard seja exibido
      queryClient.setQueryData(["/api/auth/user"], null);
      
      const response = await apiRequest({
        url: "/api/logout",
        method: "GET",
      });
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      toast({
        title: t('auth.sessionEnded', 'Sessão encerrada'),
        description: t('auth.logoutSuccess', 'Você foi desconectado com sucesso'),
      });
      
      // Redirecionar imediatamente para a homepage
      window.location.href = "/";
    },
    onError: () => {
      toast({
        title: t('auth.logoutFailed', 'Falha ao desconectar'),
        description: t('auth.logoutError', 'Ocorreu um erro ao encerrar sua sessão'),
        variant: "destructive",
      });
    },
  });

  return {
    user,
    isAuthenticated: !!user,
    isLoading,
    needsOnboarding: !!user && (!user.role || user.role === ''),
    login,
    register,
    logout,
  };
}