import React from 'react';
import { useLocation } from 'wouter';
import { Button } from "@/components/ui/button";

interface MainNavbarProps {
  transparent?: boolean;
}

const MainNavbar: React.FC<MainNavbarProps> = ({ transparent = false }) => {
  const [_, navigate] = useLocation();

  return (
    <header className={`w-full ${transparent ? 'bg-transparent' : 'bg-white shadow-sm'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-wrap justify-between items-center">
        <div className="flex items-center">
          <h1 className={`text-2xl font-bold ${transparent ? 'text-white' : 'text-[#19B4B0]'}`}>
            VoyageWise
          </h1>
        </div>
        
        <nav className="hidden md:flex space-x-8">
          <a href="#" className={`${transparent ? 'text-white/90 hover:text-white' : 'text-[#434342] hover:text-[#19B4B0]'}`}>
            Destinos
          </a>
          <a href="#" className={`${transparent ? 'text-white/90 hover:text-white' : 'text-[#434342] hover:text-[#19B4B0]'}`}>
            Recursos
          </a>
          <a href="#" className={`${transparent ? 'text-white/90 hover:text-white' : 'text-[#434342] hover:text-[#19B4B0]'}`}>
            Preços
          </a>
          <a href="#" className={`${transparent ? 'text-white/90 hover:text-white' : 'text-[#434342] hover:text-[#19B4B0]'}`}>
            Blog
          </a>
        </nav>
        
        <div className="flex items-center space-x-3">
          <Button
            onClick={() => navigate('/auth?mode=login')}
            variant="ghost" 
            className={`hidden md:flex ${transparent ? 'text-white hover:bg-white/10' : 'text-[#19B4B0] hover:text-[#0a8f8c] hover:bg-[#19B4B0]/10'}`}
          >
            Entrar
          </Button>
          
          <Button
            onClick={() => navigate('/auth?mode=register')}
            className="bg-[#19B4B0] hover:bg-[#0a8f8c] text-white"
          >
            Cadastrar
          </Button>
        </div>
      </div>
    </header>
  );
};

export default MainNavbar;