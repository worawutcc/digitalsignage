namespace DigitalSignage.Domain.Enums;

public enum DisplayOrientation
{
    Landscape = 0,
    Portrait = 1,
    Auto = 2
}

public enum PowerManagement
{
    AlwaysOn = 0,
    EcoMode = 1,
    Scheduled = 2
}

public enum RegistrationAction
{
    Created = 0,
    Updated = 1,
    Deleted = 2,
    Activated = 3,
    Deactivated = 4,
    ConfigurationChanged = 5
}

/// <summary>
/// Enum for device alert types
/// </summary>
public enum DeviceAlertType
{
    ConnectivityIssue = 0,
    HighCpuUsage = 1,
    LowMemory = 2,
    StorageFull = 3,
    ConfigurationError = 4,
    SecurityThreat = 5,
    HeartbeatMissed = 6,
    UnauthorizedAccess = 7,
    SystemError = 8,
    MaintenanceRequired = 9,
    Custom = 99
}

/// <summary>
/// Enum for alert severity levels
/// </summary>
public enum AlertSeverity
{
    Info = 0,
    Warning = 1,
    Error = 2,
    Critical = 3
}

/// <summary>
/// Enum for device alert actions
/// </summary>
public enum DeviceAlertAction
{
    Acknowledge = 0,
    Resolve = 1,
    Escalate = 2,
    Dismiss = 3
}

/// <summary>
/// Enum for device types
/// </summary>
public enum DeviceType
{
    Unknown = 0,
    AndroidTV = 1,
    WebOS = 2,
    Tizen = 3,
    Windows = 4,
    Generic = 99
}