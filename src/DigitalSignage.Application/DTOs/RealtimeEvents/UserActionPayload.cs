namespace DigitalSignage.Application.DTOs.RealtimeEvents;

/// <summary>
/// Payload for user_action events
/// </summary>
public class UserActionPayload
{
    /// <summary>
    /// ID of the user performing the action
    /// </summary>
    public string UserId { get; set; } = string.Empty;
    
    /// <summary>
    /// Username/email of the user
    /// </summary>
    public string UserName { get; set; } = string.Empty;
    
    /// <summary>
    /// Action type: "permission_changed", "role_updated", etc.
    /// </summary>
    public string Action { get; set; } = string.Empty;
    
    /// <summary>
    /// ID of the user being affected (if applicable)
    /// </summary>
    public string? TargetUserId { get; set; }
    
    /// <summary>
    /// Additional details about the action
    /// </summary>
    public Dictionary<string, string> Details { get; set; } = new();
}
