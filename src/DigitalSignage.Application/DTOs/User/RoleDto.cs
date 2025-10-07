namespace DigitalSignage.Application.DTOs.User;

/// <summary>
/// DTO for role information
/// </summary>
public record RoleDto
{
    public required string Id { get; init; }
    public required string Name { get; init; }
    public required string Description { get; init; }
    public required int Level { get; init; }
    public required List<RolePermissionDto> Permissions { get; init; }
    public int UserCount { get; init; }
    public required string CreatedAt { get; init; }
    public required string UpdatedAt { get; init; }
}

/// <summary>
/// DTO for role permission
/// </summary>
public record RolePermissionDto
{
    public required string Resource { get; init; }
    public required string Action { get; init; }
}

/// <summary>
/// Response wrapper for role list
/// </summary>
public record RoleListResponse
{
    public bool Success { get; init; }
    public required List<RoleDto> Data { get; init; }
    public string? Message { get; init; }
}
