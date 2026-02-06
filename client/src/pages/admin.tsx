import { useQuery } from "@tanstack/react-query";
import type { OrderWithItems, Product } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { DollarSign, Package, ShoppingCart, TrendingUp, Scale, Clock, Check } from "lucide-react";

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

  const completedOrders = orders.filter((o) => o.status === "completed");
  const pendingOrders = orders.filter((o) => o.status === "pending");

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
            <Card key={i}><CardContent className="p-4"><Skeleton className="h-4 w-1/2 mb-2" /><Skeleton className="h-8 w-3/4" /></CardContent></Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={DollarSign} label="Total Revenue" value={`${formatIQD(totalRevenue)} IQD`} testId="stat-revenue" />
        <StatCard icon={ShoppingCart} label="Total Orders" value={totalOrders.toString()} testId="stat-orders" />
        <StatCard icon={Scale} label="KG Sold" value={`${totalKgSold.toFixed(2)} KG`} testId="stat-kg-sold" />
        <StatCard icon={Package} label="Products" value={products.length.toString()} testId="stat-products" />
      </div>

      <Tabs defaultValue="orders">
        <TabsList>
          <TabsTrigger value="orders" data-testid="tab-orders">
            Orders History
          </TabsTrigger>
          <TabsTrigger value="products" data-testid="tab-product-stats">
            Product Stats
          </TabsTrigger>
        </TabsList>

        <TabsContent value="orders" className="mt-4 space-y-3">
          {orders.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                <ShoppingCart className="w-10 h-10 mx-auto mb-3 opacity-50" />
                <p className="text-sm">No orders yet</p>
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
                        <span className="font-medium text-sm">Order #{order.id}</span>
                        {order.status === "completed" ? (
                          <Badge variant="secondary"><Check className="w-3 h-3 mr-1" />Completed</Badge>
                        ) : (
                          <Badge><Clock className="w-3 h-3 mr-1" />Pending</Badge>
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground">{formatDate(order.createdAt)}</span>
                    </div>
                    <div className="space-y-1">
                      {order.items.map((item) => (
                        <div key={item.id} className="flex items-center justify-between text-sm gap-2">
                          <span className="truncate flex-1">{item.productName}</span>
                          <span className="text-muted-foreground flex-shrink-0">{item.weightKg.toFixed(3)} KG</span>
                          <span className="font-medium flex-shrink-0 w-24 text-right">{formatIQD(item.paidAmount)} IQD</span>
                        </div>
                      ))}
                    </div>
                    <div className="border-t mt-2 pt-2 flex justify-between text-sm">
                      <span className="text-muted-foreground">{totalKg.toFixed(3)} KG total</span>
                      <span className="font-semibold">{formatIQD(total)} IQD</span>
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
              <CardContent className="py-12 text-center text-muted-foreground">
                <TrendingUp className="w-10 h-10 mx-auto mb-3 opacity-50" />
                <p className="text-sm">No sales data yet</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {sortedProductSales.map((ps) => (
                <Card key={ps.name} data-testid={`product-stat-${ps.name}`}>
                  <CardContent className="p-3 flex items-center justify-between gap-3 flex-wrap">
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm truncate">{ps.name}</div>
                      <div className="text-xs text-muted-foreground">{ps.count} sales</div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="font-semibold text-sm">{formatIQD(ps.totalIqd)} IQD</div>
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

function StatCard({ icon: Icon, label, value, testId }: { icon: any; label: string; value: string; testId: string }) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-1">
          <Icon className="w-4 h-4 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">{label}</span>
        </div>
        <div className="text-xl font-semibold truncate" data-testid={testId}>{value}</div>
      </CardContent>
    </Card>
  );
}
