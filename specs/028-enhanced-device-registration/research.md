# Research: Enhanced Device Registration with Hardware Information

**Date**: 2024-12-19  
**Feature**: 028-enhanced-device-registration

## Research Tasks

### 1. Android TV Hardware Detection Capabilities

**Decision**: Use Android TV system APIs and build.prop data for comprehensive hardware information collection  
**Rationale**: Android TV provides standardized APIs for display capabilities, resolution detection, and device specifications through DisplayManager, WindowManager, and Build classes  
**Alternatives considered**: Custom hardware probing scripts (too complex), manual admin input (not scalable), third-party libraries (security concerns)

**Key APIs**:
- `DisplayManager.getDisplays()` - Screen resolution, refresh rates, supported modes
- `Build.MODEL`, `Build.MANUFACTURER` - Device identification  
- `Build.VERSION.SDK_INT` - Android API level
- `WindowManager.getDefaultDisplay().getMetrics()` - Physical screen dimensions
- `MediaCodecList` - Supported video/audio codecs

### 2. Multi-Size Media Processing Integration

**Decision**: Extend existing SixLabors.ImageSharp pipeline with device-aware variant generation  
**Rationale**: Current system already uses SixLabors.ImageSharp for image processing; extending it maintains consistency and leverages existing AWS S3 infrastructure  
**Alternatives considered**: FFmpeg for video processing (adds complexity), separate processing service (unnecessary overhead), client-side processing (security/performance issues)

**Integration Points**:
- Enhance `MediaService.UploadMediaAsync()` to generate device-specific variants
- Extend `S3FileUploadService` folder structure: `digitalsignage/ddmmyyyy/MediaType/resolution/filename`
- Add CloudFront URL generation for optimal content delivery

### 3. Hardware Profile Storage Strategy

**Decision**: New `DeviceHardwareProfile` entity with JSON field for extensible specifications  
**Rationale**: Structured storage for key fields (resolution, capabilities) with flexible JSON for vendor-specific attributes; supports future Android TV variations  
**Alternatives considered**: Separate tables per hardware type (over-normalization), pure JSON storage (loses query capabilities), key-value store (complicates relationships)

**Schema Design**:
```sql
DeviceHardwareProfile {
  Id, DeviceId (FK), 
  DisplayWidth, DisplayHeight, RefreshRate,
  SupportedFormats (JSON), 
  DeviceSpecs (JSON),
  DetectedAt, UpdatedAt
}
```

### 4. Backward Compatibility Approach

**Decision**: Graceful degradation with default profiles for legacy devices  
**Rationale**: Maintains existing registration workflow while enhancing new device capabilities; no breaking changes to current API contracts  
**Alternatives considered**: Mandatory hardware info (breaks existing devices), separate registration endpoints (API fragmentation), feature flags (unnecessary complexity)

**Implementation Strategy**:
- Hardware detection is optional during registration
- Default hardware profile created for devices without detailed info
- Existing media processing continues with fallback variants
- Admin interface shows hardware info when available

### 5. Performance Considerations

**Decision**: Asynchronous hardware detection with immediate registration response  
**Rationale**: Device registration must be fast (<2s) for good UX; hardware detection can happen in background with status updates via SignalR  
**Alternatives considered**: Synchronous detection (slow registration), polling-based updates (inefficient), webhook callbacks (complex setup)

**Architecture**:
- Registration endpoint returns immediately with basic device approval
- Background service processes hardware detection
- SignalR hub notifies admin interface of hardware profile updates
- Audit logging tracks all hardware information changes

## Technology Decisions Summary

| Aspect | Technology | Justification |
|--------|------------|---------------|
| Hardware Detection | Android TV System APIs | Standardized, secure, comprehensive |
| Media Processing | SixLabors.ImageSharp (existing) | Consistent with current pipeline |
| Storage | PostgreSQL + JSON fields | Structured queries + flexibility |
| Background Processing | ASP.NET Core BackgroundService | Native .NET integration |
| Real-time Updates | SignalR (existing) | Already implemented for device status |
| Audit Logging | Existing log4net infrastructure | Consistent logging approach |

## Integration Requirements

1. **Existing Device Registration Flow**: Enhance without breaking current PIN-based approval workflow
2. **Multi-Size Media System**: Integrate with recently designed upload processing pipeline  
3. **AWS S3/CloudFront**: Use updated configuration and folder structure from recent changes
4. **Admin Interface**: Extend existing React components for hardware profile display
5. **Device Heartbeat System**: Include hardware status in existing monitoring

## Risk Assessment

| Risk | Mitigation |
|------|------------|
| Hardware detection failures | Graceful fallback to default profiles |
| Performance impact on registration | Asynchronous processing with immediate response |
| Storage growth from hardware data | JSON compression, retention policies |
| Security of hardware information | Audit logging, secure transmission |
| Compatibility with future Android TV versions | Extensible JSON schema, version detection |

## Next Steps for Phase 1

1. Define `DeviceHardwareProfile` entity with relationships
2. Create API contracts for enhanced registration endpoints
3. Design background service contracts for hardware detection
4. Plan integration tests for existing registration workflow
5. Update admin interface contracts for hardware profile display