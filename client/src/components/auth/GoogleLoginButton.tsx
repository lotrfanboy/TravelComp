import React from "react";
import { Button } from "@/components/ui/button";
import { SiGoogle } from "react-icons/si";

interface GoogleLoginButtonProps {
  className?: string;
}

export function GoogleLoginButton({ className }: GoogleLoginButtonProps) {
  return (
    <Button
      type="button"
      variant="outline"
      className={`w-full flex items-center justify-center gap-2 bg-white hover:bg-gray-50 text-[#434342] font-medium py-5 border border-gray-300 rounded-lg transition-all duration-200 ${className}`}
      onClick={() => {
        window.location.href = "/api/auth/google";
      }}
    >
      <SiGoogle className="h-5 w-5 text-[#4285F4]" />
      <span>Continue with Google</span>
    </Button>
  );
}