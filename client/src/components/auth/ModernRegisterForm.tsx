import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/hooks/useAuth";
import { useTranslation } from "react-i18next";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { 
  Loader2, 
  Mail, 
  Lock, 
  User
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

// Schema de validação será definido com base nos textos traduzidos
function createRegisterSchema(t: any) {
  return z.object({
    firstName: z.string().min(1, { message: t('validation.required', 'Este campo é obrigatório') }),
    lastName: z.string().min(1, { message: t('validation.required', 'Este campo é obrigatório') }),
    email: z.string().email({ message: t('validation.email', 'Por favor, insira um endereço de e-mail válido') }),
    password: z.string().min(6, { message: t('validation.minLength', 'Deve ter pelo menos {{count}} caracteres', { count: 6 }) }),
    confirmPassword: z.string().min(6, { message: t('validation.required', 'Este campo é obrigatório') }),
  }).refine((data) => data.password === data.confirmPassword, {
    message: t('validation.passwordMatch', 'As senhas não coincidem'),
    path: ["confirmPassword"],
  });
}

export function ModernRegisterForm({ onSuccess }: { onSuccess?: () => void }) {
  const { register: registerUser } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [, navigate] = useLocation();
  const { t } = useTranslation();

  // Criar schema de validação com os textos traduzidos
  const registerSchema = createRegisterSchema(t);
  type RegisterFormValues = z.infer<typeof registerSchema>;

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (values: RegisterFormValues) => {
    setIsSubmitting(true);
    try {
      const { confirmPassword, ...registrationData } = values;
      
      // Registrar o usuário sem o tipo de perfil
      await registerUser.mutateAsync(registrationData);
      
      // Mensagem de sucesso já será mostrada pelo hook useAuth
      
      // Redirecionar para página de onboarding
      navigate('/onboarding');
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error: any) {
      toast({
        title: t('auth.registerFailed', 'Falha no registro'),
        description: error?.message || t('auth.checkInfo', 'Verifique suas informações e tente novamente.'),
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full animate-fadeIn">
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="firstName" className="text-sm font-medium text-[#434342]">
              {t('forms.firstName', 'Nome')}
            </Label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <User className="h-5 w-5 text-[#88C2BF]" />
              </div>
              <Input
                id="firstName"
                placeholder={t('forms.firstName', 'Nome')}
                className="pl-10 bg-white border border-gray-200 focus:border-[#19B4B0] focus:ring-[#19B4B0]/20 py-5"
                {...form.register("firstName")}
                disabled={isSubmitting}
              />
            </div>
            {form.formState.errors.firstName && (
              <p className="text-sm text-red-500 mt-1">{form.formState.errors.firstName.message}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="lastName" className="text-sm font-medium text-[#434342]">
              {t('forms.lastName', 'Sobrenome')}
            </Label>
            <Input
              id="lastName"
              placeholder={t('forms.lastName', 'Sobrenome')}
              className="bg-white border border-gray-200 focus:border-[#19B4B0] focus:ring-[#19B4B0]/20 py-5"
              {...form.register("lastName")}
              disabled={isSubmitting}
            />
            {form.formState.errors.lastName && (
              <p className="text-sm text-red-500 mt-1">{form.formState.errors.lastName.message}</p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm font-medium text-[#434342]">
            {t('forms.email', 'Email')}
          </Label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Mail className="h-5 w-5 text-[#88C2BF]" />
            </div>
            <Input
              id="email"
              type="email"
              placeholder="your.email@example.com"
              className="pl-10 bg-white border border-gray-200 focus:border-[#19B4B0] focus:ring-[#19B4B0]/20 py-5"
              {...form.register("email")}
              disabled={isSubmitting}
            />
          </div>
          {form.formState.errors.email && (
            <p className="text-sm text-red-500 mt-1">{form.formState.errors.email.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="password" className="text-sm font-medium text-[#434342]">
            {t('forms.password', 'Senha')}
          </Label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Lock className="h-5 w-5 text-[#88C2BF]" />
            </div>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              className="pl-10 bg-white border border-gray-200 focus:border-[#19B4B0] focus:ring-[#19B4B0]/20 py-5"
              {...form.register("password")}
              disabled={isSubmitting}
            />
          </div>
          {form.formState.errors.password && (
            <p className="text-sm text-red-500 mt-1">{form.formState.errors.password.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword" className="text-sm font-medium text-[#434342]">
            {t('forms.confirmPassword', 'Confirme a Senha')}
          </Label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Lock className="h-5 w-5 text-[#88C2BF]" />
            </div>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="••••••••"
              className="pl-10 bg-white border border-gray-200 focus:border-[#19B4B0] focus:ring-[#19B4B0]/20 py-5"
              {...form.register("confirmPassword")}
              disabled={isSubmitting}
            />
          </div>
          {form.formState.errors.confirmPassword && (
            <p className="text-sm text-red-500 mt-1">{form.formState.errors.confirmPassword.message}</p>
          )}
        </div>
        
        <div className="bg-blue-50 rounded-lg p-4 text-sm text-blue-800 mt-2">
          <p>{t('forms.registerNotice', 'Após o cadastro, você poderá escolher seu tipo de perfil (turista, nômade ou empresarial).')}</p>
        </div>

        <Button
          type="submit"
          className="w-full bg-[#82C889] hover:bg-[#6AB371] text-white py-5 rounded-lg text-base font-medium transition-all duration-200 shadow-[0_4px_10px_rgba(130,200,137,0.3)] hover:shadow-[0_6px_14px_rgba(130,200,137,0.4)] mt-4 auth-button-hover animate-fadeIn"
          style={{animationDelay: "0.4s"}}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" /> {t('forms.creatingAccount', 'Criando conta...')}
            </>
          ) : (
            t('forms.createAccount', 'Criar Conta')
          )}
        </Button>
      </form>
    </div>
  );
}