# LINKBEET MVP Backend

High-performance NestJS backend for the LINKBEET Wi-Fi advertising platform.

## 🚀 Tech Stack

- **Framework**: NestJS (TypeScript)
- **Database**: MongoDB (Mongoose ODM)
- **Auth**: OTP-based (MSG91/Twilio) + JWT
- **Documentation**: Swagger/OpenAPI
- **File Storage**: Local filesystem (S3 ready)
- **Rate Limiting**: @nestjs/throttler

## 📁 Project Structure

```
backend/
├── src/
│   ├── common/                 # Shared utilities
│   │   ├── decorators/         # Custom decorators
│   │   ├── filters/            # Exception filters
│   │   ├── guards/             # Auth & role guards
│   │   └── interceptors/       # Response transformers
│   ├── modules/
│   │   ├── auth/               # OTP authentication
│   │   ├── business/           # Business owner management
│   │   ├── ads/                # Ad/Campaign management
│   │   ├── analytics/          # Ad tracking engine
│   │   ├── admin/              # Super admin oversight
│   │   ├── compliance/         # PM-WANI logging
│   │   └── health/             # Health checks
│   ├── app.module.ts
│   └── main.ts
├── uploads/                    # Media file storage
└── package.json
```

## 🔧 Installation

```bash
# Navigate to backend folder
cd backend

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Start MongoDB (if not running)
# Using Docker:
docker run -d -p 27017:27017 --name linkbeet-mongo mongo:7

# Run development server
npm run start:dev
```

## 🌐 API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/request-otp` | Request OTP for phone |
| POST | `/api/auth/verify-otp` | Verify OTP, get JWT |
| GET | `/api/auth/me` | Get current user |

### Business
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/business/register` | Register new business |
| GET | `/api/business/me` | Get current user's business |
| GET | `/api/business/dashboard` | Get dashboard statistics |
| PUT | `/api/business/:id` | Update business profile |
| GET | `/api/business/splash/:id` | Get splash page data (public) |

### Ads
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/ads/upload` | Upload media file |
| GET | `/api/ads/business/:businessId` | Get all ads for business |
| POST | `/api/ads/business/:businessId` | Create new ad |
| PUT | `/api/ads/business/:businessId/:adId` | Update ad |
| DELETE | `/api/ads/business/:businessId/:adId` | Delete ad |

### Analytics (Captive Portal)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/analytics/track` | Track ad view/click |
| POST | `/api/analytics/connect` | WiFi connect action |
| GET | `/api/analytics/summary/:businessId` | Get analytics summary |

### Admin
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/stats` | Platform statistics |
| GET | `/api/admin/businesses` | List all businesses |

## 📚 API Documentation

Once the server is running, visit:
- **Swagger UI**: http://localhost:3001/docs

## 🔐 Authentication Flow

1. User enters phone number
2. `POST /api/auth/request-otp` - OTP sent via MSG91 (dev mode: logs OTP)
3. User enters OTP
4. `POST /api/auth/verify-otp` - Returns JWT token
5. Use `Authorization: Bearer <token>` for protected routes

## 🏛️ PM-WANI Compliance

The system captures and stores:
- MAC Address
- Phone Number
- Login/Logout Timestamps
- Session Duration
- IP Address

**Data Retention**: 365-day TTL auto-deletion via MongoDB TTL index.

## 🎯 Google Review Redirect

When a user clicks "Connect WiFi":
1. Analytics logs the click event asynchronously
2. Returns the business's Google Review URL as `redirectUrl`
3. Frontend redirects user to the Google Review page

## 📊 Analytics Architecture

The analytics engine uses an **async tap pattern** for high concurrency:
- Interactions are tracked without blocking user response
- Uses `setImmediate()` to defer logging to next tick
- Ad view/click counters updated atomically

## 🧪 Development Mode

In development mode (`NODE_ENV=development`):
- OTPs are logged to console (not sent via SMS)
- CORS allows localhost origins
- Swagger documentation is enabled
- Mock data fallbacks for analytics

## 🔑 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | 3001 |
| `MONGODB_URI` | MongoDB connection string | localhost:27017/linkbeet_dev |
| `JWT_SECRET` | JWT signing secret | (required) |
| `JWT_EXPIRES_IN` | Token expiry | 7d |
| `MSG91_AUTH_KEY` | MSG91 API key | (optional for dev) |
| `CORS_ORIGINS` | Allowed origins | localhost:3000,5173 |

## 📦 Scripts

```bash
npm run start:dev   # Development with hot-reload
npm run build       # Build for production
npm run start:prod  # Run production build
npm run lint        # Run ESLint
npm run test        # Run tests
```

## 🚀 Deployment (AWS Mumbai)

For PM-WANI compliance, deploy to AWS Mumbai region:

```bash
# Build
npm run build

# Set production environment
export NODE_ENV=production
export MONGODB_URI=mongodb+srv://...

# Run with PM2
pm2 start dist/main.js --name linkbeet-api
```

## 📝 License

MIT
