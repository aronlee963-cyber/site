import { useState, useEffect } from 'react';
import { useRoute, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Package, Check, X, ShoppingCart, Star } from 'lucide-react';
import ProductReviews from '@/components/product-reviews';
import { useAuth } from '@/hooks/use-auth';
import type { Product } from '@shared/schema';

export default function ProductDetail() {
  const [, params] = useRoute('/product/:id');
  const [, setLocation] = useLocation();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const productId = params?.id;

  useEffect(() => {
    if (!productId) return;

    const fetchProduct = async () => {
      try {
        const response = await fetch(`/api/products/${productId}`);
        if (response.ok) {
          const data = await response.json();
          setProduct(data);
        } else {
          console.error('Product not found');
        }
      } catch (error) {
        console.error('Failed to fetch product:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productId]);

  const handleCheckout = () => {
    if (!product) return;
    const productData = encodeURIComponent(JSON.stringify(product));
    setLocation(`/checkout/${productData}`);
  };

  const handleBack = () => {
    setLocation('/products');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-muted rounded w-48"></div>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="h-96 bg-muted rounded"></div>
              <div className="space-y-4">
                <div className="h-8 bg-muted rounded w-3/4"></div>
                <div className="h-4 bg-muted rounded w-1/2"></div>
                <div className="h-20 bg-muted rounded"></div>
                <div className="h-12 bg-muted rounded w-32"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-6xl mx-auto text-center py-20">
          <Package className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <h1 className="text-2xl font-bold mb-2">Product Not Found</h1>
          <p className="text-muted-foreground mb-6">The product you're looking for doesn't exist.</p>
          <Button onClick={handleBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Products
          </Button>
        </div>
      </div>
    );
  }

  const isInStock = product.inStock && product.stockQuantity > 0;
  const hasDiscount = product.originalPrice && parseFloat(product.originalPrice) > parseFloat(product.price);
  const discountPercent = hasDiscount 
    ? Math.round(((parseFloat(product.originalPrice!) - parseFloat(product.price)) / parseFloat(product.originalPrice!)) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-6xl mx-auto">
        {/* Back Button */}
        <Button 
          variant="ghost" 
          onClick={handleBack}
          className="mb-6 hover:bg-muted"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Products
        </Button>

        {/* Product Header */}
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          {/* Product Image */}
          <div className="bg-muted/20 rounded-lg p-8 flex items-center justify-center border border-border">
            {product.imageUrl ? (
              <img 
                src={product.imageUrl} 
                alt={product.name}
                className="max-w-full h-auto rounded-lg object-cover"
                style={{ maxHeight: '400px' }}
              />
            ) : (
              <Package className="w-32 h-32 text-muted-foreground" />
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <div className="flex items-start justify-between mb-2">
                <div className="flex flex-wrap gap-2">
                  <Badge variant="default">{product.category}</Badge>
                  <Badge variant="outline">{product.game}</Badge>
                  {hasDiscount && (
                    <Badge className="bg-purple-600 text-white">
                      -{discountPercent}% OFF
                    </Badge>
                  )}
                </div>
                <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs ${
                  isInStock ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
                }`}>
                  {isInStock ? (
                    <>
                      <Check className="w-3 h-3" />
                      <span>{product.stockQuantity > 1 ? `${product.stockQuantity} In Stock` : 'In Stock'}</span>
                    </>
                  ) : (
                    <>
                      <X className="w-3 h-3" />
                      <span>Out of Stock</span>
                    </>
                  )}
                </div>
              </div>

              <h1 className="text-3xl font-bold mb-4">{product.name}</h1>

              {/* Rating */}
              {((product.averageRating ?? 0) > 0 && (product.reviewCount ?? 0) > 0) && (
                <div className="flex items-center space-x-2 mb-4">
                  <div className="flex items-center">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-5 h-5 ${
                          star <= (product.averageRating || 0)
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-lg font-medium">{product.averageRating?.toFixed(1)}</span>
                  <span className="text-muted-foreground">({product.reviewCount} reviews)</span>
                </div>
              )}

              {/* Price */}
              <div className="flex items-baseline space-x-2 mb-6">
                <span className="text-3xl font-bold text-primary">
                  ${product.price}
                </span>
                {hasDiscount && (
                  <span className="text-xl text-muted-foreground line-through">
                    ${product.originalPrice}
                  </span>
                )}
              </div>

              <p className="text-muted-foreground mb-6 leading-relaxed">
                {product.description}
              </p>
            </div>

            {/* Purchase Button */}
            <div className="space-y-3">
              <Button
                size="lg"
                className={`w-full ${
                  isInStock
                    ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                    : 'bg-muted text-muted-foreground cursor-not-allowed'
                }`}
                disabled={!isInStock}
                onClick={handleCheckout}
              >
                <ShoppingCart className="w-5 h-5 mr-2" />
                {isInStock ? `Buy Now - $${product.price}` : 'Out of Stock'}
              </Button>

              {/* Delivery Info */}
              <div className="text-sm text-muted-foreground space-y-1">
                <div className="flex items-center justify-between">
                  <span>Delivery Type:</span>
                  <span className="capitalize">{product.deliveryType}</span>
                </div>
                {product.deliveryType === 'download' && (
                  <div className="flex items-center justify-between">
                    <span>Instant Download:</span>
                    <span className="text-green-600">Available after purchase</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <Separator className="my-8" />

        {/* Product Reviews */}
        <div className="mb-8">
          <ProductReviews 
            productId={product.id} 
            currentUserId={user?.id}
            onReviewAdded={() => {
              // Refresh product data to update rating
              window.location.reload();
            }}
          />
        </div>
      </div>
    </div>
  );
}