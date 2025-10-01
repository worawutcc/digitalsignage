# Tasks: Authentication System

**Input**: Design documents from `/specs/009-authentication-system/`
**Prerequisites**: plan.md ✅, research.md ✅, data-model.md ✅, contracts/ ✅

## Execution Flow (main)
```
✅ 1. Loaded plan.md - .NET 8 with JWT, BCrypt, EF Core stack
✅ 2. Loaded design documents:
     → data-model.md: User, RefreshToken entities
     → contracts/api-contract.md: 10 REST endpoints
     → contracts/database-contract.md: SQL schema  
     → research.md: JWT libraries, BCrypt decisions
     → quickstart.md: Test scenarios and setup
✅ 3. Generated tasks by category: Setup → Tests → Core → Integration → Polish
✅ 4. Applied task rules: [P] for parallel, TDD before implementation
✅ 5. Numbered T001-T023 with dependency chains
✅ 6. Validated: All contracts have tests, all entities have models, all endpoints covered
✅ 7. SUCCESS: Tasks ready for execution
```

## Format: `[ID] [P?] Description`
- **[P]**: Can run in parallel (different files, no dependencies)
- Include exact file paths in descriptions

## Path Conventions
- **Web API**: `src/DigitalSignage.*`, `tests/DigitalSignage.*`
- Paths relative to repository root: `/Users/worawutcc/workspace/worawutcc/digital-signage/digital_signage/`

## Phase 3.1: Setup
- [x] T001 Install NuGet packages: BCrypt.Net-Next, System.IdentityModel.Tokens.Jwt, Microsoft.AspNetCore.Authentication.JwtBearer in src/DigitalSignage.Infrastructure
- [x] T002 [P] Configure JWT settings in appsettings.json (SecretKey, Issuer, Audience, token expiry)
- [x] T003 [P] Configure linting and formatting tools (.editorconfig updates)

## Phase 3.2: Tests First (TDD) ⚠️ MUST COMPLETE BEFORE 3.3
**CRITICAL: These tests MUST be written and MUST FAIL before ANY implementation**
- [x] T004 [P] Contract test POST /api/auth/register in tests/DigitalSignage.Api.Tests/Controllers/AuthControllerTests.cs  
- [x] T005 [P] Contract test POST /api/auth/login in tests/DigitalSignage.Api.Tests/Controllers/AuthControllerTests.cs
- [x] T006 [P] Contract test POST /api/auth/device-login in tests/DigitalSignage.Api.Tests/Controllers/AuthControllerTests.cs
- [x] T007 [P] Contract test POST /api/auth/refresh in tests/DigitalSignage.Api.Tests/Controllers/AuthControllerTests.cs
- [x] T008 [P] Contract test POST /api/auth/logout in tests/DigitalSignage.Api.Tests/Controllers/AuthControllerTests.cs
- [x] T009 [P] Contract test GET /api/users/profile in tests/DigitalSignage.Api.Tests/Controllers/UsersControllerTests.cs
- [x] T010 [P] Contract test PUT /api/users/profile in tests/DigitalSignage.Api.Tests/Controllers/UsersControllerTests.cs
- [x] T011 [P] Contract test GET /api/users (admin) in tests/DigitalSignage.Api.Tests/Controllers/UsersControllerTests.cs
- [x] T012 [P] Integration test auth flow in tests/DigitalSignage.Api.Tests/Integration/AuthFlowIntegrationTests.cs

## Phase 3.3: Core Implementation (ONLY after tests are failing)
- [x] T013 [P] User entity extensions in src/DigitalSignage.Domain/Entities/User.cs
- [x] T014 [P] RefreshToken entity in src/DigitalSignage.Domain/Entities/RefreshToken.cs  
- [x] T015 [P] UserRole enum in src/DigitalSignage.Domain/Enums/UserRole.cs
- [x] T016 [P] Authentication DTOs in src/DigitalSignage.Application/DTOs/Auth/

- [ ] T017 AuthenticationService implementation in src/DigitalSignage.Infrastructure/Services/AuthenticationService.cs
- [ ] T018 JwtTokenService implementation in src/DigitalSignage.Infrastructure/Services/JwtTokenService.cs  
- [ ] T019 PasswordHashService implementation in src/DigitalSignage.Infrastructure/Services/PasswordHashService.cs
- [ ] T020 POST /api/auth/register endpoint in src/DigitalSignage.Api/Controllers/AuthController.cs
- [ ] T021 POST /api/auth/login endpoint in src/DigitalSignage.Api/Controllers/AuthController.cs
- [ ] T022 All remaining auth endpoints in src/DigitalSignage.Api/Controllers/AuthController.cs  
- [ ] T023 User profile endpoints in src/DigitalSignage.Api/Controllers/UsersController.cs

## Phase 3.4: Integration
- [ ] T024 EF Core configuration for User entity in src/DigitalSignage.Infrastructure/Data/Configurations/UserConfiguration.cs
- [ ] T025 EF Core configuration for RefreshToken entity in src/DigitalSignage.Infrastructure/Data/Configurations/RefreshTokenConfiguration.cs
- [ ] T026 Create and apply database migration: dotnet ef migrations add AddAuthenticationSystem
- [ ] T027 JWT authentication middleware in src/DigitalSignage.Api/Program.cs
- [ ] T028 Role-based authorization attributes in src/DigitalSignage.Api/Attributes/
- [ ] T029 Service registration in src/DigitalSignage.Api/Extensions/ServiceExtensions.cs

## Phase 3.5: Polish  
- [ ] T030 [P] Performance tests (auth endpoints <200ms) in tests/DigitalSignage.Api.Tests/Performance/
- [ ] T031 [P] Security audit logging in src/DigitalSignage.Application/Services/SecurityAuditService.cs
- [ ] T032 [P] Update API documentation with auth examples
- [ ] T033 Run manual testing from quickstart.md scenarios

## Dependencies & Execution Order

### Critical Path (Sequential)
```
T001 → T002,T003 → T004-T012 → T013-T016 → T017-T023 → T024-T029 → T030-T033
```

### Parallel Execution Groups
```bash
# Group 1: Setup (after T001)
T002 & T003  # Configuration and linting (different files)

# Group 2: Contract Tests (after Setup)
T004 & T005 & T006 & T007 & T008  # Auth controller tests (same file, different methods)
T009 & T010 & T011  # Users controller tests (same file, different methods)  
T012  # Integration tests (different file)

# Group 3: Domain Models (after Tests fail)
T013 & T014 & T015 & T016  # Different entity/enum/DTO files

# Group 4: Services & Controllers (sequential within controllers)
T017 & T018 & T019  # Service implementations (different files)
T020 → T021 → T022  # Auth endpoints (same controller file)
T023  # Users controller (different file)

# Group 5: Integration (after Core)
T024 & T025  # EF configurations (different files) 
T027 & T028  # Middleware and attributes (different files)

# Group 6: Polish (after Integration)
T030 & T031 & T032  # Performance, audit, docs (different files)
```

### Task Dependencies
- **Setup**: T001 before all others
- **Tests**: T004-T012 after T001-T003, must FAIL before T013-T023
- **Models**: T013-T016 after failed tests T004-T012
- **Services**: T017-T019 after models T013-T016
- **Controllers**: T020-T023 after services T017-T019
- **Integration**: T024-T029 after controllers T020-T023
- **Polish**: T030-T033 after integration T024-T029

## Parallel Execution Examples
```bash
# Setup phase
Task T002 & Task T003  # Run simultaneously

# Test phase  
Task T004,T005,T006,T007,T008 & Task T009,T010,T011 & Task T012

# Domain phase
Task T013 & Task T014 & Task T015 & Task T016

# Integration phase
Task T024 & Task T025  # EF configs
Task T027 & Task T028  # Middleware

# Polish phase
Task T030 & Task T031 & Task T032  # Final tasks
```

## Validation Checklist  
- [x] All 10 API endpoints from contracts/api-contract.md have implementation tasks
- [x] All 2 entities from data-model.md have creation tasks
- [x] All dependencies from research.md included in setup
- [x] TDD approach: contract tests before implementation  
- [x] Tests MUST FAIL before implementation begins
- [x] [P] marked for parallel tasks (different files)
- [x] Sequential tasks properly ordered
- [x] All file paths are specific and absolute

**Ready for execution** ✅ Tasks follow TDD methodology and dependency requirements.

## 🚫 Blocked Tasks
*None*

## 📝 Notes
- Follow OWASP authentication guidelines
- Implement proper error handling without information leakage
- Consider implementing 2FA in future versions