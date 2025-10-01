# Data Model: Basic Hierarchy Device Grouping

## Entity Model Changes

### DeviceGroup Entity Extension
```csharp
namespace DigitalSignage.Domain.Entities;

public class DeviceGroup : BaseEntity
{
    // Existing properties
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public int CreatedByUserId { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    
    // NEW: Hierarchical properties
    public int? ParentGroupId { get; set; }
    public virtual DeviceGroup? ParentGroup { get; set; }
    public virtual ICollection<DeviceGroup> ChildGroups { get; set; } = new List<DeviceGroup>();
    
    // Computed property for breadcrumb navigation
    public string Path { get; private set; } = string.Empty;
    
    // Existing navigation properties
    public virtual ICollection<Device> Devices { get; set; } = new List<Device>();
    public virtual User CreatedByUser { get; set; } = null!;
    
    // NEW: Hierarchy helper methods
    public bool IsRootGroup => ParentGroupId == null;
    public bool HasChildren => ChildGroups?.Any() == true;
    public int Level { get; private set; } // Computed during queries
}
```

### HierarchyPath Value Object
```csharp
namespace DigitalSignage.Domain.ValueObjects;

public class HierarchyPath : ValueObject
{
    public string FullPath { get; private set; }
    public IReadOnlyList<string> Segments { get; private set; }
    public int Depth => Segments.Count;
    
    private HierarchyPath(string fullPath, IEnumerable<string> segments)
    {
        FullPath = fullPath;
        Segments = segments.ToList().AsReadOnly();
    }
    
    public static HierarchyPath Create(IEnumerable<string> segments)
    {
        var segmentList = segments.Where(s => !string.IsNullOrWhiteSpace(s)).ToList();
        var fullPath = string.Join(" / ", segmentList);
        return new HierarchyPath(fullPath, segmentList);
    }
    
    public static HierarchyPath Root() => new HierarchyPath(string.Empty, Enumerable.Empty<string>());
    
    protected override IEnumerable<object> GetEqualityComponents()
    {
        yield return FullPath;
    }
}
```

## Database Migration

### Migration: AddHierarchicalGrouping
```csharp
public partial class AddHierarchicalGrouping : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        // Add hierarchical columns
        migrationBuilder.AddColumn<int>(
            name: "ParentGroupId",
            table: "DeviceGroups",
            type: "integer",
            nullable: true);
            
        migrationBuilder.AddColumn<string>(
            name: "Path",
            table: "DeviceGroups",
            type: "text",
            nullable: false,
            defaultValue: "");
        
        // Create self-referencing foreign key
        migrationBuilder.CreateIndex(
            name: "IX_DeviceGroups_ParentGroupId",
            table: "DeviceGroups",
            column: "ParentGroupId");
            
        migrationBuilder.AddForeignKey(
            name: "FK_DeviceGroups_DeviceGroups_ParentGroupId",
            table: "DeviceGroups",
            column: "ParentGroupId",
            principalTable: "DeviceGroups",
            principalColumn: "Id",
            onDelete: ReferentialAction.Restrict);
            
        // Add check constraint to prevent self-reference
        migrationBuilder.Sql(@"
            ALTER TABLE ""DeviceGroups"" 
            ADD CONSTRAINT ""CHK_DeviceGroups_NoSelfReference"" 
            CHECK (""Id"" != ""ParentGroupId"")");
            
        // Create path computation function
        migrationBuilder.Sql(@"
            CREATE OR REPLACE FUNCTION compute_hierarchy_path(group_id INTEGER)
            RETURNS TEXT AS $$
            DECLARE
                path_result TEXT := '';
                current_id INTEGER := group_id;
                current_name TEXT;
                parent_id INTEGER;
                depth_counter INTEGER := 0;
            BEGIN
                WHILE current_id IS NOT NULL AND depth_counter < 20 LOOP
                    SELECT ""Name"", ""ParentGroupId"" INTO current_name, parent_id
                    FROM ""DeviceGroups"" WHERE ""Id"" = current_id;
                    
                    IF current_name IS NULL THEN
                        EXIT;
                    END IF;
                    
                    IF path_result = '' THEN
                        path_result := current_name;
                    ELSE
                        path_result := current_name || ' / ' || path_result;
                    END IF;
                    
                    current_id := parent_id;
                    depth_counter := depth_counter + 1;
                END LOOP;
                
                RETURN COALESCE(path_result, '');
            END;
            $$ LANGUAGE plpgsql;");
    }
    
    protected override void Down(MigrationBuilder migrationBuilder)
    {
        // Remove path computation function
        migrationBuilder.Sql("DROP FUNCTION IF EXISTS compute_hierarchy_path(INTEGER)");
        
        // Remove check constraint
        migrationBuilder.Sql(@"ALTER TABLE ""DeviceGroups"" DROP CONSTRAINT IF EXISTS ""CHK_DeviceGroups_NoSelfReference""");
        
        // Remove foreign key and index
        migrationBuilder.DropForeignKey(
            name: "FK_DeviceGroups_DeviceGroups_ParentGroupId",
            table: "DeviceGroups");
            
        migrationBuilder.DropIndex(
            name: "IX_DeviceGroups_ParentGroupId",
            table: "DeviceGroups");
            
        // Remove columns
        migrationBuilder.DropColumn(
            name: "ParentGroupId",
            table: "DeviceGroups");
            
        migrationBuilder.DropColumn(
            name: "Path",
            table: "DeviceGroups");
    }
}
```

## EF Core Configuration

### DeviceGroupConfiguration
```csharp
namespace DigitalSignage.Infrastructure.Data.Configurations;

public class DeviceGroupConfiguration : IEntityTypeConfiguration<DeviceGroup>
{
    public void Configure(EntityTypeBuilder<DeviceGroup> builder)
    {
        builder.ToTable("DeviceGroups");
        
        // Primary key
        builder.HasKey(dg => dg.Id);
        
        // Properties
        builder.Property(dg => dg.Name)
               .IsRequired()
               .HasMaxLength(200);
               
        builder.Property(dg => dg.Description)
               .HasMaxLength(1000);
               
        // NEW: Hierarchical relationships
        builder.HasOne(dg => dg.ParentGroup)
               .WithMany(dg => dg.ChildGroups)
               .HasForeignKey(dg => dg.ParentGroupId)
               .OnDelete(DeleteBehavior.Restrict)
               .HasConstraintName("FK_DeviceGroups_DeviceGroups_ParentGroupId");
               
        // Indexes for performance
        builder.HasIndex(dg => dg.ParentGroupId)
               .HasDatabaseName("IX_DeviceGroups_ParentGroupId");
               
        builder.HasIndex(dg => dg.Name)
               .HasDatabaseName("IX_DeviceGroups_Name");
        
        // Computed path property
        builder.Property(dg => dg.Path)
               .HasComputedColumnSql("compute_hierarchy_path(\"Id\")", stored: false)
               .ValueGeneratedOnAddOrUpdate();
        
        // Existing relationships
        builder.HasMany(dg => dg.Devices)
               .WithOne(d => d.DeviceGroup)
               .HasForeignKey(d => d.DeviceGroupId)
               .OnDelete(DeleteBehavior.Restrict);
               
        builder.HasOne(dg => dg.CreatedByUser)
               .WithMany()
               .HasForeignKey(dg => dg.CreatedByUserId)
               .OnDelete(DeleteBehavior.Restrict);
    }
}
```

## Repository Interface Extensions

### IDeviceGroupRepository
```csharp
namespace DigitalSignage.Domain.Interfaces;

public interface IDeviceGroupRepository : IRepository<DeviceGroup>
{
    // Existing methods
    Task<IEnumerable<DeviceGroup>> GetAllAsync();
    Task<DeviceGroup?> GetByIdAsync(int id);
    Task<DeviceGroup> CreateAsync(DeviceGroup deviceGroup);
    Task UpdateAsync(DeviceGroup deviceGroup);
    Task DeleteAsync(int id);
    
    // NEW: Hierarchical query methods
    Task<IEnumerable<DeviceGroup>> GetRootGroupsAsync();
    Task<IEnumerable<DeviceGroup>> GetChildrenAsync(int parentGroupId);
    Task<IEnumerable<DeviceGroup>> GetDescendantsAsync(int parentGroupId);
    Task<IEnumerable<DeviceGroup>> GetAncestorsAsync(int groupId);
    Task<DeviceGroup?> GetWithHierarchyAsync(int id); // Include parent and children
    Task<bool> IsDescendantOfAsync(int groupId, int potentialAncestorId);
    Task<int> GetDepthAsync(int groupId);
    Task<int> GetDescendantCountAsync(int groupId);
    Task<IEnumerable<DeviceGroup>> SearchInHierarchyAsync(string searchTerm);
    Task<bool> CanMoveGroupAsync(int groupId, int? newParentId);
    Task MoveGroupAsync(int groupId, int? newParentId);
}
```

## DTOs for API Layer

### DeviceGroupTreeDto
```csharp
namespace DigitalSignage.Application.DTOs.DeviceGroup;

public class DeviceGroupTreeDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public int? ParentGroupId { get; set; }
    public string Path { get; set; } = string.Empty;
    public int DeviceCount { get; set; }
    public int TotalDeviceCount { get; set; } // Including descendants
    public int ChildGroupCount { get; set; }
    public int Level { get; set; }
    public bool HasChildren { get; set; }
    public List<DeviceGroupTreeDto> Children { get; set; } = new();
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}
```

### CreateDeviceGroupRequest
```csharp
public class CreateDeviceGroupRequest
{
    [Required]
    [StringLength(200, MinimumLength = 1)]
    public string Name { get; set; } = string.Empty;
    
    [StringLength(1000)]
    public string? Description { get; set; }
    
    public int? ParentGroupId { get; set; }
}
```

### MoveDeviceGroupRequest
```csharp
public class MoveDeviceGroupRequest
{
    [Required]
    public int GroupId { get; set; }
    
    public int? NewParentId { get; set; }
    
    [StringLength(500)]
    public string? Reason { get; set; }
}
```

### DeviceGroupBreadcrumbDto
```csharp
public class DeviceGroupBreadcrumbDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public int Level { get; set; }
}
```

## Validation Rules

### HierarchyValidationRules
```csharp
namespace DigitalSignage.Domain.Services;

public static class HierarchyValidationRules
{
    public const int MaxDepth = 10;
    public const int MaxChildrenPerGroup = 1000;
    
    public static ValidationResult ValidateGroupCreation(string name, int? parentGroupId)
    {
        if (string.IsNullOrWhiteSpace(name))
            return ValidationResult.Failure("Group name is required");
            
        if (name.Length > 200)
            return ValidationResult.Failure("Group name cannot exceed 200 characters");
            
        return ValidationResult.Success;
    }
    
    public static async Task<ValidationResult> ValidateGroupMoveAsync(
        IDeviceGroupRepository repository, 
        int groupId, 
        int? newParentId)
    {
        if (newParentId == null)
            return ValidationResult.Success; // Moving to root is always valid
            
        if (groupId == newParentId)
            return ValidationResult.Failure("Group cannot be its own parent");
            
        // Check if new parent is descendant of moving group
        if (await repository.IsDescendantOfAsync(newParentId.Value, groupId))
            return ValidationResult.Failure("Cannot move group to its own descendant");
            
        // Check depth limit
        var newDepth = await repository.GetDepthAsync(newParentId.Value) + 1;
        if (newDepth > MaxDepth)
            return ValidationResult.Failure($"Move would exceed maximum depth of {MaxDepth}");
            
        return ValidationResult.Success;
    }
}
```

## Performance Considerations

### Query Optimization Strategy
1. **Lazy Loading**: Disable by default for tree queries to prevent N+1 problems
2. **Selective Loading**: Load only required levels based on UI needs
3. **Batch Operations**: Group multiple hierarchy changes into transactions
4. **Caching**: Cache frequently accessed tree portions (root groups, user's branch)
5. **Pagination**: Implement cursor-based pagination for large child collections

### Memory Management
- Use projection queries (DTOs) instead of full entities for tree display
- Implement streaming for large hierarchy exports
- Dispose of DbContext promptly in tree enumeration scenarios