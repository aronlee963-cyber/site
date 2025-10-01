import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Header from "@/components/header";
import ProductCard from "@/components/product-card";
import ProductRecommendations from "@/components/product-recommendations";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Heart, ShoppingCart, Trash2, Star, Filter } from "lucide-react";
import { Product } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";

export default function Wishlist() {
  const [searchQuery, setSearchQuery] = useState("");
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Get user's wishlist
  const { data: wishlistProducts = [], isLoading, error } = useQuery<Product[]>({
    queryKey: ['/api/wishlist'],
    queryFn: async () => {
      const response = await fetch('/api/wishlist');
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Please log in to view your wishlist');
        }
        throw new Error('Failed to fetch wishlist');
      }
      return response.json();
    },
    enabled: !!user,
  });

  // Remove from wishlist mutation
  const removeFromWishlistMutation = useMutation({
    mutationFn: async (productId: string) => {
      const response = await fetch(`/api/wishlist/${productId}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      if (!response.ok) {
        throw new Error('Failed to remove from wishlist');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/wishlist'] });
    },
  });

  const filteredProducts = wishlistProducts.filter(product =>
    !searchQuery || 
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.game.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalValue = wishlistProducts.reduce((sum, product) => sum + parseFloat(product.price), 0);
  const inStockCount = wishlistProducts.filter(product => product.inStock && product.stockQuantity > 0).length;

  if (!user) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <div className="falling-dots"></div>
        <Header searchQuery={searchQuery} onSearchChange={setSearchQuery} />
        
        <div className="container mx-auto px-4 py-16">
          <div className="text-center max-w-md mx-auto">
            <Heart className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-foreground mb-4">
              Sign In Required
            </h1>
            <p className="text-muted-foreground mb-6">
              Please sign in to view and manage your wishlist
            </p>
            <Button onClick={() => setLocation('/login')} size="lg">
              Sign In
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="falling-dots"></div>
      <Header searchQuery={searchQuery} onSearchChange={setSearchQuery} />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
              My Wishlist
            </h1>
            <p className="text-muted-foreground">
              Keep track of products you're interested in
            </p>
          </div>
          
          {wishlistProducts.length > 0 && (
            <div className="flex flex-col sm:flex-row gap-4 mt-4 sm:mt-0">
              <Card className="px-4 py-2">
                <div className="flex items-center gap-2">
                  <Heart className="w-4 h-4 text-red-500" />
                  <span className="text-sm font-medium">{wishlistProducts.length} items</span>
                </div>
              </Card>
              <Card className="px-4 py-2">
                <div className="flex items-center gap-2">
                  <ShoppingCart className="w-4 h-4 text-green-500" />
                  <span className="text-sm font-medium">{inStockCount} in stock</span>
                </div>
              </Card>
              <Card className="px-4 py-2">
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-yellow-500" />
                  <span className="text-sm font-medium">${totalValue.toFixed(2)} total</span>
                </div>
              </Card>
            </div>
          )}
        </div>

        {/* Search and Filter */}
        {wishlistProducts.length > 0 && (
          <div className="mb-8">
            <div className="flex gap-4">
              <div className="relative flex-1 max-w-md">
                <input
                  type="text"
                  placeholder="Search your wishlist..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-2 pl-10 bg-input border border-border rounded-lg focus:border-primary focus:outline-none"
                />
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              </div>
            </div>
          </div>
        )}

        {/* Wishlist Content */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="p-4">
                  <Skeleton className="h-48 w-full mb-4" />
                  <Skeleton className="h-4 w-3/4 mb-2" />
                  <Skeleton className="h-6 w-1/2" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-destructive mb-4">Error Loading Wishlist</h2>
            <p className="text-muted-foreground mb-4">{(error as Error).message}</p>
            <Button onClick={() => window.location.reload()}>Try Again</Button>
          </div>
        ) : wishlistProducts.length === 0 ? (
          <div className="text-center py-16">
            <Heart className="w-24 h-24 text-muted-foreground mx-auto mb-6" />
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Your Wishlist is Empty
            </h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-md mx-auto">
              Start adding products you love to keep track of them and get notified of price changes.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" onClick={() => setLocation('/products')}>
                Browse Products
              </Button>
              <Button variant="outline" size="lg" onClick={() => setLocation('/')}>
                Back to Home
              </Button>
            </div>
          </div>
        ) : (
          <>
            {filteredProducts.length === 0 ? (
              <div className="text-center py-12">
                <h3 className="text-2xl font-semibold text-foreground mb-2">No Results Found</h3>
                <p className="text-muted-foreground mb-4">
                  No products match your search criteria.
                </p>
                <Button variant="outline" onClick={() => setSearchQuery("")}>
                  Clear Search
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredProducts.map((product) => (
                  <div key={product.id} className="relative group">
                    <ProductCard product={product} />
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => removeFromWishlistMutation.mutate(product.id)}
                      disabled={removeFromWishlistMutation.isPending}
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            <div className="text-center mt-8">
              <p className="text-muted-foreground">
                Showing {filteredProducts.length} of {wishlistProducts.length} products
              </p>
            </div>
          </>
        )}

        {/* Recommendations */}
        {wishlistProducts.length > 0 && (
          <div className="mt-16">
            <ProductRecommendations 
              variant="personalized" 
              limit={6} 
              title="You Might Also Like"
            />
          </div>
        )}
      </div>
    </div>
  );
}