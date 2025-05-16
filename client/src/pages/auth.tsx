import { useState } from "react";
import { useLocation } from "wouter";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LoginForm } from "@/components/auth/LoginForm";
import { RegisterForm } from "@/components/auth/RegisterForm";
import { useAuth } from "@/hooks/useAuth";

export default function AuthPage() {
  const [activeTab, setActiveTab] = useState("login");
  const [_, navigate] = useLocation();
  const { isAuthenticated } = useAuth();
  
  // If already authenticated, redirect to dashboard
  if (isAuthenticated) {
    navigate("/dashboard");
    return null;
  }
  
  const handleSuccess = () => {
    navigate("/dashboard");
  };
  
  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden bg-gradient-to-br from-blue-50 to-indigo-50">
      {/* Background travel images slideshow */}
      <div className="absolute inset-0 z-0 opacity-10">
        <img 
          src="https://images.unsplash.com/photo-1530521954074-e64f6810b32d?ixlib=rb-4.0.3&q=80&w=2070&auto=format&fit=crop" 
          alt="Travel backdrop" 
          className="absolute inset-0 w-full h-full object-cover"
        />
      </div>

      {/* Logo & Navigation */}
      <header className="relative z-10 w-full py-6">
        <div className="container mx-auto px-4 flex justify-center md:justify-between items-center">
          <div className="flex items-center">
            <svg className="h-10 w-10 text-primary-600" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12,1C7.6,1,4,4.6,4,9c0,4.1,3.8,9.7,7.1,13.4c0.6,0.6,1.5,0.6,2.1,0C16.2,18.7,20,13.1,20,9C20,4.6,16.4,1,12,1z M12,13c-2.2,0-4-1.8-4-4s1.8-4,4-4s4,1.8,4,4S14.2,13,12,13z"></path>
            </svg>
            <span className="ml-2 text-2xl font-bold text-gray-900">Voyagewise</span>
          </div>
          <div className="hidden md:flex items-center space-x-4">
            <a href="/" className="text-gray-600 hover:text-gray-900">Home</a>
            <a href="#features" className="text-gray-600 hover:text-gray-900">Features</a>
            <a href="#about" className="text-gray-600 hover:text-gray-900">About</a>
          </div>
        </div>
      </header>

      {/* Main content */}
      <div className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-md w-full bg-white shadow-xl rounded-xl overflow-hidden">
          <div className="px-8 pt-8 pb-6 text-center">
            <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Welcome Back</h1>
            <p className="text-gray-600 text-lg">
              Sign in to continue your journey planning
            </p>
          </div>

          <div className="px-8 pb-8">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="login" className="text-base py-2">Login</TabsTrigger>
                <TabsTrigger value="register" className="text-base py-2">Register</TabsTrigger>
              </TabsList>
              <TabsContent value="login">
                <LoginForm onSuccess={handleSuccess} />
              </TabsContent>
              <TabsContent value="register">
                <RegisterForm onSuccess={() => setActiveTab("login")} />
              </TabsContent>
            </Tabs>
            
            <div className="mt-6 text-center text-sm text-gray-500">
              <p>By continuing, you agree to our <a href="#" className="text-primary-600 hover:text-primary-500">Terms of Service</a> and <a href="#" className="text-primary-600 hover:text-primary-500">Privacy Policy</a>.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 py-6 bg-transparent">
        <div className="container mx-auto px-4 text-center text-gray-600 text-sm">
          <p>© 2025 Voyagewise. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}