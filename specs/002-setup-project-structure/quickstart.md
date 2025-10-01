# Digital Signage .NET 8 Project Structure - Quickstart Guide

## Prerequisites
- .NET 8 SDK installed
- Docker Desktop installed
- Visual Studio 2022 or VS Code with C# extension
- Git for version control

## Quick Setup (5 minutes)

### Step 1: Create Solution Structure
```bash
# Create solution
dotnet new sln -n DigitalSignage

# Create projects
dotnet new webapi -n DigitalSignage.Api -o src/DigitalSignage.Api
dotnet new classlib -n DigitalSignage.Application -o src/DigitalSignage.Application  
dotnet new classlib -n DigitalSignage.Domain -o src/DigitalSignage.Domain
dotnet new classlib -n DigitalSignage.Infrastructure -o src/DigitalSignage.Infrastructure

# Add projects to solution
dotnet sln add src/DigitalSignage.Api/DigitalSignage.Api.csproj
dotnet sln add src/DigitalSignage.Application/DigitalSignage.Application.csproj
dotnet sln add src/DigitalSignage.Domain/DigitalSignage.Domain.csproj  
dotnet sln add src/DigitalSignage.Infrastructure/DigitalSignage.Infrastructure.csproj
```

### Step 2: Configure Project References
```bash
# Api references Application and Infrastructure
cd src/DigitalSignage.Api
dotnet add reference ../DigitalSignage.Application/DigitalSignage.Application.csproj
dotnet add reference ../DigitalSignage.Infrastructure/DigitalSignage.Infrastructure.csproj

# Application references Domain
cd ../DigitalSignage.Application
dotnet add reference ../DigitalSignage.Domain/DigitalSignage.Domain.csproj

# Infrastructure references Domain  
cd ../DigitalSignage.Infrastructure
dotnet add reference ../DigitalSignage.Domain/DigitalSignage.Domain.csproj
cd ../../..
```

### Step 3: Add Essential Packages
```bash
# Add EF Core and PostgreSQL to Infrastructure
cd src/DigitalSignage.Infrastructure
dotnet add package Microsoft.EntityFrameworkCore
dotnet add package Npgsql.EntityFrameworkCore.PostgreSQL
dotnet add package Microsoft.EntityFrameworkCore.SqlServer

# Add logging to Api
cd ../DigitalSignage.Api
dotnet add package log4net
dotnet add package Microsoft.Extensions.Diagnostics.HealthChecks.EntityFrameworkCore

# Add AWS S3 SDK
dotnet add package AWSSDK.S3
cd ../..
```

### Step 4: Create Test Projects
```bash
# Create test projects
dotnet new xunit -n DigitalSignage.Api.Tests -o tests/DigitalSignage.Api.Tests
dotnet new xunit -n DigitalSignage.Application.Tests -o tests/DigitalSignage.Application.Tests
dotnet new xunit -n DigitalSignage.Domain.Tests -o tests/DigitalSignage.Domain.Tests
dotnet new xunit -n DigitalSignage.Infrastructure.Tests -o tests/DigitalSignage.Infrastructure.Tests

# Add test packages
cd tests/DigitalSignage.Infrastructure.Tests
dotnet add package Microsoft.EntityFrameworkCore.InMemory
dotnet add package Microsoft.EntityFrameworkCore.Sqlite

# Add test projects to solution
cd ../..
dotnet sln add tests/DigitalSignage.Api.Tests/DigitalSignage.Api.Tests.csproj
dotnet sln add tests/DigitalSignage.Application.Tests/DigitalSignage.Application.Tests.csproj
dotnet sln add tests/DigitalSignage.Domain.Tests/DigitalSignage.Domain.Tests.csproj
dotnet sln add tests/DigitalSignage.Infrastructure.Tests/DigitalSignage.Infrastructure.Tests.csproj
```

### Step 5: Verify Setup
```bash
# Build solution
dotnet build

# Run tests
dotnet test

# Check project structure
tree src/ tests/
```

## Expected Directory Structure
```
DigitalSignage/
├── DigitalSignage.sln
├── src/
│   ├── DigitalSignage.Api/
│   │   ├── Controllers/
│   │   ├── Program.cs
│   │   ├── appsettings.json
│   │   └── DigitalSignage.Api.csproj
│   ├── DigitalSignage.Application/
│   │   ├── Services/
│   │   ├── DTOs/
│   │   └── DigitalSignage.Application.csproj
│   ├── DigitalSignage.Domain/
│   │   ├── Entities/
│   │   ├── Interfaces/
│   │   └── DigitalSignage.Domain.csproj
│   └── DigitalSignage.Infrastructure/
│       ├── Data/
│       ├── Repositories/
│       └── DigitalSignage.Infrastructure.csproj
└── tests/
    ├── DigitalSignage.Api.Tests/
    ├── DigitalSignage.Application.Tests/
    ├── DigitalSignage.Domain.Tests/
    └── DigitalSignage.Infrastructure.Tests/
```

## Validation Tests

### Test 1: Solution Builds Successfully
```bash
dotnet build
# Expected: Build succeeded. 0 Warning(s). 0 Error(s).
```

### Test 2: Project References Work
```bash
# In DigitalSignage.Api, you should be able to reference:
# - DigitalSignage.Application classes
# - DigitalSignage.Infrastructure classes (through Application)
# - DigitalSignage.Domain classes (through Application)
```

### Test 3: Test Projects Run
```bash
dotnet test
# Expected: Test run successful. Total tests: X, Passed: X, Failed: 0
```

### Test 4: Clean Architecture Dependencies
- ✅ Domain has no dependencies on other projects
- ✅ Application only references Domain
- ✅ Infrastructure only references Domain  
- ✅ Api references Application and Infrastructure
- ✅ Test projects reference their corresponding projects

## Next Steps
1. **Configure Database**: Set up Entity Framework DbContext
2. **Add Logging**: Configure log4net with structured logging
3. **Setup Docker**: Create Dockerfile and docker-compose.yml
4. **Configure Health Checks**: Add /healthz endpoint
5. **AWS S3 Integration**: Setup media file storage service
6. **CI/CD Pipeline**: Configure GitHub Actions workflows

## Troubleshooting

### Common Issues
1. **Build Failures**: Check project references are correct
2. **Missing Packages**: Run `dotnet restore` 
3. **Test Failures**: Ensure InMemory database packages are installed
4. **Docker Issues**: Verify Docker Desktop is running

### Verification Commands
```bash
# Check solution structure
dotnet sln list

# Verify package references
dotnet list package

# Check project references  
dotnet list reference
```

## Success Criteria
- [x] Solution builds without errors
- [x] All test projects created and runnable
- [x] Clean architecture dependencies enforced
- [x] Ready for domain entity implementation
- [x] Ready for database configuration
- [x] Ready for Docker containerization