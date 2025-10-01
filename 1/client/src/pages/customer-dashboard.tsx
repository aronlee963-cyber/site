import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { User, LogOut, Package, Copy, CheckCircle, Key, Download, ShoppingCart, Clock, CreditCard } from "lucide-react";
import Header from "@/components/header";

interface UserOrder {
  id: string;
  productName: string;
  productPrice: string;
  userId: string;
  customerEmail?: string;
  paymentMethod: string;
  status: 'pending' | 'confirmed' | 'completed';
  createdAt: string;
  licenseKey?: string;
  downloadUrl?: string;
}

export default function CustomerDashboard() {
  const { user, logoutMutation } = useAuth();
  const [orders, setOrders] = useState<UserOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (user) {
      fetchOrders();
    }
  }, [user]);

  const fetchOrders = async () => {
    try {
      const response = await fetch('/api/orders', {
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

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(text);
      setTimeout(() => setCopiedKey(null), 2000);
    } catch (err) {
      console.error('Failed to copy to clipboard');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary" className="bg-yellow-900/20 text-yellow-400 border-yellow-800">
          <Clock className="w-3 h-3 mr-1" />
          Pending
        </Badge>;
      case 'confirmed':
        return <Badge variant="secondary" className="bg-blue-900/20 text-blue-400 border-blue-800">
          <CreditCard className="w-3 h-3 mr-1" />
          Confirmed
        </Badge>;
      case 'completed':
        return <Badge variant="secondary" className="bg-green-900/20 text-green-400 border-green-800">
          <CheckCircle className="w-3 h-3 mr-1" />
          Completed
        </Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getOrderStats = () => {
    const totalOrders = orders.length;
    const completedOrders = orders.filter(order => order.status === 'completed').length;
    const availableKeys = orders.filter(order => order.licenseKey && order.status === 'completed').length;
    
    return { totalOrders, completedOrders, availableKeys };
  };

  const stats = getOrderStats();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black">
        <Header searchQuery={searchQuery} onSearchChange={setSearchQuery} />
        <div className="flex items-center justify-center pt-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1800ad] mx-auto mb-4"></div>
            <p className="text-gray-400">Loading your dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <Header searchQuery={searchQuery} onSearchChange={setSearchQuery} />
      
      <div className="container mx-auto px-4 py-8 pt-20">
        {/* User Welcome Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">
                Welcome back, {user?.username}!
              </h1>
              <p className="text-gray-400">Manage your orders and access your gaming tools</p>
            </div>
            <Button
              onClick={() => logoutMutation.mutate()}
              variant="outline"
              className="border-gray-700 text-gray-300 hover:bg-gray-800"
              disabled={logoutMutation.isPending}
            >
              <LogOut className="w-4 h-4 mr-2" />
              {logoutMutation.isPending ? "Logging out..." : "Logout"}
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-gray-900/50 border-gray-800">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-400 flex items-center">
                <ShoppingCart className="w-4 h-4 mr-2" />
                Total Orders
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stats.totalOrders}</div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900/50 border-gray-800">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-400 flex items-center">
                <CheckCircle className="w-4 h-4 mr-2" />
                Completed Orders
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-400">{stats.completedOrders}</div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900/50 border-gray-800">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-400 flex items-center">
                <Key className="w-4 h-4 mr-2" />
                Available Keys
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#1800ad]">{stats.availableKeys}</div>
            </CardContent>
          </Card>
        </div>

        {/* Error Display */}
        {error && (
          <Alert className="mb-6 bg-red-900/20 border-red-800 text-red-400">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Orders Section */}
        <Card className="bg-gray-900/50 border-gray-800">
          <CardHeader>
            <CardTitle className="text-xl text-white flex items-center">
              <Package className="w-5 h-5 mr-2" />
              Your Orders
            </CardTitle>
          </CardHeader>
          <CardContent>
            {orders.length === 0 ? (
              <div className="text-center py-8">
                <Package className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400 mb-2">No orders yet</p>
                <p className="text-sm text-gray-500">
                  Browse our products and make your first purchase to get started!
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <Card key={order.id} className="bg-gray-800/50 border-gray-700">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="font-semibold text-white text-lg mb-1">
                            {order.productName}
                          </h3>
                          <p className="text-sm text-gray-400">
                            Order ID: {order.id}
                          </p>
                          <p className="text-sm text-gray-400">
                            Created: {new Date(order.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="text-xl font-bold text-[#1800ad] mb-2">
                            ${order.productPrice}
                          </div>
                          {getStatusBadge(order.status)}
                        </div>
                      </div>

                      {/* License Key Section */}
                      {order.status === 'completed' && order.licenseKey && (
                        <div className="mt-4 p-4 bg-[#1800ad]/10 rounded-lg border border-[#1800ad]/20">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-[#1800ad] mb-1 flex items-center">
                                <Key className="w-4 h-4 mr-1" />
                                License Key
                              </p>
                              <div className="font-mono text-sm bg-gray-900 px-3 py-2 rounded border border-gray-700 text-gray-300">
                                {order.licenseKey}
                              </div>
                            </div>
                            <Button
                              onClick={() => copyToClipboard(order.licenseKey!)}
                              size="sm"
                              variant="outline"
                              className="ml-3 border-[#1800ad] text-[#1800ad] hover:bg-[#1800ad] hover:text-white"
                            >
                              {copiedKey === order.licenseKey ? (
                                <CheckCircle className="w-4 h-4" />
                              ) : (
                                <Copy className="w-4 h-4" />
                              )}
                            </Button>
                          </div>
                        </div>
                      )}

                      {/* Download Section */}
                      {order.status === 'completed' && order.downloadUrl && (
                        <div className="mt-4">
                          <Button
                            onClick={() => window.open(order.downloadUrl, '_blank')}
                            className="w-full bg-[#1800ad] hover:bg-[#1800ad]/80 text-white"
                          >
                            <Download className="w-4 h-4 mr-2" />
                            Download
                          </Button>
                        </div>
                      )}

                      {/* Payment Method */}
                      <div className="mt-4 pt-4 border-t border-gray-700">
                        <p className="text-sm text-gray-400">
                          Payment Method: <span className="text-gray-300">{order.paymentMethod}</span>
                        </p>
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