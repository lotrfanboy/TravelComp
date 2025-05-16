import React from 'react';
import { Workspace } from '@shared/schema';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star } from 'lucide-react';

interface WorkspaceCardProps {
  workspace: Workspace;
  onAddToTrip?: () => void;
}

const WorkspaceCard: React.FC<WorkspaceCardProps> = ({ workspace, onAddToTrip }) => {
  // Extract amenities from the JSON if it exists
  const amenities = workspace.amenities 
    ? (typeof workspace.amenities === 'string' 
        ? JSON.parse(workspace.amenities) 
        : workspace.amenities) 
    : [];
  
  return (
    <div className="rounded-lg overflow-hidden border border-gray-200 group hover:shadow-md transition-shadow">
      <div 
        className="h-40 bg-cover bg-center" 
        style={{ 
          backgroundImage: `url(${workspace.imageUrl || 'https://images.unsplash.com/photo-1497366811353-6870744d04b2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&h=300&q=80'})` 
        }}
      />
      <div className="p-4">
        <div className="flex justify-between items-start">
          <h4 className="text-md font-semibold text-gray-900">{workspace.name}</h4>
          <div className="flex items-center">
            <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
            <span className="ml-1 text-sm text-gray-600">{workspace.rating || '4.7'}</span>
          </div>
        </div>
        <p className="text-sm text-gray-600 mt-1">{workspace.city}, {workspace.country}</p>
        <div className="flex flex-wrap gap-2 mt-2">
          {workspace.wifiSpeed && (
            <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">
              {workspace.wifiSpeed}+ Mbps
            </Badge>
          )}
          
          {Array.isArray(amenities) && amenities.slice(0, 2).map((amenity, index) => (
            <Badge 
              key={index}
              variant="outline"
              className={`
                ${index === 0 ? 'bg-green-100 text-green-800 hover:bg-green-200' : 'bg-purple-100 text-purple-800 hover:bg-purple-200'}
              `}
            >
              {amenity}
            </Badge>
          ))}
          
          {Array.isArray(amenities) && amenities.length > 2 && (
            <Badge variant="outline">+{amenities.length - 2} more</Badge>
          )}
        </div>
        <div className="mt-3 flex justify-between items-center">
          <p className="text-sm font-medium text-gray-900">
            {workspace.price ? `${workspace.currency || 'USD'} ${workspace.price}` : 'Price varies'} 
            <span className="text-gray-500 font-normal">
              {workspace.price ? ' / day' : ''}
            </span>
          </p>
          <Button 
            size="sm"
            className="bg-emerald-500 hover:bg-emerald-600 text-white"
            onClick={onAddToTrip}
          >
            Book Now
          </Button>
        </div>
      </div>
    </div>
  );
};

export default WorkspaceCard;
