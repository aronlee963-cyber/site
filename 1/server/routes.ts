import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertSupportTicketSchema, insertProductReviewSchema, insertWishlistSchema } from "@shared/schema";
import { setupAuth } from "./auth";

// Extend session to include admin authentication
declare module 'express-session' {
  interface SessionData {
    isAdmin?: boolean;
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication first
  setupAuth(app);

  // User authentication middleware
  const requireUserAuth = (req: any, res: any, next: any) => {
    if (req.isAuthenticated && req.isAuthenticated()) {
      return next();
    }
    return res.status(401).json({ message: 'Unauthorized' });
  };
  // Get all products
  app.get("/api/products", async (_req, res) => {
    try {
      res.set('Cache-Control', 'no-store');
      const products = await storage.getProducts();
      res.json(products);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch products" });
    }
  });

  // Get single product
  app.get("/api/products/:id", async (req, res) => {
    try {
      const product = await storage.getProduct(req.params.id);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      res.json(product);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch product" });
    }
  });

  // Search products
  app.get("/api/products/search/:query", async (req, res) => {
    try {
      const products = await storage.searchProducts(req.params.query);
      res.json(products);
    } catch (error) {
      res.status(500).json({ message: "Failed to search products" });
    }
  });

  // Filter products
  app.post("/api/products/filter", async (req, res) => {
    try {
      const products = await storage.filterProducts(req.body);
      res.json(products);
    } catch (error) {
      res.status(500).json({ message: "Failed to filter products" });
    }
  });

  // Enhanced product search with advanced filters
  app.post("/api/products/search/advanced", async (req, res) => {
    try {
      const { query = '', filters = {} } = req.body;
      const products = await storage.getAdvancedProductSearch(query, filters);
      res.json(products);
    } catch (error) {
      res.status(500).json({ message: "Failed to perform advanced search" });
    }
  });

  // Get product recommendations
  app.get("/api/products/recommendations", async (req, res) => {
    try {
      const userId = (req as any).user?.id;
      const productId = req.query.productId as string;
      const limit = parseInt(req.query.limit as string) || 5;
      
      const recommendations = await storage.getProductRecommendations(userId, productId, limit);
      res.json(recommendations);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch recommendations" });
    }
  });

  // Recently viewed products
  app.post("/api/recently-viewed/:productId", requireUserAuth, async (req, res) => {
    try {
      const userId = (req as any).user.id;
      const productId = req.params.productId;
      
      await storage.addRecentlyViewed(userId, productId);
      
      // Log user activity
      await storage.logUserActivity({
        userId,
        action: 'view_product',
        entityType: 'product',
        entityId: productId,
        metadata: JSON.stringify({ timestamp: new Date().toISOString() })
      });
      
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to track product view" });
    }
  });

  app.get("/api/recently-viewed", requireUserAuth, async (req, res) => {
    try {
      const userId = (req as any).user.id;
      const products = await storage.getRecentlyViewed(userId);
      res.json(products);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch recently viewed products" });
    }
  });

  // FAQ endpoints
  app.get("/api/faq", async (req, res) => {
    try {
      const category = req.query.category as string;
      const faqItems = await storage.getFaqItems(category);
      res.json(faqItems);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch FAQ items" });
    }
  });

  // User activity tracking
  app.get("/api/user/activity", requireUserAuth, async (req, res) => {
    try {
      const userId = (req as any).user.id;
      const activities = await storage.getUserActivity(userId);
      res.json(activities);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user activity" });
    }
  });

  // Product Reviews API
  // Get reviews for a product
  app.get("/api/products/:productId/reviews", async (req, res) => {
    try {
      const reviews = await storage.getProductReviews(req.params.productId);
      res.json(reviews);
    } catch (error) {
      console.error('Failed to fetch product reviews:', error);
      res.status(500).json({ message: "Failed to fetch reviews" });
    }
  });

  // Add a review for a product (requires authentication)
  app.post("/api/products/:productId/reviews", requireUserAuth, async (req: any, res) => {
    try {
      const { productId } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }

      // Check if user has already reviewed this product
      const hasReviewed = await storage.hasUserReviewedProduct(userId, productId);
      if (hasReviewed) {
        return res.status(400).json({ message: "You have already reviewed this product" });
      }

      // Check if user has purchased this product to set verified purchase status
      const userOrders = await storage.getUserOrders(userId);
      const hasPurchased = userOrders.some(order => 
        order.productId === productId && order.status === 'completed'
      );

      // Validate request body
      const result = insertProductReviewSchema.safeParse({
        ...req.body,
        productId,
        userId
      });

      if (!result.success) {
        return res.status(400).json({ 
          message: "Invalid review data",
          errors: result.error.errors
        });
      }

      const review = await storage.addProductReview({
        ...result.data,
        isVerifiedPurchase: hasPurchased
      });
      res.status(201).json(review);
    } catch (error) {
      console.error('Failed to add product review:', error);
      res.status(500).json({ message: "Failed to add review" });
    }
  });

  // Update a review (requires authentication and ownership)
  app.patch("/api/reviews/:reviewId", requireUserAuth, async (req: any, res) => {
    try {
      const { reviewId } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }

      // Validate request body
      const result = insertProductReviewSchema.omit({ 
        productId: true, 
        userId: true 
      }).partial().safeParse(req.body);

      if (!result.success) {
        return res.status(400).json({ 
          message: "Invalid review data",
          errors: result.error.errors
        });
      }

      // Check ownership by including userId in the update
      const updatedReview = await storage.updateProductReview(reviewId, {
        ...result.data,
        userId // Ensure user can only update their own review
      });

      if (!updatedReview) {
        return res.status(404).json({ message: "Review not found or unauthorized" });
      }

      res.json(updatedReview);
    } catch (error) {
      console.error('Failed to update product review:', error);
      res.status(500).json({ message: "Failed to update review" });
    }
  });

  // Delete a review (requires authentication and ownership)
  app.delete("/api/reviews/:reviewId", requireUserAuth, async (req: any, res) => {
    try {
      const { reviewId } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }

      // Get the review first to check ownership
      const review = await storage.getProductReview(reviewId);
      
      if (!review || review.userId !== userId) {
        return res.status(404).json({ message: "Review not found or unauthorized" });
      }

      const deleted = await storage.deleteProductReview(reviewId);
      
      if (!deleted) {
        return res.status(500).json({ message: "Failed to delete review" });
      }

      res.status(204).send();
    } catch (error) {
      console.error('Failed to delete product review:', error);
      res.status(500).json({ message: "Failed to delete review" });
    }
  });

  // Mark a review as helpful
  app.post("/api/reviews/:reviewId/helpful", async (req, res) => {
    try {
      const { reviewId } = req.params;
      const success = await storage.markReviewHelpful(reviewId);
      
      if (!success) {
        return res.status(404).json({ message: "Review not found" });
      }

      res.json({ message: "Review marked as helpful" });
    } catch (error) {
      console.error('Failed to mark review as helpful:', error);
      res.status(500).json({ message: "Failed to mark review as helpful" });
    }
  });

  // Wishlist API
  // Get user's wishlist
  app.get("/api/wishlist", requireUserAuth, async (req: any, res) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }

      const wishlist = await storage.getUserWishlist(userId);
      res.json(wishlist);
    } catch (error) {
      console.error('Failed to fetch wishlist:', error);
      res.status(500).json({ message: "Failed to fetch wishlist" });
    }
  });

  // Add product to wishlist
  app.post("/api/wishlist/:productId", requireUserAuth, async (req: any, res) => {
    try {
      const { productId } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }

      // Check if product exists
      const product = await storage.getProduct(productId);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }

      // Check if already in wishlist
      const isInWishlist = await storage.isProductInWishlist(userId, productId);
      if (isInWishlist) {
        return res.status(400).json({ message: "Product is already in wishlist" });
      }

      const wishlistItem = await storage.addToWishlist(userId, productId);
      res.status(201).json(wishlistItem);
    } catch (error) {
      console.error('Failed to add to wishlist:', error);
      res.status(500).json({ message: "Failed to add to wishlist" });
    }
  });

  // Remove product from wishlist
  app.delete("/api/wishlist/:productId", requireUserAuth, async (req: any, res) => {
    try {
      const { productId } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }

      const success = await storage.removeFromWishlist(userId, productId);
      if (!success) {
        return res.status(404).json({ message: "Product not found in wishlist" });
      }

      res.status(204).send();
    } catch (error) {
      console.error('Failed to remove from wishlist:', error);
      res.status(500).json({ message: "Failed to remove from wishlist" });
    }
  });

  // Check if product is in wishlist
  app.get("/api/wishlist/check/:productId", requireUserAuth, async (req: any, res) => {
    try {
      const { productId } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }

      const isInWishlist = await storage.isProductInWishlist(userId, productId);
      res.json({ isInWishlist });
    } catch (error) {
      console.error('Failed to check wishlist status:', error);
      res.status(500).json({ message: "Failed to check wishlist status" });
    }
  });

  // Get product groups
  app.get("/api/product-groups", async (_req, res) => {
    try {
      res.set('Cache-Control', 'no-store');
      const productGroups = await storage.getProductGroups();
      res.json(productGroups);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch product groups" });
    }
  });

  // SellAuth webhook endpoint for automatic delivery
  app.post("/api/webhooks/sellauth", async (req, res) => {
    try {
      const { order_id, product_id, customer_email, customer_name } = req.body;
      
      // Get product details
      const product = await storage.getProduct(product_id);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      
      // Generate delivery response based on product type
      const deliveryContent: any = {};
      
      // Add delivery content based on product type
      if (product.deliveryUrl) {
        deliveryContent.download_url = product.deliveryUrl;
      }
      if (product.licenseKey) {
        deliveryContent.license_key = product.licenseKey;
      }
      
      const deliveryData = {
        order_id,
        customer_email,
        product_name: product.name,
        delivery_method: product.deliveryType || "download",
        delivery_content: deliveryContent
      };
      
      // Here you could also:
      // - Send email with product details
      // - Generate temporary download links
      // - Create user accounts
      // - Deliver game accounts/credentials
      
      res.json({
        success: true,
        message: "Product delivered successfully",
        delivery: deliveryData
      });
      
    } catch (error) {
      console.error("Webhook error:", error);
      res.status(500).json({ message: "Delivery failed" });
    }
  });

  // Generate secure download link endpoint
  app.get("/api/download/:productId/:token", async (req, res) => {
    try {
      // Validate token and product access
      const { productId, token } = req.params;
      
      // In production, verify the token is valid and hasn't expired
      // For now, just return the product's delivery URL
      const product = await storage.getProduct(productId);
      if (!product || !product.deliveryUrl) {
        return res.status(404).json({ message: "Download not found" });
      }
      
      // Redirect to actual file or return download info
      res.json({
        product_name: product.name,
        download_url: product.deliveryUrl,
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
      });
      
    } catch (error) {
      res.status(500).json({ message: "Download failed" });
    }
  });

  // Support ticket submission
  app.post("/api/support", async (req, res) => {
    try {
      const validatedData = insertSupportTicketSchema.parse(req.body);
      const ticket = await storage.createSupportTicket(validatedData);
      res.status(201).json({
        success: true,
        message: "Support ticket created successfully",
        ticket: {
          id: ticket.id,
          status: ticket.status,
          createdAt: ticket.createdAt
        }
      });
    } catch (error) {
      console.error("Support ticket creation error:", error);
      res.status(400).json({ 
        success: false,
        message: "Failed to create support ticket"
      });
    }
  });

  // Admin authentication middleware
  const requireAdminAuth = (req: any, res: any, next: any) => {
    if (req.session?.isAdmin) {
      return next();
    }
    return res.status(401).json({ message: 'Unauthorized' });
  };

  // Admin login
  app.post("/api/admin/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      
      // Simple authentication with provided credentials
      if (username === 'pdcheats' && password === 'Astras08!') {
        req.session!.isAdmin = true;
        res.json({ success: true, message: 'Login successful' });
      } else {
        res.status(401).json({ message: 'Invalid credentials' });
      }
    } catch (error) {
      res.status(500).json({ message: 'Login failed' });
    }
  });

  // Admin auth check
  app.get("/api/admin/check", requireAdminAuth, (req, res) => {
    res.json({ authenticated: true });
  });

  // Admin logout
  app.post("/api/admin/logout", (req, res) => {
    req.session.destroy(() => {
      res.json({ success: true });
    });
  });

  // Get all orders (admin only)
  app.get("/api/admin/orders", requireAdminAuth, async (req, res) => {
    try {
      const orders = await storage.getOrders();
      res.json(orders);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch orders' });
    }
  });

  // Update order status (admin only)
  app.patch("/api/admin/orders/:id/status", requireAdminAuth, async (req, res) => {
    try {
      const { status } = req.body;
      const order = await storage.updateOrderStatus(req.params.id, status);
      if (!order) {
        return res.status(404).json({ message: 'Order not found' });
      }
      res.json(order);
    } catch (error) {
      res.status(500).json({ message: 'Failed to update order status' });
    }
  });

  // Update order license key (admin only)
  app.patch("/api/admin/orders/:id/license", requireAdminAuth, async (req, res) => {
    try {
      const { licenseKey, downloadUrl } = req.body;
      const order = await storage.updateOrderLicenseKey(req.params.id, licenseKey, downloadUrl);
      if (!order) {
        return res.status(404).json({ message: 'Order not found' });
      }
      res.json(order);
    } catch (error) {
      res.status(500).json({ message: 'Failed to update order license key' });
    }
  });

  // Create order (from checkout) - requires authentication
  app.post("/api/orders", requireUserAuth, async (req, res) => {
    try {
      const orderData = {
        ...req.body,
        userId: req.user!.id
      };
      const order = await storage.createOrder(orderData);
      res.status(201).json(order);
    } catch (error) {
      res.status(500).json({ message: 'Failed to create order' });
    }
  });

  // Get user orders (authenticated)
  app.get("/api/orders", requireUserAuth, async (req, res) => {
    try {
      const { orderId } = req.query;
      const userId = req.user!.id;
      
      if (orderId) {
        // Get specific order
        const order = await storage.getUserOrder(orderId as string, userId);
        if (!order) {
          return res.status(404).json({ message: 'Order not found' });
        }
        res.json(order);
      } else {
        // Get all orders for this user
        const userOrders = await storage.getUserOrders(userId);
        res.json(userOrders);
      }
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch orders' });
    }
  });

  // User Profile Management Routes
  
  // Get current user profile
  app.get("/api/profile", requireUserAuth, async (req, res) => {
    try {
      const user = req.user!;
      // Remove password from response for security
      const { password, ...userProfile } = user;
      res.json(userProfile);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch profile' });
    }
  });

  // Update user profile
  app.patch("/api/profile", requireUserAuth, async (req, res) => {
    try {
      const userId = req.user!.id;
      const updateData = req.body;
      
      // Don't allow updating password or id through this endpoint
      delete updateData.password;
      delete updateData.id;
      
      const updatedUser = await storage.updateUserProfile(userId, updateData);
      if (!updatedUser) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      // Remove password from response
      const { password, ...userProfile } = updatedUser;
      res.json(userProfile);
    } catch (error) {
      res.status(500).json({ message: 'Failed to update profile' });
    }
  });

  // Change password
  app.patch("/api/profile/password", requireUserAuth, async (req, res) => {
    try {
      const { currentPassword, newPassword } = req.body;
      const userId = req.user!.id;
      
      if (!currentPassword || !newPassword) {
        return res.status(400).json({ message: 'Current password and new password are required' });
      }
      
      const success = await storage.changeUserPassword(userId, currentPassword, newPassword);
      if (!success) {
        return res.status(400).json({ message: 'Current password is incorrect' });
      }
      
      res.json({ message: 'Password updated successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Failed to update password' });
    }
  });

  // Upload avatar
  app.post("/api/profile/avatar", requireUserAuth, async (req, res) => {
    try {
      const { avatar } = req.body; // Base64 encoded image or URL
      const userId = req.user!.id;
      
      if (!avatar) {
        return res.status(400).json({ message: 'Avatar data is required' });
      }
      
      const updatedUser = await storage.updateUserAvatar(userId, avatar);
      if (!updatedUser) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      res.json({ avatar: updatedUser.avatar });
    } catch (error) {
      res.status(500).json({ message: 'Failed to upload avatar' });
    }
  });

  // Delete user account
  app.delete("/api/profile", requireUserAuth, async (req, res) => {
    try {
      const { password } = req.body;
      const userId = req.user!.id;
      
      if (!password) {
        return res.status(400).json({ message: 'Password confirmation required' });
      }
      
      const success = await storage.deleteUserAccount(userId, password);
      if (!success) {
        return res.status(400).json({ message: 'Incorrect password' });
      }
      
      // Destroy session after account deletion
      req.logout((err) => {
        if (err) {
          return res.status(500).json({ message: 'Failed to logout after account deletion' });
        }
        res.json({ message: 'Account deleted successfully' });
      });
    } catch (error) {
      res.status(500).json({ message: 'Failed to delete account' });
    }
  });

  // Discount Codes API Routes

  // Validate discount code (public - used during checkout)
  app.post("/api/discount-codes/validate", async (req, res) => {
    try {
      const { code, orderAmount } = req.body;
      
      if (!code) {
        return res.status(400).json({ message: 'Discount code is required' });
      }
      
      const discount = await storage.validateDiscountCode(code.toUpperCase());
      if (!discount) {
        return res.status(404).json({ message: 'Invalid or expired discount code' });
      }
      
      // Check minimum order amount
      if (orderAmount && parseFloat(orderAmount) < parseFloat(discount.minOrderAmount || '0')) {
        return res.status(400).json({ 
          message: `Minimum order amount of $${discount.minOrderAmount} required` 
        });
      }
      
      // Calculate discount amount
      let discountAmount = 0;
      if (discount.type === 'percentage') {
        discountAmount = (parseFloat(orderAmount || '0') * parseFloat(discount.value)) / 100;
      } else {
        discountAmount = parseFloat(discount.value);
      }
      
      res.json({
        code: discount.code,
        type: discount.type,
        value: discount.value,
        discountAmount,
        minOrderAmount: discount.minOrderAmount,
        valid: true
      });
    } catch (error) {
      res.status(500).json({ message: 'Failed to validate discount code' });
    }
  });

  // Admin discount code management routes (require admin auth)
  
  // Get all discount codes (admin only)
  app.get("/api/admin/discount-codes", requireUserAuth, async (req, res) => {
    try {
      // Check if user has admin role
      const user = req.user!;
      if (user.role !== 'admin') {
        return res.status(403).json({ message: 'Admin access required' });
      }
      
      const discountCodes = await storage.getAllDiscountCodes();
      res.json(discountCodes);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch discount codes' });
    }
  });
  
  // Create new discount code (admin only)
  app.post("/api/admin/discount-codes", requireUserAuth, async (req, res) => {
    try {
      // Check if user has admin role
      const user = req.user!;
      if (user.role !== 'admin') {
        return res.status(403).json({ message: 'Admin access required' });
      }
      
      const discountData = {
        ...req.body,
        createdBy: user.id
      };
      
      const discountCode = await storage.createDiscountCode(discountData);
      res.status(201).json(discountCode);
    } catch (error) {
      if (error?.message?.includes('unique') || error?.code === '23505') {
        return res.status(400).json({ message: 'Discount code already exists' });
      }
      res.status(500).json({ message: 'Failed to create discount code' });
    }
  });

  // Update discount code (admin only)
  app.put("/api/admin/discount-codes/:id", requireUserAuth, async (req, res) => {
    try {
      // Check if user has admin role
      const user = req.user!;
      if (user.role !== 'admin') {
        return res.status(403).json({ message: 'Admin access required' });
      }
      
      const { id } = req.params;
      const updateData = req.body;
      
      const updatedCode = await storage.updateDiscountCode(id, updateData);
      if (!updatedCode) {
        return res.status(404).json({ message: 'Discount code not found' });
      }
      
      res.json(updatedCode);
    } catch (error) {
      if (error?.message?.includes('unique') || error?.code === '23505') {
        return res.status(400).json({ message: 'Discount code already exists' });
      }
      res.status(500).json({ message: 'Failed to update discount code' });
    }
  });

  // Delete discount code (admin only)
  app.delete("/api/admin/discount-codes/:id", requireUserAuth, async (req, res) => {
    try {
      // Check if user has admin role
      const user = req.user!;
      if (user.role !== 'admin') {
        return res.status(403).json({ message: 'Admin access required' });
      }
      
      const { id } = req.params;
      
      const success = await storage.deleteDiscountCode(id);
      if (!success) {
        return res.status(404).json({ message: 'Discount code not found' });
      }
      
      res.json({ message: 'Discount code deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Failed to delete discount code' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
