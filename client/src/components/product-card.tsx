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
        <div className="flex items-center gap-4 p-4">
          <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-orange-100 to-amber-50 dark:from-orange-900/30 dark:to-amber-900/20 flex items-center justify-center flex-shrink-0 overflow-hidden">
            {product.imageUrl ? (
              <img
                src={product.imageUrl}
                alt={product.name}
                className="w-full h-full object-cover rounded-xl"
              />
            ) : (
              <Package className="w-8 h-8 text-orange-500 dark:text-orange-400" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-base truncate" data-testid={`text-product-name-${product.id}`}>
              {product.name}
            </div>
            <div className="text-sm text-muted-foreground mt-1" data-testid={`text-product-price-${product.id}`}>
              <span className="font-semibold text-orange-600 dark:text-orange-400 text-base">{formatIQD(product.pricePerKg)}</span>
              <span className="ml-1">IQD / KG</span>
            </div>
          </div>
          {showActions && (
            <div className="flex items-center gap-1 flex-shrink-0 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-opacity">
              <Button
                size="icon"
                variant="ghost"
                onClick={(e) => { e.stopPropagation(); onEdit?.(product); }}
                data-testid={`button-edit-product-${product.id}`}
              >
                <Pencil className="w-4 h-4" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                onClick={(e) => { e.stopPropagation(); onDelete?.(product); }}
                data-testid={`button-delete-product-${product.id}`}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
