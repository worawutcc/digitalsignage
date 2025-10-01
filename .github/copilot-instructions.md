# Digital Signage Development Guidelines

Auto-generated from all feature plans. Last updated: 2025-09-29

## Active Technologies
- C# .NET 8 with ASP.NET Core Web API + Entity Framework Core 8, log4net, AWS SDK S3, Npgsql, SQL Server provider (002-setup-project-structure)
- Android TV Self-Registration with PIN-based admin approval workflow (011-android-tv-self)
- C# .NET 8 with ASP.NET Core Web API + Entity Framework Core 8, ASP.NET Core, PostgreSQL (Npgsql), JWT Authentication, AWS S3 (012-entity-model-extend)
- PostgreSQL database with Entity Framework Core migrations (012-entity-model-extend)
- C# .NET 8 with ASP.NET Core Web API + Entity Framework Core 9, JWT Bearer Authentication, AWS S3 SDK, log4net, PostgreSQL (Npgsql) (013-qr-code-system)
- PostgreSQL database with Entity Framework Core migrations, AWS S3 for media files (013-qr-code-system)
- C# .NET 8 with ASP.NET Core Web API + Entity Framework Core 9 + Entity Framework Core (PostgreSQL), ASP.NET Core MVC, log4net, AWS S3 SDK (014-basic-hierarchy)
- C# .NET 8 with ASP.NET Core Web API + Entity Framework Core 9, JWT Bearer Authentication, AutoMapper, log4ne (015-admin-user-permission-management)
- PostgreSQL with Npgsql provider for RBAC tables and audit logs (015-admin-user-permission-management)
- TypeScript 5.x (Frontend), C# .NET 8 (Backend) + Next.js 15, React 18, Redux Toolkit, Tailwind CSS, ASP.NET Core Web API (017-admin-menu-design)
- PostgreSQL (backend data), LocalStorage/SessionStorage (menu state) (017-admin-menu-design)
- TypeScript 5.x, Next.js 15 with App Router, React 18 + React Query/TanStack Query, Redux Toolkit, Tailwind CSS 4, Lucide React, Axios, React Hook Form, Zod (017-design-ui-backoffice)
- Browser LocalStorage/SessionStorage for client state, API integration with PostgreSQL backend via REST endpoints (017-design-ui-backoffice)

## Project Structure
```
src/
├── DigitalSignage.Api/           # Web API + Controllers
├── DigitalSignage.Application/   # Business Logic + Services  
├── DigitalSignage.Domain/        # Core Entities + Interfaces
└── DigitalSignage.Infrastructure/ # Data Access + EF Core
tests/
├── DigitalSignage.Api.Tests/
├── DigitalSignage.Application.Tests/
├── DigitalSignage.Domain.Tests/
└── DigitalSignage.Infrastructure.Tests/
```

## Digital Signage Domain Context
**Core Features:**
- Content Management: Images, videos, HTML widgets with AWS S3 storage
- Device Provisioning: Device registration, authentication, heartbeat monitoring
- Android TV Self-Registration: PIN-based workflow with admin approval for enterprise deployment
- Scheduling System: Time-based content scheduling with priority and recurrence
- Playlist Management: Content sequencing and automatic fallback
- Multi-device Support: Device groups and targeted content delivery
- Security: JWT authentication, RBAC, presigned URLs, audit logging

**Key Entities:**
- `User`, `Device`, `DeviceGroup`, `Media`, `Schedule`, `ScheduleMedia`, `DeviceHeartbeat`, `AuditLog`
- `DeviceRegistrationRequest`, `DeviceApproval`, `RegistrationAuditLog` (011-android-tv-self)

## Backend Architecture & Rules (.NET 8 WebAPI)
**Scope:** Clean Architecture pattern with dependency inversion

### Layer Responsibilities
- **Api**: Controllers, DTOs, Middleware, Configuration
- **Application**: Services, Interfaces, Business Logic, Application DTOs
- **Domain**: Entities, Enums, Value Objects, Domain Interfaces
- **Infrastructure**: Data Access, EF Core, External Services (S3)

### Controller Rules
- **Thin Controllers**: Only receive/return data — logic in Application Services
- **No Database Access**: Use Application Services only
- Use DTOs/ViewModels for requests/responses (never return Domain entities directly)
- Routing: `[Route("api/[controller]")]` with REST conventions
- Always validate input with `ModelState.IsValid` or FluentValidation
- **ProducesResponseType Attributes**: Document all possible HTTP status codes with response types

**API Documentation Pattern:**
```csharp
/// <summary>
/// Get a specific resource by ID
/// </summary>
[HttpGet("{id}")]
[ProducesResponseType(typeof(ResourceDto), StatusCodes.Status200OK)]
[ProducesResponseType(StatusCodes.Status404NotFound)]
[ProducesResponseType(StatusCodes.Status500InternalServerError)]
public async Task<ActionResult<ResourceDto>> GetResource(int id)

/// <summary>
/// Create a new resource
/// </summary>
[HttpPost]
[ProducesResponseType(typeof(ResourceDto), StatusCodes.Status201Created)]
[ProducesResponseType(typeof(ValidationProblemDetails), StatusCodes.Status400BadRequest)]
[ProducesResponseType(StatusCodes.Status500InternalServerError)]
public async Task<ActionResult<ResourceDto>> CreateResource([FromBody] CreateResourceRequest request)

/// <summary>
/// Delete a resource
/// </summary>
[HttpDelete("{id}")]
[ProducesResponseType(StatusCodes.Status204NoContent)]
[ProducesResponseType(StatusCodes.Status404NotFound)]
[ProducesResponseType(StatusCodes.Status500InternalServerError)]
public async Task<IActionResult> DeleteResource(int id)
```

### Application.Services Rules
- Private readonly dependencies with `_camelCase` naming
- Constructor receives dependencies via DI only
- No public fields; use constants or private readonly for defaults
- Async/await for all I/O operations
- Return DTOs, not Domain entities

**Example:**
```csharp
public class MediaService : IMediaService
{
    private readonly IFileUploadService _fileUploadService;
    private readonly IMediaRepository _mediaRepository;
    private readonly ILogger<MediaService> _logger;
    private const int _defaultExpiryHours = 24;

    public MediaService(
        IFileUploadService fileUploadService,
        IMediaRepository mediaRepository,
        ILogger<MediaService> logger)
    {
        _fileUploadService = fileUploadService;
        _mediaRepository = mediaRepository;
        _logger = logger;
    }
    // Implementation...
}
```

### Entity Framework Core
- `AppDbContext` in `Infrastructure/Data/`
- Multi-provider support: PostgreSQL (primary), SQL Server (alternate)
- Connection via `appsettings.{Environment}.json` + Environment Variables
- Migrations: `dotnet ef migrations add <Name> -p src/DigitalSignage.Infrastructure -s src/DigitalSignage.Api`
- Provider switching via `DatabaseProvider` configuration key

### AWS S3 Integration
- `S3FileUploadService` for media file storage
- Presigned URLs for secure client-side access
- Media keys follow pattern: `media/{guid}/{filename}`
- Server-side encryption (AES256) enabled
- File operations: Upload, Download URL, Delete, Exists check

### Logging & Health Checks
- **log4net**: Rolling file appender + console output
- **Health Checks**: `/health`, `/health/ready`, `/health/live` endpoints
- Database connectivity validation included
- Custom health check response writer for detailed JSON output

### Security Implementation
- **JWT Authentication**: For admin/user access
- **Device Key Authentication**: For device-specific endpoints
- **RBAC**: Role-based access control
- **Audit Logging**: All critical operations logged
- **HTTPS**: Required for all environments

### API Endpoints (Digital Signage Specific)
```
Authentication:
- POST /api/auth/login
- POST /api/auth/register
- POST /api/auth/refresh

Media Management:
- GET /api/media
- POST /api/media/upload
- GET /api/media/{id}/presigned-url
- DELETE /api/media/{id}

Device Management:
- POST /api/device/provision
- POST /api/device/heartbeat
- GET /api/device/next-schedule

Schedule Management:
- GET /api/schedule
- POST /api/schedule
- GET /api/schedule/for-device/{deviceId}
```

### Development Standards
- **Nullable Reference Types**: Enabled project-wide
- **File-scoped Namespaces**: Use consistently
- **Async/Await**: For all I/O operations
- **PascalCase**: Public members, classes, methods
- **camelCase**: Local variables, method parameters
- **_camelCase**: Private fields
- **DateTimeOffset**: For timezone-aware data storage

### Testing Strategy
- **xUnit**: Test framework
- **InMemory Database**: For integration tests
- **SQLite**: For lightweight database tests
- **Test Coverage**: Services, Controllers, Domain logic
- **Contract Tests**: API endpoint validation

### Service Registration Pattern
Organize service registrations in `Extensions/` folder with static extension methods:

```csharp
// Extensions/ApplicationServiceExtensions.cs
public static class ApplicationServiceExtensions
{
    public static IServiceCollection AddApplicationServices(this IServiceCollection services)
    {
        services.AddScoped<IPlaylistService, PlaylistService>();
        services.AddScoped<ISceneService, SceneService>();
        services.AddAutoMapper(typeof(PlaylistDto));
        return services;
    }
}

// Extensions/DatabaseServiceExtensions.cs
public static class DatabaseServiceExtensions
{
    public static IServiceCollection AddDatabaseServices(this IServiceCollection services, IConfiguration configuration)
    {
        // EF Core configuration
        // AWS S3 services
        // Health checks
        return services;
    }
}

// Program.cs - Clean service registration
builder.Services
    .AddApplicationServices()
    .AddDatabaseServices(builder.Configuration)
    .AddApiDocumentation()
    .AddCorsServices()
    .AddMvcServices();
```

### Default Generation Pattern
When generating new features:
1. **Domain Entity** with proper relationships and validation
2. **Application DTO** for request/response
3. **Application Service** interface + implementation
4. **API Controller** with REST endpoints + ProducesResponseType attributes
5. **EF Core Configuration** and migration
6. **Unit Tests** for service and validation logic
7. **Integration Tests** for API endpoints
8. **Service Registration** in appropriate extension class

### Configuration Management
- `appsettings.json`: Base configuration
- `appsettings.Development.json`: Development overrides
- `appsettings.Production.json`: Production settings
- Environment Variables: Sensitive data (connection strings, AWS keys)
- `IOptions<T>` pattern for strongly-typed configuration

### Commands
```bash
# Run API
dotnet watch run --project src/DigitalSignage.Api

# Create Migration
dotnet ef migrations add <MigrationName> -p src/DigitalSignage.Infrastructure -s src/DigitalSignage.Api

# Update Database
dotnet ef database update -p src/DigitalSignage.Infrastructure -s src/DigitalSignage.Api

# Run Tests
dotnet test

# Build Solution
dotnet build
```

## Code Style
C# .NET 8 with ASP.NET Core Web API: Follow standard conventions with Clean Architecture patterns

## Recent Changes
- 017-design-ui-backoffice: Added TypeScript 5.x, Next.js 15 with App Router, React 18 + React Query/TanStack Query, Redux Toolkit, Tailwind CSS 4, Lucide React, Axios, React Hook Form, Zod
- 017-admin-menu-design: Added TypeScript 5.x (Frontend), C# .NET 8 (Backend) + Next.js 15, React 18, Redux Toolkit, Tailwind CSS, ASP.NET Core Web API
- 015-admin-user-permission-management: Added C# .NET 8 with ASP.NET Core Web API + Entity Framework Core 9, JWT Bearer Authentication, AutoMapper, log4ne

<!-- MANUAL ADDITIONS START -->
<!-- MANUAL ADDITIONS END -->
