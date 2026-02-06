import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { Card, CardContent } from "@/components/ui/card";
import { Send, Inbox, Shield, Loader2, ArrowRight, Store } from "lucide-react";

const accounts = [
  {
    username: "sender",
    password: "sender123",
    label: "Sender",
    icon: Send,
    description: "Create orders & manage products",
    gradient: "from-orange-500 to-amber-400",
    iconBg: "bg-orange-500/10 dark:bg-orange-400/10",
    iconColor: "text-orange-600 dark:text-orange-400",
  },
  {
    username: "receiver",
    password: "receiver123",
    label: "Receiver",
    icon: Inbox,
    description: "View & complete incoming orders",
    gradient: "from-emerald-500 to-teal-400",
    iconBg: "bg-emerald-500/10 dark:bg-emerald-400/10",
    iconColor: "text-emerald-600 dark:text-emerald-400",
  },
  {
    username: "admin",
    password: "admin123",
    label: "Admin",
    icon: Shield,
    description: "Full dashboard & statistics",
    gradient: "from-violet-500 to-purple-400",
    iconBg: "bg-violet-500/10 dark:bg-violet-400/10",
    iconColor: "text-violet-600 dark:text-violet-400",
  },
];

export default function LoginPage() {
  const { login } = useAuth();
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState("");

  const handleLogin = async (username: string, password: string) => {
    setLoading(username);
    setError("");
    try {
      await login(username, password);
    } catch (e: any) {
      setError(e.message || "Login failed");
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <div className="relative overflow-hidden bg-gradient-to-br from-orange-600 via-orange-500 to-amber-400 dark:from-orange-700 dark:via-orange-600 dark:to-amber-500">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-72 h-72 bg-white rounded-full blur-3xl animate-pulse-glow" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-amber-200 rounded-full blur-3xl animate-pulse-glow" style={{ animationDelay: "1s" }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-orange-300 rounded-full blur-3xl animate-pulse-glow" style={{ animationDelay: "2s" }} />
        </div>

        <div className="relative z-10 flex flex-col items-center justify-center px-4 py-16 sm:py-20">
          <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm mb-5 animate-float">
            <Store className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight" data-testid="text-app-title">
            Kaziwa Mart
          </h1>
          <p className="text-white/80 mt-2 text-sm sm:text-base font-light">
            Wholesale Management System
          </p>
        </div>

        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path d="M0 60V20C360 -10 720 40 1080 20C1260 10 1380 15 1440 20V60H0Z" className="fill-background" />
          </svg>
        </div>
      </div>

      <div className="flex-1 flex items-start justify-center px-4 -mt-2">
        <div className="w-full max-w-md space-y-4 pb-12">
          <p className="text-center text-sm text-muted-foreground mb-6">
            Select an account to continue
          </p>

          {error && (
            <div className="text-sm text-destructive text-center bg-destructive/10 rounded-md p-3" data-testid="text-login-error">
              {error}
            </div>
          )}

          <div className="space-y-3">
            {accounts.map((account) => {
              const Icon = account.icon;
              const isLoading = loading === account.username;
              return (
                <Card
                  key={account.username}
                  className="overflow-visible hover-elevate active-elevate-2 cursor-pointer transition-all group"
                  data-testid={`card-login-${account.username}`}
                >
                  <CardContent className="p-0">
                    <button
                      className="w-full flex items-center gap-4 p-4 text-left"
                      onClick={() => handleLogin(account.username, account.password)}
                      disabled={!!loading}
                      data-testid={`button-login-${account.username}`}
                    >
                      <div className={`flex items-center justify-center w-11 h-11 rounded-xl ${account.iconBg} flex-shrink-0 transition-transform`}>
                        {isLoading ? (
                          <Loader2 className={`w-5 h-5 animate-spin ${account.iconColor}`} />
                        ) : (
                          <Icon className={`w-5 h-5 ${account.iconColor}`} />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-sm text-foreground">{account.label}</div>
                        <div className="text-xs text-muted-foreground mt-0.5">{account.description}</div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-muted-foreground opacity-0 -translate-x-1 transition-all group-hover:opacity-100 group-hover:translate-x-0 invisible group-hover:visible" />
                    </button>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <p className="text-xs text-center text-muted-foreground pt-2">
            Admin-only access &middot; Data syncs across devices
          </p>
        </div>
      </div>
    </div>
  );
}
