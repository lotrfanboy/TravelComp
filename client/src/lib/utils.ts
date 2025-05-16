import { ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string, options: Intl.DateTimeFormatOptions = {}): string {
  if (!date) return '';
  
  const d = typeof date === 'string' ? new Date(date) : date;
  
  const defaultOptions: Intl.DateTimeFormatOptions = {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  };
  
  return new Intl.DateTimeFormat('pt-BR', { ...defaultOptions, ...options }).format(d);
}

export function formatDateRange(
  startDate: Date | string, 
  endDate: Date | string, 
  options: Intl.DateTimeFormatOptions = {}
): string {
  return `${formatDate(startDate, options)} - ${formatDate(endDate, options)}`;
}

export function getDaysUntil(date: Date | string): number {
  const now = new Date();
  const targetDate = typeof date === 'string' ? new Date(date) : date;
  
  // Reset hours to compare only days
  now.setHours(0, 0, 0, 0);
  const target = new Date(targetDate);
  target.setHours(0, 0, 0, 0);
  
  const diffTime = Math.abs(target.getTime() - now.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
}

export function getTripDuration(startDate: Date | string, endDate: Date | string): number {
  const start = typeof startDate === 'string' ? new Date(startDate) : startDate;
  const end = typeof endDate === 'string' ? new Date(endDate) : endDate;
  
  // Reset hours to compare only days
  const startDay = new Date(start);
  startDay.setHours(0, 0, 0, 0);
  
  const endDay = new Date(end);
  endDay.setHours(0, 0, 0, 0);
  
  const diffTime = Math.abs(endDay.getTime() - startDay.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
}

export function formatCurrency(amount: number, currency: string = 'USD'): string {
  const formatter = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: currency,
  });
  
  return formatter.format(amount);
}

export function getUserRoleDisplay(role: string): string {
  const roleLabels: Record<string, string> = {
    'tourist': 'Turista',
    'nomad': 'Nômade Digital',
    'business': 'Empresarial'
  };
  return roleLabels[role] || 'Usuário';
}