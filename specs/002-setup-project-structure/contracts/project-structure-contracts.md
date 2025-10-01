# Project Structure Setup Contracts

## Solution Creation Contract

### CreateSolution
```json
{
  "operation": "CreateSolution",
  "input": {
    "solutionName": "DigitalSignage",
    "targetFramework": "net8.0",
    "projectStructure": "CleanArchitecture"
  },
  "output": {
    "solutionPath": "DigitalSignage.sln",
    "projects": [
      {
        "name": "DigitalSignage.Api",
        "type": "WebApi",
        "path": "src/DigitalSignage.Api/DigitalSignage.Api.csproj"
      },
      {
        "name": "DigitalSignage.Application", 
        "type": "ClassLibrary",
        "path": "src/DigitalSignage.Application/DigitalSignage.Application.csproj"
      },
      {
        "name": "DigitalSignage.Domain",
        "type": "ClassLibrary", 
        "path": "src/DigitalSignage.Domain/DigitalSignage.Domain.csproj"
      },
      {
        "name": "DigitalSignage.Infrastructure",
        "type": "ClassLibrary",
        "path": "src/DigitalSignage.Infrastructure/DigitalSignage.Infrastructure.csproj"
      }
    ],
    "success": true,
    "message": "Solution created successfully"
  }
}
```

## Project Configuration Contract

### ConfigureProject
```json
{
  "operation": "ConfigureProject",
  "input": {
    "projectName": "DigitalSignage.Api",
    "packageReferences": [
      {
        "name": "Microsoft.AspNetCore.OpenApi", 
        "version": "8.0.0"
      },
      {
        "name": "Microsoft.EntityFrameworkCore.Design",
        "version": "8.0.0"
      },
      {
        "name": "log4net",
        "version": "2.0.15"
      }
    ],
    "projectReferences": [
      "../DigitalSignage.Application/DigitalSignage.Application.csproj",
      "../DigitalSignage.Infrastructure/DigitalSignage.Infrastructure.csproj"
    ]
  },
  "output": {
    "projectFile": "src/DigitalSignage.Api/DigitalSignage.Api.csproj",
    "packagesInstalled": 3,
    "referencesAdded": 2,
    "success": true
  }
}
```

## Database Configuration Contract

### SetupDatabase
```json
{
  "operation": "SetupDatabase",
  "input": {
    "provider": "PostgreSQL",
    "alternateProvider": "SqlServer",
    "connectionStrings": {
      "Development": "Host=localhost;Database=DigitalSignage_Dev;Username=dev_user;Password=dev_password",
      "Staging": "Host=staging-db;Database=DigitalSignage_Staging;Username=staging_user;Password=${STAGING_DB_PASSWORD}",
      "Production": "Host=prod-db;Database=DigitalSignage_Prod;Username=prod_user;Password=${PROD_DB_PASSWORD}"
    }
  },
  "output": {
    "dbContextConfigured": true,
    "migrationsEnabled": true,
    "healthChecksAdded": true,
    "success": true
  }
}
```

## Test Project Configuration Contract

### SetupTesting
```json
{
  "operation": "SetupTesting", 
  "input": {
    "testFramework": "xUnit",
    "testDatabaseProvider": "InMemory",
    "projects": [
      {
        "name": "DigitalSignage.Api.Tests",
        "type": "Integration"
      },
      {
        "name": "DigitalSignage.Application.Tests", 
        "type": "Unit"
      },
      {
        "name": "DigitalSignage.Domain.Tests",
        "type": "Unit"
      },
      {
        "name": "DigitalSignage.Infrastructure.Tests",
        "type": "Integration"
      }
    ]
  },
  "output": {
    "testProjectsCreated": 4,
    "testDatabaseConfigured": true,
    "testRunnerSetup": true,
    "success": true
  }
}
```

## Docker Configuration Contract

### SetupDocker
```json
{
  "operation": "SetupDocker",
  "input": {
    "baseImage": "mcr.microsoft.com/dotnet/aspnet:8.0",
    "buildImage": "mcr.microsoft.com/dotnet/sdk:8.0", 
    "exposedPorts": [80, 443],
    "healthCheck": {
      "endpoint": "/healthz",
      "interval": "30s",
      "timeout": "10s",
      "retries": 3
    }
  },
  "output": {
    "dockerfileCreated": true,
    "dockerComposeCreated": true,
    "healthCheckConfigured": true,
    "success": true
  }
}
```

## AWS S3 Integration Contract

### ConfigureS3
```json
{
  "operation": "ConfigureS3",
  "input": {
    "bucketName": "digital-signage-media",
    "region": "us-west-2",
    "presignedUrlExpiry": "15m",
    "allowedFileTypes": ["image/jpeg", "image/png", "video/mp4", "text/html"]
  },
  "output": {
    "s3ServiceConfigured": true,
    "presignedUrlServiceSetup": true,
    "fileUploadEndpointCreated": true,
    "success": true
  }
}
```

## Build Pipeline Contract  

### SetupBuildPipeline
```json
{
  "operation": "SetupBuildPipeline",
  "input": {
    "ciProvider": "GitHubActions",
    "buildTargets": ["Debug", "Release"],
    "testExecution": true,
    "deploymentEnvironments": ["Development", "Staging", "Production"]
  },
  "output": {
    "workflowsCreated": 2,
    "buildStepsConfigured": true,
    "deploymentStepsConfigured": true,
    "success": true
  }
}
```