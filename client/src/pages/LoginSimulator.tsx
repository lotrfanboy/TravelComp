import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { MapPin, Briefcase, Coffee } from "lucide-react";

export default function LoginSimulator() {
  const [, navigate] = useLocation();
  const [profileType, setProfileType] = useState('tourist');

  const handleSelectProfile = () => {
    // Armazenar o tipo de perfil no localStorage para simulação
    localStorage.setItem('simulatedProfileType', profileType);
    localStorage.setItem('simulatedAuth', 'true');
    
    toast({
      title: "Perfil selecionado",
      description: "Você será redirecionado para o dashboard apropriado.",
    });
    
    // Redirecionar para o dashboard apropriado
    setTimeout(() => {
      if (profileType === 'nomad') {
        window.location.href = "/nomad-dashboard";
      } else if (profileType === 'business') {
        window.location.href = "/business-dashboard";
      } else {
        window.location.href = "/dashboard";
      }
    }, 1000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-white to-[#88C2BF]/10 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="border-b border-[#19B4B0]/10 bg-gradient-to-r from-white to-[#88C2BF]/5">
          <CardTitle className="text-2xl bg-clip-text text-transparent bg-gradient-to-r from-[#19B4B0] to-[#82C889]">
            Simulador de Login
          </CardTitle>
          <CardDescription>
            Escolha um tipo de perfil para testar o fluxo de navegação
          </CardDescription>
        </CardHeader>
        
        <CardContent className="pt-6">
          <div className="space-y-4">
            <RadioGroup
              value={profileType}
              onValueChange={setProfileType}
              className="space-y-4"
            >
              {/* Opção: Turista */}
              <div className={`border rounded-lg p-4 cursor-pointer transition-all ${
                profileType === 'tourist' 
                  ? 'border-[#19B4B0] bg-[#19B4B0]/5 shadow-md' 
                  : 'border-[#88C2BF]/30 hover:border-[#88C2BF] hover:bg-[#88C2BF]/5'
              }`}>
                <div className="flex items-start">
                  <RadioGroupItem value="tourist" id="tourist" className="sr-only" />
                  <div className={`p-2 rounded-full mr-4 ${
                    profileType === 'tourist' 
                      ? 'bg-[#19B4B0] text-white' 
                      : 'bg-[#88C2BF]/20 text-[#434342]'
                  }`}>
                    <MapPin className="h-5 w-5" />
                  </div>
                  <Label htmlFor="tourist" className="flex-1 cursor-pointer">
                    <div>
                      <h3 className={`font-medium ${profileType === 'tourist' ? 'text-[#19B4B0]' : 'text-[#434342]'}`}>
                        Turista
                      </h3>
                      <p className="text-sm text-[#434342]/70 mt-1">
                        Viajo para lazer, férias ou exploração.
                      </p>
                    </div>
                  </Label>
                </div>
              </div>
              
              {/* Opção: Nômade Digital */}
              <div className={`border rounded-lg p-4 cursor-pointer transition-all ${
                profileType === 'nomad' 
                  ? 'border-[#19B4B0] bg-[#19B4B0]/5 shadow-md' 
                  : 'border-[#88C2BF]/30 hover:border-[#88C2BF] hover:bg-[#88C2BF]/5'
              }`}>
                <div className="flex items-start">
                  <RadioGroupItem value="nomad" id="nomad" className="sr-only" />
                  <div className={`p-2 rounded-full mr-4 ${
                    profileType === 'nomad' 
                      ? 'bg-[#19B4B0] text-white' 
                      : 'bg-[#88C2BF]/20 text-[#434342]'
                  }`}>
                    <Coffee className="h-5 w-5" />
                  </div>
                  <Label htmlFor="nomad" className="flex-1 cursor-pointer">
                    <div>
                      <h3 className={`font-medium ${profileType === 'nomad' ? 'text-[#19B4B0]' : 'text-[#434342]'}`}>
                        Nômade Digital
                      </h3>
                      <p className="text-sm text-[#434342]/70 mt-1">
                        Viajo enquanto trabalho remotamente.
                      </p>
                    </div>
                  </Label>
                </div>
              </div>
              
              {/* Opção: Viajante de Negócios */}
              <div className={`border rounded-lg p-4 cursor-pointer transition-all ${
                profileType === 'business' 
                  ? 'border-[#19B4B0] bg-[#19B4B0]/5 shadow-md' 
                  : 'border-[#88C2BF]/30 hover:border-[#88C2BF] hover:bg-[#88C2BF]/5'
              }`}>
                <div className="flex items-start">
                  <RadioGroupItem value="business" id="business" className="sr-only" />
                  <div className={`p-2 rounded-full mr-4 ${
                    profileType === 'business' 
                      ? 'bg-[#19B4B0] text-white' 
                      : 'bg-[#88C2BF]/20 text-[#434342]'
                  }`}>
                    <Briefcase className="h-5 w-5" />
                  </div>
                  <Label htmlFor="business" className="flex-1 cursor-pointer">
                    <div>
                      <h3 className={`font-medium ${profileType === 'business' ? 'text-[#19B4B0]' : 'text-[#434342]'}`}>
                        Viajante de Negócios
                      </h3>
                      <p className="text-sm text-[#434342]/70 mt-1">
                        Viajo por razões profissionais.
                      </p>
                    </div>
                  </Label>
                </div>
              </div>
            </RadioGroup>
          </div>
        </CardContent>
        
        <CardFooter className="flex flex-col gap-4">
          <Button 
            onClick={handleSelectProfile}
            className="w-full bg-[#19B4B0] hover:bg-[#0a8f8c] text-white"
          >
            Entrar como {profileType === 'tourist' ? 'Turista' : profileType === 'nomad' ? 'Nômade Digital' : 'Viajante de Negócios'}
          </Button>
          
          <p className="text-sm text-[#434342]/70 text-center">
            Modo de demonstração para testar o fluxo de navegação entre os diferentes tipos de perfil.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}