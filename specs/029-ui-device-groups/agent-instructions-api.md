# Agent Instructions: Enhanced Device Groups API Integration

**Phase**: 1 - Design & Contracts  
**Date**: 2025-10-06  
**Feature**: 029-ui-device-groups

## API-Specific Instructions (C# .NET Backend)

### DeviceGroupController Enhancements

**Location**: `src/DigitalSignage.Api/Controllers/DeviceGroupController.cs`

**SignalR Integration Requirements**:
```csharp
[ApiController]
[Route("api/[controller]")]
public class DeviceGroupController : ControllerBase
{
    private readonly IDeviceGroupService _deviceGroupService;
    private readonly IHubContext<NotificationHub> _hubContext;
    private readonly ILogger<DeviceGroupController> _logger;

    // All CRUD operations must broadcast SignalR notifications
    [HttpPost]
    public async Task<ActionResult<DeviceGroupDto>> CreateDeviceGroup(
        [FromBody] CreateDeviceGroupRequest request)
    {
        var result = await _deviceGroupService.CreateDeviceGroupAsync(request);
        
        if (result.Success)
        {
            // Broadcast to all connected clients
            await _hubContext.Clients.All.SendAsync("GroupCreated", result.Data);
            
            _logger.LogInformation("Device group created: {GroupId} - {GroupName}", 
                result.Data.Id, result.Data.Name);
        }
        
        return CreatedAtAction(nameof(GetDeviceGroup), 
            new { id = result.Data.Id }, result.Data);
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<DeviceGroupDto>> UpdateDeviceGroup(
        int id, [FromBody] UpdateDeviceGroupRequest request)
    {
        var result = await _deviceGroupService.UpdateDeviceGroupAsync(id, request);
        
        if (result.Success)
        {
            await _hubContext.Clients.All.SendAsync("GroupUpdated", result.Data);
        }
        
        return Ok(result.Data);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteDeviceGroup(int id)
    {
        var result = await _deviceGroupService.DeleteDeviceGroupAsync(id);
        
        if (result.Success)
        {
            await _hubContext.Clients.All.SendAsync("GroupDeleted", id);
        }
        
        return NoContent();
    }
}
```

### Service Layer Enhancement Requirements

**Location**: `src/DigitalSignage.Application/Services/DeviceGroupService.cs`

**Business Logic Implementation**:
```csharp
public class DeviceGroupService : IDeviceGroupService
{
    private readonly IDeviceGroupRepository _repository;
    private readonly IMapper _mapper;
    private readonly ILogger<DeviceGroupService> _logger;

    // Required: Hierarchy calculation logic
    public async Task<ServiceResult<DeviceGroupDto>> CreateDeviceGroupAsync(
        CreateDeviceGroupRequest request)
    {
        try
        {
            // Validate parent group exists and calculate hierarchy
            if (request.ParentGroupId.HasValue)
            {
                var parentGroup = await _repository.GetByIdAsync(request.ParentGroupId.Value);
                if (parentGroup == null)
                {
                    return ServiceResult<DeviceGroupDto>.Failure("Parent group not found");
                }
                
                // Check for maximum depth (10 levels)
                if (parentGroup.Level >= 9)
                {
                    return ServiceResult<DeviceGroupDto>.Failure(
                        "Maximum hierarchy depth reached");
                }
            }

            // Check for duplicate names at same level
            var duplicateExists = await _repository.ExistsAsync(
                request.Name, request.ParentGroupId);
            
            if (duplicateExists)
            {
                return ServiceResult<DeviceGroupDto>.Failure(
                    "A group with this name already exists at this level", 
                    "DUPLICATE_NAME");
            }

            var entity = new DeviceGroup
            {
                Name = request.Name,
                Description = request.Description,
                ParentId = request.ParentGroupId,
                CreatedAt = DateTime.SpecifyKind(DateTime.UtcNow, DateTimeKind.Unspecified),
                UpdatedAt = DateTime.SpecifyKind(DateTime.UtcNow, DateTimeKind.Unspecified)
            };

            await _repository.CreateAsync(entity);
            
            // Recalculate hierarchy fields
            await RecalculateHierarchyAsync(entity.Id);
            
            var dto = _mapper.Map<DeviceGroupDto>(entity);
            return ServiceResult<DeviceGroupDto>.Success(dto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating device group: {GroupName}", request.Name);
            return ServiceResult<DeviceGroupDto>.Failure("Failed to create device group");
        }
    }

    // Required: Hierarchy recalculation method
    private async Task RecalculateHierarchyAsync(int groupId)
    {
        var group = await _repository.GetByIdAsync(groupId);
        if (group == null) return;

        // Calculate level and path
        var level = 0;
        var path = group.Name;
        var currentGroup = group;

        while (currentGroup.ParentId.HasValue)
        {
            currentGroup = await _repository.GetByIdAsync(currentGroup.ParentId.Value);
            if (currentGroup == null) break;
            
            level++;
            path = $"{currentGroup.Name}/{path}";
        }

        // Update hierarchy fields
        group.Level = level;
        group.Path = $"/{path}";
        
        // Calculate device counts
        await RecalculateDeviceCountsAsync(group);
        
        await _repository.UpdateAsync(group);
    }

    // Required: Device count calculation
    private async Task RecalculateDeviceCountsAsync(DeviceGroup group)
    {
        // Direct device count
        group.DeviceCount = await _repository.GetDirectDeviceCountAsync(group.Id);
        
        // Child group count
        group.ChildGroupCount = await _repository.GetChildGroupCountAsync(group.Id);
        
        // Total device count (including children)
        group.TotalDeviceCount = await _repository.GetTotalDeviceCountAsync(group.Id);
        
        // Update flags
        group.CanDelete = group.DeviceCount == 0 && group.ChildGroupCount == 0;
        group.CanMove = group.ChildGroupCount < 100; // Prevent moving large hierarchies
    }
}
```

### Repository Layer Requirements

**Location**: `src/DigitalSignage.Infrastructure/Repositories/DeviceGroupRepository.cs`

**Required Query Methods**:
```csharp
public class DeviceGroupRepository : IDeviceGroupRepository
{
    private readonly AppDbContext _context;

    // Required: Hierarchical tree query
    public async Task<List<DeviceGroup>> GetHierarchicalTreeAsync()
    {
        return await _context.DeviceGroups
            .OrderBy(g => g.Level)
            .ThenBy(g => g.Name)
            .ToListAsync();
    }

    // Required: Search functionality
    public async Task<List<DeviceGroup>> SearchAsync(DeviceGroupSearchParams searchParams)
    {
        var query = _context.DeviceGroups.AsQueryable();

        if (!string.IsNullOrEmpty(searchParams.Query))
        {
            query = query.Where(g => 
                g.Name.Contains(searchParams.Query) ||
                (g.Description != null && g.Description.Contains(searchParams.Query)));
        }

        if (searchParams.ParentId.HasValue)
        {
            if (searchParams.IncludeChildren == true)
            {
                // Include all descendants
                query = query.Where(g => g.Path.StartsWith(
                    _context.DeviceGroups
                        .Where(p => p.Id == searchParams.ParentId.Value)
                        .Select(p => p.Path)
                        .FirstOrDefault()));
            }
            else
            {
                // Direct children only
                query = query.Where(g => g.ParentId == searchParams.ParentId.Value);
            }
        }

        if (searchParams.Level.HasValue)
        {
            query = query.Where(g => g.Level == searchParams.Level.Value);
        }

        // Apply sorting
        query = searchParams.SortBy switch
        {
            "name" => searchParams.SortOrder == "desc" 
                ? query.OrderByDescending(g => g.Name)
                : query.OrderBy(g => g.Name),
            "createdAt" => searchParams.SortOrder == "desc"
                ? query.OrderByDescending(g => g.CreatedAt)
                : query.OrderBy(g => g.CreatedAt),
            "deviceCount" => searchParams.SortOrder == "desc"
                ? query.OrderByDescending(g => g.DeviceCount)
                : query.OrderBy(g => g.DeviceCount),
            _ => query.OrderBy(g => g.Name)
        };

        return await query.ToListAsync();
    }

    // Required: Validation queries
    public async Task<bool> ExistsAsync(string name, int? parentId)
    {
        return await _context.DeviceGroups
            .AnyAsync(g => g.Name == name && g.ParentId == parentId);
    }

    public async Task<bool> HasChildGroupsAsync(int groupId)
    {
        return await _context.DeviceGroups
            .AnyAsync(g => g.ParentId == groupId);
    }

    public async Task<bool> HasAssignedDevicesAsync(int groupId)
    {
        return await _context.Devices
            .AnyAsync(d => d.DeviceGroupId == groupId);
    }

    // Required: Count calculations
    public async Task<int> GetDirectDeviceCountAsync(int groupId)
    {
        return await _context.Devices
            .CountAsync(d => d.DeviceGroupId == groupId);
    }

    public async Task<int> GetChildGroupCountAsync(int groupId)
    {
        return await _context.DeviceGroups
            .CountAsync(g => g.ParentId == groupId);
    }

    public async Task<int> GetTotalDeviceCountAsync(int groupId)
    {
        // Get all descendant groups
        var groupPath = await _context.DeviceGroups
            .Where(g => g.Id == groupId)
            .Select(g => g.Path)
            .FirstOrDefaultAsync();

        if (string.IsNullOrEmpty(groupPath))
            return 0;

        var descendantGroupIds = await _context.DeviceGroups
            .Where(g => g.Path.StartsWith(groupPath))
            .Select(g => g.Id)
            .ToListAsync();

        return await _context.Devices
            .CountAsync(d => descendantGroupIds.Contains(d.DeviceGroupId));
    }
}
```

### Entity Configuration Requirements

**Location**: `src/DigitalSignage.Infrastructure/Data/Configurations/DeviceGroupConfiguration.cs`

**Required Entity Framework Configuration**:
```csharp
public class DeviceGroupConfiguration : IEntityTypeConfiguration<DeviceGroup>
{
    public void Configure(EntityTypeBuilder<DeviceGroup> builder)
    {
        builder.ToTable("DeviceGroups");

        builder.HasKey(e => e.Id);

        builder.Property(e => e.Name)
            .IsRequired()
            .HasMaxLength(255);

        builder.Property(e => e.Description)
            .HasMaxLength(500);

        builder.Property(e => e.Path)
            .IsRequired()
            .HasMaxLength(2000);

        builder.Property(e => e.Level)
            .IsRequired()
            .HasDefaultValue(0);

        // CRITICAL: PostgreSQL DateTime configuration
        builder.Property(e => e.CreatedAt)
            .IsRequired()
            .HasColumnType("timestamp without time zone")
            .HasDefaultValueSql("NOW() AT TIME ZONE 'UTC'");

        builder.Property(e => e.UpdatedAt)
            .IsRequired()
            .HasColumnType("timestamp without time zone");

        // Self-referencing relationship
        builder.HasOne(e => e.Parent)
            .WithMany(e => e.Children)
            .HasForeignKey(e => e.ParentId)
            .OnDelete(DeleteBehavior.Restrict);

        // Indexes for performance
        builder.HasIndex(e => e.ParentId);
        builder.HasIndex(e => e.Path);
        builder.HasIndex(e => e.Level);
        builder.HasIndex(e => new { e.Name, e.ParentId })
            .IsUnique()
            .HasDatabaseName("IX_DeviceGroups_Name_ParentId_Unique");

        // Device relationship
        builder.HasMany(e => e.Devices)
            .WithOne(d => d.DeviceGroup)
            .HasForeignKey(d => d.DeviceGroupId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
```

### Background Service Requirements

**Location**: `src/DigitalSignage.Api/Services/DeviceGroupMaintenanceService.cs`

**Required Maintenance Tasks**:
```csharp
public class DeviceGroupMaintenanceService : BackgroundService
{
    private readonly IServiceProvider _serviceProvider;
    private readonly ILogger<DeviceGroupMaintenanceService> _logger;
    private readonly TimeSpan _interval = TimeSpan.FromHours(1);

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                using var scope = _serviceProvider.CreateScope();
                var repository = scope.ServiceProvider
                    .GetRequiredService<IDeviceGroupRepository>();

                // Recalculate device counts for all groups
                await RecalculateAllDeviceCountsAsync(repository);

                // Clean up orphaned groups (safety check)
                await CleanupOrphanedGroupsAsync(repository);

                _logger.LogInformation("Device group maintenance completed at {Time}", 
                    DateTime.UtcNow);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during device group maintenance");
            }

            await Task.Delay(_interval, stoppingToken);
        }
    }

    private async Task RecalculateAllDeviceCountsAsync(IDeviceGroupRepository repository)
    {
        var allGroups = await repository.GetAllAsync();
        
        foreach (var group in allGroups)
        {
            // CRITICAL: Use DateTimeKind.Unspecified for database operations
            group.DeviceCount = await repository.GetDirectDeviceCountAsync(group.Id);
            group.TotalDeviceCount = await repository.GetTotalDeviceCountAsync(group.Id);
            group.ChildGroupCount = await repository.GetChildGroupCountAsync(group.Id);
            group.UpdatedAt = DateTime.SpecifyKind(DateTime.UtcNow, DateTimeKind.Unspecified);
            
            await repository.UpdateAsync(group);
        }
    }
}
```

### Validation Requirements

**Location**: `src/DigitalSignage.Application/Validators/DeviceGroupValidators.cs`

**FluentValidation Rules**:
```csharp
public class CreateDeviceGroupRequestValidator : AbstractValidator<CreateDeviceGroupRequest>
{
    public CreateDeviceGroupRequestValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Group name is required")
            .MaximumLength(255).WithMessage("Group name must be less than 255 characters")
            .Matches(@"^[a-zA-Z0-9\s\-_]+$")
            .WithMessage("Group name contains invalid characters");

        RuleFor(x => x.Description)
            .MaximumLength(500).WithMessage("Description must be less than 500 characters");

        RuleFor(x => x.ParentGroupId)
            .GreaterThan(0).WithMessage("Parent group ID must be positive")
            .When(x => x.ParentGroupId.HasValue);
    }
}

public class UpdateDeviceGroupRequestValidator : AbstractValidator<UpdateDeviceGroupRequest>
{
    private readonly IDeviceGroupRepository _repository;

    public UpdateDeviceGroupRequestValidator(IDeviceGroupRepository repository)
    {
        _repository = repository;

        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Group name is required")
            .MaximumLength(255).WithMessage("Group name must be less than 255 characters");

        RuleFor(x => x)
            .MustAsync(NotCreateCircularReference)
            .WithMessage("Moving this group would create a circular reference");
    }

    private async Task<bool> NotCreateCircularReference(
        UpdateDeviceGroupRequest request, 
        CancellationToken cancellationToken)
    {
        if (!request.ParentGroupId.HasValue)
            return true;

        // Implementation to check circular reference
        return await _repository.ValidateNoCircularReferenceAsync(
            request.GroupId, request.ParentGroupId.Value);
    }
}
```

### Error Handling Standards

**Custom Exception Classes**:
```csharp
public class DeviceGroupException : Exception
{
    public string ErrorCode { get; }
    
    public DeviceGroupException(string message, string errorCode) : base(message)
    {
        ErrorCode = errorCode;
    }
}

public class CircularReferenceException : DeviceGroupException
{
    public CircularReferenceException() 
        : base("Moving this group would create a circular reference", "CIRCULAR_REFERENCE")
    {
    }
}

public class GroupHasChildrenException : DeviceGroupException
{
    public GroupHasChildrenException(int childCount)
        : base($"Cannot delete group with {childCount} child groups", "HAS_CHILDREN")
    {
    }
}

public class GroupHasDevicesException : DeviceGroupException
{
    public GroupHasDevicesException(int deviceCount)
        : base($"Cannot delete group with {deviceCount} assigned devices", "HAS_DEVICES")
    {
    }
}
```

### Migration Requirements

**Required Database Migration**:
```csharp
public partial class EnhanceDeviceGroupsUI : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        // Add missing columns for UI enhancement
        migrationBuilder.AddColumn<string>(
            name: "Path",
            table: "DeviceGroups",
            type: "character varying(2000)",
            maxLength: 2000,
            nullable: false,
            defaultValue: "");

        migrationBuilder.AddColumn<int>(
            name: "Level",
            table: "DeviceGroups",
            type: "integer",
            nullable: false,
            defaultValue: 0);

        migrationBuilder.AddColumn<int>(
            name: "DeviceCount",
            table: "DeviceGroups",
            type: "integer",
            nullable: false,
            defaultValue: 0);

        migrationBuilder.AddColumn<int>(
            name: "ChildGroupCount",
            table: "DeviceGroups",
            type: "integer",
            nullable: false,
            defaultValue: 0);

        migrationBuilder.AddColumn<int>(
            name: "TotalDeviceCount",
            table: "DeviceGroups",
            type: "integer",
            nullable: false,
            defaultValue: 0);

        migrationBuilder.AddColumn<bool>(
            name: "CanDelete",
            table: "DeviceGroups",
            type: "boolean",
            nullable: false,
            defaultValue: true);

        migrationBuilder.AddColumn<bool>(
            name: "CanMove",
            table: "DeviceGroups",
            type: "boolean",
            nullable: false,
            defaultValue: true);

        // Create indexes for performance
        migrationBuilder.CreateIndex(
            name: "IX_DeviceGroups_Path",
            table: "DeviceGroups",
            column: "Path");

        migrationBuilder.CreateIndex(
            name: "IX_DeviceGroups_Level",
            table: "DeviceGroups",
            column: "Level");

        // Data migration to calculate initial values
        migrationBuilder.Sql(@"
            WITH RECURSIVE group_hierarchy AS (
                SELECT id, name, parent_id, 0 as level, '/' || name as path
                FROM ""DeviceGroups""
                WHERE parent_id IS NULL
                
                UNION ALL
                
                SELECT g.id, g.name, g.parent_id, h.level + 1, h.path || '/' || g.name
                FROM ""DeviceGroups"" g
                JOIN group_hierarchy h ON g.parent_id = h.id
            )
            UPDATE ""DeviceGroups"" 
            SET ""Path"" = hierarchy.path, ""Level"" = hierarchy.level
            FROM group_hierarchy hierarchy
            WHERE ""DeviceGroups"".id = hierarchy.id;
        ");
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropIndex(name: "IX_DeviceGroups_Path", table: "DeviceGroups");
        migrationBuilder.DropIndex(name: "IX_DeviceGroups_Level", table: "DeviceGroups");
        
        migrationBuilder.DropColumn(name: "Path", table: "DeviceGroups");
        migrationBuilder.DropColumn(name: "Level", table: "DeviceGroups");
        migrationBuilder.DropColumn(name: "DeviceCount", table: "DeviceGroups");
        migrationBuilder.DropColumn(name: "ChildGroupCount", table: "DeviceGroups");
        migrationBuilder.DropColumn(name: "TotalDeviceCount", table: "DeviceGroups");
        migrationBuilder.DropColumn(name: "CanDelete", table: "DeviceGroups");
        migrationBuilder.DropColumn(name: "CanMove", table: "DeviceGroups");
    }
}
```

---

**Agent Instructions Status**: ✅ Complete - Comprehensive API enhancement guidelines for device groups feature with hierarchy management, real-time updates, and performance optimization