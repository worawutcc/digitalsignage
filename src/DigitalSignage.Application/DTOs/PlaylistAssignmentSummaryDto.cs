namespace DigitalSignage.Application.DTOs;

public class PlaylistAssignmentSummaryDto
{
    public int PlaylistId { get; set; }
    public string PlaylistName { get; set; } = string.Empty;
    public int TotalAssignments { get; set; }
    public int ActiveAssignments { get; set; }
    public int DeviceCount { get; set; }
    public int DeviceGroupCount { get; set; }
    public List<PlaylistAssignmentDto> Assignments { get; set; } = new();
}
