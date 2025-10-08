# API Contract: Playlists

**Phase**: 1 - Playlists Menu  
**Base Path**: `/api/playlist`  
**Authentication**: JWT Bearer Token required

## Endpoints

### GET /api/playlist
**Purpose**: Get all playlists with optional filtering

**Request**:
```http
GET /api/playlist?search=keyword&isActive=true&skip=0&take=20
Authorization: Bearer {token}
```

**Query Parameters**:
- `search` (optional): Filter by name/description (string)
- `isActive` (optional): Filter by active status (boolean)
- `isTemplate` (optional): Filter templates (boolean)
- `skip` (optional): Pagination offset (integer, default 0)
- `take` (optional): Page size (integer, default 20, max 100)

**Response 200 OK**:
```json
{
  "items": [
    {
      "id": 1,
      "name": "Morning Content",
      "description": "Content for morning display",
      "isActive": true,
      "isTemplate": false,
      "templateId": null,
      "createdAt": "2025-01-07T10:00:00Z",
      "updatedAt": "2025-01-07T10:00:00Z"
    }
  ],
  "total": 42,
  "skip": 0,
  "take": 20
}
```

**Response 401 Unauthorized**: Missing/invalid token  
**Response 500 Internal Server Error**: Server error

---

### GET /api/playlist/{id}
**Purpose**: Get single playlist by ID

**Request**:
```http
GET /api/playlist/1
Authorization: Bearer {token}
```

**Response 200 OK**:
```json
{
  "id": 1,
  "name": "Morning Content",
  "description": "Content for morning display",
  "isActive": true,
  "isTemplate": false,
  "templateId": null,
  "createdAt": "2025-01-07T10:00:00Z",
  "updatedAt": "2025-01-07T10:00:00Z"
}
```

**Response 404 Not Found**: Playlist not found  
**Response 401 Unauthorized**: Missing/invalid token  
**Response 500 Internal Server Error**: Server error

---

### POST /api/playlist
**Purpose**: Create new playlist

**Request**:
```http
POST /api/playlist
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Evening Content",
  "description": "Content for evening display",
  "isActive": true,
  "isTemplate": false
}
```

**Request Body**:
```typescript
interface CreatePlaylistRequest {
  name: string;          // Required, max 200 chars
  description?: string;  // Optional, max 1000 chars
  isActive?: boolean;    // Optional, default true
  isTemplate?: boolean;  // Optional, default false
}
```

**Response 201 Created**:
```json
{
  "id": 2,
  "name": "Evening Content",
  "description": "Content for evening display",
  "isActive": true,
  "isTemplate": false,
  "templateId": null,
  "createdAt": "2025-01-07T15:30:00Z",
  "updatedAt": "2025-01-07T15:30:00Z"
}
```

**Response 400 Bad Request**: Validation errors
```json
{
  "errors": {
    "name": ["Name is required", "Name must not exceed 200 characters"]
  }
}
```

**Response 401 Unauthorized**: Missing/invalid token  
**Response 500 Internal Server Error**: Server error

---

### PUT /api/playlist/{id}
**Purpose**: Update existing playlist

**Request**:
```http
PUT /api/playlist/1
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Updated Morning Content",
  "description": "Updated description",
  "isActive": true,
  "isTemplate": false
}
```

**Request Body**: Same as CreatePlaylistRequest

**Response 200 OK**: Updated playlist (same format as GET)  
**Response 400 Bad Request**: Validation errors  
**Response 404 Not Found**: Playlist not found  
**Response 401 Unauthorized**: Missing/invalid token  
**Response 500 Internal Server Error**: Server error

---

### DELETE /api/playlist/{id}
**Purpose**: Delete playlist

**Request**:
```http
DELETE /api/playlist/1
Authorization: Bearer {token}
```

**Response 204 No Content**: Successfully deleted  
**Response 404 Not Found**: Playlist not found  
**Response 409 Conflict**: Playlist has active assignments
```json
{
  "message": "Cannot delete playlist with active assignments"
}
```

**Response 401 Unauthorized**: Missing/invalid token  
**Response 500 Internal Server Error**: Server error

---

### POST /api/playlist/{id}/duplicate
**Purpose**: Create duplicate of playlist

**Request**:
```http
POST /api/playlist/1/duplicate
Authorization: Bearer {token}
Content-Type: application/json

{
  "newName": "Copy of Morning Content"
}
```

**Response 201 Created**: New playlist with duplicated items  
**Response 404 Not Found**: Source playlist not found  
**Response 401 Unauthorized**: Missing/invalid token  
**Response 500 Internal Server Error**: Server error

---

### PATCH /api/playlist/{id}/activate
**Purpose**: Activate playlist

**Request**:
```http
PATCH /api/playlist/1/activate
Authorization: Bearer {token}
```

**Response 200 OK**: Updated playlist  
**Response 404 Not Found**: Playlist not found  
**Response 401 Unauthorized**: Missing/invalid token  
**Response 500 Internal Server Error**: Server error

---

### PATCH /api/playlist/{id}/deactivate
**Purpose**: Deactivate playlist

**Request**:
```http
PATCH /api/playlist/1/deactivate
Authorization: Bearer {token}
```

**Response 200 OK**: Updated playlist  
**Response 404 Not Found**: Playlist not found  
**Response 401 Unauthorized**: Missing/invalid token  
**Response 500 Internal Server Error**: Server error

---

### GET /api/playlist/{id}/assignment-summary
**Purpose**: Get assignment summary for playlist

**Request**:
```http
GET /api/playlist/1/assignment-summary
Authorization: Bearer {token}
```

**Response 200 OK**:
```json
{
  "totalAssignments": 5,
  "activeAssignments": 3,
  "deviceCount": 2,
  "deviceGroupCount": 1,
  "assignments": [
    {
      "id": 1,
      "playlistId": 1,
      "deviceId": 10,
      "deviceGroupId": null,
      "isActive": true,
      "deviceName": "Lobby Display",
      "deviceGroupName": null
    }
  ]
}
```

**Response 404 Not Found**: Playlist not found  
**Response 401 Unauthorized**: Missing/invalid token  
**Response 500 Internal Server Error**: Server error

---

### GET /api/playlist/{id}/items
**Purpose**: Get playlist items

**Request**:
```http
GET /api/playlist/1/items
Authorization: Bearer {token}
```

**Response 200 OK**:
```json
{
  "items": [
    {
      "id": 1,
      "playlistId": 1,
      "mediaId": 5,
      "order": 1,
      "duration": 10,
      "media": {
        "id": 5,
        "fileName": "image1.jpg",
        "fileType": "Image",
        "thumbnailUrl": "https://..."
      }
    }
  ]
}
```

**Response 404 Not Found**: Playlist not found  
**Response 401 Unauthorized**: Missing/invalid token  
**Response 500 Internal Server Error**: Server error

---

### POST /api/playlist/{id}/items
**Purpose**: Add item to playlist

**Request**:
```http
POST /api/playlist/1/items
Authorization: Bearer {token}
Content-Type: application/json

{
  "mediaId": 5,
  "order": 3,
  "duration": 10
}
```

**Response 201 Created**: New playlist item  
**Response 400 Bad Request**: Validation errors  
**Response 404 Not Found**: Playlist or media not found  
**Response 401 Unauthorized**: Missing/invalid token  
**Response 500 Internal Server Error**: Server error

---

### DELETE /api/playlist/{playlistId}/items/{itemId}
**Purpose**: Remove item from playlist

**Request**:
```http
DELETE /api/playlist/1/items/5
Authorization: Bearer {token}
```

**Response 204 No Content**: Successfully deleted  
**Response 404 Not Found**: Playlist or item not found  
**Response 401 Unauthorized**: Missing/invalid token  
**Response 500 Internal Server Error**: Server error

---

### PATCH /api/playlist/{playlistId}/items/reorder
**Purpose**: Reorder playlist items

**Request**:
```http
PATCH /api/playlist/1/items/reorder
Authorization: Bearer {token}
Content-Type: application/json

{
  "itemOrders": [
    { "itemId": 1, "order": 3 },
    { "itemId": 2, "order": 1 },
    { "itemId": 3, "order": 2 }
  ]
}
```

**Response 200 OK**: Updated items  
**Response 400 Bad Request**: Invalid order values  
**Response 404 Not Found**: Playlist not found  
**Response 401 Unauthorized**: Missing/invalid token  
**Response 500 Internal Server Error**: Server error

---

### GET /api/playlist/statistics
**Purpose**: Get playlist statistics

**Request**:
```http
GET /api/playlist/statistics
Authorization: Bearer {token}
```

**Response 200 OK**:
```json
{
  "totalPlaylists": 42,
  "activePlaylists": 35,
  "templateCount": 5,
  "averageItemsPerPlaylist": 8.5,
  "totalAssignments": 120
}
```

**Response 401 Unauthorized**: Missing/invalid token  
**Response 500 Internal Server Error**: Server error

---

## Contract Tests

Each endpoint requires a contract test verifying:
1. Request schema validation
2. Response schema validation
3. HTTP status codes
4. Authentication requirements
5. Error response formats

Test files to create:
- `playlist.get-all.contract.test.ts`
- `playlist.get-by-id.contract.test.ts`
- `playlist.create.contract.test.ts`
- `playlist.update.contract.test.ts`
- `playlist.delete.contract.test.ts`
- `playlist.duplicate.contract.test.ts`
- `playlist.activate.contract.test.ts`
- `playlist.assignment-summary.contract.test.ts`
- `playlist.items.contract.test.ts`
- `playlist.statistics.contract.test.ts`
