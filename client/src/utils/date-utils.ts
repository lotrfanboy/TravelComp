/**
 * Utilitários para manipulação e formatação de datas
 */

/**
 * Formata uma data para o formato local (DD/MM/YYYY)
 * @param dateString Data em formato ISO ou string
 * @returns Data formatada
 */
export const formatDate = (dateString: string | Date | null | undefined): string => {
  if (!dateString) return '';
  
  try {
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
    return date.toLocaleDateString('pt-BR');
  } catch (error) {
    console.error('Erro ao formatar data:', error);
    return '';
  }
};

/**
 * Calcula a diferença em dias entre duas datas
 * @param startDate Data inicial
 * @param endDate Data final
 * @returns Número de dias entre as datas
 */
export const getDaysDifference = (startDate: string | Date, endDate: string | Date): number => {
  const start = typeof startDate === 'string' ? new Date(startDate) : startDate;
  const end = typeof endDate === 'string' ? new Date(endDate) : endDate;
  
  const diffTime = Math.abs(end.getTime() - start.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

/**
 * Verifica se a data é válida
 * @param dateString Data em formato ISO ou string
 * @returns Verdadeiro se a data for válida
 */
export const isValidDate = (dateString: string): boolean => {
  const date = new Date(dateString);
  return !isNaN(date.getTime());
};

/**
 * Adiciona dias a uma data
 * @param date Data inicial
 * @param days Número de dias a adicionar
 * @returns Nova data
 */
export const addDays = (date: Date, days: number): Date => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

/**
 * Formata uma data para o formato ISO (YYYY-MM-DD)
 * @param date Data a ser formatada
 * @returns Data no formato ISO
 */
export const formatToISODate = (date: Date): string => {
  return date.toISOString().split('T')[0];
};