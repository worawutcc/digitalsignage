using DigitalSignage.Application.DTOs.DeviceGroup;
using DigitalSignage.Application.DTOs.DeviceRegistration;
using DigitalSignage.Domain.Enums;

namespace DigitalSignage.Application.DTOs.AdminDeviceRegistration;

/// <summary>
/// Response for filtered pending registrations with advanced pagination and filtering
/// </summary>
public class FilteredPendingRegistrationsResponseDto
{
    /// <summary>
    /// List of filtered pending registrations
    /// </summary>
    public List<EnhancedPendingRegistrationDto> Registrations { get; set; } = new();
    
    /// <summary>
    /// Total count before filtering (for pagination)
    /// </summary>
    public int TotalCount { get; set; }
    
    /// <summary>
    /// Count after filtering
    /// </summary>
    public int FilteredCount { get; set; }
    
    /// <summary>
    /// Current page number
    /// </summary>
    public int CurrentPage { get; set; }
    
    /// <summary>
    /// Page size used
    /// </summary>
    public int PageSize { get; set; }
    
    /// <summary>
    /// Total pages available
    /// </summary>
    public int TotalPages { get; set; }
    
    /// <summary>
    /// Filter criteria applied
    /// </summary>
    public AppliedFiltersDto AppliedFilters { get; set; } = new();
}

/// <summary>
/// Enhanced pending registration with additional metadata
/// </summary>
public class EnhancedPendingRegistrationDto
{
    /// <summary>
    /// Registration ID
    /// </summary>
    public Guid RegistrationId { get; set; }
    
    /// <summary>
    /// Device MAC address
    /// </summary>
    public string MacAddress { get; set; } = string.Empty;
    
    /// <summary>
    /// Device model information
    /// </summary>
    public string DeviceModel { get; set; } = string.Empty;
    
    /// <summary>
    /// Device manufacturer
    /// </summary>
    public string Manufacturer { get; set; } = string.Empty;
    
    /// <summary>
    /// Android version
    /// </summary>
    public string AndroidVersion { get; set; } = string.Empty;
    
    /// <summary>
    /// App version
    /// </summary>
    public string AppVersion { get; set; } = string.Empty;
    
    /// <summary>
    /// Registration request timestamp
    /// </summary>
    public DateTime RequestedAt { get; set; }
    
    /// <summary>
    /// PIN expiration timestamp
    /// </summary>
    public DateTime ExpiresAt { get; set; }
    
    /// <summary>
    /// Registration PIN
    /// </summary>
    public string Pin { get; set; } = string.Empty;
    
    /// <summary>
    /// Requested username
    /// </summary>
    public string? RequestedUsername { get; set; }
    
    /// <summary>
    /// Requested user display name
    /// </summary>
    public string? RequestedUserDisplayName { get; set; }
    
    /// <summary>
    /// Matched user information
    /// </summary>
    public MatchedUserDto? MatchedUser { get; set; }
    
    /// <summary>
    /// Device IP address
    /// </summary>
    public string? IpAddress { get; set; }
    
    /// <summary>
    /// Network name
    /// </summary>
    public string? NetworkName { get; set; }
    
    /// <summary>
    /// Registration method used
    /// </summary>
    public RegistrationMethod Method { get; set; }
    
    /// <summary>
    /// Time until expiration
    /// </summary>
    public TimeSpan TimeUntilExpiration => ExpiresAt - DateTime.UtcNow;
    
    /// <summary>
    /// Whether the registration is near expiration (within 5 minutes)
    /// </summary>
    public bool IsNearExpiration => TimeUntilExpiration.TotalMinutes <= 5;
    
    /// <summary>
    /// Whether the registration has expired
    /// </summary>
    public bool IsExpired => DateTime.UtcNow > ExpiresAt;
    
    /// <summary>
    /// Priority score for sorting (higher = more urgent)
    /// </summary>
    public int PriorityScore => IsExpired ? 0 : (IsNearExpiration ? 10 : 5) + (MatchedUser != null ? 5 : 0);
    
    /// <summary>
    /// Available device groups for assignment
    /// </summary>
    public List<DeviceGroupDto> AvailableGroups { get; set; } = new();
}

/// <summary>
/// Applied filter criteria for response context
/// </summary>
public class AppliedFiltersDto
{
    /// <summary>
    /// Search term used
    /// </summary>
    public string? SearchTerm { get; set; }
    
    /// <summary>
    /// Registration method filter
    /// </summary>
    public RegistrationMethod? Method { get; set; }
    
    /// <summary>
    /// User match status filter
    /// </summary>
    public bool? HasMatchedUser { get; set; }
    
    /// <summary>
    /// Near expiration filter
    /// </summary>
    public bool? IsNearExpiration { get; set; }
    
    /// <summary>
    /// Manufacturer filter
    /// </summary>
    public string? Manufacturer { get; set; }
    
    /// <summary>
    /// Date range filter start
    /// </summary>
    public DateTime? DateFrom { get; set; }
    
    /// <summary>
    /// Date range filter end
    /// </summary>
    public DateTime? DateTo { get; set; }
}