import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/lib/auth";
import LoginPage from "@/pages/login";
import SenderPage from "@/pages/sender";
import ReceiverPage from "@/pages/receiver";
import AdminPage from "@/pages/admin";
import NotFound from "@/pages/not-found";
import { Button } from "@/components/ui/button";
import { Package, LogOut, Loader2 } from "lucide-react";

function AppLayout() {
  const { user, isLoading, logout } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  const rolePage = () => {
    switch (user.role) {
      case "sender": return <SenderPage />;
      case "receiver": return <ReceiverPage />;
      case "admin": return <AdminPage />;
      default: return <SenderPage />;
    }
  };

  const roleLabel = user.role.charAt(0).toUpperCase() + user.role.slice(1);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-3 px-4 py-2.5">
          <div className="flex items-center gap-2.5">
            <div className="flex items-center justify-center w-8 h-8 rounded-md bg-primary text-primary-foreground">
              <Package className="w-4 h-4" />
            </div>
            <div>
              <span className="font-semibold text-sm" data-testid="text-app-name">Wholesale Manager</span>
              <span className="text-xs text-muted-foreground ml-2" data-testid="text-user-role">{roleLabel}</span>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={() => logout()} data-testid="button-logout">
            <LogOut className="w-4 h-4 mr-1.5" />
            Logout
          </Button>
        </div>
      </header>
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-6">
        {rolePage()}
      </main>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <AppLayout />
        </AuthProvider>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
