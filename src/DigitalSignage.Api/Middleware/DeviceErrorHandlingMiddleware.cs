using System.Net;
using System.Text.Json;
using Microsoft.AspNetCore.Mvc;

namespace DigitalSignage.Api.Middleware;

/// <summary>
/// Middleware for handling device-specific operations errors
/// Following API copilot instructions for proper error handling and logging
/// </summary>
public class DeviceErrorHandlingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<DeviceErrorHandlingMiddleware> _logger;

    public DeviceErrorHandlingMiddleware(RequestDelegate next, ILogger<DeviceErrorHandlingMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            await HandleDeviceExceptionAsync(context, ex);
        }
    }

    private async Task HandleDeviceExceptionAsync(HttpContext context, Exception exception)
    {
        var isDeviceRequest = IsDeviceRelatedRequest(context.Request.Path);
        
        if (!isDeviceRequest)
        {
            // Re-throw if not device-related, let other middleware handle it
            throw exception;
        }

        _logger.LogError(exception, "Device operation error occurred. Path: {Path}, Method: {Method}",
            context.Request.Path, context.Request.Method);

        var problemDetails = CreateProblemDetails(exception);
        
        context.Response.StatusCode = problemDetails.Status ?? (int)HttpStatusCode.InternalServerError;
        context.Response.ContentType = "application/problem+json";

        var jsonOptions = new JsonSerializerOptions
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
            WriteIndented = true
        };

        var json = JsonSerializer.Serialize(problemDetails, jsonOptions);
        await context.Response.WriteAsync(json);
    }

    private static bool IsDeviceRelatedRequest(PathString path)
    {
        var pathValue = path.Value?.ToLowerInvariant() ?? string.Empty;
        
        return pathValue.Contains("/devices") ||
               pathValue.Contains("/device") ||
               pathValue.Contains("/heartbeat") ||
               pathValue.Contains("/devicestatus") ||
               pathValue.Contains("/deviceregistration") ||
               pathValue.Contains("/devicemanagement");
    }

    private ProblemDetails CreateProblemDetails(Exception exception)
    {
        return exception switch
        {
            // Device not found errors
            DeviceNotFoundException deviceNotFound => new ProblemDetails
            {
                Status = (int)HttpStatusCode.NotFound,
                Title = "Device Not Found",
                Detail = deviceNotFound.Message,
                Type = "https://tools.ietf.org/html/rfc7231#section-6.5.4",
                Extensions = { ["errorCode"] = "DEVICE_NOT_FOUND" }
            },

            // Device authentication errors
            DeviceAuthenticationException deviceAuth => new ProblemDetails
            {
                Status = (int)HttpStatusCode.Unauthorized,
                Title = "Device Authentication Failed",
                Detail = deviceAuth.Message,
                Type = "https://tools.ietf.org/html/rfc7235#section-3.1",
                Extensions = { ["errorCode"] = "DEVICE_AUTH_FAILED" }
            },

            // Device already exists errors
            DeviceAlreadyExistsException deviceExists => new ProblemDetails
            {
                Status = (int)HttpStatusCode.Conflict,
                Title = "Device Already Exists",
                Detail = deviceExists.Message,
                Type = "https://tools.ietf.org/html/rfc7231#section-6.5.8",
                Extensions = { ["errorCode"] = "DEVICE_ALREADY_EXISTS" }
            },

            // Device offline errors
            DeviceOfflineException deviceOffline => new ProblemDetails
            {
                Status = (int)HttpStatusCode.ServiceUnavailable,
                Title = "Device Offline",
                Detail = deviceOffline.Message,
                Type = "https://tools.ietf.org/html/rfc7231#section-6.6.4",
                Extensions = { ["errorCode"] = "DEVICE_OFFLINE" }
            },

            // Device configuration errors
            DeviceConfigurationException deviceConfig => new ProblemDetails
            {
                Status = (int)HttpStatusCode.BadRequest,
                Title = "Device Configuration Error",
                Detail = deviceConfig.Message,
                Type = "https://tools.ietf.org/html/rfc7231#section-6.5.1",
                Extensions = { ["errorCode"] = "DEVICE_CONFIG_ERROR" }
            },

            // Heartbeat errors
            DeviceHeartbeatException heartbeatEx => new ProblemDetails
            {
                Status = (int)HttpStatusCode.BadRequest,
                Title = "Device Heartbeat Error",
                Detail = heartbeatEx.Message,
                Type = "https://tools.ietf.org/html/rfc7231#section-6.5.1",
                Extensions = { ["errorCode"] = "DEVICE_HEARTBEAT_ERROR" }
            },

            // Registration errors
            DeviceRegistrationException registrationEx => new ProblemDetails
            {
                Status = (int)HttpStatusCode.BadRequest,
                Title = "Device Registration Error",
                Detail = registrationEx.Message,
                Type = "https://tools.ietf.org/html/rfc7231#section-6.5.1",
                Extensions = { ["errorCode"] = "DEVICE_REGISTRATION_ERROR" }
            },

            // Validation errors
            ArgumentException argEx => new ProblemDetails
            {
                Status = (int)HttpStatusCode.BadRequest,
                Title = "Invalid Device Parameters",
                Detail = argEx.Message,
                Type = "https://tools.ietf.org/html/rfc7231#section-6.5.1",
                Extensions = { ["errorCode"] = "INVALID_DEVICE_PARAMETERS" }
            },

            // Access denied errors
            UnauthorizedAccessException => new ProblemDetails
            {
                Status = (int)HttpStatusCode.Forbidden,
                Title = "Device Access Denied",
                Detail = "You don't have permission to perform this device operation",
                Type = "https://tools.ietf.org/html/rfc7231#section-6.5.3",
                Extensions = { ["errorCode"] = "DEVICE_ACCESS_DENIED" }
            },

            // Generic device operation errors
            InvalidOperationException invalidOp when invalidOp.Message.Contains("device", StringComparison.OrdinalIgnoreCase) => new ProblemDetails
            {
                Status = (int)HttpStatusCode.BadRequest,
                Title = "Invalid Device Operation",
                Detail = invalidOp.Message,
                Type = "https://tools.ietf.org/html/rfc7231#section-6.5.1",
                Extensions = { ["errorCode"] = "INVALID_DEVICE_OPERATION" }
            },

            // Database errors
            Exception dbEx when dbEx.Message.Contains("database", StringComparison.OrdinalIgnoreCase) ||
                               dbEx.Message.Contains("connection", StringComparison.OrdinalIgnoreCase) => new ProblemDetails
            {
                Status = (int)HttpStatusCode.ServiceUnavailable,
                Title = "Device Service Unavailable",
                Detail = "Device service is temporarily unavailable. Please try again later.",
                Type = "https://tools.ietf.org/html/rfc7231#section-6.6.4",
                Extensions = { ["errorCode"] = "DEVICE_SERVICE_UNAVAILABLE" }
            },

            // Default internal server error
            _ => new ProblemDetails
            {
                Status = (int)HttpStatusCode.InternalServerError,
                Title = "Device Operation Failed",
                Detail = "An unexpected error occurred while processing the device operation.",
                Type = "https://tools.ietf.org/html/rfc7231#section-6.6.1",
                Extensions = { ["errorCode"] = "DEVICE_OPERATION_FAILED" }
            }
        };
    }
}

#region Custom Device Exceptions

/// <summary>
/// Exception thrown when a device is not found
/// </summary>
public class DeviceNotFoundException : Exception
{
    public DeviceNotFoundException(string message) : base(message) { }
    public DeviceNotFoundException(string message, Exception innerException) : base(message, innerException) { }
    public DeviceNotFoundException(int deviceId) : base($"Device with ID {deviceId} was not found") { }
    public DeviceNotFoundException(string deviceKey, bool byKey) : base($"Device with key '{deviceKey}' was not found") { }
}

/// <summary>
/// Exception thrown when device authentication fails
/// </summary>
public class DeviceAuthenticationException : Exception
{
    public DeviceAuthenticationException(string message) : base(message) { }
    public DeviceAuthenticationException(string message, Exception innerException) : base(message, innerException) { }
}

/// <summary>
/// Exception thrown when trying to create a device that already exists
/// </summary>
public class DeviceAlreadyExistsException : Exception
{
    public DeviceAlreadyExistsException(string message) : base(message) { }
    public DeviceAlreadyExistsException(string message, Exception innerException) : base(message, innerException) { }
    
    /// <summary>
    /// Create exception for specific device key
    /// </summary>
    public static DeviceAlreadyExistsException ForDeviceKey(string deviceKey)
    {
        return new DeviceAlreadyExistsException($"Device with key '{deviceKey}' already exists");
    }
}

/// <summary>
/// Exception thrown when trying to perform an operation on an offline device
/// </summary>
public class DeviceOfflineException : Exception
{
    public DeviceOfflineException(string message) : base(message) { }
    public DeviceOfflineException(int deviceId) : base($"Device {deviceId} is currently offline and cannot perform this operation") { }
}

/// <summary>
/// Exception thrown when device configuration is invalid
/// </summary>
public class DeviceConfigurationException : Exception
{
    public DeviceConfigurationException(string message) : base(message) { }
    public DeviceConfigurationException(string message, Exception innerException) : base(message, innerException) { }
}

/// <summary>
/// Exception thrown when device heartbeat operation fails
/// </summary>
public class DeviceHeartbeatException : Exception
{
    public DeviceHeartbeatException(string message) : base(message) { }
    public DeviceHeartbeatException(string message, Exception innerException) : base(message, innerException) { }
}

/// <summary>
/// Exception thrown when device registration fails
/// </summary>
public class DeviceRegistrationException : Exception
{
    public DeviceRegistrationException(string message) : base(message) { }
    public DeviceRegistrationException(string message, Exception innerException) : base(message, innerException) { }
}

#endregion