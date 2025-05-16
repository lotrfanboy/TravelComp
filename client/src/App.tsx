import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

import NotFound from "@/pages/not-found";
import MainLayout from "@/components/layouts/MainLayout";
import HomePage from "@/pages/index";
import Dashboard from "@/pages/dashboard";
import Trips from "@/pages/trips";
import TripCreator from "@/pages/trip-creator";
import TripDetail from "@/pages/TripDetail";
import Workspaces from "@/pages/workspaces";
import Community from "@/pages/community";
import Budget from "@/pages/budget";
import Settings from "@/pages/settings";
import Explore from "@/pages/explore";
import OnboardingSimple from "@/pages/OnboardingSimple";
import ModernAuthPage from "@/pages/ModernAuthPage";
import BookingPage from "@/pages/booking";
import DashboardRouter from "@/pages/DashboardRouter";
import LoginSimulator from "@/pages/LoginSimulator";
import PlannerPage from "@/pages/planner";
import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "wouter";

// AuthProtectedRoute para verificar se o usuário está logado
const AuthProtectedRoute = ({ component: Component, ...rest }: any) => {
  const { user, isLoading } = useAuth();
  const [, navigate] = useLocation();

  useEffect(() => {
    if (!isLoading && !user) {
      navigate("/auth");
    }
  }, [user, isLoading, navigate]);

  return (
    <MainLayout {...rest}>
      {!isLoading && user ? <Component /> : null}
    </MainLayout>
  );
};

function Router() {
  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/auth" component={ModernAuthPage} />
      <Route path="/dashboard-router" component={DashboardRouter} />
      <Route path="/login-simulator" component={LoginSimulator} />
      <Route path="/dashboard" component={() => (
        <AuthProtectedRoute component={Dashboard} pageTitle="Dashboard do Turista" userRole="tourist" />
      )} />
      <Route path="/nomad-dashboard" component={() => (
        <AuthProtectedRoute component={Dashboard} pageTitle="Dashboard do Nômade Digital" userRole="nomad" />
      )} />
      <Route path="/business-dashboard" component={() => (
        <AuthProtectedRoute component={Dashboard} pageTitle="Dashboard Empresarial" userRole="business" />
      )} />
      <Route path="/trips" component={() => (
        <AuthProtectedRoute component={Trips} pageTitle="Minhas Viagens" />
      )} />
      <Route path="/trips/new" component={() => (
        <AuthProtectedRoute component={TripCreator} pageTitle="Nova Viagem" />
      )} />
      <Route path="/trips/:id" component={() => (
        <AuthProtectedRoute component={TripDetail} pageTitle="Detalhes da Viagem" />
      )} />
      <Route path="/trips/:id/edit" component={() => (
        <AuthProtectedRoute component={TripCreator} pageTitle="Editar Viagem" />
      )} />
      <Route path="/trip-creator" component={() => (
        <AuthProtectedRoute component={TripCreator} pageTitle="Planejar Viagem" />
      )} />
      <Route path="/workspaces" component={() => (
        <AuthProtectedRoute component={Workspaces} pageTitle="Workspaces" />
      )} />
      <Route path="/community" component={() => (
        <AuthProtectedRoute component={Community} pageTitle="Comunidade" />
      )} />
      <Route path="/budget" component={() => (
        <AuthProtectedRoute component={Budget} pageTitle="Orçamento" />
      )} />
      <Route path="/settings" component={() => (
        <AuthProtectedRoute component={Settings} pageTitle="Configurações" />
      )} />
      <Route path="/explore" component={() => (
        <AuthProtectedRoute component={Explore} pageTitle="Explorar" />
      )} />
      <Route path="/booking" component={() => (
        <AuthProtectedRoute component={BookingPage} pageTitle="Reservas" />
      )} />
      <Route path="/planner" component={() => (
        <AuthProtectedRoute component={PlannerPage} pageTitle="Planejador de Viagem" />
      )} />
      <Route path="/onboarding" component={OnboardingSimple} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
