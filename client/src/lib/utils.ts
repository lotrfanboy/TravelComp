import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combine multiple class names with tailwind support
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format a number as currency
 */
export function formatCurrency(value: number, currency = 'BRL', 
  options: Intl.NumberFormatOptions = {}): string {
  
  // Set default locale based on currency
  let locale = 'pt-BR';
  if (currency === 'USD') locale = 'en-US';
  if (currency === 'EUR') locale = 'de-DE';
  
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
    ...options
  }).format(value);
}

/**
 * Get a random integer between min and max
 */
export function getRandomInt(min: number, max: number): number {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Sleep for a specified amount of time
 */
export const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Generate a UUID
 */
export function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

/**
 * Add days to a date
 */
export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

/**
 * Calculate days between two dates
 */
export function daysBetween(date1: Date, date2: Date): number {
  const oneDay = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds
  const firstDate = new Date(date1);
  const secondDate = new Date(date2);
  
  return Math.round(Math.abs((firstDate.getTime() - secondDate.getTime()) / oneDay));
}

/**
 * Get a display name for a user role
 */
export function getUserRoleDisplay(role: string): string {
  const roleDisplays: Record<string, string> = {
    'tourist': 'Turista',
    'business': 'Executivo',
    'nomad': 'Nômade Digital',
    'admin': 'Administrador',
  };
  
  return roleDisplays[role.toLowerCase()] || role;
}

/**
 * Format a date for display
 */
export function formatDate(date: Date | null): string {
  if (!date) return '';
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(date);
}

/**
 * Format a date range for display
 */
export function formatDateRange(startDate: Date | null, endDate: Date | null): string {
  if (!startDate || !endDate) return '';
  return `${formatDate(startDate)} - ${formatDate(endDate)}`;
}

/**
 * Get days until a date
 */
export function getDaysUntil(date: Date | null): number {
  if (!date) return 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const targetDate = new Date(date);
  targetDate.setHours(0, 0, 0, 0);
  
  return Math.max(0, Math.ceil((targetDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)));
}