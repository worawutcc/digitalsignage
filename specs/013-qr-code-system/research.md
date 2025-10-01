# Research: QR Code Device Registration System

**Date**: 2025-09-30  
**Feature**: QR Code system to replace PIN-based device registration

## Research Tasks Completed

### QR Code Generation Library (.NET)
**Decision**: QRCoder NuGet package  
**Rationale**: 
- Pure C# implementation, no external dependencies
- Supports multiple output formats (PNG, SVG, Base64)
- Compatible with .NET 8
- Excellent performance for server-side generation
- 4M+ downloads, actively maintained

**Alternatives considered**:
- ZXing.Net: More complex, overkill for generation-only
- System.Drawing: Requires additional graphics libraries
- Online services: Adds external dependency and latency

### QR Code Data Structure
**Decision**: JSON payload with registration metadata  
**Rationale**:
- Flexible structure for future extensions
- Human-readable when decoded
- Standard format supported by all scanners
- Can include expiration and validation data

**Structure**:
```json
{
  "registrationId": "uuid",
  "deviceInfo": {
    "macAddress": "AA:BB:CC:DD:EE:FF",
    "model": "Samsung TV",
    "manufacturer": "Samsung"
  },
  "expires": "2025-09-30T16:00:00Z",
  "apiEndpoint": "https://api.domain.com/approve-qr/{registrationId}"
}
```

### QR Code Size and Readability
**Decision**: Error Correction Level M, minimum 200x200px  
**Rationale**:
- Level M provides 15% error correction (handles screen damage)
- 200x200px ensures readability on 32" screens from 6 feet
- Balances data capacity with scanning reliability
- Compatible with standard mobile camera capabilities

**Alternatives considered**:
- Level L: Insufficient error correction for TV screens
- Level Q/H: Unnecessarily high for this use case

### Mobile App Integration Pattern
**Decision**: Deep link URL with fallback web interface  
**Rationale**:
- QR code contains API endpoint URL
- Mobile app registers URL scheme handler
- Falls back to web browser if app not installed
- Follows standard mobile QR code UX patterns

### Security Considerations
**Decision**: Time-bounded tokens with server-side validation  
**Rationale**:
- 15-minute expiration prevents stale QR codes
- Registration ID acts as one-time token
- Server validates device hasn't been registered
- Maintains audit trail of all attempts

**Implementation**:
- QR codes expire after 15 minutes
- Registration tokens are single-use
- Failed scans are logged for security monitoring
- Admin authentication required for approval

### Database Schema Changes
**Decision**: Extend existing DeviceRegistrationRequest entity  
**Rationale**:
- Minimal schema changes to existing system
- Backwards compatible with PIN-based registration
- Reuses existing audit and approval workflows

**New Fields**:
- `Method` enum (Pin, QrCode, QrCodePin)
- `QrCodeData` string (Base64 encoded QR image)
- Existing expiration logic applies to QR codes

### Performance Optimization
**Decision**: In-memory QR code caching with Redis-compatible interface  
**Rationale**:
- QR generation is CPU-intensive (Base64 encoding)
- Cache QR images for 15-minute expiration window
- Reduces server load during bulk registrations
- Fits existing infrastructure patterns

### API Design Pattern
**Decision**: RESTful endpoints extending existing DeviceRegistration controller  
**Rationale**:
- Consistent with existing API patterns
- Maintains OpenAPI documentation standards
- Reuses existing authentication middleware

**New Endpoints**:
- `POST /api/device-registration/initiate-qr`
- `POST /api/device-registration/approve-qr`
- Extends existing status checking endpoint

## Architecture Decisions

### Service Layer Integration
**Decision**: Extend IDeviceRegistrationService interface  
**Rationale**:
- Maintains single responsibility for device registration
- Reuses existing dependency injection configuration
- Consistent with Clean Architecture patterns

### QR Code Generation Service
**Decision**: Separate IQrCodeService with Infrastructure implementation  
**Rationale**:
- Single responsibility principle
- Testable with mock implementations
- Reusable for future QR code needs

### Error Handling Strategy
**Decision**: Graceful degradation with clear error messages  
**Rationale**:
- QR code generation failures fall back to PIN method
- Network issues provide retry mechanisms
- Clear user feedback for scanning problems

## Technical Risks and Mitigations

### Risk: QR Code Unreadable
**Mitigation**: Multiple error correction levels, fallback to PIN

### Risk: Network Latency During Scanning
**Mitigation**: Offline-capable QR codes with deep links

### Risk: Concurrent Registration Conflicts
**Mitigation**: Database-level constraints and optimistic locking

### Risk: QR Code Security
**Mitigation**: Short expiration times and one-time tokens

## Integration Requirements

### Android TV Client Changes
- Add QR code display UI component
- Implement registration polling mechanism
- Handle approval/rejection states gracefully

### Admin Mobile App Changes
- Integrate QR code scanner (camera permissions)
- Auto-populate registration forms from QR data
- Handle deep link URL schemes

### Backend API Changes
- Extend existing registration workflows
- Add QR code generation and validation
- Maintain compatibility with PIN-based registration

## Performance Benchmarks

### QR Code Generation
- Target: <2 seconds per QR code (including Base64 encoding)
- Concurrent: Support 100 simultaneous generations
- Memory: <50MB additional overhead for QRCoder library

### Database Impact
- New fields add minimal storage overhead
- Existing indexes support QR code queries
- No breaking changes to current schema

### API Response Times
- QR endpoint: <2 seconds (including generation)
- Approval endpoint: <1 second (existing logic)
- Status polling: <500ms (existing endpoint)

## Dependencies Added

### NuGet Packages
- `QRCoder` (>= 1.4.3) - QR code generation
- `System.Text.Json` (already present) - JSON serialization

### No Breaking Changes
- All changes are additive to existing system
- PIN-based registration remains fully functional
- Existing tests continue to pass

## Conclusion

QR Code registration system integrates seamlessly with existing Clean Architecture patterns while providing significant UX improvements. The research validates all technical assumptions from the feature specification and provides clear implementation guidance.