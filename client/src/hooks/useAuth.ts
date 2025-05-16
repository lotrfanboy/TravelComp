/**
 * Hook para gerenciar autenticação e acesso ao usuário atual
 */
import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { useEffect } from 'react';

// Tipos
export interface User {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  profileImageUrl: string | null;
  role: string;
  organizationId: number | null;
  preferences: any | null;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Hook para gerenciar autenticação e acesso ao usuário atual
 */
export function useAuth() {
  const { data: user, isLoading, error, refetch } = useQuery<User>({
    queryKey: ['/api/auth/user'],
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutos
  });

  const isAuthenticated = !!user;

  return {
    user,
    isLoading,
    isAuthenticated,
    error,
    refetch,
  };
}

/**
 * Hook para proteger rotas autenticadas
 * @param redirectTo Caminho para redirecionar se não autenticado
 */
export function useRequireAuth(redirectTo: string = '/auth') {
  const { user, isLoading } = useAuth();
  const [, navigate] = useLocation();

  useEffect(() => {
    if (!isLoading && !user) {
      navigate(redirectTo);
    }
  }, [user, isLoading, navigate, redirectTo]);

  return { user, isLoading };
}

/**
 * Hook para verificar permissões de usuário 
 * @param requiredRole Papel requerido (opcional)
 */
export function usePermissions(requiredRole?: string) {
  const { user, isLoading } = useAuth();
  
  const hasRequiredRole = !requiredRole || (user?.role === requiredRole);
  
  return {
    isAuthorized: !!user && hasRequiredRole,
    isLoading,
    userRole: user?.role,
  };
}