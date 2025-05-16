import { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, GripVertical, X, Plus, MapPin } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

export interface DestinationItem {
  id: string;
  city: string;
  country: string;
  countryCode?: string;
  arrivalDate: Date;
  departureDate: Date;
}

interface DraggableItineraryProps {
  destinations: DestinationItem[];
  onChange: (destinations: DestinationItem[]) => void;
  tripStartDate?: Date;
  tripEndDate?: Date;
}

export default function DraggableItinerary({ 
  destinations, 
  onChange, 
  tripStartDate, 
  tripEndDate 
}: DraggableItineraryProps) {
  const [items, setItems] = useState<DestinationItem[]>(destinations);
  const [showNewDestinationForm, setShowNewDestinationForm] = useState(false);
  const [newDestination, setNewDestination] = useState<Partial<DestinationItem>>({
    id: '',
    city: '',
    country: '',
    arrivalDate: tripStartDate || new Date(),
    departureDate: tripStartDate ? new Date(tripStartDate.getTime() + 86400000) : new Date(Date.now() + 86400000),
  });

  // Update local state when props change
  useEffect(() => {
    setItems(destinations);
  }, [destinations]);

  // Handle drag end
  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    
    const reorderedItems = Array.from(items);
    const [movedItem] = reorderedItems.splice(result.source.index, 1);
    reorderedItems.splice(result.destination.index, 0, movedItem);
    
    // Check and adjust dates after reordering
    const validatedItems = validateAndAdjustDates(reorderedItems);
    setItems(validatedItems);
    onChange(validatedItems);
  };

  // Validate and adjust dates to ensure logical flow
  const validateAndAdjustDates = (destinations: DestinationItem[]): DestinationItem[] => {
    if (destinations.length <= 1) return destinations;
    
    const adjusted = [...destinations];
    
    // Ensure each stop's dates are logical
    for (let i = 0; i < adjusted.length; i++) {
      const current = adjusted[i];
      
      // Ensure arrival date is before departure date
      if (current.arrivalDate >= current.departureDate) {
        current.departureDate = new Date(current.arrivalDate.getTime() + 86400000); // +1 day
      }
      
      // Ensure stops are sequential
      if (i > 0) {
        const previous = adjusted[i - 1];
        if (current.arrivalDate < previous.departureDate) {
          current.arrivalDate = new Date(previous.departureDate.getTime());
          current.departureDate = new Date(current.arrivalDate.getTime() + 86400000); // +1 day
        }
      }
      
      // Ensure first destination starts after or on trip start date
      if (i === 0 && tripStartDate && current.arrivalDate < tripStartDate) {
        current.arrivalDate = new Date(tripStartDate.getTime());
        current.departureDate = new Date(current.arrivalDate.getTime() + 86400000); // +1 day
      }
      
      // Ensure last destination ends before or on trip end date
      if (i === adjusted.length - 1 && tripEndDate && current.departureDate > tripEndDate) {
        current.departureDate = new Date(tripEndDate.getTime());
        if (current.arrivalDate >= current.departureDate) {
          current.arrivalDate = new Date(current.departureDate.getTime() - 86400000); // -1 day
        }
      }
    }
    
    return adjusted;
  };

  const handleRemoveDestination = (index: number) => {
    const updatedItems = [...items];
    updatedItems.splice(index, 1);
    setItems(updatedItems);
    onChange(updatedItems);
  };

  const handleDateChange = (index: number, field: 'arrivalDate' | 'departureDate', date: Date | undefined) => {
    if (!date) return;
    
    const updatedItems = [...items];
    updatedItems[index] = {
      ...updatedItems[index],
      [field]: date
    };
    
    const validatedItems = validateAndAdjustDates(updatedItems);
    setItems(validatedItems);
    onChange(validatedItems);
  };

  const handleAddDestination = () => {
    if (!newDestination.city || !newDestination.country) {
      toast({
        title: "Missing information",
        description: "Please provide both city and country",
        variant: "destructive"
      });
      return;
    }
    
    const destination: DestinationItem = {
      id: `dest-${Date.now()}`,
      city: newDestination.city || '',
      country: newDestination.country || '',
      countryCode: newDestination.countryCode,
      arrivalDate: newDestination.arrivalDate || new Date(),
      departureDate: newDestination.departureDate || new Date(Date.now() + 86400000),
    };
    
    const updatedItems = [...items, destination];
    const validatedItems = validateAndAdjustDates(updatedItems);
    
    setItems(validatedItems);
    onChange(validatedItems);
    setShowNewDestinationForm(false);
    setNewDestination({
      id: '',
      city: '',
      country: '',
      arrivalDate: validatedItems[validatedItems.length - 1].departureDate,
      departureDate: new Date(validatedItems[validatedItems.length - 1].departureDate.getTime() + 86400000),
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Trip Destinations</h3>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => setShowNewDestinationForm(true)}
          disabled={showNewDestinationForm}
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Destination
        </Button>
      </div>
      
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="destinations">
          {(provided) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="space-y-3"
            >
              {items.map((destination, index) => (
                <Draggable 
                  key={destination.id} 
                  draggableId={destination.id} 
                  index={index}
                >
                  {(provided) => (
                    <Card
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      className="border border-gray-200"
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start">
                          <div 
                            {...provided.dragHandleProps}
                            className="mt-2 mr-2 cursor-grab"
                          >
                            <GripVertical className="h-5 w-5 text-gray-400" />
                          </div>
                          
                          <div className="flex-1 space-y-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center">
                                <MapPin className="h-4 w-4 mr-1 text-gray-500" />
                                <span className="font-medium">{destination.city}, {destination.country}</span>
                              </div>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                onClick={() => handleRemoveDestination(index)}
                                className="h-8 w-8"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-1.5">
                                <Label htmlFor={`arrival-${index}`}>Arrival</Label>
                                <Popover>
                                  <PopoverTrigger asChild>
                                    <Button
                                      id={`arrival-${index}`}
                                      variant="outline"
                                      className={cn(
                                        "w-full justify-start text-left font-normal",
                                        !destination.arrivalDate && "text-muted-foreground"
                                      )}
                                    >
                                      <CalendarIcon className="mr-2 h-4 w-4" />
                                      {destination.arrivalDate ? (
                                        format(destination.arrivalDate, "PPP")
                                      ) : (
                                        <span>Pick a date</span>
                                      )}
                                    </Button>
                                  </PopoverTrigger>
                                  <PopoverContent className="w-auto p-0">
                                    <Calendar
                                      mode="single"
                                      selected={destination.arrivalDate}
                                      onSelect={(date) => handleDateChange(index, 'arrivalDate', date)}
                                      disabled={(date) => 
                                        (tripStartDate ? date < tripStartDate : false) || 
                                        (tripEndDate ? date > tripEndDate : false)
                                      }
                                      initialFocus
                                    />
                                  </PopoverContent>
                                </Popover>
                              </div>
                              
                              <div className="space-y-1.5">
                                <Label htmlFor={`departure-${index}`}>Departure</Label>
                                <Popover>
                                  <PopoverTrigger asChild>
                                    <Button
                                      id={`departure-${index}`}
                                      variant="outline"
                                      className={cn(
                                        "w-full justify-start text-left font-normal",
                                        !destination.departureDate && "text-muted-foreground"
                                      )}
                                    >
                                      <CalendarIcon className="mr-2 h-4 w-4" />
                                      {destination.departureDate ? (
                                        format(destination.departureDate, "PPP")
                                      ) : (
                                        <span>Pick a date</span>
                                      )}
                                    </Button>
                                  </PopoverTrigger>
                                  <PopoverContent className="w-auto p-0">
                                    <Calendar
                                      mode="single"
                                      selected={destination.departureDate}
                                      onSelect={(date) => handleDateChange(index, 'departureDate', date)}
                                      disabled={(date) => 
                                        date < destination.arrivalDate || 
                                        (tripEndDate ? date > tripEndDate : false)
                                      }
                                      initialFocus
                                    />
                                  </PopoverContent>
                                </Popover>
                              </div>
                            </div>
                            
                            <div className="pt-1">
                              <Badge variant="outline" className="text-xs">
                                {Math.ceil((destination.departureDate.getTime() - destination.arrivalDate.getTime()) / (1000 * 60 * 60 * 24))} days
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
      
      {showNewDestinationForm && (
        <Card className="border border-dashed border-primary/50">
          <CardContent className="p-4">
            <div className="space-y-4">
              <h4 className="font-medium">Add New Destination</h4>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="new-city">City</Label>
                  <Input
                    id="new-city"
                    placeholder="e.g., Paris"
                    value={newDestination.city}
                    onChange={(e) => setNewDestination({...newDestination, city: e.target.value})}
                  />
                </div>
                
                <div className="space-y-1.5">
                  <Label htmlFor="new-country">Country</Label>
                  <Input
                    id="new-country"
                    placeholder="e.g., France"
                    value={newDestination.country}
                    onChange={(e) => setNewDestination({...newDestination, country: e.target.value})}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="new-arrival">Arrival Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        id="new-arrival"
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !newDestination.arrivalDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {newDestination.arrivalDate ? (
                          format(newDestination.arrivalDate, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={newDestination.arrivalDate}
                        onSelect={(date) => date && setNewDestination({
                          ...newDestination, 
                          arrivalDate: date,
                          departureDate: new Date(date.getTime() + 86400000)
                        })}
                        disabled={(date) => 
                          (tripStartDate ? date < tripStartDate : false) || 
                          (tripEndDate ? date > tripEndDate : false)
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                
                <div className="space-y-1.5">
                  <Label htmlFor="new-departure">Departure Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        id="new-departure"
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !newDestination.departureDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {newDestination.departureDate ? (
                          format(newDestination.departureDate, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={newDestination.departureDate}
                        onSelect={(date) => date && setNewDestination({...newDestination, departureDate: date})}
                        disabled={(date) => 
                          !newDestination.arrivalDate ||
                          date < newDestination.arrivalDate || 
                          (tripEndDate ? date > tripEndDate : false)
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
              
              <div className="flex justify-end space-x-2 pt-2">
                <Button 
                  variant="outline" 
                  onClick={() => setShowNewDestinationForm(false)}
                >
                  Cancel
                </Button>
                <Button onClick={handleAddDestination}>
                  Add Destination
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      
      {items.length === 0 && !showNewDestinationForm && (
        <div className="text-center p-6 border border-dashed rounded-md">
          <p className="text-muted-foreground mb-4">No destinations added yet. Add your first destination!</p>
          <Button 
            onClick={() => setShowNewDestinationForm(true)}
            variant="outline"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add First Destination
          </Button>
        </div>
      )}
    </div>
  );
}