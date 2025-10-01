import React, { useState } from "react";
import Header from "@/components/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Clock, Users, Zap, Heart, Target, Award } from "lucide-react";

export default function About() {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="falling-dots"></div>
      <Header searchQuery={searchQuery} onSearchChange={setSearchQuery} />
      
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-bold text-foreground mb-6" data-testid="text-page-title">
            About <span className="text-primary">Us</span>
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 leading-relaxed">
            PlayDirty is your premier destination for cutting-edge gaming enhancement tools and solutions. 
            We're passionate about providing gamers with the competitive edge they need to dominate their favorite games.
          </p>
        </div>
      </div>

      {/* Our Story Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-8 text-center">
            Our Story
          </h2>
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <Card className="border border-border bg-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-6 h-6 text-primary" />
                  Our Mission
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  To provide gamers worldwide with premium, reliable, and secure gaming enhancement tools 
                  that elevate their gaming experience while maintaining the highest standards of quality and safety.
                </p>
              </CardContent>
            </Card>

            <Card className="border border-border bg-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="w-6 h-6 text-primary" />
                  Our Values
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  We believe in transparency, quality, and putting our customers first. Every product we offer 
                  is thoroughly tested and backed by our commitment to excellence and customer satisfaction.
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="text-center mb-12">
            <p className="text-lg text-muted-foreground leading-relaxed">
              Founded by gaming enthusiasts, PlayDirty emerged from a simple idea: to create a trusted platform 
              where gamers could access premium enhancement tools without compromising on security or quality. 
              What started as a small community project has grown into a leading provider of gaming solutions, 
              serving thousands of satisfied customers worldwide.
            </p>
          </div>
        </div>
      </div>

      {/* What Sets Us Apart */}
      <div className="container mx-auto px-4 py-16 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-12 text-center">
            What Sets <span className="text-primary">Us</span> Apart
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border border-border bg-card text-center">
              <CardHeader>
                <Shield className="w-12 h-12 text-green-500 mx-auto mb-4" />
                <CardTitle>Security First</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  All our products undergo rigorous security testing. We prioritize your safety and privacy 
                  with industry-leading encryption and secure delivery methods.
                </p>
              </CardContent>
            </Card>

            <Card className="border border-border bg-card text-center">
              <CardHeader>
                <Clock className="w-12 h-12 text-blue-500 mx-auto mb-4" />
                <CardTitle>24/7 Support</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Our dedicated support team is always ready to help. Whether you need installation assistance 
                  or have questions about our products, we're here for you.
                </p>
              </CardContent>
            </Card>

            <Card className="border border-border bg-card text-center">
              <CardHeader>
                <Award className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
                <CardTitle>Premium Quality</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  We work with the best developers in the industry to ensure our products are reliable, 
                  feature-rich, and regularly updated to maintain compatibility.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Trust Indicators */}
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-8">
            Trusted by Gamers Worldwide
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <Users className="w-12 h-12 text-purple-500 mx-auto mb-4" />
              <div className="text-3xl font-bold text-foreground">100+</div>
              <div className="text-muted-foreground">Happy Customers</div>
            </div>
            <div className="text-center">
              <Zap className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
              <div className="text-3xl font-bold text-foreground">99.9%</div>
              <div className="text-muted-foreground">Uptime</div>
            </div>
            <div className="text-center">
              <Shield className="w-12 h-12 text-green-500 mx-auto mb-4" />
              <div className="text-3xl font-bold text-foreground">100%</div>
              <div className="text-muted-foreground">Secure</div>
            </div>
            <div className="text-center">
              <Clock className="w-12 h-12 text-blue-500 mx-auto mb-4" />
              <div className="text-3xl font-bold text-foreground">&lt;2hrs</div>
              <div className="text-muted-foreground">Support Response</div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-border bg-muted/30 py-8">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <span className="text-muted-foreground text-sm">Powered by SellAuth</span>
              <div className="flex items-center space-x-2">
                <span className="text-green-500">🛡️</span>
                <span className="text-sm text-muted-foreground">Secure Payments</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}