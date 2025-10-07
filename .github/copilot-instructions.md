---
applyTo: 'src/DigitalSignage.Api/**,src/DigitalSignage.Application/**,src/DigitalSignage.Domain/**,src/DigitalSignage.Infrastructure/**,tests/DigitalSignage.*.Tests/**'
---
# Digital Signage API Development Guidelines

Auto-generated from all feature plans. Last updated: 2025-10-03

**Scope:** This guide applies exclusively to the Digital Signage API backend development (C# .NET 8 WebAPI, Entity Framework Core, PostgreSQL). For frontend/web development, refer to `copilot-instructions-ui.instructions.md`.

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
- C# .NET 8 with ASP.NET Core Web API + ASP.NET Core SignalR, Microsoft.AspNetCore.Authentication.JwtBearer, Entity Framework Core 9 (018-api-implement-websocket)
- PostgreSQL (existing) for connection audit logs, in-memory for active connection tracking (018-api-implement-websocket)
- C# .NET 8, TypeScript 5.x + ASP.NET Core Web API, Entity Framework Core 9, PostgreSQL (Npgsql), Next.js 15, React 18 (019-user-based-content)
- PostgreSQL database with EF Core migrations (019-user-based-content)
- TypeScript 5.x with Next.js 15 (React 19) (020-phase-1)
- PostgreSQL (backend) via REST API, LocalStorage/SessionStorage for client state (020-phase-1)
- TypeScript 5.x with Next.js 15 (React 18), C# .NET 8 (backend) + React Query/TanStack Query, Redux Toolkit, Tailwind CSS 4, React Hook Form + Zod, Axios, Lucide Reac (021-user-schedule-assignment)
- PostgreSQL (backend data), LocalStorage/SessionStorage (client state), existing API endpoints (021-user-schedule-assignment)
- C# .NET 8 (Backend), TypeScript 5.x (Frontend) + ASP.NET Core Web API, Entity Framework Core 9, Next.js 15, React 18, PostgreSQL, JWT Authentication, AWS S3 (027-device-approval-group)
- C# .NET 8 with ASP.NET Core Web API + Entity Framework Core 9, JWT Authentication, AWS S3 SDK, AutoMapper, SixLabors.ImageSharp, SignalR (028-enhanced-device-registration)
- PostgreSQL (Npgsql provider) with Entity Framework Core migrations (028-enhanced-device-registration)

## API Project Structure (Backend Only)
```
digital_signage/
├── src/
│   ├── DigitalSignage.Api/           # Web API + Controllers
│   ├── DigitalSignage.Application/   # Business Logic + Services  
│   ├── DigitalSignage.Domain/        # Core Entities + Interfaces
│   ├── DigitalSignage.Infrastructure/ # Data Access + EF Core
│   └── digital-signage-web/         # Frontend (see UI instructions)
├── tests/
│   ├── DigitalSignage.Api.Tests/
│   ├── DigitalSignage.Application.Tests/
│   ├── DigitalSignage.Domain.Tests/
│   └── DigitalSignage.Infrastructure.Tests/
└── DigitalSignage.sln               # Solution file
```

**Note:** This guide covers only the API backend projects. Frontend development is handled separately in `src/digital-signage-web/` with its own instruction file.

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
- **DateTime Handling**: Always use `DateTime` (not `DateTimeOffset`) for all API inputs/outputs. All datetime values should be in UTC and stored without timezone information.

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

**Entity Configuration DateTime Pattern:**
```csharp
// CORRECT: PostgreSQL DateTime configuration
builder.Property(e => e.CreatedAt)
    .IsRequired()
    .HasColumnType("timestamp without time zone")
    .HasDefaultValueSql("NOW() AT TIME ZONE 'UTC'");

// INCORRECT: Avoid these patterns
// .HasColumnType("timestamp with time zone")  // Wrong timezone type
// .HasDefaultValueSql("GETUTCDATE()")         // Wrong SQL Server syntax
```

### Entity Framework Core
- `AppDbContext` in `Infrastructure/Data/`
- Multi-provider support: PostgreSQL (primary), SQL Server (alternate)
- Connection via `appsettings.{Environment}.json` + Environment Variables
- Migrations: `dotnet ef migrations add <Name> -p src/DigitalSignage.Infrastructure -s src/DigitalSignage.Api`
- Provider switching via `DatabaseProvider` configuration key

#### DateTime Management for PostgreSQL
**CRITICAL: All DateTime handling must use `timestamp without time zone` to avoid timezone conversion issues.**

**Database Configuration:**
- Always use `timestamp without time zone` for all DateTime columns
- Use `NOW() AT TIME ZONE 'UTC'` for default values (not `GETUTCDATE()`)
- Configure explicitly in Entity Configuration: `.HasColumnType("timestamp without time zone")`

**Application Code Rules:**
- When using `DateTime.UtcNow` for database operations, convert to `DateTimeKind.Unspecified`:
  ```csharp
  // CORRECT: Convert UTC DateTime for database storage
  entity.CreatedAt = DateTime.SpecifyKind(DateTime.UtcNow, DateTimeKind.Unspecified);
  
  // CORRECT: For query parameters
  var cutoffTime = DateTime.SpecifyKind(DateTime.UtcNow.AddDays(-7), DateTimeKind.Unspecified);
  
  // INCORRECT: Will cause "Cannot write DateTime with Kind=UTC" error
  entity.CreatedAt = DateTime.UtcNow; // ❌ Don't do this
  ```

**Entity Configuration Pattern:**
```csharp
// CORRECT: PostgreSQL DateTime configuration
builder.Property(e => e.CreatedAt)
    .IsRequired()
    .HasColumnType("timestamp without time zone")
    .HasDefaultValueSql("NOW() AT TIME ZONE 'UTC'");

builder.Property(e => e.UpdatedAt)
    .IsRequired()
    .HasColumnType("timestamp without time zone");
```

**Background Services & DateTime:**
- All DateTime values used in database queries must be converted to `DateTimeKind.Unspecified`
- Use `DateTime.SpecifyKind(DateTime.UtcNow, DateTimeKind.Unspecified)` pattern consistently
- For SignalR/API responses, `DateTime.UtcNow.ToString()` is acceptable (not database-bound)

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
- **DateTime Management**: 
  - Use `DateTime` (not `DateTimeOffset`) for all datetime properties
  - Store all times in UTC using `timestamp without time zone` PostgreSQL column type
  - Convert `DateTime.UtcNow` to `DateTimeKind.Unspecified` for database operations
  - Pattern: `DateTime.SpecifyKind(DateTime.UtcNow, DateTimeKind.Unspecified)`
- **PostgreSQL DateTime Standards**: 
  - Always configure DateTime properties with `.HasColumnType("timestamp without time zone")`
  - Use `NOW() AT TIME ZONE 'UTC'` for default values (never `GETUTCDATE()`)
  - Avoid mixing DateTime kinds in database queries to prevent timezone conversion errors

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
- 028-enhanced-device-registration: Added C# .NET 8 with ASP.NET Core Web API + Entity Framework Core 9, JWT Authentication, AWS S3 SDK, AutoMapper, SixLabors.ImageSharp, SignalR
- 027-device-approval-group: Added C# .NET 8 (Backend), TypeScript 5.x (Frontend) + ASP.NET Core Web API, Entity Framework Core 9, Next.js 15, React 18, PostgreSQL, JWT Authentication, AWS S3
- 021-user-schedule-assignment: Added TypeScript 5.x with Next.js 15 (React 18), C# .NET 8 (backend) + React Query/TanStack Query, Redux Toolkit, Tailwind CSS 4, React Hook Form + Zod, Axios, Lucide Reac

<!-- MANUAL ADDITIONS START -->
<!-- MANUAL ADDITIONS END -->

<!-- ZONES: API / UI -->
<!-- The following section summarizes the two instruction zones so reviewers and the Copilot agent can reference them without needing to specify which file to use. -->
## Zones: API / UI

- API Zone (backend): Applies to `src/DigitalSignage.Api/**`, `src/DigitalSignage.Application/**`, `src/DigitalSignage.Domain/**`, `src/DigitalSignage.Infrastructure/**`.
    - Use this file for backend rules, EF Core configuration, DateTime patterns, DTOs, services, controllers, migrations, and testing patterns.
    - Key topics: .NET 8 WebAPI patterns, EF Core/PostgreSQL date/time config, JWT auth, S3 integration, health checks, logging, layered project layout, and migration commands.

- UI Zone (frontend): Applies to `src/digital-signage-web/**` — see `.github/instructions/copilot-instructions-ui.instructions.md` for the full frontend guidance.
    - Use this zone for Next.js 15 (App Router), React 18 + TypeScript, Tailwind CSS 4, React Query (TanStack), React Hook Form + Zod, Axios, and UI component conventions.
    - Key frontend rules: Server components by default; TypeScript strict mode; React Query for server state; Redux Toolkit for app state; typed Axios client; Zod schemas for forms; Tailwind styling conventions; accessibility and performance guidance.

If you need the full UI guidance, open `.github/instructions/copilot-instructions-ui.instructions.md` in the repo — it's the authoritative source for frontend rules and examples.
