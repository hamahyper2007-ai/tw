import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Package, Send, Inbox, Shield, Loader2 } from "lucide-react";

const accounts = [
  { username: "sender", password: "sender123", label: "Sender", icon: Send, description: "Create orders & manage products", color: "bg-blue-600 dark:bg-blue-500" },
  { username: "receiver", password: "receiver123", label: "Receiver", icon: Inbox, description: "View & complete incoming orders", color: "bg-emerald-600 dark:bg-emerald-500" },
  { username: "admin", password: "admin123", label: "Admin", icon: Shield, description: "Full dashboard & statistics", color: "bg-violet-600 dark:bg-violet-500" },
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
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-md bg-primary text-primary-foreground mb-2">
            <Package className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight" data-testid="text-app-title">
            Wholesale Manager
          </h1>
          <p className="text-sm text-muted-foreground">
            Select an account to continue
          </p>
        </div>

        {error && (
          <div className="text-sm text-destructive text-center bg-destructive/10 rounded-md p-2" data-testid="text-login-error">
            {error}
          </div>
        )}

        <div className="space-y-3">
          {accounts.map((account) => {
            const Icon = account.icon;
            const isLoading = loading === account.username;
            return (
              <Card key={account.username} className="hover-elevate active-elevate-2 cursor-pointer transition-all" data-testid={`card-login-${account.username}`}>
                <CardContent className="p-0">
                  <button
                    className="w-full flex items-center gap-4 p-4 text-left"
                    onClick={() => handleLogin(account.username, account.password)}
                    disabled={!!loading}
                    data-testid={`button-login-${account.username}`}
                  >
                    <div className={`flex items-center justify-center w-10 h-10 rounded-md ${account.color} text-white flex-shrink-0`}>
                      {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Icon className="w-5 h-5" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-foreground">{account.label}</div>
                      <div className="text-sm text-muted-foreground">{account.description}</div>
                    </div>
                  </button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <p className="text-xs text-center text-muted-foreground">
          Admin-only access. Data syncs across devices.
        </p>
      </div>
    </div>
  );
}
