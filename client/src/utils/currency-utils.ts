/**
 * Utilitários para formatação e cálculos monetários
 */
import i18next from 'i18next';

// Mapa de símbolos de moeda
const CURRENCY_SYMBOLS: Record<string, string> = {
  BRL: 'R$',
  USD: 'US$',
  EUR: '€',
  GBP: '£',
  ARS: 'ARS$',
  CLP: 'CLP$',
  UYU: 'UYU$',
  COP: 'COP$',
  PEN: 'PEN$',
  MXN: 'MX$',
  BOB: 'Bs.',
  VEF: 'Bs.F',
  PYG: '₲',
  CAD: 'C$',
  AUD: 'A$',
  NZD: 'NZ$',
  JPY: '¥',
  CNY: '¥',
  // Adicionar mais conforme necessário
};

// Mapa de casas decimais por moeda
const CURRENCY_DECIMALS: Record<string, number> = {
  JPY: 0,
  KRW: 0,
  CLP: 0,
  VND: 0,
  // A maioria das moedas usa 2 casas decimais por padrão
};

/**
 * Formata um valor para exibição como moeda
 * @param value Valor a ser formatado
 * @param currency Código da moeda (padrão: BRL)
 * @param locale Locale a ser usado (se não fornecido, usa o idioma atual)
 * @returns String formatada
 */
export const formatCurrency = (
  value: number | string | null | undefined,
  currency: string = 'BRL',
  locale?: string
): string => {
  if (value === null || value === undefined) return '';
  
  try {
    // Converter para número se estiver em formato string
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    
    // Se não for um número válido, retornar string vazia
    if (isNaN(numValue)) return '';
    
    // Usar o locale do i18n se não foi fornecido explicitamente
    const currentLocale = locale || i18next.language || 'pt-BR';
    const currencyCode = currency.toUpperCase();
    
    // Determinar número de casas decimais com base na moeda
    const decimals = currencyCode in CURRENCY_DECIMALS ? 
      CURRENCY_DECIMALS[currencyCode] : 2;
    
    // Usar API Intl para formatação conforme locale e moeda
    return new Intl.NumberFormat(currentLocale, {
      style: 'currency',
      currency: currencyCode,
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    }).format(numValue);
    
  } catch (error) {
    console.error('Erro ao formatar moeda:', error);
    
    // Fallback simples em caso de erro
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    const symbol = currency in CURRENCY_SYMBOLS ? CURRENCY_SYMBOLS[currency] : currency;
    const decimals = currency in CURRENCY_DECIMALS ? CURRENCY_DECIMALS[currency] : 2;
    
    return `${symbol} ${numValue.toFixed(decimals)}`;
  }
};

/**
 * Formata um número para exibição
 * @param value Valor para formatar
 * @param decimals Número de casas decimais
 * @param locale Configuração regional
 * @returns String formatada
 */
export const formatNumber = (
  value: number | string | null | undefined,
  decimals: number = 2,
  locale?: string
): string => {
  if (value === null || value === undefined) return '';
  
  try {
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(numValue)) return '';
    
    const currentLocale = locale || i18next.language || 'pt-BR';
    
    return new Intl.NumberFormat(currentLocale, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    }).format(numValue);
    
  } catch (error) {
    console.error('Erro ao formatar número:', error);
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    return isNaN(numValue) ? '' : numValue.toFixed(decimals);
  }
};

/**
 * Converte um valor de uma moeda para outra
 * @param value Valor a converter
 * @param fromCurrency Moeda de origem
 * @param toCurrency Moeda de destino
 * @param exchangeRates Taxas de câmbio (opcional - se não fornecido, busca automaticamente)
 * @returns Valor convertido
 */
export const convertCurrency = async (
  value: number,
  fromCurrency: string,
  toCurrency: string,
  exchangeRates?: Record<string, number>
): Promise<number> => {
  try {
    // Se as moedas forem iguais, não precisa converter
    if (fromCurrency === toCurrency) return value;
    
    let rates = exchangeRates;
    
    // Se não foram fornecidas taxas, buscar as atuais
    if (!rates) {
      // Em produção, aqui faria uma chamada à API de câmbio
      // Por enquanto, usamos valores fixos para demonstração
      rates = {
        USD: 1,
        BRL: 5.5,
        EUR: 0.92,
        GBP: 0.79,
        ARS: 960,
        // Adicionar outras moedas conforme necessário
      };
    }
    
    // Verificar se temos as taxas para ambas as moedas
    if (!rates[fromCurrency] || !rates[toCurrency]) {
      console.error('Taxas de câmbio não disponíveis para as moedas especificadas');
      return value;
    }
    
    // Converter para a moeda destino (via USD como moeda base)
    const valueInUSD = fromCurrency === 'USD' ? value : value / rates[fromCurrency];
    return toCurrency === 'USD' ? valueInUSD : valueInUSD * rates[toCurrency];
    
  } catch (error) {
    console.error('Erro ao converter moeda:', error);
    return value;
  }
};

/**
 * Calcula o valor com desconto
 * @param value Valor original
 * @param discountPercent Percentual de desconto
 * @returns Valor com desconto aplicado
 */
export const applyDiscount = (value: number, discountPercent: number): number => {
  if (discountPercent <= 0 || discountPercent > 100) return value;
  return value * (1 - (discountPercent / 100));
};

/**
 * Calcula o valor total baseado em preço unitário e quantidade
 * @param unitPrice Preço unitário
 * @param quantity Quantidade
 * @returns Valor total
 */
export const calculateTotal = (unitPrice: number, quantity: number): number => {
  return unitPrice * quantity;
};

/**
 * Obter símbolo de uma moeda
 * @param currency Código da moeda
 * @returns Símbolo da moeda
 */
export const getCurrencySymbol = (currency: string): string => {
  const code = currency.toUpperCase();
  return code in CURRENCY_SYMBOLS ? CURRENCY_SYMBOLS[code] : code;
};