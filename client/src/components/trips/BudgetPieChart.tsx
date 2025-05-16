import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { formatCurrency } from '@/lib/utils';

interface BudgetPieChartProps {
  flightCost: number;
  accommodationCost: number;
  activitiesCost: number;
  currency?: string;
  isInteractive?: boolean;
}

export function BudgetPieChart({ 
  flightCost, 
  accommodationCost, 
  activitiesCost, 
  currency = 'BRL',
  isInteractive = true
}: BudgetPieChartProps) {
  // Definindo cores base iniciais
  const baseColors = {
    flights: '#FF6B6B',
    accommodation: '#48BEFF',
    activities: '#4CAF50'
  };

  // Estado para as cores atuais (possibilita animação/transição)
  const [colors, setColors] = useState({
    flights: baseColors.flights,
    accommodation: baseColors.accommodation,
    activities: baseColors.activities
  });

  // Calculando o total para percentagens
  const total = flightCost + accommodationCost + activitiesCost;

  // Preparando dados para o gráfico
  const data = [
    { name: 'Passagens', value: flightCost, originalColor: baseColors.flights, currentColor: colors.flights },
    { name: 'Hospedagem', value: accommodationCost, originalColor: baseColors.accommodation, currentColor: colors.accommodation },
    { name: 'Atividades', value: activitiesCost, originalColor: baseColors.activities, currentColor: colors.activities }
  ];

  // Função para gerar uma cor mais brilhante (highlight)
  const brightenColor = (color: string, percent: number): string => {
    const hex = color.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);

    const brightenValue = (value: number, percent: number) => {
      return Math.min(255, Math.floor(value + (255 - value) * (percent / 100)));
    };

    const br = brightenValue(r, percent);
    const bg = brightenValue(g, percent);
    const bb = brightenValue(b, percent);

    return '#' + 
      br.toString(16).padStart(2, '0') +
      bg.toString(16).padStart(2, '0') +
      bb.toString(16).padStart(2, '0');
  };

  // Reset das cores para o padrão quando o foco é removido
  const resetColors = () => {
    setColors(baseColors);
  };

  // Efeito para transição de cores a cada 3 segundos (animação automática)
  useEffect(() => {
    if (!isInteractive) return;

    // Só animamos se a opção interativa estiver ativada
    const interval = setInterval(() => {
      const randomIndex = Math.floor(Math.random() * data.length);
      const newColors = { ...baseColors };
      
      // Cria uma cópia das cores base
      const colorKeys = Object.keys(newColors) as Array<keyof typeof newColors>;
      
      // Brilho aleatório entre 10% e 30%
      const brightness = 10 + Math.floor(Math.random() * 20);
      
      // Aplica o brilho na categoria selecionada
      newColors[colorKeys[randomIndex]] = brightenColor(
        baseColors[colorKeys[randomIndex]], 
        brightness
      );
      
      setColors(newColors);
      
      // Após 500ms, voltamos às cores originais
      setTimeout(resetColors, 500);
    }, 3000);

    return () => clearInterval(interval);
  }, [isInteractive]);

  // Função para lidar com o hover em um segmento
  const handleMouseEnter = (data: any, index: number) => {
    if (!isInteractive) return;

    const colorKeys = Object.keys(colors) as Array<keyof typeof colors>;
    const newColors = { ...baseColors };
    
    // Aumenta o brilho da cor sobre a qual o mouse está
    newColors[colorKeys[index]] = brightenColor(baseColors[colorKeys[index]], 30);
    
    setColors(newColors);
  };

  // Customização do tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const item = payload[0];
      const percentage = ((item.value / total) * 100).toFixed(1);
      
      return (
        <div className="bg-white shadow-md rounded p-2 border">
          <p className="font-medium">{item.name}</p>
          <p className="text-sm">
            {formatCurrency(item.value, currency)} ({percentage}%)
          </p>
        </div>
      );
    }
    return null;
  };
  
  // Renderizador customizado de legendas
  const renderLegend = (props: any) => {
    const { payload } = props;
    
    return (
      <ul className="flex flex-col gap-1 text-sm mt-4">
        {payload.map((entry: any, index: number) => (
          <li 
            key={`item-${index}`} 
            className="flex items-center gap-2"
            onMouseEnter={() => handleMouseEnter(entry, index)}
            onMouseLeave={resetColors}
          >
            <div 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: entry.color }}
            />
            <span>{entry.value}</span>
            <span className="text-muted-foreground">
              {formatCurrency(entry.payload.value, currency)}
              {' '}
              ({((entry.payload.value / total) * 100).toFixed(0)}%)
            </span>
          </li>
        ))}
      </ul>
    );
  };

  return (
    <div className="w-full h-[300px] mt-4">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            innerRadius={60}
            outerRadius={80}
            paddingAngle={5}
            dataKey="value"
            animationDuration={500}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={resetColors}
          >
            {data.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={entry.currentColor}
                style={{ transition: 'fill 0.3s ease' }}
              />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend content={renderLegend} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}