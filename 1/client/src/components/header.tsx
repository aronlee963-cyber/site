import { useState } from "react";
import { Search, Menu, User, LogOut } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
const logoImage = "https://i.postimg.cc/0j1BFrgF/Untitled-3.png";

interface HeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export default function Header({ searchQuery, onSearchChange }: HeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, logoutMutation } = useAuth();
  const [location] = useLocation();
  const isProductsPage = location === "/products";

  const handleLogout = () => {
    logoutMutation.mutate();
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 bg-card border-b border-border backdrop-blur-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo and Branding */}
          <div className="flex items-center space-x-4">
            <div className="text-2xl font-bold text-primary flex items-center" data-testid="brand-logo">
              <img src={logoImage} alt="PlayDirty" className="w-8 h-8 mr-2" />
              PlayDirty
            </div>
          </div>

          {/* Search Bar - Desktop */}
          {isProductsPage && (
            <div className="hidden md:flex flex-1 max-w-md mx-8">
              <div className="relative w-full">
                <Input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                  className="w-full bg-input text-foreground px-4 py-2 pl-10 rounded-lg border border-border focus:border-primary focus:outline-none search-glow transition-all duration-300"
                  data-testid="input-search-desktop"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              </div>
            </div>
          )}

          {/* Navigation Links - Desktop */}
          <nav className="hidden lg:flex items-center space-x-6">
            <a href="/" className="text-foreground hover:text-primary transition-colors" data-testid="link-home">
              Home
            </a>
            <a href="/products" className="text-foreground hover:text-primary transition-colors" data-testid="link-products">
              Products
            </a>
            <a href="/support" className="text-foreground hover:text-primary transition-colors" data-testid="link-support">
              Support
            </a>
            <a href="/about" className="text-foreground hover:text-primary transition-colors" data-testid="link-about">
              About
            </a>
            
            {/* Authentication Links */}
            {user ? (
              <div className="flex items-center space-x-4">
                <a href="/dashboard" className="text-foreground hover:text-primary transition-colors border border-primary/20 px-3 py-1 rounded flex items-center" data-testid="link-dashboard">
                  <User className="w-4 h-4 mr-1" />
                  {user.username}
                </a>
                <a href="/profile" className="text-foreground hover:text-primary transition-colors px-3 py-1 rounded flex items-center" data-testid="link-profile">
                  Profile
                </a>
                <Button
                  onClick={handleLogout}
                  variant="ghost"
                  size="sm"
                  className="text-foreground hover:text-primary"
                  disabled={logoutMutation.isPending}
                  data-testid="button-logout"
                >
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <a href="/auth" className="text-foreground hover:text-primary transition-colors border border-primary/20 px-3 py-1 rounded" data-testid="link-auth">
                Sign In
              </a>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden" data-testid="button-mobile-menu">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-64">
              <nav className="flex flex-col space-y-4 mt-8">
                <a href="/" className="text-foreground hover:text-primary transition-colors" data-testid="link-mobile-home" onClick={() => setIsMobileMenuOpen(false)}>
                  Home
                </a>
                <a href="/products" className="text-foreground hover:text-primary transition-colors" data-testid="link-mobile-products" onClick={() => setIsMobileMenuOpen(false)}>
                  Products
                </a>
                <a href="/support" className="text-foreground hover:text-primary transition-colors" data-testid="link-mobile-support" onClick={() => setIsMobileMenuOpen(false)}>
                  Support
                </a>
                <a href="/about" className="text-foreground hover:text-primary transition-colors" data-testid="link-mobile-about" onClick={() => setIsMobileMenuOpen(false)}>
                  About
                </a>
                
                {/* Mobile Authentication Links */}
                {user ? (
                  <>
                    <a href="/dashboard" className="text-foreground hover:text-primary transition-colors border border-primary/20 px-3 py-1 rounded flex items-center" data-testid="link-mobile-dashboard" onClick={() => setIsMobileMenuOpen(false)}>
                      <User className="w-4 h-4 mr-2" />
                      {user.username}
                    </a>
                    <a href="/profile" className="text-foreground hover:text-primary transition-colors px-3 py-1 rounded flex items-center" data-testid="link-mobile-profile" onClick={() => setIsMobileMenuOpen(false)}>
                      Profile
                    </a>
                    <Button
                      onClick={handleLogout}
                      variant="ghost"
                      className="text-foreground hover:text-primary justify-start px-0"
                      disabled={logoutMutation.isPending}
                      data-testid="button-mobile-logout"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      {logoutMutation.isPending ? "Logging out..." : "Logout"}
                    </Button>
                  </>
                ) : (
                  <a href="/auth" className="text-foreground hover:text-primary transition-colors border border-primary/20 px-3 py-1 rounded" data-testid="link-mobile-auth" onClick={() => setIsMobileMenuOpen(false)}>
                    Sign In
                  </a>
                )}
              </nav>
            </SheetContent>
          </Sheet>
        </div>

        {/* Mobile Search */}
        {isProductsPage && (
          <div className="md:hidden mt-4">
            <div className="relative">
              <Input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full bg-input text-foreground px-4 py-2 pl-10 rounded-lg border border-border focus:border-primary focus:outline-none"
                data-testid="input-search-mobile"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            </div>
          </div>
        )}
      </div>
    </header>
  );
}