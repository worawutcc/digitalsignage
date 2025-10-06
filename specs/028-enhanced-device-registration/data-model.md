# Data Model: Enhanced Device Registration with Hardware Information

**Date**: 2024-12-19  
**Feature**: 028-enhanced-device-registration

## Core Entities

### DeviceHardwareProfile
**Purpose**: Store comprehensive hardware specifications and display capabilities for Android TV devices  
**Relationship**: One-to-One with Device entity

```csharp
public class DeviceHardwareProfile : BaseEntity
{
    public int DeviceId { get; set; }
    public Device Device { get; set; } = null!;
    
    // Display Information
    public int DisplayWidth { get; set; }
    public int DisplayHeight { get; set; }
    public float RefreshRate { get; set; }
    public float PhysicalWidth { get; set; }  // in inches
    public float PhysicalHeight { get; set; } // in inches
    public int DensityDpi { get; set; }
    
    // Device Specifications
    public string Manufacturer { get; set; } = string.Empty;
    public string Model { get; set; } = string.Empty;
    public string AndroidVersion { get; set; } = string.Empty;
    public int ApiLevel { get; set; }
    public string BuildFingerprint { get; set; } = string.Empty;
    
    // Capabilities (JSON for extensibility)
    public string SupportedFormats { get; set; } = "{}"; // JSON array of supported media formats
    public string CodecCapabilities { get; set; } = "{}"; // JSON object of codec support
    public string AdditionalSpecs { get; set; } = "{}";   // JSON for vendor-specific attributes
    
    // Metadata
    public DateTime DetectedAt { get; set; }
    public bool IsAutoDetected { get; set; }
    public string? DetectionSource { get; set; } // "system", "manual", "default"
}
```

### MediaVariant (Enhanced)
**Purpose**: Store device-optimized versions of media content  
**Relationship**: Many-to-One with Media entity

```csharp
public class MediaVariant : BaseEntity
{
    public int MediaId { get; set; }
    public Media Media { get; set; } = null!;
    
    // Variant Specifications
    public int Width { get; set; }
    public int Height { get; set; }
    public string Quality { get; set; } = string.Empty; // "high", "medium", "low"
    public long FileSize { get; set; }
    public string Format { get; set; } = string.Empty; // "jpg", "webp", "mp4", etc.
    
    // Storage Information
    public string S3Key { get; set; } = string.Empty;
    public string CloudFrontUrl { get; set; } = string.Empty;
    
    // Target Information
    public string? TargetResolution { get; set; } // "1920x1080", "4K", "HD", null for original
    public bool IsOriginal { get; set; }
}
```

### DeviceRegistrationRequest (Enhanced)
**Purpose**: Extended registration request with hardware information  
**Relationship**: One-to-Many with Device (existing)

```csharp
public class DeviceRegistrationRequest : BaseEntity
{
    // Existing fields
    public string DeviceName { get; set; } = string.Empty;
    public string Pin { get; set; } = string.Empty;
    public string MacAddress { get; set; } = string.Empty;
    public DeviceRegistrationStatus Status { get; set; }
    
    // Enhanced hardware information (optional)
    public string? HardwareInfo { get; set; } // JSON payload from device
    public bool HasHardwareInfo { get; set; }
    
    // Processing status
    public bool HardwareProcessed { get; set; }
    public DateTime? HardwareProcessedAt { get; set; }
}
```

### HardwareDetectionJob
**Purpose**: Track background processing of device hardware information  
**Relationship**: One-to-One with DeviceRegistrationRequest

```csharp
public class HardwareDetectionJob : BaseEntity
{
    public int DeviceRegistrationRequestId { get; set; }
    public DeviceRegistrationRequest DeviceRegistrationRequest { get; set; } = null!;
    
    public HardwareDetectionStatus Status { get; set; }
    public DateTime StartedAt { get; set; }
    public DateTime? CompletedAt { get; set; }
    public string? ErrorMessage { get; set; }
    public int RetryCount { get; set; }
    
    // Processing results
    public bool ProfileCreated { get; set; }
    public int? DeviceHardwareProfileId { get; set; }
    public DeviceHardwareProfile? DeviceHardwareProfile { get; set; }
}

public enum HardwareDetectionStatus
{
    Pending = 0,
    Processing = 1,
    Completed = 2,
    Failed = 3,
    Retrying = 4
}
```

## Enumerations

### SupportedMediaFormat
```csharp
public enum SupportedMediaFormat
{
    JPEG = 0,
    PNG = 1,
    WebP = 2,
    MP4 = 3,
    WebM = 4,
    AV1 = 5,
    HEVC = 6
}
```

### DeviceCapabilityType
```csharp
public enum DeviceCapabilityType
{
    VideoCodec = 0,
    AudioCodec = 1,
    DisplayFeature = 2,
    NetworkProtocol = 3,
    SecurityFeature = 4
}
```

## Entity Relationships

```
Device (existing)
├── DeviceHardwareProfile (1:1) [new]
├── DeviceRegistrationRequest (1:many) [enhanced]
└── ScheduleMedia (1:many) [existing]

Media (existing)
└── MediaVariant (1:many) [new]

DeviceRegistrationRequest (enhanced)
└── HardwareDetectionJob (1:1) [new]

HardwareDetectionJob
└── DeviceHardwareProfile (1:1) [new]
```

## Validation Rules

### DeviceHardwareProfile
- `DisplayWidth`, `DisplayHeight` must be > 0
- `RefreshRate` must be between 24.0 and 240.0 Hz
- `ApiLevel` must be >= 21 (Android 5.0 minimum for Android TV)
- `SupportedFormats`, `CodecCapabilities`, `AdditionalSpecs` must be valid JSON
- `DetectionSource` must be one of: "system", "manual", "default"

### MediaVariant
- `Width`, `Height` must be > 0
- `FileSize` must be > 0
- `Quality` must be one of: "high", "medium", "low", "original"
- `Format` must be supported media format
- Only one variant can have `IsOriginal = true` per media

### HardwareDetectionJob
- `StartedAt` must be <= current time
- `CompletedAt` must be > `StartedAt` when set
- `RetryCount` must be >= 0 and <= 5 (max retries)
- `ErrorMessage` required when `Status = Failed`

## State Transitions

### HardwareDetectionJob Status Flow
```
Pending → Processing → Completed
       → Processing → Failed
       → Processing → Retrying → Processing
```

### DeviceRegistrationRequest with Hardware
```
Created → HardwareReceived → HardwareProcessing → ReadyForApproval
       → NoHardware → ReadyForApproval (legacy devices)
```

## Database Migration Considerations

1. **Add new tables**: `DeviceHardwareProfile`, `MediaVariant`, `HardwareDetectionJob`
2. **Enhance existing**: Add hardware fields to `DeviceRegistrationRequest`
3. **Indexes**: Add indexes on `DeviceId`, `MediaId`, device resolution queries
4. **Default data**: Create default hardware profiles for existing devices
5. **JSON validation**: Add check constraints for JSON field validity

## Integration Points

### Existing System Integration
- **Device entity**: Add navigation property to `DeviceHardwareProfile`
- **Media entity**: Add navigation property to `MediaVariant` collection
- **Registration workflow**: Enhance to handle hardware information
- **Audit logging**: Track hardware profile changes
- **SignalR notifications**: Real-time hardware detection status updates

### External System Integration
- **AWS S3**: Enhanced folder structure for variant storage
- **CloudFront**: Device-optimized content delivery URLs
- **Android TV APIs**: Hardware detection data ingestion
- **Background services**: Asynchronous hardware processing