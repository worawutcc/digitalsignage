# BaseEntity Quick Reference

## 🚀 Quick Start

### 1. Make Your Entity Auditable
```csharp
public class MyEntity : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    // BaseEntity provides: CreatedAt, UpdatedAt, CreatedBy, UpdatedBy
}
```

### 2. Use Entity Framework Operations
```csharp
// Create
var entity = new MyEntity { Name = "Test" };
context.MyEntities.Add(entity);
await context.SaveChangesAsync();
// ✅ Audit fields automatically populated

// Update
entity.Name = "Updated";
await context.SaveChangesAsync();
// ✅ UpdatedAt and UpdatedBy automatically updated
```

## 📋 Audit Fields

| Field | Type | Purpose | When Set |
|-------|------|---------|----------|
| `CreatedAt` | `DateTimeOffset` | Creation timestamp | On insert only |
| `UpdatedAt` | `DateTimeOffset` | Last modification timestamp | On insert and update |
| `CreatedBy` | `int` | User who created | On insert only |
| `UpdatedBy` | `int` | User who last modified | On insert and update |

## 🔧 Service Registration

```csharp
// Program.cs or Startup.cs
services.AddHttpContextAccessor();
services.AddScoped<IUserContext, UserContext>();
```

## 🧪 Testing

```csharp
[Fact]
public async Task CreateEntity_PopulatesAuditFields()
{
    // Arrange
    var mockUserContext = new Mock<IUserContext>();
    mockUserContext.Setup(x => x.GetCurrentUserId()).Returns(123);
    var context = new AppDbContext(options, mockUserContext.Object);

    // Act
    var entity = new MyEntity { Name = "Test" };
    context.MyEntities.Add(entity);
    await context.SaveChangesAsync();

    // Assert
    Assert.Equal(123, entity.CreatedBy);
    Assert.True(entity.CreatedAt > DateTimeOffset.UtcNow.AddMinutes(-1));
}
```

## ⚡ Performance Tips

```csharp
// ✅ Good: Bulk operations
context.MyEntities.AddRange(entities);
await context.SaveChangesAsync();

// ✅ Good: Single SaveChanges call
context.Entity1.Add(entity1);
context.Entity2.Add(entity2);
await context.SaveChangesAsync(); // Both get same timestamp

// ❌ Avoid: Multiple SaveChanges calls
context.Entity1.Add(entity1);
await context.SaveChangesAsync();
context.Entity2.Add(entity2);
await context.SaveChangesAsync(); // Different timestamps
```

## 🚫 Excluded Entities

These entities don't inherit from BaseEntity (by design):
- `HealthCheckResult` - Has custom `CheckedAt`
- `Service`, `ServiceInstance` - System configuration
- `Playlist*` entities - Custom audit pattern
- `Scene*` entities - Complex lifecycle management

## 🐛 Common Issues

| Problem | Solution |
|---------|----------|
| Audit fields show `-1` (system user) | Check JWT authentication middleware |
| Audit fields are null/default | Ensure entity inherits `BaseEntity` |
| Performance slow | Use bulk operations, add indexes |
| Tests failing | Mock `IUserContext` properly |

## 📚 Key Constants

```csharp
UserContext.SystemUserId = -1; // Used for system operations
```

## 🔒 Security Notes

- User IDs extracted from JWT `ClaimTypes.NameIdentifier`
- Invalid/missing user context falls back to system user (-1)
- Audit fields are immutable after creation (`CreatedAt`, `CreatedBy`)

## 📊 Database Schema

```sql
-- All BaseEntity tables include:
created_at TIMESTAMPTZ NOT NULL,
updated_at TIMESTAMPTZ NOT NULL,
created_by INTEGER NOT NULL,
updated_by INTEGER NOT NULL
```

## 🔄 Migration Commands

```bash
# Add audit fields to existing entity
dotnet ef migrations add AddAuditFieldsToMyEntity -p src/DigitalSignage.Infrastructure -s src/DigitalSignage.Api

# Apply migration
dotnet ef database update -p src/DigitalSignage.Infrastructure -s src/DigitalSignage.Api
```

## 📈 Example Queries

```csharp
// Find entities created by specific user
var userEntities = await context.MyEntities
    .Where(e => e.CreatedBy == userId)
    .ToListAsync();

// Find recently modified entities
var recentlyModified = await context.MyEntities
    .Where(e => e.UpdatedAt > DateTimeOffset.UtcNow.AddDays(-7))
    .ToListAsync();

// Audit trail report
var auditReport = await context.MyEntities
    .Select(e => new {
        e.Id,
        e.Name,
        CreatedBy = e.CreatedBy,
        CreatedAt = e.CreatedAt,
        LastModifiedBy = e.UpdatedBy,
        LastModifiedAt = e.UpdatedAt
    })
    .ToListAsync();
```

---

💡 **Pro Tip**: Always use `SaveChangesAsync()` for better performance and to ensure audit fields are populated correctly.

📖 **Full Documentation**: See `docs/BaseEntity-Implementation-Guide.md` for complete details.