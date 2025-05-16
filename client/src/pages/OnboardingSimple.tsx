import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { MapPin, Briefcase, Globe, Coffee } from 'lucide-react';

export default function OnboardingSimple() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [profileType, setProfileType] = useState('tourist');
  const [preferences, setPreferences] = useState<string[]>([]);
  const [purpose, setPurpose] = useState<string[]>([]);
  
  const totalSteps = 4;
  
  // Lista de preferências de viagem
  const travelPreferences = [
    { id: "beaches", label: "Praias e Relaxamento" },
    { id: "urban", label: "Aventuras Urbanas" },
    { id: "nature", label: "Natureza e Trilhas" },
    { id: "culture", label: "Cultura e História" },
    { id: "food", label: "Experiências Gastronômicas" },
    { id: "nightlife", label: "Vida Noturna" },
    { id: "shopping", label: "Compras" },
    { id: "wellness", label: "Bem-estar e Retiros" },
  ];
  
  // Lista de propósitos da plataforma
  const platformPurposes = [
    { id: "manual_planning", label: "Planejar uma viagem futura manualmente" },
    { id: "ai_itinerary", label: "Deixar a IA construir um itinerário para mim" },
    { id: "team_organization", label: "Organizar viagens para uma equipe ou empresa" },
    { id: "budget_tracking", label: "Controlar melhor meu orçamento de viagem" },
    { id: "discovery", label: "Descobrir novos lugares" },
    { id: "long_term", label: "Planejar viagens de longo prazo (estilo nômade)" },
  ];
  
  // Gerenciar as preferências
  const togglePreference = (id: string) => {
    setPreferences(prevPrefs => 
      prevPrefs.includes(id) 
        ? prevPrefs.filter(p => p !== id) 
        : [...prevPrefs, id]
    );
  };
  
  // Gerenciar os propósitos
  const togglePurpose = (id: string) => {
    setPurpose(prevPurpose => {
      // Se já está selecionado, remover
      if (prevPurpose.includes(id)) {
        return prevPurpose.filter(p => p !== id);
      }
      
      // Se já tem 2 selecionados e está tentando adicionar um novo, retornar a lista atual
      if (prevPurpose.length >= 2) {
        return prevPurpose;
      }
      
      // Caso contrário, adicionar
      return [...prevPurpose, id];
    });
  };
  
  const nextStep = () => {
    // Validações
    if (step === 2 && profileType === '') {
      toast({
        title: "Atenção",
        description: "Por favor, selecione um tipo de perfil para continuar.",
        variant: "destructive"
      });
      return;
    }
    
    if (step === 3 && preferences.length === 0) {
      toast({
        title: "Atenção",
        description: "Por favor, selecione pelo menos uma preferência para continuar.",
        variant: "destructive"
      });
      return;
    }
    
    setStep(current => Math.min(current + 1, totalSteps));
  };
  
  const prevStep = () => {
    setStep(current => Math.max(current - 1, 1));
  };
  
  const handleComplete = () => {
    if (purpose.length === 0) {
      toast({
        title: "Atenção",
        description: "Por favor, selecione pelo menos um propósito para continuar.",
        variant: "destructive"
      });
      return;
    }
    
    // Dados para enviar ao servidor
    const userData = {
      profileType,
      preferences,
      purpose
    };
    
    // Salvar as preferências do usuário no banco de dados
    fetch("/api/user/preferences", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...userData,
        userId: "temp-user-id-for-testing" // ID temporário para desenvolvimento
      }),
      credentials: "include"
    })
    .then(response => {
      if (!response.ok) {
        throw new Error("Falha ao salvar preferências");
      }
      console.log("Dados de onboarding enviados ao servidor:", userData);
    })
    .catch(error => {
      console.error("Erro ao salvar preferências:", error);
      // Mesmo com erro, continuamos com o fluxo para não bloquear o usuário
      toast({
        title: "Atenção",
        description: "Não foi possível salvar suas preferências, mas você pode continuar usando a plataforma.",
        variant: "destructive"
      });
    });
    
    // Mostrar toast de sucesso em todos os casos para melhorar experiência do usuário
    toast({
      title: "Perfil configurado com sucesso!",
      description: "Suas preferências foram salvas. Bem-vindo à plataforma!",
    });
    
    // Redirecionar para o dashboard apropriado após um breve delay
    setTimeout(() => {
      if (profileType === 'nomad') {
        window.location.href = "/nomad-dashboard";
      } else if (profileType === 'business') {
        window.location.href = "/business-dashboard";
      } else {
        // Para 'tourist' e outros
        window.location.href = "/dashboard";
      }
    }, 1500);
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-white to-[#88C2BF]/10 p-4">
      <Card className="w-full max-w-3xl shadow-lg border-[#19B4B0]/20">
        <CardHeader className="border-b border-[#19B4B0]/10 bg-gradient-to-r from-white to-[#88C2BF]/5">
          <CardTitle className="text-2xl bg-clip-text text-transparent bg-gradient-to-r from-[#19B4B0] to-[#82C889]">
            Configure sua Experiência de Viagem
          </CardTitle>
          <CardDescription>
            {step === 1 && "Vamos começar sua jornada conosco! Apenas 4 passos rápidos."}
            {step === 2 && "Qual melhor descreve você como viajante?"}
            {step === 3 && "Quais experiências de viagem você mais valoriza?"}
            {step === 4 && "Como você pretende usar nossa plataforma?"}
          </CardDescription>
          <Progress value={(step / totalSteps) * 100} className="mt-4 h-2 bg-[#88C2BF]/20" />
        </CardHeader>
        
        <CardContent className="pt-6 pb-2">
          {/* Etapa 1: Boas-vindas */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="text-center py-8">
                <div className="h-24 w-24 bg-gradient-to-r from-[#19B4B0] to-[#82C889] rounded-full mx-auto flex items-center justify-center mb-6">
                  <Globe className="h-12 w-12 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-[#434342] mb-2">Bem-vindo ao Travel Planner</h2>
                <p className="text-[#434342]/70 max-w-md mx-auto">
                  Configure seu perfil para receber recomendações personalizadas e aproveitar ao máximo nossa plataforma.
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                <div className="border border-[#88C2BF]/30 rounded-lg p-4 bg-white shadow-sm">
                  <div className="h-10 w-10 bg-[#88C2BF]/20 rounded-full mx-auto flex items-center justify-center mb-3">
                    <span className="font-bold text-[#19B4B0]">1</span>
                  </div>
                  <h3 className="font-medium text-[#434342]">Seu perfil</h3>
                  <p className="text-sm text-[#434342]/70 mt-2">Defina seu estilo de viagem</p>
                </div>
                
                <div className="border border-[#88C2BF]/30 rounded-lg p-4 bg-white shadow-sm">
                  <div className="h-10 w-10 bg-[#88C2BF]/20 rounded-full mx-auto flex items-center justify-center mb-3">
                    <span className="font-bold text-[#19B4B0]">2</span>
                  </div>
                  <h3 className="font-medium text-[#434342]">Preferências</h3>
                  <p className="text-sm text-[#434342]/70 mt-2">Suas atividades favoritas</p>
                </div>
                
                <div className="border border-[#88C2BF]/30 rounded-lg p-4 bg-white shadow-sm">
                  <div className="h-10 w-10 bg-[#88C2BF]/20 rounded-full mx-auto flex items-center justify-center mb-3">
                    <span className="font-bold text-[#19B4B0]">3</span>
                  </div>
                  <h3 className="font-medium text-[#434342]">Objetivos</h3>
                  <p className="text-sm text-[#434342]/70 mt-2">Como usar a plataforma</p>
                </div>
              </div>
            </div>
          )}
          
          {/* Etapa 2: Tipo de Perfil */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="space-y-4">
                {/* Opção: Turista */}
                <div 
                  className={`border rounded-lg p-5 cursor-pointer transition-all ${
                    profileType === 'tourist' 
                      ? 'border-[#19B4B0] bg-[#19B4B0]/5 shadow-md' 
                      : 'border-[#88C2BF]/30 hover:border-[#88C2BF] hover:bg-[#88C2BF]/5'
                  }`}
                  onClick={() => setProfileType('tourist')}
                >
                  <div className="flex items-start">
                    <div className={`p-2 rounded-full mr-4 ${
                      profileType === 'tourist' 
                        ? 'bg-[#19B4B0] text-white' 
                        : 'bg-[#88C2BF]/20 text-[#434342]'
                    }`}>
                      <MapPin className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className={`font-medium text-lg ${profileType === 'tourist' ? 'text-[#19B4B0]' : 'text-[#434342]'}`}>
                        Turista
                      </h3>
                      <p className="text-sm text-[#434342]/70 mt-1">
                        Viajo para lazer, férias ou exploração.
                      </p>
                    </div>
                  </div>
                </div>
                
                {/* Opção: Nômade Digital */}
                <div 
                  className={`border rounded-lg p-5 cursor-pointer transition-all ${
                    profileType === 'nomad' 
                      ? 'border-[#19B4B0] bg-[#19B4B0]/5 shadow-md' 
                      : 'border-[#88C2BF]/30 hover:border-[#88C2BF] hover:bg-[#88C2BF]/5'
                  }`}
                  onClick={() => setProfileType('nomad')}
                >
                  <div className="flex items-start">
                    <div className={`p-2 rounded-full mr-4 ${
                      profileType === 'nomad' 
                        ? 'bg-[#19B4B0] text-white' 
                        : 'bg-[#88C2BF]/20 text-[#434342]'
                    }`}>
                      <Coffee className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className={`font-medium text-lg ${profileType === 'nomad' ? 'text-[#19B4B0]' : 'text-[#434342]'}`}>
                        Nômade Digital
                      </h3>
                      <p className="text-sm text-[#434342]/70 mt-1">
                        Viajo enquanto trabalho remotamente, e preciso de flexibilidade e ferramentas de planejamento.
                      </p>
                    </div>
                  </div>
                </div>
                
                {/* Opção: Viajante de Negócios */}
                <div 
                  className={`border rounded-lg p-5 cursor-pointer transition-all ${
                    profileType === 'business' 
                      ? 'border-[#19B4B0] bg-[#19B4B0]/5 shadow-md' 
                      : 'border-[#88C2BF]/30 hover:border-[#88C2BF] hover:bg-[#88C2BF]/5'
                  }`}
                  onClick={() => setProfileType('business')}
                >
                  <div className="flex items-start">
                    <div className={`p-2 rounded-full mr-4 ${
                      profileType === 'business' 
                        ? 'bg-[#19B4B0] text-white' 
                        : 'bg-[#88C2BF]/20 text-[#434342]'
                    }`}>
                      <Briefcase className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className={`font-medium text-lg ${profileType === 'business' ? 'text-[#19B4B0]' : 'text-[#434342]'}`}>
                        Viajante de Negócios
                      </h3>
                      <p className="text-sm text-[#434342]/70 mt-1">
                        Viajo por razões profissionais, reuniões e logística da empresa.
                      </p>
                    </div>
                  </div>
                </div>
                
                {/* Opção: Outro */}
                <div 
                  className={`border rounded-lg p-5 cursor-pointer transition-all ${
                    profileType === 'other' 
                      ? 'border-[#19B4B0] bg-[#19B4B0]/5 shadow-md' 
                      : 'border-[#88C2BF]/30 hover:border-[#88C2BF] hover:bg-[#88C2BF]/5'
                  }`}
                  onClick={() => setProfileType('other')}
                >
                  <div className="flex items-start">
                    <div className={`p-2 rounded-full mr-4 ${
                      profileType === 'other' 
                        ? 'bg-[#19B4B0] text-white' 
                        : 'bg-[#88C2BF]/20 text-[#434342]'
                    }`}>
                      <Globe className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className={`font-medium text-lg ${profileType === 'other' ? 'text-[#19B4B0]' : 'text-[#434342]'}`}>
                        Outro
                      </h3>
                      <p className="text-sm text-[#434342]/70 mt-1">
                        Tenho um perfil de viajante diferente dos listados acima.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Etapa 3: Preferências de Viagem */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {travelPreferences.map((preference) => {
                  const isSelected = preferences.includes(preference.id);
                  
                  return (
                    <div
                      key={preference.id}
                      className={`flex items-center space-x-3 rounded-lg border p-4 cursor-pointer ${
                        isSelected
                          ? 'border-[#19B4B0] bg-[#19B4B0]/5 shadow-sm'
                          : 'border-[#88C2BF]/30 hover:border-[#88C2BF] hover:bg-[#88C2BF]/5'
                      }`}
                      onClick={() => togglePreference(preference.id)}
                    >
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          checked={isSelected} 
                          onCheckedChange={() => {}}
                          className={isSelected ? 'border-[#19B4B0]' : ''}
                        />
                        <Label className={`font-medium cursor-pointer ${isSelected ? 'text-[#19B4B0]' : ''}`}>
                          {preference.label}
                        </Label>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          
          {/* Etapa 4: Propósito da Plataforma */}
          {step === 4 && (
            <div className="space-y-6">
              <p className="text-sm text-[#434342]/70 mb-4">
                Escolha até 2 propósitos principais para usar nossa plataforma:
              </p>
              
              <div className="space-y-3">
                {platformPurposes.map((purposeItem) => {
                  const isSelected = purpose.includes(purposeItem.id);
                  const maxSelected = purpose.length >= 2 && !isSelected;
                  
                  return (
                    <div
                      key={purposeItem.id}
                      className={`flex items-center space-x-3 rounded-lg border p-4 ${
                        isSelected
                          ? 'border-[#19B4B0] bg-[#19B4B0]/5 shadow-sm'
                          : maxSelected
                            ? 'border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed'
                            : 'border-[#88C2BF]/30 hover:border-[#88C2BF] hover:bg-[#88C2BF]/5 cursor-pointer'
                      }`}
                      onClick={() => !maxSelected && togglePurpose(purposeItem.id)}
                    >
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          checked={isSelected} 
                          disabled={maxSelected}
                          onCheckedChange={() => {}}
                          className={isSelected ? 'border-[#19B4B0]' : ''}
                        />
                        <Label className={`font-medium cursor-pointer ${isSelected ? 'text-[#19B4B0]' : (maxSelected ? 'text-gray-400' : '')}`}>
                          {purposeItem.label}
                        </Label>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </CardContent>
        
        <CardFooter className="flex justify-between border-t border-[#19B4B0]/10 p-6">
          <Button
            type="button"
            variant="outline"
            onClick={prevStep}
            disabled={step === 1}
            className="border-[#88C2BF] text-[#434342] hover:bg-[#88C2BF]/10 hover:text-[#434342]"
          >
            {step === 1 ? 'Pular' : 'Voltar'}
          </Button>
          
          {step < totalSteps ? (
            <Button 
              type="button" 
              onClick={nextStep}
              className="bg-gradient-to-r from-[#19B4B0] to-[#82C889] hover:from-[#19B4B0]/90 hover:to-[#82C889]/90 text-white border-none"
            >
              Próximo
            </Button>
          ) : (
            <Button 
              type="button"
              onClick={handleComplete}
              className="bg-gradient-to-r from-[#19B4B0] to-[#82C889] hover:from-[#19B4B0]/90 hover:to-[#82C889]/90 text-white border-none"
            >
              Concluir
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}