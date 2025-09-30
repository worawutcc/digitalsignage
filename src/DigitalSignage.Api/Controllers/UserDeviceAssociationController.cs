using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using DigitalSignage.Application.DTOs;
using DigitalSignage.Application.Interfaces;

namespace DigitalSignage.Api.Controllers;

[ApiController]
[Route("api/user-device-associations")]
public class UserDeviceAssociationController : ControllerBase
{
    private readonly IUserDeviceAssociationService _service;

    public UserDeviceAssociationController(IUserDeviceAssociationService service)
    {
        _service = service;
    }

    [HttpGet]
    [ProducesResponseType(typeof(List<UserDeviceAssociationDto>), 200)]
    public async Task<ActionResult<List<UserDeviceAssociationDto>>> GetAll()
    {
        var result = await _service.GetAllAsync();
        return Ok(result);
    }

        /// <summary>
        /// Search user-device associations with filtering and pagination
        /// </summary>
        [HttpGet("search")]
        [ProducesResponseType(typeof(List<UserDeviceAssociationDto>), 200)]
        [ProducesResponseType(400)]
        public async Task<ActionResult<List<UserDeviceAssociationDto>>> Search([FromQuery] SearchUserDeviceAssociationRequest request)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);
            var results = await _service.SearchAsync(request);
            return Ok(results);
        }

    [HttpGet("{id}")]
    [ProducesResponseType(typeof(UserDeviceAssociationDto), 200)]
    [ProducesResponseType(404)]
    public async Task<ActionResult<UserDeviceAssociationDto>> GetById(Guid id)
    {
        var result = await _service.GetByIdAsync(id);
        if (result == null) return NotFound();
        return Ok(result);
    }

    [HttpPost]
    [ProducesResponseType(typeof(UserDeviceAssociationDto), 201)]
    public async Task<ActionResult<UserDeviceAssociationDto>> Create([FromBody] CreateUserDeviceAssociationRequest request)
    {
        var result = await _service.CreateAsync(request);
        return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
    }

    [HttpPost("bulk")]
    [ProducesResponseType(typeof(List<UserDeviceAssociationDto>), 201)]
    public async Task<ActionResult<List<UserDeviceAssociationDto>>> BulkCreate([FromBody] List<CreateUserDeviceAssociationRequest> requests)
    {
        var results = new List<UserDeviceAssociationDto>();
        foreach (var req in requests)
        {
            var result = await _service.CreateAsync(req);
            results.Add(result);
        }
        return Created("/api/user-device-associations/bulk", results);
    }

    [HttpPut("{id}")]
    [ProducesResponseType(204)]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateUserDeviceAssociationRequest request)
    {
        request.Id = id;
        await _service.UpdateAsync(request);
        return NoContent();
    }

    [HttpDelete("{id}")]
    [ProducesResponseType(204)]
    public async Task<IActionResult> Delete(Guid id)
    {
        await _service.DeleteAsync(id);
        return NoContent();
    }
}
