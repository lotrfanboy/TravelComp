import React from 'react';
import { useLocation } from 'wouter';
import { cn, getUserRoleDisplay } from '@/lib/utils';

// Use a generic user interface to match the one from useAuth hook
interface UserType {
  id: string;
  email?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  profileImageUrl?: string | null;
  role?: string;
}

interface MobileSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  links: { href: string; icon: React.ReactNode; label: string }[];
  user: UserType | null | undefined;
}

const MobileSidebar: React.FC<MobileSidebarProps> = ({ isOpen, onClose, links, user }) => {
  const [location, navigate] = useLocation();

  const handleNavigation = (href: string) => {
    navigate(href);
    onClose();
  };

  const userRole = user?.role || 'tourist';

  return (
    <div 
      className={cn(
        "fixed inset-0 transform transition-transform duration-300 ease-in-out z-40 md:hidden",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}
    >
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-gray-500 bg-opacity-75 transition-opacity" 
        onClick={onClose}
      />
      
      {/* Sidebar Content */}
      <div className="relative max-w-xs w-full h-full bg-white shadow-xl flex flex-col">
        {/* User Section */}
        <div className="p-4 border-b flex items-center space-x-3">
          <img 
            src={user?.profileImageUrl || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=256&h=256&q=80"} 
            alt="User profile" 
            className="h-10 w-10 rounded-full object-cover" 
          />
          <div>
            <p className="font-medium text-gray-900">
              {user?.firstName || user?.email || 'User'}
            </p>
            <div className="flex items-center">
              <span className={`px-2 py-1 text-xs rounded-full ${
                userRole === 'nomad' 
                  ? 'bg-emerald-500 bg-opacity-10 text-emerald-500' 
                  : userRole === 'business'
                    ? 'bg-indigo-500 bg-opacity-10 text-indigo-500'
                    : 'bg-yellow-500 bg-opacity-10 text-yellow-500'
              } font-medium`}>
                {getUserRoleDisplay(userRole)}
              </span>
            </div>
          </div>
        </div>
        
        {/* Navigation Menu */}
        <div className="flex-1 overflow-y-auto">
          <nav className="px-2 py-4 space-y-1">
            {links.map((link) => (
              <button
                key={link.href}
                onClick={() => handleNavigation(link.href)}
                className={cn(
                  "flex items-center w-full px-3 py-2 text-base font-medium rounded-md",
                  location === link.href 
                    ? "bg-primary-50 text-primary-700" 
                    : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                )}
              >
                <span className={cn(
                  "mr-3",
                  location === link.href 
                    ? "text-primary-500" 
                    : "text-gray-400"
                )}>
                  {link.icon}
                </span>
                {link.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Help & Support */}
        <div className="px-2 py-4 border-t border-gray-200">
          <button className="flex items-center w-full px-3 py-2 text-base font-medium rounded-md text-gray-700 hover:bg-gray-50 hover:text-gray-900">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3 text-gray-400" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><path d="M12 17h.01"/></svg>
            Help & Support
          </button>
        </div>
      </div>
    </div>
  );
};

export default MobileSidebar;
