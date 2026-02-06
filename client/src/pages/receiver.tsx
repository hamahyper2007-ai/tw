import { useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { subscribe } from "@/lib/websocket";
import type { OrderWithItems } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Check, Clock, Inbox, Package, CheckCircle2 } from "lucide-react";

function formatIQD(amount: number): string {
  return Math.round(amount).toLocaleString("en-US");
}

function formatDate(date: string | Date): string {
  return new Date(date).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

export default function ReceiverPage() {
  const { toast } = useToast();

  const { data: orders = [], isLoading } = useQuery<OrderWithItems[]>({
    queryKey: ["/api/orders"],
  });

  useEffect(() => {
    const unsub = subscribe((msg) => {
      if (msg.type === "new_order" || msg.type === "order_updated") {
        queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
        if (msg.type === "new_order") {
          toast({ title: "New order received!" });
        }
      }
    });
    return unsub;
  }, [toast]);

  const completeMutation = useMutation({
    mutationFn: async (orderId: number) => {
      await apiRequest("PATCH", `/api/orders/${orderId}`, { status: "completed" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      toast({ title: "Order marked as completed" });
    },
  });

  const pendingOrders = orders.filter((o) => o.status === "pending");
  const completedOrders = orders.filter((o) => o.status === "completed");

  return (
    <div className="space-y-8">
      <div>
        <div className="flex items-center gap-3 mb-5">
          <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center">
            <Clock className="w-4 h-4 text-orange-600 dark:text-orange-400" />
          </div>
          <div>
            <h2 className="text-lg font-bold tracking-tight">Pending Orders</h2>
            <p className="text-xs text-muted-foreground">{pendingOrders.length} order{pendingOrders.length !== 1 ? "s" : ""} waiting</p>
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Array.from({ length: 2 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="p-4 space-y-3">
                  <Skeleton className="h-5 w-1/3" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : pendingOrders.length === 0 ? (
          <Card>
            <CardContent className="py-14 flex flex-col items-center text-muted-foreground">
              <div className="w-14 h-14 rounded-2xl bg-muted/60 flex items-center justify-center mb-4">
                <Inbox className="w-7 h-7 opacity-40" />
              </div>
              <p className="text-sm font-medium">No pending orders</p>
              <p className="text-xs mt-1">New orders will appear here in real-time</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pendingOrders.map((order) => (
              <OrderCard key={order.id} order={order} onComplete={() => completeMutation.mutate(order.id)} isPending={completeMutation.isPending} />
            ))}
          </div>
        )}
      </div>

      {completedOrders.length > 0 && (
        <div>
          <div className="flex items-center gap-3 mb-5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold tracking-tight">Completed</h2>
              <p className="text-xs text-muted-foreground">{completedOrders.length} order{completedOrders.length !== 1 ? "s" : ""} done</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {completedOrders.slice(0, 10).map((order) => (
              <OrderCard key={order.id} order={order} completed />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function OrderCard({ order, onComplete, isPending, completed }: {
  order: OrderWithItems;
  onComplete?: () => void;
  isPending?: boolean;
  completed?: boolean;
}) {
  const total = order.items.reduce((sum, item) => sum + item.paidAmount, 0);
  const totalKg = order.items.reduce((sum, item) => sum + item.weightKg, 0);

  return (
    <Card className={completed ? "opacity-60" : ""} data-testid={`card-order-${order.id}`}>
      <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
        <CardTitle className="text-sm font-bold flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-muted flex items-center justify-center">
            <Package className="w-3.5 h-3.5 text-muted-foreground" />
          </div>
          Order #{order.id}
        </CardTitle>
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="text-[11px] text-muted-foreground">{formatDate(order.createdAt)}</span>
          {completed ? (
            <Badge variant="secondary"><Check className="w-3 h-3 mr-1" /> Done</Badge>
          ) : (
            <Badge><Clock className="w-3 h-3 mr-1" /> Pending</Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-1.5">
          {order.items.map((item) => (
            <div key={item.id} className="flex items-center justify-between text-sm gap-2" data-testid={`order-item-${item.id}`}>
              <span className="truncate flex-1">{item.productName}</span>
              <span className="text-muted-foreground flex-shrink-0 text-xs">{item.weightKg.toFixed(3)} KG</span>
              <span className="font-semibold flex-shrink-0 w-24 text-right text-orange-600 dark:text-orange-400">{formatIQD(item.paidAmount)} IQD</span>
            </div>
          ))}
        </div>

        <div className="border-t pt-2.5 flex items-center justify-between">
          <div className="text-sm">
            <span className="font-bold" data-testid={`text-order-total-${order.id}`}>{formatIQD(total)} IQD</span>
            <span className="text-muted-foreground text-xs ml-2">({totalKg.toFixed(3)} KG)</span>
          </div>
          {!completed && onComplete && (
            <Button size="sm" onClick={onComplete} disabled={isPending} data-testid={`button-complete-order-${order.id}`}>
              <Check className="w-3.5 h-3.5 mr-1" />
              Complete
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
