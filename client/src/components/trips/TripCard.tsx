import React from 'react';
import { useLocation } from 'wouter';
import { Trip } from '@shared/schema';
import { formatDateRange, getDaysUntil } from '@/lib/utils';
import { getCountryImage, getContinent } from '@/lib/countryImages';
import { Button } from '@/components/ui/button';

interface TripCardProps {
  trip: Trip;
  roleColor: 'tourist' | 'nomad' | 'business';
  extraInfo?: {
    icon: React.ReactNode;
    text: string;
    status: 'complete' | 'pending';
  }[];
}

const TripCard: React.FC<TripCardProps> = ({ trip, roleColor, extraInfo = [] }) => {
  const [_, navigate] = useLocation();

  const getBgColor = (role: string) => {
    switch (role) {
      case 'tourist':
        return 'bg-yellow-50 text-yellow-800';
      case 'nomad':
        return 'bg-emerald-50 text-emerald-800';
      case 'business':
        return 'bg-indigo-50 text-indigo-800';
      default:
        return 'bg-gray-50 text-gray-800';
    }
  };
  
  // Obtém imagem do destino baseada no país
  const getTripImage = () => {
    if (trip.country) {
      return getCountryImage(trip.country);
    } else if (trip.destination) {
      return getCountryImage(trip.destination);
    }
    // Imagem padrão caso não tenha país/destino
    return 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=800&q=80';
  };

  const getButtonColor = (role: string) => {
    switch (role) {
      case 'tourist':
        return 'bg-yellow-500 hover:bg-yellow-600 text-white';
      case 'nomad':
        return 'bg-emerald-500 hover:bg-emerald-600 text-white';
      case 'business':
        return 'bg-indigo-500 hover:bg-indigo-600 text-white';
      default:
        return 'bg-blue-500 hover:bg-blue-600 text-white';
    }
  };

  const getTextColor = (role: string, pending: boolean = false) => {
    if (pending) {
      switch (role) {
        case 'tourist':
          return 'text-yellow-500';
        case 'nomad':
          return 'text-emerald-500';
        case 'business':
          return 'text-indigo-500';
        default:
          return 'text-blue-500';
      }
    }
    return 'text-gray-600';
  };

  // Choose a background image based on destination or use default
  const getDestinationImage = (destination: string) => {
    // For now, we'll use a placeholder image
    // In a real app, this would use a mapping or API to get appropriate images
    if (destination.toLowerCase().includes('bali')) {
      return 'https://images.unsplash.com/photo-1604999333679-b86d54738315?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=300&h=400&q=80';
    } else if (destination.toLowerCase().includes('lisbon') || destination.toLowerCase().includes('portugal')) {
      return 'https://images.unsplash.com/photo-1558102822-da570eb113ed?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=300&h=400&q=80';
    } else {
      return 'https://images.unsplash.com/photo-1596292377525-d1bd4707d406?auto=format&fit=crop&w=300&h=400&q=80';
    }
  };

  const daysUntil = getDaysUntil(trip.startDate);
  const isUpcoming = daysUntil > 0;
  const status = isUpcoming 
    ? daysUntil <= 14 
      ? `Em ${daysUntil} dias`
      : `Em ${Math.floor(daysUntil / 7)} semanas`
    : 'Ativa';

  return (
    <div className="flex rounded-lg border border-gray-200 overflow-hidden">
      {/* Trip Image */}
      <div 
        className="flex-shrink-0 w-32 bg-cover bg-center" 
        style={{ backgroundImage: `url('${getTripImage()}')` }}
      />
      
      {/* Trip Info */}
      <div className="flex-1 bg-white p-4">
        <div className="flex justify-between">
          <div>
            <h4 className="text-lg font-semibold text-gray-900">{trip.destination}, {trip.country}</h4>
            <div className="flex items-center mt-1">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
              <span className="ml-1 text-sm text-gray-600">{formatDateRange(trip.startDate, trip.endDate)}</span>
            </div>
          </div>
          <span className={`px-2 py-1 text-xs rounded-full ${getBgColor(roleColor)} font-medium h-fit`}>
            {status}
          </span>
        </div>
        
        <div className="mt-3">
          {extraInfo.map((info, index) => (
            <div key={index} className="flex items-center mt-1">
              <span className={info.status === 'pending' ? getTextColor(roleColor, true) : 'text-gray-400'}>
                {info.icon}
              </span>
              <span className={`ml-1 text-sm ${info.status === 'pending' ? getTextColor(roleColor, true) : 'text-gray-600'}`}>
                {info.text}
              </span>
            </div>
          ))}
        </div>
        
        <div className="mt-4 flex justify-between">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => navigate(`/trips/${trip.id}`)}
          >
            Ver Detalhes
          </Button>
          <Button 
            size="sm"
            className={getButtonColor(roleColor)}
            onClick={() => navigate(`/trips/${trip.id}/edit`)}
          >
            Editar Viagem
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TripCard;
