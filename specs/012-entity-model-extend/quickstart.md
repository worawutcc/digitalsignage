# Quickstart: BaseEntity Extension Implementation and Validation

**Feature**: Entity Model Base Entity Extension and Date Column Standardization  
**Date**: 29 September 2025  
**Prerequisites**: .NET 8 SDK, PostgreSQL, existing Digital Signage system

## Quick Implementation Validation

### 1. Pre-Implementation Verification
```bash
# Verify current system state
cd /path/to/digital-signage
dotnet build
dotnet ef database update -p src/DigitalSignage.Infrastructure -s src/DigitalSignage.Api

# Check existing entities (should show inconsistent audit fields)
grep -r "CreatedAt\|UpdatedAt" src/DigitalSignage.Domain/Entities/
```

**Expected Output**: Inconsistent audit fields across entities
```
User.cs:    public DateTime CreatedAt { get; set; }
User.cs:    public DateTime? UpdatedAt { get; set; }
Media.cs:   public DateTime CreatedAt { get; set; }
Device.cs:  public DateTime CreatedAt { get; set; }
// PlaylistItem.cs: No audit fields
// SceneItem.cs: No audit fields
```

### 2. Implement BaseEntity
```bash
# Create BaseEntity in Domain layer
cat > src/DigitalSignage.Domain/Entities/BaseEntity.cs << 'EOF'
using System.ComponentModel.DataAnnotations;

namespace DigitalSignage.Domain.Entities;

/// <summary>
/// Base entity providing common audit trail fields for all domain entities
/// </summary>
public abstract class BaseEntity
{
    /// <summary>
    /// When the entity was created (UTC)
    /// </summary>
    [Required]
    public DateTime CreatedAt { get; set; }
    
    /// <summary>
    /// User ID who created the entity (-1 for system)
    /// </summary>
    [Required]
    public int CreatedBy { get; set; }
    
    /// <summary>
    /// When the entity was last updated (UTC)
    /// </summary>
    [Required]
    public DateTime UpdatedAt { get; set; }
    
    /// <summary>
    /// User ID who last updated the entity (-1 for system)
    /// </summary>
    [Required]
    public int UpdatedBy { get; set; }
}
EOF
```

### 3. Update Sample Entity (Media)
```bash
# Backup original Media entity
cp src/DigitalSignage.Domain/Entities/Media.cs src/DigitalSignage.Domain/Entities/Media.cs.backup

# Update Media to inherit from BaseEntity
# (Manual edit required - see example below)
```

**Example Media.cs Update**:
```csharp
// BEFORE
public class Media
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } // Remove - inherited from BaseEntity
    // No UpdatedAt, CreatedBy, UpdatedBy
}

// AFTER  
public class Media : BaseEntity
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    // CreatedAt, CreatedBy, UpdatedAt, UpdatedBy inherited from BaseEntity
}
```

### 4. Create and Run Migration
```bash
# Generate migration for BaseEntity changes
dotnet ef migrations add BaseEntityImplementation \
  -p src/DigitalSignage.Infrastructure \
  -s src/DigitalSignage.Api

# Review generated migration (should add audit columns)
cat src/DigitalSignage.Infrastructure/Migrations/*_BaseEntityImplementation.cs

# Apply migration to database
dotnet ef database update \
  -p src/DigitalSignage.Infrastructure \
  -s src/DigitalSignage.Api
```

**Expected Migration Content**:
```csharp
public partial class BaseEntityImplementation : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.AddColumn<int>(
            name: "created_by",
            table: "Medias", 
            type: "integer",
            nullable: false,
            defaultValue: -1);

        migrationBuilder.AddColumn<DateTime>(
            name: "updated_at",
            table: "Medias",
            type: "timestamp without time zone", 
            nullable: false,
            defaultValueSql: "CURRENT_TIMESTAMP");

        migrationBuilder.AddColumn<int>(
            name: "updated_by",
            table: "Medias",
            type: "integer", 
            nullable: false,
            defaultValue: -1);
    }
}
```

### 5. Verify Implementation
```bash
# Build and test
dotnet build
dotnet test

# Check database schema
psql -h localhost -U myuser -d digitalsignage -c "\d+ medias"
```

**Expected Database Schema**:
```sql
                          Table "public.medias"
   Column   |            Type             | Nullable |     Default
-----------+-----------------------------+----------+-----------------
 id        | integer                     | not null | nextval('...')
 name      | character varying(200)      |          |
 created_at| timestamp without time zone | not null | CURRENT_TIMESTAMP
 created_by| integer                     | not null | -1
 updated_at| timestamp without time zone | not null | CURRENT_TIMESTAMP  
 updated_by| integer                     | not null | -1
```

### 6. Test Audit Field Population
```bash
# Start API server
dotnet run --project src/DigitalSignage.Api &
API_PID=$!

# Test entity creation (audit fields auto-populated)
curl -X POST http://localhost:5100/api/media \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -d '{"name": "Test Media", "fileName": "test.jpg"}'

# Test entity update (UpdatedAt/UpdatedBy auto-populated)  
curl -X PUT http://localhost:5100/api/media/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -d '{"name": "Updated Media", "fileName": "test.jpg"}'

# Stop API server
kill $API_PID
```

**Expected API Response**:
```json
{
  "id": 1,
  "name": "Test Media",
  "fileName": "test.jpg",
  "createdAt": "2025-09-29T10:30:00Z",
  "updatedAt": "2025-09-29T10:30:00Z"
}
```

### 7. Validate Audit Trail Queries
```bash
# Connect to database and test audit queries
psql -h localhost -U myuser -d digitalsignage << 'EOF'
-- Find all entities created by specific user
SELECT 'medias' as table_name, id, name, created_at, created_by 
FROM medias WHERE created_by = 1;

-- Find recently updated entities
SELECT 'medias' as table_name, id, name, updated_at, updated_by
FROM medias WHERE updated_at >= NOW() - INTERVAL '1 hour';

-- Count entities by creation user
SELECT created_by, COUNT(*) as entity_count
FROM medias GROUP BY created_by;
EOF
```

## Integration Test Scenario

### Complete User Story Validation
**User Story**: As a system administrator, I need consistent audit trail information across all entities

```bash
# Test script for complete user story validation
cat > test-audit-trail.sh << 'EOF'
#!/bin/bash
set -e

echo "=== BaseEntity Audit Trail Integration Test ==="

# 1. Create test entities via API
echo "Creating test entities..."
MEDIA_ID=$(curl -s -X POST http://localhost:5100/api/media \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -d '{"name": "Audit Test Media"}' | jq -r '.id')

# 2. Update test entity  
echo "Updating test entity..."
sleep 1  # Ensure different timestamp
curl -s -X PUT http://localhost:5100/api/media/$MEDIA_ID \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -d '{"name": "Updated Audit Test Media"}' > /dev/null

# 3. Verify audit trail in database
echo "Verifying audit trail..."
psql -h localhost -U myuser -d digitalsignage -t -c "
  SELECT 
    CASE WHEN created_at IS NOT NULL THEN 'PASS' ELSE 'FAIL' END as created_at_check,
    CASE WHEN created_by IS NOT NULL THEN 'PASS' ELSE 'FAIL' END as created_by_check,
    CASE WHEN updated_at IS NOT NULL THEN 'PASS' ELSE 'FAIL' END as updated_at_check,
    CASE WHEN updated_by IS NOT NULL THEN 'PASS' ELSE 'FAIL' END as updated_by_check,
    CASE WHEN updated_at > created_at THEN 'PASS' ELSE 'FAIL' END as timestamp_order_check
  FROM medias WHERE id = $MEDIA_ID;
"

echo "=== Test Complete ==="
EOF

chmod +x test-audit-trail.sh
./test-audit-trail.sh
```

**Expected Output**:
```
=== BaseEntity Audit Trail Integration Test ===
Creating test entities...
Updating test entity...
Verifying audit trail...
 PASS | PASS | PASS | PASS | PASS
=== Test Complete ===
```

## Rollback Procedure

### If Implementation Issues Occur
```bash
# Rollback database migration
dotnet ef database update PreviousMigrationName \
  -p src/DigitalSignage.Infrastructure \
  -s src/DigitalSignage.Api

# Restore entity files from backup
cp src/DigitalSignage.Domain/Entities/Media.cs.backup \
   src/DigitalSignage.Domain/Entities/Media.cs

# Remove BaseEntity file
rm src/DigitalSignage.Domain/Entities/BaseEntity.cs

# Rebuild and verify
dotnet build
dotnet test
```

## Success Criteria Checklist

- [ ] BaseEntity class created with required audit fields
- [ ] At least one entity (Media) successfully inherits from BaseEntity
- [ ] Database migration creates audit columns with correct types
- [ ] API responses maintain existing format (no breaking changes)
- [ ] Audit fields auto-populated on entity creation
- [ ] Audit fields updated on entity modification  
- [ ] Database queries can filter by audit fields
- [ ] Integration tests pass
- [ ] No existing functionality broken

## Performance Validation

### Query Performance Test
```bash
# Test audit field query performance
psql -h localhost -U myuser -d digitalsignage << 'EOF'
\timing on

-- Test audit field filtering (should use indexes)
EXPLAIN ANALYZE SELECT * FROM medias WHERE created_at >= NOW() - INTERVAL '1 day';
EXPLAIN ANALYZE SELECT * FROM medias WHERE created_by = 1;

-- Verify indexes exist
\d medias
EOF
```

**Expected**: Query execution time < 50ms, indexes on audit fields present

This quickstart provides a complete validation path from implementation through testing, ensuring the BaseEntity extension works correctly and provides the required audit trail functionality.