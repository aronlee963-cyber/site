import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Product } from "@shared/schema";
import ProductCard from "@/components/product-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Star, TrendingUp, Eye, Zap } from "lucide-react";

interface ProductRecommendationsProps {
  userId?: string;
  productId?: string;
  limit?: number;
  title?: string;
  className?: string;
  variant?: 'similar' | 'personalized' | 'trending' | 'recently-viewed';
}

export default function ProductRecommendations({
  userId,
  productId,
  limit = 5,
  title,
  className = "",
  variant = 'similar'
}: ProductRecommendationsProps) {
  const { data: recommendations = [], isLoading, error } = useQuery<Product[]>({
    queryKey: ['/api/products/recommendations', userId, productId, limit],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (productId) params.append('productId', productId);
      if (limit) params.append('limit', limit.toString());

      const response = await fetch(`/api/products/recommendations?${params}`);
      if (!response.ok) {
        throw new Error('Failed to fetch recommendations');
      }
      return response.json();
    },
    enabled: true,
  });

  // Don't render if no recommendations
  if (!isLoading && recommendations.length === 0) {
    return null;
  }

  const getDefaultTitle = () => {
    switch (variant) {
      case 'similar':
        return productId ? 'Similar Products' : 'Recommended for You';
      case 'personalized':
        return 'Recommended for You';
      case 'trending':
        return 'Trending Now';
      case 'recently-viewed':
        return 'Recently Viewed';
      default:
        return 'You Might Also Like';
    }
  };

  const getIcon = () => {
    switch (variant) {
      case 'similar':
        return <Star className="w-5 h-5" />;
      case 'personalized':
        return <Zap className="w-5 h-5" />;
      case 'trending':
        return <TrendingUp className="w-5 h-5" />;
      case 'recently-viewed':
        return <Eye className="w-5 h-5" />;
      default:
        return <Star className="w-5 h-5" />;
    }
  };

  return (
    <div className={`w-full ${className}`}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            {getIcon()}
            {title || getDefaultTitle()}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
              {Array.from({ length: limit }).map((_, i) => (
                <div key={i} className="space-y-3">
                  <Skeleton className="h-48 w-full rounded-lg" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                  <Skeleton className="h-6 w-1/3" />
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="text-center text-muted-foreground py-8">
              <p>Unable to load recommendations</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
              {recommendations.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  className="h-full"
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Recently Viewed Products Component
interface RecentlyViewedProps {
  className?: string;
  limit?: number;
}

export function RecentlyViewed({ className = "", limit = 8 }: RecentlyViewedProps) {
  const { data: recentlyViewed = [], isLoading } = useQuery<Product[]>({
    queryKey: ['/api/recently-viewed'],
    queryFn: async () => {
      const response = await fetch('/api/recently-viewed', {
        credentials: 'include'
      });
      if (!response.ok) {
        // If user is not authenticated, return empty array
        if (response.status === 401) {
          return [];
        }
        throw new Error('Failed to fetch recently viewed');
      }
      return response.json();
    },
    retry: false,
    refetchOnWindowFocus: false,
  });

  // Don't render if no recently viewed products
  if (!isLoading && recentlyViewed.length === 0) {
    return null;
  }

  return (
    <div className={`w-full ${className}`}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <Eye className="w-5 h-5" />
            Recently Viewed
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
              {Array.from({ length: limit }).map((_, i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-32 w-full rounded-lg" />
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
              {recentlyViewed.slice(0, limit).map((product) => (
                <div key={product.id} className="group">
                  <ProductCard
                    product={product}
                    className="h-full scale-90 group-hover:scale-95 transition-transform duration-200"
                    compact={true}
                  />
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}