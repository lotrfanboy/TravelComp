import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(
  urlOrOptions: string | RequestInit & { url: string },
  options?: RequestInit,
): Promise<Response> {
  let url: string;
  let fetchOptions: RequestInit = { credentials: "include" };
  
  if (typeof urlOrOptions === 'string') {
    url = urlOrOptions;
    if (options) {
      fetchOptions = { ...fetchOptions, ...options };
    }
  } else {
    const { url: optionsUrl, ...restOptions } = urlOrOptions;
    url = optionsUrl;
    fetchOptions = { ...fetchOptions, ...restOptions };
  }
  
  const res = await fetch(url, fetchOptions);
  
  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";

// Adiciona uma camada de proteção contra muitas requisições
const throttledFetch = (() => {
  const timeouts: Record<string, number> = {};
  
  return (url: string, options: RequestInit) => {
    // Se já tem uma requisição em andamento para esta URL, cancela e faz uma nova
    if (timeouts[url]) {
      clearTimeout(timeouts[url]);
    }
    
    return new Promise<Response>((resolve) => {
      // Adiciona um pequeno delay para evitar múltiplas requisições rápidas
      timeouts[url] = window.setTimeout(async () => {
        try {
          const response = await fetch(url, options);
          resolve(response);
        } catch (error) {
          console.error('Fetch error:', error);
          throw error;
        } finally {
          delete timeouts[url];
        }
      }, 300); // 300ms de delay entre requisições para a mesma URL
    });
  };
})();

// Função getQueryFn com throttledFetch
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const res = await throttledFetch(queryKey[0] as string, {
      credentials: "include",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutos
      gcTime: 10 * 60 * 1000, // 10 minutos (antigo cacheTime)
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});