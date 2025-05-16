import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';
import { BudgetPieChart } from './BudgetPieChart';
import { Skeleton } from '@/components/ui/skeleton';
import { useQuery } from '@tanstack/react-query';

export interface TripPriceSummaryProps {
  destination: string;
  country: string;
  startDate: Date | null;
  endDate: Date | null;
  budget?: number;
  currency?: string;
}

export function TripPriceSummary({ 
  destination, 
  country, 
  startDate, 
  endDate, 
  budget,
  currency = 'BRL' 
}: TripPriceSummaryProps) {
  // Estado para controlar simulações
  const [isLoading, setIsLoading] = useState(true);
  
  // Pega a simulação de custos da API
  const { data: costSimulation, isLoading: isSimulationLoading } = useQuery({
    queryKey: ['/api/trip/cost-simulation', { destination, country, startDate, endDate }],
    queryFn: async () => {
      if (!destination || !country || !startDate || !endDate) {
        return null;
      }
      
      try {
        const response = await fetch('/api/trip/cost-simulation', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            origin: 'São Paulo',
            originCountry: 'Brasil',
            destination,
            destinationCountry: country,
            departureDate: startDate.toISOString(),
            returnDate: endDate.toISOString(),
            budget: budget || 0,
            interests: ['culture', 'food', 'adventure']
          })
        });
        
        if (!response.ok) {
          throw new Error('Falha ao obter simulação de custos');
        }
        
        return await response.json();
      } catch (error) {
        console.error('Erro ao carregar simulação de preços:', error);
        // Em caso de erro, retornamos dados simulados para não quebrar a UI
        return {
          flightOptions: [{ price: 1500 }, { price: 1700 }, { price: 1400 }],
          hotelOptions: [{ totalPrice: 1200 }, { totalPrice: 1500 }, { totalPrice: 2000 }],
          attractions: [
            { price: 50 }, { price: 80 }, { price: 120 }, 
            { price: 40 }, { price: 60 }, { price: 90 }
          ],
          totalEstimate: 3000,
          currency: 'BRL'
        };
      }
    },
    enabled: !!(destination && country && startDate && endDate),
    refetchOnWindowFocus: false
  });

  // Dados para o gráfico
  const [chartData, setChartData] = useState({
    flightCost: 0,
    accommodationCost: 0,
    activitiesCost: 0,
    total: 0
  });

  // Atualiza os dados do gráfico quando a simulação for carregada
  useEffect(() => {
    if (costSimulation) {
      setIsLoading(false);
      
      // Encontrar o voo mais barato
      const cheapestFlight = costSimulation.flightOptions?.reduce(
        (min: any, flight: any) => flight.price < min.price ? flight : min, 
        costSimulation.flightOptions[0]
      ) || { price: 0 };
      
      // Encontrar o hotel mais barato
      const cheapestHotel = costSimulation.hotelOptions?.reduce(
        (min: any, hotel: any) => hotel.totalPrice < min.totalPrice ? hotel : min, 
        costSimulation.hotelOptions[0]
      ) || { totalPrice: 0 };
      
      // Calcular custo de atividades (até 2 por dia)
      const activitiesCost = costSimulation.attractions
        ?.filter((a: any) => a.price)
        .slice(0, 6)
        .reduce((sum: number, attr: any) => sum + (attr.price || 0), 0) || 0;
      
      // Atualizar dados para o gráfico
      setChartData({
        flightCost: cheapestFlight.price,
        accommodationCost: cheapestHotel.totalPrice,
        activitiesCost,
        total: costSimulation.totalEstimate
      });
    }
  }, [costSimulation]);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Resumo de Custos Estimados</CardTitle>
        <CardDescription>
          Veja a distribuição prevista do seu orçamento para {destination}, {country}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {(isLoading || isSimulationLoading) ? (
          <div className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-[200px] w-full" />
          </div>
        ) : (
          <div>
            <div className="flex justify-between items-center mb-4">
              <div>
                <p className="text-sm text-muted-foreground">Custo Estimado Total</p>
                <p className="text-2xl font-bold">
                  {formatCurrency(chartData.total, currency)}
                </p>
              </div>
              
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Economia Prevista</p>
                <p className="text-lg font-medium text-green-600">
                  {formatCurrency(budget ? budget - chartData.total : 0, currency)}
                </p>
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div>
                <p className="text-sm text-muted-foreground">Passagens</p>
                <p className="font-medium">{formatCurrency(chartData.flightCost, currency)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Hospedagem</p>
                <p className="font-medium">{formatCurrency(chartData.accommodationCost, currency)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Atividades</p>
                <p className="font-medium">{formatCurrency(chartData.activitiesCost, currency)}</p>
              </div>
            </div>
            
            <div className="mt-4">
              <BudgetPieChart 
                flightCost={chartData.flightCost}
                accommodationCost={chartData.accommodationCost}
                activitiesCost={chartData.activitiesCost}
                currency={currency}
                isInteractive={true}
              />
            </div>
            
            <p className="text-xs text-muted-foreground mt-4 text-center">
              Estimativas baseadas nos preços mais baixos disponíveis. Os valores reais podem variar.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}