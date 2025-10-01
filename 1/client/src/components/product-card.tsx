import { Product } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Check, X, Package, Eye, Star, ShoppingCart } from "lucide-react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";

interface ProductCardProps {
  product: Product;
  className?: string;
  compact?: boolean;
}

export default function ProductCard({ product, className = "", compact = false }: ProductCardProps) {
  const [, setLocation] = useLocation();
  const isInStock = product.inStock && product.stockQuantity > 0;
  const hasDiscount = product.originalPrice && parseFloat(product.originalPrice) > parseFloat(product.price);

  const handleCheckoutClick = () => {
    const productData = encodeURIComponent(JSON.stringify(product));
    setLocation(`/checkout/${productData}`);
  };

  const { user } = useAuth();

  const handleViewDetails = async () => {
    // Track product view for authenticated users
    if (user) {
      try {
        await fetch(`/api/recently-viewed/${product.id}`, {
          method: 'POST',
          credentials: 'include'
        });
      } catch (error) {
        // Silently ignore tracking errors to not disrupt user experience
        console.debug('Failed to track product view:', error);
      }
    }
    
    setLocation(`/product/${product.id}`);
  };

  return (
    <div className={`bg-card rounded-lg border border-border overflow-hidden card-hover neon-border ${!isInStock ? 'opacity-75' : ''} ${className}`} data-testid={`card-product-${product.id}`}>
      <div className={`relative bg-muted/20 ${compact ? 'p-3' : 'p-6'} border-b border-border`}>
        {!compact && (
          <div className="flex justify-between items-start mb-4">
            <span className="px-2 py-1 bg-primary text-primary-foreground text-xs font-medium rounded-md">
              {product.category}
            </span>
            {hasDiscount && (
              <span className="px-2 py-1 bg-purple-600 text-white text-xs font-medium rounded-md">
                SALE
              </span>
            )}
          </div>
        )}
        <div className="text-center cursor-pointer" onClick={handleViewDetails}>
          {product.imageUrl ? (
            <img 
              src={product.imageUrl} 
              alt={product.name}
              className={`${compact ? 'w-full h-24' : 'w-[360px] h-auto'} mx-auto mb-2 rounded-md object-cover hover:opacity-90 transition-opacity`}
            />
          ) : (
            <Package className={`${compact ? 'w-6 h-6' : 'w-12 h-12'} text-muted-foreground mx-auto mb-2`} />
          )}
          <h3 className={`${compact ? 'text-sm' : 'text-lg'} font-semibold hover:text-primary transition-colors ${compact ? 'truncate' : ''}`} data-testid={`text-product-name-${product.id}`}>
            {product.name}
          </h3>
        </div>
      </div>
      
      <div className={`${compact ? 'p-3' : 'p-6'}`}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Package className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              {product.game}
            </span>
          </div>
          <span 
            className={`text-xs px-2 py-1 rounded-full flex items-center space-x-1 ${
              isInStock 
                ? 'bg-green-600 text-white' 
                : 'bg-purple-600 text-white'
            }`}
            data-testid={`status-stock-${product.id}`}
          >
            {isInStock ? (
              <>
                <Check className="w-3 h-3" />
                <span>
                  {product.stockQuantity > 1 ? `${product.stockQuantity} In Stock` : 'In Stock'}
                </span>
              </>
            ) : (
              <>
                <X className="w-3 h-3" />
                <span>Out of Stock</span>
              </>
            )}
          </span>
        </div>
        
        <p className="text-muted-foreground text-sm mb-3" data-testid={`text-product-description-${product.id}`}>
          {product.description}
        </p>
        
        {/* Rating Display */}
        {((product.averageRating ?? 0) > 0 && (product.reviewCount ?? 0) > 0) && (
          <div className="flex items-center space-x-2 mb-3">
            <div className="flex items-center">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-4 h-4 ${
                    star <= (product.averageRating || 0)
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            <span className="text-sm font-medium">{product.averageRating?.toFixed(1)}</span>
            <span className="text-sm text-muted-foreground">({product.reviewCount} reviews)</span>
          </div>
        )}
        
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <span className="text-xl font-bold text-primary" data-testid={`text-price-${product.id}`}>
              ${product.price}
            </span>
            {hasDiscount && (
              <span className="text-sm text-muted-foreground line-through" data-testid={`text-original-price-${product.id}`}>
                ${product.originalPrice}
              </span>
            )}
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleViewDetails}
            className="flex-1"
          >
            <Eye className="w-4 h-4 mr-1" />
            Details
          </Button>
          <Button
            size="sm"
            className={`flex-1 ${
              isInStock
                ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                : 'bg-muted text-muted-foreground cursor-not-allowed'
            }`}
            disabled={!isInStock}
            onClick={handleCheckoutClick}
            data-testid={`button-checkout-${product.id}`}
          >
            <ShoppingCart className="w-4 h-4 mr-1" />
            {isInStock ? 'Buy Now' : 'Out of Stock'}
          </Button>
        </div>
      </div>
    </div>
  );
}
