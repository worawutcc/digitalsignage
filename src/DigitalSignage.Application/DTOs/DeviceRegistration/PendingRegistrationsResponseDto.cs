namespace DigitalSignage.Application.DTOs.DeviceRegistration;

/// <summary>
/// Response DTO for pending registrations list
/// </summary>
public class PendingRegistrationsResponseDto
{
    /// <summary>
    /// List of pending registrations
    /// </summary>
    public List<PendingDeviceDto> Registrations { get; set; } = new List<PendingDeviceDto>();

    /// <summary>
    /// Pagination information
    /// </summary>
    public PaginationDto Pagination { get; set; } = new PaginationDto();
}

/// <summary>
/// DTO for a pending device registration
/// </summary>
public class PendingDeviceDto
{
    /// <summary>
    /// Registration ID
    /// </summary>
    public Guid RegistrationId { get; set; }

    /// <summary>
    /// Generated PIN code
    /// </summary>
    public string Pin { get; set; } = string.Empty;

    /// <summary>
    /// Device MAC address
    /// </summary>
    public string MacAddress { get; set; } = string.Empty;

    /// <summary>
    /// Device model name
    /// </summary>
    public string DeviceModel { get; set; } = string.Empty;

    /// <summary>
    /// Device manufacturer
    /// </summary>
    public string Manufacturer { get; set; } = string.Empty;

    /// <summary>
    /// Android OS version
    /// </summary>
    public string AndroidVersion { get; set; } = string.Empty;

    /// <summary>
    /// App version
    /// </summary>
    public string AppVersion { get; set; } = string.Empty;

    /// <summary>
    /// Device IP address
    /// </summary>
    public string IpAddress { get; set; } = string.Empty;

    /// <summary>
    /// Network name
    /// </summary>
    public string NetworkName { get; set; } = string.Empty;

    /// <summary>
    /// Hardware specifications
    /// </summary>
    public Dictionary<string, object> HardwareSpecs { get; set; } = new Dictionary<string, object>();

    /// <summary>
    /// Registration creation timestamp
    /// </summary>
    public DateTime CreatedAt { get; set; }

    /// <summary>
    /// PIN expiration timestamp
    /// </summary>
    public DateTime ExpiresAt { get; set; }

    /// <summary>
    /// Last time device polled for status
    /// </summary>
    public DateTime? LastPolledAt { get; set; }
}

/// <summary>
/// Pagination information DTO
/// </summary>
public class PaginationDto
{
    /// <summary>
    /// Current page number
    /// </summary>
    public int Page { get; set; }

    /// <summary>
    /// Number of items per page
    /// </summary>
    public int Limit { get; set; }

    /// <summary>
    /// Total number of items
    /// </summary>
    public int Total { get; set; }

    /// <summary>
    /// Total number of pages
    /// </summary>
    public int Pages { get; set; }

    /// <summary>
    /// Whether there is a next page
    /// </summary>
    public bool HasNext { get; set; }

    /// <summary>
    /// Whether there is a previous page
    /// </summary>
    public bool HasPrev { get; set; }
}