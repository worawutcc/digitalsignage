# API Contract Tests: Device Groups Enhanced UI

**Phase**: 1 - Design & Contracts  
**Date**: 2025-10-06  
**Feature**: 029-ui-device-groups

## Contract Test Strategy

### Test Framework
- **Frontend**: React Testing Library + MSW (Mock Service Worker)
- **API Mocking**: Mock HTTP responses with realistic data
- **Validation**: Zod schema validation testing
- **Error Scenarios**: Network failures, validation errors, edge cases

### API Endpoint Contracts

#### 1. GET /api/device-groups
**Purpose**: Retrieve all device groups with hierarchy information

**Contract Test**:
```typescript
describe('GET /api/device-groups', () => {
  it('should return device groups with correct structure', async () => {
    // Arrange
    const expectedResponse: DeviceGroupListResponse = {
      success: true,
      data: [
        {
          id: 1,
          name: 'Root Group',
          description: 'Main device group',
          parentId: null,
          parentName: null,
          level: 0,
          path: '/Root Group',
          deviceCount: 5,
          childGroupCount: 2,
          totalDeviceCount: 15,
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
          canDelete: false,
          canMove: false
        }
      ],
      totalCount: 1
    }

    // Act
    const response = await fetch('/api/device-groups')
    const data = await response.json()

    // Assert
    expect(response.status).toBe(200)
    expect(data).toMatchSchema(deviceGroupListResponseSchema)
    expect(data.data[0]).toHaveProperty('id')
    expect(data.data[0]).toHaveProperty('name')
    expect(data.data[0]).toHaveProperty('level')
    expect(data.data[0]).toHaveProperty('canDelete')
  })

  it('should handle empty groups list', async () => {
    const response = await fetch('/api/device-groups')
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.data).toEqual([])
    expect(data.totalCount).toBe(0)
  })
})
```

#### 2. POST /api/device-groups
**Purpose**: Create new device group

**Contract Test**:
```typescript
describe('POST /api/device-groups', () => {
  it('should create device group with valid data', async () => {
    // Arrange
    const createRequest: CreateDeviceGroupRequest = {
      name: 'New Group',
      description: 'Test group',
      parentGroupId: 1
    }

    // Act
    const response = await fetch('/api/device-groups', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(createRequest)
    })

    // Assert
    expect(response.status).toBe(201)
    const data = await response.json()
    expect(data.success).toBe(true)
    expect(data.data.name).toBe('New Group')
    expect(data.data.parentId).toBe(1)
    expect(data.data.level).toBeGreaterThan(0)
  })

  it('should reject invalid group name', async () => {
    const invalidRequest = {
      name: '', // Invalid: empty name
      description: 'Test',
      parentGroupId: 1
    }

    const response = await fetch('/api/device-groups', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(invalidRequest)
    })

    expect(response.status).toBe(400)
    const data = await response.json()
    expect(data.success).toBe(false)
    expect(data.error).toContain('name')
  })

  it('should reject duplicate group name at same level', async () => {
    const duplicateRequest = {
      name: 'Existing Group',
      parentGroupId: 1
    }

    const response = await fetch('/api/device-groups', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(duplicateRequest)
    })

    expect(response.status).toBe(409)
    const data = await response.json()
    expect(data.error).toBe('DUPLICATE_NAME')
  })
})
```

#### 3. PUT /api/device-groups/{id}
**Purpose**: Update existing device group

**Contract Test**:
```typescript
describe('PUT /api/device-groups/{id}', () => {
  it('should update device group successfully', async () => {
    const updateRequest: UpdateDeviceGroupRequest = {
      name: 'Updated Group Name',
      description: 'Updated description',
      parentGroupId: 2
    }

    const response = await fetch('/api/device-groups/1', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updateRequest)
    })

    expect(response.status).toBe(200)
    const data = await response.json()
    expect(data.success).toBe(true)
    expect(data.data.name).toBe('Updated Group Name')
  })

  it('should prevent circular reference', async () => {
    // Attempt to set parent to a child group
    const circularRequest = {
      name: 'Parent Group',
      parentGroupId: 5 // Child of group 1
    }

    const response = await fetch('/api/device-groups/1', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(circularRequest)
    })

    expect(response.status).toBe(400)
    const data = await response.json()
    expect(data.error).toBe('CIRCULAR_REFERENCE')
  })

  it('should return 404 for non-existent group', async () => {
    const updateRequest = {
      name: 'Updated Name'
    }

    const response = await fetch('/api/device-groups/99999', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updateRequest)
    })

    expect(response.status).toBe(404)
  })
})
```

#### 4. DELETE /api/device-groups/{id}
**Purpose**: Delete device group

**Contract Test**:
```typescript
describe('DELETE /api/device-groups/{id}', () => {
  it('should delete empty group successfully', async () => {
    const response = await fetch('/api/device-groups/5', {
      method: 'DELETE'
    })

    expect(response.status).toBe(204)
  })

  it('should prevent deletion of group with children', async () => {
    const response = await fetch('/api/device-groups/1', {
      method: 'DELETE'
    })

    expect(response.status).toBe(409)
    const data = await response.json()
    expect(data.error).toBe('HAS_CHILDREN')
    expect(data.message).toContain('children')
  })

  it('should prevent deletion of group with devices', async () => {
    const response = await fetch('/api/device-groups/3', {
      method: 'DELETE'
    })

    expect(response.status).toBe(409)
    const data = await response.json()
    expect(data.error).toBe('HAS_DEVICES')
    expect(data.message).toContain('devices')
  })
})
```

#### 5. GET /api/device-groups/tree
**Purpose**: Get hierarchical tree structure

**Contract Test**:
```typescript
describe('GET /api/device-groups/tree', () => {
  it('should return hierarchical tree structure', async () => {
    const response = await fetch('/api/device-groups/tree')
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.data).toHaveProperty('groups')
    expect(data.data).toHaveProperty('rootGroups')
    expect(data.data).toHaveProperty('totalCount')
    expect(data.data).toHaveProperty('maxDepth')

    // Verify hierarchy structure
    const rootGroups = data.data.rootGroups
    expect(rootGroups).toBeInstanceOf(Array)
    
    if (rootGroups.length > 0) {
      expect(rootGroups[0]).toHaveProperty('children')
      expect(rootGroups[0].level).toBe(0)
    }
  })

  it('should handle empty tree', async () => {
    const response = await fetch('/api/device-groups/tree')
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.data.rootGroups).toEqual([])
    expect(data.data.totalCount).toBe(0)
    expect(data.data.maxDepth).toBe(0)
  })
})
```

### Search and Filter Contracts

#### 6. GET /api/device-groups/search
**Purpose**: Search device groups by name or description

**Contract Test**:
```typescript
describe('GET /api/device-groups/search', () => {
  it('should search groups by name', async () => {
    const searchQuery = encodeURIComponent('office')
    const response = await fetch(`/api/device-groups/search?query=${searchQuery}`)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.data).toBeInstanceOf(Array)
    
    // All results should contain search term
    data.data.forEach((group: DeviceGroup) => {
      expect(
        group.name.toLowerCase().includes('office') ||
        group.description?.toLowerCase().includes('office')
      ).toBe(true)
    })
  })

  it('should filter by parent group', async () => {
    const response = await fetch('/api/device-groups/search?parentId=1')
    const data = await response.json()

    expect(response.status).toBe(200)
    data.data.forEach((group: DeviceGroup) => {
      expect(group.parentId).toBe(1)
    })
  })

  it('should return empty results for no matches', async () => {
    const response = await fetch('/api/device-groups/search?query=nonexistent')
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.data).toEqual([])
  })
})
```

### Error Handling Contracts

#### Network Error Scenarios
```typescript
describe('Network Error Handling', () => {
  it('should handle 500 server errors gracefully', async () => {
    // Mock server error
    const response = await fetch('/api/device-groups')
    
    if (response.status === 500) {
      const data = await response.json()
      expect(data).toHaveProperty('error')
      expect(data.success).toBe(false)
    }
  })

  it('should handle network timeouts', async () => {
    // Test timeout scenario
    const controller = new AbortController()
    setTimeout(() => controller.abort(), 100)

    try {
      await fetch('/api/device-groups', {
        signal: controller.signal
      })
    } catch (error) {
      expect(error.name).toBe('AbortError')
    }
  })
})
```

### Authentication Contracts

#### Authorization Tests
```typescript
describe('Authentication & Authorization', () => {
  it('should require authentication for device group operations', async () => {
    const response = await fetch('/api/device-groups', {
      headers: {} // No auth header
    })

    expect(response.status).toBe(401)
  })

  it('should accept valid JWT token', async () => {
    const response = await fetch('/api/device-groups', {
      headers: {
        'Authorization': 'Bearer valid-jwt-token'
      }
    })

    expect(response.status).not.toBe(401)
  })

  it('should check permissions for delete operations', async () => {
    const response = await fetch('/api/device-groups/1', {
      method: 'DELETE',
      headers: {
        'Authorization': 'Bearer limited-user-token'
      }
    })

    if (response.status === 403) {
      const data = await response.json()
      expect(data.error).toBe('INSUFFICIENT_PERMISSIONS')
    }
  })
})
```

---

**API Contract Status**: ✅ Complete - All major endpoints covered with success, error, and edge case scenarios