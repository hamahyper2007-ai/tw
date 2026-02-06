import type { Product } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, Package } from "lucide-react";

function formatIQD(amount: number): string {
  return amount.toLocaleString("en-US");
}

type Props = {
  product: Product;
  onSelect?: (product: Product) => void;
  onEdit?: (product: Product) => void;
  onDelete?: (product: Product) => void;
  showActions?: boolean;
};

export function ProductCard({ product, onSelect, onEdit, onDelete, showActions = false }: Props) {
  return (
    <Card
      className={`overflow-visible group ${onSelect ? "hover-elevate active-elevate-2 cursor-pointer" : ""}`}
      onClick={() => onSelect?.(product)}
      data-testid={`card-product-${product.id}`}
    >
      <CardContent className="p-0">
        <div className="aspect-square w-full rounded-t-lg bg-gradient-to-br from-orange-100 to-amber-50 dark:from-orange-900/30 dark:to-amber-900/20 flex items-center justify-center overflow-hidden relative">
          {product.imageUrl ? (
            <img
              src={product.imageUrl}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <Package className="w-12 h-12 text-orange-400/60 dark:text-orange-500/40" />
          )}
          {showActions && (
            <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-opacity">
              <Button
                size="icon"
                variant="secondary"
                className="h-8 w-8"
                onClick={(e) => { e.stopPropagation(); onEdit?.(product); }}
                data-testid={`button-edit-product-${product.id}`}
              >
                <Pencil className="w-3.5 h-3.5" />
              </Button>
              <Button
                size="icon"
                variant="secondary"
                className="h-8 w-8"
                onClick={(e) => { e.stopPropagation(); onDelete?.(product); }}
                data-testid={`button-delete-product-${product.id}`}
              >
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            </div>
          )}
        </div>
        <div className="p-3">
          <div className="font-semibold text-base truncate" data-testid={`text-product-name-${product.id}`}>
            {product.name}
          </div>
          <div className="text-sm text-muted-foreground mt-1" data-testid={`text-product-price-${product.id}`}>
            <span className="font-semibold text-orange-600 dark:text-orange-400 text-base">{formatIQD(product.pricePerKg)}</span>
            <span className="ml-1">IQD / KG</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
