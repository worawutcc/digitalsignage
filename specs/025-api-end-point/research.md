# Phase 0: Research for API Endpoints & Service Layer (Digital Signage)

## Unknowns from Technical Context
- Language/Version: C# .NET 8 (confirmed from copilot-instructions-api.instructions.md)
- Primary Dependencies: ASP.NET Core Web API, Entity Framework Core 8/9, PostgreSQL, AWS SDK S3, log4net
- Storage: PostgreSQL (confirmed)
- Testing: xUnit (skipped for this phase per requirements)
- Target Platform: Linux server (confirmed)
- Project Type: Web application (frontend + backend)
- Performance Goals: [NEEDS CLARIFICATION: explicit throughput/latency targets not specified]
- Constraints: [NEEDS CLARIFICATION: explicit latency/memory limits not specified]
- Scale/Scope: [NEEDS CLARIFICATION: explicit user/record scale not specified]

## Best Practices & Patterns
- Follow Clean Architecture: API (Controllers), Application (Services), Domain (Entities), Infrastructure (EF Core, S3)
- Use DTOs/ViewModels for all API requests/responses
- Validate input with ModelState or FluentValidation
- Use ProducesResponseType attributes for API documentation
- All DateTime values: UTC, stored as `timestamp without time zone` in PostgreSQL
- Service registration via extension methods
- Error handling: Standardized error responses, HTTP status codes
- No direct DB access in controllers
- Document all endpoints for frontend integration

## Integration Patterns
- RESTful API endpoints for all business functions referenced by UI
- Service layer encapsulates business logic and data access
- Input validation enforced at API boundary
- Error responses standardized for frontend consumption

## Decision Summary
- Use C# .NET 8, ASP.NET Core Web API, Entity Framework Core, PostgreSQL
- Implement missing endpoints and services for media, schedule, device, playlist, dashboard, user management
- Enforce input validation and error handling as per guidelines
- Skip test implementation for this phase

## Alternatives Considered
- GraphQL API: Rejected for this phase due to RESTful convention in existing codebase
- Direct DB access in controllers: Rejected in favor of service layer for maintainability
- In-memory storage: Rejected, must use PostgreSQL for persistence

## Rationale
- Aligns with project standards and copilot-instructions-api.instructions.md
- Ensures maintainability, scalability, and frontend compatibility
- Follows constitutional principles: Library-first, CLI interface, Test-first (tests skipped for this phase), Integration testing, Simplicity
