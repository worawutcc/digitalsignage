using DigitalSignage.Domain.Enums;

namespace DigitalSignage.Application.DTOs.AdminDeviceRegistration;

/// <summary>
/// Request for filtering pending registrations with advanced search and pagination
/// </summary>
public class PendingRegistrationsFilterRequestDto
{
    /// <summary>
    /// Search term to match against device model, manufacturer, MAC address, or requested username
    /// </summary>
    public string? SearchTerm { get; set; }
    
    /// <summary>
    /// Filter by registration method
    /// </summary>
    public RegistrationMethod? Method { get; set; }
    
    /// <summary>
    /// Filter by whether user is automatically matched
    /// </summary>
    public bool? HasMatchedUser { get; set; }
    
    /// <summary>
    /// Filter registrations near expiration (within 5 minutes)
    /// </summary>
    public bool? IsNearExpiration { get; set; }
    
    /// <summary>
    /// Filter by device manufacturer
    /// </summary>
    public string? Manufacturer { get; set; }
    
    /// <summary>
    /// Filter registrations created after this date
    /// </summary>
    public DateTime? DateFrom { get; set; }
    
    /// <summary>
    /// Filter registrations created before this date
    /// </summary>
    public DateTime? DateTo { get; set; }
    
    /// <summary>
    /// Page number for pagination (1-based)
    /// </summary>
    public int Page { get; set; } = 1;
    
    /// <summary>
    /// Number of items per page
    /// </summary>
    public int PageSize { get; set; } = 20;
    
    /// <summary>
    /// Sort field name
    /// </summary>
    public string SortBy { get; set; } = "RequestedAt";
    
    /// <summary>
    /// Sort direction (asc/desc)
    /// </summary>
    public string SortDirection { get; set; } = "desc";
    
    /// <summary>
    /// Include expired registrations in results
    /// </summary>
    public bool IncludeExpired { get; set; } = false;
    
    /// <summary>
    /// Include device groups information for each registration
    /// </summary>
    public bool IncludeAvailableGroups { get; set; } = true;
    
    /// <summary>
    /// Maximum page size allowed
    /// </summary>
    public const int MaxPageSize = 100;
    
    /// <summary>
    /// Validate and normalize the request
    /// </summary>
    public void Normalize()
    {
        Page = Math.Max(1, Page);
        PageSize = Math.Min(Math.Max(1, PageSize), MaxPageSize);
        
        if (string.IsNullOrWhiteSpace(SortBy))
            SortBy = "RequestedAt";
            
        if (string.IsNullOrWhiteSpace(SortDirection) || 
            !new[] { "asc", "desc" }.Contains(SortDirection.ToLower()))
            SortDirection = "desc";
        
        // Trim search term
        SearchTerm = string.IsNullOrWhiteSpace(SearchTerm) ? null : SearchTerm.Trim();
        Manufacturer = string.IsNullOrWhiteSpace(Manufacturer) ? null : Manufacturer.Trim();
        
        // Validate date range
        if (DateFrom.HasValue && DateTo.HasValue && DateFrom.Value > DateTo.Value)
        {
            var temp = DateFrom;
            DateFrom = DateTo;
            DateTo = temp;
        }
    }
    
    /// <summary>
    /// Get valid sort fields
    /// </summary>
    public static readonly string[] ValidSortFields = {
        "RequestedAt", "ExpiresAt", "DeviceModel", "Manufacturer", "MacAddress", 
        "RequestedUsername", "Method", "PriorityScore"
    };
}