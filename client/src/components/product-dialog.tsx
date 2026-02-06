import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Upload, X, ImagePlus } from "lucide-react";
import type { Product } from "@shared/schema";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product?: Product | null;
  onSave: (data: { name: string; pricePerKg: number; imageFile?: File | null; removeImage?: boolean }) => Promise<void>;
  isPending: boolean;
};

export function ProductDialog({ open, onOpenChange, product, onSave, isPending }: Props) {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [removeImage, setRemoveImage] = useState(false);

  useEffect(() => {
    if (open) {
      setName(product?.name || "");
      setPrice(product?.pricePerKg?.toString() || "");
      setImageFile(null);
      setImagePreview(product?.imageUrl || null);
      setRemoveImage(false);
    }
  }, [open, product]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setRemoveImage(false);
      const reader = new FileReader();
      reader.onload = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const priceNum = parseInt(price.replace(/,/g, ""), 10);
    if (!name.trim() || isNaN(priceNum) || priceNum <= 0) return;
    await onSave({ name: name.trim(), pricePerKg: priceNum, imageFile, removeImage });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-base font-bold">{product ? "Edit Product" : "Add Product"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="product-name" className="text-xs text-muted-foreground">Product Name</Label>
            <Input
              id="product-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter product name"
              data-testid="input-product-name"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="product-price" className="text-xs text-muted-foreground">Price per KG (IQD)</Label>
            <Input
              id="product-price"
              value={price}
              onChange={(e) => setPrice(e.target.value.replace(/[^0-9]/g, ""))}
              placeholder="e.g. 4500"
              data-testid="input-product-price"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Image</Label>
            <div className="flex items-center gap-3">
              {imagePreview && !removeImage ? (
                <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                  <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    className="absolute top-0.5 right-0.5 p-0.5 bg-background/80 rounded-md"
                    onClick={() => { setImageFile(null); setImagePreview(null); setRemoveImage(true); }}
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ) : null}
              <label className="flex-1">
                <div className="flex items-center justify-center gap-2 border border-dashed rounded-lg p-4 cursor-pointer hover-elevate text-sm text-muted-foreground">
                  <ImagePlus className="w-4 h-4" />
                  <span>{imagePreview && !removeImage ? "Change image" : "Upload image"}</span>
                </div>
                <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} data-testid="input-product-image" />
              </label>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} data-testid="button-cancel-product">
              Cancel
            </Button>
            <Button type="submit" disabled={isPending || !name.trim() || !price} data-testid="button-save-product">
              {isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {product ? "Update" : "Add"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
