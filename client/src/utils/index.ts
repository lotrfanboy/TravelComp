/**
 * Export centralizado de todos os utilitários
 * Facilita o import com `import { formatDate, formatCurrency } from '@/utils'`
 */

// Utilitários de data
export * from './date-utils';

// Utilitários de moeda
export * from './currency-utils';

// Utilitários de formulário
export * from './form-utils';

/**
 * Gera um ID único
 * @returns String ID único
 */
export const generateId = (): string => {
  return Math.random().toString(36).substring(2, 9);
};

/**
 * Trunca um texto longo com ellipsis
 * @param text Texto a ser truncado
 * @param maxLength Comprimento máximo
 * @returns Texto truncado
 */
export const truncateText = (text: string, maxLength: number): string => {
  if (!text || text.length <= maxLength) return text;
  return `${text.substring(0, maxLength)}...`;
};

/**
 * Capitaliza a primeira letra de cada palavra
 * @param text Texto para capitalizar
 * @returns Texto capitalizado
 */
export const capitalizeWords = (text: string): string => {
  if (!text) return '';
  return text
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

/**
 * Remove acentos de um texto
 * @param text Texto com acentos
 * @returns Texto sem acentos
 */
export const removeAccents = (text: string): string => {
  if (!text) return '';
  return text.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
};

/**
 * Determina se a tela é mobile com base na largura
 * @param width Largura da tela
 * @returns Verdadeiro se for mobile
 */
export const isMobile = (width: number): boolean => {
  return width < 768;
};

/**
 * Extrai o valor de uma query string
 * @param query Query string completa
 * @param param Nome do parâmetro
 * @returns Valor do parâmetro
 */
export const getQueryParam = (query: string, param: string): string | null => {
  const params = new URLSearchParams(query);
  return params.get(param);
};