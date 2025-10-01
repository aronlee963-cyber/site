import React, { useState } from "react";
import Header from "@/components/header";
import ProductRecommendations, { RecentlyViewed } from "@/components/product-recommendations";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, Clock, Users, Zap, CheckCircle, Star } from "lucide-react";
const logoImage = "https://i.postimg.cc/0j1BFrgF/Untitled-3.png";

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="falling-dots"></div>
      <Header searchQuery={searchQuery} onSearchChange={setSearchQuery} />
      
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-bold text-foreground mb-6" data-testid="text-page-title">
            Welcome to <span className="text-primary">PlayDirty</span>
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 leading-relaxed">
            Your most trusted source for premium gaming enhancement tools and solutions. 
            Experience the difference with our industry-leading cheats, spoofers, and gaming accounts.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <Button size="lg" className="text-lg px-8 py-3" onClick={() => window.location.href = '/products'}>
              Browse Products
            </Button>
            <Button variant="outline" size="lg" className="text-lg px-8 py-3" onClick={() => window.location.href = 'https://discord.com/invite/playdirty'}>
              Contact Support
            </Button>
          </div>
          
          {/* Trust Indicators */}
          <div className="flex flex-wrap justify-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-green-500" />
              <span>Secure & Safe</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-500" />
              <span>24/7 Support</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-purple-500" />
              <span>100+ Satisfied Customers</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-yellow-500" />
              <span>Instant Delivery</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recently Viewed Products */}
      <RecentlyViewed className="container mx-auto px-4" limit={6} />

      {/* Popular Products */}
      <div className="container mx-auto px-4 py-8">
        <ProductRecommendations 
          variant="trending" 
          limit={8} 
          title="Trending Products"
          className="mb-8"
        />
      </div>

      {/* Why Choose PlayDirty */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Why Choose PlayDirty?
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            We've been setting the standard in the gaming enhancement industry for years. 
            Here's what makes us the best choice for serious gamers.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <Card className="bg-card border-border">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <Shield className="w-8 h-8 text-green-500" />
                <CardTitle className="text-xl">Premium Quality</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Our cheats and tools are developed by industry experts using the latest techniques. 
                Each product undergoes rigorous testing to ensure reliability and performance.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <Clock className="w-8 h-8 text-blue-500" />
                <CardTitle className="text-xl">24/7 Expert Support</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Our dedicated support team is available around the clock to help you with any questions, 
                installation issues, or technical problems. Real humans, real solutions.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <Zap className="w-8 h-8 text-yellow-500" />
                <CardTitle className="text-xl">Instant Delivery</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Get immediate access to your purchased products through our automated delivery system. 
                No waiting, no delays - start enhancing your gameplay right away.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <Users className="w-8 h-8 text-purple-500" />
                <CardTitle className="text-xl">Trusted Community</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Join hundreds of satisfied customers who trust PlayDirty for their gaming needs. 
                Our reputation speaks for itself in the gaming community.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <CheckCircle className="w-8 h-8 text-green-500" />
                <CardTitle className="text-xl">Regular Updates</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Stay ahead of the game with frequent updates and patches. Our team continuously 
                monitors game changes to keep our products working flawlessly.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <Star className="w-8 h-8 text-yellow-500" />
                <CardTitle className="text-xl">Competitive Pricing</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Get the best value for your money with our competitive pricing and flexible duration options. 
                Premium quality doesn't have to break the bank.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Product Categories */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Our Product Range
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            From advanced game cheats to hardware spoofers and premium accounts, 
            we have everything you need to dominate your favorite games.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-card border border-border rounded-lg p-6 text-center hover:border-primary transition-colors">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Zap className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">Game Cheats</h3>
            <p className="text-muted-foreground">
              Premium enhancement tools for popular games like Rust, Apex Legends, and more.
            </p>
          </div>

          <div className="bg-card border border-border rounded-lg p-6 text-center hover:border-primary transition-colors">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">Spoofers</h3>
            <p className="text-muted-foreground">
              Advanced hardware ID spoofers for both temporary and permanent protection.
            </p>
          </div>

          <div className="bg-card border border-border rounded-lg p-6 text-center hover:border-primary transition-colors">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">Game Accounts</h3>
            <p className="text-muted-foreground">
              High-quality gaming accounts with various playtime and feature options.
            </p>
          </div>

          <div className="bg-card border border-border rounded-lg p-6 text-center hover:border-primary transition-colors">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">DMA Hardware</h3>
            <p className="text-muted-foreground">
              Professional DMA firmware and bundles for advanced users and developers.
            </p>
          </div>
        </div>
      </div>

      {/* Support CTA */}
      <div className="container mx-auto px-4 py-16">
        <div className="bg-card border border-border rounded-lg p-8 md:p-12 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Need Help? We're Here 24/7
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              Our experienced support team is always ready to assist you with product selection, 
              installation guidance, troubleshooting, or any other questions you might have. 
              No matter what time zone you're in, we've got you covered.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="text-lg px-8 py-3" onClick={() => window.location.href = 'https://discord.com/invite/playdirty'}>
                Contact Support Now
              </Button>
              <Button variant="outline" size="lg" className="text-lg px-8 py-3">
                View FAQ
              </Button>
            </div>
            <div className="flex flex-wrap justify-center gap-6 mt-8 text-sm text-muted-foreground">
              <Badge variant="secondary" className="px-3 py-1">
                <Clock className="w-4 h-4 mr-1" />
                Average Response: 30 minutes
              </Badge>
              <Badge variant="secondary" className="px-3 py-1">
                <Users className="w-4 h-4 mr-1" />
                Expert Support Staff
              </Badge>
              <Badge variant="secondary" className="px-3 py-1">
                <CheckCircle className="w-4 h-4 mr-1" />
                Multiple Support Channels
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-card border-t border-border mt-16">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="text-2xl font-bold text-primary flex items-center mb-4">
                <img src={logoImage} alt="PlayDirty" className="w-8 h-8 mr-2" />
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
