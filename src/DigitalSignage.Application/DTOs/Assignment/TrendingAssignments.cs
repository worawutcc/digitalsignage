namespace DigitalSignage.Application.DTOs.Assignment;

/// <summary>
/// DTO for trending assignments analytics
/// Shows assignments gaining or losing popularity
/// </summary>
public class TrendingAssignments
{
    /// <summary>
    /// List of trending assignments with their metrics
    /// </summary>
    public List<TrendingAssignmentDto> Trending { get; set; } = new();

    /// <summary>
    /// Start of the analysis period
    /// </summary>
    public DateTime AnalysisPeriodStart { get; set; }

    /// <summary>
    /// End of the analysis period
    /// </summary>
    public DateTime AnalysisPeriodEnd { get; set; }

    /// <summary>
    /// Total number of assignments analyzed
    /// </summary>
    public int TotalAssignmentsAnalyzed { get; set; }

    /// <summary>
    /// When this trending analysis was calculated
    /// </summary>
    public DateTime CalculatedAt { get; set; }
}

/// <summary>
/// Individual trending assignment with metrics
/// </summary>
public class TrendingAssignmentDto
{
    /// <summary>
    /// The assignment that is trending
    /// </summary>
    public AssignmentDto Assignment { get; set; } = null!;

    /// <summary>
    /// Number of displays during the analysis period
    /// </summary>
    public int DisplayCount { get; set; }

    /// <summary>
    /// Display count from the previous period (for comparison)
    /// </summary>
    public int PreviousDisplayCount { get; set; }

    /// <summary>
    /// Percentage change from previous period
    /// </summary>
    public double ChangePercentage { get; set; }

    /// <summary>
    /// Calculated trend score (0-100, higher is more trending)
    /// </summary>
    public double TrendScore { get; set; }

    /// <summary>
    /// Trend direction (Up, Down, Stable)
    /// </summary>
    public string TrendDirection { get; set; } = "Stable";

    /// <summary>
    /// Number of unique devices that displayed this assignment
    /// </summary>
    public int UniqueDeviceCount { get; set; }

    /// <summary>
    /// Velocity of trend (how fast it's changing)
    /// </summary>
    public double TrendVelocity { get; set; }

    /// <summary>
    /// Rank within the trending list (1 = most trending)
    /// </summary>
    public int Rank { get; set; }

    /// <summary>
    /// Whether this is a new trending item (not in previous period)
    /// </summary>
    public bool IsNewTrending { get; set; }
}

/// <summary>
/// Trend direction enumeration
/// </summary>
public enum TrendDirection
{
    /// <summary>
    /// Trending upward - increasing popularity
    /// </summary>
    Up,

    /// <summary>
    /// Trending downward - decreasing popularity
    /// </summary>
    Down,

    /// <summary>
    /// Stable - no significant change
    /// </summary>
    Stable
}
