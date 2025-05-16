/**
 * Utilitários para manipulação e formatação de datas
 */
import { format, parse, differenceInDays, addDays, isValid } from 'date-fns';
import { ptBR, enUS } from 'date-fns/locale';
import i18next from 'i18next';

// Obter a localização atual para formatação
const getLocale = () => {
  const currentLanguage = i18next.language || 'pt-BR';
  return currentLanguage.startsWith('en') ? enUS : ptBR;
};

/**
 * Formata uma data para exibição ao usuário
 * @param date Data a ser formatada
 * @param formatStr String de formato (opcional)
 * @returns Data formatada como string
 */
export const formatDate = (
  date: string | Date | null | undefined,
  formatStr: string = 'dd/MM/yyyy'
): string => {
  if (!date) return '';
  
  try {
    // Se for string, converter para objeto Date
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    // Verificar se a data é válida
    if (!isValid(dateObj)) return '';
    
    // Formatar data com localização
    return format(dateObj, formatStr, { locale: getLocale() });
  } catch (error) {
    console.error('Erro ao formatar data:', error);
    return '';
  }
};

/**
 * Formata uma data com hora para exibição ao usuário
 * @param date Data a ser formatada
 * @param formatStr String de formato (opcional)
 * @returns Data formatada como string
 */
export const formatDateTime = (
  date: string | Date | null | undefined,
  formatStr: string = 'dd/MM/yyyy HH:mm'
): string => {
  return formatDate(date, formatStr);
};

/**
 * Calcula a duração entre duas datas em dias
 * @param startDate Data inicial
 * @param endDate Data final
 * @returns Número de dias entre as datas
 */
export const getDurationInDays = (
  startDate: string | Date,
  endDate: string | Date
): number => {
  try {
    const start = typeof startDate === 'string' ? new Date(startDate) : startDate;
    const end = typeof endDate === 'string' ? new Date(endDate) : endDate;
    
    // Verificar se as datas são válidas
    if (!isValid(start) || !isValid(end)) return 0;
    
    // Calcular a diferença em dias
    return differenceInDays(end, start) + 1; // Inclusive
  } catch (error) {
    console.error('Erro ao calcular duração:', error);
    return 0;
  }
};

/**
 * Verifica se uma data é no passado
 * @param date Data para verificar
 * @returns Verdadeiro se a data for no passado
 */
export const isPastDate = (date: string | Date): boolean => {
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const today = new Date();
    
    // Remover componente de tempo para comparação
    today.setHours(0, 0, 0, 0);
    
    return dateObj < today;
  } catch (error) {
    console.error('Erro ao verificar data passada:', error);
    return false;
  }
};

/**
 * Retorna a data atual formatada
 * @param formatStr String de formato (opcional)
 * @returns Data atual formatada
 */
export const getCurrentDate = (formatStr: string = 'yyyy-MM-dd'): string => {
  return formatDate(new Date(), formatStr);
};

/**
 * Adiciona dias a uma data
 * @param date Data base
 * @param days Número de dias a adicionar
 * @returns Nova data
 */
export const addDaysToDate = (date: string | Date, days: number): Date => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return addDays(dateObj, days);
};

/**
 * Converte uma string de data para objeto Date
 * @param dateStr String de data
 * @param formatStr Formato da string (opcional)
 * @returns Objeto Date ou null se inválido
 */
export const parseDate = (
  dateStr: string,
  formatStr: string = 'dd/MM/yyyy'
): Date | null => {
  try {
    return parse(dateStr, formatStr, new Date(), { locale: getLocale() });
  } catch (error) {
    console.error('Erro ao converter string para data:', error);
    return null;
  }
};