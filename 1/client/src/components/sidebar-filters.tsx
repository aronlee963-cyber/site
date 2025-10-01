import { Filter, ChevronDown } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";

export interface FilterState {
  categories: string[];
  games: string[];
  priceRange: string;
  showInStock: boolean;
  showOutOfStock: boolean;
}

interface DropdownFiltersProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
}

export default function DropdownFilters({ filters, onFiltersChange }: DropdownFiltersProps) {
  const handleCategoryChange = (category: string, checked: boolean) => {
    const newCategories = checked
      ? [...filters.categories, category]
      : filters.categories.filter(c => c !== category);
    
    onFiltersChange({
      ...filters,
      categories: newCategories
    });
  };

  const handleGameChange = (game: string, checked: boolean) => {
    const newGames = checked
      ? [...filters.games, game]
      : filters.games.filter(g => g !== game);
    
    onFiltersChange({
      ...filters,
      games: newGames
    });
  };

  const handlePriceRangeChange = (value: string) => {
    onFiltersChange({
      ...filters,
      priceRange: value
    });
  };

  const handleStockChange = (type: 'inStock' | 'outOfStock', checked: boolean) => {
    onFiltersChange({
      ...filters,
      [type === 'inStock' ? 'showInStock' : 'showOutOfStock']: checked
    });
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button 
          variant="outline" 
          className="min-w-32 justify-between neon-border"
          data-testid="button-filters"
        >
          <Filter className="w-4 h-4 mr-2 text-primary" />
          Filters
          <ChevronDown className="w-4 h-4 ml-2" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-6 bg-card border-border neon-border" align="start">
        <h3 className="text-lg font-semibold text-foreground mb-4" data-testid="text-filters-title">
          <Filter className="inline mr-2 text-primary w-5 h-5" />
          Filters
        </h3>
        
        {/* Categories */}
        <div className="mb-6">
          <h4 className="text-sm font-medium text-muted-foreground mb-3">Categories</h4>
          <div className="space-y-2">
            {["Game Cheats", "Spoofers", "Game Accounts", "Unlock Tools"].map((category) => (
              <div key={category} className="flex items-center space-x-2">
                <Checkbox
                  id={`category-${category}`}
                  checked={filters.categories.includes(category)}
                  onCheckedChange={(checked) => handleCategoryChange(category, checked as boolean)}
                  data-testid={`checkbox-category-${category.toLowerCase().replace(/\s+/g, '-')}`}
                />
                <Label htmlFor={`category-${category}`} className="text-sm">
                  {category}
                </Label>
              </div>
            ))}
          </div>
        </div>

        <Separator className="my-4" />

        {/* Games */}
        <div className="mb-6">
          <h4 className="text-sm font-medium text-muted-foreground mb-3">Games</h4>
          <div className="space-y-2">
            {["Fortnite", "CS2", "Valorant", "Rust", "R6 Siege", "Call of Duty", "Multi-Game"].map((game) => (
              <div key={game} className="flex items-center space-x-2">
                <Checkbox
                  id={`game-${game}`}
                  checked={filters.games.includes(game)}
                  onCheckedChange={(checked) => handleGameChange(game, checked as boolean)}
                  data-testid={`checkbox-game-${game.toLowerCase().replace(/\s+/g, '-')}`}
                />
                <Label htmlFor={`game-${game}`} className="text-sm">
                  {game}
                </Label>
              </div>
            ))}
          </div>
        </div>

        <Separator className="my-4" />

        {/* Price Range */}
        <div className="mb-6">
          <h4 className="text-sm font-medium text-muted-foreground mb-3">Price Range</h4>
          <RadioGroup value={filters.priceRange} onValueChange={handlePriceRangeChange}>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="all" id="price-all" data-testid="radio-price-all" />
              <Label htmlFor="price-all" className="text-sm">All Prices</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="under-10" id="price-under-10" data-testid="radio-price-under-10" />
              <Label htmlFor="price-under-10" className="text-sm">Under $10</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="10-50" id="price-10-50" data-testid="radio-price-10-50" />
              <Label htmlFor="price-10-50" className="text-sm">$10 - $50</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="50-plus" id="price-50-plus" data-testid="radio-price-50-plus" />
              <Label htmlFor="price-50-plus" className="text-sm">$50+</Label>
            </div>
          </RadioGroup>
        </div>

        <Separator className="my-4" />

        {/* Stock Status */}
        <div>
          <h4 className="text-sm font-medium text-muted-foreground mb-3">Availability</h4>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="stock-in"
                checked={filters.showInStock}
                onCheckedChange={(checked) => handleStockChange('inStock', checked as boolean)}
                data-testid="checkbox-stock-in"
              />
              <Label htmlFor="stock-in" className="text-sm">In Stock</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="stock-out"
                checked={filters.showOutOfStock}
                onCheckedChange={(checked) => handleStockChange('outOfStock', checked as boolean)}
                data-testid="checkbox-stock-out"
              />
              <Label htmlFor="stock-out" className="text-sm">Out of Stock</Label>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
