using DigitalSignage.Application.DTOs.Auth;
using DigitalSignage.Application.DTOs.User;
using DigitalSignage.Application.Interfaces;
using DigitalSignage.Domain.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace DigitalSignage.Api.Controllers;

/// <summary>
/// Controller for user management operations
/// </summary>
[ApiController]
[Route("api/[controller]")]
[Authorize]
[ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
[ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status500InternalServerError)]
public class UsersController : ControllerBase
{
    private readonly IUserService _userService;
    private readonly ILogger<UsersController> _logger;

    public UsersController(
        IUserService userService,
        ILogger<UsersController> logger)
    {
        _userService = userService;
        _logger = logger;
    }

    /// <summary>
    /// Get current user profile
    /// </summary>
    /// <returns>Current user details</returns>
    [HttpGet("profile")]
    [ProducesResponseType(typeof(UserDto), StatusCodes.Status200OK)]
    public async Task<ActionResult<UserDto>> GetProfile()
    {
        try
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (!int.TryParse(userIdClaim, out var userId))
            {
                _logger.LogWarning("Invalid user ID in token during profile retrieval");
                return Unauthorized(new { error = "Invalid token" });
            }

            var user = await _userService.GetByIdAsync(userId);
            if (user == null)
            {
                _logger.LogWarning("User {UserId} not found during profile retrieval", userId);
                return NotFound(new { error = "User not found" });
            }

            return Ok(user);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unexpected error retrieving user profile");
            return StatusCode(StatusCodes.Status500InternalServerError, 
                new { error = "An unexpected error occurred" });
        }
    }

    /// <summary>
    /// Update current user profile
    /// </summary>
    /// <param name="request">Updated user profile data</param>
    /// <returns>Updated user details</returns>
    [HttpPut("profile")]
    [ProducesResponseType(typeof(UserDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ValidationProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<UserDto>> UpdateProfile([FromBody] UpdateUserProfileRequest request)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        try
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (!int.TryParse(userIdClaim, out var userId))
            {
                _logger.LogWarning("Invalid user ID in token during profile update");
                return Unauthorized(new { error = "Invalid token" });
            }

            var updatedUser = await _userService.UpdateProfileAsync(userId, request);
            if (updatedUser == null)
            {
                _logger.LogWarning("User {UserId} not found during profile update", userId);
                return NotFound(new { error = "User not found" });
            }

            _logger.LogInformation("User {UserId} profile updated successfully", userId);
            
            return Ok(updatedUser);
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning("Profile update failed: {Error}", ex.Message);
            return BadRequest(new { error = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unexpected error updating user profile");
            return StatusCode(StatusCodes.Status500InternalServerError, 
                new { error = "An unexpected error occurred" });
        }
    }

    /// <summary>
    /// Change current user password
    /// </summary>
    /// <param name="request">Password change request</param>
    /// <returns>No content response</returns>
    [HttpPost("change-password")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ValidationProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordRequest request)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        try
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (!int.TryParse(userIdClaim, out var userId))
            {
                _logger.LogWarning("Invalid user ID in token during password change");
                return Unauthorized(new { error = "Invalid token" });
            }

            await _userService.ChangePasswordAsync(userId, request);
            
            _logger.LogInformation("Password changed successfully for user {UserId}", userId);
            
            return NoContent();
        }
        catch (UnauthorizedAccessException ex)
        {
            _logger.LogWarning("Password change failed: {Error}", ex.Message);
            return BadRequest(new { error = "Current password is incorrect" });
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning("Password change failed: {Error}", ex.Message);
            return NotFound(new { error = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unexpected error changing password");
            return StatusCode(StatusCodes.Status500InternalServerError, 
                new { error = "An unexpected error occurred" });
        }
    }

    /// <summary>
    /// Get all users (Admin only)
    /// </summary>
    /// <returns>List of all users</returns>
    [HttpGet]
    [Authorize(Roles = "Admin")]
    [ProducesResponseType(typeof(IEnumerable<UserDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status403Forbidden)]
    public async Task<ActionResult<IEnumerable<UserDto>>> GetAllUsers()
    {
        try
        {
            var users = await _userService.GetAllAsync();
            
            _logger.LogInformation("Retrieved {Count} users", users.Count());
            
            return Ok(users);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unexpected error retrieving all users");
            return StatusCode(StatusCodes.Status500InternalServerError, 
                new { error = "An unexpected error occurred" });
        }
    }

    /// <summary>
    /// Get user by ID (Admin/Manager only)
    /// </summary>
    /// <param name="id">User ID</param>
    /// <returns>User details</returns>
    [HttpGet("{id}")]
    [Authorize(Roles = "Admin,Manager")]
    [ProducesResponseType(typeof(UserDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<UserDto>> GetUser(int id)
    {
        try
        {
            var user = await _userService.GetByIdAsync(id);
            if (user == null)
            {
                _logger.LogWarning("User {UserId} not found", id);
                return NotFound(new { error = "User not found" });
            }

            return Ok(user);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unexpected error retrieving user {UserId}", id);
            return StatusCode(StatusCodes.Status500InternalServerError, 
                new { error = "An unexpected error occurred" });
        }
    }

    /// <summary>
    /// Update user (Admin/Manager only)
    /// </summary>
    /// <param name="id">User ID</param>
    /// <param name="request">Updated user data</param>
    /// <returns>Updated user details</returns>
    [HttpPut("{id}")]
    [Authorize(Roles = "Admin,Manager")]
    [ProducesResponseType(typeof(UserDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ValidationProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<UserDto>> UpdateUser(int id, [FromBody] UpdateUserRequest request)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        try
        {
            var currentUserRole = User.FindFirst(ClaimTypes.Role)?.Value;
            var currentUserIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            
            if (!int.TryParse(currentUserIdClaim, out var currentUserId))
            {
                _logger.LogWarning("Invalid user ID in token during user update");
                return Unauthorized(new { error = "Invalid token" });
            }

            // Prevent managers from updating admins (except themselves)
            if (currentUserRole == UserRole.Manager.ToString() && currentUserId != id)
            {
                var targetUser = await _userService.GetByIdAsync(id);
                if (targetUser?.Role == UserRole.Admin.ToString())
                {
                    _logger.LogWarning("Manager {ManagerId} attempted to update admin {AdminId}", currentUserId, id);
                    return Forbid();
                }
            }

            var updatedUser = await _userService.UpdateAsync(id, request);
            if (updatedUser == null)
            {
                _logger.LogWarning("User {UserId} not found during update", id);
                return NotFound(new { error = "User not found" });
            }

            _logger.LogInformation("User {UserId} updated successfully by {CurrentUserId}", id, currentUserId);
            
            return Ok(updatedUser);
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning("User update failed: {Error}", ex.Message);
            return BadRequest(new { error = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unexpected error updating user {UserId}", id);
            return StatusCode(StatusCodes.Status500InternalServerError, 
                new { error = "An unexpected error occurred" });
        }
    }

    /// <summary>
    /// Delete user (Admin only)
    /// </summary>
    /// <param name="id">User ID</param>
    /// <returns>No content response</returns>
    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteUser(int id)
    {
        try
        {
            var currentUserIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (!int.TryParse(currentUserIdClaim, out var currentUserId))
            {
                _logger.LogWarning("Invalid user ID in token during user deletion");
                return Unauthorized(new { error = "Invalid token" });
            }

            // Prevent self-deletion
            if (currentUserId == id)
            {
                _logger.LogWarning("User {UserId} attempted to delete themselves", currentUserId);
                return BadRequest(new { error = "Cannot delete your own account" });
            }

            var success = await _userService.DeleteAsync(id);
            if (!success)
            {
                _logger.LogWarning("User {UserId} not found during deletion", id);
                return NotFound(new { error = "User not found" });
            }

            _logger.LogInformation("User {UserId} deleted successfully by {CurrentUserId}", id, currentUserId);
            
            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unexpected error deleting user {UserId}", id);
            return StatusCode(StatusCodes.Status500InternalServerError, 
                new { error = "An unexpected error occurred" });
        }
    }

    /// <summary>
    /// Reset user password (Admin/Manager only)
    /// </summary>
    /// <param name="id">User ID</param>
    /// <param name="request">Password reset request</param>
    /// <returns>No content response</returns>
    [HttpPost("{id}/reset-password")]
    [Authorize(Roles = "Admin,Manager")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ValidationProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> ResetPassword(int id, [FromBody] ResetPasswordRequest request)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        try
        {
            var currentUserRole = User.FindFirst(ClaimTypes.Role)?.Value;
            var currentUserIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            
            if (!int.TryParse(currentUserIdClaim, out var currentUserId))
            {
                _logger.LogWarning("Invalid user ID in token during password reset");
                return Unauthorized(new { error = "Invalid token" });
            }

            // Prevent managers from resetting admin passwords (except themselves)
            if (currentUserRole == UserRole.Manager.ToString() && currentUserId != id)
            {
                var targetUser = await _userService.GetByIdAsync(id);
                if (targetUser?.Role == UserRole.Admin.ToString())
                {
                    _logger.LogWarning("Manager {ManagerId} attempted to reset admin {AdminId} password", currentUserId, id);
                    return Forbid();
                }
            }

            await _userService.ResetPasswordAsync(id, request);
            
            _logger.LogInformation("Password reset successfully for user {UserId} by {CurrentUserId}", id, currentUserId);
            
            return NoContent();
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning("Password reset failed: {Error}", ex.Message);
            return NotFound(new { error = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unexpected error resetting password for user {UserId}", id);
            return StatusCode(StatusCodes.Status500InternalServerError, 
                new { error = "An unexpected error occurred" });
        }
    }

    /// <summary>
    /// Lock/unlock user account (Admin only)
    /// </summary>
    /// <param name="id">User ID</param>
    /// <param name="request">Lock status request</param>
    /// <returns>No content response</returns>
    [HttpPost("{id}/lock")]
    [Authorize(Roles = "Admin")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ValidationProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> LockUser(int id, [FromBody] LockUserRequest request)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        try
        {
            var currentUserIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (!int.TryParse(currentUserIdClaim, out var currentUserId))
            {
                _logger.LogWarning("Invalid user ID in token during user lock");
                return Unauthorized(new { error = "Invalid token" });
            }

            // Prevent self-lock
            if (currentUserId == id)
            {
                _logger.LogWarning("User {UserId} attempted to lock themselves", currentUserId);
                return BadRequest(new { error = "Cannot lock your own account" });
            }

            await _userService.SetLockStatusAsync(id, request);
            
            var action = request.IsLocked ? "locked" : "unlocked";
            _logger.LogInformation("User {UserId} {Action} successfully by {CurrentUserId}", id, action, currentUserId);
            
            return NoContent();
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning("User lock operation failed: {Error}", ex.Message);
            return NotFound(new { error = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unexpected error during lock operation for user {UserId}", id);
            return StatusCode(StatusCodes.Status500InternalServerError, 
                new { error = "An unexpected error occurred" });
        }
    }
}