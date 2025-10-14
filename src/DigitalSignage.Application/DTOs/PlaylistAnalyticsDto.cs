namespace DigitalSignage.Application.DTOs;

public class PlaylistAnalyticsDto
{
    public int Id { get; set; }
    public int PlaylistId { get; set; }
    public int DeviceId { get; set; }
    public string PlaylistName { get; set; } = string.Empty;
    public string DeviceName { get; set; } = string.Empty;
    public DateTime PlayStartTime { get; set; }
    public DateTime? PlayEndTime { get; set; }
    public bool CompletedSuccessfully { get; set; }
    public string? ErrorMessage { get; set; }
    public int MediaItemsPlayed { get; set; }
    public TimeSpan? Duration => PlayEndTime?.Subtract(PlayStartTime);
}

public class PlaylistAnalyticsReportDto
{
    public int PlaylistId { get; set; }
    public string PlaylistName { get; set; } = string.Empty;
    public int TotalPlays { get; set; }
    public int SuccessfulPlays { get; set; }
    public int FailedPlays { get; set; }
    public double SuccessRate => TotalPlays > 0 ? (double)SuccessfulPlays / TotalPlays * 100 : 0;
    public TimeSpan AverageDuration { get; set; }
    public DateTime? LastPlayed { get; set; }
    public List<DevicePlaybackSummary> DeviceSummaries { get; set; } = new();
}

public class DevicePlaybackSummary
{
    public int DeviceId { get; set; }
    public string DeviceName { get; set; } = string.Empty;
    public int PlayCount { get; set; }
    public int SuccessfulPlays { get; set; }
    public DateTime? LastPlayed { get; set; }
}