import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Header from "@/components/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  ShoppingBag, 
  Download, 
  Calendar, 
  Search, 
  Filter,
  CheckCircle,
  Clock,
  AlertCircle,
  RefreshCw,
  Key,
  Copy,
  Eye
} from "lucide-react";
import { Order } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { format } from "date-fns";

const ORDER_STATUS_CONFIG = {
  pending: {
    label: "Pending",
    icon: Clock,
    color: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20"
  },
  confirmed: {
    label: "Confirmed", 
    icon: CheckCircle,
    color: "bg-blue-500/10 text-blue-500 border-blue-500/20"
  },
  completed: {
    label: "Completed",
    icon: CheckCircle,
    color: "bg-green-500/10 text-green-500 border-green-500/20"
  },
  cancelled: {
    label: "Cancelled",
    icon: AlertCircle,
    color: "bg-red-500/10 text-red-500 border-red-500/20"
  }
};

export default function PurchaseHistory() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Get user's order history
  const { data: orders = [], isLoading, error } = useQuery<Order[]>({
    queryKey: ['/api/orders'],
    queryFn: async () => {
      const response = await fetch('/api/orders', {
        credentials: 'include'
      });
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Please log in to view your purchase history');
        }
        throw new Error('Failed to fetch purchase history');
      }
      return response.json();
    },
    enabled: !!user,
  });

  // Reorder mutation - add product back to cart
  const reorderMutation = useMutation({
    mutationFn: async (productId: string) => {
      // In a real app, this would add to cart or redirect to product
      setLocation(`/product/${productId}`);
    },
  });

  // Copy license key to clipboard
  const copyLicenseKey = async (licenseKey: string) => {
    try {
      await navigator.clipboard.writeText(licenseKey);
      // You might want to show a toast notification here
    } catch (error) {
      console.error('Failed to copy license key:', error);
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = !searchQuery || 
      order.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.id.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || order.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const totalOrders = orders.length;
  const completedOrders = orders.filter(order => order.status === 'completed').length;
  const totalSpent = orders
    .filter(order => order.status !== 'cancelled')
    .reduce((sum, order) => sum + parseFloat(order.productPrice), 0);

  if (!user) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <div className="falling-dots"></div>
        <Header searchQuery={searchQuery} onSearchChange={setSearchQuery} />
        
        <div className="container mx-auto px-4 py-16">
          <div className="text-center max-w-md mx-auto">
            <ShoppingBag className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-foreground mb-4">
              Sign In Required
            </h1>
            <p className="text-muted-foreground mb-6">
              Please sign in to view your purchase history
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
              Purchase History
            </h1>
            <p className="text-muted-foreground">
              Track your orders, download products, and manage your purchases
            </p>
          </div>
          
          {orders.length > 0 && (
            <div className="flex flex-col sm:flex-row gap-4 mt-4 sm:mt-0">
              <Card className="px-4 py-2">
                <div className="flex items-center gap-2">
                  <ShoppingBag className="w-4 h-4 text-blue-500" />
                  <span className="text-sm font-medium">{totalOrders} orders</span>
                </div>
              </Card>
              <Card className="px-4 py-2">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-sm font-medium">{completedOrders} completed</span>
                </div>
              </Card>
              <Card className="px-4 py-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">${totalSpent.toFixed(2)} total</span>
                </div>
              </Card>
            </div>
          )}
        </div>

        {/* Search and Filters */}
        {orders.length > 0 && (
          <div className="mb-8">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1 max-w-md">
                <Input
                  type="text"
                  placeholder="Search orders..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Orders</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        {/* Orders List */}
        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <div className="animate-pulse">
                    <div className="flex justify-between items-start mb-4">
                      <div className="space-y-2">
                        <div className="h-5 bg-muted rounded w-48"></div>
                        <div className="h-4 bg-muted rounded w-32"></div>
                      </div>
                      <div className="h-6 bg-muted rounded w-20"></div>
                    </div>
                    <div className="h-4 bg-muted rounded w-24"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-destructive mb-4">Error Loading Orders</h2>
            <p className="text-muted-foreground mb-4">{(error as Error).message}</p>
            <Button onClick={() => window.location.reload()}>Try Again</Button>
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-16">
            <ShoppingBag className="w-24 h-24 text-muted-foreground mx-auto mb-6" />
            <h2 className="text-3xl font-bold text-foreground mb-4">
              No Purchase History
            </h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-md mx-auto">
              You haven't made any purchases yet. Start browsing our products to make your first order!
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
            {filteredOrders.length === 0 ? (
              <div className="text-center py-12">
                <h3 className="text-2xl font-semibold text-foreground mb-2">No Orders Found</h3>
                <p className="text-muted-foreground mb-4">
                  No orders match your search criteria.
                </p>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setSearchQuery("");
                    setStatusFilter("all");
                  }}
                >
                  Clear Filters
                </Button>
              </div>
            ) : (
              <div className="space-y-6">
                {filteredOrders.map((order) => {
                  const statusConfig = ORDER_STATUS_CONFIG[order.status as keyof typeof ORDER_STATUS_CONFIG];
                  const StatusIcon = statusConfig?.icon || Clock;
                  
                  return (
                    <Card key={order.id} className="hover:border-primary/50 transition-colors">
                      <CardHeader>
                        <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <CardTitle className="text-xl font-semibold">
                                {order.productName}
                              </CardTitle>
                              <Badge className={statusConfig?.color}>
                                <StatusIcon className="w-3 h-3 mr-1" />
                                {statusConfig?.label}
                              </Badge>
                            </div>
                            <div className="space-y-1 text-sm text-muted-foreground">
                              <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4" />
                                <span>Ordered on {format(new Date(order.createdAt), 'MMM d, yyyy')}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span>Order ID: {order.id.slice(0, 8)}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span>Payment: {order.paymentMethod}</span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="text-right">
                            <div className="text-2xl font-bold text-primary mb-2">
                              ${parseFloat(order.productPrice).toFixed(2)}
                            </div>
                            {order.discountAmount && parseFloat(order.discountAmount) > 0 && (
                              <div className="text-sm text-green-600">
                                Saved ${parseFloat(order.discountAmount).toFixed(2)}
                              </div>
                            )}
                          </div>
                        </div>
                      </CardHeader>
                      
                      <CardContent className="pt-0">
                        {/* License Key & Download Section */}
                        {order.status === 'completed' && order.licenseKey && (
                          <div className="bg-muted/50 rounded-lg p-4 mb-4">
                            <h4 className="font-semibold mb-3 flex items-center gap-2">
                              <Key className="w-4 h-4" />
                              Product Access
                            </h4>
                            <div className="space-y-3">
                              <div className="flex items-center gap-2 text-sm">
                                <span className="text-muted-foreground">License Key:</span>
                                <code className="bg-background px-2 py-1 rounded text-xs font-mono">
                                  {order.licenseKey}
                                </code>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => copyLicenseKey(order.licenseKey!)}
                                  className="h-6 px-2"
                                >
                                  <Copy className="w-3 h-3" />
                                </Button>
                              </div>
                              
                              {order.downloadUrl && (
                                <div className="flex gap-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => order.downloadUrl && window.open(order.downloadUrl, '_blank')}
                                  >
                                    <Download className="w-4 h-4 mr-2" />
                                    Download ({order.downloadCount || 0} downloads)
                                  </Button>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                        
                        {/* Action Buttons */}
                        <div className="flex flex-wrap gap-3">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setLocation(`/orders/${order.id}`)}
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            View Details
                          </Button>
                          
                          {order.productId && (
                            <Button
                              variant="outline" 
                              size="sm"
                              onClick={() => reorderMutation.mutate(order.productId!)}
                              disabled={reorderMutation.isPending}
                            >
                              <RefreshCw className="w-4 h-4 mr-2" />
                              Buy Again
                            </Button>
                          )}
                          
                          {order.status === 'completed' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setLocation(`/review/${order.productId}`)}
                            >
                              Write Review
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}

            <div className="text-center mt-8">
              <p className="text-muted-foreground">
                Showing {filteredOrders.length} of {orders.length} orders
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}