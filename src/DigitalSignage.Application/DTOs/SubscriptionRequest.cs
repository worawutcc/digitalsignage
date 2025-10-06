namespace DigitalSignage.Application.DTOs;

/// <summary>
/// Request model for subscribing to SignalR events
/// </summary>
public class SubscriptionRequest
{
    /// <summary>
    /// List of event types to subscribe to
    /// </summary>
    public string[]? Subscriptions { get; set; }
    
    /// <summary>
    /// Entity filters for subscription
    /// </summary>
    public Dictionary<string, object?>? Filters { get; set; }
}