
# Admin Separation Walkthrough

## Overview
We have successfully separated the admin panel into its own project, `admin-client`. The original `next-client` is now exclusively for the customer-facing application.

## Key Changes
- **New Project:** `admin-client` created at the root.
- **Admin API:** Moved all admin-related API calls to `admin-client/src/lib/api.ts`.
- **Customer API:** Cleaned up `next-client/src/lib/api.ts` (removed admin code).
- **Routes:** Removed `/admin/*` routes from `next-client`.
- **Authentication:**  Admin auth now uses `mm_admin_token` and is fully isolated.

## How to Run Locally

### 1. Run Admin Client
```bash
cd admin-client
npm install
npm run dev
```
Access at: `http://localhost:3000` (or whatever port Next.js picks)

### 2. Run Customer Client
```bash
cd next-client
npm install
npm run dev
```
Access at: `http://localhost:3001`

## Deployment Instructions

### Admin Client (`admin.markmorph.in`)
1. **Push Code:** Commit changes and push to your repository.
2. **Vercel Project:** Create a NEW project on Vercel.
3. **Root Directory:** Set the "Root Directory" to `admin-client`.
4. **Environment Variables:**
   - `NEXT_PUBLIC_API_URL`: Your backend API URL (e.g., `https://mark-morph.onrender.com/api`)
   - `NEXT_PUBLIC_APP_URL`: `https://admin.markmorph.in`
   - `NEXT_PUBLIC_CUSTOMER_APP_URL`: `https://www.markmorph.in`

### Customer Client (`www.markmorph.in`)
1. **Vercel Project:** Go to your existing `next-client` project.
2. **Root Directory:** Ensure it is set to `next-client`.
3. **Redeploy:** Trigger a new deployment to apply the cleanup changes.

## Verification
- **Admin Login:** Go to the new admin URL. Try logging in.
- **Dashboard:** Verify stats and business lists load.
- **Customer App:** Verify normal user login and splash pages still work.
- **Security:** Try accessing `/admin` on the customer app - it should be a 404.
