import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Shield, LogOut, Package, CheckCircle, Clock, AlertTriangle, Key } from "lucide-react";

interface Order {
  id: string;
  productName: string;
  productPrice: string;
  customerEmail?: string;
  paymentMethod: string;
  walletAddress: string;
  status: 'pending' | 'confirmed' | 'completed';
  createdAt: string;
  transactionId?: string;
  licenseKey?: string;
  downloadUrl?: string;
}

export default function AdminPanel() {
  const [, setLocation] = useLocation();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [completingOrder, setCompletingOrder] = useState<Order | null>(null);
  const [licenseKey, setLicenseKey] = useState("");
  const [downloadUrl, setDownloadUrl] = useState("");

  useEffect(() => {
    checkAuth();
    fetchOrders();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/admin/check', {
        credentials: 'include',
      });
      
      if (!response.ok) {
        setLocation('/admin-login');
      }
    } catch (err) {
      setLocation('/admin-login');
    }
  };

  const fetchOrders = async () => {
    try {
      const response = await fetch('/api/admin/orders', {
        credentials: 'include',
      });
      
      if (response.ok) {
        const data = await response.json();
        setOrders(data);
      } else {
        setError('Failed to fetch orders');
      }
    } catch (err) {
      setError('Connection failed');
    } finally {
      setIsLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, status: 'confirmed' | 'completed') => {
    try {
      const response = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ status }),
      });

      if (response.ok) {
        setOrders(orders.map(order => 
          order.id === orderId ? { ...order, status } : order
        ));
      } else {
        setError('Failed to update order status');
      }
    } catch (err) {
      setError('Connection failed');
    }
  };

  const handleCompleteOrder = (order: Order) => {
    setCompletingOrder(order);
    setLicenseKey("");
    setDownloadUrl("");
  };

  const completeOrderWithLicense = async () => {
    if (!completingOrder || !licenseKey.trim()) {
      setError('License key is required');
      return;
    }

    try {
      // Update license key first
      const licenseResponse = await fetch(`/api/admin/orders/${completingOrder.id}/license`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ 
          licenseKey: licenseKey.trim(), 
          downloadUrl: downloadUrl.trim() || undefined 
        }),
      });

      if (!licenseResponse.ok) {
        setError('Failed to update license key');
        return;
      }

      // Then update status to completed
      const statusResponse = await fetch(`/api/admin/orders/${completingOrder.id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ status: 'completed' }),
      });

      if (statusResponse.ok) {
        setOrders(orders.map(order => 
          order.id === completingOrder.id 
            ? { ...order, status: 'completed', licenseKey: licenseKey.trim(), downloadUrl: downloadUrl.trim() || undefined } 
            : order
        ));
        setCompletingOrder(null);
        setLicenseKey("");
        setDownloadUrl("");
      } else {
        setError('Failed to complete order');
      }
    } catch (err) {
      setError('Connection failed');
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/logout', {
        method: 'POST',
        credentials: 'include',
      });
    } catch (err) {
      // Ignore logout errors
    }
    setLocation('/admin-login');
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'confirmed':
        return <AlertTriangle className="w-4 h-4 text-blue-500" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20';
      case 'confirmed':
        return 'bg-blue-500/10 text-blue-600 border-blue-500/20';
      case 'completed':
        return 'bg-green-500/10 text-green-600 border-green-500/20';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  if (isLoading) {
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
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Shield className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-bold">Admin Panel</h1>
          </div>
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <Package className="w-8 h-8 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Total Orders</p>
                  <p className="text-2xl font-bold">{orders.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <Clock className="w-8 h-8 text-yellow-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Pending</p>
                  <p className="text-2xl font-bold">
                    {orders.filter(o => o.status === 'pending').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <AlertTriangle className="w-8 h-8 text-blue-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Confirmed</p>
                  <p className="text-2xl font-bold">
                    {orders.filter(o => o.status === 'confirmed').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <CheckCircle className="w-8 h-8 text-green-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Completed</p>
                  <p className="text-2xl font-bold">
                    {orders.filter(o => o.status === 'completed').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Orders Table */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
          </CardHeader>
          <CardContent>
            {orders.length === 0 ? (
              <div className="text-center py-8">
                <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No orders found</p>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <Card key={order.id} className="border border-border">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-4 mb-2">
                            <h3 className="font-semibold">{order.productName}</h3>
                            <Badge className={getStatusColor(order.status)}>
                              <div className="flex items-center gap-1">
                                {getStatusIcon(order.status)}
                                {order.status}
                              </div>
                            </Badge>
                          </div>
                          <div className="grid md:grid-cols-2 gap-4 text-sm text-muted-foreground">
                            <div>
                              <p><strong>Price:</strong> ${order.productPrice}</p>
                              <p><strong>Payment:</strong> {order.paymentMethod}</p>
                            </div>
                            <div>
                              <p><strong>Created:</strong> {new Date(order.createdAt).toLocaleString()}</p>
                              <p><strong>Order ID:</strong> {order.id}</p>
                            </div>
                          </div>
                          <div className="mt-2">
                            <p className="text-xs text-muted-foreground break-all">
                              <strong>Wallet:</strong> {order.walletAddress}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex gap-2 ml-4">
                          {order.status === 'pending' && (
                            <Button
                              size="sm"
                              onClick={() => updateOrderStatus(order.id, 'confirmed')}
                            >
                              Confirm Payment
                            </Button>
                          )}
                          {order.status === 'confirmed' && (
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleCompleteOrder(order)}
                                >
                                  <Key className="w-4 h-4 mr-1" />
                                  Complete Order
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Complete Order</DialogTitle>
                                  <DialogDescription>
                                    Assign a license key and download URL for: <strong>{order.productName}</strong>
                                  </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4">
                                  <div>
                                    <Label htmlFor="licenseKey">License Key *</Label>
                                    <Input
                                      id="licenseKey"
                                      value={licenseKey}
                                      onChange={(e) => setLicenseKey(e.target.value)}
                                      placeholder="e.g. RUST-MEK-1D-ABC123DEF456"
                                      required
                                    />
                                  </div>
                                  <div>
                                    <Label htmlFor="downloadUrl">Download URL (Optional)</Label>
                                    <Input
                                      id="downloadUrl"
                                      value={downloadUrl}
                                      onChange={(e) => setDownloadUrl(e.target.value)}
                                      placeholder="https://secure.pdcheats.uk/downloads/..."
                                    />
                                  </div>
                                  <div className="flex justify-end space-x-2">
                                    <Button variant="outline" onClick={() => setCompletingOrder(null)}>
                                      Cancel
                                    </Button>
                                    <Button onClick={completeOrderWithLicense}>
                                      Complete Order
                                    </Button>
                                  </div>
                                </div>
                              </DialogContent>
                            </Dialog>
                          )}
                          {order.status === 'completed' && order.licenseKey && (
                            <div className="text-xs text-green-600">
                              <Key className="w-3 h-3 inline mr-1" />
                              License Assigned
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}