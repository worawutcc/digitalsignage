namespace DigitalSignage.Domain.Enums;

/// <summary>
/// Supported video codecs for device hardware profiles
/// </summary>
public enum VideoCodec
{
    /// <summary>
    /// H.264 (AVC) - Widely supported baseline codec
    /// </summary>
    H264 = 1,
    
    /// <summary>
    /// H.265 (HEVC) - High efficiency video coding
    /// </summary>
    H265 = 2,
    
    /// <summary>
    /// VP9 - Google's open video codec
    /// </summary>
    VP9 = 3,
    
    /// <summary>
    /// AV1 - Alliance for Open Media codec
    /// </summary>
    AV1 = 4
}

/// <summary>
/// Hardware detection job processing status
/// </summary>
public enum HardwareDetectionJobStatus
{
    /// <summary>
    /// Job is created and waiting to be processed
    /// </summary>
    Pending = 0,
    
    /// <summary>
    /// Job is currently being processed
    /// </summary>
    Processing = 1,
    
    /// <summary>
    /// Job completed successfully
    /// </summary>
    Completed = 2,
    
    /// <summary>
    /// Job failed during processing
    /// </summary>
    Failed = 3,
    
    /// <summary>
    /// Job was cancelled by user or system
    /// </summary>
    Cancelled = 4,
    
    /// <summary>
    /// Job is stuck and needs manual intervention
    /// </summary>
    Stuck = 5
}