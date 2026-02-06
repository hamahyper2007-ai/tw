import { useQuery } from "@tanstack/react-query";
import type { OrderWithItems, Product } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Package, ShoppingCart, TrendingUp, Scale, Clock, Check, DollarSign, BarChart3 } from "lucide-react";

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

export default function AdminPage() {
  const { data: orders = [], isLoading: ordersLoading } = useQuery<OrderWithItems[]>({
    queryKey: ["/api/orders"],
  });

  const { data: products = [], isLoading: productsLoading } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  const isLoading = ordersLoading || productsLoading;

  const totalRevenue = orders.reduce((sum, o) => sum + o.items.reduce((s, i) => s + i.paidAmount, 0), 0);
  const totalKgSold = orders.reduce((sum, o) => sum + o.items.reduce((s, i) => s + i.weightKg, 0), 0);
  const totalOrders = orders.length;

  const productSales: Record<string, { name: string; totalKg: number; totalIqd: number; count: number }> = {};
  orders.forEach((o) => {
    o.items.forEach((item) => {
      if (!productSales[item.productName]) {
        productSales[item.productName] = { name: item.productName, totalKg: 0, totalIqd: 0, count: 0 };
      }
      productSales[item.productName].totalKg += item.weightKg;
      productSales[item.productName].totalIqd += item.paidAmount;
      productSales[item.productName].count += 1;
    });
  });

  const sortedProductSales = Object.values(productSales).sort((a, b) => b.totalIqd - a.totalIqd);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-5">
                <Skeleton className="h-4 w-1/2 mb-3" />
                <Skeleton className="h-8 w-3/4" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const stats = [
    {
      icon: DollarSign,
      label: "Total Revenue",
      value: `${formatIQD(totalRevenue)} IQD`,
      testId: "stat-revenue",
      iconBg: "bg-orange-500/10",
      iconColor: "text-orange-600 dark:text-orange-400",
    },
    {
      icon: ShoppingCart,
      label: "Total Orders",
      value: totalOrders.toString(),
      testId: "stat-orders",
      iconBg: "bg-blue-500/10",
      iconColor: "text-blue-600 dark:text-blue-400",
    },
    {
      icon: Scale,
      label: "KG Sold",
      value: `${totalKgSold.toFixed(2)} KG`,
      testId: "stat-kg-sold",
      iconBg: "bg-emerald-500/10",
      iconColor: "text-emerald-600 dark:text-emerald-400",
    },
    {
      icon: Package,
      label: "Products",
      value: products.length.toString(),
      testId: "stat-products",
      iconBg: "bg-violet-500/10",
      iconColor: "text-violet-600 dark:text-violet-400",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.testId}>
              <CardContent className="p-5">
                <div className="flex items-center gap-2 mb-2">
                  <div className={`w-7 h-7 rounded-lg ${stat.iconBg} flex items-center justify-center`}>
                    <Icon className={`w-3.5 h-3.5 ${stat.iconColor}`} />
                  </div>
                  <span className="text-xs text-muted-foreground font-medium">{stat.label}</span>
                </div>
                <div className="text-xl font-bold tracking-tight truncate" data-testid={stat.testId}>{stat.value}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Tabs defaultValue="orders">
        <TabsList>
          <TabsTrigger value="orders" data-testid="tab-orders">
            <BarChart3 className="w-3.5 h-3.5 mr-1.5" />
            Orders History
          </TabsTrigger>
          <TabsTrigger value="products" data-testid="tab-product-stats">
            <TrendingUp className="w-3.5 h-3.5 mr-1.5" />
            Product Stats
          </TabsTrigger>
        </TabsList>

        <TabsContent value="orders" className="mt-4 space-y-3">
          {orders.length === 0 ? (
            <Card>
              <CardContent className="py-14 text-center text-muted-foreground">
                <div className="w-14 h-14 rounded-2xl bg-muted/60 flex items-center justify-center mx-auto mb-4">
                  <ShoppingCart className="w-7 h-7 opacity-40" />
                </div>
                <p className="text-sm font-medium">No orders yet</p>
                <p className="text-xs mt-1">Orders will appear here once created</p>
              </CardContent>
            </Card>
          ) : (
            orders.map((order) => {
              const total = order.items.reduce((sum, i) => sum + i.paidAmount, 0);
              const totalKg = order.items.reduce((sum, i) => sum + i.weightKg, 0);
              return (
                <Card key={order.id} data-testid={`admin-order-${order.id}`}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between gap-2 mb-3 flex-wrap">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-md bg-muted flex items-center justify-center">
                          <Package className="w-3.5 h-3.5 text-muted-foreground" />
                        </div>
                        <span className="font-bold text-sm">Order #{order.id}</span>
                        {order.status === "completed" ? (
                          <Badge variant="secondary"><Check className="w-3 h-3 mr-1" />Completed</Badge>
                        ) : (
                          <Badge><Clock className="w-3 h-3 mr-1" />Pending</Badge>
                        )}
                      </div>
                      <span className="text-[11px] text-muted-foreground">{formatDate(order.createdAt)}</span>
                    </div>
                    <div className="space-y-1.5">
                      {order.items.map((item) => (
                        <div key={item.id} className="flex items-center justify-between text-sm gap-2">
                          <span className="truncate flex-1">{item.productName}</span>
                          <span className="text-muted-foreground flex-shrink-0 text-xs">{item.weightKg.toFixed(3)} KG</span>
                          <span className="font-semibold flex-shrink-0 w-24 text-right text-orange-600 dark:text-orange-400">{formatIQD(item.paidAmount)} IQD</span>
                        </div>
                      ))}
                    </div>
                    <div className="border-t mt-3 pt-2.5 flex justify-between text-sm">
                      <span className="text-muted-foreground text-xs">{totalKg.toFixed(3)} KG total</span>
                      <span className="font-bold">{formatIQD(total)} IQD</span>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </TabsContent>

        <TabsContent value="products" className="mt-4">
          {sortedProductSales.length === 0 ? (
            <Card>
              <CardContent className="py-14 text-center text-muted-foreground">
                <div className="w-14 h-14 rounded-2xl bg-muted/60 flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="w-7 h-7 opacity-40" />
                </div>
                <p className="text-sm font-medium">No sales data yet</p>
                <p className="text-xs mt-1">Product performance will show here after orders</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {sortedProductSales.map((ps, index) => (
                <Card key={ps.name} data-testid={`product-stat-${ps.name}`}>
                  <CardContent className="p-3.5 flex items-center gap-3 flex-wrap">
                    <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-bold text-orange-600 dark:text-orange-400">#{index + 1}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-sm truncate">{ps.name}</div>
                      <div className="text-xs text-muted-foreground">{ps.count} sale{ps.count !== 1 ? "s" : ""}</div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="font-bold text-sm text-orange-600 dark:text-orange-400">{formatIQD(ps.totalIqd)} IQD</div>
                      <div className="text-xs text-muted-foreground">{ps.totalKg.toFixed(3)} KG</div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
