using DigitalSignage.Domain.Enums;

namespace DigitalSignage.Application.DTOs.Device;

/// <summary>
/// Response DTO for Android TV device configuration
/// </summary>
public class AndroidTVConfigurationDto
{
    public int Id { get; set; }
    public int DeviceId { get; set; }
    public DisplayOrientation DisplayOrientation { get; set; }
    public int ScreenTimeout { get; set; }
    public PowerManagement PowerManagement { get; set; }
    public bool AutoRotate { get; set; }
    public NetworkConfigurationDto? NetworkConfig { get; set; }
    public AppPermissionsDto? AppPermissions { get; set; }
    public ProxySettingsDto? ProxySettings { get; set; }
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
    
    // Navigation properties
    public string? DeviceName { get; set; }
}

/// <summary>
/// Request DTO for updating Android TV device configuration
/// </summary>
public class UpdateAndroidTVConfigurationRequestDto
{
    public DisplayOrientation? DisplayOrientation { get; set; }
    public int? ScreenTimeout { get; set; }
    public PowerManagement? PowerManagement { get; set; }
    public bool? AutoRotate { get; set; }
    public NetworkConfigurationDto? NetworkConfig { get; set; }
    public AppPermissionsDto? AppPermissions { get; set; }
    public ProxySettingsDto? ProxySettings { get; set; }
}

/// <summary>
/// Response DTO for configuration update
/// </summary>
public class ConfigurationUpdateResponseDto
{
    public int DeviceId { get; set; }
    public AndroidTVConfigurationDto Configuration { get; set; } = new();
    public bool RequiresRestart { get; set; }
    public string Message { get; set; } = string.Empty;
    public DateTime UpdatedAt { get; set; }
}

/// <summary>
/// DTO for configuration template
/// </summary>
public class ConfigurationTemplateDto
{
    public string Manufacturer { get; set; } = string.Empty;
    public string Model { get; set; } = string.Empty;
    public Dictionary<string, object> Template { get; set; } = new();
    public List<string> SupportedFeatures { get; set; } = new();
    public Dictionary<string, object> DefaultValues { get; set; } = new();
}

/// <summary>
/// Request DTO for configuration validation
/// </summary>
public class ValidateConfigurationRequestDto
{
    public DisplayOrientation? DisplayOrientation { get; set; }
    public int? ScreenTimeout { get; set; }
    public PowerManagement? PowerManagement { get; set; }
    public bool? AutoRotate { get; set; }
    public NetworkConfigurationDto? NetworkConfig { get; set; }
    public AppPermissionsDto? AppPermissions { get; set; }
    public ProxySettingsDto? ProxySettings { get; set; }
}

/// <summary>
/// Response DTO for configuration validation
/// </summary>
public class ConfigurationValidationResponseDto
{
    public bool IsValid { get; set; }
    public List<string> Errors { get; set; } = new();
    public List<string> Warnings { get; set; } = new();
    public Dictionary<string, string> FieldErrors { get; set; } = new();
}

/// <summary>
/// DTO for network configuration
/// </summary>
public class NetworkConfigurationDto
{
    public bool WiFiEnabled { get; set; }
    public bool WiFiAutoConnect { get; set; }
    public string? WiFiSSID { get; set; }
    public string? WiFiPassword { get; set; }
    public bool EthernetEnabled { get; set; }
    public bool EthernetDHCP { get; set; }
    public string? StaticIP { get; set; }
    public string? Subnet { get; set; }
    public string? Gateway { get; set; }
    public string? PrimaryDNS { get; set; }
    public string? SecondaryDNS { get; set; }
}

/// <summary>
/// DTO for app permissions configuration
/// </summary>
public class AppPermissionsDto
{
    public bool Camera { get; set; }
    public bool Microphone { get; set; }
    public bool Location { get; set; }
    public bool Storage { get; set; }
    public bool Network { get; set; }
    public bool SystemSettings { get; set; }
    public Dictionary<string, bool> CustomPermissions { get; set; } = new();
}

/// <summary>
/// DTO for proxy settings configuration
/// </summary>
public class ProxySettingsDto
{
    public bool Enabled { get; set; }
    public string? Host { get; set; }
    public int? Port { get; set; }
    public string? Username { get; set; }
    public string? Password { get; set; }
    public List<string> BypassList { get; set; } = new();
    public bool RequiresAuthentication { get; set; }
}

/// <summary>
/// Request DTO for creating Android TV configuration template
/// </summary>
public class CreateAndroidTVConfigurationRequestDto
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public AndroidTVConfigurationDto Configuration { get; set; } = new();
}

/// <summary>
/// Request DTO for applying configuration to devices
/// </summary>
public class ApplyConfigurationRequestDto
{
    public int TemplateId { get; set; }
    public List<int> DeviceIds { get; set; } = new();
    public bool ForceApply { get; set; }
    public string? ApplyReason { get; set; }
}

/// <summary>
/// Response DTO for configuration deployment
/// </summary>
public class ConfigurationDeploymentResponseDto
{
    public int TemplateId { get; set; }
    public int TotalDevices { get; set; }
    public int SuccessfulDeployments { get; set; }
    public int FailedDeployments { get; set; }
    public List<ConfigurationDeploymentResultDto> Results { get; set; } = new();
    public string DeployedByUserId { get; set; } = string.Empty;
    public DateTime DeployedAt { get; set; }
}

/// <summary>
/// Result DTO for individual device configuration deployment
/// </summary>
public class ConfigurationDeploymentResultDto
{
    public int DeviceId { get; set; }
    public bool Success { get; set; }
    public string? Message { get; set; }
    public string? ErrorMessage { get; set; }
    public DateTime ProcessedAt { get; set; } = DateTime.UtcNow;
}

/// <summary>
/// DTO for configuration backup
/// </summary>
public class ConfigurationBackupDto
{
    public int Id { get; set; }
    public int DeviceId { get; set; }
    public string? DeviceName { get; set; }
    public AndroidTVConfigurationDto Configuration { get; set; } = new();
    public string BackupReason { get; set; } = string.Empty;
    public string CreatedByUserId { get; set; } = string.Empty;
    public string? CreatedByUserName { get; set; }
    public DateTime CreatedAt { get; set; }
}

/// <summary>
/// Response DTO for configuration restore operation
/// </summary>
public class ConfigurationRestoreResponseDto
{
    public int DeviceId { get; set; }
    public int BackupId { get; set; }
    public bool Success { get; set; }
    public string? Message { get; set; }
    public string? ErrorMessage { get; set; }
    public string RestoredByUserId { get; set; } = string.Empty;
    public DateTime RestoredAt { get; set; }
}

/// <summary>
/// DTO for configuration history entry
/// </summary>
public class ConfigurationHistoryDto
{
    public int Id { get; set; }
    public int DeviceId { get; set; }
    public string Action { get; set; } = string.Empty; // Created, Updated, Applied, Restored
    public string? Description { get; set; }
    public AndroidTVConfigurationDto? Configuration { get; set; }
    public string PerformedByUserId { get; set; } = string.Empty;
    public string? PerformedByUserName { get; set; }
    public DateTime PerformedAt { get; set; }
}

/// <summary>
/// Response DTO for paginated configuration history
/// </summary>
public class PaginatedConfigurationHistoryResponseDto
{
    public int DeviceId { get; set; }
    public List<ConfigurationHistoryDto> History { get; set; } = new();
    public int TotalCount { get; set; }
    public int PageNumber { get; set; }
    public int PageSize { get; set; }
    public int TotalPages { get; set; }
    public bool HasNextPage { get; set; }
    public bool HasPreviousPage { get; set; }
}

/// <summary>
/// Response DTO for configuration template deletion
/// </summary>
public class ConfigurationTemplateDeletionResponseDto
{
    public int TemplateId { get; set; }
    public bool Success { get; set; }
    public string? Message { get; set; }
    public string? ErrorMessage { get; set; }
    public List<int> AffectedDeviceIds { get; set; } = new();
    public string DeletedByUserId { get; set; } = string.Empty;
    public DateTime DeletedAt { get; set; }
}

/// <summary>
/// Request DTO for filtering configuration templates
/// </summary>
public class ConfigurationTemplateFilterRequestDto
{
    public string? Name { get; set; }
    public string? Description { get; set; }
    public string? CreatedByUserId { get; set; }
    public DateTime? CreatedAfter { get; set; }
    public DateTime? CreatedBefore { get; set; }
    public int PageNumber { get; set; } = 1;
    public int PageSize { get; set; } = 20;
}

/// <summary>
/// Response DTO for paginated configuration templates
/// </summary>
public class PaginatedConfigurationTemplateResponseDto
{
    public List<ConfigurationTemplateDto> Templates { get; set; } = new();
    public int TotalCount { get; set; }
    public int PageNumber { get; set; }
    public int PageSize { get; set; }
    public int TotalPages { get; set; }
    public bool HasNextPage { get; set; }
    public bool HasPreviousPage { get; set; }
}

/// <summary>
/// Request DTO for creating configuration template
/// </summary>
public class CreateConfigurationTemplateRequestDto
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public AndroidTVConfigurationDto Configuration { get; set; } = new();
    public bool IsDefault { get; set; } = false;
}

/// <summary>
/// Request DTO for updating configuration template
/// </summary>
public class UpdateConfigurationTemplateRequestDto
{
    public string? Name { get; set; }
    public string? Description { get; set; }
    public AndroidTVConfigurationDto? Configuration { get; set; }
    public bool? IsDefault { get; set; }
}

/// <summary>
/// Request DTO for configuration deployment
/// </summary>
public class ConfigurationDeploymentRequestDto
{
    public List<int> DeviceIds { get; set; } = new();
    public bool ForceApply { get; set; } = false;
    public string? DeploymentReason { get; set; }
    public bool RestartDevicesAfterDeployment { get; set; } = false;
}

/// <summary>
/// Request DTO for cloning configuration template
/// </summary>
public class CloneConfigurationTemplateRequestDto
{
    public string NewName { get; set; } = string.Empty;
    public string? NewDescription { get; set; }
    public AndroidTVConfigurationDto? ConfigurationOverrides { get; set; }
}

/// <summary>
/// DTO for configuration template export
/// </summary>
public class ConfigurationTemplateExportDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public AndroidTVConfigurationDto Configuration { get; set; } = new();
    public string CreatedByUserId { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public string ExportVersion { get; set; } = "1.0";
    public DateTime ExportedAt { get; set; } = DateTime.UtcNow;
}

/// <summary>
/// Request DTO for configuration template import
/// </summary>
public class ConfigurationTemplateImportRequestDto
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public AndroidTVConfigurationDto Configuration { get; set; } = new();
    public bool OverwriteExisting { get; set; } = false;
}

/// <summary>
/// Response DTO for paginated deployment history
/// </summary>
public class PaginatedConfigurationDeploymentHistoryResponseDto
{
    public int TemplateId { get; set; }
    public List<ConfigurationDeploymentHistoryDto> History { get; set; } = new();
    public int TotalCount { get; set; }
    public int PageNumber { get; set; }
    public int PageSize { get; set; }
    public int TotalPages { get; set; }
    public bool HasNextPage { get; set; }
    public bool HasPreviousPage { get; set; }
}

/// <summary>
/// DTO for configuration deployment history entry
/// </summary>
public class ConfigurationDeploymentHistoryDto
{
    public int Id { get; set; }
    public int TemplateId { get; set; }
    public int DeviceCount { get; set; }
    public int SuccessfulDeployments { get; set; }
    public int FailedDeployments { get; set; }
    public string DeployedByUserId { get; set; } = string.Empty;
    public string? DeployedByUserName { get; set; }
    public DateTime DeployedAt { get; set; }
    public string? DeploymentReason { get; set; }
}