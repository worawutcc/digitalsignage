namespace DigitalSignage.Application.Interfaces;

/// <summary>
/// Interface for accessing current user context for audit fields
/// </summary>
public interface IUserContext
{
    /// <summary>
    /// Gets the current user ID, or -1 for system operations
    /// </summary>
    public int GetCurrentUserId();

    /// <summary>
    /// Gets the current user ID, or null if no user context
    /// </summary>
    public int? GetCurrentUserIdOrNull();

    /// <summary>
    /// Indicates if there is a current user context
    /// </summary>
    public bool HasCurrentUser { get; }
}