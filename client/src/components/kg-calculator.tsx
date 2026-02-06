import { useState, useEffect, useCallback } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Package, ArrowRight, Scale, Banknote } from "lucide-react";
import type { Product, BasketItem } from "@shared/schema";

function formatIQD(amount: number): string {
  return Math.round(amount).toLocaleString("en-US");
}

function roundToStep(value: number, step: number): { lower: number; upper: number } {
  const lower = Math.floor(value / step) * step;
  const upper = lower + step;
  return { lower, upper };
}

type Props = {
  product: Product | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddToBasket: (item: BasketItem) => void;
};

export function KgCalculator({ product, open, onOpenChange, onAddToBasket }: Props) {
  const [mode, setMode] = useState<"iqd" | "kg">("iqd");
  const [iqdInput, setIqdInput] = useState("");
  const [kgInput, setKgInput] = useState("");
  const [finalIqd, setFinalIqd] = useState(0);
  const [finalKg, setFinalKg] = useState(0);
  const [suggestions, setSuggestions] = useState<{ iqd: number; kg: number }[]>([]);

  useEffect(() => {
    if (open) {
      setMode("iqd");
      setIqdInput("");
      setKgInput("");
      setFinalIqd(0);
      setFinalKg(0);
      setSuggestions([]);
    }
  }, [open]);

  const pricePerKg = product?.pricePerKg || 1;

  const handleIqdChange = useCallback((val: string) => {
    const clean = val.replace(/[^0-9]/g, "");
    setIqdInput(clean);
    const amount = parseInt(clean, 10) || 0;
    const kg = amount / pricePerKg;
    setFinalIqd(amount);
    setFinalKg(kg);
    setSuggestions([]);
  }, [pricePerKg]);

  const handleKgChange = useCallback((val: string) => {
    const clean = val.replace(/[^0-9.]/g, "");
    setKgInput(clean);
    const kg = parseFloat(clean) || 0;
    const rawIqd = kg * pricePerKg;

    const { lower, upper } = roundToStep(rawIqd, 250);
    const isPayable = rawIqd % 250 === 0;

    if (isPayable || rawIqd === 0) {
      setFinalIqd(rawIqd);
      setFinalKg(kg);
      setSuggestions([]);
    } else {
      setFinalIqd(rawIqd);
      setFinalKg(kg);
      const sugg: { iqd: number; kg: number }[] = [];
      if (lower > 0) sugg.push({ iqd: lower, kg: lower / pricePerKg });
      sugg.push({ iqd: upper, kg: upper / pricePerKg });
      setSuggestions(sugg);
    }
  }, [pricePerKg]);

  const selectSuggestion = (s: { iqd: number; kg: number }) => {
    setFinalIqd(s.iqd);
    setFinalKg(s.kg);
    setKgInput(s.kg.toFixed(3));
    setSuggestions([]);
  };

  const handleAdd = () => {
    if (!product || finalIqd <= 0 || finalKg <= 0) return;
    onAddToBasket({
      productId: product.id,
      productName: product.name,
      pricePerKg: product.pricePerKg,
      paidAmount: Math.round(finalIqd),
      weightKg: parseFloat(finalKg.toFixed(3)),
    });
    onOpenChange(false);
  };

  if (!product) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-md bg-muted flex items-center justify-center overflow-hidden flex-shrink-0">
              {product.imageUrl ? (
                <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
              ) : (
                <Package className="w-4 h-4 text-muted-foreground" />
              )}
            </div>
            <span className="truncate">{product.name}</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center justify-between gap-2 px-1">
            <span className="text-sm text-muted-foreground">Price</span>
            <Badge variant="secondary" data-testid="text-calc-price">
              {formatIQD(pricePerKg)} IQD / KG
            </Badge>
          </div>

          <Tabs value={mode} onValueChange={(v) => { setMode(v as "iqd" | "kg"); setIqdInput(""); setKgInput(""); setFinalIqd(0); setFinalKg(0); setSuggestions([]); }}>
            <TabsList className="w-full">
              <TabsTrigger value="iqd" className="flex-1 gap-1.5" data-testid="tab-by-iqd">
                <Banknote className="w-3.5 h-3.5" /> By IQD
              </TabsTrigger>
              <TabsTrigger value="kg" className="flex-1 gap-1.5" data-testid="tab-by-kg">
                <Scale className="w-3.5 h-3.5" /> By KG
              </TabsTrigger>
            </TabsList>
          </Tabs>

          {mode === "iqd" ? (
            <div className="space-y-3">
              <div className="space-y-2">
                <Label>Amount (IQD)</Label>
                <Input
                  value={iqdInput}
                  onChange={(e) => handleIqdChange(e.target.value)}
                  placeholder="Enter amount in IQD"
                  autoFocus
                  data-testid="input-iqd-amount"
                />
              </div>
              {finalKg > 0 && (
                <div className="flex items-center justify-between p-3 rounded-md bg-muted/50">
                  <span className="text-sm text-muted-foreground">Calculated weight</span>
                  <span className="font-semibold text-foreground" data-testid="text-calculated-kg">
                    {finalKg.toFixed(3)} KG
                  </span>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              <div className="space-y-2">
                <Label>Weight (KG)</Label>
                <Input
                  value={kgInput}
                  onChange={(e) => handleKgChange(e.target.value)}
                  placeholder="e.g. 0.25, 0.5, 1"
                  autoFocus
                  data-testid="input-kg-amount"
                />
              </div>
              {finalIqd > 0 && (
                <div className="flex items-center justify-between p-3 rounded-md bg-muted/50">
                  <span className="text-sm text-muted-foreground">Calculated price</span>
                  <span className="font-semibold text-foreground" data-testid="text-calculated-iqd">
                    {formatIQD(finalIqd)} IQD
                  </span>
                </div>
              )}
              {suggestions.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground">
                    Amount not payable. Choose a suggestion:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {suggestions.map((s) => (
                      <Button
                        key={s.iqd}
                        variant="outline"
                        size="sm"
                        onClick={() => selectSuggestion(s)}
                        data-testid={`button-suggestion-${s.iqd}`}
                      >
                        {formatIQD(s.iqd)} IQD
                        <ArrowRight className="w-3 h-3 mx-1" />
                        {s.kg.toFixed(3)} KG
                      </Button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} data-testid="button-cancel-calc">
            Cancel
          </Button>
          <Button
            onClick={handleAdd}
            disabled={finalIqd <= 0 || finalKg <= 0 || suggestions.length > 0}
            data-testid="button-add-to-basket"
          >
            Add to Basket
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
