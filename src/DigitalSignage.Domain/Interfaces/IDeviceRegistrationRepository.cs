using DigitalSignage.Domain.Entities;
using DigitalSignage.Domain.Enums;

namespace DigitalSignage.Domain.Interfaces;

/// <summary>
/// Repository interface for device registration data access operations
/// </summary>
public interface IDeviceRegistrationRepository
{
    // Basic CRUD operations
    public Task<DeviceRegistrationRequest?> GetByRegistrationIdAsync(Guid registrationId);
    public Task<DeviceRegistrationRequest?> GetByMacAddressAsync(string macAddress);
    public Task<DeviceRegistrationRequest?> GetPendingByMacAddressAsync(string macAddress);
    public Task<DeviceRegistrationRequest?> GetByPinAsync(string pin);
    public Task<DeviceRegistrationRequest> AddAsync(DeviceRegistrationRequest registration);
    public Task<DeviceRegistrationRequest> UpdateAsync(DeviceRegistrationRequest registration);
    public Task DeleteAsync(Guid registrationId);

    // Query operations
    public Task<List<DeviceRegistrationRequest>> GetPendingRegistrationsAsync();
    public Task<List<DeviceRegistrationRequest>> GetExpiredRegistrationsAsync();
    public Task<List<DeviceRegistrationRequest>> GetRegistrationsByStatusAsync(RegistrationStatus status);
    public Task<List<DeviceRegistrationRequest>> GetRegistrationsByDateRangeAsync(DateTime startDate, DateTime endDate);
    public Task<List<DeviceRegistrationRequest>> SearchRegistrationsAsync(
        string? searchTerm = null,
        RegistrationStatus? status = null,
        DateTime? startDate = null,
        DateTime? endDate = null,
        int skip = 0,
        int take = 50);

    // Validation operations
    public Task<bool> IsPinUniqueAsync(string pin);
    public Task<bool> IsDeviceRegisteredAsync(string macAddress);

    // Statistics and maintenance
    public Task<int> CountByStatusAsync(RegistrationStatus status);
    public Task<Dictionary<RegistrationStatus, int>> GetRegistrationStatsAsync();
    public Task MarkExpiredRegistrationsAsync();
    public Task BulkUpdateStatusAsync(List<Guid> registrationIds, RegistrationStatus newStatus);

    // Audit log operations
    public Task<RegistrationAuditLog> AddAuditLogAsync(RegistrationAuditLog auditLog);
    public Task<List<RegistrationAuditLog>> GetAuditLogsAsync(Guid registrationId);
    public Task<List<RegistrationAuditLog>> GetAuditLogsByDateRangeAsync(DateTime startDate, DateTime endDate);
    public Task<List<RegistrationAuditLog>> GetAuditLogsByActionAsync(AuditAction action);
    public Task<List<RegistrationAuditLog>> GetAuditLogsByMacAddressAsync(string macAddress);
    public Task CleanupOldAuditLogsAsync(DateTime beforeDate);
}