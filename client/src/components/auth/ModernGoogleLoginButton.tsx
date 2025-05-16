import React from "react";
import { Button } from "@/components/ui/button";
import { SiGoogle } from "react-icons/si";
import { toast } from "@/hooks/use-toast";

interface ModernGoogleLoginButtonProps {
  className?: string;
}

export function ModernGoogleLoginButton({ className }: ModernGoogleLoginButtonProps) {
  const handleGoogleLogin = () => {
    try {
      // Redirecionamento para a rota de autenticação Google
      window.location.href = "/api/auth/google";
    } catch (error) {
      toast({
        title: "Google login failed",
        description: "An error occurred while trying to connect with Google.",
        variant: "destructive",
      });
    }
  };

  return (
    <Button
      type="button"
      variant="outline"
      className={`w-full flex items-center justify-center gap-2 bg-white hover:bg-gray-50 text-[#434342] font-medium py-5 border border-gray-300 rounded-lg transition-all duration-200 ${className}`}
      onClick={handleGoogleLogin}
    >
      <SiGoogle className="h-5 w-5 text-[#4285F4]" />
      <span>Continue with Google</span>
    </Button>
  );
}