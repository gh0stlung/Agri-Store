# Folder Structure

```
/
├── components/          # Reusable React components
│   ├── AIChatDrawer.tsx      # Gemni AI chat overlay
│   ├── AdminProtectedRoute.tsx # Rerouter for non-admin emails
│   ├── AppLayout.tsx         # Outermost scaffolding
│   ├── DeliveryProtectedRoute.tsx # PIN lock enforcement
│   ├── GlobalBottomNav.tsx   # Mobile navigation bar
│   ├── Header.tsx            # Contextual top bar
│   ├── ProductCard.tsx       # Standard catalog display item
│   ├── ProtectedRoute.tsx    # General user auth boundary
│   └── ScrollToTop.tsx       # Route change scroll reset
├── context/             # Global State Managers (React Context)
│   ├── AIContext.tsx         # Manages chat history and drawer state
│   ├── AuthContext.tsx       # Supabase session lifecycle
│   ├── CartContext.tsx       # Shopping cart operations Array
│   ├── NavigationContext.tsx # Centralized router navigation
│   ├── ThemeContext.tsx      # Dark/Light mode toggle
│   └── ToastContext.tsx      # Global notification popups
├── pages/               # Route Views (Bound in App.tsx)
│   ├── Admin.tsx
│   ├── AdminLogin.tsx
│   ├── Cart.tsx
│   ├── Catalog.tsx
│   ├── Contact.tsx
│   ├── DeliveryDashboard.tsx
│   ├── DeliveryLogin.tsx
│   ├── Developer.tsx
│   ├── Home.tsx
│   ├── Login.tsx
│   ├── MyOrders.tsx
│   ├── Order.tsx
│   ├── Profile.tsx
│   ├── TrackOrder.tsx
│   └── UserLogin.tsx
├── public/              # Static assets
├── src/                 # Utilities and config
│   └── lib/
│       └── supabase.ts  # Singleton client initialization
├── App.tsx              # Component Map / Route Definitions
├── index.html           # Entry HTML / PWA Config / CSS inject
├── index.tsx            # React DOM Bootstrapper
├── manifest.json        # PWA definitions
├── types.ts             # Global TypeScript Interfaces
├── vercel.json          # SPA rewrite rules for hosting
└── vite.config.ts       # Build configuration
```
