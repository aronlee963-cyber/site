import React, { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Loader2, Check, X, Tag, AlertCircle } from "lucide-react";

export interface DiscountCodeResult {
  code: string;
  type: 'percentage' | 'fixed';
  value: string;
  discountAmount: number;
  minOrderAmount: string;
  valid: boolean;
}

interface DiscountCodeInputProps {
  orderAmount: number;
  onDiscountApplied: (discount: DiscountCodeResult | null) => void;
  appliedDiscount?: DiscountCodeResult | null;
  className?: string;
}

export default function DiscountCodeInput({ 
  orderAmount, 
  onDiscountApplied, 
  appliedDiscount,
  className = "" 
}: DiscountCodeInputProps) {
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);

  const validateCodeMutation = useMutation({
    mutationFn: async (discountCode: string) => {
      const response = await fetch('/api/discount-codes/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          code: discountCode,
          orderAmount: orderAmount.toString()
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to validate discount code');
      }

      return response.json();
    },
    onSuccess: (discount: DiscountCodeResult) => {
      setError(null);
      setCode("");
      onDiscountApplied(discount);
    },
    onError: (error: Error) => {
      setError(error.message);
      onDiscountApplied(null);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;
    
    setError(null);
    validateCodeMutation.mutate(code.trim());
  };

  const removeDiscount = () => {
    onDiscountApplied(null);
    setError(null);
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Applied Discount Display */}
      {appliedDiscount && (
        <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-800 rounded-full">
                <Check className="w-4 h-4 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-green-800 dark:text-green-200">
                    Code Applied: {appliedDiscount.code}
                  </span>
                  <Badge variant="secondary" className="text-xs">
                    {appliedDiscount.type === 'percentage' 
                      ? `${appliedDiscount.value}% off`
                      : `$${appliedDiscount.value} off`
                    }
                  </Badge>
                </div>
                <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                  You save ${appliedDiscount.discountAmount.toFixed(2)}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={removeDiscount}
              className="text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-200"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Discount Code Input Form */}
      {!appliedDiscount && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Tag className="w-4 h-4" />
            <span className="text-sm font-medium">Have a discount code?</span>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="flex gap-2">
              <Input
                type="text"
                placeholder="Enter discount code"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                className="flex-1"
                disabled={validateCodeMutation.isPending}
              />
              <Button
                type="submit"
                variant="outline"
                disabled={!code.trim() || validateCodeMutation.isPending}
                className="px-6"
              >
                {validateCodeMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Checking...
                  </>
                ) : (
                  'Apply'
                )}
              </Button>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </form>
        </div>
      )}

      {/* Helper Text */}
      {!appliedDiscount && !error && (
        <p className="text-xs text-muted-foreground">
          Enter your discount code above to apply it to your order
        </p>
      )}
    </div>
  );
}