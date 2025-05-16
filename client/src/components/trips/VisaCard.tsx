import React from 'react';
import { VisaInformation } from '@shared/schema';
import { Button } from '@/components/ui/button';
import { Clock, DollarSign, FileText } from 'lucide-react';

interface VisaCardProps {
  visaInfo: VisaInformation;
}

const VisaCard: React.FC<VisaCardProps> = ({ visaInfo }) => {
  // Extract requirements from the JSON if it exists
  const requirements = visaInfo.requirements 
    ? (typeof visaInfo.requirements === 'string' 
        ? JSON.parse(visaInfo.requirements) 
        : visaInfo.requirements) 
    : [];

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <div className="px-5 py-4 bg-emerald-500 bg-opacity-10">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <img 
              src={`https://flagcdn.com/48x36/${visaInfo.countryCode.toLowerCase()}.png`}
              alt={`${visaInfo.country} flag`} 
              className="w-8 h-8 rounded-full object-cover" 
            />
            <h4 className="ml-3 text-lg font-semibold text-gray-900">{visaInfo.country}</h4>
          </div>
          <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800 font-medium">
            {visaInfo.visaType}
          </span>
        </div>
      </div>
      <div className="p-5">
        <div className="space-y-3">
          <div className="flex items-start">
            <Clock className="text-gray-400 mt-0.5 h-5 w-5" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-900">Duration</p>
              <p className="text-sm text-gray-600">
                {visaInfo.allowedStayDays 
                  ? `${visaInfo.allowedStayDays} days` 
                  : visaInfo.processingTime || 'Varies by nationality'}
              </p>
            </div>
          </div>
          <div className="flex items-start">
            <DollarSign className="text-gray-400 mt-0.5 h-5 w-5" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-900">Cost</p>
              <p className="text-sm text-gray-600">
                {visaInfo.cost 
                  ? `${visaInfo.currency || 'USD'} ${visaInfo.cost}` 
                  : 'Varies by nationality'}
              </p>
            </div>
          </div>
          <div className="flex items-start">
            <FileText className="text-gray-400 mt-0.5 h-5 w-5" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-900">Requirements</p>
              {Array.isArray(requirements) && requirements.length > 0 ? (
                <ul className="text-sm text-gray-600 list-disc pl-4 mt-1">
                  {requirements.slice(0, 3).map((req, index) => (
                    <li key={index}>{req}</li>
                  ))}
                  {requirements.length > 3 && (
                    <li>And {requirements.length - 3} more requirements...</li>
                  )}
                </ul>
              ) : (
                <p className="text-sm text-gray-600">
                  {visaInfo.notes || 'Passport valid for 6+ months, return ticket, proof of accommodation'}
                </p>
              )}
            </div>
          </div>
        </div>
        <div className="mt-4">
          <Button className="w-full bg-emerald-500 hover:bg-emerald-600 text-white">
            View Detailed Requirements
          </Button>
        </div>
      </div>
    </div>
  );
};

export default VisaCard;
