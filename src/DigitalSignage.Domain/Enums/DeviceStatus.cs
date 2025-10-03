namespace DigitalSignage.Domain.Enums;

public enum DeviceStatus
{
    Pending = 0,        // Registration initiated but not completed
    Registered = 1,     // Successfully registered and active
    Online = 2,         // Device responding to heartbeat
    Offline = 3,        // Device not responding (timeout-based)
    Error = 4,          // Device in error state
    Maintenance = 5,    // Device in maintenance mode
    Inactive = 6        // Manually deactivated
}