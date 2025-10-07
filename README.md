# Digital Signage System

A comprehensive digital signage management system built with **Clean Architecture**, featuring a .NET 8 backend API with SignalR WebSocket support and Next.js 15 admin interface for device management, content scheduling, and real-time monitoring.

![Build Status](https://github.com/worawutcc/digitalsignage/workflows/CI/badge.svg)
![.NET Version](https://img.shields.io/badge/.NET-8.0-blue.svg)
![Next.js Version](https://img.shields.io/badge/Next.js-15-black.svg)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-14+-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

## ✨ New Feature: Post-Upload Assignment (Oct 2025)

A quick assignment workflow was added to the admin UI to let content managers assign uploaded media to users or schedules immediately after upload. This improves authoring speed and reduces follow-up steps.

Key points:
- Shows a Post-Upload Actions dialog after a successful upload with four actions: Assign to Users, Add to Schedule, Upload More, Done.
- Provides a Quick Assign dialog (React Hook Form + Zod) to create a schedule or select an existing schedule and pick users.
- Backend endpoint: `POST /api/media/{id}/quick-assign` performs schedule creation (optional) and user assignments atomically.

Files added/changed for this feature:
- Frontend:
  - `src/digital-signage-web/src/components/media/PostUploadActionsDialog.tsx` (NEW)
  - `src/digital-signage-web/src/components/media/QuickAssignDialog.tsx` (NEW)
  - `src/digital-signage-web/src/hooks/useQuickAssign.ts` (UPDATED)
  - `src/digital-signage-web/src/services/api/userApi.ts` (NEW)
  - `src/digital-signage-web/src/services/api/scheduleApi.ts` (NEW)
  - `src/digital-signage-web/src/types/quickAssign.ts` (NEW)
  - `src/digital-signage-web/src/app/media/components/UploadMediaModal.tsx` (UPDATED - integrated dialogs)
- Backend:
  - `src/DigitalSignage.Application/DTOs/Media/QuickAssignRequestDto.cs` (NEW)
  - `src/DigitalSignage.Application/DTOs/Media/QuickAssignResponseDto.cs` (NEW)
  - `src/DigitalSignage.Application/Services/MediaService.cs` (UPDATED - QuickAssignAsync)
  - `src/DigitalSignage.Api/Controllers/MediaController.cs` (UPDATED - POST /api/media/{id}/quick-assign)

Quick test (local):
1. Start backend API and frontend (see Quick Start below).
2. Upload a media file via Admin UI (Media → Upload).
3. After upload completes, confirm Post-Upload Actions dialog appears.
4. Choose "Assign to Users" → confirm Quick Assign dialog loads real users and schedules.
5. Submit assignment and verify success toast and that media appears in media list.

Environment note:
- Ensure `NEXT_PUBLIC_API_URL` points to your running backend (e.g. `http://localhost:5100`). See Frontend Setup below.

## 🏗️ Architecture

This project follows **Clean Architecture** principles with separate backend and frontend applications:

### Backend (.NET 8 Web API)
```
src/
├── DigitalSignage.Api/           # Web API + Controllers (Presentation)
├── DigitalSignage.Application/   # Business Logic + Services + DTOs
├── DigitalSignage.Domain/        # Core Entities + Business Rules
└── DigitalSignage.Infrastructure/ # Data Access + External Services

tests/
├── DigitalSignage.Api.Tests/
├── DigitalSignage.Application.Tests/
├── DigitalSignage.Domain.Tests/
└── DigitalSignage.Infrastructure.Tests/
```

### Frontend (Next.js 15)
```
src/digital-signage-web/
├── src/
│   ├── app/              # Next.js App Router pages
│   ├── components/       # Reusable UI components
│   ├── features/         # Feature-based modules
│   ├── hooks/            # Custom React hooks
│   ├── lib/              # Utilities & configurations
│   ├── store/            # Redux Toolkit state management
│   └── types/            # TypeScript type definitions
└── tests/                # Jest & Playwright tests
```

## ✨ Key Features

### 🎯 Core Functionality
- **Device Management**: Register, provision, and monitor digital signage devices
- **Content Management**: Upload, organize, and manage media files (images, videos, HTML)
- **Scheduling System**: Time-based content scheduling with priorities and recurrence
- **Playlist Management**: Create and manage content playlists with automatic fallback
- **User Management**: Role-based access control with comprehensive permission system
- **Device Groups**: Hierarchical organization with path-based structure
- **Real-time Monitoring**: WebSocket-based live updates and device status tracking

### 🖥️ Admin Interface (Next.js 15)
- **Modern Dashboard**: Real-time device monitoring with interactive charts
- **Responsive Design**: Mobile-first UI with Tailwind CSS 4
- **State Management**: Redux Toolkit for global state + React Query for server state
- **Form Validation**: React Hook Form with Zod schema validation
- **Real-time Updates**: WebSocket integration for live notifications
- **Accessibility**: WCAG compliant with keyboard navigation support
- **Performance Monitoring**: Built-in performance tracking and optimization

### 🔐 Security & Authentication
- **JWT Authentication**: Secure API access with refresh token support
- **Role-Based Authorization**: Admin, User, and Device-level permissions with granular control
- **Device Key Authentication**: Secure device-to-server communication
- **AWS S3 Integration**: Secure media storage with presigned URLs
- **Permission Auditing**: Complete audit trail of permission changes
- **User-Device Associations**: Fine-grained access control per device/group

### � Real-time Communication (SignalR WebSockets)
- **Live Dashboard Updates**: Real-time device status monitoring
- **Background Services**: DeviceHeartbeatService and WebSocketHeartbeatService for continuous monitoring
- **Notification System**: Real-time alerts for device status changes, registration requests, and system events
- **Connection Management**: Authenticated WebSocket connections with automatic reconnection
- **Event Broadcasting**: Admin notifications, device alerts, and system status updates

### �📊 Audit Trail System
- **Automatic Audit Logging**: All entity changes tracked automatically with PostgreSQL `timestamp without time zone`
- **BaseEntity Pattern**: Consistent audit fields across all domain entities with proper DateTime handling
- **User Context Integration**: Links all changes to authenticated users
- **Performance Optimized**: < 10% overhead for bulk operations
- **DateTime Compliance**: All database DateTime operations use `DateTimeKind.Unspecified` for PostgreSQL compatibility

### 📱 Android TV Support
- **Self-Registration**: PIN-based device registration workflow with QR code support
- **Admin Approval**: Secure device provisioning with admin oversight
- **Heartbeat Monitoring**: Real-time device status tracking
- **Content Synchronization**: Automatic content updates to devices
- **Registration Methods**: Support for both QR code and manual PIN entry

### 👤 User-Based Content Assignment (Feature 019)
- **Personalized Content Delivery**: Assign specific schedules to individual users
- **Three-Tier Priority System**: User schedules → Device group schedules → Default schedules
- **Email-Based Auto-Matching**: Automatic user identification during device registration
- **Replace Semantics**: Schedule assignments replace (not append) existing assignments
- **Real-time Change Detection**: Heartbeat detects user assignment changes and triggers content refresh
- **Presigned URLs**: Secure 24-hour access to media files via AWS S3
- **Audit Trail**: Complete tracking of schedule assignments and changes

## 🚀 Quick Start

### Prerequisites

**Backend:**
- .NET 8 SDK
- PostgreSQL 14+
- AWS S3 account (for media storage)

**Frontend:**
- Node.js 18+ and npm
- Modern web browser

### Backend Setup

1. **Clone the repository**
```bash
git clone https://github.com/worawutcc/digitalsignage.git
cd digital_signage
```

2. **Configure database connection**
```json
// src/DigitalSignage.Api/appsettings.Development.json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Database=digital_signage;Username=postgres;Password=your_password"
  }
}
```

3. **Configure AWS S3** (optional for development)
```json
{
  "AWS": {
    "AccessKey": "your-access-key",
    "SecretKey": "your-secret-key",
    "BucketName": "your-bucket-name",
    "Region": "us-east-1"
  }
}
```

4. **Run database migrations**
```bash
dotnet ef database update -p src/DigitalSignage.Infrastructure -s src/DigitalSignage.Api
```

5. **Start the backend API**
```bash
dotnet run --project src/DigitalSignage.Api --environment Development
```

6. **Access the API**
- API: `http://localhost:5100`
- Swagger UI: `http://localhost:5100/swagger`
- Health Checks: `http://localhost:5100/health`
- SignalR WebSocket: `ws://localhost:5100/ws` (requires authentication)

### Frontend Setup

1. **Navigate to frontend directory**
```bash
cd src/digital-signage-web
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment**
```bash
# Create .env.local file
NEXT_PUBLIC_API_URL=http://localhost:5100
NEXT_PUBLIC_WS_URL=ws://localhost:5100/ws
NEXT_PUBLIC_ENABLE_WEBSOCKET=true
```

4. **Start development server**
```bash
npm run dev
```

5. **Access the admin interface**
- Admin UI: `http://localhost:3000`
- Login with default admin credentials (see database seeder)

### Production Build (Frontend)
```bash
npm run build
npm run start
```

## 🗄️ Database Schema

### Core Entities
- **Users**: System administrators and content managers
- **Devices**: Digital signage display devices
- **DeviceGroups**: Logical grouping of devices
- **Media**: Uploaded content files (images, videos, HTML)
- **Schedules**: Content scheduling configurations
- **Playlists**: Content sequence management

### Audit Trail & Database Configuration
All business entities inherit from `BaseEntity` and include:
- `created_at` - Entity creation timestamp (PostgreSQL `timestamp without time zone`)
- `updated_at` - Last modification timestamp (PostgreSQL `timestamp without time zone`)
- `created_by` - User who created the entity
- `updated_by` - User who last modified the entity

**Critical Database Configuration:**
- All DateTime properties must use `DateTimeKind.Unspecified` for PostgreSQL compatibility
- Entity configurations use `.HasColumnType("timestamp without time zone")`
- BaseEntity pattern ensures consistent audit field handling across all entities

## 🔧 Development

### Backend Development

#### Running Tests
```bash
# Run all tests
dotnet test

# Run specific test project
dotnet test tests/DigitalSignage.Infrastructure.Tests/

# Run with coverage
dotnet test --collect:"XPlat Code Coverage"
```

#### Database Operations
```bash
# Add new migration
dotnet ef migrations add <MigrationName> -p src/DigitalSignage.Infrastructure -s src/DigitalSignage.Api

# Update database
dotnet ef database update -p src/DigitalSignage.Infrastructure -s src/DigitalSignage.Api

# Remove last migration
dotnet ef migrations remove -p src/DigitalSignage.Infrastructure -s src/DigitalSignage.Api
```

### Frontend Development

#### Running Tests
```bash
cd src/digital-signage-web

# Unit tests with Jest
npm run test

# E2E tests with Playwright
npm run test:e2e

# Type checking
npm run type-check

# Linting
npm run lint
```

#### Development Commands
```bash
# Start development server with hot reload
npm run dev

# Production build
npm run build

# Start production server
npm run start

# Code formatting
npm run format
```

### ⚠️ PostgreSQL DateTime Configuration (CRITICAL)

**PostgreSQL `timestamp without time zone` Requirement:**
All DateTime fields in the database use `timestamp without time zone` to avoid timezone conversion issues. All application code must comply with this pattern.

**Common Error:**
```
System.ArgumentException: Cannot write DateTime with Kind=UTC to PostgreSQL type 'timestamp without time zone'
```

**Correct Implementation:**
```csharp
// ✅ CORRECT: For database operations
entity.CreatedAt = DateTime.SpecifyKind(DateTime.UtcNow, DateTimeKind.Unspecified);
entity.UpdatedAt = DateTime.SpecifyKind(DateTime.UtcNow, DateTimeKind.Unspecified);

// ✅ CORRECT: For query parameters
var cutoffTime = DateTime.SpecifyKind(DateTime.UtcNow.AddDays(-7), DateTimeKind.Unspecified);

// ❌ INCORRECT: Will cause runtime errors
entity.CreatedAt = DateTime.UtcNow; // Has DateTimeKind.Utc
```

**Entity Configuration Pattern:**
```csharp
// BaseEntityConfiguration.cs - Applied to all entities
builder.Property(e => e.CreatedAt)
    .IsRequired()
    .HasColumnType("timestamp without time zone")
    .HasDefaultValueSql("NOW() AT TIME ZONE 'UTC'");
```

**Fixed Services:**
- ✅ DeviceService, BulkOperationsService, UserDeviceAssociationService
- ✅ DeviceRegistrationService, DeviceMonitoringService 
- ✅ DeviceHeartbeatService (background service)

All services now properly handle DateTime conversion for PostgreSQL compatibility.

## 📋 API Endpoints

### Authentication
```
POST /api/auth/login          # User login
POST /api/auth/register       # User registration  
POST /api/auth/refresh        # Refresh JWT token
POST /api/auth/logout         # User logout
```

### Device Management
```
POST /api/devices/provision              # Register new device
POST /api/devices/heartbeat              # Device status update
GET  /api/devices/{id}/schedule          # Get device content schedule
PUT  /api/devices/{id}                   # Update device configuration
GET  /api/devices                        # List all devices
DELETE /api/devices/{id}                 # Delete device
```

### Device Groups & Hierarchy
```
GET    /api/devicegroups                 # List device groups
POST   /api/devicegroups                 # Create device group
GET    /api/devicegroups/{id}            # Get device group details
PUT    /api/devicegroups/{id}            # Update device group
DELETE /api/devicegroups/{id}            # Delete device group
POST   /api/devicegroups/{id}/move       # Move group in hierarchy
GET    /api/devicegroups/{id}/path       # Get group path
GET    /api/devicegroups/tree            # Get full hierarchy tree
```

### User Management & Permissions
```
GET    /api/users                        # List users
POST   /api/users                        # Create user
GET    /api/users/{id}                   # Get user details
PUT    /api/users/{id}                   # Update user
DELETE /api/users/{id}                   # Delete user
GET    /api/users/{id}/permissions       # Get user permissions
POST   /api/users/{id}/permissions       # Set user permissions
```

### Admin Permission Management
```
GET    /api/admin/permissions/users/{userId}           # Get user permissions
POST   /api/admin/permissions/users/{userId}           # Set permissions
PUT    /api/admin/permissions/{permissionId}           # Update permission
DELETE /api/admin/permissions/{permissionId}           # Delete permission
GET    /api/admin/permissions/audit                    # Get audit log
```

### Device Registration (Android TV)
```
POST /api/device-registration/initiate-qr      # Initiate QR registration
POST /api/device-registration/verify-pin       # Verify PIN code
GET  /api/device-registration/status/{code}    # Check registration status
POST /api/admin/device-registration/approve    # Approve registration
POST /api/admin/device-registration/reject     # Reject registration
GET  /api/admin/device-registration/pending    # List pending registrations
```

### Content Management
```
GET    /api/media                        # List media files
POST   /api/media/upload                 # Upload new media
GET    /api/media/{id}/url               # Get presigned download URL
DELETE /api/media/{id}                   # Delete media file
PUT    /api/media/{id}                   # Update media metadata
```

### Scheduling
```
GET    /api/schedules                    # List schedules
POST   /api/schedules                    # Create new schedule
PUT    /api/schedules/{id}               # Update schedule
DELETE /api/schedules/{id}               # Delete schedule
GET    /api/schedules/device/{deviceId}  # Get device schedules
```

### WebSocket Real-Time Events (SignalR)

**Endpoint**: `ws://localhost:5100/ws?access_token=<JWT_TOKEN>`  
**Protocol**: SignalR over WebSocket with automatic reconnection

Provides real-time bidirectional communication for admin dashboard updates and device monitoring. Authenticated connections receive live event notifications for system state changes.

#### Background Services
- **DeviceHeartbeatService**: Monitors device connectivity and automatically updates device status (Online/Offline)
- **WebSocketHeartbeatService**: Maintains WebSocket connections with 15-second heartbeat intervals
- **DeviceNotificationService**: Broadcasts device-related events to connected clients
- **RealtimeEventBroadcaster**: Manages event distribution to appropriate user groups

#### Event Types
- **`device_status_changed`** - Device online/offline/error state changes
- **`device_registered`** - New device registration requests
- **`device_approved`** - Device registration approvals
- **`schedule_conflict_detected`** - Schedule overlap conflicts during creation/update
- **`schedule_updated`** - Schedule CRUD operations (created/updated/deleted)
- **`media_uploaded`** - Media file upload completion
- **`user_action`** - Admin user actions (admin-only)
- **`system_alert`** - Critical system alerts (admin-only)
- **`heartbeat`** - Connection keepalive (sent every 15 seconds)

#### Connection Requirements
- **Authentication**: Valid JWT token required (query parameter or Authorization header)
- **Authorization**: Role-based event filtering (admins see all events, users see limited events)
- **Automatic Reconnection**: Built-in retry logic with exponential backoff
- **Connection Logging**: All connections tracked in WebSocketConnectionLogs table

#### Event Message Format
```json
{
  "type": "device_status_changed",
  "payload": {
    "deviceId": "device-123",
    "deviceKey": "ABC123DEF456",
    "status": "offline",
    "lastSeen": "2025-10-03T10:00:00Z",
    "location": "Conference Room A"
  },
  "timestamp": "2025-10-03T10:00:01.123Z"
}
```

#### Client Implementation (TypeScript + React)
```javascript
import * as signalR from '@microsoft/signalr';

// Connection setup with authentication
const connection = new signalR.HubConnectionBuilder()
  .withUrl('http://localhost:5100/ws', {
    accessTokenFactory: () => localStorage.getItem('jwt_token'),
    skipNegotiation: true,
    transport: signalR.HttpTransportType.WebSockets
  })
  .withAutomaticReconnect([0, 2000, 10000, 30000])
  .configureLogging(signalR.LogLevel.Information)
  .build();

// Event handlers
connection.on('ReceiveEvent', (event) => {
  console.log('Event received:', event.type, event.payload);
  
  switch (event.type) {
    case 'device_status_changed':
      updateDeviceStatus(event.payload);
      break;
    case 'device_registered':
      showRegistrationNotification(event.payload);
      break;
    case 'heartbeat':
      updateConnectionStatus('connected');
      break;
  }
});

// Connection lifecycle
connection.onreconnecting(() => {
  console.log('Reconnecting to SignalR...');
  updateConnectionStatus('reconnecting');
});

connection.onreconnected(() => {
  console.log('Reconnected to SignalR');
  updateConnectionStatus('connected');
});

connection.onclose(() => {
  console.log('SignalR connection closed');
  updateConnectionStatus('disconnected');
});

// Start connection
try {
  await connection.start();
  console.log('Connected to SignalR hub');
  updateConnectionStatus('connected');
} catch (error) {
  console.error('SignalR connection failed:', error);
  updateConnectionStatus('error');
}
```

#### Production Configuration
- **Load Balancing**: Sticky sessions required for SignalR
- **Scaling**: Redis backplane for multi-instance deployments
- **SSL**: WSS (WebSocket Secure) for production environments
- **Rate Limiting**: Connection and message rate limiting implemented

See [WebSocket Connection Flow](specs/018-api-implement-websocket/contracts/connection-flow.md) for detailed documentation.

### User-Based Content Assignment (Feature 019)

Assign personalized schedules to users with automatic priority-based content delivery:

**1. Assign schedules to a user:**
```bash
POST /api/admin/users/42/schedules
Authorization: Bearer {admin_jwt_token}
Content-Type: application/json

{
  "scheduleIds": [10, 15, 20]
}
```

**2. Device registration with user identification:**
```bash
POST /api/device-registration/initiate-qr
Content-Type: application/json

{
  "macAddress": "AA:BB:CC:DD:EE:FF",
  "deviceModel": "Samsung Smart TV",
  "androidVersion": "11.0",
  "appVersion": "2.1.0",
  "requestedUsername": "john.doe@company.com",
  "requestedUserDisplayName": "John Doe"
}
```

**3. Device retrieves personalized content:**
```bash
GET /api/device/next-schedule
Authorization: DeviceKey {device_key}
```

Response with three-tier priority logic:
```json
{
  "scheduleId": 10,
  "scheduleName": "Marketing Campaign Q4",
  "source": "UserAssignment",
  "assignedUser": {
    "userId": 42,
    "email": "john.doe@company.com",
    "displayName": "John Doe"
  },
  "media": [
    {
      "mediaId": 100,
      "fileName": "campaign-video.mp4",
      "mediaType": "Video",
      "duration": 30,
      "presignedUrl": "https://s3.amazonaws.com/...",
      "displayOrder": 1
    }
  ]
}
```

**Priority Logic:**
1. **User-Specific** (source: "UserAssignment") - If device has AssignedUserId
2. **Device Group** (source: "DeviceGroup") - If device belongs to a group
3. **Default** (source: "Default") - Fallback content marked as IsDefault
4. **None** (source: "None") - No active schedules available

Full API documentation available at `/swagger` when running the application.

## 🏷️ Environment Configuration

### Backend API Configuration

#### Development (`appsettings.Development.json`)
```json
{
  "DatabaseProvider": "PostgreSQL",
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Database=digital_signage_dev;Username=postgres;Password=your_password"
  },
  "AWS": {
    "Profile": "default",
    "Region": "us-east-1",
    "S3": {
      "BucketName": "digital-signage-dev"
    }
  },
  "Jwt": {
    "Key": "your-secret-key-min-32-characters",
    "Issuer": "DigitalSignage",
    "Audience": "DigitalSignageUsers",
    "ExpiryMinutes": 60
  },
  "Logging": {
    "LogLevel": {
      "Default": "Debug",
      "Microsoft.AspNetCore": "Information"
    }
  }
}
```

#### Production (`appsettings.Production.json`)
```json
{
  "DatabaseProvider": "PostgreSQL",
  "ConnectionStrings": {
    "DefaultConnection": "Host=prod-db;Database=digital_signage;Username=app_user;Password=***"
  },
  "AWS": {
    "Region": "us-east-1",
    "S3": {
      "BucketName": "digital-signage-prod"
    }
  },
  "Jwt": {
    "Key": "***",
    "Issuer": "DigitalSignage",
    "Audience": "DigitalSignageUsers",
    "ExpiryMinutes": 30
  },
  "Logging": {
    "LogLevel": {
      "Default": "Warning",
      "Microsoft.AspNetCore": "Warning"
    }
  }
}
```

### Frontend Environment Variables

#### Development (`.env.local`)
```bash
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:5100
NEXT_PUBLIC_API_TIMEOUT=30000

# WebSocket Configuration
NEXT_PUBLIC_WS_URL=ws://localhost:5100/ws
NEXT_PUBLIC_ENABLE_WEBSOCKET=true
NEXT_PUBLIC_WS_RECONNECT_INTERVAL=5000

# Authentication
NEXT_PUBLIC_AUTH_TOKEN_KEY=ds_auth_token
NEXT_PUBLIC_REFRESH_TOKEN_KEY=ds_refresh_token

# Feature Flags
NEXT_PUBLIC_ENABLE_ANALYTICS=false
NEXT_PUBLIC_ENABLE_DEBUG=true
NEXT_PUBLIC_ENABLE_REALTIME_NOTIFICATIONS=true

# Upload Configuration
NEXT_PUBLIC_MAX_FILE_SIZE=52428800
NEXT_PUBLIC_ALLOWED_FILE_TYPES=image/jpeg,image/png,video/mp4

# Application metadata
NEXT_PUBLIC_APP_NAME=Digital Signage Admin
NEXT_PUBLIC_APP_VERSION=1.2.0
```

#### Production (`.env.production`)
```bash
# API Configuration
NEXT_PUBLIC_API_URL=https://api.digitalsignage.com
NEXT_PUBLIC_API_TIMEOUT=30000

# WebSocket Configuration
NEXT_PUBLIC_WS_URL=wss://api.digitalsignage.com/ws
NEXT_PUBLIC_ENABLE_WEBSOCKET=true
NEXT_PUBLIC_WS_RECONNECT_INTERVAL=10000

# Authentication
NEXT_PUBLIC_AUTH_TOKEN_KEY=ds_auth_token
NEXT_PUBLIC_REFRESH_TOKEN_KEY=ds_refresh_token

# Feature Flags
NEXT_PUBLIC_ENABLE_ANALYTICS=true
NEXT_PUBLIC_ENABLE_DEBUG=false
NEXT_PUBLIC_ENABLE_REALTIME_NOTIFICATIONS=true

# Upload Configuration
NEXT_PUBLIC_MAX_FILE_SIZE=52428800
NEXT_PUBLIC_ALLOWED_FILE_TYPES=image/jpeg,image/png,video/mp4,application/pdf

# Application metadata
NEXT_PUBLIC_APP_NAME=Digital Signage Admin
NEXT_PUBLIC_APP_VERSION=1.2.0
```

**Important:** Never commit `.env.local` or `.env.production` files. Use `.env.example` as template.

## 🐳 Docker Deployment

### Using Docker Compose

#### Full Stack (Backend + Frontend + Database)
```yaml
# docker-compose.yml
version: '3.8'
services:
  database:
    image: postgres:15
    environment:
      POSTGRES_DB: digital_signage
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: your_password
    volumes:
      - pgdata:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  api:
    build: 
      context: .
      dockerfile: src/DigitalSignage.Api/Dockerfile
    environment:
      - ConnectionStrings__DefaultConnection=Host=database;Database=digital_signage;Username=postgres;Password=your_password
      - ASPNETCORE_ENVIRONMENT=Production
      - AWS__Region=us-east-1
      - AWS__S3__BucketName=digital-signage-prod
      - ASPNETCORE_URLS=http://+:8080
    ports:
      - "5100:8080"
    depends_on:
      - database

  web:
    build:
      context: src/digital-signage-web
      dockerfile: Dockerfile
    environment:
      - NEXT_PUBLIC_API_URL=http://api:8080
      - NEXT_PUBLIC_WS_URL=ws://api:8080/ws
      - NEXT_PUBLIC_ENABLE_WEBSOCKET=true
    ports:
      - "3000:3000"
    depends_on:
      - api

volumes:
  pgdata:
```

#### Commands
```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f api
docker-compose logs -f web

# Stop services
docker-compose down

# Rebuild and restart
docker-compose up -d --build
```

### Manual Docker Build

#### Backend API
```bash
# Build image
docker build -t digital-signage-api -f src/DigitalSignage.Api/Dockerfile .

# Run container
docker run -p 5100:8080 \
  -e ConnectionStrings__DefaultConnection="Host=host.docker.internal;Database=digital_signage;Username=postgres;Password=your_password" \
  -e ASPNETCORE_ENVIRONMENT=Production \
  -e ASPNETCORE_URLS=http://+:8080 \
  -e AWS__Region=us-east-1 \
  -e AWS__S3__BucketName=digital-signage-prod \
  digital-signage-api
```

#### Frontend Web
```bash
# Build image
cd src/digital-signage-web
docker build -t digital-signage-web .

# Run container
docker run -p 3000:3000 \
  -e NEXT_PUBLIC_API_URL=http://localhost:5000 \
  digital-signage-web
```

### Production Deployment

#### AWS ECS / Kubernetes
- Use multi-stage builds for optimized images
- Configure health checks for both services
- Set up load balancer for frontend
- Use AWS RDS for PostgreSQL database
- Configure AWS S3 for media storage
- Set up CloudWatch for logging and monitoring

## 📊 Monitoring & Health Checks

### Backend Health Check Endpoints
- `/health` - Overall system health
- `/health/ready` - Application readiness
- `/health/live` - Application liveness

### Backend Metrics
- Database connectivity
- AWS S3 connectivity
- Memory usage
- Response times
- API endpoint performance

### Logging

#### Backend (API)
- Structured logging with log4net
- Request/response logging
- Error tracking and stack traces
- Audit trail logging (all entity changes)
- Rolling file appender + console output

#### Frontend (Web)
- Browser console logging (development)
- Error boundary capturing
- Performance monitoring
- User interaction tracking
- API request/response logging

### Monitoring Tools Integration
- **Backend**: Prometheus metrics endpoint, Serilog sinks for CloudWatch/Application Insights
- **Frontend**: Web Vitals reporting, custom analytics integration, error reporting to Sentry/Rollbar

## 🧪 Testing Strategy

### Backend Testing
- **Unit Tests**: Business logic validation (Application layer)
- **Integration Tests**: Database operations and API endpoints
- **Performance Tests**: Audit trail and bulk operations
- **Contract Tests**: API specification compliance
- **Framework**: xUnit with InMemory Database
- **Coverage Target**: 80%+ code coverage, 95%+ for critical paths

### Frontend Testing
- **Unit Tests**: Component logic, utility functions, hooks
- **Integration Tests**: Feature interactions, form submissions
- **E2E Tests**: Full user workflows with Playwright
- **Visual Regression**: Component snapshot testing
- **Framework**: Jest + React Testing Library
- **Coverage Target**: 70%+ code coverage for UI components

### Test Commands
```bash
# Backend tests
dotnet test

# Frontend tests
cd src/digital-signage-web
npm test                    # Run unit tests
npm run test:watch          # Watch mode
npm run test:coverage       # With coverage
npm run test:e2e            # E2E tests
```

## 📚 Documentation

### Architecture Documentation
- `docs/BaseEntity-Implementation-Guide.md` - Comprehensive audit trail documentation
- `docs/BaseEntity-Quick-Reference.md` - Developer quick start guide
- `docs/BaseEntity-Production-Verification.md` - Deployment checklist
- `docs/user-device-associations.md` - User-device relationship patterns
- `docs/QR_CODE_API.md` - QR code registration system

### API Documentation
- OpenAPI/Swagger specification available at `/swagger` (when API is running)
- Interactive API testing at `http://localhost:5000/swagger`
- Postman collection available in `/docs/api/`
- API specification: `docs/api/digital-signage-backoffice-api.yaml`

### Frontend Documentation
- Component library: `src/digital-signage-web/components/`
- UI patterns: `src/digital-signage-web/features/`
- Architecture guide: `src/digital-signage-web/ARCHITECTURE.md`
- Next.js instructions: `docs/web/nextjs.instructions.md`

### Feature Specifications
Located in `specs/` directory with detailed documentation for each feature:
- `002-setup-project-structure/` - Initial project setup
- `009-authentication-system/` - JWT authentication
- `011-android-tv-self/` - Device self-registration
- `012-entity-model-extend/` - Extended entity models
- `013-qr-code-system/` - QR code registration flow
- `014-basic-hierarchy/` - Device group hierarchy
- `015-admin-user-permission-management/` - RBAC implementation
- `017-design-ui-backoffice/` - Admin interface design
- `019-user-based-content/` - **User-based content assignment with three-tier priority**

Each spec includes:
- `spec.md` - Feature requirements and design
- `data-model.md` - Database schema
- `plan.md` - Implementation plan
- `tasks.md` - Task breakdown
- `contracts/` - API contracts and examples
- `docs/BaseEntity-Production-Verification.md` - Deployment checklist

### API Documentation
- OpenAPI/Swagger specification available at `/swagger`
- Postman collection available in `/docs/api/`

## 🧪 Testing

Run the test suite to verify functionality:

```bash
# Run all tests
dotnet test

# Run specific test project
dotnet test tests/DigitalSignage.Api.Tests
dotnet test tests/DigitalSignage.Application.Tests
dotnet test tests/DigitalSignage.Domain.Tests
dotnet test tests/DigitalSignage.Infrastructure.Tests
```

### WebSocket Testing

Test real-time features using browser developer tools or SignalR clients:

```javascript
// Browser console test
const connection = new signalR.HubConnectionBuilder()
    .withUrl("http://localhost:5100/ws")
    .withAutomaticReconnect()
    .build();

connection.start().then(() => {
    console.log("Connected to SignalR hub");
    
    // Listen for device status updates
    connection.on("DeviceStatusChanged", (deviceId, status) => {
        console.log(`Device ${deviceId} status: ${status}`);
    });
    
    // Listen for schedule conflicts
    connection.on("ScheduleConflictDetected", (data) => {
        console.log("Schedule conflict:", data);
    });
});
```

### Integration Testing

Verify the complete system with Docker Compose:

```bash
# Start all services
docker-compose up -d

# Run health checks
curl http://localhost:5100/health
curl http://localhost:3000/api/health

# Check WebSocket connection
wscat -c ws://localhost:5100/ws
```

## 🔒 Security Considerations

### Authentication & Authorization
- **JWT tokens** with configurable expiration (default: 60 minutes)
- **Refresh token rotation** for enhanced security
- **Role-based access control (RBAC)** with granular permissions
- **Device-specific authentication keys** for Android TV devices
- **Password hashing** with bcrypt (min 10 rounds)
- **PIN-based device registration** with admin approval workflow

### Data Protection
- **Sensitive data encryption** at rest in database
- **HTTPS enforced** for all communications (TLS 1.2+)
- **SQL injection prevention** via EF Core parameterized queries
- **XSS protection** with Content Security Policy headers
- **CORS configuration** restricted to allowed origins
- **AWS S3 presigned URLs** with time-limited access (default: 24 hours)
- **Input validation** with Data Annotations and FluentValidation

### Frontend Security
- **Auth token storage** in secure HTTP-only cookies (production) or localStorage (development)
- **CSRF protection** for state-changing operations
- **API request sanitization** to prevent injection attacks
- **Environment variable protection** - secrets never in client bundle
- **Dependency security** - regular npm audit checks

### Audit & Compliance
- **Complete audit trail** via BaseEntity (Created/Updated/Deleted tracking)
- **User action logging** for all administrative operations
- **Device activity monitoring** via heartbeat system
- **Registration audit log** for device provisioning
- **Failed login tracking** and brute-force protection
- **Data retention policies** configurable per environment

### AWS Security Best Practices
- **IAM roles** for service-to-service communication
- **S3 bucket policies** with least privilege access
- **Server-side encryption** (AES256) for uploaded media
- **VPC isolation** for database and backend services
- **Secrets Manager** integration for sensitive credentials

### Regular Security Maintenance
- Keep dependencies updated (both .NET and npm packages)
- Regular security scanning with tools like OWASP ZAP, Snyk
- Monitor CVE databases for known vulnerabilities
- Implement rate limiting on API endpoints
- Review and rotate API keys periodically
- Comprehensive audit trails for all operations
- User action logging
- Data retention policies
- GDPR compliance considerations

## 🚀 Performance Optimization

### Backend Performance

#### Database Optimization
- **Entity Framework Core** query optimization with `.AsNoTracking()` for read-only queries
- **Database indexing strategy** on frequently queried columns (DeviceKey, UserId, ScheduleId)
- **Connection pooling** configured for optimal throughput
- **Query result caching** for device schedules and media metadata
- **Batch operations** for audit log inserts

#### API Performance
- **Response caching** for static content endpoints
- **Compression** (Gzip/Brotli) for API responses
- **Pagination** for large result sets (default: 50 items per page)
- **Async/await** throughout for non-blocking I/O

### Frontend Performance

#### Build Optimization
- **Next.js optimizations**: Automatic code splitting, image optimization, font optimization
- **Bundle analysis**: Tree-shaking and dead code elimination
- **Lazy loading**: Dynamic imports for heavy components
- **Static generation** where possible (public pages)

#### Runtime Performance
- **React Query caching**: Intelligent server state management with stale-while-revalidate
- **Redux optimization**: Selector memoization with Reselect
- **Virtual scrolling**: For large lists (device lists, media libraries)
- **Image optimization**: Next.js Image component with WebP/AVIF support
- **Debounced search**: Reduced API calls on user input

#### Loading Strategies
- **Skeleton screens**: Better perceived performance
- **Progressive loading**: Critical content first
- **Prefetching**: Anticipate navigation with `next/link`
- **Service worker**: Offline capability (PWA ready)

### Caching Strategy
- **Memory caching**: Frequently accessed data (device configs, user permissions)
- **Distributed caching**: Redis for multi-instance deployments
- **CDN integration**: CloudFront for media file delivery
- **Browser caching**: Aggressive caching for static assets

### Scalability
- **Horizontal scaling**: Stateless API design, load balancer ready
- **Database read replicas**: Separate read/write operations
- **Message queue**: Background job processing (future: RabbitMQ/Azure Service Bus)
- **Microservice-ready**: Clean Architecture enables future service extraction
- **Auto-scaling**: Container orchestration with Kubernetes/ECS

### Monitoring & Profiling
- **Backend**: Application Insights, Prometheus metrics
- **Frontend**: Web Vitals (LCP, FID, CLS), custom performance markers
- **Database**: Query execution time tracking, slow query logging
- **Network**: API response time monitoring, error rate tracking

## 🤝 Contributing

### Development Workflow
1. **Fork the repository** to your GitHub account
2. **Clone your fork**: `git clone https://github.com/your-username/digital-signage.git`
3. **Create a feature branch**: `git checkout -b feature/your-feature-name`
4. **Make your changes** following the code standards below
5. **Run tests** and ensure all pass: `dotnet test` and `npm test`
6. **Commit your changes**: Use conventional commit messages (e.g., `feat:`, `fix:`, `docs:`)
7. **Push to your fork**: `git push origin feature/your-feature-name`
8. **Submit a pull request** to the `develop` branch

### Code Standards

#### Backend (.NET)
- Follow **Clean Architecture** principles with clear layer separation
- Use **async/await** for all I/O operations
- Implement **comprehensive error handling** with try-catch and logging
- Add **unit tests** for services and integration tests for controllers
- Use **nullable reference types** and handle null cases explicitly
- Follow **naming conventions**: PascalCase for public members, _camelCase for private fields
- Add **XML documentation** comments for public APIs
- Use **ProducesResponseType** attributes on all controller actions

#### Frontend (React/Next.js)
- Use **TypeScript** with strict mode enabled
- Follow **React best practices**: Functional components with hooks
- Implement **proper error boundaries** for component error handling
- Use **custom hooks** for reusable logic
- Add **unit tests** for components and utilities (Jest + React Testing Library)
- Follow **accessibility guidelines** (WCAG 2.1 Level AA)
- Use **semantic HTML** and proper ARIA labels
- Implement **responsive design** (mobile-first approach)

#### General
- **No commented-out code** in commits
- **Remove unused imports** and dependencies
- **Update documentation** when adding features
- **Add migration files** for database changes
- **Follow existing patterns** in the codebase

### Pull Request Guidelines
- **Clear description** of what the PR does and why
- **Link related issues** using GitHub keywords (e.g., "Closes #123")
- **Include screenshots** for UI changes
- **Add tests** that cover new functionality
- **Update documentation** (README, API docs, inline comments)
- **Ensure CI/CD pipeline passes** (build, tests, linting)
- **Request review** from at least one maintainer
- **Keep PRs focused** - one feature/fix per PR
- **Rebase on develop** before submitting to avoid merge conflicts

### Commit Message Format
Follow [Conventional Commits](https://www.conventionalcommits.org/):
```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:** `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`, `perf`

**Examples:**
```
feat(auth): add JWT refresh token rotation
fix(device): resolve heartbeat timeout issue
docs(readme): update quick start section
test(media): add S3 upload integration tests
```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support & Resources

### Getting Help
- **Documentation**: Check the comprehensive [docs/](docs/) directory
- **API Reference**: Visit `/swagger` endpoint when API is running
- **Feature Specs**: Review detailed specifications in [specs/](specs/)
- **GitHub Issues**: [Report bugs or request features](https://github.com/your-org/digital-signage/issues)
- **Discussions**: [Ask questions in GitHub Discussions](https://github.com/your-org/digital-signage/discussions)

### Common Issues & Troubleshooting
1. **Database connection errors**: Verify PostgreSQL is running and connection string is correct
2. **AWS S3 upload failures**: Check IAM permissions and bucket configuration
3. **JWT authentication issues**: Ensure secret key is properly configured and tokens haven't expired
4. **Frontend build errors**: Clear `.next` cache and `node_modules`, then rebuild
5. **CORS errors**: Verify allowed origins in backend CORS configuration

### Useful Resources
- [ASP.NET Core Documentation](https://docs.microsoft.com/en-us/aspnet/core/)
- [Entity Framework Core Guide](https://docs.microsoft.com/en-us/ef/core/)
- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [AWS S3 SDK Documentation](https://docs.aws.amazon.com/sdk-for-net/)

### Version Information
#### Backend Stack
- .NET Version: **8.0**
- Entity Framework Core: **9.0**
- PostgreSQL: **14+**
- AWS SDK: **4.0+**
- log4net: **2.0+**

#### Frontend Stack
- Next.js: **15.5+**
- React: **19.1+**
- TypeScript: **5.x**
- Tailwind CSS: **4.x**
- Redux Toolkit: **2.x**
- React Query: **5.x**

#### Development Tools
- Docker: **20.x+**
- Node.js: **20.x LTS** (for frontend)
- npm: **10.x+**

### Project Status
- ✅ **Backend API**: Production-ready with comprehensive features
- ✅ **Admin Interface**: Fully functional Next.js 15 dashboard
- ✅ **Android TV Support**: QR code + PIN registration implemented
- ✅ **User-Based Content**: Personalized content delivery with three-tier priority (Feature 019)
- 🚧 **Mobile App**: Planned for future release
- 🚧 **Advanced Analytics**: In development

---

**Built with ❤️ using Clean Architecture**  
**Backend:** .NET 8 + Entity Framework Core + PostgreSQL  
**Frontend:** Next.js 15 + React 19 + TypeScript + Tailwind CSS