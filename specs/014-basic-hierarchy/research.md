# Research: Basic Hierarchy Device Grouping

## Self-Referencing Entity Patterns

### Decision: Self-Referencing Foreign Key with EF Core
**Rationale**: 
- Standard pattern for hierarchical data in relational databases
- Native EF Core support with navigation properties
- Enables lazy loading and efficient querying
- Integrates seamlessly with existing DeviceGroup entity

**Implementation**:
```csharp
public class DeviceGroup : BaseEntity
{
    public int? ParentGroupId { get; set; }
    public virtual DeviceGroup? ParentGroup { get; set; }
    public virtual ICollection<DeviceGroup> ChildGroups { get; set; }
}
```

**Alternatives Considered**:
- **Adjacency List**: Chosen approach - simple, intuitive
- **Nested Set Model**: Rejected - complex updates, harder to maintain
- **Path Enumeration**: Rejected as primary - used as computed property for breadcrumbs
- **Closure Table**: Rejected - adds complexity, separate table overhead

## Tree Traversal Algorithms

### Decision: Recursive CTE Queries with Depth Limiting
**Rationale**:
- PostgreSQL native support for recursive Common Table Expressions
- Efficient for moderate depth hierarchies (≤10 levels)
- Built-in cycle detection capabilities
- EF Core 6+ supports raw SQL integration for complex queries

**Query Pattern**:
```sql
WITH RECURSIVE hierarchy AS (
    SELECT id, name, parent_group_id, 0 as depth, ARRAY[id] as path
    FROM device_groups WHERE parent_group_id IS NULL
    UNION ALL
    SELECT dg.id, dg.name, dg.parent_group_id, h.depth + 1, path || dg.id
    FROM device_groups dg
    JOIN hierarchy h ON dg.parent_group_id = h.id
    WHERE h.depth < 10 AND NOT dg.id = ANY(path)
)
SELECT * FROM hierarchy;
```

**Alternatives Considered**:
- **Application-side Recursion**: Rejected - N+1 query problem
- **Materialized Path**: Used as supplement for breadcrumbs
- **Graph Databases**: Rejected - adds infrastructure complexity

## EF Core Hierarchical Configuration

### Decision: Fluent API Configuration with Cascade Restrictions
**Rationale**:
- Explicit relationship configuration prevents accidental deletion
- Self-referencing foreign key requires careful cascade handling
- Index optimization for parent_group_id improves query performance

**Configuration**:
```csharp
public void Configure(EntityTypeBuilder<DeviceGroup> builder)
{
    builder.HasOne(dg => dg.ParentGroup)
           .WithMany(dg => dg.ChildGroups)
           .HasForeignKey(dg => dg.ParentGroupId)
           .OnDelete(DeleteBehavior.Restrict); // Prevent cascading deletes
           
    builder.HasIndex(dg => dg.ParentGroupId)
           .HasDatabaseName("IX_DeviceGroups_ParentGroupId");
           
    builder.Property(dg => dg.Path)
           .HasComputedColumnSql("COMPUTED_HIERARCHY_PATH(id)"); // Custom function
}
```

**Alternatives Considered**:
- **Data Annotations**: Rejected - less expressive for complex relationships
- **Cascade Delete**: Rejected - requires explicit user confirmation for safety
- **No Delete Restrictions**: Rejected - could orphan child groups

## Path Computation Strategy

### Decision: Computed Database Function for Materialized Paths
**Rationale**:
- Real-time path computation without application complexity
- Efficient breadcrumb display without recursive queries
- Database-level consistency guarantees
- Separation of concerns - path logic in database layer

**Database Function**:
```sql
CREATE OR REPLACE FUNCTION COMPUTED_HIERARCHY_PATH(group_id INTEGER)
RETURNS TEXT AS $$
DECLARE
    path_result TEXT := '';
    current_id INTEGER := group_id;
    current_name TEXT;
    parent_id INTEGER;
BEGIN
    WHILE current_id IS NOT NULL LOOP
        SELECT name, parent_group_id INTO current_name, parent_id
        FROM device_groups WHERE id = current_id;
        
        IF path_result = '' THEN
            path_result := current_name;
        ELSE
            path_result := current_name || ' / ' || path_result;
        END IF;
        
        current_id := parent_id;
    END LOOP;
    
    RETURN COALESCE(path_result, '');
END;
$$ LANGUAGE plpgsql;
```

**Alternatives Considered**:
- **Application-side Path Building**: Rejected - performance overhead
- **Cached Path Column**: Rejected - maintenance complexity on moves
- **Lazy Loading Paths**: Rejected - N+1 query problem for tree display

## Performance Optimization Strategies

### Decision: Multi-layered Optimization Approach
**Rationale**:
- Different access patterns require different optimization strategies
- Hierarchical queries have inherent performance challenges at scale
- Proactive optimization better than reactive fixes

**Optimization Layers**:

1. **Database Level**:
   - Indexed parent_group_id for efficient child lookups
   - Computed path function for breadcrumb display
   - Query depth limiting to prevent runaway queries

2. **Application Level**:
   - Repository method specialization (GetChildren vs GetDescendants)
   - DTO projection to minimize data transfer
   - Caching strategy for frequently accessed trees

3. **API Level**:
   - Pagination for large child collections
   - Selective tree expansion (load-on-demand)
   - Response compression for tree payloads

**Performance Targets**:
- Tree loading: <2 seconds for 1000 groups
- Single tree operation: <100ms
- Path computation: <50ms per group
- Content propagation: <30 seconds for 1000 devices

**Alternatives Considered**:
- **Full Tree Caching**: Rejected - memory overhead, cache invalidation complexity
- **NoSQL Tree Storage**: Rejected - increases infrastructure complexity
- **Client-side Tree Building**: Rejected - bandwidth and latency concerns

## Circular Reference Prevention

### Decision: Application-level Validation with Database Constraints
**Rationale**:
- Defense in depth - validation at multiple layers
- Database check constraints provide final safety net
- Application validation provides user-friendly error messages
- Path array tracking in recursive queries detects cycles

**Implementation Strategy**:
```csharp
public async Task<ValidationResult> ValidateGroupMoveAsync(int groupId, int? newParentId)
{
    if (newParentId == null) return ValidationResult.Success;
    
    // Check if new parent is descendant of group being moved
    var descendants = await GetAllDescendantsAsync(groupId);
    if (descendants.Any(d => d.Id == newParentId))
    {
        return ValidationResult.Failure("Cannot move group to its own descendant");
    }
    
    // Check depth limit
    var newDepth = await CalculateDepthAsync(newParentId.Value) + 1;
    if (newDepth > MAX_HIERARCHY_DEPTH)
    {
        return ValidationResult.Failure($"Move would exceed maximum depth of {MAX_HIERARCHY_DEPTH}");
    }
    
    return ValidationResult.Success;
}
```

**Database Constraint**:
```sql
ALTER TABLE device_groups 
ADD CONSTRAINT chk_no_self_reference 
CHECK (id != parent_group_id);
```

**Alternatives Considered**:
- **Database-only Validation**: Rejected - poor error messages
- **Application-only Validation**: Rejected - race condition vulnerability  
- **Graph Algorithms**: Rejected - overkill for simple cycle detection

## Content Scheduling Inheritance

### Decision: Service-layer Inheritance with Override Capability
**Rationale**:
- Business logic belongs in application layer, not database
- Explicit override capability maintains user control
- Clear audit trail for content scheduling decisions
- Maintains existing Schedule entity structure

**Implementation Approach**:
```csharp
public async Task<IEnumerable<Device>> GetEffectiveDevicesForScheduleAsync(int scheduleId)
{
    var schedule = await _scheduleRepository.GetByIdAsync(scheduleId);
    var devices = new HashSet<Device>();
    
    // Direct device assignments
    devices.UnionWith(schedule.Devices);
    
    // Group assignments with inheritance
    foreach (var group in schedule.DeviceGroups)
    {
        var inheritedDevices = await GetDevicesInGroupHierarchyAsync(group.Id);
        devices.UnionWith(inheritedDevices);
    }
    
    // Apply overrides (exclude devices with more specific schedules)
    var overriddenDevices = await GetOverriddenDevicesAsync(scheduleId);
    devices.ExceptWith(overriddenDevices);
    
    return devices;
}
```

**Alternatives Considered**:
- **Database View for Inheritance**: Rejected - complex maintenance
- **Materialized Inheritance Table**: Rejected - duplication, consistency issues
- **No Inheritance**: Rejected - defeats hierarchy purpose

## Migration Strategy

### Decision: Backward-compatible Schema Extension
**Rationale**:
- Existing DeviceGroup functionality must remain intact
- Zero-downtime deployment requirements
- Gradual rollout capability for large installations

**Migration Plan**:
1. **Phase 1**: Add nullable ParentGroupId column with index
2. **Phase 2**: Deploy application code with hierarchy support
3. **Phase 3**: Create database functions for path computation
4. **Phase 4**: Add check constraints for data integrity

**Rollback Strategy**:
- ParentGroupId can be set to NULL to flatten hierarchy
- Existing flat group functionality continues to work
- Path computation gracefully handles NULL parent references

**Alternatives Considered**:
- **Big Bang Migration**: Rejected - too risky for production
- **New Entity Approach**: Rejected - breaks existing functionality
- **Shadow Tables**: Rejected - adds complexity without benefit