namespace DigitalSignage.Application.DTOs.AdminDeviceRegistration;

/// <summary>
/// Response for bulk rejection operation
/// </summary>
public class BulkRejectionResponseDto
{
    /// <summary>
    /// Total number of rejections attempted
    /// </summary>
    public int TotalAttempted { get; set; }
    
    /// <summary>
    /// Number of successful rejections
    /// </summary>
    public int SuccessCount { get; set; }
    
    /// <summary>
    /// Number of failed rejections
    /// </summary>
    public int FailureCount { get; set; }
    
    /// <summary>
    /// Details of each rejection attempt
    /// </summary>
    public List<BulkRejectionResultDto> Results { get; set; } = new();
    
    /// <summary>
    /// Overall success status
    /// </summary>
    public bool IsSuccess => FailureCount == 0;
    
    /// <summary>
    /// Success rate percentage
    /// </summary>
    public decimal SuccessRate => TotalAttempted == 0 ? 0 : (decimal)SuccessCount / TotalAttempted * 100;
    
    /// <summary>
    /// Summary message
    /// </summary>
    public string Summary => $"Rejected {SuccessCount} of {TotalAttempted} device registrations";
}

/// <summary>
/// Result of individual device rejection in bulk operation
/// </summary>
public class BulkRejectionResultDto
{
    /// <summary>
    /// PIN of the registration that was processed
    /// </summary>
    public string Pin { get; set; } = string.Empty;
    
    /// <summary>
    /// Whether the rejection was successful
    /// </summary>
    public bool IsSuccess { get; set; }
    
    /// <summary>
    /// Error message if rejection failed
    /// </summary>
    public string? ErrorMessage { get; set; }
    
    /// <summary>
    /// Device model that was rejected (if successful)
    /// </summary>
    public string? DeviceModel { get; set; }
    
    /// <summary>
    /// MAC address of the device that was rejected (if successful)
    /// </summary>
    public string? MacAddress { get; set; }
    
    /// <summary>
    /// Timestamp when the rejection was processed
    /// </summary>
    public DateTime ProcessedAt { get; set; }
    
    /// <summary>
    /// Reason for rejection
    /// </summary>
    public string? Reason { get; set; }
}