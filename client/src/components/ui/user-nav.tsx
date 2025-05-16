import React from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/hooks/useAuth';
import { useTranslation } from 'react-i18next';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  User, 
  Settings, 
  LogOut, 
  CreditCard, 
  Bell, 
  HelpCircle, 
  Bookmark,
  ChevronDown
} from 'lucide-react';
import { getUserRoleDisplay } from '@/lib/utils';

interface UserNavProps {
  mobile?: boolean;
}

const UserNav: React.FC<UserNavProps> = ({ mobile = false }) => {
  const { user, logout } = useAuth();
  const [_, navigate] = useLocation();
  const { t } = useTranslation();
  
  const handleLogout = () => {
    try {
      // Primeiro navegamos para a home imediatamente para evitar a visualização do dashboard
      navigate('/');
      // Depois executamos o logout em segundo plano
      logout.mutate();
    } catch (error) {
      console.error("Logout failed", error);
      // Fallback para redirecionamento direto se a mutação falhar
      window.location.href = '/api/logout';
    }
  };

  // Get first letter of user's first name and last name for avatar
  const getInitials = () => {
    if (user?.firstName) {
      const firstInitial = user.firstName.charAt(0);
      const lastInitial = user?.lastName ? user.lastName.charAt(0) : '';
      return `${firstInitial}${lastInitial}`.toUpperCase();
    }
    return user?.email?.charAt(0).toUpperCase() || 'U';
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-2 rounded-full p-0.5 border border-[#88C2BF]/30 bg-white hover:bg-[#F9FAFA] hover:border-[#88C2BF]/50 transition-all duration-200 overflow-hidden shadow-sm hover:shadow-md">
          <div className="flex items-center">
            {user?.profileImageUrl ? (
              <img 
                src={user.profileImageUrl}
                alt="User profile" 
                className="h-9 w-9 rounded-full object-cover" 
              />
            ) : (
              <div className="h-9 w-9 rounded-full bg-[#EAEAEA] text-[#434342] flex items-center justify-center font-medium">
                {getInitials()}
              </div>
            )}
            
            {!mobile && (
              <div className="flex flex-col mx-3">
                <span className="text-sm font-medium text-[#434342] leading-tight">
                  {user?.firstName || (user?.email ? user.email.split('@')[0] : 'User')}
                </span>
                <span className="text-xs font-normal text-[#19B4B0] leading-tight">
                  {user?.role ? getUserRoleDisplay(user.role) : 'Tourist'}
                </span>
              </div>
            )}
            
            <div className="px-1 mr-1">
              <ChevronDown className="h-4 w-4 text-[#434342]/60" />
            </div>
          </div>
        </button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end" className="w-56 rounded-xl p-2 border border-[#19B4B0]/20 shadow-lg bg-white">
        <DropdownMenuLabel className="font-normal px-2 py-2">
          <div className="flex flex-col">
            <p className="text-sm font-semibold text-[#434342]">
              {user?.firstName && user?.lastName 
                ? `${user.firstName} ${user.lastName}` 
                : user?.firstName || user?.email || 'User'}
            </p>
            <p className="text-xs text-[#434342]/70 mt-0.5">{user?.email}</p>
          </div>
        </DropdownMenuLabel>
        
        <DropdownMenuSeparator className="bg-[#19B4B0]/10 my-1" />
        
        <DropdownMenuItem 
          className="flex items-center gap-2 rounded-lg p-2 text-sm text-[#434342] cursor-pointer hover:bg-[#19B4B0]/5"
          onClick={() => navigate('/profile')}
        >
          <User className="h-4 w-4 text-[#19B4B0]" />
          <span>{t('navigation.myProfile', 'Meu Perfil')}</span>
        </DropdownMenuItem>
        
        <DropdownMenuItem 
          className="flex items-center gap-2 rounded-lg p-2 text-sm text-[#434342] cursor-pointer hover:bg-[#19B4B0]/5"
          onClick={() => navigate('/settings')}
        >
          <Settings className="h-4 w-4 text-[#88C2BF]" />
          <span>{t('navigation.settings', 'Configurações')}</span>
        </DropdownMenuItem>
        
        <DropdownMenuItem 
          className="flex items-center gap-2 rounded-lg p-2 text-sm text-[#434342] cursor-pointer hover:bg-[#19B4B0]/5"
          onClick={() => navigate('/saved-trips')}
        >
          <Bookmark className="h-4 w-4 text-[#82C889]" />
          <span>{t('navigation.savedTrips', 'Viagens Salvas')}</span>
        </DropdownMenuItem>
        
        <DropdownMenuItem 
          className="flex items-center gap-2 rounded-lg p-2 text-sm text-[#434342] cursor-pointer hover:bg-[#19B4B0]/5"
          onClick={() => navigate('/billing')}
        >
          <CreditCard className="h-4 w-4 text-[#88C2BF]" />
          <span>{t('navigation.subscription', 'Assinatura & Pagamentos')}</span>
        </DropdownMenuItem>
        
        <DropdownMenuItem 
          className="flex items-center gap-2 rounded-lg p-2 text-sm text-[#434342] cursor-pointer hover:bg-[#19B4B0]/5"
          onClick={() => navigate('/help')}
        >
          <HelpCircle className="h-4 w-4 text-[#82C889]" />
          <span>{t('navigation.help', 'Ajuda & Suporte')}</span>
        </DropdownMenuItem>
        
        <DropdownMenuSeparator className="bg-[#19B4B0]/10 my-1" />
        
        <DropdownMenuItem 
          className="flex items-center gap-2 rounded-lg p-2 text-sm text-[#434342] cursor-pointer hover:bg-red-50"
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4 text-red-500" />
          <span className="text-red-500">{t('auth.logout', 'Sair')}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserNav;
