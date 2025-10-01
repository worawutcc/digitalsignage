# Quickstart Guide: Basic Hierarchy Device Grouping

## Overview
This guide demonstrates end-to-end validation of the hierarchical device grouping system, from database setup through API operations and UI interactions.

## Prerequisites
- .NET 8 SDK
- PostgreSQL database
- Digital Signage API running locally
- Admin JWT token for authentication

## Test Data Setup

### 1. Create Test Hierarchy Structure
```bash
# Example organizational structure to create:
# Acme Corp (Root)
# ├── Bangkok Office
# │   ├── Floor 1
# │   │   ├── Lobby Displays
# │   │   └── Meeting Rooms
# │   └── Floor 2
# │       └── Executive Area
# └── Chiang Mai Office
#     ├── Reception
#     └── Warehouse
```

### 2. Database Migration
```bash
cd /path/to/digital-signage
dotnet ef database update -p src/DigitalSignage.Infrastructure -s src/DigitalSignage.Api
```

### 3. Verify Migration Applied
```sql
-- Check if hierarchical columns exist
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'DeviceGroups' 
AND column_name IN ('ParentGroupId', 'Path');

-- Verify function exists
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_name = 'compute_hierarchy_path';
```

## API Validation Tests

### Test 1: Create Root Groups
```bash
# Create Acme Corp (root group)
curl -X POST "http://localhost:5100/api/device-groups" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Acme Corp",
    "description": "Main organization"
  }'

# Expected Response: 201 Created
# {
#   "id": 1,
#   "name": "Acme Corp",
#   "parentGroupId": null,
#   "path": "Acme Corp",
#   "level": 0,
#   "hasChildren": false,
#   ...
# }
```

### Test 2: Create Child Groups
```bash
# Create Bangkok Office under Acme Corp (assume Acme Corp ID = 1)
curl -X POST "http://localhost:5100/api/device-groups/1/children" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Bangkok Office",
    "description": "Main Bangkok location"
  }'

# Expected Response: 201 Created
# {
#   "id": 2,
#   "name": "Bangkok Office", 
#   "parentGroupId": 1,
#   "path": "Acme Corp / Bangkok Office",
#   "level": 1,
#   ...
# }
```

### Test 3: Create Multi-level Hierarchy
```bash
# Create Floor 1 under Bangkok Office (assume Bangkok Office ID = 2)
curl -X POST "http://localhost:5100/api/device-groups/2/children" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Floor 1",
    "description": "First floor of Bangkok office"
  }'

# Create Lobby Displays under Floor 1 (assume Floor 1 ID = 3)
curl -X POST "http://localhost:5100/api/device-groups/3/children" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Lobby Displays",
    "description": "Display screens in the lobby area"
  }'

# Expected: Deep hierarchy with proper path computation
# Path should be: "Acme Corp / Bangkok Office / Floor 1 / Lobby Displays"
```

### Test 4: Retrieve Hierarchy Tree
```bash
# Get complete hierarchy tree
curl -X GET "http://localhost:5100/api/device-groups/tree" \
  -H "Authorization: Bearer $JWT_TOKEN"

# Expected Response: Nested tree structure
# [
#   {
#     "id": 1,
#     "name": "Acme Corp",
#     "children": [
#       {
#         "id": 2,
#         "name": "Bangkok Office",
#         "path": "Acme Corp / Bangkok Office",
#         "children": [
#           {
#             "id": 3,
#             "name": "Floor 1",
#             "path": "Acme Corp / Bangkok Office / Floor 1",
#             "children": [...]
#           }
#         ]
#       }
#     ]
#   }
# ]
```

### Test 5: Get Breadcrumb Navigation
```bash
# Get ancestors for Lobby Displays (assume ID = 4)
curl -X GET "http://localhost:5100/api/device-groups/4/ancestors" \
  -H "Authorization: Bearer $JWT_TOKEN"

# Expected Response: Breadcrumb array
# [
#   { "id": 1, "name": "Acme Corp", "level": 0 },
#   { "id": 2, "name": "Bangkok Office", "level": 1 },
#   { "id": 3, "name": "Floor 1", "level": 2 },
#   { "id": 4, "name": "Lobby Displays", "level": 3 }
# ]
```

### Test 6: Move Group Operations
```bash
# Move Floor 1 to root level (test reorganization)
curl -X PUT "http://localhost:5100/api/device-groups/3/move" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "newParentId": 1,
    "reason": "Organizational restructure"
  }'

# Expected: Floor 1 moved under Acme Corp directly
# New path: "Acme Corp / Floor 1"
# All children should move with it and update their paths
```

### Test 7: Validate Circular Reference Prevention
```bash
# Try to move Acme Corp under Bangkok Office (should fail)
curl -X PUT "http://localhost:5100/api/device-groups/1/move" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "newParentId": 2,
    "reason": "This should fail"
  }'

# Expected Response: 409 Conflict
# {
#   "message": "Cannot move group to its own descendant",
#   "errors": {...}
# }
```

### Test 8: Search Across Hierarchy
```bash
# Search for groups containing "Floor"
curl -X GET "http://localhost:5100/api/device-groups/search?query=Floor&includeAncestors=true" \
  -H "Authorization: Bearer $JWT_TOKEN"

# Expected Response: All groups with "Floor" in name with full paths
# {
#   "results": [
#     {
#       "id": 3,
#       "name": "Floor 1",
#       "path": "Acme Corp / Floor 1",
#       "ancestors": [...]
#     }
#   ],
#   "totalCount": 1
# }
```

## Performance Validation

### Test 9: Large Hierarchy Performance
```bash
# Create script to generate 100 groups across 5 levels
# Time the tree loading operation
time curl -X GET "http://localhost:5100/api/device-groups/tree" \
  -H "Authorization: Bearer $JWT_TOKEN"

# Expected: Response time < 2 seconds for reasonable hierarchy sizes
```

### Test 10: Bulk Operations
```bash
# Create multiple child groups simultaneously
for i in {1..10}; do
  curl -X POST "http://localhost:5100/api/device-groups/1/children" \
    -H "Authorization: Bearer $JWT_TOKEN" \
    -H "Content-Type: application/json" \
    -d "{\"name\": \"Branch $i\", \"description\": \"Test branch $i\"}" &
done
wait

# Verify all groups created with correct paths
curl -X GET "http://localhost:5100/api/device-groups/1/children" \
  -H "Authorization: Bearer $JWT_TOKEN"
```

## UI Integration Tests

### Test 11: Tree Component Loading
```javascript
// Test tree component can load and display hierarchy
const response = await fetch('/api/device-groups/tree', {
  headers: { 'Authorization': `Bearer ${token}` }
});
const treeData = await response.json();

// Verify nested structure renders correctly
console.assert(treeData[0].children.length > 0, 'Root has children');
console.assert(treeData[0].children[0].path.includes('/'), 'Paths computed correctly');
```

### Test 12: Drag & Drop Validation
```javascript
// Test move validation before allowing drop
const validateMove = async (groupId, newParentId) => {
  const response = await fetch(`/api/device-groups/${groupId}/validate-move`, {
    method: 'POST',
    headers: { 
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ newParentId })
  });
  
  const result = await response.json();
  return result.canMove;
};

// Should return false for circular references
const canMoveToChild = await validateMove(1, 2); // parent to child
console.assert(!canMoveToChild, 'Prevents circular reference');
```

## Content Scheduling Integration

### Test 13: Hierarchical Content Propagation
```bash
# Create a schedule for Bangkok Office (parent group)
curl -X POST "http://localhost:5100/api/schedules" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Company Announcement",
    "deviceGroupIds": [2],
    "startTime": "2025-10-01T09:00:00Z",
    "endTime": "2025-10-01T17:00:00Z"
  }'

# Verify content appears on all devices in Floor 1 and Meeting Rooms
curl -X GET "http://localhost:5100/api/schedules/1/effective-devices" \
  -H "Authorization: Bearer $JWT_TOKEN"

# Expected: All devices in Bangkok Office and its child groups
```

## Validation Checklist

### Database Integrity
- [ ] ParentGroupId foreign key constraint works
- [ ] Self-reference constraint prevents Id = ParentGroupId
- [ ] Path computation function returns correct breadcrumbs
- [ ] Indexes exist on ParentGroupId for performance

### API Functionality
- [ ] Tree endpoint returns nested structure under 2 seconds
- [ ] Children endpoint supports pagination
- [ ] Move operations update all descendant paths
- [ ] Circular reference validation prevents invalid moves
- [ ] Search finds groups across entire hierarchy
- [ ] Breadcrumb endpoint returns correct ancestor chain

### Business Logic
- [ ] Groups can be created at any level (up to max depth)
- [ ] Moving groups preserves all child relationships
- [ ] Device assignments remain intact during reorganization
- [ ] Content scheduling inherits through hierarchy
- [ ] Permissions flow down hierarchy appropriately

### Performance Requirements
- [ ] Tree loading completes in <2 seconds for 1000 groups
- [ ] Single group operations complete in <100ms
- [ ] Path computation completes in <50ms per group
- [ ] Move operations complete in <5 seconds including updates

### Error Handling
- [ ] Appropriate HTTP status codes for all error conditions
- [ ] Clear error messages for validation failures
- [ ] Graceful handling of missing groups or invalid IDs
- [ ] Transaction rollback on failed move operations

## Troubleshooting Common Issues

### Path Computation Issues
```sql
-- Manually test path function
SELECT id, name, compute_hierarchy_path(id) as computed_path 
FROM "DeviceGroups" 
ORDER BY id;

-- Check for orphaned groups
SELECT id, name, parent_group_id 
FROM "DeviceGroups" 
WHERE parent_group_id IS NOT NULL 
AND parent_group_id NOT IN (SELECT id FROM "DeviceGroups");
```

### Performance Issues
```sql
-- Check index usage
EXPLAIN ANALYZE 
SELECT * FROM "DeviceGroups" 
WHERE "ParentGroupId" = 1;

-- Monitor recursive query performance
EXPLAIN ANALYZE 
WITH RECURSIVE hierarchy AS (
    SELECT id, name, parent_group_id, 0 as depth
    FROM "DeviceGroups" WHERE parent_group_id IS NULL
    UNION ALL
    SELECT dg.id, dg.name, dg.parent_group_id, h.depth + 1
    FROM "DeviceGroups" dg
    JOIN hierarchy h ON dg.parent_group_id = h.id
    WHERE h.depth < 10
)
SELECT * FROM hierarchy;
```

### Data Consistency Issues
```sql
-- Verify all paths are computed correctly
SELECT id, name, path, compute_hierarchy_path(id) as expected_path
FROM "DeviceGroups"
WHERE path != compute_hierarchy_path(id);

-- Check for cycles in hierarchy
WITH RECURSIVE cycle_check AS (
    SELECT id, parent_group_id, ARRAY[id] as path, false as cycle
    FROM "DeviceGroups"
    UNION ALL
    SELECT dg.id, dg.parent_group_id, cc.path || dg.id,
           dg.id = ANY(cc.path) as cycle
    FROM "DeviceGroups" dg
    JOIN cycle_check cc ON dg.parent_group_id = cc.id
    WHERE NOT cc.cycle
)
SELECT * FROM cycle_check WHERE cycle = true;
```

## Success Criteria
- All API endpoints respond correctly with expected data structures
- Hierarchy operations complete within performance requirements
- Database integrity maintained through all operations
- UI components load and interact with hierarchy smoothly
- Content scheduling propagates through hierarchy as expected
- Error handling provides clear feedback for invalid operations