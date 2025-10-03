using DigitalSignage.Domain.Entities;
using DigitalSignage.Domain.Enums;

namespace DigitalSignage.Application.DTOs.Device;

/// <summary>
/// DTO for device filtering and search
/// </summary>
public class DeviceFilterDto
{
    public int PageNumber { get; set; } = 1;
    public int PageSize { get; set; } = 10;
    public string? SearchTerm { get; set; }
    public DeviceStatus? Status { get; set; }
    public string? Location { get; set; }
    public string? Manufacturer { get; set; }
    public bool? IsActive { get; set; }
    public DateTime? RegisteredAfter { get; set; }
    public DateTime? RegisteredBefore { get; set; }
}

/// <summary>
/// DTO for device registration request
/// </summary>
public class DeviceRegistrationDto
{
    public string Name { get; set; } = string.Empty;
    public string MacAddress { get; set; } = string.Empty;
    public string? IpAddress { get; set; }
    public string? AndroidVersion { get; set; }
    public int? ApiLevel { get; set; }
    public string? SerialNumber { get; set; }
    public string? Manufacturer { get; set; }
    public string? Model { get; set; }
    public string? DisplayResolution { get; set; }
    public string? Location { get; set; }
    public int? DeviceGroupId { get; set; }
}

/// <summary>
/// DTO for device update request
/// </summary>
public class DeviceUpdateDto
{
    public string? Name { get; set; }
    public string? IpAddress { get; set; }
    public string? AndroidVersion { get; set; }
    public int? ApiLevel { get; set; }
    public string? SerialNumber { get; set; }
    public string? Manufacturer { get; set; }
    public string? Model { get; set; }
    public string? DisplayResolution { get; set; }
    public string? Location { get; set; }
    public int? DeviceGroupId { get; set; }
    public DeviceStatus? Status { get; set; }
}

/// <summary>
/// DTO for device response in lists
/// </summary>
public class DeviceResponseDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string DeviceKey { get; set; } = string.Empty;
    public string MacAddress { get; set; } = string.Empty;
    public string? IpAddress { get; set; }
    public string? Location { get; set; }
    public DeviceStatus Status { get; set; }
    public string? Manufacturer { get; set; }
    public string? Model { get; set; }
    public string? DisplayResolution { get; set; }
    public DateTime? LastHeartbeat { get; set; }
    public DateTime CreatedAt { get; set; }
    public bool IsActive { get; set; }
}

/// <summary>
/// DTO for detailed device information
/// </summary>
public class DeviceDetailDto : DeviceResponseDto
{
    public string? AndroidVersion { get; set; }
    public int? ApiLevel { get; set; }
    public string? SerialNumber { get; set; }
    public DateTime? DeactivatedAt { get; set; }
    public int? DeactivatedBy { get; set; }
    public int? ManagedByUserId { get; set; }
    public int? DeviceGroupId { get; set; }
    public int? AssignedUserId { get; set; }
    public DeviceConfiguration? Configuration { get; set; }
    public List<DeviceStatusLogDto> RecentStatusLogs { get; set; } = new();
    public List<RegistrationRecordDto> RegistrationHistory { get; set; } = new();
}

