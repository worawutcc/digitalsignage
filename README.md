# Digital Signage System

A comprehensive digital signage management system built with .NET 8 Clean Architecture, featuring device management, content scheduling, and automatic audit trails.

## 🏗️ Architecture

This project follows **Clean Architecture** principles with four distinct layers:

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

## ✨ Key Features

### 🎯 Core Functionality
- **Device Management**: Register, provision, and monitor digital signage devices
- **Content Management**: Upload, organize, and manage media files (images, videos, HTML)
- **Scheduling System**: Time-based content scheduling with priorities and recurrence
- **Playlist Management**: Create and manage content playlists with automatic fallback
- **User Management**: Role-based access control with JWT authentication

### 🔐 Security & Authentication
- **JWT Authentication**: Secure API access with refresh token support
- **Role-Based Authorization**: Admin, User, and Device-level permissions
- **Device Key Authentication**: Secure device-to-server communication
- **AWS S3 Integration**: Secure media storage with presigned URLs

### 📊 Audit Trail System
- **Automatic Audit Logging**: All entity changes tracked automatically
- **BaseEntity Pattern**: Consistent audit fields across all domain entities
- **User Context Integration**: Links all changes to authenticated users
- **Performance Optimized**: < 10% overhead for bulk operations

### 📱 Android TV Support
- **Self-Registration**: PIN-based device registration workflow
- **Admin Approval**: Secure device provisioning with admin oversight
- **Heartbeat Monitoring**: Real-time device status tracking
- **Content Synchronization**: Automatic content updates to devices

## 🚀 Quick Start

### Prerequisites
- .NET 8 SDK
- PostgreSQL 14+
- AWS S3 account (for media storage)

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd digital-signage
```

2. **Configure database connection**
```json
// appsettings.Development.json
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

5. **Start the application**
```bash
dotnet run --project src/DigitalSignage.Api
```

6. **Access the API**
- API: `https://localhost:7001`
- Swagger UI: `https://localhost:7001/swagger`
- Health Checks: `https://localhost:7001/health`

## 🗄️ Database Schema

### Core Entities
- **Users**: System administrators and content managers
- **Devices**: Digital signage display devices
- **DeviceGroups**: Logical grouping of devices
- **Media**: Uploaded content files (images, videos, HTML)
- **Schedules**: Content scheduling configurations
- **Playlists**: Content sequence management

### Audit Trail
All business entities inherit from `BaseEntity` and include:
- `created_at` - Entity creation timestamp (must use DateTimeKind.Unspecified for PostgreSQL)
- `updated_at` - Last modification timestamp (must use DateTimeKind.Unspecified for PostgreSQL)
- `created_by` - User who created the entity
- `updated_by` - User who last modified the entity

## 🔧 Development
### ⚠️ PostgreSQL DateTimeKind Troubleshooting

**Important:** When using PostgreSQL with `timestamp without time zone`, all `DateTime` values must have `DateTimeKind.Unspecified`. Assigning `DateTime.UtcNow` or `DateTime.Now` with `DateTimeKind.Utc` will cause runtime errors:

```
System.ArgumentException: Cannot write DateTime with Kind=UTC to PostgreSQL type 'timestamp without time zone'
```

**Solution:**
- Always assign audit fields (CreatedAt, UpdatedAt, etc.) using:
  ```csharp
  DateTime.SpecifyKind(DateTime.Now, DateTimeKind.Unspecified)
  ```
- Ensure all automatic audit field population (e.g. in `AppDbContext.UpdateAuditFields`) uses this pattern.
- Never use DateTimeKind.Utc for fields mapped to `timestamp without time zone`.

See `src/DigitalSignage.Infrastructure/Data/AppDbContext.cs` and `src/DigitalSignage.Infrastructure/Data/DbSeeder.cs` for correct usage examples.

### Running Tests
```bash
# Run all tests
dotnet test

# Run specific test project
dotnet test tests/DigitalSignage.Infrastructure.Tests/

# Run with coverage
dotnet test --collect:"XPlat Code Coverage"
```

### Database Operations
```bash
# Add new migration
dotnet ef migrations add <MigrationName> -p src/DigitalSignage.Infrastructure -s src/DigitalSignage.Api

# Update database
dotnet ef database update -p src/DigitalSignage.Infrastructure -s src/DigitalSignage.Api

# Remove last migration
dotnet ef migrations remove -p src/DigitalSignage.Infrastructure -s src/DigitalSignage.Api
```

### Code Generation
```bash
# Generate API client
dotnet swagger tofile --output api-spec.json src/DigitalSignage.Api/bin/Debug/net8.0/DigitalSignage.Api.dll v1
```

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
POST /api/devices/provision   # Register new device
POST /api/devices/heartbeat   # Device status update
GET  /api/devices/{id}/schedule # Get device content schedule
PUT  /api/devices/{id}        # Update device configuration
```

### Content Management
```
GET    /api/media             # List media files
POST   /api/media/upload      # Upload new media
GET    /api/media/{id}/url    # Get presigned download URL
DELETE /api/media/{id}        # Delete media file
```

### Scheduling
```
GET  /api/schedules           # List schedules
POST /api/schedules           # Create new schedule
PUT  /api/schedules/{id}      # Update schedule
GET  /api/schedules/device/{deviceId} # Get device schedules
```

## 🏷️ Environment Configuration

### Development
```json
{
  "DatabaseProvider": "PostgreSQL",
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Database=digital_signage_dev;Username=postgres"
  },
  "Logging": {
    "LogLevel": {
      "Default": "Debug"
    }
  }
}
```

### Production
```json
{
  "DatabaseProvider": "PostgreSQL",
  "ConnectionStrings": {
    "DefaultConnection": "Host=prod-db;Database=digital_signage;Username=app_user"
  },
  "Logging": {
    "LogLevel": {
      "Default": "Warning"
    }
  }
}
```

## 🐳 Docker Deployment

### Using Docker Compose
```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f api

# Stop services
docker-compose down
```

### Manual Docker Build
```bash
# Build image
docker build -t digital-signage-api .

# Run container
docker run -p 8080:8080 \
  -e ConnectionStrings__DefaultConnection="Host=host.docker.internal;Database=digital_signage" \
  digital-signage-api
```

## 📊 Monitoring & Health Checks

### Health Check Endpoints
- `/health` - Overall system health
- `/health/ready` - Application readiness
- `/health/live` - Application liveness

### Metrics
- Database connectivity
- AWS S3 connectivity
- Memory usage
- Response times

### Logging
- Structured logging with Serilog
- Request/response logging
- Error tracking
- Audit trail logging

## 🧪 Testing Strategy

### Test Categories
- **Unit Tests**: Business logic validation (Application layer)
- **Integration Tests**: Database operations and API endpoints
- **Performance Tests**: Audit trail and bulk operations
- **Contract Tests**: API specification compliance

### Test Coverage
- Target: 80%+ code coverage
- Critical paths: 95%+ coverage
- Audit trail: 100% coverage

## 📚 Documentation

### Architecture Documentation
- `docs/BaseEntity-Implementation-Guide.md` - Comprehensive audit trail documentation
- `docs/BaseEntity-Quick-Reference.md` - Developer quick start guide
- `docs/BaseEntity-Production-Verification.md` - Deployment checklist

### API Documentation
- OpenAPI/Swagger specification available at `/swagger`
- Postman collection available in `/docs/api/`

## 🔒 Security Considerations

### Authentication & Authorization
- JWT tokens with configurable expiration
- Refresh token rotation for enhanced security
- Role-based access control (RBAC)
- Device-specific authentication keys

### Data Protection
- Sensitive data encryption at rest
- HTTPS enforced for all communications
- SQL injection prevention via parameterized queries
- XSS protection with Content Security Policy

### Audit & Compliance
- Comprehensive audit trails for all operations
- User action logging
- Data retention policies
- GDPR compliance considerations

## 🚀 Performance Optimization

### Database Optimization
- Entity Framework Core query optimization
- Database indexing strategy
- Connection pooling
- Query result caching

### Caching Strategy
- Memory caching for frequently accessed data
- Distributed caching for scalability
- Media file CDN integration

### Scalability
- Horizontal scaling support
- Load balancer compatibility
- Database read replicas
- Microservice-ready architecture

## 🤝 Contributing

### Development Workflow
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and ensure coverage
5. Submit a pull request

### Code Standards
- Follow Clean Architecture principles
- Use async/await for I/O operations
- Implement comprehensive error handling
- Add unit tests for new features
- Update documentation as needed

### Pull Request Guidelines
- Clear description of changes
- Include relevant tests
- Update documentation if needed
- Ensure CI/CD pipeline passes

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

### Getting Help
- Check the [documentation](docs/)
- Review [common issues](docs/troubleshooting.md)
- Open an issue on GitHub

### Version Information
- .NET Version: 8.0
- Entity Framework Core: 9.0
- PostgreSQL: 14+
- AWS SDK: 4.0+

---

**Built with ❤️ using .NET 8 Clean Architecture**