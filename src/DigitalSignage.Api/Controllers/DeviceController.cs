using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using DigitalSignage.Application.DTOs;
using DigitalSignage.Application.Interfaces;

namespace DigitalSignage.Api.Controllers;

[ApiController]
[Route("api/devices")]
public class DeviceController : ControllerBase
{
    private readonly IUserDeviceAssociationService _associationService;

    public DeviceController(IUserDeviceAssociationService associationService)
    {
        _associationService = associationService;
    }

    /// <summary>
    /// Get users associated with a device
    /// </summary>
    /// <param name="deviceId">Device ID</param>
    /// <returns>List of associated users</returns>
    [HttpGet("{deviceId}/users")]
    [ProducesResponseType(typeof(List<UserDto>), 200)]
    public async Task<ActionResult<List<UserDto>>> GetDeviceUsers(Guid deviceId)
    {
        var associations = await _associationService.GetAllAsync();
        var userIds = associations.FindAll(a => a.DeviceId == deviceId).ConvertAll(a => a.UserId);
        // TODO: Replace with actual user lookup via service/repository
        var users = new List<UserDto>();
        // ...fetch users by userIds...
        return Ok(users);
    }
}
