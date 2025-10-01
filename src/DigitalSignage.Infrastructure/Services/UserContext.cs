using DigitalSignage.Application.Interfaces;
using Microsoft.AspNetCore.Http;
using System.Security.Claims;

namespace DigitalSignage.Infrastructure.Services;

/// <summary>
/// Implementation of IUserContext that gets user ID from JWT claims
/// </summary>
public class UserContext : IUserContext
{
    private readonly IHttpContextAccessor _httpContextAccessor;

    public UserContext(IHttpContextAccessor httpContextAccessor)
    {
        _httpContextAccessor = httpContextAccessor;
    }

    public int GetCurrentUserId()
    {
        var userId = GetCurrentUserIdOrNull();
        return userId ?? -1; // Return -1 for system operations
    }

    public int? GetCurrentUserIdOrNull()
    {
        var httpContext = _httpContextAccessor.HttpContext;
        if (httpContext?.User?.Identity?.IsAuthenticated == true)
        {
            var userIdClaim = httpContext.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (int.TryParse(userIdClaim, out var userId))
            {
                return userId;
            }
        }
        return null;
    }

    public bool HasCurrentUser => GetCurrentUserIdOrNull().HasValue;
}