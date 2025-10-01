import { useState, useEffect } from "react";
import { useLocation, useRoute } from "wouter";
import { Product } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Copy, CheckCircle, Mail, User } from "lucide-react";

type PaymentMethod = 'bitcoin' | 'ethereum' | 'litecoin';

interface CryptoWallet {
  name: string;
  symbol: string;
  address: string;
  color: string;
}

const cryptoWallets: Record<PaymentMethod, CryptoWallet> = {
  bitcoin: {
    name: 'Bitcoin',
    symbol: 'BTC',
    address: 'bc1q23qag8hte7cgstjm2lm82m2r26td83gvj7y3k3',
    color: 'text-orange-500'
  },
  ethereum: {
    name: 'Ethereum',
    symbol: 'ETH',
    address: '0x66b07DFe9025aA5D9F073Ca9aC7B5a4b9C348C1d',
    color: 'text-blue-500'
  },
  litecoin: {
    name: 'Litecoin',
    symbol: 'LTC',
    address: 'LdybeZA3CS7t6sMNb88ZEyHoJPGhYCNZmj',
    color: 'text-gray-400'
  }
};

export default function CheckoutPage() {
  const [, setLocation] = useLocation();
  const [match, params] = useRoute("/checkout/:productData");
  const { user } = useAuth();
  const [product, setProduct] = useState<Product | null>(null);
  const [selectedPayment, setSelectedPayment] = useState<PaymentMethod | null>(null);
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null);

  useEffect(() => {
    if (params?.productData) {
      try {
        const decodedProduct = JSON.parse(decodeURIComponent(params.productData));
        setProduct(decodedProduct);
      } catch (error) {
        console.error('Failed to parse product data:', error);
        setLocation('/');
      }
    } else {
      setLocation('/');
    }
  }, [params, setLocation]);

  const copyToClipboard = async (address: string) => {
    try {
      await navigator.clipboard.writeText(address);
      setCopiedAddress(address);
      setTimeout(() => setCopiedAddress(null), 2000);
    } catch (err) {
      console.error('Failed to copy address:', err);
    }
  };

  if (!product) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Loading...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            onClick={() => setLocation('/products')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Products
          </Button>
          <h1 className="text-3xl font-bold">Checkout</h1>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Product Summary */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                  {product.imageUrl && (
                    <img 
                      src={product.imageUrl} 
                      alt={product.name}
                      className="w-16 h-16 rounded-lg object-cover"
                    />
                  )}
                  <div className="flex-1">
                    <h3 className="font-semibold">{product.name}</h3>
                    <p className="text-sm text-muted-foreground">{product.game}</p>
                  </div>
                </div>
                
                <div className="pt-4 border-t">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Total</span>
                    <span className="text-2xl font-bold text-primary">${product.price}</span>
                  </div>
                </div>

                <Badge variant="outline" className="w-full justify-center">
                  {product.category}
                </Badge>
              </CardContent>
            </Card>
          </div>

          {/* Payment Methods */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Payment Options</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Customer Email */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">Account Information</h3>
                  <div className="space-y-2">
                    <Label>Logged in as</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                      <div className="pl-10 p-3 bg-background rounded border text-sm">
                        <p className="font-medium">{user?.username}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Orders will be accessible in your dashboard
                        </p>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Required to access your purchase and receive your license key
                    </p>
                  </div>
                </div>

                {/* Cryptocurrency Payment Methods */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">Select Cryptocurrency</h3>
                  <div className="grid gap-4">
                    {Object.entries(cryptoWallets).map(([key, wallet]) => (
                      <Card 
                        key={key}
                        className={`cursor-pointer transition-all border-2 ${
                          selectedPayment === key 
                            ? 'border-primary bg-primary/5' 
                            : 'border-border hover:border-primary/50'
                        }`}
                        onClick={() => setSelectedPayment(key as PaymentMethod)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className={`w-10 h-10 rounded-full bg-muted flex items-center justify-center ${wallet.color} font-bold`}>
                                {wallet.symbol}
                              </div>
                              <div>
                                <h4 className="font-semibold">{wallet.name}</h4>
                                <p className="text-sm text-muted-foreground">{wallet.symbol}</p>
                              </div>
                            </div>
                            <div className={`w-4 h-4 rounded-full border-2 ${
                              selectedPayment === key 
                                ? 'border-primary bg-primary' 
                                : 'border-muted-foreground'
                            }`} />
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>

                {/* Payment Instructions */}
                {selectedPayment && (
                  <div className="bg-muted/20 p-6 rounded-lg border border-border">
                    <h3 className="font-semibold text-lg mb-4">Payment Instructions</h3>
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm text-muted-foreground mb-2">
                          Send exactly <span className="font-bold text-primary">${product.price}</span> worth of {cryptoWallets[selectedPayment].name} to:
                        </p>
                        <div className="flex items-center gap-2 p-3 bg-background rounded border">
                          <code className="flex-1 text-sm font-mono break-all">
                            {cryptoWallets[selectedPayment].address}
                          </code>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(cryptoWallets[selectedPayment].address)}
                            className="shrink-0"
                          >
                            {copiedAddress === cryptoWallets[selectedPayment].address ? (
                              <CheckCircle className="w-4 h-4 text-green-500" />
                            ) : (
                              <Copy className="w-4 h-4" />
                            )}
                          </Button>
                        </div>
                      </div>
                      
                      <div className="bg-yellow-500/10 border border-yellow-500/20 p-4 rounded">
                        <h4 className="font-semibold text-yellow-600 mb-2">Important:</h4>
                        <ul className="text-sm text-yellow-700 space-y-1">
                          <li>• Double-check the wallet address before sending</li>
                          <li>• Send the exact USD amount in {cryptoWallets[selectedPayment].symbol}</li>
                          <li>• Transaction may take 10-60 minutes to confirm</li>
                          <li>• Contact support if you need assistance</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-4 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setLocation('/products')}
                    className="flex-1"
                    size="lg"
                  >
                    Back to Products
                  </Button>
                  {selectedPayment && user && (
                    <Button
                      className="flex-1"
                      size="lg"
                      onClick={async () => {
                        if (!user) {
                          alert('Please log in to complete your purchase');
                          return;
                        }
                        
                        try {
                          const orderData = {
                            productName: product.name,
                            productPrice: product.price,
                            userId: user.id,
                            customerEmail: `${user.username}@playdirty.com`,
                            paymentMethod: cryptoWallets[selectedPayment].name,
                            walletAddress: cryptoWallets[selectedPayment].address
                          };

                          const response = await fetch('/api/orders', {
                            method: 'POST',
                            headers: {
                              'Content-Type': 'application/json',
                            },
                            credentials: 'include',
                            body: JSON.stringify(orderData),
                          });

                          if (response.ok) {
                            const order = await response.json();
                            alert(`Order submitted successfully!\n\nOrder ID: ${order.id}\nAccount: ${user.username}\n\nYour order is now accessible in your dashboard.\n\nWe will verify your payment and process your order within 1-24 hours.`);
                            setLocation('/dashboard');
                          } else {
                            alert('Failed to submit order. Please try again.');
                          }
                        } catch (error) {
                          alert('Connection error. Please try again.');
                        }
                      }}
                    >
                      I've Sent Payment
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    onClick={() => setLocation('/')}
                    className="flex-1"
                    size="lg"
                  >
                    Contact Support
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}