namespace DigitalSignage.Domain.Enums;

/// <summary>
/// Represents the result of an audited action
/// </summary>
public enum AuditResult
{
    /// <summary>
    /// Action completed successfully
    /// </summary>
    Success = 1,
    
    /// <summary>
    /// Action failed with error
    /// </summary>
    Failure = 2,
    
    /// <summary>
    /// Action completed with warnings
    /// </summary>
    Warning = 3
}