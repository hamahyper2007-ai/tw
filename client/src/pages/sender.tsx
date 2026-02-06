import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Product, BasketItem } from "@shared/schema";
import { ProductCard } from "@/components/product-card";
import { ProductDialog } from "@/components/product-dialog";
import { KgCalculator } from "@/components/kg-calculator";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Plus, ShoppingBasket, Send, Search, Package, X } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

function formatIQD(amount: number): string {
  return Math.round(amount).toLocaleString("en-US");
}

export default function SenderPage() {
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [basket, setBasket] = useState<BasketItem[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [calcOpen, setCalcOpen] = useState(false);
  const [productDialogOpen, setProductDialogOpen] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [deleteProduct, setDeleteProduct] = useState<Product | null>(null);

  const { data: products = [], isLoading } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  const createProductMutation = useMutation({
    mutationFn: async (data: { name: string; pricePerKg: number; imageUrl?: string | null }) => {
      const res = await apiRequest("POST", "/api/products", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      setProductDialogOpen(false);
      toast({ title: "Product added" });
    },
  });

  const updateProductMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      const res = await apiRequest("PATCH", `/api/products/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      setProductDialogOpen(false);
      setEditProduct(null);
      toast({ title: "Product updated" });
    },
  });

  const deleteProductMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/products/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      setDeleteProduct(null);
      toast({ title: "Product deleted" });
    },
  });

  const submitOrderMutation = useMutation({
    mutationFn: async (items: BasketItem[]) => {
      const res = await apiRequest("POST", "/api/orders", { items });
      return res.json();
    },
    onSuccess: () => {
      setBasket([]);
      toast({ title: "Order sent!", description: "The receiver has been notified." });
    },
  });

  const handleSaveProduct = async (data: { name: string; pricePerKg: number; imageUrl?: string | null; removeImage?: boolean }) => {
    const payload: any = { name: data.name, pricePerKg: data.pricePerKg };
    if (data.imageUrl) payload.imageUrl = data.imageUrl;
    if (data.removeImage) payload.removeImage = true;

    if (editProduct) {
      await updateProductMutation.mutateAsync({ id: editProduct.id, data: payload });
    } else {
      await createProductMutation.mutateAsync(payload);
    }
  };

  const handleProductSelect = (product: Product) => {
    setSelectedProduct(product);
    setCalcOpen(true);
  };

  const handleAddToBasket = (item: BasketItem) => {
    setBasket((prev) => [...prev, item]);
  };

  const removeFromBasket = (index: number) => {
    setBasket((prev) => prev.filter((_, i) => i !== index));
  };

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  const basketTotal = basket.reduce((sum, item) => sum + item.paidAmount, 0);

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-full">
      <div className="flex-1 flex flex-col min-w-0">
        <div className="flex items-center justify-between gap-3 mb-5 flex-wrap">
          <div>
            <h2 className="text-lg font-bold tracking-tight">Products</h2>
            <p className="text-xs text-muted-foreground mt-0.5">{products.length} items available</p>
          </div>
          <div className="flex items-center gap-2 flex-1 justify-end">
            <div className="relative max-w-xs flex-1">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search products..."
                className="pl-8"
                data-testid="input-search-products"
              />
            </div>
            <Button onClick={() => { setEditProduct(null); setProductDialogOpen(true); }} data-testid="button-add-product">
              <Plus className="w-4 h-4 mr-1.5" /> Add
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="p-0">
                  <Skeleton className="aspect-square w-full rounded-t-lg" />
                  <div className="p-3 space-y-2">
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground py-16">
            <div className="w-14 h-14 rounded-2xl bg-orange-100 dark:bg-orange-900/20 flex items-center justify-center mb-4">
              <Package className="w-7 h-7 text-orange-400" />
            </div>
            <p className="text-sm font-medium">{search ? "No products match your search" : "No products yet"}</p>
            <p className="text-xs mt-1">{search ? "Try a different search term" : "Add your first product to get started"}</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-4 overflow-auto flex-1">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onSelect={handleProductSelect}
                onEdit={(p) => { setEditProduct(p); setProductDialogOpen(true); }}
                onDelete={(p) => setDeleteProduct(p)}
                showActions
              />
            ))}
          </div>
        )}
      </div>

      <div className="lg:w-80 xl:w-96 flex-shrink-0">
        <Card className="sticky top-16">
          <CardHeader className="flex flex-row items-center justify-between gap-2 pb-3">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-orange-500/10 flex items-center justify-center">
                <ShoppingBasket className="w-3.5 h-3.5 text-orange-600 dark:text-orange-400" />
              </div>
              Basket
              {basket.length > 0 && (
                <Badge variant="default" className="ml-1">{basket.length}</Badge>
              )}
            </CardTitle>
            {basket.length > 0 && (
              <Button size="sm" variant="ghost" onClick={() => setBasket([])} data-testid="button-clear-basket">
                Clear
              </Button>
            )}
          </CardHeader>
          <CardContent className="space-y-3 pt-0">
            {basket.length === 0 ? (
              <div className="text-center py-10 text-muted-foreground">
                <div className="w-12 h-12 rounded-2xl bg-muted/60 flex items-center justify-center mx-auto mb-3">
                  <ShoppingBasket className="w-6 h-6 opacity-40" />
                </div>
                <p className="text-sm font-medium">Basket is empty</p>
                <p className="text-xs mt-1">Select a product to get started</p>
              </div>
            ) : (
              <>
                <div className="space-y-2 max-h-[40vh] overflow-auto">
                  {basket.map((item, i) => (
                    <div key={i} className="flex items-start gap-2 p-2.5 rounded-lg bg-muted/40" data-testid={`basket-item-${i}`}>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold truncate">{item.productName}</div>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-xs font-medium text-orange-600 dark:text-orange-400">{formatIQD(item.paidAmount)} IQD</span>
                          <span className="text-xs text-muted-foreground">{item.weightKg.toFixed(3)} KG</span>
                        </div>
                      </div>
                      <Button size="icon" variant="ghost" onClick={() => removeFromBasket(i)} data-testid={`button-remove-basket-${i}`}>
                        <X className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  ))}
                </div>

                <div className="border-t pt-3 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Total</span>
                    <span className="text-lg font-bold text-orange-600 dark:text-orange-400" data-testid="text-basket-total">{formatIQD(basketTotal)} IQD</span>
                  </div>
                  <Button
                    className="w-full"
                    onClick={() => submitOrderMutation.mutate(basket)}
                    disabled={submitOrderMutation.isPending}
                    data-testid="button-send-order"
                  >
                    <Send className="w-4 h-4 mr-1.5" />
                    {submitOrderMutation.isPending ? "Sending..." : "Send Order"}
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <KgCalculator
        product={selectedProduct}
        open={calcOpen}
        onOpenChange={setCalcOpen}
        onAddToBasket={handleAddToBasket}
      />

      <ProductDialog
        open={productDialogOpen}
        onOpenChange={setProductDialogOpen}
        product={editProduct}
        onSave={handleSaveProduct}
        isPending={createProductMutation.isPending || updateProductMutation.isPending}
      />

      <AlertDialog open={!!deleteProduct} onOpenChange={(open) => !open && setDeleteProduct(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Product</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deleteProduct?.name}"? This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-delete">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteProduct && deleteProductMutation.mutate(deleteProduct.id)}
              data-testid="button-confirm-delete"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
