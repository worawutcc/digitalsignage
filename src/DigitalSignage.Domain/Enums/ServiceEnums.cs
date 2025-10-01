using System.ComponentModel.DataAnnotations;

namespace DigitalSignage.Domain.Enums;

public enum ServiceStatus
{
    Unknown = 0,
    Healthy = 1,
    Unhealthy = 2,
    Critical = 3,
    Maintenance = 4
}

public enum ServiceType
{
    Unknown = 0,
    ApiGateway = 1,
    MediaService = 2,
    DeviceService = 3,
    PlaylistService = 4,
    AuthenticationService = 5,
    NotificationService = 6,
    AnalyticsService = 7,
    External = 8
}