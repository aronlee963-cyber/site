import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Header from "@/components/header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Plus, 
  Edit, 
  Trash2, 
  Calendar, 
  Tag, 
  Percent, 
  DollarSign,
  Users,
  AlertCircle,
  CheckCircle,
  Clock,
  Search
} from "lucide-react";
import { DiscountCode, InsertDiscountCode } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { format } from "date-fns";

const DISCOUNT_TYPE_CONFIG = {
  percentage: {
    label: "Percentage",
    icon: Percent,
    color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
  },
  fixed: {
    label: "Fixed Amount",
    icon: DollarSign,
    color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
  }
};

const STATUS_CONFIG = {
  active: {
    label: "Active",
    icon: CheckCircle,
    color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
  },
  inactive: {
    label: "Inactive",
    icon: Clock,
    color: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
  },
  expired: {
    label: "Expired",
    icon: AlertCircle,
    color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
  }
};

export default function AdminDiscountCodes() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingCode, setEditingCode] = useState<DiscountCode | null>(null);
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Get all discount codes
  const { data: discountCodes = [], isLoading, error } = useQuery<DiscountCode[]>({
    queryKey: ['/api/admin/discount-codes'],
    queryFn: async () => {
      const response = await fetch('/api/admin/discount-codes', {
        credentials: 'include'
      });
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Admin access required');
        }
        throw new Error('Failed to fetch discount codes');
      }
      return response.json();
    },
    enabled: !!user,
  });

  // Create discount code mutation
  const createMutation = useMutation({
    mutationFn: async (data: Omit<InsertDiscountCode, 'createdBy'>) => {
      const response = await fetch('/api/admin/discount-codes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message);
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/discount-codes'] });
      setIsCreateDialogOpen(false);
    },
  });

  // Update discount code mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Omit<InsertDiscountCode, 'createdBy'>> }) => {
      const response = await fetch(`/api/admin/discount-codes/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message);
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/discount-codes'] });
      setEditingCode(null);
    },
  });

  // Delete discount code mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/admin/discount-codes/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message);
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/discount-codes'] });
    },
  });

  const getDiscountStatus = (code: DiscountCode) => {
    const now = new Date();
    const validFrom = new Date(code.validFrom);
    const validTo = new Date(code.validTo);
    
    if (!code.isActive) return 'inactive';
    if (now > validTo) return 'expired';
    if (now < validFrom) return 'inactive';
    return 'active';
  };

  const filteredCodes = discountCodes.filter(code =>
    !searchQuery || 
    code.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeCodes = discountCodes.filter(code => getDiscountStatus(code) === 'active').length;
  const totalUsage = discountCodes.reduce((sum, code) => sum + code.usedCount, 0);

  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <div className="falling-dots"></div>
        <Header searchQuery={searchQuery} onSearchChange={setSearchQuery} />
        
        <div className="container mx-auto px-4 py-16">
          <div className="text-center max-w-md mx-auto">
            <Tag className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-foreground mb-4">
              Admin Access Required
            </h1>
            <p className="text-muted-foreground mb-6">
              {!user 
                ? 'Please sign in with an admin account to manage discount codes'
                : 'You need admin privileges to manage discount codes'
              }
            </p>
            <Button onClick={() => setLocation('/login')} size="lg">
              {!user ? 'Sign In' : 'Contact Admin'}
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
              Discount Code Management
            </h1>
            <p className="text-muted-foreground">
              Create and manage discount codes for your customers
            </p>
          </div>
          
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button size="lg" className="mt-4 sm:mt-0">
                <Plus className="w-4 h-4 mr-2" />
                Create Discount Code
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Create New Discount Code</DialogTitle>
              </DialogHeader>
              <DiscountCodeForm 
                onSubmit={(data) => createMutation.mutate(data)}
                isLoading={createMutation.isPending}
                error={createMutation.error?.message}
              />
            </DialogContent>
          </Dialog>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm">Total Codes</p>
                  <p className="text-3xl font-bold">{discountCodes.length}</p>
                </div>
                <Tag className="w-8 h-8 text-primary" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm">Active Codes</p>
                  <p className="text-3xl font-bold text-green-600">{activeCodes}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm">Total Usage</p>
                  <p className="text-3xl font-bold text-blue-600">{totalUsage}</p>
                </div>
                <Users className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <Input
              type="text"
              placeholder="Search discount codes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          </div>
        </div>

        {/* Discount Codes List */}
        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <div className="animate-pulse space-y-3">
                    <div className="flex justify-between">
                      <div className="h-5 bg-muted rounded w-32"></div>
                      <div className="h-6 bg-muted rounded w-16"></div>
                    </div>
                    <div className="h-4 bg-muted rounded w-full"></div>
                    <div className="h-4 bg-muted rounded w-3/4"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : error ? (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{(error as Error).message}</AlertDescription>
          </Alert>
        ) : filteredCodes.length === 0 ? (
          <div className="text-center py-16">
            <Tag className="w-24 h-24 text-muted-foreground mx-auto mb-6" />
            <h2 className="text-3xl font-bold text-foreground mb-4">
              No Discount Codes
            </h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-md mx-auto">
              {searchQuery 
                ? 'No codes match your search criteria.'
                : 'Create your first discount code to start offering promotions to customers.'
              }
            </p>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create First Code
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredCodes.map((code) => {
              const status = getDiscountStatus(code);
              const statusConfig = STATUS_CONFIG[status];
              const typeConfig = DISCOUNT_TYPE_CONFIG[code.type as keyof typeof DISCOUNT_TYPE_CONFIG];
              const StatusIcon = statusConfig.icon;
              const TypeIcon = typeConfig.icon;

              return (
                <Card key={code.id} className="hover:border-primary/50 transition-colors">
                  <CardContent className="p-6">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <h3 className="text-xl font-bold font-mono">{code.code}</h3>
                          <Badge className={statusConfig.color}>
                            <StatusIcon className="w-3 h-3 mr-1" />
                            {statusConfig.label}
                          </Badge>
                          <Badge className={typeConfig.color}>
                            <TypeIcon className="w-3 h-3 mr-1" />
                            {code.type === 'percentage' ? `${code.value}%` : `$${code.value}`}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <p className="text-muted-foreground">Usage</p>
                            <p className="font-medium">
                              {code.usedCount} / {code.maxUses ? code.maxUses : '∞'}
                            </p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Min Order</p>
                            <p className="font-medium">${code.minOrderAmount || '0.00'}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Valid From</p>
                            <p className="font-medium">{format(new Date(code.validFrom), 'MMM d')}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Valid To</p>
                            <p className="font-medium">{format(new Date(code.validTo), 'MMM d')}</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setEditingCode(code)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => {
                            if (confirm(`Delete discount code "${code.code}"?`)) {
                              deleteMutation.mutate(code.id);
                            }
                          }}
                          disabled={deleteMutation.isPending}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Edit Dialog */}
        <Dialog open={!!editingCode} onOpenChange={() => setEditingCode(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Edit Discount Code</DialogTitle>
            </DialogHeader>
            {editingCode && (
              <DiscountCodeForm 
                initialData={editingCode}
                onSubmit={(data) => updateMutation.mutate({ id: editingCode.id, data })}
                isLoading={updateMutation.isPending}
                error={updateMutation.error?.message}
              />
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

// Discount Code Form Component
interface DiscountCodeFormProps {
  onSubmit: (data: Omit<InsertDiscountCode, 'createdBy'>) => void;
  isLoading?: boolean;
  error?: string;
  initialData?: Partial<DiscountCode>;
}

function DiscountCodeForm({ onSubmit, isLoading, error, initialData }: DiscountCodeFormProps) {
  const [formData, setFormData] = useState({
    code: initialData?.code || '',
    type: initialData?.type || 'percentage',
    value: initialData?.value || '',
    minOrderAmount: initialData?.minOrderAmount || '',
    maxUses: initialData?.maxUses?.toString() || '',
    isActive: initialData?.isActive ?? true,
    validFrom: initialData?.validFrom ? format(new Date(initialData.validFrom), 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'),
    validTo: initialData?.validTo ? format(new Date(initialData.validTo), 'yyyy-MM-dd') : format(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd')
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      code: formData.code.toUpperCase(),
      type: formData.type as 'percentage' | 'fixed',
      value: formData.value,
      minOrderAmount: formData.minOrderAmount || '0',
      maxUses: formData.maxUses ? parseInt(formData.maxUses) : undefined,
      isActive: formData.isActive,
      validFrom: new Date(formData.validFrom),
      validTo: new Date(formData.validTo)
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="text-sm font-medium">Code</label>
        <Input
          value={formData.code}
          onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
          placeholder="SUMMER20"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium">Type</label>
          <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="percentage">Percentage</SelectItem>
              <SelectItem value="fixed">Fixed Amount</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <label className="text-sm font-medium">Value</label>
          <Input
            type="number"
            step="0.01"
            value={formData.value}
            onChange={(e) => setFormData({ ...formData, value: e.target.value })}
            placeholder={formData.type === 'percentage' ? '20' : '10.00'}
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium">Min Order Amount</label>
          <Input
            type="number"
            step="0.01"
            value={formData.minOrderAmount}
            onChange={(e) => setFormData({ ...formData, minOrderAmount: e.target.value })}
            placeholder="0.00"
          />
        </div>
        
        <div>
          <label className="text-sm font-medium">Max Uses</label>
          <Input
            type="number"
            value={formData.maxUses}
            onChange={(e) => setFormData({ ...formData, maxUses: e.target.value })}
            placeholder="Unlimited"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium">Valid From</label>
          <Input
            type="date"
            value={formData.validFrom}
            onChange={(e) => setFormData({ ...formData, validFrom: e.target.value })}
            required
          />
        </div>
        
        <div>
          <label className="text-sm font-medium">Valid To</label>
          <Input
            type="date"
            value={formData.validTo}
            onChange={(e) => setFormData({ ...formData, validTo: e.target.value })}
            required
          />
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="isActive"
          checked={formData.isActive}
          onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
        />
        <label htmlFor="isActive" className="text-sm font-medium">Active</label>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Button type="submit" disabled={isLoading} className="w-full">
        {isLoading ? 'Creating...' : (initialData ? 'Update Code' : 'Create Code')}
      </Button>
    </form>
  );
}