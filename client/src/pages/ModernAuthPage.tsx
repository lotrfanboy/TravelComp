import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ModernLoginForm } from "@/components/auth/ModernLoginForm";
import { ModernRegisterForm } from "@/components/auth/ModernRegisterForm";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";

// Array de imagens inspiradoras para o painel lateral
const backgroundImages = [
  {
    url: "https://images.pexels.com/photos/1174732/pexels-photo-1174732.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
    location: "Johnny Cay, San Andrés"
  },
  {
    url: "https://images.pexels.com/photos/1559821/pexels-photo-1559821.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
    location: "El Chaltén, Patagonia"
  },
  {
    url: "https://images.pexels.com/photos/2474689/pexels-photo-2474689.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
    location: "Ubud, Bali"
  },
  {
    url: "https://images.pexels.com/photos/1134166/pexels-photo-1134166.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
    location: "Grand Palace, Bangkok"
  },
  {
    url: "https://images.pexels.com/photos/2901212/pexels-photo-2901212.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
    location: "Havana, Cuba"
  }
];

export default function ModernAuthPage() {
  const [activeTab, setActiveTab] = useState("login");
  const [_, navigate] = useLocation();
  const { isAuthenticated } = useAuth();
  const [currentBackground, setCurrentBackground] = useState(0);
  
  // Efeito para alternar imagens de fundo a cada 4 segundos
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBackground((prev) => 
        prev === backgroundImages.length - 1 ? 0 : prev + 1
      );
    }, 4000);
    
    return () => clearInterval(interval);
  }, []);

  // Verificar se há parâmetros de erro na URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const error = params.get('error');
    
    if (error) {
      toast({
        title: "Authentication Error",
        description: error === "authentication_failed" 
          ? "Login failed. Please check your credentials and try again." 
          : `An error occurred: ${error}`,
        variant: "destructive",
      });
      
      // Limpar a URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);
  
  // Se já estiver autenticado, redirecionar para o dashboard conforme o tipo de perfil
  const { user } = useAuth();
  
  if (isAuthenticated && user && user.role) {
    if (user.role === 'nomad') {
      navigate("/nomad-dashboard");
    } else if (user.role === 'business') {
      navigate("/business-dashboard");
    } else {
      // Para 'tourist' e outros
      navigate("/dashboard");
    }
    return null;
  }
  
  const handleSuccess = () => {
    // Após o login bem-sucedido, será redirecionado com base no papel do usuário
    // através do efeito acima que verifica isAuthenticated
  };
  
  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-[#F7FAF9]">
      {/* Painel lateral com imagem - visível apenas em telas maiores */}
      <div className="hidden lg:block lg:w-1/2 relative overflow-hidden">
        {backgroundImages.map((image, index) => (
          <div 
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index === currentBackground ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <div className="absolute inset-0 bg-black/30 z-10" />
            <img 
              src={image.url} 
              alt={image.location} 
              className="h-full w-full object-cover"
              onError={(e) => {
                // Se a imagem falhar, substituir por uma cor de fundo
                e.currentTarget.style.display = 'none';
                if (e.currentTarget.parentElement) {
                  e.currentTarget.parentElement.style.backgroundColor = '#19B4B0';
                }
              }}
            />
            <div className="absolute bottom-0 left-0 w-full p-8 z-20 bg-gradient-to-t from-black/60 to-transparent">
              <h2 className="text-white text-3xl font-bold">{image.location}</h2>
              <p className="text-white/80 text-lg">Plan your next adventure</p>
            </div>
          </div>
        ))}
      </div>
      
      {/* Área de formulário */}
      <div className="flex-1 flex flex-col">
        {/* Cabeçalho */}
        <header className="py-6 px-8 flex justify-between items-center">
          <div className="flex items-center">
            <svg className="h-10 w-10 text-[#19B4B0]" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12,1C7.6,1,4,4.6,4,9c0,4.1,3.8,9.7,7.1,13.4c0.6,0.6,1.5,0.6,2.1,0C16.2,18.7,20,13.1,20,9C20,4.6,16.4,1,12,1z M12,13c-2.2,0-4-1.8-4-4s1.8-4,4-4s4,1.8,4,4S14.2,13,12,13z"></path>
            </svg>
            <span className="ml-2 text-2xl font-bold text-[#434342]">Voyagewise</span>
          </div>
          <a 
            href="/" 
            className="text-[#19B4B0] hover:text-[#0a8f8c] transition-colors duration-200"
          >
            Back to Home
          </a>
        </header>
        
        {/* Área do formulário */}
        <div className="flex-1 flex items-center justify-center px-6 py-8 lg:py-0">
          <div className="w-full max-w-md bg-white shadow-xl rounded-2xl overflow-hidden border border-gray-100">
            <div className="px-8 pt-8 pb-6">
              <h1 className="text-3xl font-bold text-[#434342]">
                {activeTab === "login" ? "Welcome Back" : "Create Account"}
              </h1>
              <p className="mt-2 text-[#434342]/70">
                {activeTab === "login" 
                  ? "Sign in to continue your journey planning" 
                  : "Join thousands of travelers worldwide"}
              </p>
            </div>
            
            <div className="px-8 pb-8">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-8 bg-[#F7FAF9] p-0 h-auto">
                  <TabsTrigger 
                    value="login" 
                    className="data-[state=active]:bg-[#19B4B0] data-[state=active]:text-white py-3 text-base rounded-md rounded-r-none shadow-none data-[state=active]:shadow-none data-[state=active]:border-0"
                  >
                    Login
                  </TabsTrigger>
                  <TabsTrigger 
                    value="register" 
                    className="data-[state=active]:bg-[#19B4B0] data-[state=active]:text-white py-3 text-base rounded-md rounded-l-none shadow-none data-[state=active]:shadow-none data-[state=active]:border-0"
                  >
                    Register
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="login" className="mt-0">
                  <ModernLoginForm onSuccess={handleSuccess} />
                </TabsContent>
                
                <TabsContent value="register" className="mt-0">
                  <ModernRegisterForm onSuccess={() => {
                    setActiveTab("login");
                    toast({
                      title: "Account created successfully!",
                      description: "Please sign in with your new credentials.",
                    });
                  }} />
                </TabsContent>
              </Tabs>
              
              <div className="mt-6 text-center text-sm text-[#434342]/60">
                <p>
                  By continuing, you agree to our{" "}
                  <a href="#" className="text-[#19B4B0] hover:text-[#0a8f8c]">
                    Terms of Service
                  </a>{" "}
                  and{" "}
                  <a href="#" className="text-[#19B4B0] hover:text-[#0a8f8c]">
                    Privacy Policy
                  </a>.
                </p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Rodapé */}
        <footer className="py-6 px-8 text-center text-[#434342]/60 text-sm">
          <p>© 2023 Voyagewise. All rights reserved.</p>
        </footer>
      </div>
    </div>
  );
}