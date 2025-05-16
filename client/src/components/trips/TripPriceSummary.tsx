import React from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';

// Tipos de itens de preço
type PriceItemType = 'flight' | 'accommodation' | 'attraction' | 'workspace' | 'insurance' | 'other';

// Interface para item de preço
interface PriceItem {
  id: string;
  name: string;
  price: number;
  currency: string;
  type: PriceItemType;
  details?: string;
}

// Props do componente
interface TripPriceSummaryProps {
  destination: string;
  country: string;
  startDate: string;
  endDate: string;
  priceItems: PriceItem[];
  isMultiDestination?: boolean;
  stickyToParent?: boolean;
}

export function TripPriceSummary({
  destination,
  country,
  startDate,
  endDate,
  priceItems,
  isMultiDestination = false,
  stickyToParent = false,
}: TripPriceSummaryProps) {
  const { t } = useTranslation();

  // Calcular total
  const total = priceItems && priceItems.length > 0 
    ? priceItems.reduce((sum, item) => sum + item.price, 0)
    : 0;
  
  // Obter a moeda (usamos a do primeiro item ou BRL como padrão)
  const currency = priceItems && priceItems.length > 0 ? priceItems[0].currency : 'BRL';

  // Ícones para os diferentes tipos de itens
  const getIconForItemType = (type: PriceItemType) => {
    switch (type) {
      case 'flight':
        return '✈️';
      case 'accommodation':
        return '🏨';
      case 'attraction':
        return '🎭';
      case 'workspace':
        return '💻';
      case 'insurance':
        return '🛡️';
      default:
        return '📝';
    }
  };

  return (
    <Card className={stickyToParent ? 'sticky top-6' : ''}>
      <CardHeader className="pb-3">
        <CardTitle className="text-xl">
          {isMultiDestination 
            ? t('tripPriceSummary.titleMulti', 'Resumo de custos de viagem')
            : t('tripPriceSummary.title', 'Viagem para {{destination}}', { destination })}
        </CardTitle>
        <div className="text-sm text-muted-foreground">
          {country && <p>{country}</p>}
          {startDate && endDate && (
            <p>
              {startDate} - {endDate}
            </p>
          )}
        </div>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="space-y-1.5">
          {priceItems && priceItems.length > 0 ? (
            <>
              {priceItems.map((item) => (
                <div key={item.id} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <span className="mr-2">{getIconForItemType(item.type)}</span>
                    <span className="text-sm font-medium">{item.name}</span>
                  </div>
                  <span>{formatCurrency(item.price, item.currency)}</span>
                </div>
              ))}
              
              <div className="pt-2 mt-2 border-t flex items-center justify-between font-semibold">
                <span>{t('tripPriceSummary.total', 'Total')}</span>
                <span>{formatCurrency(total, currency)}</span>
              </div>
            </>
          ) : (
            <div className="py-4 text-center text-muted-foreground italic">
              {t('tripPriceSummary.noItems', 'Nenhum item para mostrar')}
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="pt-1 text-xs text-muted-foreground">
        <p>{t('tripPriceSummary.disclaimer', 'Valores estimados sujeitos a alterações')}</p>
      </CardFooter>
    </Card>
  );
}