import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/hooks/useAuth";
import { useTranslation } from "react-i18next";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { GoogleLoginButton } from "./GoogleLoginButton";
import { Loader2, Mail, Lock } from "lucide-react";
import { toast } from "@/hooks/use-toast";

// O schema de validação será definido com base nos textos traduzidos
function createLoginSchema(t: any) {
  return z.object({
    email: z.string().email({ message: t('validation.email', 'Por favor, insira um endereço de e-mail válido') }),
    password: z.string().min(6, { message: t('validation.minLength', 'Deve ter pelo menos {{count}} caracteres', { count: 6 }) }),
  });
}

export function ModernLoginForm({ onSuccess }: { onSuccess?: () => void }) {
  const { login } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { t } = useTranslation();
  
  // Criar schema de validação usando os textos traduzidos
  const loginSchema = createLoginSchema(t);
  type LoginFormValues = z.infer<typeof loginSchema>;

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values: LoginFormValues) => {
    setIsSubmitting(true);
    try {
      await login.mutateAsync(values);
      
      // Após login bem-sucedido, redirecionar para o router de dashboard
      // que vai encaminhar para o dashboard específico do perfil do usuário
      window.location.href = "/dashboard-router";
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error: any) {
      toast({
        title: t('auth.loginFailed', 'Falha no login'),
        description: error?.message || t('auth.checkCredentials', 'Verifique suas credenciais e tente novamente'),
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full animate-fadeIn">
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        <div className="space-y-2">
          <div className="relative animate-fadeIn" style={{animationDelay: "0.1s"}}>
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
                className="pl-10 bg-white border border-gray-200 focus:border-[#19B4B0] focus:ring-[#19B4B0]/20 py-5 auth-input-transition"
                {...form.register("email")}
                disabled={isSubmitting}
              />
            </div>
            {form.formState.errors.email && (
              <p className="text-sm text-red-500 mt-1">{form.formState.errors.email.message}</p>
            )}
          </div>

          <div className="relative animate-fadeIn" style={{animationDelay: "0.2s"}}>
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
                className="pl-10 bg-white border border-gray-200 focus:border-[#19B4B0] focus:ring-[#19B4B0]/20 py-5 auth-input-transition"
                {...form.register("password")}
                disabled={isSubmitting}
              />
            </div>
            {form.formState.errors.password && (
              <p className="text-sm text-red-500 mt-1">{form.formState.errors.password.message}</p>
            )}
          </div>
        </div>

        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <input
              id="remember-me"
              name="remember-me"
              type="checkbox"
              className="h-4 w-4 text-[#19B4B0] focus:ring-[#19B4B0]/50 border-gray-300 rounded"
            />
            <label htmlFor="remember-me" className="ml-2 block text-sm text-[#434342]">
              {t('forms.rememberMe', 'Lembrar-me')}
            </label>
          </div>

          <a
            href="#"
            className="text-sm text-[#19B4B0] hover:text-[#0a8f8c] transition duration-150"
          >
            {t('forms.forgotPassword', 'Esqueceu a senha?')}
          </a>
        </div>

        <Button
          type="submit"
          className="w-full bg-[#19B4B0] hover:bg-[#0a8f8c] text-white py-5 rounded-lg text-base font-medium transition-all duration-200 shadow-[0_4px_10px_rgba(25,180,176,0.3)] hover:shadow-[0_6px_14px_rgba(25,180,176,0.4)] auth-button-hover animate-fadeIn"
          style={{animationDelay: "0.3s"}}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" /> {t('forms.signingIn', 'Entrando...')}
            </>
          ) : (
            t('forms.signIn', 'Entrar')
          )}
        </Button>

        <div className="flex items-center gap-2 w-full mt-6">
          <Separator className="flex-1 bg-gray-200" />
          <span className="text-xs text-[#434342]/60 font-medium">{t('forms.orContinueWith', 'OU CONTINUE COM')}</span>
          <Separator className="flex-1 bg-gray-200" />
        </div>

        <GoogleLoginButton className="mt-2" />
      </form>
    </div>
  );
}