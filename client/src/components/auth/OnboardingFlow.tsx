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
import { apiRequest } from "@/lib/queryClient";
import { MapPin, Briefcase, Globe, Coffee, Sun, Mountain, Building, Utensils, Music, ShoppingBag, ThumbsUp, Heart } from "lucide-react";

// Schema para validação do formulário de onboarding
const onboardingSchema = z.object({
  // Etapa 1: Criação de Conta - já feita na página de registro

  // Etapa 2: Tipo de Perfil
  profile_type: z.enum(['tourist', 'nomad', 'business', 'other'], {
    required_error: "Por favor, selecione um tipo de perfil de viajante",
  }),
  profile_description: z.string().optional(),

  // Etapa 3: Preferências de Viagem
  preferences: z.array(z.string()).min(1, {
    message: "Por favor, selecione pelo menos uma preferência",
  }),

  // Etapa 4: Propósito da Plataforma
  user_intent: z.array(z.string()).min(1, {
    message: "Por favor, selecione pelo menos um propósito",
  }).max(2, {
    message: "Selecione no máximo 2 propósitos",
  }),

  // Etapa 4 (opcional): Histórico de Viagens
  recent_travel: z.boolean().default(false),
  past_destinations: z.array(z.string()).default([]),
});

type OnboardingValues = z.infer<typeof onboardingSchema>;

export default function OnboardingFlow() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const totalSteps = 4; // 4 etapas no total

  // Definição das preferências de viagem disponíveis
  const travelPreferences = [
    { id: "beaches", label: "Praias e Relaxamento", icon: <Sun className="h-5 w-5" /> },
    { id: "urban", label: "Aventuras Urbanas", icon: <Building className="h-5 w-5" /> },
    { id: "nature", label: "Natureza e Trilhas", icon: <Mountain className="h-5 w-5" /> },
    { id: "culture", label: "Cultura e História", icon: <Globe className="h-5 w-5" /> },
    { id: "food", label: "Experiências Gastronômicas", icon: <Utensils className="h-5 w-5" /> },
    { id: "nightlife", label: "Vida Noturna", icon: <Music className="h-5 w-5" /> },
    { id: "shopping", label: "Compras", icon: <ShoppingBag className="h-5 w-5" /> },
    { id: "wellness", label: "Bem-estar e Retiros", icon: <Heart className="h-5 w-5" /> },
  ];

  // Definição dos propósitos da plataforma
  const platformPurposes = [
    { id: "manual_planning", label: "Planejar uma viagem futura manualmente" },
    { id: "ai_itinerary", label: "Deixar a IA construir um itinerário para mim" },
    { id: "team_organization", label: "Organizar viagens para uma equipe ou empresa" },
    { id: "budget_tracking", label: "Controlar melhor meu orçamento de viagem" },
    { id: "discovery", label: "Descobrir novos lugares" },
    { id: "long_term", label: "Planejar viagens de longo prazo (estilo nômade)" },
  ];

  // Inicialização do formulário com valores padrão
  const form = useForm<OnboardingValues>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      profile_type: 'tourist',
      profile_description: '',
      preferences: [],
      user_intent: [],
      recent_travel: false,
      past_destinations: [],
    }
  });

  // Observa os valores selecionados para adaptação condicional da interface
  const selectedProfileType = form.watch('profile_type');
  const recentTravel = form.watch('recent_travel');

  // Submissão do formulário
  const onSubmit = async (values: OnboardingValues) => {
    try {
      console.log('Dados de onboarding:', values);
      
      // Envio dos dados para a API (comentado para desenvolvimento)
      // Vamos temporariamente apenas mostrar um toast e redirecionar
      // await apiRequest('POST', '/api/user/profile', values);
      
      toast({
        title: "Perfil configurado com sucesso!",
        description: "Seu perfil de viajante foi salvo e suas preferências foram registradas.",
      });
      
      // Redireciona para o dashboard
      setTimeout(() => {
        navigate('/dashboard');
      }, 1500);
      
    } catch (error) {
      console.error('Erro ao salvar perfil:', error);
      toast({
        title: "Algo deu errado",
        description: "Houve um problema ao salvar seu perfil. Por favor, tente novamente.",
        variant: "destructive",
      });
    }
  };

  // Avança para o próximo passo
  const nextStep = () => {
    // Validações específicas para cada etapa
    if (step === 1) {
      if (!form.getValues('profile_type')) {
        form.setError('profile_type', { message: "Por favor, selecione um tipo de viajante" });
        return;
      }
      
      // Se selecionou "Other", verifica se preencheu a descrição
      if (form.getValues('profile_type') === 'other' && !form.getValues('profile_description')) {
        form.setError('profile_description', { message: "Por favor, descreva seu perfil de viajante" });
        return;
      }
    }
    
    if (step === 2 && form.getValues('preferences').length === 0) {
      form.setError('preferences', { message: "Por favor, selecione pelo menos uma preferência" });
      return;
    }
    
    if (step === 3 && (form.getValues('user_intent').length === 0 || form.getValues('user_intent').length > 2)) {
      form.setError('user_intent', { 
        message: form.getValues('user_intent').length === 0 
          ? "Por favor, selecione pelo menos um propósito" 
          : "Selecione no máximo 2 propósitos" 
      });
      return;
    }
    
    // Avança para a próxima etapa
    setStep(prev => Math.min(prev + 1, totalSteps));
  };

  // Volta para o passo anterior
  const prevStep = () => {
    setStep(prev => Math.max(prev - 1, 1));
  };

  // Renderização do card de tipo de perfil
  const renderProfileTypeCard = (profileId: string, title: string, description: string, icon: JSX.Element) => {
    const isSelected = form.getValues('profile_type') === profileId;
    
    return (
      <div 
        className={`border rounded-lg p-5 cursor-pointer transition-all ${
          isSelected 
            ? 'border-[#19B4B0] bg-[#19B4B0]/5 ring-2 ring-[#19B4B0]' 
            : 'hover:border-[#88C2BF] hover:bg-[#88C2BF]/5'
        }`}
        onClick={() => form.setValue('profile_type', profileId as any)}
      >
        <div className="flex items-start">
          <div className={`p-2 rounded-full mr-4 ${
            isSelected 
              ? 'bg-[#19B4B0] text-white' 
              : 'bg-[#88C2BF]/20 text-[#434342]'
          }`}>
            {icon}
          </div>
          <div>
            <h3 className={`font-medium text-lg ${isSelected ? 'text-[#19B4B0]' : 'text-[#434342]'}`}>
              {title}
            </h3>
            <p className="text-sm text-[#434342]/70 mt-1">{description}</p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-white to-[#88C2BF]/10 p-4">
      <Card className="w-full max-w-3xl shadow-lg border-[#19B4B0]/20">
        <CardHeader className="border-b border-[#19B4B0]/10 bg-gradient-to-r from-white to-[#88C2BF]/5">
          <CardTitle className="text-2xl bg-clip-text text-transparent bg-gradient-to-r from-[#19B4B0] to-[#82C889]">
            Configure sua Experiência de Viagem
          </CardTitle>
          <CardDescription>
            {step === 1 && "Vamos definir seu perfil de viajante para personalizar sua experiência."}
            {step === 2 && "Quais tipos de experiências você mais gosta durante suas viagens?"}
            {step === 3 && "O que te trouxe à nossa plataforma? Como podemos ajudar?"}
            {step === 4 && "Última etapa: conte-nos sobre suas viagens recentes."}
          </CardDescription>
          <Progress 
            value={(step / totalSteps) * 100} 
            className="mt-4 h-2 bg-[#88C2BF]/20"
          />
        </CardHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="space-y-6 pt-6">
              {/* Etapa 1: Tipo de Perfil */}
              {step === 1 && (
                <>
                  <h2 className="text-xl font-semibold text-[#434342]">
                    Qual melhor descreve você como viajante?
                  </h2>
                  
                  <FormField
                    control={form.control}
                    name="profile_type"
                    render={({ field }) => (
                      <FormItem className="space-y-4">
                        <div className="space-y-4">
                          {renderProfileTypeCard(
                            'tourist', 
                            'Turista',
                            'Viajo para lazer, férias ou exploração.',
                            <MapPin className="h-5 w-5" />
                          )}
                          
                          {renderProfileTypeCard(
                            'nomad', 
                            'Nômade Digital',
                            'Viajo enquanto trabalho remotamente, e preciso de flexibilidade e ferramentas de planejamento.',
                            <Coffee className="h-5 w-5" />
                          )}
                          
                          {renderProfileTypeCard(
                            'business', 
                            'Viajante de Negócios',
                            'Viajo por razões profissionais, reuniões e logística da empresa.',
                            <Briefcase className="h-5 w-5" />
                          )}
                          
                          {renderProfileTypeCard(
                            'other', 
                            'Outro',
                            'Tenho um perfil de viajante diferente dos listados acima.',
                            <ThumbsUp className="h-5 w-5" />
                          )}
                        </div>
                        <FormMessage className="text-red-500" />
                      </FormItem>
                    )}
                  />
                  
                  {selectedProfileType === 'other' && (
                    <FormField
                      control={form.control}
                      name="profile_description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Descreva seu tipo de viajante:</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Conte-nos como você viaja" 
                              {...field} 
                              className="border-[#88C2BF]/30 focus:border-[#19B4B0]"
                            />
                          </FormControl>
                          <FormMessage className="text-red-500" />
                        </FormItem>
                      )}
                    />
                  )}
                </>
              )}
              
              {/* Etapa 2: Preferências de Viagem */}
              {step === 2 && (
                <>
                  <h2 className="text-xl font-semibold text-[#434342]">
                    Que tipo de experiências você mais gosta?
                  </h2>
                  <p className="text-sm text-[#434342]/70 mb-6">
                    Selecione todas as opções que se aplicam para obter recomendações personalizadas.
                  </p>
                  
                  <FormField
                    control={form.control}
                    name="preferences"
                    render={() => (
                      <FormItem>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {travelPreferences.map((preference) => (
                            <FormField
                              key={preference.id}
                              control={form.control}
                              name="preferences"
                              render={({ field }) => {
                                return (
                                  <FormItem
                                    key={preference.id}
                                    className={`flex items-center space-x-3 space-y-0 rounded-lg border p-4 ${
                                      field.value?.includes(preference.id)
                                        ? 'border-[#19B4B0] bg-[#19B4B0]/5 shadow-sm'
                                        : 'border-[#88C2BF]/30 hover:border-[#88C2BF] hover:bg-[#88C2BF]/5'
                                    }`}
                                  >
                                    <FormControl>
                                      <Checkbox
                                        checked={field.value?.includes(preference.id)}
                                        onCheckedChange={(checked) => {
                                          return checked
                                            ? field.onChange([...field.value, preference.id])
                                            : field.onChange(
                                                field.value?.filter(
                                                  (value) => value !== preference.id
                                                )
                                              )
                                        }}
                                        className={field.value?.includes(preference.id) 
                                          ? 'border-[#19B4B0] data-[state=checked]:bg-[#19B4B0] data-[state=checked]:text-white' 
                                          : ''
                                        }
                                      />
                                    </FormControl>
                                    <div className="flex items-center">
                                      <span className={`mr-2 ${field.value?.includes(preference.id) ? 'text-[#19B4B0]' : 'text-[#434342]/60'}`}>
                                        {preference.icon}
                                      </span>
                                      <FormLabel className={`font-medium cursor-pointer ${field.value?.includes(preference.id) ? 'text-[#19B4B0]' : ''}`}>
                                        {preference.label}
                                      </FormLabel>
                                    </div>
                                  </FormItem>
                                )
                              }}
                            />
                          ))}
                        </div>
                        <FormMessage className="text-red-500 mt-4" />
                      </FormItem>
                    )}
                  />
                </>
              )}
              
              {/* Etapa 3: Propósito da Plataforma */}
              {step === 3 && (
                <>
                  <h2 className="text-xl font-semibold text-[#434342]">
                    O que te traz à nossa plataforma?
                  </h2>
                  <p className="text-sm text-[#434342]/70 mb-6">
                    Escolha 1 ou 2 opções que melhor definem o que você busca.
                  </p>
                  
                  <FormField
                    control={form.control}
                    name="user_intent"
                    render={() => (
                      <FormItem>
                        <div className="space-y-3">
                          {platformPurposes.map((purpose) => (
                            <FormField
                              key={purpose.id}
                              control={form.control}
                              name="user_intent"
                              render={({ field }) => {
                                // Verifica se já atingiu o limite de seleções
                                const maxSelected = field.value.length >= 2;
                                const isSelected = field.value?.includes(purpose.id);
                                
                                return (
                                  <FormItem
                                    key={purpose.id}
                                    className={`flex items-center space-x-3 space-y-0 rounded-lg border p-4 ${
                                      isSelected
                                        ? 'border-[#19B4B0] bg-[#19B4B0]/5 shadow-sm'
                                        : maxSelected && !isSelected
                                          ? 'border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed'
                                          : 'border-[#88C2BF]/30 hover:border-[#88C2BF] hover:bg-[#88C2BF]/5 cursor-pointer'
                                    }`}
                                    onClick={() => {
                                      if (maxSelected && !isSelected) return;
                                      
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
                                        disabled={maxSelected && !isSelected}
                                        onCheckedChange={(checked) => {
                                          if (maxSelected && !isSelected) return;
                                          
                                          return checked
                                            ? field.onChange([...field.value, purpose.id])
                                            : field.onChange(
                                                field.value?.filter(value => value !== purpose.id)
                                              )
                                        }}
                                        className={isSelected 
                                          ? 'border-[#19B4B0] data-[state=checked]:bg-[#19B4B0] data-[state=checked]:text-white' 
                                          : ''
                                        }
                                      />
                                    </FormControl>
                                    <FormLabel className={`font-medium cursor-pointer ${isSelected ? 'text-[#19B4B0]' : (maxSelected && !isSelected ? 'text-gray-400' : '')}`}>
                                      {purpose.label}
                                    </FormLabel>
                                  </FormItem>
                                )
                              }}
                            />
                          ))}
                        </div>
                        <FormMessage className="text-red-500 mt-4" />
                      </FormItem>
                    )}
                  />
                </>
              )}
              
              {/* Etapa 4 (opcional): Histórico de Viagem */}
              {step === 4 && (
                <>
                  <h2 className="text-xl font-semibold text-[#434342]">
                    Você viajou recentemente?
                  </h2>
                  <p className="text-sm text-[#434342]/70 mb-6">
                    Esta informação ajuda a melhorar nossas recomendações (opcional).
                  </p>
                  
                  <FormField
                    control={form.control}
                    name="recent_travel"
                    render={({ field }) => (
                      <FormItem className="space-y-3">
                        <FormControl>
                          <div className="flex space-x-4">
                            <div
                              className={`flex-1 border rounded-lg p-4 text-center cursor-pointer ${
                                field.value ? 'border-[#19B4B0] bg-[#19B4B0]/5 shadow-sm' : 'border-[#88C2BF]/30'
                              }`}
                              onClick={() => field.onChange(true)}
                            >
                              <p className={`font-medium ${field.value ? 'text-[#19B4B0]' : ''}`}>Sim</p>
                            </div>
                            <div
                              className={`flex-1 border rounded-lg p-4 text-center cursor-pointer ${
                                field.value === false ? 'border-[#19B4B0] bg-[#19B4B0]/5 shadow-sm' : 'border-[#88C2BF]/30'
                              }`}
                              onClick={() => field.onChange(false)}
                            >
                              <p className={`font-medium ${field.value === false ? 'text-[#19B4B0]' : ''}`}>Não</p>
                            </div>
                          </div>
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  
                  {recentTravel && (
                    <div className="mt-6 animate-fadeIn">
                      <h3 className="font-medium text-[#434342] mb-3">
                        Selecione até 3 destinos recentes:
                      </h3>
                      <div className="border rounded-lg border-[#88C2BF]/30 p-4">
                        <p className="text-sm text-[#434342]/70 mb-3">
                          Digite o nome da cidade e país separados por vírgula (ex: "Paris, França")
                        </p>
                        
                        <div className="space-y-3">
                          {[1, 2, 3].map((index) => (
                            <FormField
                              key={`destination-${index}`}
                              control={form.control}
                              name="past_destinations"
                              render={({ field }) => {
                                // Pega o valor do índice atual
                                const currentValue = field.value?.[index - 1] || '';
                                
                                return (
                                  <FormItem>
                                    <FormControl>
                                      <div className="flex">
                                        <Input
                                          placeholder={`Destino ${index}`}
                                          value={currentValue}
                                          onChange={(e) => {
                                            // Cria uma cópia da array atual
                                            const newDestinations = [...(field.value || [])];
                                            
                                            // Atualiza o valor no índice correto
                                            newDestinations[index - 1] = e.target.value;
                                            
                                            // Remove valores vazios
                                            const cleanDestinations = newDestinations.filter(d => d);
                                            
                                            // Atualiza o campo
                                            field.onChange(cleanDestinations);
                                          }}
                                          className="border-[#88C2BF]/30 focus:border-[#19B4B0]"
                                        />
                                      </div>
                                    </FormControl>
                                  </FormItem>
                                );
                              }}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </>
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
                Voltar
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