import { useState } from "react";
import { useLocation } from "wouter";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";
import { MapPin, Briefcase, Globe, Coffee } from "lucide-react";

// Define o schema de validação
const onboardingSchema = z.object({
  // Etapa 2: Tipo de Perfil
  profileType: z.enum(['tourist', 'nomad', 'business', 'other'], {
    required_error: "Selecione um tipo de perfil",
  }),
  
  // Etapa 3: Preferências de Viagem
  travelPreferences: z.array(z.string()).min(1, {
    message: "Selecione pelo menos uma preferência",
  }),
  
  // Etapa 4: Propósito da Plataforma
  platformPurpose: z.array(z.string()).min(1, {
    message: "Selecione pelo menos um propósito",
  }),
});

type OnboardingData = z.infer<typeof onboardingSchema>;

export default function SimpleOnboardingFlow() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4;
  
  // Configuração do formulário
  const form = useForm<OnboardingData>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      profileType: 'tourist',
      travelPreferences: [],
      platformPurpose: [],
    },
  });
  
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
  
  // Avançar para o próximo passo
  const nextStep = () => {
    if (currentStep === 2) {
      // Valida o tipo de perfil antes de prosseguir
      if (!form.getValues().profileType) {
        form.setError("profileType", { message: "Selecione um tipo de perfil" });
        return;
      }
    }
    
    if (currentStep === 3) {
      // Valida as preferências de viagem antes de prosseguir
      if (form.getValues().travelPreferences.length === 0) {
        form.setError("travelPreferences", { message: "Selecione pelo menos uma preferência" });
        return;
      }
    }
    
    setCurrentStep(prev => Math.min(prev + 1, totalSteps));
  };
  
  // Voltar para o passo anterior
  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };
  
  // Submeter o formulário
  const onSubmit = async (data: OnboardingData) => {
    console.log("Dados de onboarding:", data);
    
    try {
      // Salvar o tipo de perfil no servidor
      const response = await fetch('/api/users/set-role', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          role: data.profileType
        }),
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Falha ao salvar o tipo de perfil');
      }
      
      // Salvar preferências do usuário
      const preferencesResponse = await fetch('/api/user/preferences', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          profileType: data.profileType,
          preferences: data.travelPreferences,
          purpose: data.platformPurpose
        }),
        credentials: 'include'
      });
      
      if (!preferencesResponse.ok) {
        console.warn('Preferências salvas parcialmente');
      }
      
      // Exibir mensagem de sucesso
      toast({
        title: "Perfil configurado com sucesso!",
        description: "Suas preferências foram salvas. Bem-vindo à plataforma!",
      });
      
      // Redirecionar para o dashboard com um pequeno delay
      setTimeout(() => {
        navigate("/dashboard");
      }, 1500);
    } catch (error) {
      console.error("Erro ao salvar onboarding:", error);
      toast({
        title: "Erro ao configurar perfil",
        description: "Ocorreu um problema ao salvar suas preferências. Tente novamente.",
        variant: "destructive"
      });
    }
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-white to-[#88C2BF]/10 p-4">
      <Card className="w-full max-w-3xl shadow-lg border-[#19B4B0]/20">
        <CardHeader className="border-b border-[#19B4B0]/10 bg-gradient-to-r from-white to-[#88C2BF]/5">
          <CardTitle className="text-2xl bg-clip-text text-transparent bg-gradient-to-r from-[#19B4B0] to-[#82C889]">
            Configure sua Experiência de Viagem
          </CardTitle>
          <CardDescription>
            {currentStep === 1 && "Vamos começar sua jornada conosco! Apenas 4 passos rápidos."}
            {currentStep === 2 && "Qual melhor descreve você como viajante?"}
            {currentStep === 3 && "Quais experiências de viagem você mais valoriza?"}
            {currentStep === 4 && "Como você pretende usar nossa plataforma?"}
          </CardDescription>
          <Progress value={(currentStep / totalSteps) * 100} className="mt-4 h-2 bg-[#88C2BF]/20" />
        </CardHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="pt-6 pb-2">
              {/* Etapa 1: Boas-vindas */}
              {currentStep === 1 && (
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
              {currentStep === 2 && (
                <div className="space-y-6">
                  <FormField
                    control={form.control}
                    name="profileType"
                    render={({ field }) => (
                      <FormItem className="space-y-4">
                        <div className="space-y-4">
                          {/* Opção: Turista */}
                          <div 
                            className={`border rounded-lg p-5 cursor-pointer transition-all ${
                              field.value === 'tourist' 
                                ? 'border-[#19B4B0] bg-[#19B4B0]/5 shadow-md' 
                                : 'border-[#88C2BF]/30 hover:border-[#88C2BF] hover:bg-[#88C2BF]/5'
                            }`}
                            onClick={() => form.setValue('profileType', 'tourist')}
                          >
                            <div className="flex items-start">
                              <div className={`p-2 rounded-full mr-4 ${
                                field.value === 'tourist' 
                                  ? 'bg-[#19B4B0] text-white' 
                                  : 'bg-[#88C2BF]/20 text-[#434342]'
                              }`}>
                                <MapPin className="h-5 w-5" />
                              </div>
                              <div>
                                <h3 className={`font-medium text-lg ${field.value === 'tourist' ? 'text-[#19B4B0]' : 'text-[#434342]'}`}>
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
                              field.value === 'nomad' 
                                ? 'border-[#19B4B0] bg-[#19B4B0]/5 shadow-md' 
                                : 'border-[#88C2BF]/30 hover:border-[#88C2BF] hover:bg-[#88C2BF]/5'
                            }`}
                            onClick={() => form.setValue('profileType', 'nomad')}
                          >
                            <div className="flex items-start">
                              <div className={`p-2 rounded-full mr-4 ${
                                field.value === 'nomad' 
                                  ? 'bg-[#19B4B0] text-white' 
                                  : 'bg-[#88C2BF]/20 text-[#434342]'
                              }`}>
                                <Coffee className="h-5 w-5" />
                              </div>
                              <div>
                                <h3 className={`font-medium text-lg ${field.value === 'nomad' ? 'text-[#19B4B0]' : 'text-[#434342]'}`}>
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
                              field.value === 'business' 
                                ? 'border-[#19B4B0] bg-[#19B4B0]/5 shadow-md' 
                                : 'border-[#88C2BF]/30 hover:border-[#88C2BF] hover:bg-[#88C2BF]/5'
                            }`}
                            onClick={() => form.setValue('profileType', 'business')}
                          >
                            <div className="flex items-start">
                              <div className={`p-2 rounded-full mr-4 ${
                                field.value === 'business' 
                                  ? 'bg-[#19B4B0] text-white' 
                                  : 'bg-[#88C2BF]/20 text-[#434342]'
                              }`}>
                                <Briefcase className="h-5 w-5" />
                              </div>
                              <div>
                                <h3 className={`font-medium text-lg ${field.value === 'business' ? 'text-[#19B4B0]' : 'text-[#434342]'}`}>
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
                              field.value === 'other' 
                                ? 'border-[#19B4B0] bg-[#19B4B0]/5 shadow-md' 
                                : 'border-[#88C2BF]/30 hover:border-[#88C2BF] hover:bg-[#88C2BF]/5'
                            }`}
                            onClick={() => form.setValue('profileType', 'other')}
                          >
                            <div className="flex items-start">
                              <div className={`p-2 rounded-full mr-4 ${
                                field.value === 'other' 
                                  ? 'bg-[#19B4B0] text-white' 
                                  : 'bg-[#88C2BF]/20 text-[#434342]'
                              }`}>
                                <Globe className="h-5 w-5" />
                              </div>
                              <div>
                                <h3 className={`font-medium text-lg ${field.value === 'other' ? 'text-[#19B4B0]' : 'text-[#434342]'}`}>
                                  Outro
                                </h3>
                                <p className="text-sm text-[#434342]/70 mt-1">
                                  Tenho um perfil de viajante diferente dos listados acima.
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                        <FormMessage className="text-red-500" />
                      </FormItem>
                    )}
                  />
                </div>
              )}
              
              {/* Etapa 3: Preferências de Viagem */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  <FormField
                    control={form.control}
                    name="travelPreferences"
                    render={() => (
                      <FormItem>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {travelPreferences.map((preference) => (
                            <FormField
                              key={preference.id}
                              control={form.control}
                              name="travelPreferences"
                              render={({ field }) => {
                                const isSelected = field.value?.includes(preference.id);
                                
                                return (
                                  <div
                                    key={preference.id}
                                    className={`flex items-center space-x-3 space-y-0 rounded-lg border p-4 cursor-pointer ${
                                      isSelected
                                        ? 'border-[#19B4B0] bg-[#19B4B0]/5 shadow-sm'
                                        : 'border-[#88C2BF]/30 hover:border-[#88C2BF] hover:bg-[#88C2BF]/5'
                                    }`}
                                    onClick={() => {
                                      if (isSelected) {
                                        const filtered = field.value.filter(
                                          (value) => value !== preference.id
                                        );
                                        field.onChange(filtered);
                                      } else {
                                        field.onChange([...field.value, preference.id]);
                                      }
                                    }}
                                  >
                                    <FormControl>
                                      <Checkbox
                                        checked={isSelected}
                                        className={isSelected ? 'border-[#19B4B0]' : ''}
                                      />
                                    </FormControl>
                                    <FormLabel className={`font-medium cursor-pointer ${isSelected ? 'text-[#19B4B0]' : ''}`}>
                                      {preference.label}
                                    </FormLabel>
                                  </div>
                                );
                              }}
                            />
                          ))}
                        </div>
                        <FormMessage className="text-red-500 mt-4" />
                      </FormItem>
                    )}
                  />
                </div>
              )}
              
              {/* Etapa 4: Propósito da Plataforma */}
              {currentStep === 4 && (
                <div className="space-y-6">
                  <p className="text-sm text-[#434342]/70 mb-4">
                    Escolha até 2 propósitos principais para usar nossa plataforma:
                  </p>
                  
                  <FormField
                    control={form.control}
                    name="platformPurpose"
                    render={({ field }) => (
                      <FormItem>
                        <div className="space-y-3">
                          {platformPurposes.map((purpose) => {
                            const isSelected = field.value?.includes(purpose.id);
                            const maxSelected = field.value.length >= 2 && !isSelected;
                            
                            return (
                              <div
                                key={purpose.id}
                                className={`flex items-center space-x-3 space-y-0 rounded-lg border p-4 ${
                                  isSelected
                                    ? 'border-[#19B4B0] bg-[#19B4B0]/5 shadow-sm'
                                    : maxSelected
                                      ? 'border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed'
                                      : 'border-[#88C2BF]/30 hover:border-[#88C2BF] hover:bg-[#88C2BF]/5 cursor-pointer'
                                }`}
                                onClick={() => {
                                  if (maxSelected) return;
                                  
                                  if (isSelected) {
                                    field.onChange(
                                      field.value?.filter(value => value !== purpose.id)
                                    );
                                  } else {
                                    field.onChange([...field.value, purpose.id]);
                                  }
                                }}
                              >
                                <FormControl>
                                  <Checkbox
                                    checked={isSelected}
                                    disabled={maxSelected}
                                  />
                                </FormControl>
                                <FormLabel className={`font-medium cursor-pointer ${isSelected ? 'text-[#19B4B0]' : (maxSelected ? 'text-gray-400' : '')}`}>
                                  {purpose.label}
                                </FormLabel>
                              </div>
                            );
                          })}
                        </div>
                        <FormMessage className="text-red-500 mt-4" />
                      </FormItem>
                    )}
                  />
                </div>
              )}
            </CardContent>
            
            <CardFooter className="flex justify-between border-t border-[#19B4B0]/10 p-6">
              <Button
                type="button"
                variant="outline"
                onClick={prevStep}
                disabled={currentStep === 1}
                className="border-[#88C2BF] text-[#434342] hover:bg-[#88C2BF]/10 hover:text-[#434342]"
              >
                {currentStep === 1 ? 'Pular' : 'Voltar'}
              </Button>
              
              {currentStep < totalSteps ? (
                <Button 
                  type="button" 
                  onClick={nextStep}
                  className="bg-gradient-to-r from-[#19B4B0] to-[#82C889] hover:from-[#19B4B0]/90 hover:to-[#82C889]/90 text-white border-none"
                >
                  Próximo
                </Button>
              ) : (
                <Button 
                  type="submit"
                  className="bg-gradient-to-r from-[#19B4B0] to-[#82C889] hover:from-[#19B4B0]/90 hover:to-[#82C889]/90 text-white border-none"
                >
                  Concluir
                </Button>
              )}
            </CardFooter>
          </form>
        </Form>
      </Card>
    </div>
  );
}