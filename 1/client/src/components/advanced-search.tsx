import React, { useState, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Search, Filter, X, ChevronDown, SlidersHorizontal } from "lucide-react";
import { Product } from "@shared/schema";

interface AdvancedSearchProps {
  onResults: (products: Product[]) => void;
  className?: string;
}

interface SearchFilters {
  categories: string[];
  games: string[];
  priceRange: { min: number; max: number };
  inStock?: boolean;
  sortBy: 'price' | 'rating' | 'newest';
  sortOrder: 'asc' | 'desc';
}

const CATEGORIES = [
  'Cheats', 'DMA Hardware', 'Spoofer', 'External Tools', 'Private Tools'
];

const GAMES = [
  'Apex Legends', 'Fortnite', 'Rust', 'Call of Duty', 'PUBG', 'Counter-Strike', 'Valorant'
];

export default function AdvancedSearch({ onResults, className = "" }: AdvancedSearchProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({
    categories: [],
    games: [],
    priceRange: { min: 0, max: 500 },
    inStock: undefined,
    sortBy: 'newest',
    sortOrder: 'desc'
  });

  // Get all products to determine actual price range
  const { data: allProducts = [] } = useQuery<Product[]>({
    queryKey: ['/api/products'],
  });

  const maxPrice = useMemo(() => {
    if (allProducts.length === 0) return 500;
    return Math.max(...allProducts.map(p => parseFloat(p.price)));
  }, [allProducts]);

  // Debounced search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery || filters.categories.length > 0 || filters.games.length > 0 || filters.inStock !== undefined) {
        handleSearch();
      } else {
        onResults(allProducts);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, filters, allProducts]);

  const handleSearch = async () => {
    setIsSearching(true);
    try {
      const response = await fetch('/api/products/search/advanced', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: searchQuery,
          filters: {
            categories: filters.categories.length > 0 ? filters.categories : undefined,
            games: filters.games.length > 0 ? filters.games : undefined,
            priceRange: filters.priceRange.min > 0 || filters.priceRange.max < maxPrice ? filters.priceRange : undefined,
            inStock: filters.inStock,
            sortBy: filters.sortBy,
            sortOrder: filters.sortOrder
          }
        })
      });

      if (!response.ok) {
        throw new Error('Search failed');
      }

      const results = await response.json();
      onResults(results);
    } catch (error) {
      console.error('Search error:', error);
      onResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const updateFilter = (key: keyof SearchFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const toggleCategory = (category: string) => {
    const newCategories = filters.categories.includes(category)
      ? filters.categories.filter(c => c !== category)
      : [...filters.categories, category];
    updateFilter('categories', newCategories);
  };

  const toggleGame = (game: string) => {
    const newGames = filters.games.includes(game)
      ? filters.games.filter(g => g !== game)
      : [...filters.games, game];
    updateFilter('games', newGames);
  };

  const clearFilters = () => {
    setFilters({
      categories: [],
      games: [],
      priceRange: { min: 0, max: maxPrice },
      inStock: undefined,
      sortBy: 'newest',
      sortOrder: 'desc'
    });
  };

  const hasActiveFilters = filters.categories.length > 0 || 
                          filters.games.length > 0 || 
                          filters.priceRange.min > 0 || 
                          filters.priceRange.max < maxPrice ||
                          filters.inStock !== undefined;

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Main Search Bar */}
      <div className="relative">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Input
              type="text"
              placeholder="Search products, games, categories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-input text-foreground border border-border focus:border-primary search-glow transition-all duration-300"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            {isSearching && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
              </div>
            )}
          </div>
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className={`px-4 ${hasActiveFilters ? 'border-primary bg-primary/10' : ''}`}
          >
            <SlidersHorizontal className="w-4 h-4 mr-2" />
            Filters
            {hasActiveFilters && (
              <Badge variant="secondary" className="ml-2 px-1 py-0 text-xs">
                {filters.categories.length + filters.games.length + (filters.inStock !== undefined ? 1 : 0)}
              </Badge>
            )}
          </Button>
        </div>
      </div>

      {/* Advanced Filters */}
      <Collapsible open={showFilters} onOpenChange={setShowFilters}>
        <CollapsibleContent>
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center justify-between text-lg">
                <span>Advanced Filters</span>
                <Button variant="ghost" size="sm" onClick={clearFilters} disabled={!hasActiveFilters}>
                  <X className="w-4 h-4 mr-1" />
                  Clear All
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Sorting */}
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="text-sm font-medium mb-2 block">Sort By</label>
                  <Select value={filters.sortBy} onValueChange={(value: any) => updateFilter('sortBy', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="newest">Newest</SelectItem>
                      <SelectItem value="price">Price</SelectItem>
                      <SelectItem value="rating">Rating</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex-1">
                  <label className="text-sm font-medium mb-2 block">Order</label>
                  <Select value={filters.sortOrder} onValueChange={(value: any) => updateFilter('sortOrder', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="desc">High to Low</SelectItem>
                      <SelectItem value="asc">Low to High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Price Range */}
              <div>
                <label className="text-sm font-medium mb-4 block">
                  Price Range: ${filters.priceRange.min} - ${filters.priceRange.max}
                </label>
                <Slider
                  min={0}
                  max={maxPrice}
                  step={10}
                  value={[filters.priceRange.min, filters.priceRange.max]}
                  onValueChange={([min, max]) => updateFilter('priceRange', { min, max })}
                  className="w-full"
                />
              </div>

              {/* Stock Status */}
              <div>
                <label className="text-sm font-medium mb-3 block">Stock Status</label>
                <div className="flex gap-4">
                  <Button
                    variant={filters.inStock === true ? "default" : "outline"}
                    size="sm"
                    onClick={() => updateFilter('inStock', filters.inStock === true ? undefined : true)}
                  >
                    In Stock Only
                  </Button>
                  <Button
                    variant={filters.inStock === false ? "default" : "outline"}
                    size="sm"
                    onClick={() => updateFilter('inStock', filters.inStock === false ? undefined : false)}
                  >
                    Out of Stock
                  </Button>
                </div>
              </div>

              {/* Categories */}
              <div>
                <label className="text-sm font-medium mb-3 block">Categories</label>
                <div className="flex flex-wrap gap-2">
                  {CATEGORIES.map(category => (
                    <Button
                      key={category}
                      variant={filters.categories.includes(category) ? "default" : "outline"}
                      size="sm"
                      onClick={() => toggleCategory(category)}
                      className="text-xs"
                    >
                      {category}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Games */}
              <div>
                <label className="text-sm font-medium mb-3 block">Games</label>
                <div className="flex flex-wrap gap-2">
                  {GAMES.map(game => (
                    <Button
                      key={game}
                      variant={filters.games.includes(game) ? "default" : "outline"}
                      size="sm"
                      onClick={() => toggleGame(game)}
                      className="text-xs"
                    >
                      {game}
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </CollapsibleContent>
      </Collapsible>

      {/* Active Filter Tags */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2">
          {filters.categories.map(category => (
            <Badge key={`cat-${category}`} variant="secondary" className="px-2 py-1">
              {category}
              <button
                onClick={() => toggleCategory(category)}
                className="ml-2 hover:text-destructive"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          ))}
          {filters.games.map(game => (
            <Badge key={`game-${game}`} variant="secondary" className="px-2 py-1">
              {game}
              <button
                onClick={() => toggleGame(game)}
                className="ml-2 hover:text-destructive"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          ))}
          {filters.inStock !== undefined && (
            <Badge variant="secondary" className="px-2 py-1">
              {filters.inStock ? 'In Stock' : 'Out of Stock'}
              <button
                onClick={() => updateFilter('inStock', undefined)}
                className="ml-2 hover:text-destructive"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}