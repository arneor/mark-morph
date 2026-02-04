---
description: Complete workflow to separate admin features into a standalone admin-client project
---

# MarkMorph Admin Separation Migration

## Overview
Separate the admin panel from `next-client` into a standalone `admin-client` project for:
- Independent deployments
- Better security isolation
- Cleaner codebase
- Subdomain routing (admin.markmorph.in)

---

## Phase 1: Create Admin Project

### Step 1.1: Initialize the admin-client project
// turbo
```bash
cd /Users/nidhin/My/DEVELOPMENT/BUSSINESS/WEB/mark-morph
npx -y create-next-app@latest admin-client --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --use-npm --no-turbopack
```

### Step 1.2: Install dependencies matching next-client
// turbo
```bash
cd /Users/nidhin/My/DEVELOPMENT/BUSSINESS/WEB/mark-morph/admin-client
npm install @tanstack/react-query@5 zod@4 react-hook-form@7 @hookform/resolvers@5 lucide-react@latest framer-motion@12 date-fns@4 recharts@3 class-variance-authority clsx tailwind-merge cmdk vaul @radix-ui/react-dialog @radix-ui/react-dropdown-menu @radix-ui/react-separator @radix-ui/react-tabs @radix-ui/react-toast @radix-ui/react-tooltip @radix-ui/react-label @radix-ui/react-slot @radix-ui/react-avatar @radix-ui/react-badge @radix-ui/react-popover @radix-ui/react-select @radix-ui/react-switch
```

---

## Phase 2: Copy Shared Resources

### Step 2.1: Copy UI components
// turbo
```bash
cp -r /Users/nidhin/My/DEVELOPMENT/BUSSINESS/WEB/mark-morph/next-client/src/components/ui /Users/nidhin/My/DEVELOPMENT/BUSSINESS/WEB/mark-morph/admin-client/src/components/
```

### Step 2.2: Copy lib utilities
// turbo
```bash
mkdir -p /Users/nidhin/My/DEVELOPMENT/BUSSINESS/WEB/mark-morph/admin-client/src/lib
cp /Users/nidhin/My/DEVELOPMENT/BUSSINESS/WEB/mark-morph/next-client/src/lib/utils.ts /Users/nidhin/My/DEVELOPMENT/BUSSINESS/WEB/mark-morph/admin-client/src/lib/
```

### Step 2.3: Copy hooks
// turbo
```bash
mkdir -p /Users/nidhin/My/DEVELOPMENT/BUSSINESS/WEB/mark-morph/admin-client/src/hooks
cp /Users/nidhin/My/DEVELOPMENT/BUSSINESS/WEB/mark-morph/next-client/src/hooks/use-toast.ts /Users/nidhin/My/DEVELOPMENT/BUSSINESS/WEB/mark-morph/admin-client/src/hooks/
cp /Users/nidhin/My/DEVELOPMENT/BUSSINESS/WEB/mark-morph/next-client/src/hooks/use-mobile.tsx /Users/nidhin/My/DEVELOPMENT/BUSSINESS/WEB/mark-morph/admin-client/src/hooks/
```

### Step 2.4: Copy Tailwind config
// turbo
```bash
cp /Users/nidhin/My/DEVELOPMENT/BUSSINESS/WEB/mark-morph/next-client/tailwind.config.ts /Users/nidhin/My/DEVELOPMENT/BUSSINESS/WEB/mark-morph/admin-client/
cp /Users/nidhin/My/DEVELOPMENT/BUSSINESS/WEB/mark-morph/next-client/src/app/globals.css /Users/nidhin/My/DEVELOPMENT/BUSSINESS/WEB/mark-morph/admin-client/src/app/
```

---

## Phase 3: Extract Admin Components

### Step 3.1: Create admin components directory and copy
// turbo
```bash
mkdir -p /Users/nidhin/My/DEVELOPMENT/BUSSINESS/WEB/mark-morph/admin-client/src/components/admin
cp /Users/nidhin/My/DEVELOPMENT/BUSSINESS/WEB/mark-morph/next-client/src/components/admin/AdminAnalytics.tsx /Users/nidhin/My/DEVELOPMENT/BUSSINESS/WEB/mark-morph/admin-client/src/components/admin/
```

### Step 3.2: Create providers directory
// turbo
```bash
mkdir -p /Users/nidhin/My/DEVELOPMENT/BUSSINESS/WEB/mark-morph/admin-client/src/components/providers
```

---

## Phase 4: Create Admin-Specific Files

### Step 4.1: Create admin API file
Create file: `admin-client/src/lib/api.ts`

This file should contain ONLY the admin-related API functions extracted from next-client:
- `API_BASE_URL` constant
- `ApiError` class
- `adminTokenStorage` object
- `adminApiRequest` function
- `AdminStats`, `AdminBusinessListItem`, `AdminBusinessDetails`, `AdminAnalyticsData`, `AdminTrendData` types
- `adminApi` object with all admin methods

### Step 4.2: Create Providers component
Create file: `admin-client/src/components/providers/Providers.tsx`

```tsx
'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState, type ReactNode } from 'react';

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
        refetchOnWindowFocus: false,
      },
    },
  }));

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
```

### Step 4.3: Create middleware.ts
Create file: `admin-client/middleware.ts`

```typescript
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const adminToken = request.cookies.get('mm_admin_token')?.value;
  const isLoginPage = request.nextUrl.pathname === '/login';
  const isProtectedRoute = !isLoginPage && !request.nextUrl.pathname.startsWith('/_next');

  // Redirect unauthenticated admin users
  if (isProtectedRoute && !adminToken) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Redirect authenticated admins away from login
  if (isLoginPage && adminToken) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
```

### Step 4.4: Create .env.local
Create file: `admin-client/.env.local`

```env
NEXT_PUBLIC_API_URL=https://mark-morph.onrender.com/api
NEXT_PUBLIC_APP_URL=https://admin.markmorph.in
NEXT_PUBLIC_CUSTOMER_APP_URL=https://www.markmorph.in
```

---

## Phase 5: Create Admin Routes

### Step 5.1: Create root layout
Replace content of: `admin-client/src/app/layout.tsx`

```tsx
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/providers/Providers';
import { Toaster } from '@/components/ui/toaster';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'MarkMorph Admin',
  description: 'Admin dashboard for MarkMorph platform',
  robots: 'noindex, nofollow',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
```

### Step 5.2: Create root page (redirect to login/dashboard)
Replace content of: `admin-client/src/app/page.tsx`

```tsx
import { redirect } from 'next/navigation';

export default function AdminRootPage() {
  redirect('/login');
}
```

### Step 5.3: Copy admin routes (manual file moves required)
Move/copy these files from next-client to admin-client:

| From (next-client) | To (admin-client) |
|---|---|
| `src/app/admin/login/page.tsx` | `src/app/login/page.tsx` |
| `src/app/admin/dashboard/page.tsx` | `src/app/dashboard/page.tsx` |
| `src/app/admin/business/[id]/page.tsx` | `src/app/business/[id]/page.tsx` |

### Step 5.4: Fix imports in copied files
After copying, update all imports in the admin routes:
- Change `'@/lib/api'` imports to only use admin exports
- Update router paths from `/admin/dashboard` to `/dashboard`
- Update router paths from `/admin/login` to `/login`
- Update router paths from `/admin/business/` to `/business/`

---

## Phase 6: Update Customer App (next-client)

### Step 6.1: Remove admin routes from next-client
// turbo
```bash
rm -rf /Users/nidhin/My/DEVELOPMENT/BUSSINESS/WEB/mark-morph/next-client/src/app/admin
rm -rf /Users/nidhin/My/DEVELOPMENT/BUSSINESS/WEB/mark-morph/next-client/src/components/admin
```

### Step 6.2: Clean up api.ts in next-client
Remove the following from `next-client/src/lib/api.ts`:
- Lines 640-976 (entire admin section including)
  - `ADMIN_TOKEN_KEY`, `ADMIN_USER_KEY`
  - `adminTokenStorage` object
  - `adminApiRequest` function
  - `AdminStats`, `AdminBusinessListItem`, `AdminBusinessDetails`, `AdminAnalyticsData`, `AdminTrendData` interfaces
  - `adminApi` object

---

## Phase 7: Verification

### Step 7.1: Build admin-client
// turbo
```bash
cd /Users/nidhin/My/DEVELOPMENT/BUSSINESS/WEB/mark-morph/admin-client
npm run build
```

### Step 7.2: Build next-client (ensure no breaks)
// turbo
```bash
cd /Users/nidhin/My/DEVELOPMENT/BUSSINESS/WEB/mark-morph/next-client
npm run build
```

### Step 7.3: Test admin-client locally
```bash
cd /Users/nidhin/My/DEVELOPMENT/BUSSINESS/WEB/mark-morph/admin-client
npm run dev
# Open http://localhost:3000/login
```

### Step 7.4: Test next-client locally
```bash
cd /Users/nidhin/My/DEVELOPMENT/BUSSINESS/WEB/mark-morph/next-client
npm run dev
# Open http://localhost:3000 - should work without admin routes
```

---

## Phase 8: Deployment

### Step 8.1: Deploy admin-client to Vercel
```bash
cd /Users/nidhin/My/DEVELOPMENT/BUSSINESS/WEB/mark-morph/admin-client
vercel --prod
# Set domain: admin.markmorph.in
```

### Step 8.2: Update DNS for subdomain
Add these DNS records:
```
Type    Name    Value                       TTL
CNAME   admin   cname.vercel-dns.com       Auto
```

### Step 8.3: Update backend CORS
Make sure your NestJS backend allows requests from both:
- https://www.markmorph.in
- https://admin.markmorph.in

---

## Final Structure

```
mark-morph/
├── next-client/              # Customer-facing app ONLY
│   └── src/app/
│       ├── (auth)/           # Customer auth (login, signup)
│       ├── dashboard/        # Customer dashboard
│       ├── splash/           # SSR splash pages
│       └── profile/          # Public profiles
│
├── admin-client/             # Admin app (NEW)
│   └── src/app/
│       ├── login/            # Admin login
│       ├── dashboard/        # Admin dashboard
│       └── business/[id]/    # Business details
│
└── backend/                  # NestJS API (unchanged)
```

---

## Checklist

### Pre-Migration
- [ ] Backup current project
- [ ] Document current admin functionality
- [ ] Ensure backend CORS is ready for both domains

### During Migration
- [ ] Create admin-client project
- [ ] Copy shared UI components
- [ ] Extract admin API logic
- [ ] Copy admin routes
- [ ] Update import paths
- [ ] Create middleware
- [ ] Configure environment variables

### Post-Migration
- [ ] Remove admin code from next-client
- [ ] Build both projects successfully
- [ ] Test admin login flow
- [ ] Test admin dashboard
- [ ] Test business details page
- [ ] Deploy to subdomains
- [ ] Update DNS
- [ ] Verify production

---

## Benefits Achieved

✅ **Independent Deployments** - Deploy admin updates without touching customer app
✅ **Security Isolation** - Different tokens, different attack surface
✅ **Performance** - Admin bundle doesn't bloat customer app
✅ **Team Scalability** - Different teams can own different apps
✅ **Cleaner Codebase** - Clear separation of concerns
✅ **Subdomain Routing** - admin.markmorph.in vs www.markmorph.in
