using DigitalSignage.Domain.Entities;

namespace DigitalSignage.Domain.Interfaces;

/// <summary>
/// Repository interface for DeviceApproval entity
/// Handles CRUD operations for device approval/rejection records
/// </summary>
public interface IDeviceApprovalRepository
{
    /// <summary>
    /// Create a new device approval/rejection record
    /// </summary>
    /// <param name="approval">Device approval entity to create</param>
    /// <returns>Created device approval entity with generated ID</returns>
    Task<DeviceApproval> CreateAsync(DeviceApproval approval);
    
    /// <summary>
    /// Get device approval by ID
    /// </summary>
    /// <param name="id">Approval ID</param>
    /// <returns>Device approval entity or null if not found</returns>
    Task<DeviceApproval?> GetByIdAsync(int id);
    
    /// <summary>
    /// Get device approval by registration request ID
    /// </summary>
    /// <param name="registrationId">Device registration request ID</param>
    /// <returns>Device approval entity or null if not found</returns>
    Task<DeviceApproval?> GetByRegistrationIdAsync(int registrationId);
    
    /// <summary>
    /// Update existing device approval record
    /// </summary>
    /// <param name="approval">Device approval entity to update</param>
    /// <returns>Updated device approval entity</returns>
    Task<DeviceApproval> UpdateAsync(DeviceApproval approval);
    
    /// <summary>
    /// Delete device approval record
    /// </summary>
    /// <param name="id">Approval ID to delete</param>
    /// <returns>True if deleted successfully, false otherwise</returns>
    Task<bool> DeleteAsync(int id);
}
