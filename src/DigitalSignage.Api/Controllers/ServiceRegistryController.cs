using Microsoft.AspNetCore.Mvc;
using DigitalSignage.Application.DTOs.ServiceRegistry;
using DigitalSignage.Application.Interfaces;
using DigitalSignage.Domain.Enums;

namespace DigitalSignage.Api.Controllers;

/// <summary>
/// Service Registry API for microservices registration, discovery, and health monitoring
/// </summary>
[ApiController]
[Route("api/[controller]")]
[Produces("application/json")]
public class ServiceRegistryController : ControllerBase
{
    private readonly IServiceRegistryService _serviceRegistryService;
    private readonly ILogger<ServiceRegistryController> _logger;

    public ServiceRegistryController(
        IServiceRegistryService serviceRegistryService,
        ILogger<ServiceRegistryController> logger)
    {
        _serviceRegistryService = serviceRegistryService;
        _logger = logger;
    }

    /// <summary>
    /// Register a new service or update existing service registration
    /// </summary>
    [HttpPost("register")]
    [ProducesResponseType(typeof(ServiceRegistrationResponse), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ServiceRegistrationResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ValidationProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<ServiceRegistrationResponse>> RegisterService([FromBody] ServiceRegistrationRequest request)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        try
        {
            var response = await _serviceRegistryService.RegisterServiceAsync(request);
            
            if (response.Success)
            {
                return Ok(response);
            }
            else
            {
                return StatusCode(500, response);
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error registering service {ServiceName}", request.Name);
            return StatusCode(500, new ServiceRegistrationResponse
            {
                Success = false,
                Message = "Internal server error occurred during service registration"
            });
        }
    }

    /// <summary>
    /// Deregister a service instance
    /// </summary>
    [HttpDelete("deregister/{serviceName}/{instanceId}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> DeregisterService(string serviceName, string instanceId)
    {
        try
        {
            var success = await _serviceRegistryService.DeregisterServiceAsync(serviceName, instanceId);
            
            if (success)
            {
                return NoContent();
            }
            else
            {
                return NotFound($"Service {serviceName} with instance {instanceId} not found");
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deregistering service {ServiceName} instance {InstanceId}", serviceName, instanceId);
            return StatusCode(500, "Internal server error occurred during service deregistration");
        }
    }

    /// <summary>
    /// Update service heartbeat and status
    /// </summary>
    [HttpPut("heartbeat")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ValidationProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> UpdateHeartbeat([FromBody] ServiceHeartbeatRequest request)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        try
        {
            var success = await _serviceRegistryService.UpdateServiceHeartbeatAsync(request);
            
            if (success)
            {
                return Ok(new { message = "Heartbeat updated successfully", timestamp = DateTime.UtcNow });
            }
            else
            {
                return NotFound($"Service {request.ServiceName} with instance {request.InstanceId} not found");
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating heartbeat for service {ServiceName}", request.ServiceName);
            return StatusCode(500, "Internal server error occurred during heartbeat update");
        }
    }

    /// <summary>
    /// Discover services based on criteria
    /// </summary>
    [HttpGet("discover")]
    [ProducesResponseType(typeof(ServiceDiscoveryResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<ServiceDiscoveryResponse>> DiscoverServices(
        [FromQuery] string? serviceName = null,
        [FromQuery] ServiceType? serviceType = null,
        [FromQuery] string? tags = null,
        [FromQuery] ServiceStatus? minStatus = ServiceStatus.Healthy,
        [FromQuery] bool includeInactive = false,
        [FromQuery] int? maxResults = null)
    {
        try
        {
            var request = new ServiceDiscoveryRequest
            {
                ServiceName = serviceName,
                ServiceType = serviceType,
                Tags = tags,
                MinStatus = minStatus,
                IncludeInactive = includeInactive,
                MaxResults = maxResults
            };

            var response = await _serviceRegistryService.DiscoverServicesAsync(request);
            return Ok(response);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error discovering services");
            return StatusCode(500, "Internal server error occurred during service discovery");
        }
    }

    /// <summary>
    /// Get specific service by name
    /// </summary>
    [HttpGet("services/{serviceName}")]
    [ProducesResponseType(typeof(ServiceDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<ServiceDto>> GetService(string serviceName)
    {
        try
        {
            var service = await _serviceRegistryService.GetServiceAsync(serviceName);
            
            if (service != null)
            {
                return Ok(service);
            }
            else
            {
                return NotFound($"Service {serviceName} not found");
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting service {ServiceName}", serviceName);
            return StatusCode(500, "Internal server error occurred while retrieving service");
        }
    }

    /// <summary>
    /// Get all services
    /// </summary>
    [HttpGet("services")]
    [ProducesResponseType(typeof(List<ServiceDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<List<ServiceDto>>> GetAllServices()
    {
        try
        {
            var services = await _serviceRegistryService.GetAllServicesAsync();
            return Ok(services);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting all services");
            return StatusCode(500, "Internal server error occurred while retrieving services");
        }
    }

    /// <summary>
    /// Get services by type
    /// </summary>
    [HttpGet("services/type/{serviceType}")]
    [ProducesResponseType(typeof(List<ServiceDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<List<ServiceDto>>> GetServicesByType(ServiceType serviceType)
    {
        try
        {
            var services = await _serviceRegistryService.GetServicesByTypeAsync(serviceType);
            return Ok(services);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting services by type {ServiceType}", serviceType);
            return StatusCode(500, "Internal server error occurred while retrieving services by type");
        }
    }

    /// <summary>
    /// Get only healthy services
    /// </summary>
    [HttpGet("services/healthy")]
    [ProducesResponseType(typeof(List<ServiceDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<List<ServiceDto>>> GetHealthyServices()
    {
        try
        {
            var services = await _serviceRegistryService.GetHealthyServicesAsync();
            return Ok(services);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting healthy services");
            return StatusCode(500, "Internal server error occurred while retrieving healthy services");
        }
    }

    /// <summary>
    /// Get health status of all services
    /// </summary>
    [HttpGet("health/status")]
    [ProducesResponseType(typeof(Dictionary<string, ServiceStatus>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<Dictionary<string, ServiceStatus>>> GetAllServicesHealthStatus()
    {
        try
        {
            var healthStatus = await _serviceRegistryService.GetAllServicesHealthStatusAsync();
            return Ok(healthStatus);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting services health status");
            return StatusCode(500, "Internal server error occurred while retrieving health status");
        }
    }

    /// <summary>
    /// Get health check history for a service
    /// </summary>
    [HttpGet("health/history/{serviceId}")]
    [ProducesResponseType(typeof(List<HealthCheckDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<List<HealthCheckDto>>> GetHealthCheckHistory(
        int serviceId,
        [FromQuery] int? instanceId = null,
        [FromQuery] int maxResults = 50)
    {
        try
        {
            var history = await _serviceRegistryService.GetHealthCheckHistoryAsync(serviceId, instanceId, maxResults);
            return Ok(history);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting health check history for service {ServiceId}", serviceId);
            return StatusCode(500, "Internal server error occurred while retrieving health check history");
        }
    }

    /// <summary>
    /// Get best available service instance for load balancing
    /// </summary>
    [HttpGet("instances/{serviceName}/best")]
    [ProducesResponseType(typeof(ServiceInstanceDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<ServiceInstanceDto>> GetBestServiceInstance(string serviceName)
    {
        try
        {
            var instance = await _serviceRegistryService.GetBestServiceInstanceAsync(serviceName);
            
            if (instance != null)
            {
                return Ok(instance);
            }
            else
            {
                return NotFound($"No healthy instances found for service {serviceName}");
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting best instance for service {ServiceName}", serviceName);
            return StatusCode(500, "Internal server error occurred while retrieving service instance");
        }
    }

    /// <summary>
    /// Get all instances for a service
    /// </summary>
    [HttpGet("instances/{serviceName}")]
    [ProducesResponseType(typeof(List<ServiceInstanceDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<List<ServiceInstanceDto>>> GetServiceInstances(
        string serviceName,
        [FromQuery] bool healthyOnly = true)
    {
        try
        {
            var instances = await _serviceRegistryService.GetServiceInstancesAsync(serviceName, healthyOnly);
            return Ok(instances);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting instances for service {ServiceName}", serviceName);
            return StatusCode(500, "Internal server error occurred while retrieving service instances");
        }
    }

    /// <summary>
    /// Get service registry statistics
    /// </summary>
    [HttpGet("stats")]
    [ProducesResponseType(typeof(Dictionary<string, object>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<Dictionary<string, object>>> GetServiceRegistryStats()
    {
        try
        {
            var stats = await _serviceRegistryService.GetServiceRegistryStatsAsync();
            return Ok(stats);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting service registry statistics");
            return StatusCode(500, "Internal server error occurred while retrieving statistics");
        }
    }

    /// <summary>
    /// Get service status distribution
    /// </summary>
    [HttpGet("stats/distribution")]
    [ProducesResponseType(typeof(Dictionary<ServiceStatus, int>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<Dictionary<ServiceStatus, int>>> GetServiceStatusDistribution()
    {
        try
        {
            var distribution = await _serviceRegistryService.GetServiceStatusDistributionAsync();
            return Ok(distribution);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting service status distribution");
            return StatusCode(500, "Internal server error occurred while retrieving status distribution");
        }
    }

    /// <summary>
    /// Manual cleanup of inactive services (Admin endpoint)
    /// </summary>
    [HttpPost("admin/cleanup")]
    [ProducesResponseType(typeof(object), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult> CleanupInactiveServices([FromQuery] int inactiveMinutes = 60)
    {
        try
        {
            var inactiveThreshold = TimeSpan.FromMinutes(inactiveMinutes);
            var cleanedUp = await _serviceRegistryService.CleanupInactiveServicesAsync(inactiveThreshold);
            
            return Ok(new 
            { 
                message = "Cleanup completed successfully", 
                cleanedUpCount = cleanedUp,
                timestamp = DateTime.UtcNow 
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error during cleanup of inactive services");
            return StatusCode(500, "Internal server error occurred during cleanup");
        }
    }
}