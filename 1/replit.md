# PlayDirty - Gaming Enhancement Platform

## Overview

PlayDirty is a full-stack e-commerce platform for gaming enhancement tools, cheats, and related digital products. The application provides a marketplace where users can browse products, make purchases via cryptocurrency, manage orders, and leave reviews. It features user authentication, an admin panel for order management, product recommendations, wishlist functionality, and a support ticket system.

The platform is built as a monorepo with a React frontend and Express backend, using PostgreSQL for data persistence and supporting cryptocurrency payments (Bitcoin, Ethereum, Litecoin).

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework**: React 18 with TypeScript, using Vite as the build tool and development server.

**Routing**: Client-side routing implemented with Wouter, a lightweight routing library. Protected routes are wrapped with authentication checks to ensure users are logged in before accessing sensitive pages.

**State Management**: TanStack Query (React Query) for server state management, caching, and data synchronization. Local state managed with React hooks.

**UI Components**: Shadcn UI component library built on Radix UI primitives, providing accessible and customizable components. Tailwind CSS for styling with a dark theme configuration.

**Key Features**:
- Product browsing with advanced search and filtering capabilities
- Product grouping system for variants (e.g., different duration licenses)
- User authentication with protected routes
- Shopping cart and checkout flow with cryptocurrency payment options
- User dashboard for order history and license key management
- Admin panel for order fulfillment
- Product reviews and ratings system
- Wishlist and recently viewed products
- Discount code system
- Support ticket submission
- FAQ section

### Backend Architecture

**Framework**: Express.js with TypeScript, running on Node.js.

**API Design**: RESTful API with session-based authentication using Passport.js (Local Strategy).

**Session Management**: Express-session with PostgreSQL session store (connect-pg-simple) for persistent sessions across server restarts.

**Authentication**: 
- User authentication via Passport.js with username/password
- Passwords hashed using Node.js crypto scrypt function with salt
- Separate admin authentication with session-based access control
- CSRF protection through Origin header validation for unsafe HTTP methods

**Security Considerations**:
- Trust proxy configuration for production deployment behind reverse proxies
- CORS configured for cross-origin requests with credentials support
- Environment variable validation in production
- Secure session cookies with configurable secret

**Key API Endpoints**:
- Product CRUD operations and search
- User registration and authentication
- Order creation and management
- Product reviews and ratings
- Wishlist management
- Recently viewed products tracking
- Discount code validation
- Support ticket submission
- FAQ retrieval
- Admin order fulfillment

### Data Storage

**Database**: PostgreSQL accessed via Neon serverless driver with WebSocket support.

**ORM**: Drizzle ORM for type-safe database queries and schema management.

**Schema Design**:
- `users` - User accounts with profile information, roles, and authentication data
- `products` - Product catalog with pricing, stock, delivery details, and rating aggregates
- `orders` - Purchase records with payment method, status, and fulfillment details
- `supportTickets` - Customer support requests with priority levels
- `productReviews` - User reviews with ratings, comments, images, and helpful votes
- `wishlists` - User saved products
- `recentlyViewed` - User browsing history for recommendations
- `discountCodes` - Promotional codes with validation rules
- `faqItems` - Frequently asked questions organized by category
- `referrals` - User referral tracking for rewards
- `userActivity` - Activity logging for analytics

**Key Design Decisions**:
- UUID primary keys for all tables (using `gen_random_uuid()`)
- Decimal type for monetary values to avoid floating-point precision issues
- Timestamps for created/updated tracking
- JSON text fields for flexible data (e.g., review images array)
- Aggregate fields on products (averageRating, reviewCount) for performance

### External Dependencies

**Database**: Neon Serverless PostgreSQL
- Serverless PostgreSQL with WebSocket connection support
- Connection pooling via `@neondatabase/serverless`
- Database migrations managed by Drizzle Kit

**Payment Processing**: Cryptocurrency wallets
- Bitcoin, Ethereum, and Litecoin payment options
- Manual order verification workflow (pending → confirmed → completed)
- No automated payment gateway integration (manual verification by admins)

**Third-Party Services**:
- Stripe integration dependencies present (`@stripe/react-stripe-js`, `@stripe/stripe-js`) but not actively used in current implementation
- Google Fonts for typography (Inter, DM Sans, Fira Code, Geist Mono, Architects Daughter)

**Development Tools**:
- Replit-specific plugins for development environment
- Runtime error overlay for development debugging
- Cartographer plugin for Replit code mapping

**Build & Deployment**:
- Vite for frontend bundling and development server
- ESBuild for backend bundling
- Environment variables for configuration (DATABASE_URL, SESSION_SECRET, CORS_ORIGIN)
- Production validation ensures critical environment variables are set

**Notable Architectural Patterns**:
- Storage abstraction layer (`server/storage.ts`) encapsulates all database operations
- Shared schema definitions between frontend and backend (`shared/schema.ts`)
- Path aliases for cleaner imports (`@/`, `@shared/`, `@assets/`)
- Zod schemas for runtime validation of API requests
- Session-based authentication with both user and admin contexts