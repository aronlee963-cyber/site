import React, { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Product, ProductGroup } from "@shared/schema";
import Header from "@/components/header";
import DropdownFilters, { FilterState } from "@/components/sidebar-filters";
import ProductCard from "@/components/product-card";
import ProductGroupCard from "@/components/product-group-card";
import AdvancedSearch from "@/components/advanced-search";
import ProductRecommendations, { RecentlyViewed } from "@/components/product-recommendations";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Grid, List, Sparkles } from "lucide-react";

export default function Products() {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [viewMode, setViewMode] = useState<"groups" | "individual">("groups");
  const [useAdvancedSearch, setUseAdvancedSearch] = useState(false);
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [filters, setFilters] = useState<FilterState>({
    categories: [],
    games: [],
    priceRange: "all",
    showInStock: true,
    showOutOfStock: true
  });

  const { data: products = [], isLoading, error } = useQuery<Product[]>({
    queryKey: ['/api/products'],
  });

  const { data: productGroups = [], isLoading: isLoadingGroups } = useQuery<ProductGroup[]>({
    queryKey: ['/api/product-groups'],
  });

  // Handle search results from advanced search component
  const handleSearchResults = (results: Product[]) => {
    setSearchResults(results);
    setUseAdvancedSearch(true);
  };

  const filteredAndSortedProducts = useMemo(() => {
    // Use advanced search results if available, otherwise fallback to legacy filtering
    if (useAdvancedSearch) {
      return searchResults;
    }

    let filtered = products;

    // Legacy search filter (for backward compatibility)
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(query) ||
        product.description.toLowerCase().includes(query) ||
        product.game.toLowerCase().includes(query) ||
        product.category.toLowerCase().includes(query)
      );
    }

    // Category filter
    if (filters.categories.length > 0) {
      filtered = filtered.filter(product => filters.categories.includes(product.category));
    }

    // Game filter
    if (filters.games.length > 0) {
      filtered = filtered.filter(product => filters.games.includes(product.game));
    }

    // Price range filter
    if (filters.priceRange !== "all") {
      filtered = filtered.filter(product => {
        const price = parseFloat(product.price);
        switch (filters.priceRange) {
          case "under-10": return price < 10;
          case "10-50": return price >= 10 && price <= 50;
          case "50-plus": return price > 50;
          default: return true;
        }
      });
    }

    // Stock filter
    if (!filters.showInStock || !filters.showOutOfStock) {
      filtered = filtered.filter(product => {
        if (filters.showInStock && !filters.showOutOfStock) {
          return product.inStock && product.stockQuantity > 0;
        }
        if (!filters.showInStock && filters.showOutOfStock) {
          return !product.inStock || product.stockQuantity === 0;
        }
        return true;
      });
    }

    // Sort (only for legacy mode)
    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case "price-low":
          return parseFloat(a.price) - parseFloat(b.price);
        case "price-high":
          return parseFloat(b.price) - parseFloat(a.price);
        case "popular":
          // Sort by stock quantity (higher = more popular)
          return b.stockQuantity - a.stockQuantity;
        case "newest":
          // Sort alphabetically as we don't have creation dates
          return a.name.localeCompare(b.name);
        default:
          return a.name.localeCompare(b.name);
      }
    });

    return sorted;
  }, [products, searchQuery, filters, sortBy, useAdvancedSearch, searchResults]);

  const filteredAndSortedGroups = useMemo(() => {
    let filtered = productGroups;

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(group =>
        group.name.toLowerCase().includes(query) ||
        group.description.toLowerCase().includes(query) ||
        group.game.toLowerCase().includes(query) ||
        group.category.toLowerCase().includes(query)
      );
    }

    // Category filter
    if (filters.categories.length > 0) {
      filtered = filtered.filter(group => filters.categories.includes(group.category));
    }

    // Game filter
    if (filters.games.length > 0) {
      filtered = filtered.filter(group => filters.games.includes(group.game));
    }

    // Price range filter
    if (filters.priceRange !== "all") {
      filtered = filtered.filter(group => {
        return group.variants.some(variant => {
          const price = parseFloat(variant.price);
          switch (filters.priceRange) {
            case "under-10": return price < 10;
            case "10-50": return price >= 10 && price <= 50;
            case "50-plus": return price > 50;
            default: return true;
          }
        });
      });
    }

    // Stock filter
    if (!filters.showInStock || !filters.showOutOfStock) {
      filtered = filtered.filter(group => {
        return group.variants.some(variant => {
          if (filters.showInStock && !filters.showOutOfStock) {
            return variant.inStock && variant.stockQuantity > 0;
          }
          if (!filters.showInStock && filters.showOutOfStock) {
            return !variant.inStock || variant.stockQuantity === 0;
          }
          return true;
        });
      });
    }

    // Sort groups by name
    const sorted = [...filtered].sort((a, b) => {
      return a.name.localeCompare(b.name);
    });

    return sorted;
  }, [productGroups, searchQuery, filters, sortBy]);

  if (error) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Header searchQuery={searchQuery} onSearchChange={setSearchQuery} />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-destructive mb-4">Error Loading Products</h1>
            <p className="text-muted-foreground">Failed to load products. Please try again later.</p>
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
        <main className="w-full">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
            <h1 className="text-3xl font-bold text-foreground mb-4 sm:mb-0" data-testid="text-page-title">
              Products
            </h1>
            
            <div className="flex items-center space-x-4">
              <Button
                variant={useAdvancedSearch ? "default" : "outline"}
                onClick={() => {
                  setUseAdvancedSearch(!useAdvancedSearch);
                  if (!useAdvancedSearch) {
                    // Reset to show all products when switching to advanced mode
                    setSearchResults([]);
                  }
                }}
                className="text-sm"
              >
                <Sparkles className="w-4 h-4 mr-1" />
                {useAdvancedSearch ? "Advanced Search" : "Enable Advanced"}
              </Button>
              
              <Button
                variant="outline"
                onClick={() => setViewMode(viewMode === "groups" ? "individual" : "groups")}
                className="text-sm"
              >
                {viewMode === "groups" ? <List className="w-4 h-4 mr-1" /> : <Grid className="w-4 h-4 mr-1" />}
                {viewMode === "groups" ? "Individual View" : "Group View"}
              </Button>
            </div>
          </div>

          {/* Advanced Search Component */}
          {useAdvancedSearch ? (
            <div className="mb-8">
              <AdvancedSearch onResults={handleSearchResults} />
            </div>
          ) : (
            <div className="flex items-center justify-between mb-6">
              <DropdownFilters filters={filters} onFiltersChange={setFilters} />
              <div className="flex items-center space-x-2">
                <span className="text-sm text-muted-foreground">Sort by:</span>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-48" data-testid="select-sort">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="name">Name</SelectItem>
                    <SelectItem value="price-low">Price: Low to High</SelectItem>
                    <SelectItem value="price-high">Price: High to Low</SelectItem>
                    <SelectItem value="popular">Most Popular</SelectItem>
                    <SelectItem value="newest">Newest</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {/* Recently Viewed Products */}
          <RecentlyViewed className="mb-8" limit={8} />

            {(isLoading || isLoadingGroups) ? (
              <div className="product-grid">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="bg-card rounded-lg border border-border overflow-hidden">
                    <Skeleton className="w-full h-48" />
                    <div className="p-6">
                      <Skeleton className="h-6 w-3/4 mb-2" />
                      <Skeleton className="h-4 w-full mb-4" />
                      <div className="flex justify-between items-center">
                        <Skeleton className="h-6 w-20" />
                        <Skeleton className="h-10 w-24" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : viewMode === "individual" ? (
              filteredAndSortedProducts.length === 0 ? (
                <div className="text-center py-12">
                  <h2 className="text-2xl font-bold text-muted-foreground mb-4">No Products Found</h2>
                  <p className="text-muted-foreground">
                    {searchQuery || filters.categories.length > 0 || filters.games.length > 0
                      ? "Try adjusting your search or filters"
                      : "No products available at the moment"}
                  </p>
                </div>
              ) : (
                <>
                  <div className="product-grid" data-testid="grid-products">
                    {filteredAndSortedProducts.map((product) => (
                      <ProductCard key={product.id} product={product} />
                    ))}
                  </div>
                  
                  <div className="text-center mt-12">
                    <span className="text-muted-foreground" data-testid="text-results-count">
                      Showing {filteredAndSortedProducts.length} product{filteredAndSortedProducts.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                </>
              )
            ) : (
              filteredAndSortedGroups.length === 0 ? (
                <div className="text-center py-12">
                  <h2 className="text-2xl font-bold text-muted-foreground mb-4">No Product Groups Found</h2>
                  <p className="text-muted-foreground">
                    {searchQuery || filters.categories.length > 0 || filters.games.length > 0
                      ? "Try adjusting your search or filters"
                      : "No product groups available at the moment"}
                  </p>
                </div>
              ) : (
                <>
                  <div className="product-grid" data-testid="grid-products">
                    {filteredAndSortedGroups.map((group) => (
                      <ProductGroupCard key={group.id} group={group} />
                    ))}
                  </div>
                  
                  <div className="text-center mt-12">
                    <span className="text-muted-foreground" data-testid="text-results-count">
                      Showing {filteredAndSortedGroups.length} product group{filteredAndSortedGroups.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                </>
              )
            )}
        </main>
      </div>

      {/* Footer */}
      <footer className="bg-card border-t border-border mt-16">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="text-2xl font-bold text-primary flex items-center mb-4">
                <img src="https://i.postimg.cc/0j1BFrgF/Untitled-3.png" alt="PlayDirty" className="w-6 h-6 mr-2" />
                PlayDirty
              </div>
              <p className="text-muted-foreground mb-4">
                Your trusted source for gaming enhancement tools and solutions. 
                Premium quality, secure delivery, and 24/7 support.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors" data-testid="link-discord">
                  Discord
                </a>
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors" data-testid="link-telegram">
                  Telegram
                </a>
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors" data-testid="link-twitter">
                  Twitter
                </a>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold text-foreground mb-4">Support</h4>
              <div className="space-y-2">
                <a href="#" className="block text-muted-foreground hover:text-primary transition-colors" data-testid="link-help">Help Center</a>
                <a href="#" className="block text-muted-foreground hover:text-primary transition-colors" data-testid="link-contact">Contact Us</a>
                <a href="#" className="block text-muted-foreground hover:text-primary transition-colors" data-testid="link-guide">Installation Guide</a>
                <a href="#" className="block text-muted-foreground hover:text-primary transition-colors" data-testid="link-faq">FAQ</a>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold text-foreground mb-4">Legal</h4>
              <div className="space-y-2">
                <a href="#" className="block text-muted-foreground hover:text-primary transition-colors" data-testid="link-terms">Terms of Service</a>
                <a href="#" className="block text-muted-foreground hover:text-primary transition-colors" data-testid="link-privacy">Privacy Policy</a>
                <a href="#" className="block text-muted-foreground hover:text-primary transition-colors" data-testid="link-refund">Refund Policy</a>
                <a href="#" className="block text-muted-foreground hover:text-primary transition-colors" data-testid="link-dmca">DMCA</a>
              </div>
            </div>
          </div>
          
          <div className="border-t border-border pt-8 mt-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-muted-foreground text-sm">
                © 2024 PlayDirty. All rights reserved.
              </p>
              <div className="flex items-center space-x-4 mt-4 md:mt-0">
                <span className="text-muted-foreground text-sm">Powered by SellAuth</span>
                <div className="flex items-center space-x-2">
                  <span className="text-green-500">🛡️</span>
                  <span className="text-sm text-muted-foreground">Secure Payments</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}