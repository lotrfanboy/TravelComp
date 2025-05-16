/**
 * Serviço centralizado para interações com a API
 */
import { queryClient } from '@/lib/queryClient';

interface ApiOptions {
  headers?: Record<string, string>;
  params?: Record<string, string>;
}

/**
 * Realiza uma chamada GET para a API
 * @param url URL do endpoint
 * @param options Opções de requisição
 * @returns Dados da resposta
 */
export const fetchData = async <T>(url: string, options?: ApiOptions): Promise<T> => {
  const queryParams = options?.params
    ? `?${new URLSearchParams(options.params).toString()}`
    : '';
    
  const response = await fetch(`${url}${queryParams}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Erro na requisição: ${response.status} - ${errorText}`);
  }

  return response.json();
};

/**
 * Realiza uma chamada POST para a API
 * @param url URL do endpoint
 * @param data Dados para enviar
 * @param options Opções de requisição
 * @returns Dados da resposta
 */
export const postData = async <T, R>(url: string, data: T, options?: ApiOptions): Promise<R> => {
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Erro na requisição: ${response.status} - ${errorText}`);
  }

  return response.json();
};

/**
 * Realiza uma chamada PUT para a API
 * @param url URL do endpoint
 * @param data Dados para enviar
 * @param options Opções de requisição
 * @returns Dados da resposta
 */
export const putData = async <T, R>(url: string, data: T, options?: ApiOptions): Promise<R> => {
  const response = await fetch(url, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Erro na requisição: ${response.status} - ${errorText}`);
  }

  return response.json();
};

/**
 * Realiza uma chamada PATCH para a API
 * @param url URL do endpoint
 * @param data Dados para enviar
 * @param options Opções de requisição
 * @returns Dados da resposta
 */
export const patchData = async <T, R>(url: string, data: T, options?: ApiOptions): Promise<R> => {
  const response = await fetch(url, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Erro na requisição: ${response.status} - ${errorText}`);
  }

  return response.json();
};

/**
 * Realiza uma chamada DELETE para a API
 * @param url URL do endpoint
 * @param options Opções de requisição
 * @returns Dados da resposta ou void
 */
export const deleteData = async <R>(url: string, options?: ApiOptions): Promise<R | void> => {
  const response = await fetch(url, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Erro na requisição: ${response.status} - ${errorText}`);
  }

  try {
    return await response.json();
  } catch (error) {
    // Se não houver corpo na resposta, apenas retorna
    return;
  }
};

/**
 * Invalida o cache para uma chave específica
 * @param queryKey Chave do cache para invalidar
 */
export const invalidateQuery = (queryKey: string | unknown[]) => {
  queryClient.invalidateQueries({ queryKey: Array.isArray(queryKey) ? queryKey : [queryKey] });
};

// API Services específicos para cada recurso
export const TripService = {
  getTrips: () => fetchData('/api/trips'),
  getTrip: (id: number) => fetchData(`/api/trips/${id}`),
  createTrip: (data: any) => postData('/api/trips', data),
  updateTrip: (id: number, data: any) => patchData(`/api/trips/${id}`, data),
  deleteTrip: (id: number) => deleteData(`/api/trips/${id}`),
  simulateTripCost: (data: any) => postData('/api/trip/cost-simulation', data),
};

export const AccommodationService = {
  searchAccommodations: (params: any) => 
    fetchData('/api/accommodations/search', { params }),
  getAccommodationDetails: (id: number) => 
    fetchData(`/api/accommodations/${id}`),
};

export const AttractionService = {
  searchAttractions: (params: any) => 
    fetchData('/api/attractions/search', { params }),
  getAttractionDetails: (id: number) => 
    fetchData(`/api/attractions/${id}`),
};

export const WorkspaceService = {
  searchWorkspaces: (params: any) => 
    fetchData('/api/workspaces/search', { params }),
  getWorkspaceDetails: (id: number) => 
    fetchData(`/api/workspaces/${id}`),
};

export const UserService = {
  getCurrentUser: () => fetchData('/api/auth/user'),
  updateUserProfile: (data: any) => patchData('/api/auth/user', data),
};

export const BookingService = {
  createBooking: (data: any) => postData('/api/bookings', data),
  getUserBookings: () => fetchData('/api/bookings'),
  cancelBooking: (id: number) => deleteData(`/api/bookings/${id}`),
};