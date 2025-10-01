import { useState } from "react";
import { ProductGroup, Product } from "@shared/schema";
import { ShoppingCart, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLocation } from "wouter";

interface ProductGroupCardProps {
  group: ProductGroup;
}

export default function ProductGroupCard({ group }: ProductGroupCardProps) {
  const [selectedVariant, setSelectedVariant] = useState(group.variants[0]);
  const [, setLocation] = useLocation();

  const isInStock = selectedVariant.inStock && selectedVariant.stockQuantity > 0;
  const hasDiscount = selectedVariant.originalPrice && parseFloat(selectedVariant.originalPrice) > parseFloat(selectedVariant.price);

  // Create a virtual Product object for the checkout page
  const createProductFromVariant = (): Product => ({
    id: selectedVariant.id,
    name: `${group.name} - ${selectedVariant.name}`,
    description: group.description,
    price: selectedVariant.price,
    originalPrice: selectedVariant.originalPrice || null,
    category: group.category,
    game: group.game || "",
    stockQuantity: selectedVariant.stockQuantity,
    inStock: selectedVariant.inStock,
    imageUrl: group.imageUrl || null,
    deliveryUrl: selectedVariant.deliveryUrl || null,
    licenseKey: selectedVariant.licenseKey || null,
    deliveryType: group.deliveryType,
  });

  const handleCheckoutClick = () => {
    const productData = encodeURIComponent(JSON.stringify(createProductFromVariant()));
    setLocation(`/checkout/${productData}`);
  };

  return (
    <div className={`bg-card rounded-lg border border-border overflow-hidden card-hover neon-border ${!isInStock ? 'opacity-75' : ''}`} data-testid={`card-group-${group.id}`}>
      <div className="relative bg-muted/20 p-6 border-b border-border">
        <div className="flex justify-between items-start">
          <span className="px-2 py-1 bg-primary text-primary-foreground text-xs font-medium rounded-md">
            {group.category}
          </span>
          {hasDiscount && (
            <span className="px-2 py-1 bg-purple-600 text-white text-xs font-medium rounded-md">
              SALE
            </span>
          )}
        </div>
        <div className="mt-4 text-center">
          {group.imageUrl ? (
            <img 
              src={group.imageUrl} 
              alt={group.name}
              className="w-[360px] h-[360px] object-cover mx-auto mb-2 rounded-lg"
            />
          ) : (
            <Package className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
          )}
          <h3 className="text-lg font-semibold" data-testid={`text-name-${group.id}`}>
            {group.name === "DMA Bundle Firmware Included" && selectedVariant.id === "dma-bundle-no-firmware" 
              ? "DMA Bundle" 
              : group.name}
          </h3>
        </div>
      </div>

      <div className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <Package className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground" data-testid={`text-game-${group.id}`}>
            {group.game}
          </span>
        </div>


        <p className="text-muted-foreground text-sm mb-4 line-clamp-2" data-testid={`text-description-${group.id}`}>
          {group.description}
        </p>

        {/* Variant Selector */}
        <div className="mb-4">
          <label className="text-sm font-medium mb-2 block">Duration:</label>
          <Select 
            value={selectedVariant.id} 
            onValueChange={(value) => setSelectedVariant(group.variants.find(v => v.id === value) || group.variants[0])}
            data-testid={`select-variant-${group.id}`}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {group.variants.map((variant) => (
                <SelectItem key={variant.id} value={variant.id}>
                  {variant.name} - ${variant.price}
                  {variant.originalPrice && (
                    <span className="ml-2 text-muted-foreground line-through text-xs">
                      ${variant.originalPrice}
                    </span>
                  )}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-primary" data-testid={`text-price-${group.id}`}>
              ${selectedVariant.price}
            </span>
            {hasDiscount && (
              <span className="text-lg text-muted-foreground line-through" data-testid={`text-original-price-${group.id}`}>
                ${selectedVariant.originalPrice}
              </span>
            )}
          </div>
          
          <div className="text-right">
            <div className="text-sm text-muted-foreground">Stock</div>
            <div className={`text-sm font-medium ${isInStock ? 'text-green-500' : 'text-purple-600'}`} data-testid={`text-stock-${group.id}`}>
              {isInStock ? `${selectedVariant.stockQuantity} available` : 'Out of stock'}
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Button
            variant="outline"
            className="w-full"
            onClick={() => setLocation(`/product/${selectedVariant.id}`)}
            data-testid={`button-details-${group.id}`}
          >
            <Package className="w-4 h-4 mr-2" />
            View Details
          </Button>
          
          <Button
            className={`w-full px-4 py-2 rounded-lg font-medium transition-colors ${
              isInStock
                ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                : 'bg-muted text-muted-foreground cursor-not-allowed'
            }`}
            disabled={!isInStock}
            onClick={handleCheckoutClick}
            data-testid={`button-checkout-${group.id}`}
          >
            <ShoppingCart className="w-4 h-4 mr-2" />
            {isInStock ? 'Checkout' : 'Out of Stock'}
          </Button>
        </div>
      </div>
    </div>
  );
}