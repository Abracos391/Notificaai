import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import NewNotification from "./pages/NewNotification";
import DashboardLayout from "./components/DashboardLayout";

function Router() {
  return (
    <Switch>
      {/* Landing Page Pública */}
      <Route path="/" component={Home} />
      
      {/* Rotas Protegidas com Dashboard Layout */}
      <Route path="/dashboard">
        <DashboardLayout>
          <Dashboard />
        </DashboardLayout>
      </Route>
      
      <Route path="/notifications">
        <DashboardLayout>
          <div>Notificações (em desenvolvimento)</div>
        </DashboardLayout>
      </Route>
      
      <Route path="/notifications/new">
        <DashboardLayout>
          <NewNotification />
        </DashboardLayout>
      </Route>
      
      <Route path="/notifications/:id">
        <DashboardLayout>
          <div>Detalhes da Notificação (em desenvolvimento)</div>
        </DashboardLayout>
      </Route>
      
      <Route path="/documents">
        <DashboardLayout>
          <div>Biblioteca de Documentos (em desenvolvimento)</div>
        </DashboardLayout>
      </Route>
      
      <Route path="/templates">
        <DashboardLayout>
          <div>Templates (em desenvolvimento)</div>
        </DashboardLayout>
      </Route>
      
      <Route path="/reports">
        <DashboardLayout>
          <div>Relatórios (em desenvolvimento)</div>
        </DashboardLayout>
      </Route>
      
      <Route path="/profile">
        <DashboardLayout>
          <div>Perfil (em desenvolvimento)</div>
        </DashboardLayout>
      </Route>
      
      <Route path="/settings">
        <DashboardLayout>
          <div>Configurações (em desenvolvimento)</div>
        </DashboardLayout>
      </Route>
      
      {/* 404 */}
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
