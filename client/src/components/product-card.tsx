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
      className={`overflow-visible ${onSelect ? "hover-elevate active-elevate-2 cursor-pointer" : ""}`}
      onClick={() => onSelect?.(product)}
      data-testid={`card-product-${product.id}`}
    >
      <CardContent className="p-0">
        <div className="flex items-center gap-3 p-3">
          <div className="w-12 h-12 rounded-md bg-muted flex items-center justify-center flex-shrink-0 overflow-hidden">
            {product.imageUrl ? (
              <img
                src={product.imageUrl}
                alt={product.name}
                className="w-full h-full object-cover rounded-md"
              />
            ) : (
              <Package className="w-5 h-5 text-muted-foreground" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-medium text-sm truncate" data-testid={`text-product-name-${product.id}`}>
              {product.name}
            </div>
            <div className="text-sm text-muted-foreground" data-testid={`text-product-price-${product.id}`}>
              {formatIQD(product.pricePerKg)} IQD / KG
            </div>
          </div>
          {showActions && (
            <div className="flex items-center gap-1 flex-shrink-0">
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
