# User-Device Associations

This document describes how to manage associations between users and devices in the Digital Signage system.

## Features
- Create, update, and delete user-device associations
- Bulk operations for efficient management
- Search and filter associations by user, device, and type
- Audit logging for all changes
- Secure endpoints with JWT authentication and RBAC

## API Endpoints
- `POST /api/user-device-associations` — Create association
- `GET /api/user-device-associations` — List all associations
- `GET /api/user-device-associations/search` — Search/filter associations
- `GET /api/user-device-associations/{id}` — Get association by ID
- `PUT /api/user-device-associations/{id}` — Update association
- `DELETE /api/user-device-associations/{id}` — Delete association
- `POST /api/user-device-associations/bulk` — Bulk create associations

## Usage Examples
### Create Association
```http
POST /api/user-device-associations
Content-Type: application/json
{
  "userId": "<user-guid>",
  "deviceId": "<device-guid>",
  "associationType": "Owner"
}
```

### Search Associations
```http
GET /api/user-device-associations/search?userId=<user-guid>&deviceId=<device-guid>&associationType=Owner
```

## Best Practices
- Use bulk endpoints for large updates
- Always validate input data
- Monitor audit logs for compliance
- Use search for efficient querying

## Troubleshooting
- Ensure user/device IDs exist
- Check permissions for restricted endpoints
- Review logs for error details

## Further Reading
- [API Reference](../specs/016-user-device-association/spec.md)
- [RBAC & Security](../specs/015-admin-user-permission-management/plan.md)
