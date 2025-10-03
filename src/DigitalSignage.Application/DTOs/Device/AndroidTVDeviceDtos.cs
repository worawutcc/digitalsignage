using DigitalSignage.Domain.Enums;

namespace DigitalSignage.Application.DTOs.Device;

/// <summary>
/// Response DTO for Android TV device information
/// </summary>
public class AndroidTVDeviceDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string DeviceKey { get; set; } = string.Empty;
    public string Location { get; set; } = string.Empty;
    public DeviceStatus Status { get; set; }
    public string IpAddress { get; set; } = string.Empty;
    public string Resolution { get; set; } = string.Empty;
    public bool IsActive { get; set; }
    public DateTime? LastHeartbeat { get; set; }
    public int? ManagedByUserId { get; set; }
    public int? DeviceGroupId { get; set; }
    public int? AssignedUserId { get; set; }
    
    // Android TV specific fields
    public string? MacAddress { get; set; }
    public string? AndroidVersion { get; set; }
    public string? ApiLevel { get; set; }
    public string? SerialNumber { get; set; }
    public string? Manufacturer { get; set; }
    public string? Model { get; set; }
    public string? DisplayResolution { get; set; }
    public DateTime? DeactivatedAt { get; set; }
    public int? DeactivatedBy { get; set; }
    
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
    
    // Navigation properties
    public string? ManagedByUserName { get; set; }
    public string? AssignedUserName { get; set; }
    public string? DeviceGroupName { get; set; }
    public string? DeactivatedByUserName { get; set; }
}

/// <summary>
/// Request DTO for Android TV device registration
/// </summary>
public class AndroidTVRegistrationRequestDto
{
    public string DeviceName { get; set; } = string.Empty;
    public string MacAddress { get; set; } = string.Empty;
    public string AndroidVersion { get; set; } = string.Empty;
    public string ApiLevel { get; set; } = string.Empty;
    public string SerialNumber { get; set; } = string.Empty;
    public string Manufacturer { get; set; } = string.Empty;
    public string Model { get; set; } = string.Empty;
    public string DisplayResolution { get; set; } = string.Empty;
    public string? Location { get; set; }
}

/// <summary>
/// Response DTO for Android TV device registration
/// </summary>
public class AndroidTVRegistrationResponseDto
{
    public int DeviceId { get; set; }
    public string RegistrationPin { get; set; } = string.Empty;
    public DeviceStatus Status { get; set; }
    public string Message { get; set; } = string.Empty;
    public DateTime RequestedAt { get; set; }
}

/// <summary>
/// Request DTO for device approval/rejection
/// </summary>
public class DeviceApprovalRequestDto
{
    public int DeviceId { get; set; }
    public bool Approve { get; set; }
    public string? Notes { get; set; }
}

/// <summary>
/// Response DTO for device approval/rejection
/// </summary>
public class DeviceApprovalResponseDto
{
    public int DeviceId { get; set; }
    public bool Approved { get; set; }
    public DeviceStatus NewStatus { get; set; }
    public string Message { get; set; } = string.Empty;
    public DateTime ProcessedAt { get; set; }
    public int ProcessedByUserId { get; set; }
    public string? Notes { get; set; }
}

/// <summary>
/// DTO for device statistics
/// </summary>
public class DeviceStatisticsDto
{
    public int TotalDevices { get; set; }
    public int OnlineDevices { get; set; }
    public int OfflineDevices { get; set; }
    public int PendingDevices { get; set; }
    public int ErrorDevices { get; set; }
    public int InactiveDevices { get; set; }
    public Dictionary<string, int> DevicesByManufacturer { get; set; } = new();
    public Dictionary<string, int> DevicesByAndroidVersion { get; set; } = new();
    public Dictionary<string, int> DevicesByStatus { get; set; } = new();
    public DateTime GeneratedAt { get; set; }
}

/// <summary>
/// Request DTO for updating device information
/// </summary>
public class UpdateAndroidTVDeviceRequestDto
{
    public string? Name { get; set; }
    public string? Location { get; set; }
    public int? DeviceGroupId { get; set; }
    public int? AssignedUserId { get; set; }
    public bool? IsActive { get; set; }
    public string? Description { get; set; }
    public AndroidTVConfigurationDto? Configuration { get; set; }
}

/// <summary>
/// Request DTO for device deactivation
/// </summary>
public class DeactivateDeviceRequestDto
{
    public string Reason { get; set; } = string.Empty;
}

/// <summary>
/// Request DTO for bulk device operations
/// </summary>
public class BulkDeviceOperationRequestDto
{
    public List<int> DeviceIds { get; set; } = new();
    public string Operation { get; set; } = string.Empty; // restart, maintenance, update-config, etc.
    public Dictionary<string, object>? Parameters { get; set; }
    public string? Reason { get; set; }
    public UpdateAndroidTVDeviceRequestDto? UpdateData { get; set; }
}

/// <summary>
/// Response DTO for bulk device operations
/// </summary>
public class BulkDeviceOperationResponseDto
{
    public string Operation { get; set; } = string.Empty;
    public int TotalDevices { get; set; }
    public int SuccessfulOperations { get; set; }
    public int FailedOperations { get; set; }
    public List<DeviceOperationResultDto> Results { get; set; } = new();
    public string OperatedByUserId { get; set; } = string.Empty;
    public DateTime OperatedAt { get; set; }
    
    // Keep legacy properties for backward compatibility
    public int TotalRequested => TotalDevices;
    public int Successful => SuccessfulOperations;
    public int Failed => FailedOperations;
    public List<string> Errors => Results.Where(r => !r.Success).Select(r => r.ErrorMessage ?? "Unknown error").ToList();
    public List<int> SuccessfulDeviceIds => Results.Where(r => r.Success).Select(r => r.DeviceId).ToList();
    public List<int> FailedDeviceIds => Results.Where(r => !r.Success).Select(r => r.DeviceId).ToList();
}

/// <summary>
/// Request DTO for device list filtering
/// </summary>
public class DeviceFilterRequestDto
{
    public string? Search { get; set; }
    public string? SearchTerm => Search; // Alias for backward compatibility
    public int? GroupId => DeviceGroupId; // Alias for backward compatibility
    public DeviceStatus? Status { get; set; }
    public string? Manufacturer { get; set; }
    public int? DeviceGroupId { get; set; }
    public int? AssignedUserId { get; set; }
    public bool? IsActive { get; set; }
    public DateTime? LastSeenAfter { get; set; }
    public DateTime? LastSeenBefore { get; set; }
    public int Page { get; set; } = 1;
    public int PageNumber => Page; // Alias for consistency
    public int PageSize { get; set; } = 20;
    public string? SortBy { get; set; }
    public bool SortDescending { get; set; } = false;
    public string? SortDirection => SortDescending ? "desc" : "asc"; // Alias for backward compatibility
}

/// <summary>
/// Response DTO for paginated device list
/// </summary>
public class PaginatedDeviceResponseDto
{
    public List<AndroidTVDeviceDto> Devices { get; set; } = new();
    public int TotalCount { get; set; }
    public int PageNumber { get; set; }
    public int PageSize { get; set; }
    public int TotalPages { get; set; }
    public bool HasNextPage { get; set; }
    public bool HasPreviousPage { get; set; }
}



/// <summary>
/// DTO for individual device operation result
/// </summary>
public class DeviceOperationResultDto
{
    public int DeviceId { get; set; }
    public bool Success { get; set; }
    public string? Message { get; set; }
    public string? ErrorMessage { get; set; }
    public string OperationType { get; set; } = string.Empty;
    public DateTime OperatedAt { get; set; } = DateTime.UtcNow;
}

/// <summary>
/// Request DTO for emergency configuration
/// </summary>
public class EmergencyConfigurationRequestDto
{
    public AndroidTVConfigurationDto Configuration { get; set; } = new();
    public string Reason { get; set; } = string.Empty;
    public bool ForceApply { get; set; } = true;
}

/// <summary>
/// Response DTO for device configuration validation
/// </summary>
public class DeviceConfigurationValidationResponseDto
{
    public bool IsValid { get; set; }
    public List<string> Errors { get; set; } = new();
    public List<string> Warnings { get; set; } = new();
    public Dictionary<string, object>? ValidationDetails { get; set; }
}