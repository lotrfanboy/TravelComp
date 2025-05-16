import React from 'react';
import { Button } from '@/components/ui/button';
import { MessageSquare, ThumbsUp } from 'lucide-react';

interface EventCardProps {
  type: 'event';
  title: string;
  date: string;
  location: string;
  attendees: number;
  imageUrl: string;
}

interface ForumCardProps {
  type: 'forum';
  title: string;
  author: {
    name: string;
    imageUrl: string;
    postedTime: string;
  };
  content: string;
  replies: number;
  likes: number;
}

type CommunityCardProps = EventCardProps | ForumCardProps;

const CommunityCard: React.FC<CommunityCardProps> = (props) => {
  if (props.type === 'event') {
    return (
      <div className="border border-gray-200 rounded-lg overflow-hidden flex">
        <div 
          className="w-24 sm:w-32 bg-cover bg-center" 
          style={{ backgroundImage: `url('${props.imageUrl}')` }}
        />
        <div className="flex-1 p-4">
          <span className="px-2 py-1 text-xs rounded-full bg-purple-100 text-purple-800 font-medium">Event</span>
          <h4 className="text-md font-semibold text-gray-900 mt-2">{props.title}</h4>
          <div className="flex items-center mt-1">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
            <span className="ml-1 text-sm text-gray-600">{props.date}</span>
          </div>
          <div className="flex items-center mt-1">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
            <span className="ml-1 text-sm text-gray-600">{props.location}</span>
          </div>
          <div className="mt-3 flex items-center">
            <div className="flex -space-x-2 mr-3">
              <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=32&h=32&q=80" className="w-6 h-6 rounded-full border-2 border-white" alt="Attendee" />
              <img src="https://images.unsplash.com/photo-1506863530036-1efeddceb993?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=32&h=32&q=80" className="w-6 h-6 rounded-full border-2 border-white" alt="Attendee" />
              <img src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=32&h=32&q=80" className="w-6 h-6 rounded-full border-2 border-white" alt="Attendee" />
            </div>
            <span className="text-xs text-gray-500">{props.attendees} attending</span>
          </div>
          <Button className="mt-2 w-full bg-emerald-500 hover:bg-emerald-600 text-white">
            RSVP Now
          </Button>
        </div>
      </div>
    );
  } else {
    return (
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <div className="p-4">
          <div className="flex items-center">
            <img 
              src={props.author.imageUrl} 
              alt={props.author.name} 
              className="w-10 h-10 rounded-full object-cover" 
            />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-900">{props.author.name}</p>
              <p className="text-xs text-gray-500">Posted {props.author.postedTime}</p>
            </div>
          </div>
          <div className="mt-3">
            <h4 className="text-md font-semibold text-gray-900">{props.title}</h4>
            <p className="mt-1 text-sm text-gray-600 line-clamp-2">{props.content}</p>
          </div>
          <div className="mt-3 flex items-center">
            <div className="flex items-center">
              <MessageSquare className="h-4 w-4 text-gray-400" />
              <span className="ml-1 text-xs text-gray-500">{props.replies} replies</span>
            </div>
            <div className="flex items-center ml-4">
              <ThumbsUp className="h-4 w-4 text-gray-400" />
              <span className="ml-1 text-xs text-gray-500">{props.likes} likes</span>
            </div>
          </div>
          <div className="mt-3 flex space-x-2">
            <Button variant="outline" size="sm" className="flex-1">
              View Thread
            </Button>
            <Button size="sm" className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white">
              Reply
            </Button>
          </div>
        </div>
      </div>
    );
  }
};

export default CommunityCard;
