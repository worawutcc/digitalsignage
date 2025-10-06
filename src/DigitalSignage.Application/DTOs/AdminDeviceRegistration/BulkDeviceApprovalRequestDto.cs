using System.ComponentModel.DataAnnotations;
using DigitalSignage.Application.DTOs.AdminDeviceRegistration;

namespace DigitalSignage.Application.DTOs.AdminDeviceRegistration;

/// <summary>
/// Enhanced bulk device approval request DTO (027-device-approval-group)
/// Extends existing bulk approval functionality with group assignment and hierarchical content inheritance
/// </summary>
public class BulkDeviceApprovalRequestDto
{
    /// <summary>
    /// List of device approvals to process
    /// </summary>
    [Required]
    [MinLength(1, ErrorMessage = "At least one approval is required")]
    [MaxLength(100, ErrorMessage = "Maximum 100 approvals per batch")]
    public List<BulkDeviceApprovalItemDto> Approvals { get; set; } = new List<BulkDeviceApprovalItemDto>();

    /// <summary>
    /// Optional: Apply same group to all devices in batch
    /// </summary>
    public int? DefaultDeviceGroupId { get; set; }

    /// <summary>
    /// Optional: Apply same schedule to all devices in batch
    /// </summary>
    public int? DefaultInitialScheduleId { get; set; }

    /// <summary>
    /// Whether to inherit content from parent groups for newly assigned devices
    /// </summary>
    public bool InheritGroupContent { get; set; } = true;

    /// <summary>
    /// Batch processing options
    /// </summary>
    public BulkProcessingOptionsDto? ProcessingOptions { get; set; }
}

/// <summary>
/// Individual approval item in enhanced bulk request
/// </summary>
public class BulkDeviceApprovalItemDto
{
    /// <summary>
    /// Registration ID to approve
    /// </summary>
    [Required]
    public Guid RegistrationId { get; set; }

    /// <summary>
    /// Admin-assigned friendly name
    /// </summary>
    [Required]
    [StringLength(100, MinimumLength = 1)]
    public string DeviceName { get; set; } = string.Empty;

    /// <summary>
    /// PIN code for verification
    /// </summary>
    [Required]
    [StringLength(6, MinimumLength = 6)]
    public string Pin { get; set; } = string.Empty;

    /// <summary>
    /// Physical location description
    /// </summary>
    [StringLength(200)]
    public string Location { get; set; } = string.Empty;

    /// <summary>
    /// Device group assignment (overrides default if specified)
    /// </summary>
    public int? DeviceGroupId { get; set; }

    /// <summary>
    /// Initial schedule assignment (overrides default if specified)
    /// </summary>
    public int? InitialScheduleId { get; set; }

    /// <summary>
    /// Admin notes for this specific approval
    /// </summary>
    [StringLength(500)]
    public string Notes { get; set; } = string.Empty;

    /// <summary>
    /// Priority order for processing (lower numbers processed first)
    /// </summary>
    public int ProcessingPriority { get; set; } = 0;
}

/// <summary>
/// Enhanced bulk approval response DTO
/// </summary>
public class BulkDeviceApprovalResponseDto
{
    /// <summary>
    /// Total number of approval requests processed
    /// </summary>
    public int TotalRequests { get; set; }

    /// <summary>
    /// Number of successful approvals
    /// </summary>
    public int Successful { get; set; }

    /// <summary>
    /// Number of failed approvals
    /// </summary>
    public int Failed { get; set; }

    /// <summary>
    /// Processing duration in milliseconds
    /// </summary>
    public long ProcessingTimeMs { get; set; }

    /// <summary>
    /// Individual results for each approval request
    /// </summary>
    public List<BulkApprovalResultDto> Results { get; set; } = new List<BulkApprovalResultDto>();

    /// <summary>
    /// Summary of group assignments made during bulk approval
    /// </summary>
    public List<GroupAssignmentSummaryDto> GroupAssignmentSummary { get; set; } = new List<GroupAssignmentSummaryDto>();

    /// <summary>
    /// Any warnings encountered during processing
    /// </summary>
    public List<string> Warnings { get; set; } = new List<string>();
}

/// <summary>
/// Group assignment summary for bulk operations
/// </summary>
public class GroupAssignmentSummaryDto
{
    /// <summary>
    /// Device group ID
    /// </summary>
    public int DeviceGroupId { get; set; }

    /// <summary>
    /// Device group name
    /// </summary>
    public string GroupName { get; set; } = string.Empty;

    /// <summary>
    /// Group path in hierarchy
    /// </summary>
    public string GroupPath { get; set; } = string.Empty;

    /// <summary>
    /// Number of devices assigned to this group in the batch
    /// </summary>
    public int DevicesAssigned { get; set; }

    /// <summary>
    /// Number of content assignments inherited by devices in this group
    /// </summary>
    public int ContentAssignmentsInherited { get; set; }
}

/// <summary>
/// Bulk processing options
/// </summary>
public class BulkProcessingOptionsDto
{
    /// <summary>
    /// Whether to continue processing if individual approvals fail
    /// </summary>
    public bool ContinueOnError { get; set; } = true;

    /// <summary>
    /// Maximum parallel processing threads (1-10)
    /// </summary>
    [Range(1, 10)]
    public int MaxParallelThreads { get; set; } = 3;

    /// <summary>
    /// Timeout per individual approval in seconds
    /// </summary>
    [Range(5, 300)]
    public int TimeoutPerApprovalSeconds { get; set; } = 30;

    /// <summary>
    /// Whether to send real-time progress updates via SignalR
    /// </summary>
    public bool EnableProgressUpdates { get; set; } = true;

    /// <summary>
    /// Whether to validate device groups exist before processing
    /// </summary>
    public bool ValidateGroupsBeforeProcessing { get; set; } = true;
}