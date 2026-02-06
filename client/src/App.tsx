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
import { Badge } from "@/components/ui/badge";
import { Store, LogOut, Loader2 } from "lucide-react";

function AppLayout() {
  const { user, isLoading, logout } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Loader2 className="w-5 h-5 animate-spin text-primary" />
          </div>
          <span className="text-sm text-muted-foreground">Loading...</span>
        </div>
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

  const roleColor = user.role === "sender"
    ? "bg-orange-500/10 text-orange-600 dark:text-orange-400"
    : user.role === "receiver"
    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
    : "bg-violet-500/10 text-violet-600 dark:text-violet-400";

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="border-b bg-card/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-3 px-4 py-2.5">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-amber-400">
              <Store className="w-4 h-4 text-white" />
            </div>
            <div className="flex items-center gap-2.5">
              <span className="font-bold text-sm tracking-tight" data-testid="text-app-name">Kaziwa Mart</span>
              <Badge variant="secondary" className={`text-[10px] font-medium px-2 py-0.5 ${roleColor}`} data-testid="text-user-role">
                {roleLabel}
              </Badge>
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
