import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/hooks/useAuth';
import { useTranslation } from 'react-i18next';
import MobileSidebar from '@/components/ui/mobile-sidebar';
import UserNav from '@/components/ui/user-nav';
import { LanguageSwitcher, SimpleLanguageSwitcher } from '@/components/ui/language-switcher';
import { cn, getUserRoleDisplay } from '@/lib/utils';
import { Toaster } from '@/components/ui/toaster';
import { 
  HomeIcon, 
  CompassIcon, 
  Luggage, 
  Users, 
  Briefcase, 
  Settings,
  HelpCircle,
  Laptop,
  Building,
  MapPin,
  CreditCard
} from 'lucide-react';

interface MainLayoutProps {
  children: React.ReactNode;
}

interface SidebarLink {
  href: string;
  icon: React.ReactNode;
  label: string;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const [location] = useLocation();
  const { user, isAuthenticated } = useAuth();
  const { t } = useTranslation();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [pageTitle, setPageTitle] = useState('');

  // Get user role or default to tourist
  const userRole = user?.role || 'tourist';

  useEffect(() => {
    // Set page title based on current route
    const path = location.split('/')[1];
    
    switch (path) {
      case '':
        setPageTitle(t('navigation.home', 'Início'));
        break;
      case 'dashboard':
        setPageTitle(`${userRole ? getUserRoleDisplay(userRole) : ''} ${t('navigation.dashboard', 'Painel')}`);
        break;
      case 'explore':
        setPageTitle(t('navigation.explore', 'Explorar'));
        break;
      case 'trips':
        setPageTitle(t('navigation.myTrips', 'Minhas Viagens'));
        break;
      case 'booking':
        setPageTitle(t('navigation.booking', 'Reservas'));
        break;
      case 'trip-creator':
        setPageTitle(t('tripBuilder.createTrip', 'Criar Viagem'));
        break;
      case 'workspaces':
        setPageTitle(t('navigation.workspaces', 'Espaços de Trabalho'));
        break;
      case 'community':
        setPageTitle(t('navigation.community', 'Comunidade'));
        break;
      case 'budget':
        setPageTitle(t('navigation.budget', 'Orçamento'));
        break;
      case 'settings':
        setPageTitle(t('navigation.settings', 'Configurações'));
        break;
      default:
        setPageTitle('');
    }
  }, [location, userRole]);

  const roleSpecificIcon = userRole === 'nomad' 
    ? <Laptop className="h-5 w-5" />
    : userRole === 'business' 
      ? <Building className="h-5 w-5" />
      : <MapPin className="h-5 w-5" />;
  
  const sidebarLinks: SidebarLink[] = [
    { href: '/dashboard', icon: <HomeIcon className="h-5 w-5" />, label: t('navigation.dashboard', 'Painel') },
    { href: '/explore', icon: <CompassIcon className="h-5 w-5" />, label: t('navigation.explore', 'Explorar') },
    { href: '/trips', icon: <Luggage className="h-5 w-5" />, label: t('navigation.trips', 'Viagens') },
    { href: '/booking', icon: <Briefcase className="h-5 w-5" />, label: t('navigation.booking', 'Reservas') },
    { 
      href: userRole === 'nomad' ? '/workspaces' : '/attractions', 
      icon: roleSpecificIcon, 
      label: userRole === 'nomad' 
        ? t('navigation.workspaces', 'Espaços de Trabalho') 
        : userRole === 'business' 
          ? t('navigation.businessCenters', 'Centros Empresariais') 
          : t('navigation.attractions', 'Atrações')
    },
    { href: '/community', icon: <Users className="h-5 w-5" />, label: t('navigation.community', 'Comunidade') },
    { href: '/budget', icon: <CreditCard className="h-5 w-5" />, label: t('navigation.budget', 'Orçamento') },
    { href: '/settings', icon: <Settings className="h-5 w-5" />, label: t('navigation.settings', 'Configurações') },
  ];

  // Handle fallback avatar URL for users without a profile image
  const avatarUrl = user?.profileImageUrl || 
    `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.firstName || (user?.email ? user.email.split('@')[0] : 'User'))}`;

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Mobile Navigation Header */}
      <div className="fixed top-0 left-0 right-0 h-16 bg-gradient-to-r from-white to-[#88C2BF]/5 border-b border-[#19B4B0]/20 shadow-lg z-30 flex md:hidden items-center justify-between px-6">
        <div className="flex items-center">
          <button
            type="button"
            onClick={() => setIsMobileSidebarOpen(true)}
            className="text-[#19B4B0] p-2 rounded-md hover:bg-[#19B4B0]/10 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className=""><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></svg>
          </button>
          <div className="flex items-center ml-3">
            <div className="h-10 w-10 rounded-full bg-gradient-to-r from-[#19B4B0] to-[#82C889] shadow-inner flex items-center justify-center">
              <svg className="h-6 w-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12,1C7.6,1,4,4.6,4,9c0,4.1,3.8,9.7,7.1,13.4c0.6,0.6,1.5,0.6,2.1,0C16.2,18.7,20,13.1,20,9C20,4.6,16.4,1,12,1z M12,13c-2.2,0-4-1.8-4-4s1.8-4,4-4s4,1.8,4,4S14.2,13,12,13z"></path>
              </svg>
            </div>
            <span className="ml-3 text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#19B4B0] to-[#82C889]">{t('app.name', 'Planejador de Viagem')}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <SimpleLanguageSwitcher />
          <UserNav mobile={true} />
        </div>
      </div>

      {/* Mobile Sidebar */}
      <MobileSidebar 
        isOpen={isMobileSidebarOpen} 
        onClose={() => setIsMobileSidebarOpen(false)}
        links={sidebarLinks}
        user={user}
      />

      {/* Desktop Sidebar */}
      <div className="hidden md:flex md:flex-shrink-0">
        <div className="w-64 flex flex-col">
          <div className="flex flex-col h-0 flex-1 border-r border-[#19B4B0]/20 bg-gradient-to-b from-white to-[#88C2BF]/5 shadow-xl">
            <div className="flex-1 flex flex-col pt-8 pb-4 overflow-y-auto">
              {/* Logo & Branding */}
              <div className="px-6 mb-8">
                <div className="flex items-center justify-center">
                  <div className="h-16 w-16 bg-gradient-to-r from-[#19B4B0] to-[#82C889] rounded-xl shadow-md flex items-center justify-center mb-2">
                    <svg className="h-10 w-10 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12,1C7.6,1,4,4.6,4,9c0,4.1,3.8,9.7,7.1,13.4c0.6,0.6,1.5,0.6,2.1,0C16.2,18.7,20,13.1,20,9C20,4.6,16.4,1,12,1z M12,13c-2.2,0-4-1.8-4-4s1.8-4,4-4s4,1.8,4,4S14.2,13,12,13z"></path>
                    </svg>
                  </div>
                </div>
                <p className="text-center text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#19B4B0] to-[#82C889] mt-2">
                  {t('app.name', 'Planejador de Viagem')}
                </p>
              </div>
              
              <nav className="mt-2 flex-1 px-4 space-y-2">
                {sidebarLinks.map((link) => (
                  <a 
                    key={link.href}
                    href={link.href}
                    className={cn(
                      "group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 border",
                      location === link.href 
                        ? "bg-[#19B4B0]/10 text-[#19B4B0] border-[#19B4B0]/30 shadow-md" 
                        : "text-[#434342] hover:bg-[#19B4B0]/5 hover:border-[#19B4B0]/20 border-transparent hover:shadow-sm"
                    )}
                  >
                    <span className={cn(
                      "mr-3",
                      location === link.href 
                        ? "text-[#19B4B0]" 
                        : "text-[#434342]/60 group-hover:text-[#19B4B0]"
                    )}>
                      {link.icon}
                    </span>
                    {link.label}
                  </a>
                ))}
              </nav>
            </div>
            
            {/* Help & Support */}
            <div className="px-6 py-5 border-t border-[#19B4B0]/20">
              <a 
                href="#" 
                className="group flex items-center px-4 py-3 text-sm font-medium rounded-xl text-[#434342] hover:bg-[#88C2BF]/10 hover:text-[#88C2BF] transition-all duration-200 border border-transparent hover:border-[#88C2BF]/20 hover:shadow-sm"
              >
                <HelpCircle className="h-5 w-5 mr-3 text-[#434342]/60 group-hover:text-[#88C2BF]" />
                {t('navigation.help', 'Ajuda & Suporte')}
              </a>
            </div>
          </div>
        </div>
      </div>
      
      {/* Main Content Area */}
      <div className="flex flex-col w-0 flex-1 overflow-hidden">
        {/* Desktop Header */}
        <div className="hidden md:flex md:justify-between md:items-center h-16 bg-gradient-to-r from-white to-[#88C2BF]/5 border-b border-[#19B4B0]/20 shadow-md px-8">
          <h1 className="text-2xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-[#19B4B0] to-[#82C889]">{pageTitle}</h1>
          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            <UserNav />
          </div>
        </div>
        
        {/* Main Content */}
        <main className="flex-1 relative z-0 overflow-y-auto pt-16 md:pt-0 pb-6 focus:outline-none bg-[#F9FAFA]">
          <div className="py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              {children}
            </div>
          </div>
        </main>
      </div>
      <Toaster />
    </div>
  );
};

export default MainLayout;
