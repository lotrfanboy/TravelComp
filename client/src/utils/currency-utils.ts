/**
 * Utilitários para formatação de moeda e cálculos financeiros
 */

/**
 * Formata um valor para o formato de moeda local
 * @param value Valor a ser formatado
 * @param currency Código da moeda (ex: BRL, USD)
 * @param options Opções de formatação
 * @returns Valor formatado como moeda
 */
export const formatCurrency = (
  value: number,
  currency: string = 'BRL',
  options: Intl.NumberFormatOptions = {}
): string => {
  if (value === null || value === undefined || isNaN(value)) {
    return '';
  }

  try {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: currency || 'BRL',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
      ...options,
    }).format(value);
  } catch (error) {
    console.error('Erro ao formatar moeda:', error);
    return `${value}`;
  }
};

/**
 * Converte um valor de texto para número
 * @param valueText Texto contendo o valor
 * @returns Valor numérico ou 0 se inválido
 */
export const parseNumberFromCurrency = (valueText: string): number => {
  if (!valueText) return 0;
  
  // Remove símbolos de moeda, pontos e espaços
  const cleanValue = valueText
    .replace(/[^\d,.-]/g, '')
    .replace(/\./g, '')
    .replace(',', '.');
    
  const numValue = parseFloat(cleanValue);
  return isNaN(numValue) ? 0 : numValue;
};

/**
 * Calcula o valor com desconto
 * @param originalValue Valor original
 * @param discountPercentage Percentual de desconto
 * @returns Valor com desconto aplicado
 */
export const calculateDiscount = (originalValue: number, discountPercentage: number): number => {
  if (originalValue <= 0 || discountPercentage <= 0) return originalValue;
  const discountAmount = (originalValue * discountPercentage) / 100;
  return originalValue - discountAmount;
};

/**
 * Formata um percentual
 * @param value Valor percentual
 * @returns Valor formatado como percentual
 */
export const formatPercentage = (value: number): string => {
  if (value === null || value === undefined || isNaN(value)) {
    return '';
  }

  return `${value.toFixed(1)}%`;
};