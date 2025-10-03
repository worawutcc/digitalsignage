# Data Model: Device Registration Management

**Feature**: Device Registration Management UI  
**Date**: 3 October 2025  
**Phase**: Phase 1 - Data Model Design

## Core Entities

### Device
**Purpose**: Represents a digital signage display device (Android TV focus)  
**Aggregate Root**: Yes

**Fields**:
- `Id` (Guid): Primary key, unique device identifier
- `Name` (string, required): User-friendly device name (max 100 chars)
- `MacAddress` (string, required): Unique MAC address (format validation)
- `IpAddress` (string, nullable): Current IP address 
- `AndroidVersion` (string, nullable): Android OS version
- `ApiLevel` (int, nullable): Android API level
- `SerialNumber` (string, nullable): Device serial number
- `Manufacturer` (string, nullable): Device manufacturer
- `Model` (string, nullable): Device model
- `DisplayResolution` (string, nullable): Screen resolution (e.g., "1920x1080")
- `Location` (string, nullable): Physical location/zone
- `Status` (DeviceStatus enum): Current device status
- `IsActive` (bool): Soft deletion flag
- `LastHeartbeat` (DateTime, nullable): Last communication timestamp
- `CreatedAt` (DateTime): Registration timestamp
- `CreatedBy` (Guid): Administrator who registered device
- `UpdatedAt` (DateTime): Last modification timestamp
- `UpdatedBy` (Guid): Administrator who last modified
- `DeactivatedAt` (DateTime, nullable): Deactivation timestamp
- `DeactivatedBy` (Guid, nullable): Administrator who deactivated

**Relationships**:
- One-to-One with `DeviceConfiguration`
- One-to-Many with `DeviceStatusLog`
- Many-to-One with `Organization` (multi-tenant support)
- One-to-Many with `RegistrationRecord` (audit trail)

**Validation Rules**:
- Name: Required, 1-100 characters, no special characters except spaces and hyphens
- MacAddress: Required, valid MAC format (XX:XX:XX:XX:XX:XX), unique within organization
- IpAddress: Valid IPv4 format when provided
- AndroidVersion: Semantic version format when provided
- ApiLevel: Positive integer when provided

### DeviceStatus (Enum)
**Values**:
- `Pending` (0): Registration initiated but not completed
- `Registered` (1): Successfully registered and active
- `Online` (2): Device responding to heartbeat
- `Offline` (3): Device not responding (timeout-based)
- `Error` (4): Device in error state
- `Maintenance` (5): Device in maintenance mode
- `Inactive` (6): Manually deactivated

### DeviceConfiguration
**Purpose**: Android TV specific configuration settings  
**Relationship**: One-to-One with Device

**Fields**:
- `Id` (Guid): Primary key
- `DeviceId` (Guid): Foreign key to Device
- `DisplayOrientation` (DisplayOrientation enum): Screen orientation
- `Resolution` (string): Preferred resolution
- `RefreshRate` (int): Display refresh rate in Hz
- `ScreenTimeout` (int): Screen timeout in minutes
- `PowerManagement` (PowerManagement enum): Power saving mode
- `NetworkConfig` (string, JSON): Network configuration settings
- `AppPermissions` (string, JSON): Android app permissions
- `RemoteManagementEnabled` (bool): Allow remote management
- `ProxySettings` (string, JSON): Network proxy configuration
- `UpdatedAt` (DateTime): Last configuration update
- `UpdatedBy` (Guid): Administrator who updated

**Enums**:
- `DisplayOrientation`: Landscape, Portrait, Auto
- `PowerManagement`: AlwaysOn, EcoMode, Scheduled

### RegistrationRecord
**Purpose**: Audit trail for device registration and modifications  
**Relationship**: Many-to-One with Device

**Fields**:
- `Id` (Guid): Primary key
- `DeviceId` (Guid): Foreign key to Device
- `Action` (RegistrationAction enum): Type of action performed
- `Details` (string, JSON): Action-specific details
- `IpAddress` (string): Client IP address
- `UserAgent` (string): Client user agent
- `Timestamp` (DateTime): When action occurred
- `UserId` (Guid): Administrator who performed action
- `Success` (bool): Whether action succeeded
- `ErrorMessage` (string, nullable): Error details if failed

**RegistrationAction Enum**:
- `Created`, `Updated`, `Deleted`, `Activated`, `Deactivated`, `ConfigurationChanged`

### DeviceStatusLog
**Purpose**: Historical status tracking for monitoring and analytics  
**Relationship**: Many-to-One with Device

**Fields**:
- `Id` (Guid): Primary key
- `DeviceId` (Guid): Foreign key to Device
- `Status` (DeviceStatus): Status at time of log
- `Details` (string, JSON): Status-specific information
- `Timestamp` (DateTime): When status was recorded
- `Source` (string): How status was determined (heartbeat, manual, system)

### Organization
**Purpose**: Multi-tenant support for device isolation  
**Relationship**: One-to-Many with Device

**Fields**:
- `Id` (Guid): Primary key
- `Name` (string): Organization name
- `IsActive` (bool): Organization status
- `CreatedAt` (DateTime): Creation timestamp
- `MaxDevices` (int): Device limit for organization

## State Transitions

### Device Status Flow
```
Pending → Registered → Online ⟷ Offline
                   ↓
                Error → Online (recovery)
                   ↓
              Maintenance → Online (maintenance complete)
                   ↓
               Inactive (admin action)
```

**Transition Rules**:
- `Pending` → `Registered`: Device completes registration process
- `Registered` → `Online`: First successful heartbeat received
- `Online` ⟷ `Offline`: Based on heartbeat timeout (5 minutes)
- Any status → `Error`: System detects device error condition
- Any status → `Maintenance`: Administrator sets maintenance mode
- Any status → `Inactive`: Administrator deactivates device

## Data Relationships

```
Organization (1) ─────── (∞) Device (1) ─────── (1) DeviceConfiguration
                                │
                                ├─── (∞) RegistrationRecord
                                └─── (∞) DeviceStatusLog
```

## Validation Business Rules

### Device Registration
1. MAC address must be unique within organization
2. Device name must be unique within organization
3. Only active administrators can register devices
4. Organizations cannot exceed device limits
5. Deactivated devices can be reactivated by changing IsActive flag

### Configuration Management
1. Configuration changes must be logged in RegistrationRecord
2. Invalid Android settings must be rejected with descriptive errors
3. Network configurations must pass basic validation (IP format, port ranges)
4. Only device owners or organization admins can modify configurations

### Status Management
1. Status transitions must follow allowed flow
2. Offline devices cannot receive configuration updates
3. Devices in maintenance mode ignore heartbeat timeouts
4. Error states require manual intervention to clear

## Indexes and Performance

### Database Indexes
- `Device.MacAddress` (unique, filtered where IsActive = true)
- `Device.OrganizationId, Device.IsActive` (composite)
- `Device.Status, Device.LastHeartbeat` (composite, for monitoring queries)
- `DeviceStatusLog.DeviceId, DeviceStatusLog.Timestamp` (composite)
- `RegistrationRecord.DeviceId, RegistrationRecord.Timestamp` (composite)

### Query Patterns
- Device listing: Filter by organization, status, active flag
- Status monitoring: Recent heartbeats, status changes
- Audit queries: Registration records by device, time range
- Configuration lookups: Device with configuration joins

## Migration Considerations

### Data Seeding
- Create default device configurations for common Android TV models
- Seed organization structure if multi-tenancy required
- Initialize enum lookup tables

### Backwards Compatibility
- Support for devices without Android-specific fields
- Graceful handling of legacy device data
- Migration scripts for existing device records